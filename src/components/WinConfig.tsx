import type { WinRule } from '../types';

interface Props {
  winRule: WinRule;
  onChange: (rule: WinRule) => void;
}

export function WinConfig({ winRule, onChange }: Props) {
  function toggle(key: keyof WinRule) {
    onChange({ ...winRule, [key]: !winRule[key] });
  }

  const options: { key: keyof WinRule; label: string }[] = [
    { key: 'row', label: 'Linha' },
    { key: 'column', label: 'Coluna' },
    { key: 'full', label: 'Cheia' },
  ];

  return (
    <div className="bg-surface-light dark:bg-surface-dark rounded-xl border border-border-light dark:border-border-dark p-3 shadow-sm">
      <h3 className="font-bold text-xs mb-2 text-muted-light dark:text-muted-dark uppercase tracking-wide">Vitória</h3>
      <div className="flex gap-1.5">
        {options.map(opt => (
          <button
            key={opt.key}
            onClick={() => toggle(opt.key)}
            className={`flex-1 px-2 py-1.5 rounded-lg text-xs font-medium transition ${
              winRule[opt.key]
                ? 'bg-primary text-white'
                : 'bg-gray-100 dark:bg-gray-800 text-muted-light dark:text-muted-dark hover:bg-gray-200 dark:hover:bg-gray-700'
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  );
}
