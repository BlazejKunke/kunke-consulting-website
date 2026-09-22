export const CATEGORIES = [
  { id: 'ai', label: 'AI · SI', words: ['MODEL', 'AGENT', 'ROBOT', 'NEURON', 'LOGIC', 'SYSTEM', 'VISION', 'TOKEN'] },
  { id: 'data', label: 'DANE · DATA', words: ['DANE', 'DATA', 'SIGNAL', 'WYNIK', 'INPUT', 'OUTPUT', 'FAKT', 'TREND'] },
  { id: 'know', label: 'WIEDZA · KNOW', words: ['SENS', 'IDEA', 'NAUKA', 'LEARN', 'WIEDZA', 'SKILL', 'INSIGHT', 'WHY'] },
  { id: 'team', label: 'ZESPÓŁ · TEAM', words: ['KUNKE', 'TEAM', 'BLAZE', 'ZESPÓŁ', 'TRUST', 'LUDZIE', 'POZNAŃ', 'HUMAN'] },
  { id: 'prompt', label: 'PROMPT', words: ['PROMPT', 'CEL', 'PLAN', 'PYTAJ', 'THINK', 'CONTEXT', 'CREATE', 'PROCES'] },
] as const;

export type Word = { text: string; category: number };
export type Placement = Word & { cells: number[] };
export type Board = { columns: number; rows: number; letters: string[]; placements: Placement[]; caret: number };
export type Random = () => number;
const ALPHABET = [...'AAAĄBCĆDEEEĘFGHIIIJKLLŁMNŃOOOÓPRSŚTUWYZŹŻ'];

export function shuffled<T>(items: readonly T[], random: Random = Math.random): T[] {
  const result = [...items];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

export function wordsForSheet(page: number, random: Random = Math.random): Word[] {
  return CATEGORIES.flatMap((category, index) => {
    // The first file is approachable and contains a personal discovery.
    const words = page === 1 ? category.words.slice(0, 2) : shuffled(category.words, random).slice(0, 2);
    return words.map(text => ({ text, category: index }));
  });
}

export function randomLetter(random: Random = Math.random): string {
  return ALPHABET[Math.floor(random() * ALPHABET.length)];
}

/** Non-overlapping words let us refine letters without destroying another answer. */
export function createBoard(columns: number, rows: number, words: Word[], random: Random = Math.random): Board {
  if (!Number.isInteger(columns) || !Number.isInteger(rows) || columns < 1 || rows < 1) throw new Error('Invalid grid dimensions');
  const letters = Array<string>(columns * rows).fill('');
  const placements: Placement[] = [];
  const ordered = shuffled(words, random).sort((a, b) => b.text.length - a.text.length);
  let attempts = 0;

  function place(index: number): boolean {
    if (index === ordered.length) return true;
    if (++attempts > 12000) return false;
    const word = ordered[index];
    const options: number[][] = [];
    for (let row = 0; row < rows; row++) {
      for (let column = 0; column < columns; column++) {
        for (const vertical of [false, true]) {
          if ((vertical ? row : column) + word.text.length > (vertical ? rows : columns)) continue;
          const cells = [...word.text].map((_, offset) => row * columns + column + offset * (vertical ? columns : 1));
          if (cells.every(cell => !letters[cell])) options.push(cells);
        }
      }
    }
    for (const cells of shuffled(options, random)) {
      cells.forEach((cell, offset) => { letters[cell] = word.text[offset]; });
      placements.push({ ...word, cells });
      if (place(index + 1)) return true;
      placements.pop();
      cells.forEach(cell => { letters[cell] = ''; });
    }
    return false;
  }

  if (!place(0)) throw new Error('The words do not fit this sheet');
  const free = letters.flatMap((letter, cell) => letter ? [] : [cell]);
  const caret = free.length ? free[Math.floor(random() * free.length)] : -1;
  for (let cell = 0; cell < letters.length; cell++) {
    if (!letters[cell]) letters[cell] = cell === caret ? '^' : randomLetter(random);
  }
  return { columns, rows, letters, placements, caret };
}

/** Only straight horizontal and vertical selections are valid; no wrapping. */
export function selectionPath(start: number, end: number, columns: number, total: number): number[] {
  if (![start, end, columns, total].every(Number.isInteger) || columns < 1 || start < 0 || end < 0 || start >= total || end >= total) return [];
  const sameRow = Math.floor(start / columns) === Math.floor(end / columns);
  const sameColumn = start % columns === end % columns;
  if (!sameRow && !sameColumn) return [];
  const step = sameRow ? Math.sign(end - start) : Math.sign(end - start) * columns;
  if (step === 0) return [start];
  return Array.from({ length: Math.abs((end - start) / step) + 1 }, (_, index) => start + index * step);
}

/** Text matching also accepts an accidental duplicate of a target in the filler. */
export function matchWord(board: Board, cells: number[], found: ReadonlySet<string>): Placement | undefined {
  if (cells.length < 2) return;
  const valid = selectionPath(cells[0], cells[cells.length - 1], board.columns, board.letters.length);
  if (valid.length !== cells.length || !valid.every((cell, index) => cell === cells[index])) return;
  const text = cells.map(cell => board.letters[cell]).join('');
  const reverse = [...text].reverse().join('');
  return board.placements.find(word => !found.has(word.text) && (word.text === text || word.text === reverse));
}

export function progress(words: Word[], found: ReadonlySet<string>, category?: number): number {
  const relevant = words.filter(word => category === undefined || word.category === category);
  return relevant.length ? Math.round(100 * relevant.filter(word => found.has(word.text)).length / relevant.length) : 0;
}
