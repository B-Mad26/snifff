// Admin overview — key metrics, queue depth, alerts.
export default function Overview() {
  const stats = [
    { l: 'DAU',                v: '124,302', delta: '+8.4%' },
    { l: 'New users (24h)',    v: '8,914',   delta: '+11%'  },
    { l: 'Matches (24h)',      v: '52,180',  delta: '+6%'   },
    { l: 'Open reports',       v: '83',      delta: '-12%'  },
    { l: 'Paid subscribers',   v: '14,820',  delta: '+3%'   },
    { l: 'MRR',                v: '$148,200', delta: '+5%'  },
  ];
  return (
    <div>
      <h1 className="text-3xl font-black">Overview</h1>
      <div className="mt-2 text-sm text-ink/60">Last 24h · auto-refreshes every 5 min</div>
      <div className="mt-8 grid gap-4 md:grid-cols-3">
        {stats.map(s => (
          <div key={s.l} className="rounded-xl border border-ink/10 bg-white p-6">
            <div className="text-xs uppercase tracking-wider text-ink/50">{s.l}</div>
            <div className="mt-2 text-3xl font-black">{s.v}</div>
            <div className={`mt-1 text-xs font-semibold ${s.delta.startsWith('-') ? 'text-coral' : 'text-green'}`}>{s.delta}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
