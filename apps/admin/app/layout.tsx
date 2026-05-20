import './globals.css';

export const metadata = { title: 'Snifff Admin' };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <div className="flex min-h-screen">
          <aside className="w-60 bg-ink p-6 text-white">
            <div className="font-black text-coral text-2xl tracking-widest">SNIFFF</div>
            <div className="mt-1 text-xs uppercase tracking-widest opacity-50">Admin</div>
            <nav className="mt-10 space-y-1 text-sm">
              <a className="block rounded px-3 py-2 hover:bg-white/10" href="/">Overview</a>
              <a className="block rounded px-3 py-2 hover:bg-white/10" href="/moderation">Moderation</a>
              <a className="block rounded px-3 py-2 hover:bg-white/10" href="/users">Users</a>
              <a className="block rounded px-3 py-2 hover:bg-white/10" href="/breeders">Breeders</a>
              <a className="block rounded px-3 py-2 hover:bg-white/10" href="/subscriptions">Subscriptions</a>
              <a className="block rounded px-3 py-2 hover:bg-white/10" href="/reports">Reports</a>
            </nav>
          </aside>
          <main className="flex-1 p-10">{children}</main>
        </div>
      </body>
    </html>
  );
}
