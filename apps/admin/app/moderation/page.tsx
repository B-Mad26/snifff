async function getQueue() {
  // TODO: protect with admin JWT; for now demo data
  return [
    { id: 'r_001', targetKind: 'POST',    reason: 'NUDITY',         aiScore: 0.94, createdAt: new Date().toISOString(), reporter: 'u_abc' },
    { id: 'r_002', targetKind: 'MESSAGE', reason: 'HARASSMENT',     aiScore: 0.81, createdAt: new Date().toISOString(), reporter: 'u_def' },
    { id: 'r_003', targetKind: 'PET',     reason: 'ANIMAL_ABUSE',   aiScore: 0.97, createdAt: new Date().toISOString(), reporter: 'u_ghi' },
    { id: 'r_004', targetKind: 'USER',    reason: 'FAKE',           aiScore: 0.72, createdAt: new Date().toISOString(), reporter: 'u_jkl' },
  ];
}

export default async function ModerationPage() {
  const q = await getQueue();
  return (
    <div>
      <h1 className="text-3xl font-black">Moderation queue</h1>
      <div className="mt-2 text-sm text-ink/60">AI-triaged · sorted by severity</div>
      <table className="mt-8 w-full overflow-hidden rounded-xl border border-ink/10 bg-white">
        <thead className="bg-ink text-left text-xs uppercase tracking-widest text-white">
          <tr><th className="p-4">ID</th><th>Target</th><th>Reason</th><th>AI Score</th><th>Reporter</th><th>Action</th></tr>
        </thead>
        <tbody>
          {q.map(r => (
            <tr key={r.id} className="border-t border-ink/5 text-sm">
              <td className="p-4 font-mono">{r.id}</td>
              <td>{r.targetKind}</td>
              <td>{r.reason}</td>
              <td><span className={`rounded px-2 py-1 text-xs font-bold ${r.aiScore >= 0.9 ? 'bg-coral text-white' : 'bg-gold/20 text-gold'}`}>{(r.aiScore * 100).toFixed(0)}</span></td>
              <td className="font-mono text-xs">{r.reporter}</td>
              <td className="space-x-2">
                <button className="rounded bg-coral px-3 py-1 text-xs font-semibold text-white">Remove</button>
                <button className="rounded border border-ink/10 px-3 py-1 text-xs font-semibold">Dismiss</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
