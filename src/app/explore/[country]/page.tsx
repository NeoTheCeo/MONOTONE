import Header from '@/components/Header';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

interface PageProps {
  params: { country: string };
}

export default function CountryPage({ params }: PageProps) {
  const country = decodeURIComponent(params.country);

  return (
    <>
      <Header />
      <main className="min-h-screen pb-32">
        <section className="py-12 px-4">
          <div className="max-w-6xl mx-auto">
            <div className="flex items-center gap-4 mb-8">
              <Link href="/explore" className="text-text-muted hover:text-primary">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </Link>
              <div>
                <h2 className="font-display text-3xl font-bold">{country}</h2>
                <p className="text-text-muted">No tracks available yet</p>
              </div>
            </div>
            <div className="text-center py-16">
              <p className="text-text-muted">
                Tracks from {country} are being ingested. Check back soon!
              </p>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
