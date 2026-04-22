import { Suspense } from 'react';
import Header from '@/components/Header';
import TrackList from '@/components/TrackList';
import { getTracks } from '@/lib/pb';

// Force dynamic rendering (no static generation)
export const dynamic = 'force-dynamic';

async function TrackSection() {
  try {
    const tracks = await getTracks(true);
    return (
      <>
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-display text-2xl font-bold">Latest Tracks</h3>
          <span className="text-sm text-text-muted">{tracks.length} tracks available</span>
        </div>

        {tracks.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-20 h-20 rounded-full bg-surface mx-auto mb-4 flex items-center justify-center">
              <svg className="w-10 h-10 text-text-muted" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/>
              </svg>
            </div>
            <h3 className="font-display text-xl font-bold mb-2">No tracks yet</h3>
            <p className="text-text-muted">
              We&apos;re working on ingesting African music from the Internet Archive.
            </p>
          </div>
        ) : (
          <TrackList tracks={tracks} />
        )}
      </>
    );
  } catch (err) {
    console.error('Failed to load tracks:', err);
    return (
      <div className="text-center py-16">
        <p className="text-text-muted">Unable to connect to database. Please try again later.</p>
      </div>
    );
  }
}

export default function Home() {
  return (
    <>
      <Header />
      <main className="min-h-screen pb-32">
        {/* Hero */}
        <section className="relative py-16 px-4 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent" />
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-10 left-10 w-32 h-32 rounded-full bg-primary blur-3xl" />
            <div className="absolute bottom-10 right-10 w-48 h-48 rounded-full bg-accent blur-3xl" />
          </div>
          
          <div className="relative max-w-6xl mx-auto text-center">
            <h2 className="font-display text-4xl md:text-5xl font-bold mb-4">
              Rediscover <span className="text-primary">African Sound</span>
            </h2>
            <p className="text-text-muted text-lg max-w-2xl mx-auto">
              Curated African music from the Internet Archive. 
              Respecting creators, honoring licenses.
            </p>
          </div>
        </section>

        {/* Tracks Grid */}
        <section className="max-w-6xl mx-auto px-4 py-8">
          <Suspense fallback={<div className="text-center py-16">Loading...</div>}>
            <TrackSection />
          </Suspense>
        </section>
      </main>
    </>
  );
}
