import type { Metadata } from 'next';
import { Fraunces, Inter } from 'next/font/google';
import './globals.css';

const display = Fraunces({ subsets: ['latin'], weight: ['500', '700', '900'], variable: '--font-display' });
const body    = Inter({ subsets: ['latin'], weight: ['400', '500', '600', '700'], variable: '--font-body' });

export const metadata: Metadata = {
  title: 'Snifff — The pet social & dating super-app',
  description: 'Match pets. Make friends. Find playdates, breeding partners, and adoptable animals — all in one app.',
  openGraph: {
    title: 'Snifff', description: 'The home page of pet life.',
    type: 'website', url: 'https://snifff.app',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${display.variable} ${body.variable}`}>
      <body className="font-body">{children}</body>
    </html>
  );
}
