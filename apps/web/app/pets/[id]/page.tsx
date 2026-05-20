// Public, SSR-rendered pet profile page — SEO goldmine.
// URL: /pets/[id]   → indexed for long-tail searches like "Cavalier King Charles in Austin".

import { notFound } from 'next/navigation';

interface PetPageProps { params: { id: string }; }

async function getPet(id: string) {
  const r = await fetch(`${process.env.API_BASE_URL ?? 'http://localhost:4000'}/v1/pets/${id}`, { next: { revalidate: 300 } });
  if (!r.ok) return null;
  return r.json();
}

export async function generateMetadata({ params }: PetPageProps) {
  const pet = await getPet(params.id);
  if (!pet) return { title: 'Pet · Snifff' };
  return {
    title: `${pet.name} · ${pet.breedPrimary ?? 'Pet'} · Snifff`,
    description: pet.bio ?? `Meet ${pet.name}, a ${pet.breedPrimary ?? pet.species} on Snifff.`,
    openGraph: {
      title: pet.name,
      description: pet.bio,
      images: pet.photos?.[0]?.url ? [pet.photos[0].url] : [],
    },
  };
}

export default async function PetPage({ params }: PetPageProps) {
  const pet = await getPet(params.id);
  if (!pet) notFound();

  return (
    <main className="mx-auto max-w-3xl px-6 py-12">
      <a href="/" className="font-display text-2xl font-black text-coral">SNIFFF</a>
      <div className="mt-8 overflow-hidden rounded-3xl bg-white shadow-xl">
        {pet.photos?.[0]?.url && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={pet.photos[0].url} alt={pet.name} className="h-[440px] w-full object-cover" />
        )}
        <div className="p-8">
          <h1 className="font-display text-5xl font-black">{pet.name}</h1>
          <div className="mt-2 text-ink/70">{pet.breedPrimary ?? pet.species} · {pet.size ?? 'medium'} · {pet.city ?? ''}</div>
          {pet.bio && <p className="mt-6 text-lg leading-relaxed">{pet.bio}</p>}
          <a href="https://snifff.app" className="mt-8 inline-block rounded-full bg-coral px-6 py-3 font-semibold text-white">
            Match with {pet.name} in the app
          </a>
        </div>
      </div>
    </main>
  );
}
