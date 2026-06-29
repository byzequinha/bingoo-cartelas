import { useState } from 'react';

interface Props {
  calledNumbers: number[];
  maxNumber: number;
  onCall: (num: number) => void;
  onUndo: () => void;
  onReset: () => void;
}

export function CalledNumberPanel({ calledNumbers, maxNumber, onCall, onUndo, onReset }: Props) {
  const [input, setInput] = useState('');
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [error, setError] = useState('');

  function submit() {
    const num = parseInt(input, 10);
    if (isNaN(num) || num < 1 || num > maxNumber) {
      setError(`Número inválido`);
      setTimeout(() => setError(''), 1500);
      return;
    }
    if (calledNumbers.includes(num)) {
      setError(`${num} já marcado`);
      setTimeout(() => setError(''), 1500);
      return;
    }
    onCall(num);
    setInput('');
    setError('');
  }

  function handleNumPadClick(n: number) {
    setError('');
    const next = input + n.toString();
    const num = parseInt(next, 10);
    if (num > maxNumber) return;
    setInput(next);
  }

  function handleClear() {
    setInput('');
    setError('');
  }

  function handleBackspace() {
    setInput(prev => prev.slice(0, -1));
    setError('');
  }

  const lastCalled = calledNumbers.length > 0 ? calledNumbers[calledNumbers.length - 1] : null;

  return (
    <div className="bg-surface-light dark:bg-surface-dark rounded-xl border border-border-light dark:border-border-dark p-3 shadow-sm">
      {/* Display */}
      <div className="flex items-center gap-2 mb-2">
        {lastCalled !== null && (
          <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white text-base font-bold shadow-md">
            {lastCalled}
          </div>
        )}
        <div
          className={`flex-1 min-h-[40px] flex items-center justify-center rounded-lg border-2 font-mono text-xl font-bold transition-colors ${
            error
              ? 'border-red-400 bg-red-50 dark:bg-red-950/20 text-red-500'
              : input
                ? 'border-primary bg-primary/5 text-text-light dark:text-text-dark'
                : 'border-border-light dark:border-border-dark text-muted-light dark:text-muted-dark'
          }`}
        >
          {error || input || `1 – ${maxNumber}`}
        </div>
      </div>

      {/* Numpad */}
      <div className="grid grid-cols-4 gap-1.5 mb-2">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(n => (
          <button
            key={n}
            onClick={() => handleNumPadClick(n)}
            className="h-10 rounded-lg bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 font-bold text-base shadow-sm hover:bg-gray-200 dark:hover:bg-gray-700 active:bg-gray-300 dark:active:bg-gray-600 active:shadow-none transition"
          >
            {n}
          </button>
        ))}
        <button
          onClick={handleClear}
          className="h-10 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-300 dark:border-red-700 text-red-600 dark:text-red-400 font-bold text-xs shadow-sm hover:bg-red-100 dark:hover:bg-red-800/30 active:bg-red-200 active:shadow-none transition"
        >
          C
        </button>
        <button
          onClick={() => handleNumPadClick(0)}
          className="h-10 rounded-lg bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 font-bold text-base shadow-sm hover:bg-gray-200 dark:hover:bg-gray-700 active:bg-gray-300 dark:active:bg-gray-600 active:shadow-none transition"
        >
          0
        </button>
        <button
          onClick={handleBackspace}
          className="h-10 rounded-lg bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 font-bold text-base shadow-sm hover:bg-gray-200 dark:hover:bg-gray-700 active:bg-gray-300 dark:active:bg-gray-600 active:shadow-none transition"
        >
          ←
        </button>
      </div>

      {/* Marcar */}
      <button
        onClick={submit}
        disabled={!input}
        className="w-full py-2 rounded-lg bg-primary text-white font-bold text-sm hover:bg-primary-dark active:bg-blue-800 transition disabled:opacity-40 disabled:cursor-not-allowed mb-2"
      >
        Marcar
      </button>

      {/* Desfazer / Reiniciar */}
      <div className="grid grid-cols-2 gap-1.5">
        <button
          onClick={onUndo}
          disabled={calledNumbers.length === 0}
          className="px-2 py-1.5 rounded-lg border border-border-light dark:border-border-dark hover:bg-gray-100 dark:hover:bg-gray-700 transition disabled:opacity-40 disabled:cursor-not-allowed text-xs truncate"
        >
          ↩ Desfazer
        </button>
        {!showResetConfirm ? (
          <button
            onClick={() => setShowResetConfirm(true)}
            disabled={calledNumbers.length === 0}
            className="px-2 py-1.5 rounded-lg border border-red-300 dark:border-red-800 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition disabled:opacity-40 disabled:cursor-not-allowed text-xs truncate"
          >
            Reiniciar
          </button>
        ) : (
          <button
            onClick={() => { onReset(); setShowResetConfirm(false); }}
            className="px-2 py-1.5 rounded-lg bg-red-500 text-white font-medium hover:bg-red-600 transition text-xs"
          >
            Sim, reiniciar
          </button>
        )}
      </div>
      {showResetConfirm && (
        <button
          onClick={() => setShowResetConfirm(false)}
          className="w-full mt-1 px-2 py-1 rounded-lg border border-border-light dark:border-border-dark hover:bg-gray-100 dark:hover:bg-gray-700 transition text-xs"
        >
          Cancelar
        </button>
      )}
    </div>
  );
}
