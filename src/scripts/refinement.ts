import { CATEGORIES, createBoard, matchWord, progress, randomLetter, selectionPath, wordsForSheet } from '../lib/refinement/engine';
import type { Board, Placement, Word } from '../lib/refinement/engine';

function element<T extends HTMLElement>(selector: string): T {
  const result = document.querySelector<T>(selector);
  if (!result) throw new Error(`Missing game element: ${selector}`);
  return result;
}

const grid = element<HTMLDivElement>('#letter-grid');
const status = element('#status');
const complete = element('#completion');
const dialog = element<HTMLDialogElement>('#help-dialog');
const narrow = matchMedia('(max-width: 640px)');
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
const categoryElements = [...document.querySelectorAll<HTMLElement>('.category')];
const found = new Set<string>();
let page = 1;
let words: Word[] = [];
let board: Board;
let buttons: HTMLButtonElement[] = [];
let anchor: number | null = null;
let selected: number[] = [];
let hinted: number[] = [];
let magnified: number[] = [];
let focused = 0;
let busy = false;
let revision = 0;
let refineTimer: ReturnType<typeof setTimeout> | undefined;
let hintTimer: ReturnType<typeof setTimeout> | undefined;
let pointer: { id: number; start: number; end: number | null; hadAnchor: boolean } | null = null;

const percent = (value: number) => `${String(value).padStart(3, '0')}%`;
const say = (message: string) => { status.textContent = message; };
const idle = () => say('ZNAJDŹ SENS W SZUMIE. / FIND MEANING IN THE NOISE.');

function clearHint() {
  clearTimeout(hintTimer);
  hinted.forEach(cell => buttons[cell]?.classList.remove('is-hint'));
  hinted = [];
}

function clearMagnification() {
  magnified.forEach(cell => buttons[cell]?.style.removeProperty('--magnify'));
  magnified = [];
}

function paintSelection(cells: number[]) {
  selected.forEach(cell => {
    buttons[cell]?.classList.remove('is-selected');
    buttons[cell]?.parentElement?.setAttribute('aria-selected', 'false');
  });
  selected = cells;
  cells.forEach(cell => {
    buttons[cell]?.classList.add('is-selected');
    buttons[cell]?.parentElement?.setAttribute('aria-selected', 'true');
  });
  const first = cells[0] ?? 0;
  const last = cells.at(-1) ?? first;
  element('#coordinates').textContent = `0x${first.toString(16).toUpperCase().padStart(6, '0')}:0x${last.toString(16).toUpperCase().padStart(6, '0')}`;
}

function cancelSelection() {
  anchor = null;
  if (pointer && grid.hasPointerCapture(pointer.id)) grid.releasePointerCapture(pointer.id);
  pointer = null;
  paintSelection([]);
}

function setFocus(cell: number, moveFocus = true) {
  buttons[focused]?.setAttribute('tabindex', '-1');
  focused = cell;
  buttons[focused].tabIndex = 0;
  if (moveFocus) buttons[focused].focus({ preventScroll: true });
}

function updateMeters() {
  element('#total-progress').textContent = percent(progress(words, found));
  categoryElements.forEach((category, index) => {
    const value = progress(words, found, index);
    category.querySelector('.category-percent')!.textContent = percent(value);
    category.querySelector('.meter-dots')!.textContent = '■'.repeat(Math.round(value / 12.5)) + '·'.repeat(8 - Math.round(value / 12.5));
    category.classList.toggle('is-complete', value === 100);
    const list = category.querySelector<HTMLElement>('.word-list')!;
    list.replaceChildren(...words.filter(word => word.category === index).map(word => {
      const item = document.createElement('span');
      item.textContent = `${found.has(word.text) ? '✓ ' : '· '}${word.text}`;
      item.classList.toggle('is-found', found.has(word.text));
      return item;
    }));
  });
}

