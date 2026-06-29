import { useRef, useState } from 'react';
import type { AppSettings, Card } from '../types';

interface Props {
  settings: AppSettings;
  cards: Card[];
  onChange: (settings: AppSettings) => void;
  onImport: (cards: Card[]) => void;
  onClose: () => void;
}

export function Settings({ settings, cards, onChange, onImport, onClose }: Props) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [importMsg, setImportMsg] = useState('');

  function handleExport() {
    const data = JSON.stringify(cards, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `bingoo-cartelas-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function handleImport(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = JSON.parse(reader.result as string);
        if (!Array.isArray(parsed)) throw new Error('Formato inválido');
        const imported = parsed.map((c: Card) => ({
          ...c,
          category: c.category ?? 'regular',
        })) as Card[];
        onImport(imported);
        setImportMsg(`${imported.length} cartela(s) importada(s)!`);
        setTimeout(() => setImportMsg(''), 3000);
      } catch {
        setImportMsg('Erro: arquivo inválido');
        setTimeout(() => setImportMsg(''), 3000);
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-surface-light dark:bg-surface-dark rounded-2xl shadow-xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold">Configurações</h2>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition text-lg">✕</button>
        </div>

        <div className="space-y-5">
          {/* Tema */}
          <div>
            <label className="block text-sm font-medium mb-2">Tema</label>
            <div className="flex gap-2">
              {([
                { value: 'light' as const, label: '☀️ Claro' },
                { value: 'dark' as const, label: '🌙 Escuro' },
                { value: 'system' as const, label: '💻 Sistema' },
              ]).map(opt => (
                <button
                  key={opt.value}
                  onClick={() => onChange({ ...settings, theme: opt.value })}
                  className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition ${
                    settings.theme === opt.value
                      ? 'bg-primary text-white'
                      : 'bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Som */}
          <div>
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={settings.soundEnabled}
                onChange={e => onChange({ ...settings, soundEnabled: e.target.checked })}
                className="w-4 h-4 accent-primary"
              />
              <div>
                <span className="font-medium text-sm">Sons</span>
                <p className="text-xs text-gray-400 dark:text-gray-500">
                  Efeitos ao marcar pedra, desfazer e BINGO
                </p>
              </div>
            </label>
          </div>

          {/* Marcações */}
          <div>
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={settings.differentiateMarks}
                onChange={e => onChange({ ...settings, differentiateMarks: e.target.checked })}
                className="w-4 h-4 accent-primary"
              />
              <div>
                <span className="font-medium text-sm">Diferenciar marcações</span>
                <p className="text-xs text-gray-400 dark:text-gray-500">
                  Sorteada = <span className="text-marked-called font-bold">verde</span>, Manual = <span className="text-marked-manual font-bold">azul</span>
                </p>
              </div>
            </label>
          </div>

          {/* Importar / Exportar */}
          <div className="border-t border-border-light dark:border-border-dark pt-4">
            <label className="block text-sm font-medium mb-2">Cartelas</label>
            <div className="flex gap-2">
              <button
                onClick={handleExport}
                disabled={cards.length === 0}
                className="flex-1 px-3 py-2 rounded-lg border border-border-light dark:border-border-dark hover:bg-gray-100 dark:hover:bg-gray-700 transition text-sm disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Exportar ({cards.length})
              </button>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="flex-1 px-3 py-2 rounded-lg border border-border-light dark:border-border-dark hover:bg-gray-100 dark:hover:bg-gray-700 transition text-sm"
              >
                Importar
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept=".json"
                onChange={handleImport}
                className="hidden"
              />
            </div>
            {importMsg && (
              <p className={`mt-2 text-xs font-medium ${importMsg.startsWith('Erro') ? 'text-red-500' : 'text-green-500'}`}>
                {importMsg}
              </p>
            )}
            <p className="mt-1.5 text-xs text-gray-400 dark:text-gray-500">
              Exporta/importa todas as cartelas como arquivo JSON.
            </p>
          </div>
        </div>

        <div className="mt-6 hidden sm:flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2 rounded-lg bg-primary text-white font-medium hover:bg-primary-dark transition"
          >
            Fechar
          </button>
        </div>

        {/* Rodapé */}
        <div className="mt-4 pt-3 border-t border-border-light dark:border-border-dark text-center">
          <p className="text-[10px] text-muted-light dark:text-muted-dark mb-1.5">Bing<span className="text-[8px]">🎱</span>o Cartelas · v1.0.0</p>
          <div className="flex items-center justify-center gap-1.5">
            <a href="https://www.squad4tech.com.br/" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 hover:opacity-80 transition" style={{ fontFamily: 'Sora, system-ui, sans-serif' }}>
              <span className="font-black text-xs" style={{ background: 'linear-gradient(135deg, #0D8CFF, #7B3CFF)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>&lt;4&gt;</span>
              <span className="font-bold text-[10px] tracking-wider"><span style={{ color: '#0D8CFF' }}>SQUAD</span><span style={{ background: 'linear-gradient(135deg, #4AB6FF, #D946EF)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>4</span><span style={{ color: '#7B3CFF' }}>TECH</span></span>
            </a>
            <span className="text-[9px] text-gray-400 dark:text-gray-600">· 66.661.864/0001-62 · Todos os direitos reservados · Uso livre</span>
          </div>
        </div>
      </div>
    </div>
  );
}
