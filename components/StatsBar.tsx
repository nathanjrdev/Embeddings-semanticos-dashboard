interface StatItem {
  label: string;
  value: string;
}

export default function StatsBar({ stats }: { stats: StatItem[] }) {
  if (stats.length === 0) return null;

  return (
    <div className="glass-panel px-6 py-4 grid grid-cols-2 md:grid-cols-4 gap-4 animate-fade-in">
      {stats.map((stat) => (
        <div key={stat.label} className="flex flex-col gap-1">
          <span className="label-eyebrow">{stat.label}</span>
          <span className="text-xl font-mono text-base-50">{stat.value}</span>
        </div>
      ))}
    </div>
  );
}
