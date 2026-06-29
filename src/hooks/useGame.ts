import { useState, useCallback, useEffect, useRef } from 'react';
import type { Card, WinRule, WinDetection, AppSettings } from '../types';
import { markCalledNumber, unmarkCalledNumber, detectAllWins, generateTestCards } from '../utils/game';
import { playMarkSound, playBingoSound, playUndoSound } from '../utils/sounds';
import {
  loadCards, saveCards,
  loadCalledNumbers, saveCalledNumbers,
  loadWinRule, saveWinRule,
  loadSettings, saveSettings,
  defaultSettings,
} from '../utils/storage';

function migrateCards(cards: Card[]): Card[] {
  return cards.map(c => ({
    ...c,
    category: c.category ?? 'regular',
  }));
}

export function useGame() {
  const [cards, setCards] = useState<Card[]>(() => migrateCards(loadCards()));
  const [calledNumbers, setCalledNumbers] = useState<number[]>(loadCalledNumbers);
  const [winRule, setWinRuleState] = useState<WinRule>(loadWinRule);
  const [wins, setWins] = useState<WinDetection[]>([]);
  const [settings, setSettingsState] = useState<AppSettings>(() => loadSettings() ?? defaultSettings);
  const prevWinCountRef = useRef(0);

  useEffect(() => { saveCards(cards); }, [cards]);
  useEffect(() => { saveCalledNumbers(calledNumbers); }, [calledNumbers]);
  useEffect(() => { saveWinRule(winRule); }, [winRule]);
  useEffect(() => { saveSettings(settings); }, [settings]);

  const settingsRef = useRef(settings);
  useEffect(() => { settingsRef.current = settings; }, [settings]);

  useEffect(() => {
    const newWins = detectAllWins(cards, winRule);
    setWins(newWins);
    if (newWins.length > prevWinCountRef.current && prevWinCountRef.current >= 0 && settingsRef.current.soundEnabled) {
      playBingoSound();
    }
    prevWinCountRef.current = newWins.length;
  }, [cards, winRule]);

  useEffect(() => {
    const root = document.documentElement;
    if (settings.theme === 'dark') {
      root.classList.add('dark');
    } else if (settings.theme === 'light') {
      root.classList.remove('dark');
    } else {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      root.classList.toggle('dark', prefersDark);
    }
  }, [settings.theme]);

  const addCard = useCallback((card: Card) => {
    setCards(prev => [...prev, card]);
  }, []);

  const updateCard = useCallback((card: Card) => {
    setCards(prev => prev.map(c => c.id === card.id ? card : c));
  }, []);

  const deleteCard = useCallback((id: string) => {
    setCards(prev => prev.filter(c => c.id !== id));
  }, []);

  const callNumber = useCallback((num: number) => {
    setCalledNumbers(prev => {
      if (prev.includes(num)) return prev;
      if (settingsRef.current.soundEnabled) playMarkSound();
      return [...prev, num];
    });
    setCards(prev => markCalledNumber(prev, num));
  }, []);

  const undoLastCall = useCallback(() => {
    setCalledNumbers(prev => {
      if (prev.length === 0) return prev;
      if (settingsRef.current.soundEnabled) playUndoSound();
      const last = prev[prev.length - 1];
      setCards(c => unmarkCalledNumber(c, last));
      return prev.slice(0, -1);
    });
  }, []);

  const resetGame = useCallback(() => {
    setCalledNumbers([]);
    setCards(prev => prev.map(card => ({
      ...card,
      grid: card.grid.map(row =>
        row.map(cell => ({
          ...cell,
          marked: cell.marked === 'free' ? 'free' as const : 'none' as const,
        }))
      ),
    })));
  }, []);

  const toggleCellMark = useCallback((cardId: string, row: number, col: number) => {
    setCards(prev => prev.map(card => {
      if (card.id !== cardId) return card;
      const cell = card.grid[row][col];
      if (cell.marked === 'free' || cell.value === null) return card;
      const newGrid = card.grid.map((r, ri) =>
        r.map((c, ci) => {
          if (ri !== row || ci !== col) return c;
          if (c.marked === 'none') return { ...c, marked: 'manual' as const };
          if (c.marked === 'manual') return { ...c, marked: 'none' as const };
          return c;
        })
      );
      return { ...card, grid: newGrid };
    }));
  }, []);

  const setWinRule = useCallback((rule: WinRule) => {
    setWinRuleState(rule);
  }, []);

  const setSettings = useCallback((s: AppSettings) => {
    setSettingsState(s);
  }, []);

  const seedTestCards = useCallback((count: number) => {
    setCards(prev => [...prev, ...generateTestCards(count)]);
  }, []);

  const importCards = useCallback((imported: Card[]) => {
    setCards(prev => [...prev, ...imported]);
  }, []);

  return {
    cards, calledNumbers, winRule, wins, settings,
    addCard, updateCard, deleteCard,
    callNumber, undoLastCall, resetGame,
    toggleCellMark, setWinRule, setSettings,
    seedTestCards, importCards,
  };
}
