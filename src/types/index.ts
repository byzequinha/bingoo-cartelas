export type CardType = '75' | '90';

export type MarkType = 'none' | 'called' | 'manual' | 'free';

export type CardCategory = 'regular' | 'extra';

export interface Cell {
  value: number | null;
  marked: MarkType;
}

export interface Card {
  id: string;
  name: string;
  type: CardType;
  category: CardCategory;
  freeCenter: boolean;
  grid: Cell[][];
  createdAt: number;
}

export type WinCondition = 'row' | 'column' | 'full';

export interface WinRule {
  row: boolean;
  column: boolean;
  full: boolean;
}

export interface WinDetection {
  cardId: string;
  cardName: string;
  conditions: WinCondition[];
}

export interface GameState {
  calledNumbers: number[];
  cards: Card[];
  winRule: WinRule;
  wins: WinDetection[];
}

export interface AppSettings {
  theme: 'light' | 'dark' | 'system';
  differentiateMarks: boolean;
  soundEnabled: boolean;
}
