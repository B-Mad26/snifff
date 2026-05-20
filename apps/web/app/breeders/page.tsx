async function getBreeders() {
  const r = await fetch(`${process.env.API_BASE_URL ?? 'http://localhost:4000'}/v1/breeders`, { next: { revalidate: 600 } });
  if (!r.ok) return [];
  return r.json();
}

export const metadata = {
  title: 'Verified Breeders Directory · Snifff',
  description: 'Browse Snifff Verified breeders — every kennel cross-checked against AKC/UKC/FCI and community-rated.',
};

export default async function BreedersPage() {
  const breeders = await getBreeders();
  return (
    <main className="mx-auto max-w-6xl px-6 py-12">
      <a href="/" className="font-display text-2xl font-black text-coral">SNIFFF</a>
      <h1 className="mt-8 font-display text-5xl font-black">Verified Breeders</h1>
      <p className="mt-3 text-ink/70 max-w-2xl">Every breeder on this page is Snifff Verified — kennel docs reviewed, registry numbers cross-checked, community-rated.</p>
      <div className="mt-12 grid gap-4 md:grid-cols-3">
        {breeders.map((b: any) => (
          <a key={b.id} href={`/breeders/${b.id}`} className="rounded-2xl border border-ink/10 bg-white p-6 transition hover:shadow-lg">
            <div className="font-display text-2xl font-bold">{b.kennelName}</div>
            <div className="mt-1 text-sm text-ink/60">{b.registry ?? '—'} · ★ {b.rating?.toString() ?? '—'}</div>
            <div className="mt-3 line-clamp-2 text-sm text-ink/80">{b.bio}</div>
          </a>
        ))}
      </div>
    </main>
  );
}
