import { useState, useMemo } from 'react';

interface Props {
  calledNumbers: number[];
}

const COLUMNS = [
  { letter: 'B', min: 1, max: 15, color: 'text-blue-500' },
  { letter: 'I', min: 16, max: 30, color: 'text-sky-500' },
  { letter: 'N', min: 31, max: 45, color: 'text-violet-500' },
  { letter: 'G', min: 46, max: 60, color: 'text-fuchsia-500' },
  { letter: 'O', min: 61, max: 75, color: 'text-rose-500' },
];

function groupByColumn(numbers: number[]) {
  const groups: Record<string, number[]> = {};
  for (const col of COLUMNS) {
    groups[col.letter] = numbers
      .filter(n => n >= col.min && n <= col.max)
      .sort((a, b) => a - b);
  }
  return groups;
}

export function GameHistory({ calledNumbers }: Props) {
  const groups = useMemo(() => groupByColumn(calledNumbers), [calledNumbers]);
  const last = calledNumbers.length > 0 ? calledNumbers[calledNumbers.length - 1] : null;

  if (calledNumbers.length === 0) {
    return (
      <div className="bg-surface-light dark:bg-surface-dark rounded-xl border border-border-light dark:border-border-dark p-3 shadow-sm">
        <h3 className="font-bold text-xs text-muted-light dark:text-muted-dark uppercase tracking-wide">Histórico</h3>
        <p className="text-xs text-muted-light dark:text-muted-dark mt-1">Nenhuma pedra marcada.</p>
      </div>
    );
  }

  return (
    <div className="bg-surface-light dark:bg-surface-dark rounded-xl border border-border-light dark:border-border-dark p-3 shadow-sm">
      <h3 className="font-bold text-xs text-muted-light dark:text-muted-dark uppercase tracking-wide mb-2">
        Histórico · {calledNumbers.length}
      </h3>
      <div className="space-y-1.5">
        {COLUMNS.map(col => {
          const nums = groups[col.letter];
          if (nums.length === 0) return null;
          return (
            <div key={col.letter} className="flex items-start gap-1.5">
              <span className={`flex-shrink-0 w-5 font-bold text-xs ${col.color}`}>{col.letter}</span>
              <div className="flex flex-wrap gap-0.5">
                {nums.map(num => (
                  <span
                    key={num}
                    className={`inline-flex items-center justify-center w-6 h-6 rounded text-[10px] font-bold ${
                      num === last
                        ? 'bg-primary text-white shadow-sm'
                        : 'bg-gray-100 dark:bg-gray-800 text-text-light dark:text-text-dark'
                    }`}
                  >
                    {num}
                  </span>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function GameHistoryMobile({ calledNumbers }: Props) {
  const [open, setOpen] = useState(false);
  const [activeCol, setActiveCol] = useState(0);
  const groups = useMemo(() => groupByColumn(calledNumbers), [calledNumbers]);
  const last = calledNumbers.length > 0 ? calledNumbers[calledNumbers.length - 1] : null;

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="w-full bg-surface-light dark:bg-surface-dark rounded-xl border border-border-light dark:border-border-dark p-3 shadow-sm text-left"
      >
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-xs text-muted-light dark:text-muted-dark uppercase tracking-wide">
            Histórico · {calledNumbers.length}
          </h3>
          <span className="text-xs text-muted-light dark:text-muted-dark">Ver tudo →</span>
        </div>
        {calledNumbers.length > 0 && (
          <div className="flex gap-1 mt-1.5 overflow-hidden">
            {[...calledNumbers].reverse().slice(0, 8).map(num => (
              <span
                key={num}
                className={`inline-flex items-center justify-center w-6 h-6 rounded text-[10px] font-bold flex-shrink-0 ${
                  num === last
                    ? 'bg-primary text-white'
                    : 'bg-gray-100 dark:bg-gray-800 text-text-light dark:text-text-dark'
                }`}
              >
                {num}
              </span>
            ))}
            {calledNumbers.length > 8 && (
              <span className="text-[10px] text-muted-light dark:text-muted-dark self-center">+{calledNumbers.length - 8}</span>
            )}
          </div>
        )}
      </button>

      {open && (
        <div className="fixed inset-0 bg-black/50 flex items-end z-50" onClick={() => setOpen(false)}>
          <div
            className="bg-surface-light dark:bg-surface-dark w-full rounded-t-2xl p-4 max-h-[70vh] flex flex-col"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-bold text-base">Histórico · {calledNumbers.length}</h2>
              <button onClick={() => setOpen(false)} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition text-lg">✕</button>
            </div>

            {/* Abas B I N G O */}
            <div className="flex gap-1 mb-3">
              {COLUMNS.map((col, i) => {
                const count = groups[col.letter].length;
                return (
                  <button
                    key={col.letter}
                    onClick={() => setActiveCol(i)}
                    className={`flex-1 py-2 rounded-lg font-bold text-sm transition ${
                      i === activeCol
                        ? 'bg-primary text-white shadow-md'
                        : count > 0
                          ? 'bg-gray-100 dark:bg-gray-800 text-text-light dark:text-text-dark'
                          : 'bg-gray-100 dark:bg-gray-800 text-gray-300 dark:text-gray-600'
                    }`}
                  >
                    {col.letter}
                    {count > 0 && <span className="ml-0.5 text-[10px] opacity-70">{count}</span>}
                  </button>
                );
              })}
            </div>

            {/* Números da coluna ativa */}
            <div className="flex-1 overflow-y-auto">
              <p className="text-xs text-muted-light dark:text-muted-dark mb-2">
                {COLUMNS[activeCol].letter}: {COLUMNS[activeCol].min} a {COLUMNS[activeCol].max}
              </p>
              {groups[COLUMNS[activeCol].letter].length === 0 ? (
                <p className="text-sm text-muted-light dark:text-muted-dark py-4 text-center">Nenhum número marcado nesta coluna.</p>
              ) : (
                <div className="grid grid-cols-5 gap-2">
                  {groups[COLUMNS[activeCol].letter].map(num => (
                    <div
                      key={num}
                      className={`h-12 rounded-xl flex items-center justify-center font-bold text-lg ${
                        num === last
                          ? 'bg-primary text-white shadow-md'
                          : 'bg-gray-100 dark:bg-gray-800 text-text-light dark:text-text-dark border border-gray-200 dark:border-gray-700'
                      }`}
                    >
                      {num}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Todos por ordem */}
            <div className="mt-3 pt-3 border-t border-border-light dark:border-border-dark">
              <p className="text-[10px] text-muted-light dark:text-muted-dark mb-1 uppercase tracking-wide">Ordem de marcação</p>
              <div className="flex flex-wrap gap-1">
                {calledNumbers.map((num, i) => (
                  <span
                    key={num}
                    className={`inline-flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold ${
                      i === calledNumbers.length - 1
                        ? 'bg-primary text-white'
                        : 'bg-gray-100 dark:bg-gray-800 text-text-light dark:text-text-dark'
                    }`}
                  >
                    {num}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
