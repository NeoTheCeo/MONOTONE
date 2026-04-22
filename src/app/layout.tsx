import type { Metadata } from 'next';
import './globals.css';
import { Playfair_Display, Source_Sans_3 } from 'next/font/google';

const playfair = Playfair_Display({ 
  subsets: ['latin'],
  variable: '--font-display',
  display: 'swap',
});

const sourceSans = Source_Sans_3({
  subsets: ['latin'],
  variable: '--font-body',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'African Archive Radio | Rediscover African Sound',
  description: 'Curated streaming platform showcasing African music from Internet Archive',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${playfair.variable} ${sourceSans.variable}`}>
      <body className="bg-background text-text font-body antialiased min-h-screen">
        {children}
      </body>
    </html>
  );
}