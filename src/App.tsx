import { useState, useMemo } from 'react';
import { useGame } from './hooks/useGame';
import { CardForm } from './components/CardForm';
import { BingoCard } from './components/BingoCard';
import { CalledNumberPanel } from './components/CalledNumberPanel';
import { GameHistory, GameHistoryMobile } from './components/GameHistory';
import { WinConfig } from './components/WinConfig';
import { Settings } from './components/Settings';
import { Confetti } from './components/Confetti';
import { countRemainingForWin } from './utils/game';
import type { Card, CardCategory } from './types';

interface RankedCard {
  card: Card;
  remaining: number;
  isWin: boolean;
}

function App() {
  const game = useGame();
  const [showCardForm, setShowCardForm] = useState(false);
  const [editingCard, setEditingCard] = useState<Card | undefined>();
  const [showSettings, setShowSettings] = useState(false);
  const [activeTab, setActiveTab] = useState<CardCategory>('regular');

  const maxNumber = game.cards.length > 0
    ? Math.max(...game.cards.map(c => c.type === '90' ? 90 : 75))
    : 75;

  const hasActiveRule = game.winRule.row || game.winRule.column || game.winRule.full;

  const regularCards = useMemo(() => game.cards.filter(c => c.category === 'regular'), [game.cards]);
  const extraCards = useMemo(() => game.cards.filter(c => c.category === 'extra'), [game.cards]);
  const regularWins = useMemo(() => game.wins.filter(w => regularCards.some(c => c.id === w.cardId)), [game.wins, regularCards]);
  const extraWins = useMemo(() => game.wins.filter(w => extraCards.some(c => c.id === w.cardId)), [game.wins, extraCards]);

  const sortedRegular = useMemo<RankedCard[]>(() => {
    if (!hasActiveRule) return regularCards.map(card => ({ card, remaining: 0, isWin: false }));
    return regularCards
      .map(card => ({
        card,
        remaining: countRemainingForWin(card, game.winRule),
        isWin: game.wins.some(w => w.cardId === card.id),
      }))
      .sort((a, b) => {
        if (a.isWin !== b.isWin) return a.isWin ? -1 : 1;
        return a.remaining - b.remaining;
      });
  }, [regularCards, game.winRule, game.wins, hasActiveRule]);

  const sortedExtra = useMemo<RankedCard[]>(() => {
    if (!hasActiveRule) return extraCards.map(card => ({ card, remaining: 0, isWin: false }));
    return extraCards
      .map(card => ({
        card,
        remaining: countRemainingForWin(card, game.winRule),
        isWin: game.wins.some(w => w.cardId === card.id),
      }))
      .sort((a, b) => {
        if (a.isWin !== b.isWin) return a.isWin ? -1 : 1;
        return a.remaining - b.remaining;
      });
  }, [extraCards, game.winRule, game.wins, hasActiveRule]);

  const displayRanked = activeTab === 'regular' ? sortedRegular : sortedExtra;
  const displayWins = activeTab === 'regular' ? regularWins : extraWins;

  function handleSaveCard(card: Card) {
    if (editingCard) {
      game.updateCard(card);
    } else {
      game.addCard(card);
    }
    setShowCardForm(false);
    setEditingCard(undefined);
    setActiveTab(card.category);
  }

  function handleEditCard(card: Card) {
    setEditingCard(card);
    setShowCardForm(true);
  }

  function handleDeleteCard(id: string) {
    if (confirm('Excluir esta cartela?')) {
      game.deleteCard(id);
    }
  }

  function openNewCard(category: CardCategory) {
    setEditingCard(undefined);
    setActiveTab(category);
    setShowCardForm(true);
  }

  return (
    <div className="h-screen flex flex-col overflow-hidden">
      {/* Header fino */}
      <header className="flex-shrink-0 z-40 bg-surface-light/95 dark:bg-surface-dark/95 backdrop-blur-sm border-b border-border-light dark:border-border-dark">
        <div className="max-w-[1920px] mx-auto px-3 py-1.5 flex items-center justify-between">
          <h1 className="text-lg font-bold text-primary tracking-tight">Bing<span className="text-sm">🎱</span>o Cartelas</h1>
          <div className="flex gap-1.5 items-center">
            {game.calledNumbers.length > 0 && (
              <span className="text-xs text-muted-light dark:text-muted-dark hidden sm:inline">
                {game.calledNumbers.length} pedra{game.calledNumbers.length !== 1 ? 's' : ''}
              </span>
            )}
<button
              onClick={() => openNewCard(activeTab)}
              className="px-3 py-1 bg-primary text-white rounded-lg font-medium hover:bg-primary-dark transition text-sm"
            >
              + Cartela
            </button>
            <button
              onClick={() => setShowSettings(true)}
              className="px-2 py-1 rounded-lg border border-border-light dark:border-border-dark hover:bg-gray-100 dark:hover:bg-gray-700 transition text-sm"
              title="Configurações"
            >
              ⚙️
            </button>
          </div>
        </div>
      </header>

      {/* Main layout */}
      <div className="flex-1 min-h-0 max-w-[1920px] mx-auto w-full">
        <div className="h-full grid grid-cols-1 lg:grid-cols-[260px_1fr]">
          {/* Sidebar — fixa com scroll próprio */}
          <aside className="hidden lg:flex flex-col gap-2 p-2.5 border-r border-border-light dark:border-border-dark overflow-y-auto overflow-x-hidden">
            <CalledNumberPanel
              calledNumbers={game.calledNumbers}
              maxNumber={maxNumber}
              onCall={game.callNumber}
              onUndo={game.undoLastCall}
              onReset={game.resetGame}
            />
            <WinConfig winRule={game.winRule} onChange={game.setWinRule} />
            <GameHistory calledNumbers={game.calledNumbers} />
          </aside>

          {/* Cards area — scroll independente */}
          <section className="flex-1 min-h-0 overflow-y-auto p-2 lg:p-3">
            {/* Mobile controls */}
            <div className="lg:hidden space-y-2 mb-3">
              <CalledNumberPanel
                calledNumbers={game.calledNumbers}
                maxNumber={maxNumber}
                onCall={game.callNumber}
                onUndo={game.undoLastCall}
                onReset={game.resetGame}
              />
              <div className="flex gap-2">
                <div className="flex-1"><WinConfig winRule={game.winRule} onChange={game.setWinRule} /></div>
                <div className="flex-1"><GameHistoryMobile calledNumbers={game.calledNumbers} /></div>
              </div>
            </div>

            {/* Tabs */}
            {(regularCards.length > 0 || extraCards.length > 0) && (
              <div className="flex gap-1 mb-2 bg-gray-100 dark:bg-gray-800 rounded-lg p-0.5">
                <button
                  onClick={() => setActiveTab('regular')}
                  className={`flex-1 px-3 py-1 rounded-md font-medium text-xs transition ${
                    activeTab === 'regular'
                      ? 'bg-surface-light dark:bg-surface-dark shadow-sm text-text-light dark:text-text-dark'
                      : 'text-muted-light dark:text-muted-dark'
                  }`}
                >
                  Regulares
                  {regularCards.length > 0 && <span className="ml-1 text-primary font-bold">{regularCards.length}</span>}
                  {regularWins.length > 0 && <span className="ml-1 px-1 rounded bg-win-alert text-white text-[10px] font-bold animate-pulse">BINGO</span>}
                </button>
                <button
                  onClick={() => setActiveTab('extra')}
                  className={`flex-1 px-3 py-1 rounded-md font-medium text-xs transition ${
                    activeTab === 'extra'
                      ? 'bg-surface-light dark:bg-surface-dark shadow-sm text-text-light dark:text-text-dark'
                      : 'text-muted-light dark:text-muted-dark'
                  }`}
                >
                  Extras
                  {extraCards.length > 0 && <span className="ml-1 text-extra font-bold">{extraCards.length}</span>}
                  {extraWins.length > 0 && <span className="ml-1 px-1 rounded bg-win-alert text-white text-[10px] font-bold animate-pulse">BINGO</span>}
                </button>
              </div>
            )}

            {/* Card grid */}
            {displayRanked.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="text-5xl mb-3">{activeTab === 'extra' ? '🎟️' : '🎯'}</div>
                <h2 className="text-lg font-bold mb-1">
                  {game.cards.length === 0
                    ? 'Nenhuma cartela cadastrada'
                    : activeTab === 'extra' ? 'Nenhuma cartela extra' : 'Nenhuma cartela regular'}
                </h2>
                <p className="text-muted-light dark:text-muted-dark mb-4 text-sm">
                  {activeTab === 'extra' ? 'Cartelas extras competem por prêmios separados' : 'Comece adicionando suas cartelas de bingo'}
                </p>
                <button
                  onClick={() => openNewCard(activeTab)}
                  className={`px-5 py-2 text-white rounded-lg font-medium transition text-sm ${
                    activeTab === 'extra' ? 'bg-extra hover:bg-extra-dark' : 'bg-primary hover:bg-primary-dark'
                  }`}
                >
                  + Criar Cartela {activeTab === 'extra' ? 'Extra' : ''}
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-1.5">
                {displayRanked.map(({ card, remaining }, i) => (
                  <BingoCard
                    key={card.id}
                    card={card}
                    win={displayWins.find(w => w.cardId === card.id)}
                    winRule={game.winRule}
                    remaining={remaining}
                    rank={i + 1}
                    differentiateMarks={game.settings.differentiateMarks}
                    onCellClick={game.toggleCellMark}
                    onEdit={handleEditCard}
                    onDelete={handleDeleteCard}
                  />
                ))}
              </div>
            )}

          </section>
        </div>
      </div>

      {/* Modals */}
      {showCardForm && (
        <CardForm
          onSave={handleSaveCard}
          onCancel={() => { setShowCardForm(false); setEditingCard(undefined); }}
          editCard={editingCard}
        />
      )}

      {showSettings && (
        <Settings
          settings={game.settings}
          cards={game.cards}
          onChange={game.setSettings}
          onImport={game.importCards}
          onClose={() => setShowSettings(false)}
        />
      )}

      <Confetti active={game.wins.length > 0} />
    </div>
  );
}

export default App;
