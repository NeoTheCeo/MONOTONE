import Link from 'next/link';
import Header from '@/components/Header';

export const dynamic = 'force-dynamic';

async function CountryList() {
  // For now, show static list - will be dynamic in production with PB
  const countries = [
    'Nigeria', 'Ghana', 'Kenya', 'South Africa', 'Egypt', 'Morocco',
    'Algeria', 'Ethiopia', 'Senegal', 'Mali', 'Tanzania', 'Cameroon',
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {countries.map((country) => (
        <Link
          key={country}
          href={`/explore/${encodeURIComponent(country)}`}
          className="card flex items-center justify-between hover:border-primary"
        >
          <span className="font-medium">{country}</span>
          <svg className="w-5 h-5 text-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </Link>
      ))}
    </div>
  );
}

export default function Explore() {
  return (
    <>
      <Header />
      <main className="min-h-screen pb-32">
        <section className="py-12 px-4">
          <div className="max-w-6xl mx-auto">
            <h2 className="font-display text-3xl font-bold mb-2">Explore</h2>
            <p className="text-text-muted mb-8">Browse music by country of origin</p>
            <CountryList />
          </div>
        </section>
      </main>
    </>
  );
}
