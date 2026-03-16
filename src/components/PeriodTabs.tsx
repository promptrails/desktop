const periods = [
  { value: 1, label: "1D" },
  { value: 7, label: "7D" },
  { value: 30, label: "30D" },
];

interface PeriodTabsProps {
  value: number;
  onChange: (days: number) => void;
}

export function PeriodTabs({ value, onChange }: PeriodTabsProps) {
  return (
    <div className="flex gap-1">
      {periods.map((p) => (
        <button
          key={p.value}
          onClick={() => onChange(p.value)}
          className={`rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${
            value === p.value
              ? "bg-primary text-primary-foreground"
              : "text-muted-foreground hover:bg-accent"
          }`}
        >
          {p.label}
        </button>
      ))}
    </div>
  );
}
