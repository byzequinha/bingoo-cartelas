import type { Card, WinRule, AppSettings } from '../types';

const KEYS = {
  cards: 'bingoo_cards',
  calledNumbers: 'bingoo_called_numbers',
  winRule: 'bingoo_win_rule',
  settings: 'bingoo_settings',
} as const;

function load<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function save<T>(key: string, value: T): void {
  localStorage.setItem(key, JSON.stringify(value));
}

export const defaultWinRule: WinRule = { row: true, column: false, full: false };
export const defaultSettings: AppSettings = { theme: 'system', differentiateMarks: true, soundEnabled: true };

export function loadCards(): Card[] {
  return load<Card[]>(KEYS.cards, []);
}

export function saveCards(cards: Card[]): void {
  save(KEYS.cards, cards);
}

export function loadCalledNumbers(): number[] {
  return load<number[]>(KEYS.calledNumbers, []);
}

export function saveCalledNumbers(numbers: number[]): void {
  save(KEYS.calledNumbers, numbers);
}

export function loadWinRule(): WinRule {
  return load<WinRule>(KEYS.winRule, defaultWinRule);
}

export function saveWinRule(rule: WinRule): void {
  save(KEYS.winRule, rule);
}

export function loadSettings(): AppSettings {
  return load<AppSettings>(KEYS.settings, defaultSettings);
}

export function saveSettings(settings: AppSettings): void {
  save(KEYS.settings, settings);
}