function drawBoard() {
  const hadGridFocus = grid.contains(document.activeElement);
  revision++;
  clearTimeout(refineTimer);
  clearHint();
  clearMagnification();
  cancelSelection();
  busy = false;
  document.querySelectorAll('.flying-word').forEach(item => item.remove());
  board = createBoard(narrow.matches ? 10 : 17, narrow.matches ? 12 : 7, words);
  // A layout change preserves collected words and removes their new placements.
  board.placements.filter(word => found.has(word.text)).forEach(word => {
    word.cells.forEach(cell => { board.letters[cell] = randomLetter(); });
  });
  grid.style.setProperty('--columns', String(board.columns));
  grid.setAttribute('aria-rowcount', String(board.rows));
  grid.setAttribute('aria-colcount', String(board.columns));
  buttons = [];
  const rows = Array.from({ length: board.rows }, (_, row) => {
    const rowElement = document.createElement('div');
    rowElement.className = 'letter-row';
    rowElement.setAttribute('role', 'row');
    for (let column = 0; column < board.columns; column++) {
      const cell = row * board.columns + column;
      const wrapper = document.createElement('div');
      wrapper.className = 'letter-cell';
      wrapper.setAttribute('role', 'gridcell');
      wrapper.setAttribute('aria-selected', 'false');
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'letter';
      button.dataset.cell = String(cell);
      button.tabIndex = cell === 0 ? 0 : -1;
      button.setAttribute('aria-label', board.letters[cell] === '^' ? '^ — podpowiedź / hint' : `${board.letters[cell]}, ${row + 1}:${column + 1}`);
      const glyph = document.createElement('span');
      glyph.textContent = board.letters[cell];
      button.append(glyph);
      wrapper.append(button);
      rowElement.append(wrapper);
      buttons.push(button);
    }
    return rowElement;
  });
  grid.replaceChildren(...rows);
  focused = 0;
  grid.inert = found.size === words.length;
  complete.hidden = !grid.inert;
  if (grid.inert) say('RAPORT UKOŃCZONY / REPORT COMPLETE · 100%');
  if (hadGridFocus && !grid.inert) setFocus(0);
}

function newSheet(advance = false) {
  if (advance) page++;
  words = wordsForSheet(page);
  found.clear();
  complete.hidden = true;
  categoryElements.forEach(category => {
    category.querySelector('button')!.setAttribute('aria-expanded', 'false');
    category.querySelector<HTMLElement>('.word-list')!.hidden = true;
    category.classList.remove('is-receiving');
  });
  element('#page-number').textContent = String(page).padStart(3, '0');
  const files = ['POZNAN', 'SYGNAL', 'INSIGHT', 'KUNKE', 'SENS'];
  element('#file-name').textContent = `${files[(page - 1) % files.length]}.KC`;
  drawBoard();
  updateMeters();
  idle();
}

function showHint() {
  if (busy || found.size === words.length) return;
  cancelSelection();
  clearHint();
  const next = board.placements.find(word => !found.has(word.text));
  if (!next) return;
  hinted = [...next.cells];
  hinted.forEach(cell => buttons[cell].classList.add('is-hint'));
  say(`^ SZUKAJ / LOOK FOR: ${next.text}`);
  hintTimer = setTimeout(clearHint, 5500);
}

function flyWord(word: Placement, cells: number[]) {
  if (reducedMotion.matches) return;
  const from = buttons[cells[Math.floor(cells.length / 2)]].getBoundingClientRect();
  const to = categoryElements[word.category].getBoundingClientRect();
  const ghost = document.createElement('div');
  ghost.className = 'flying-word';
  ghost.setAttribute('aria-hidden', 'true');
  ghost.textContent = word.text;
  ghost.style.left = `${from.left}px`;
  ghost.style.top = `${from.top}px`;
  document.body.append(ghost);
  const flight = ghost.animate([
    { transform: 'translate(-30%, -10%) scale(1)', opacity: 1 },
    { transform: `translate(${to.left - from.left + to.width / 3}px, ${to.top - from.top + 25}px) scale(.55)`, opacity: 0 },
  ], { duration: 680, easing: 'cubic-bezier(.4, 0, .15, 1)', fill: 'forwards' });
  flight.finished.then(() => ghost.remove()).catch(() => ghost.remove());
}

