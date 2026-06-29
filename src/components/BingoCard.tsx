import type { Card, WinDetection, WinRule } from '../types';

interface Props {
  card: Card;
  win: WinDetection | undefined;
  winRule: WinRule;
  remaining: number;
  rank: number;
  differentiateMarks: boolean;
  onCellClick: (cardId: string, row: number, col: number) => void;
  onEdit: (card: Card) => void;
  onDelete: (id: string) => void;
}

export function BingoCard({ card, win, winRule, remaining, rank, differentiateMarks, onCellClick, onEdit, onDelete }: Props) {
  const hasActiveRule = winRule.row || winRule.column || winRule.full;
  const isWin = !!win;
  const isExtra = card.category === 'extra';
  const isHot = hasActiveRule && !isWin && remaining <= 3;

  function getCellClasses(marked: string): string {
    const base = 'h-8 flex items-center justify-center font-mono font-bold rounded transition-colors select-none text-xs';
    if (marked === 'free') return `${base} bg-primary/20 text-primary`;
    if (marked === 'called') return `${base} bg-marked-called text-white`;
    if (marked === 'manual') {
      if (differentiateMarks) return `${base} bg-marked-manual text-white`;
      return `${base} bg-marked-called text-white`;
    }
    return `${base} bg-gray-100 dark:bg-gray-800 text-text-light dark:text-text-dark hover:bg-gray-200 dark:hover:bg-gray-700 cursor-pointer`;
  }

  const borderClass = isWin
    ? 'border-win-alert bg-win-alert/5 shadow-lg shadow-win-alert/25 ring-2 ring-win-alert/30'
    : isHot
      ? 'border-amber-400 bg-amber-50 dark:bg-amber-950/20 shadow-md shadow-amber-200/20 dark:shadow-amber-900/20'
      : isExtra
        ? 'border-extra/50 bg-extra/5'
        : 'border-border-light dark:border-border-dark bg-surface-light dark:bg-surface-dark';

  return (
    <div className={`rounded-lg border p-2 transition-all duration-500 ${borderClass}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-1 gap-1">
        <div className="flex items-center gap-1 min-w-0">
          {hasActiveRule && (
            <span className={`flex-shrink-0 w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-bold ${
              isWin
                ? 'bg-win-alert text-white'
                : isHot
                  ? 'bg-amber-400 text-white'
                  : 'bg-gray-200 dark:bg-gray-700 text-muted-light dark:text-muted-dark'
            }`}>
              {rank}
            </span>
          )}
          <h3 className="font-bold text-xs truncate">{card.name}</h3>
          {isExtra && (
            <span className="flex-shrink-0 text-[9px] px-1 rounded bg-extra/20 text-extra-dark dark:text-extra font-bold leading-none">
              EX
            </span>
          )}
        </div>
        <div className="flex items-center gap-1 flex-shrink-0">
          {hasActiveRule && !isWin && (
            <span className={`text-[10px] font-medium ${
              remaining <= 1 ? 'text-win-alert font-bold' : remaining <= 3 ? 'text-amber-500 dark:text-amber-400 font-bold' : 'text-muted-light dark:text-muted-dark'
            }`}>
              {remaining === 0 ? '...' : `−${remaining}`}
            </span>
          )}
          <button onClick={() => onEdit(card)} className="p-0.5 rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition text-[10px] leading-none" title="Editar">✏️</button>
          <button onClick={() => onDelete(card.id)} className="p-0.5 rounded hover:bg-red-100 dark:hover:bg-red-900/30 transition text-[10px] leading-none" title="Excluir">🗑️</button>
        </div>
      </div>

      {/* Win banner */}
      {isWin && (
        <div className="mb-1 px-2 py-0.5 bg-win-alert text-white rounded text-[10px] font-bold text-center animate-pulse">
          BINGO! {win.conditions.map(c =>
            c === 'row' ? 'Linha' : c === 'column' ? 'Coluna' : 'Cheia'
          ).join(' + ')}
        </div>
      )}

      {/* Grid */}
      {card.type === '75' && (
        <div className="grid grid-cols-5 gap-px mb-px">
          {['B', 'I', 'N', 'G', 'O'].map(h => (
            <div key={h} className="text-center font-bold text-primary text-[10px] leading-tight">{h}</div>
          ))}
        </div>
      )}
      <div className={`grid gap-px ${card.type === '75' ? 'grid-cols-5' : 'grid-cols-9'}`}>
        {card.grid.flat().map((cell, i) => (
          <div
            key={i}
            onClick={() => {
              const cols = card.type === '75' ? 5 : 9;
              onCellClick(card.id, Math.floor(i / cols), i % cols);
            }}
            className={getCellClasses(cell.marked)}
          >
            {cell.marked === 'free' ? '★' : cell.value ?? ''}
          </div>
        ))}
      </div>
    </div>
  );
}
