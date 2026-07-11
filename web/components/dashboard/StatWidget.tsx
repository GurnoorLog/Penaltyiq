interface StatWidgetProps {
  icon: string;
  label: string;
  value: string;
  caption: string;
  accentColor: string;
  progress?: number;
}

export function StatWidget({ icon, label, value, caption, accentColor, progress }: StatWidgetProps) {
  return (
    <div className="glass-panel-lg p-4 space-y-2">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs text-[var(--text-muted)] uppercase tracking-wider">{label}</p>
          <p className="text-2xl font-bold mt-1" style={{ color: accentColor }}>{value}</p>
        </div>
        <span className="text-2xl opacity-60">{icon}</span>
      </div>
      {progress !== undefined && (
        <div className="w-full h-1.5 rounded-full bg-[var(--glass)] overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{ width: `${Math.min(100, progress * 100)}%`, backgroundColor: accentColor }}
          />
        </div>
      )}
      <p className="text-xs text-[var(--text-muted)]">{caption}</p>
    </div>
  );
}