function collect(word: Placement, cells: number[]) {
  busy = true;
  clearHint();
  clearMagnification();
  cancelSelection();
  found.add(word.text);
  updateMeters();
  say(`${word.text} → ${CATEGORIES[word.category].label} · ZRAFINOWANO / REFINED`);
  const category = categoryElements[word.category];
  category.classList.remove('is-receiving');
  void category.offsetWidth;
  category.classList.add('is-receiving');
  cells.forEach(cell => buttons[cell].classList.add('is-refining'));
  flyWord(word, cells);
  const thisRevision = revision;
  refineTimer = setTimeout(() => {
    if (revision !== thisRevision) return;
    const protectedCells = new Set(board.placements.filter(item => !found.has(item.text)).flatMap(item => item.cells));
    // Keep all remaining answers intact, including when the player found a
    // coincidental copy of a target elsewhere in the random letters.
    new Set([...cells, ...word.cells]).forEach(cell => {
      buttons[cell].classList.remove('is-refining');
      if (protectedCells.has(cell)) return;
      board.letters[cell] = randomLetter();
      buttons[cell].querySelector('span')!.textContent = board.letters[cell];
      buttons[cell].setAttribute('aria-label', `${board.letters[cell]}, ${Math.floor(cell / board.columns) + 1}:${cell % board.columns + 1}`);
    });
    busy = false;
    if (found.size === words.length) {
      complete.hidden = false;
      grid.inert = true;
      say('RAPORT UKOŃCZONY / REPORT COMPLETE · 100%');
      element<HTMLButtonElement>('#next-sheet').focus({ preventScroll: true });
    }
  }, reducedMotion.matches ? 0 : 480);
}

function finishSelection(end: number) {
  if (anchor === null || busy) return;
  const path = selectionPath(anchor, end, board.columns, board.letters.length);
  const word = matchWord(board, path, found);
  if (word) {
    collect(word, path);
  } else {
    cancelSelection();
    const text = path.map(cell => board.letters[cell]).join('');
    const alreadyFound = found.has(text) || found.has([...text].reverse().join(''));
    say(alreadyFound ? 'JUŻ ODNALEZIONE. / ALREADY REFINED.' : 'TO JESZCZE SZUM. SPRÓBUJ DALEJ. / STILL NOISE. KEEP LOOKING.');
  }
}

function activateCell(cell: number) {
  if (busy || !complete.hidden) return;
  setFocus(cell, false);
  if (board.letters[cell] === '^') { showHint(); return; }
  if (anchor === null) {
    clearHint();
    anchor = cell;
    paintSelection([cell]);
    say('WYBIERZ OSTATNIĄ LITERĘ. / SELECT THE LAST LETTER.');
  } else if (anchor === cell) {
    cancelSelection();
    idle();
  } else {
    finishSelection(cell);
  }
}

function cellAt(x: number, y: number): number | null {
  const button = document.elementFromPoint(x, y)?.closest<HTMLButtonElement>('.letter');
  return button && grid.contains(button) ? Number(button.dataset.cell) : null;
}

grid.addEventListener('pointerdown', event => {
  if (event.button !== 0 || !event.isPrimary || busy || !complete.hidden) return;
  const cell = cellAt(event.clientX, event.clientY);
  if (cell === null) return;
  event.preventDefault();
  setFocus(cell);
  if (board.letters[cell] === '^') { showHint(); return; }
  clearHint();
  pointer = { id: event.pointerId, start: anchor ?? cell, end: cell, hadAnchor: anchor !== null };
  anchor = pointer.start;
  paintSelection(selectionPath(anchor, cell, board.columns, board.letters.length));
  grid.setPointerCapture(event.pointerId);
});

