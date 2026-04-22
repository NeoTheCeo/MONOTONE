import Header from '@/components/Header';
import TrackUpload from '@/components/upload/TrackUpload';

export default function UploadPage() {
  // In production, get token from session/auth
  const token = ''; // Will be filled by auth provider

  return (
    <>
      <Header />
      <main className="min-h-screen pb-32">
        <section className="max-w-2xl mx-auto px-4 py-12">
          <h2 className="font-display text-3xl font-bold mb-2">Upload Music</h2>
          <p className="text-text-muted mb-8">
            Share your African music with the world. All uploads are stored on S3.
          </p>

          <div className="card">
            <TrackUpload 
              token={token}
              onSuccess={(trackId) => {
                console.log('Uploaded track:', trackId);
              }}
              onError={(error) => {
                console.error('Upload error:', error);
              }}
            />
          </div>

          <div className="mt-8 text-sm text-text-muted">
            <h3 className="font-semibold mb-2">Upload Guidelines</h3>
            <ul className="list-disc list-inside space-y-1">
              <li>Only upload music you have rights to share</li>
              <li>Accepted formats: MP3, WAV, OGG, FLAC, AAC, M4A</li>
              <li>Maximum file size: 100MB</li>
              <li>All uploads are public by default</li>
              <li>Report content that infringes your rights</li>
            </ul>
          </div>
        </section>
      </main>
    </>
  );
}