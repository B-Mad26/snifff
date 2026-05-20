import Link from 'next/link';

export default function Landing() {
  return (
    <main>
      {/* HERO */}
      <section className="relative overflow-hidden bg-gradient-to-br from-coral to-peach text-white">
        <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-6">
          <div className="font-display text-3xl font-black tracking-wider">SNIFFF</div>
          <div className="flex gap-2">
            <Link href="/breeders" className="rounded-full px-4 py-2 text-sm hover:bg-white/15">Breeders</Link>
            <Link href="/adoption" className="rounded-full px-4 py-2 text-sm hover:bg-white/15">Adoption</Link>
            <Link href="#download" className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-coral">Get the app</Link>
          </div>
        </nav>

        <div className="mx-auto grid max-w-7xl gap-12 px-6 py-20 md:grid-cols-[1.3fr_1fr] md:py-32">
          <div>
            <h1 className="font-display text-5xl font-black leading-[1.05] md:text-7xl">
              The world&apos;s pets<br/>deserve their own<br/>
              <span className="text-white/80">social network.</span>
            </h1>
            <p className="mt-6 max-w-xl text-lg text-white/90">
              Match pets. Make friends. Find playdates, breeding partners, and adoptable animals — all in one app, with AI matchmaking and a feed that finally puts pets first.
            </p>
            <div id="download" className="mt-10 flex flex-wrap gap-3">
              <a href="#ios" className="rounded-full bg-ink px-6 py-4 font-semibold text-white">Download for iOS</a>
              <a href="#android" className="rounded-full border-2 border-white px-6 py-4 font-semibold">Get it on Android</a>
            </div>
          </div>

          {/* Phone mockup */}
          <div className="relative mx-auto h-[560px] w-[280px] rounded-[36px] bg-ink p-3 shadow-2xl">
            <div className="absolute left-1/2 top-3 z-10 h-5 w-24 -translate-x-1/2 rounded-xl bg-ink" />
            <div className="h-full w-full overflow-hidden rounded-[26px] bg-gradient-to-b from-coral to-peach">
              <div className="relative h-full">
                <div className="absolute right-6 top-6 grid h-14 w-14 place-items-center rounded-full border-4 border-coral bg-white font-display text-lg font-black text-coral">92</div>
                <Paw size={130} className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 fill-white/95" />
                <div className="absolute bottom-0 left-0 right-0 bg-black/55 p-4 text-white backdrop-blur">
                  <div className="font-display text-xl font-bold">Luna · 2y</div>
                  <div className="text-xs opacity-85">Golden Retriever · 0.4 mi · ★ Verified Vet</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* MODES */}
      <section className="mx-auto max-w-7xl px-6 py-24">
        <div className="text-sm font-bold uppercase tracking-widest text-coral">One app · Five modes</div>
        <h2 className="mt-2 font-display text-4xl font-bold md:text-5xl">Whatever your pet needs.</h2>
        <div className="mt-12 grid gap-4 md:grid-cols-5">
          {[
            { t: 'Friends',  d: 'Playdates & friendships', c: 'bg-coral' },
            { t: 'Breeding', d: 'Verified breeders, intact pets', c: 'bg-gold' },
            { t: 'Adoption', d: 'Partner shelters', c: 'bg-green' },
            { t: 'Lost Pet', d: 'Geo-broadcast alerts', c: 'bg-sky' },
            { t: 'Playdate', d: 'Calendar + map meetups', c: 'bg-plum' },
          ].map((m, i) => (
            <div key={m.t} className={`${m.c} rounded-2xl p-6 text-white shadow-lg`}>
              <div className="font-display text-3xl font-black opacity-50">0{i+1}</div>
              <div className="mt-4 font-display text-2xl font-bold">{m.t}</div>
              <div className="mt-2 text-sm opacity-90">{m.d}</div>
            </div>
          ))}
        </div>
      </section>

      {/* STATS */}
      <section className="bg-ink py-24 text-white">
        <div className="mx-auto grid max-w-7xl gap-12 px-6 md:grid-cols-3">
          {[
            { n: '$500B', l: 'Global pet care market by 2030' },
            { n: '76%',   l: 'Millennials say pet > social media' },
            { n: '50M',   l: 'Target pets on Snifff by Year 4' },
          ].map(s => (
            <div key={s.n}>
              <div className="font-display text-6xl font-black text-coral">{s.n}</div>
              <div className="mt-2 text-white/70">{s.l}</div>
            </div>
          ))}
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-ink/10 bg-cream py-12 text-center">
        <div className="font-display text-2xl font-black text-coral">SNIFFF</div>
        <div className="mt-2 text-sm text-ink/60">© 2026 Snifff · hello@snifff.app</div>
      </footer>
    </main>
  );
}

function Paw({ size = 64, className }: { size?: number; className?: string }) {
  return (
    <svg viewBox="0 0 64 64" width={size} height={size} className={className}>
      <ellipse cx="32" cy="42" rx="14" ry="11" />
      <circle cx="16" cy="22" r="6" />
      <circle cx="48" cy="22" r="6" />
      <circle cx="9"  cy="36" r="5" />
      <circle cx="55" cy="36" r="5" />
    </svg>
  );
}