grid.addEventListener('pointermove', event => {
  const cell = cellAt(event.clientX, event.clientY);
  if (pointer) {
    if (pointer.id !== event.pointerId) return;
    pointer.end = cell;
    paintSelection(cell === null ? [] : selectionPath(pointer.start, cell, board.columns, board.letters.length));
    return;
  }
  clearMagnification();
  if (cell === null || reducedMotion.matches || event.pointerType !== 'mouse' || busy) return;
  if (anchor !== null) paintSelection(selectionPath(anchor, cell, board.columns, board.letters.length));
  const row = Math.floor(cell / board.columns);
  const column = cell % board.columns;
  buttons.forEach((button, index) => {
    const distance = Math.hypot(Math.floor(index / board.columns) - row, index % board.columns - column);
    if (distance < 2.3) {
      button.style.setProperty('--magnify', String(1 + .7 * Math.pow(1 - distance / 2.3, 1.3)));
      magnified.push(index);
    }
  });
});

grid.addEventListener('pointerup', event => {
  if (!pointer || event.pointerId !== pointer.id) return;
  const { start, hadAnchor } = pointer;
  const end = cellAt(event.clientX, event.clientY);
  pointer = null;
  if (grid.hasPointerCapture(event.pointerId)) grid.releasePointerCapture(event.pointerId);
  if (end === null) { cancelSelection(); idle(); return; }
  if (start !== end) finishSelection(end);
  else if (hadAnchor) { cancelSelection(); idle(); }
  else say('WYBIERZ OSTATNIĄ LITERĘ. / SELECT THE LAST LETTER.');
});
grid.addEventListener('pointercancel', () => { cancelSelection(); clearMagnification(); idle(); });
grid.addEventListener('lostpointercapture', () => { if (pointer) { cancelSelection(); idle(); } });
grid.addEventListener('pointerleave', () => { clearMagnification(); if (anchor !== null && !pointer) paintSelection([anchor]); });
window.addEventListener('blur', () => { cancelSelection(); clearMagnification(); });

// A zero-detail click allows screen readers to activate the real buttons.
grid.addEventListener('click', event => {
  if (event.detail !== 0) return;
  const button = (event.target as Element).closest<HTMLButtonElement>('.letter');
  if (button) activateCell(Number(button.dataset.cell));
});

grid.addEventListener('keydown', event => {
  const button = (event.target as Element).closest<HTMLButtonElement>('.letter');
  if (!button) return;
  const cell = Number(button.dataset.cell);
  let next = cell;
  const column = cell % board.columns;
  if (event.key === 'ArrowLeft') next = column > 0 ? cell - 1 : cell;
  else if (event.key === 'ArrowRight') next = column < board.columns - 1 ? cell + 1 : cell;
  else if (event.key === 'ArrowUp') next = Math.max(column, cell - board.columns);
  else if (event.key === 'ArrowDown') next = Math.min((board.rows - 1) * board.columns + column, cell + board.columns);
  else if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); activateCell(cell); return; }
  else if (event.key === 'Escape') { event.preventDefault(); cancelSelection(); idle(); return; }
  else return;
  event.preventDefault();
  setFocus(next);
  if (anchor !== null) paintSelection(selectionPath(anchor, next, board.columns, board.letters.length));
});

categoryElements.forEach(category => {
  const button = category.querySelector('button')!;
  button.addEventListener('click', () => {
    const open = button.getAttribute('aria-expanded') !== 'true';
    button.setAttribute('aria-expanded', String(open));
    category.querySelector<HTMLElement>('.word-list')!.hidden = !open;
  });
});
element('#hint-button').addEventListener('click', showHint);
element('#help-button').addEventListener('click', () => { cancelSelection(); dialog.showModal(); });
element('#reset-button').addEventListener('click', () => newSheet(true));
element('#next-sheet').addEventListener('click', () => { newSheet(true); setFocus(0); });
dialog.addEventListener('click', event => {
  if (event.target !== dialog) return;
  const rect = dialog.getBoundingClientRect();
  if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) dialog.close();
});
narrow.addEventListener('change', drawBoard);
newSheet();
