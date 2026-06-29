import { useState, useMemo } from 'react';
import type { Card, CardType, CardCategory, Cell } from '../types';
import { createEmptyGrid, generateCardId, validateCard } from '../utils/game';

interface Props {
  onSave: (card: Card) => void;
  onCancel: () => void;
  editCard?: Card;
}

const COLUMNS_75 = [
  { letter: 'B', min: 1, max: 15 },
  { letter: 'I', min: 16, max: 30 },
  { letter: 'N', min: 31, max: 45 },
  { letter: 'G', min: 46, max: 60 },
  { letter: 'O', min: 61, max: 75 },
];

type Step = 'info' | 'pick' | 'review';

function transpose5x5Selections(colSelections: number[][]): Cell[][] {
  const grid: Cell[][] = Array.from({ length: 5 }, () =>
    Array.from({ length: 5 }, () => ({ value: null, marked: 'none' as const }))
  );
  for (let col = 0; col < 5; col++) {
    const sorted = [...colSelections[col]].sort((a, b) => a - b);
    for (let row = 0; row < sorted.length && row < 5; row++) {
      grid[row][col] = { value: sorted[row], marked: 'none' };
    }
  }
  return grid;
}

export function CardForm({ onSave, onCancel, editCard }: Props) {
  const [name, setName] = useState(editCard?.name ?? '');
  const [type, setType] = useState<CardType>(editCard?.type ?? '75');
  const [category, setCategory] = useState<CardCategory>(editCard?.category ?? 'regular');
  const [freeCenter, setFreeCenter] = useState(editCard?.freeCenter ?? false);

  const initialSelections = useMemo(() => {
    if (editCard && editCard.type === '75') {
      const sels: number[][] = [[], [], [], [], []];
      for (let col = 0; col < 5; col++) {
        for (let row = 0; row < 5; row++) {
          const v = editCard.grid[row][col].value;
          if (v !== null) sels[col].push(v);
        }
      }
      return sels;
    }
    return [[], [], [], [], []];
  }, [editCard]);

  const [colSelections, setColSelections] = useState<number[][]>(initialSelections);
  const [activeCol, setActiveCol] = useState(0);

  const [grid90, setGrid90] = useState<Cell[][]>(
    editCard?.type === '90' ? editCard.grid : createEmptyGrid('90', false)
  );

  const [step, setStep] = useState<Step>(editCard ? 'review' : 'info');
  const [errors, setErrors] = useState<string[]>([]);

  const maxPerCol = (colIdx: number) =>
    freeCenter && colIdx === 2 ? 4 : 5;

  function handleTypeChange(newType: CardType) {
    setType(newType);
    setFreeCenter(false);
    setColSelections([[], [], [], [], []]);
    setGrid90(createEmptyGrid('90', false));
    setStep('info');
  }

  function toggleNumber(colIdx: number, num: number) {
    setColSelections(prev => {
      const col = [...prev[colIdx]];
      const idx = col.indexOf(num);
      if (idx >= 0) {
        col.splice(idx, 1);
      } else {
        if (col.length >= maxPerCol(colIdx)) return prev;
        col.push(num);
      }
      const next = [...prev];
      next[colIdx] = col;
      return next;
    });
  }

  function isColComplete(colIdx: number): boolean {
    return colSelections[colIdx].length === maxPerCol(colIdx);
  }

  function allColsComplete(): boolean {
    return COLUMNS_75.every((_, i) => isColComplete(i));
  }

  function goToReview() {
    if (!name.trim()) {
      setErrors(['O nome da cartela é obrigatório']);
      return;
    }
    if (type === '75' && !allColsComplete()) {
      setErrors(['Preencha todas as colunas antes de continuar']);
      return;
    }
    setErrors([]);
    setStep('review');
  }

  function buildCard(): Card {
    let grid: Cell[][];
    if (type === '75') {
      grid = transpose5x5Selections(colSelections);
      if (freeCenter) {
        grid[2][2] = { value: null, marked: 'free' };
      }
    } else {
      grid = grid90;
    }

    return {
      id: editCard?.id ?? generateCardId(),
      name: name.trim(),
      type,
      category,
      freeCenter,
      grid,
      createdAt: editCard?.createdAt ?? Date.now(),
    };
  }

  function handleSubmit() {
    const card = buildCard();
    const validationErrors = validateCard(card);
    if (validationErrors.length > 0) {
      setErrors(validationErrors);
      return;
    }
    setErrors([]);
    onSave(card);
  }

  function handleCellChange90(row: number, col: number, raw: string) {
    const value = raw === '' ? null : parseInt(raw, 10);
    if (raw !== '' && isNaN(value!)) return;
    setGrid90(prev =>
      prev.map((r, ri) =>
        r.map((c, ci) =>
          ri === row && ci === col ? { ...c, value } : c
        )
      )
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-surface-light dark:bg-surface-dark rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-surface-light dark:bg-surface-dark border-b border-border-light dark:border-border-dark p-4 rounded-t-2xl z-10">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold">
              {editCard ? 'Editar Cartela' : 'Nova Cartela'}
            </h2>
            <button
              onClick={onCancel}
              className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition text-lg"
            >
              ✕
            </button>
          </div>
          {/* Steps indicator (75 only) */}
          {type === '75' && (
            <div className="flex gap-1 mt-3">
              {(['info', 'pick', 'review'] as Step[]).map((s, i) => (
                <div
                  key={s}
                  className={`h-1 flex-1 rounded-full transition-colors ${
                    i <= ['info', 'pick', 'review'].indexOf(step)
                      ? 'bg-primary'
                      : 'bg-gray-200 dark:bg-gray-700'
                  }`}
                />
              ))}
            </div>
          )}
        </div>

        <div className="p-4">
          {/* STEP 1: Info */}
          {step === 'info' && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Nome / Apelido</label>
                <input
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="Ex: Cartela da Vó, João 1"
                  className="w-full px-3 py-2.5 border border-border-light dark:border-border-dark rounded-lg bg-transparent focus:outline-none focus:ring-2 focus:ring-primary text-base"
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Categoria</label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setCategory('regular')}
                    className={`flex-1 px-4 py-2.5 rounded-lg font-medium transition text-sm ${
                      category === 'regular'
                        ? 'bg-primary text-white'
                        : 'bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600'
                    }`}
                  >
                    Regular
                  </button>
                  <button
                    type="button"
                    onClick={() => setCategory('extra')}
                    className={`flex-1 px-4 py-2.5 rounded-lg font-medium transition text-sm ${
                      category === 'extra'
                        ? 'bg-extra text-white'
                        : 'bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600'
                    }`}
                  >
                    Extra
                  </button>
                </div>
                {category === 'extra' && (
                  <p className="mt-1.5 text-xs text-muted-light dark:text-muted-dark">
                    Cartelas extras competem em categoria separada com seus próprios prêmios.
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Tipo</label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => handleTypeChange('75')}
                    className={`flex-1 px-4 py-2.5 rounded-lg font-medium transition text-sm ${
                      type === '75'
                        ? 'bg-primary text-white'
                        : 'bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600'
                    }`}
                  >
                    75 pedras (5×5)
                  </button>
                  <button
                    type="button"
                    onClick={() => handleTypeChange('90')}
                    className={`flex-1 px-4 py-2.5 rounded-lg font-medium transition text-sm ${
                      type === '90'
                        ? 'bg-primary text-white'
                        : 'bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600'
                    }`}
                  >
                    90 pedras (3×9)
                  </button>
                </div>
              </div>

              {type === '75' && (
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={freeCenter}
                    onChange={e => {
                      setFreeCenter(e.target.checked);
                      if (e.target.checked && colSelections[2].length > 4) {
                        setColSelections(prev => {
                          const next = [...prev];
                          next[2] = prev[2].slice(0, 4);
                          return next;
                        });
                      }
                    }}
                    className="w-4 h-4 accent-primary"
                  />
                  <span className="text-sm font-medium">Centro FREE (espaço livre no meio)</span>
                </label>
              )}

              {errors.length > 0 && (
                <div className="p-3 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 rounded-lg text-sm">
                  {errors.map((err, i) => <p key={i}>{err}</p>)}
                </div>
              )}

              <div className="flex gap-3 justify-end pt-2">
                <button onClick={onCancel} className="px-4 py-2 rounded-lg border border-border-light dark:border-border-dark hover:bg-gray-100 dark:hover:bg-gray-700 transition text-sm">
                  Cancelar
                </button>
                {type === '75' ? (
                  <button
                    onClick={() => {
                      if (!name.trim()) { setErrors(['O nome da cartela é obrigatório']); return; }
                      setErrors([]);
                      setStep('pick');
                    }}
                    className="px-6 py-2 rounded-lg bg-primary text-white font-medium hover:bg-primary-dark transition text-sm"
                  >
                    Próximo →
                  </button>
                ) : (
                  <button
                    onClick={() => goToReview()}
                    className="px-6 py-2 rounded-lg bg-primary text-white font-medium hover:bg-primary-dark transition text-sm"
                  >
                    Próximo →
                  </button>
                )}
              </div>
            </div>
          )}

          {/* STEP 2: Pick numbers column by column (75 only) */}
          {step === 'pick' && type === '75' && (
            <div className="space-y-4">
              {/* Column tabs */}
              <div className="flex gap-1">
                {COLUMNS_75.map((col, i) => {
                  const complete = isColComplete(i);
                  const active = i === activeCol;
                  return (
                    <button
                      key={col.letter}
                      onClick={() => setActiveCol(i)}
                      className={`flex-1 py-2 rounded-lg font-bold text-lg transition relative ${
                        active
                          ? 'bg-primary text-white shadow-md'
                          : complete
                            ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                            : 'bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600'
                      }`}
                    >
                      {col.letter}
                      {complete && !active && (
                        <span className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full flex items-center justify-center text-white text-[10px]">✓</span>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Selection info */}
              <div className="text-center">
                <p className="text-sm text-muted-light dark:text-muted-dark">
                  Coluna <span className="font-bold text-primary text-lg">{COLUMNS_75[activeCol].letter}</span>
                  {' '}— números {COLUMNS_75[activeCol].min} a {COLUMNS_75[activeCol].max}
                </p>
                <p className="text-xs text-muted-light dark:text-muted-dark mt-0.5">
                  {colSelections[activeCol].length} de {maxPerCol(activeCol)} selecionados
                  {freeCenter && activeCol === 2 && ' (1 é FREE)'}
                </p>
              </div>

              {/* Number grid */}
              <div className="grid grid-cols-5 gap-2 max-w-xs mx-auto">
                {Array.from({ length: 15 }, (_, i) => {
                  const num = COLUMNS_75[activeCol].min + i;
                  const selected = colSelections[activeCol].includes(num);
                  const colFull = isColComplete(activeCol);
                  return (
                    <button
                      key={num}
                      onClick={() => toggleNumber(activeCol, num)}
                      className={`h-12 rounded-xl font-bold text-lg transition-all ${
                        selected
                          ? 'bg-primary text-white shadow-md scale-105'
                          : colFull
                            ? 'bg-gray-100 dark:bg-gray-800 text-gray-300 dark:text-gray-600 cursor-not-allowed'
                            : 'bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-text-light dark:text-text-dark'
                      }`}
                    >
                      {num}
                    </button>
                  );
                })}
              </div>

              {/* Selected numbers preview */}
              {colSelections[activeCol].length > 0 && (
                <div className="flex items-center justify-center gap-2 flex-wrap">
                  <span className="text-xs text-muted-light dark:text-muted-dark">Selecionados:</span>
                  {[...colSelections[activeCol]].sort((a, b) => a - b).map(n => (
                    <span
                      key={n}
                      onClick={() => toggleNumber(activeCol, n)}
                      className="inline-flex items-center justify-center w-9 h-9 rounded-full bg-primary text-white text-sm font-bold cursor-pointer hover:bg-red-500 transition"
                      title="Clique para remover"
                    >
                      {n}
                    </span>
                  ))}
                </div>
              )}

              {/* Navigation */}
              <div className="flex gap-3 justify-between pt-2">
                <button
                  onClick={() => {
                    if (activeCol > 0) setActiveCol(activeCol - 1);
                    else setStep('info');
                  }}
                  className="px-4 py-2 rounded-lg border border-border-light dark:border-border-dark hover:bg-gray-100 dark:hover:bg-gray-700 transition text-sm"
                >
                  ← Voltar
                </button>
                <div className="flex gap-2">
                  {activeCol < 4 && isColComplete(activeCol) && (
                    <button
                      onClick={() => setActiveCol(activeCol + 1)}
                      className="px-4 py-2 rounded-lg bg-green-500 text-white font-medium hover:bg-green-600 transition text-sm"
                    >
                      {COLUMNS_75[activeCol + 1].letter} →
                    </button>
                  )}
                  {allColsComplete() && (
                    <button
                      onClick={() => { setErrors([]); setStep('review'); }}
                      className="px-6 py-2 rounded-lg bg-primary text-white font-medium hover:bg-primary-dark transition text-sm"
                    >
                      Revisar ✓
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* STEP 3 (or 2 for 90): Review */}
          {step === 'review' && (
            <div className="space-y-4">
              {type === '75' && (() => {
                const grid = transpose5x5Selections(colSelections);
                if (freeCenter) grid[2][2] = { value: null, marked: 'free' };
                return (
                  <div>
                    <p className="text-sm font-medium mb-2 text-center">
                      Pré-visualização — <span className="font-bold">{name}</span>
                      {category === 'extra' && <span className="ml-2 px-2 py-0.5 rounded-full bg-extra/20 text-extra-dark dark:text-extra text-xs font-bold">EXTRA</span>}
                    </p>
                    <table className="mx-auto border-collapse">
                      <thead>
                        <tr>
                          {['B', 'I', 'N', 'G', 'O'].map(h => (
                            <th key={h} className="w-14 h-8 text-center font-bold text-primary text-lg">{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {grid.map((row, r) => (
                          <tr key={r}>
                            {row.map((cell, c) => (
                              <td key={c} className="p-0.5">
                                <div className={`w-14 h-14 flex items-center justify-center rounded-lg font-mono text-lg font-bold ${
                                  cell.marked === 'free'
                                    ? 'bg-primary/20 text-primary'
                                    : 'bg-gray-100 dark:bg-gray-800'
                                }`}>
                                  {cell.marked === 'free' ? '★' : cell.value ?? ''}
                                </div>
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                );
              })()}

              {type === '90' && (
                <div>
                  <p className="text-sm font-medium mb-2">Preencha os números (1–90). Deixe vazio as células sem número.</p>
                  <div className="overflow-x-auto">
                    <table className="mx-auto border-collapse">
                      <tbody>
                        {grid90.map((row, r) => (
                          <tr key={r}>
                            {row.map((cell, c) => (
                              <td key={c} className="p-0.5">
                                <input
                                  type="number"
                                  min={1}
                                  max={90}
                                  value={cell.value ?? ''}
                                  onChange={e => handleCellChange90(r, c, e.target.value)}
                                  className="w-12 h-12 text-center text-base font-mono border border-border-light dark:border-border-dark rounded-lg bg-transparent focus:outline-none focus:ring-2 focus:ring-primary"
                                />
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {errors.length > 0 && (
                <div className="p-3 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 rounded-lg text-sm">
                  {errors.map((err, i) => <p key={i}>{err}</p>)}
                </div>
              )}

              <div className="flex gap-3 justify-between pt-2">
                <button
                  onClick={() => setStep(type === '75' ? 'pick' : 'info')}
                  className="px-4 py-2 rounded-lg border border-border-light dark:border-border-dark hover:bg-gray-100 dark:hover:bg-gray-700 transition text-sm"
                >
                  ← Voltar
                </button>
                <button
                  onClick={handleSubmit}
                  className={`px-6 py-2 rounded-lg text-white font-medium transition text-sm ${
                    category === 'extra'
                      ? 'bg-extra hover:bg-extra-dark'
                      : 'bg-primary hover:bg-primary-dark'
                  }`}
                >
                  {editCard ? 'Salvar' : 'Criar Cartela'} ✓
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
