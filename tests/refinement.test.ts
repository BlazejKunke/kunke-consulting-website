import assert from 'node:assert/strict';
import test from 'node:test';
import { CATEGORIES, createBoard, matchWord, progress, selectionPath, wordsForSheet } from '../src/lib/refinement/engine.ts';

function seeded(seed: number) {
  return () => {
    seed = (Math.imul(1664525, seed) + 1013904223) >>> 0;
    return seed / 4294967296;
  };
}

test('500 desktop and phone sheets contain every answer, with no overlaps or hidden caret', () => {
  for (let seed = 1; seed <= 250; seed++) {
    for (const [columns, rows] of [[17, 7], [10, 12]]) {
      const random = seeded(seed);
      const words = wordsForSheet(seed, random);
      const board = createBoard(columns, rows, words, random);
      assert.equal(board.placements.length, 10);
      assert.equal(new Set(words.map(word => word.text)).size, 10);
      for (let category = 0; category < CATEGORIES.length; category++) assert.equal(words.filter(word => word.category === category).length, 2);
      const used = new Set<number>();
      for (const word of board.placements) {
        assert.equal(word.cells.map(cell => board.letters[cell]).join(''), word.text);
        assert.deepEqual(selectionPath(word.cells[0], word.cells.at(-1)!, columns, columns * rows), word.cells);
        for (const cell of word.cells) { assert.ok(!used.has(cell)); used.add(cell); }
      }
      assert.ok(!used.has(board.caret));
      assert.equal(board.letters[board.caret], '^');
      assert.ok(board.letters.every(letter => [...letter].length === 1));
    }
  }
});

test('selection rejects diagonals, row wrapping and out-of-bounds cells', () => {
  assert.deepEqual(selectionPath(16, 17, 17, 119), []);
  assert.deepEqual(selectionPath(0, 18, 17, 119), []);
  assert.deepEqual(selectionPath(-1, 1, 17, 119), []);
  assert.deepEqual(selectionPath(0, 119, 17, 119), []);
  assert.deepEqual(selectionPath(0, 34, 17, 119), [0, 17, 34]);
  assert.deepEqual(selectionPath(5, 2, 17, 119), [5, 4, 3, 2]);
});

test('every answer can be collected once, in either direction, reaching exactly 100%', () => {
  const words = wordsForSheet(1);
  const board = createBoard(17, 7, words, seeded(37));
  const found = new Set<string>();
  assert.equal(progress(words, found), 0);
  for (const word of board.placements) {
    assert.equal(matchWord(board, word.cells, found)?.text, word.text);
    assert.equal(matchWord(board, [...word.cells].reverse(), found)?.text, word.text);
    found.add(word.text);
    assert.equal(matchWord(board, word.cells, found), undefined);
  }
  assert.equal(progress(words, found), 100);
  for (let index = 0; index < CATEGORIES.length; index++) assert.equal(progress(words, found, index), 100);
});

test('Polish accents survive board generation and exact selection', () => {
  const board = createBoard(10, 12, [{ text: 'POZNAŃ', category: 3 }, { text: 'ZESPÓŁ', category: 3 }], seeded(18));
  for (const word of board.placements) assert.equal(matchWord(board, word.cells, new Set())?.text, word.text);
});

test('reflow keeps the same targets and progress, with new valid placements', () => {
  const words = wordsForSheet(3, seeded(22));
  const found = new Set([words[0].text, words[3].text]);
  const phone = createBoard(10, 12, words, seeded(23));
  assert.equal(progress(words, found), 20);
  for (const word of phone.placements.filter(word => !found.has(word.text))) assert.ok(matchWord(phone, word.cells, found));
});

test('scrambled paths and impossible sheets are rejected', () => {
  const board = createBoard(17, 7, wordsForSheet(1), seeded(2));
  const cells = [...board.placements[0].cells];
  [cells[1], cells[2]] = [cells[2], cells[1]];
  assert.equal(matchWord(board, cells, new Set()), undefined);
  assert.throws(() => createBoard(2, 2, [{ text: 'PROMPT', category: 4 }]), /do not fit/);
});
