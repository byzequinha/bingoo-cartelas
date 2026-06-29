import type { Card, Cell, WinRule, WinCondition, WinDetection, CardType } from '../types';

export function createEmptyGrid(type: CardType, freeCenter: boolean): Cell[][] {
  if (type === '75') {
    const grid: Cell[][] = Array.from({ length: 5 }, () =>
      Array.from({ length: 5 }, () => ({ value: null, marked: 'none' as const }))
    );
    if (freeCenter) {
      grid[2][2] = { value: null, marked: 'free' };
    }
    return grid;
  }
  return Array.from({ length: 3 }, () =>
    Array.from({ length: 9 }, () => ({ value: null, marked: 'none' as const }))
  );
}

export function generateCardId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

export function getMaxNumber(type: CardType): number {
  return type === '75' ? 75 : 90;
}

export function getColumnRange75(col: number): [number, number] {
  return [col * 15 + 1, (col + 1) * 15];
}

export function validateCard(card: Card): string[] {
  const errors: string[] = [];
  const seen = new Set<number>();
  const max = getMaxNumber(card.type);

  for (let r = 0; r < card.grid.length; r++) {
    for (let c = 0; c < card.grid[r].length; c++) {
      const cell = card.grid[r][c];
      if (cell.marked === 'free') continue;
      if (cell.value === null) {
        if (card.type === '90') continue;
        errors.push(`Célula [${r + 1},${c + 1}] está vazia`);
        continue;
      }
      if (cell.value < 1 || cell.value > max) {
        errors.push(`Número ${cell.value} fora da faixa (1-${max})`);
      }
      if (seen.has(cell.value)) {
        errors.push(`Número ${cell.value} duplicado na cartela`);
      }
      seen.add(cell.value);
    }
  }
  return errors;
}

export function markCalledNumber(cards: Card[], number: number): Card[] {
  return cards.map(card => ({
    ...card,
    grid: card.grid.map(row =>
      row.map(cell =>
        cell.value === number && cell.marked !== 'free'
          ? { ...cell, marked: 'called' as const }
          : cell
      )
    ),
  }));
}

export function unmarkCalledNumber(cards: Card[], number: number): Card[] {
  return cards.map(card => ({
    ...card,
    grid: card.grid.map(row =>
      row.map(cell =>
        cell.value === number && cell.marked === 'called'
          ? { ...cell, marked: 'none' as const }
          : cell
      )
    ),
  }));
}

function isMarked(cell: Cell): boolean {
  return cell.marked === 'called' || cell.marked === 'manual' || cell.marked === 'free';
}

export function checkWin(card: Card, winRule: WinRule): WinCondition[] {
  const conditions: WinCondition[] = [];
  const grid = card.grid;
  const rows = grid.length;
  const cols = grid[0].length;

  if (winRule.row) {
    for (let r = 0; r < rows; r++) {
      const rowCells = grid[r].filter(c => c.value !== null || c.marked === 'free');
      if (rowCells.length > 0 && rowCells.every(isMarked)) {
        conditions.push('row');
        break;
      }
    }
  }

  if (winRule.column) {
    for (let c = 0; c < cols; c++) {
      const colCells: Cell[] = [];
      for (let r = 0; r < rows; r++) {
        if (grid[r][c].value !== null || grid[r][c].marked === 'free') {
          colCells.push(grid[r][c]);
        }
      }
      if (colCells.length > 0 && colCells.every(isMarked)) {
        conditions.push('column');
        break;
      }
    }
  }

  if (winRule.full) {
    const allCells = grid.flat().filter(c => c.value !== null || c.marked === 'free');
    if (allCells.length > 0 && allCells.every(isMarked)) {
      conditions.push('full');
    }
  }

  return conditions;
}

export function detectAllWins(cards: Card[], winRule: WinRule): WinDetection[] {
  const wins: WinDetection[] = [];
  for (const card of cards) {
    const conditions = checkWin(card, winRule);
    if (conditions.length > 0) {
      wins.push({ cardId: card.id, cardName: card.name, conditions });
    }
  }
  return wins;
}

export function countRemainingForWin(card: Card, winRule: WinRule): number {
  let minRemaining = Infinity;
  const grid = card.grid;
  const rows = grid.length;
  const cols = grid[0].length;

  if (winRule.row) {
    for (let r = 0; r < rows; r++) {
      const rowCells = grid[r].filter(c => c.value !== null || c.marked === 'free');
      const unmarked = rowCells.filter(c => !isMarked(c)).length;
      minRemaining = Math.min(minRemaining, unmarked);
    }
  }

  if (winRule.column) {
    for (let c = 0; c < cols; c++) {
      let unmarked = 0;
      let hasCells = false;
      for (let r = 0; r < rows; r++) {
        if (grid[r][c].value !== null || grid[r][c].marked === 'free') {
          hasCells = true;
          if (!isMarked(grid[r][c])) unmarked++;
        }
      }
      if (hasCells) {
        minRemaining = Math.min(minRemaining, unmarked);
      }
    }
  }

  if (winRule.full) {
    const allCells = grid.flat().filter(c => c.value !== null || c.marked === 'free');
    const unmarked = allCells.filter(c => !isMarked(c)).length;
    minRemaining = Math.min(minRemaining, unmarked);
  }

  return minRemaining === Infinity ? 0 : minRemaining;
}

export function generateTestCards(count: number): Card[] {
  const names = [
    'Cartela da Vó', 'João 1', 'Maria 2', 'Tio Pedro',
    'Ana Clara', 'Seu Zé', 'Dona Lúcia', 'Primo Carlos',
    'Vizinha Rosa', 'Comadre Fátima', 'Padrinho Beto', 'Tia Marta',
    'Sobrinho Leo', 'Avô Geraldo', 'Neta Sofia', 'Amiga Pati',
    'Cunhada Lia', 'Dindo Marcos', 'Filha Jú', 'Genro Raul',
  ];

  function pick(min: number, max: number, n: number): number[] {
    const pool = Array.from({ length: max - min + 1 }, (_, i) => min + i);
    const result: number[] = [];
    for (let i = 0; i < n; i++) {
      const idx = Math.floor(Math.random() * pool.length);
      result.push(pool.splice(idx, 1)[0]);
    }
    return result.sort((a, b) => a - b);
  }

  return Array.from({ length: count }, (_, idx) => {
    const cols = [
      pick(1, 15, 5), pick(16, 30, 5), pick(31, 45, 5),
      pick(46, 60, 5), pick(61, 75, 5),
    ];
    const grid: Cell[][] = Array.from({ length: 5 }, (_, row) =>
      Array.from({ length: 5 }, (_, col) => ({
        value: cols[col][row],
        marked: 'none' as const,
      }))
    );
    return {
      id: generateCardId() + idx,
      name: names[idx % names.length] + (idx >= names.length ? ` (${Math.floor(idx / names.length) + 1})` : ''),
      type: '75' as const,
      category: 'regular' as const,
      freeCenter: false,
      grid,
      createdAt: Date.now() + idx,
    };
  });
}
