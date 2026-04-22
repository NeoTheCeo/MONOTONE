import Header from '@/components/Header';

export default function Copyright() {
  return (
    <>
      <Header />
      <main className="min-h-screen pb-32">
        <section className="py-12 px-4">
          <div className="max-w-3xl mx-auto">
            <h2 className="font-display text-3xl font-bold mb-2">حقوق النشر / Copyright</h2>
            <p className="text-text-muted mb-8">Content sourcing and rights information</p>

            <div className="space-y-6 text-text-muted">
              <div className="card">
                <h3 className="font-display text-xl font-bold text-text mb-3">Content Source</h3>
                <p>
                  All music on African Archive Radio is sourced from the 
                  <a 
                    href="https://archive.org" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-primary hover:underline mx-1"
                  >
                    Internet Archive
                  </a>. 
                  We do not host any audio files ourselves - all streaming is done directly from 
                  Archive.org URLs.
                </p>
              </div>

              <div className="card">
                <h3 className="font-display text-xl font-bold text-text mb-3">License Compliance</h3>
                <p className="mb-4">
                  We take intellectual property rights seriously. Our platform only includes tracks that meet 
                  ALL of the following criteria:
                </p>
                <ul className="list-disc list-inside space-y-2 ml-2">
                  <li>Public Domain (no copyright)</li>
                  <li>Creative Commons BY (attribution required)</li>
                  <li>Creative Commons BY-SA (attribution + share-alike)</li>
                </ul>
                <p className="mt-4">
                  <strong>We explicitly exclude:</strong> CC BY-NC (non-commercial), unknown licenses, 
                  and any content with unclear rights status.
                </p>
              </div>

              <div className="card">
                <h3 className="font-display text-xl font-bold text-text mb-3">Attribution</h3>
                <p>
                  Every track displays the artist name, license type, and a link to the original item 
                  on the Internet Archive. We encourage users to support the original creators.
                </p>
              </div>

              <div className="card">
                <h3 className="font-display text-xl font-bold text-text mb-3">Report Infringement</h3>
                <p className="mb-4">
                  If you believe any content on this platform infringes your copyright or any other rights, 
                  please contact us immediately.
                </p>
                <p>
                  <strong>Contact:</strong>{' '}
                  <a href="mailto:contact@africanarchive.org" className="text-primary hover:underline">
                    contact@africanarchive.org
                  </a>
                </p>
              </div>

              <div className="card">
                <h3 className="font-display text-xl font-bold text-text mb-3">Disclaimer</h3>
                <p>
                  African Archive Radio is an independent project created to preserve and share African 
                  musical heritage. We are not affiliated with or endorsed by the Internet Archive, 
                  TIDAL, or any music labels. All trademarks mentioned belong to their respective owners.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}