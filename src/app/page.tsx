'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
import { supabase, Track, createTrack, updateTrack } from '@/lib/supabase';
import { Upload, Play, Pause, Music, Plus } from 'lucide-react';

// Are.na-style cell component
function TrackCell({ track }: { track: Track }) {
  const [playing, setPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);

  const togglePlay = () => {
    if (audioRef.current) {
      if (playing) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setPlaying(!playing);
    }
  };

  return (
    <div className="cell">
      <div className="cell-cover">
        {track.cover_url ? (
          <img src={track.cover_url} alt={track.title} />
        ) : (
          <Music size={32} strokeWidth={1.5} style={{ color: 'var(--text-muted)' }} />
        )}
        <audio 
          ref={audioRef} 
          src={track.stream_url} 
          onEnded={() => setPlaying(false)} 
        />
      </div>
      <button 
        className="play-overlay"
        onClick={togglePlay}
        aria-label={playing ? 'Pause' : 'Play'}
      >
        {playing ? <Pause size={24} /> : <Play size={24} />}
      </button>
      <div className="cell-content">
        <div className="cell-title">{track.title}</div>
        <div className="cell-subtitle">{track.artist}</div>
        {track.country && (
          <div className="cell-meta">{track.country}</div>
        )}
      </div>
    </div>
  );
}

// Upload component - direct to S3
function UploadZone({ onUploadComplete }: { onUploadComplete?: () => void }) {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setError(null);
    setProgress(0);

    try {
      // 1. Get session
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error('Not authenticated');
      }

      // 2. Create track record
      const ext = file.name.split('.').pop() || 'mp3';
      const key = `uploads/${session.user.id}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
      
      const track = await createTrack({
        title: file.name.replace(/\.[^/.]+$/, ''),
        artist: 'Unknown Artist',
        user_id: session.user.id,
        s3_key: key,
        status: 'uploading',
        visible: false,
        license: 'cc_by',
        plays: 0,
      });

      // 3. Get presigned URL
      const { data: { presignedUrl } } = await supabase.functions.invoke('get-upload-url', {
        body: { trackId: track.id, key, contentType: file.type }
      });

      // 4. Upload to S3
      await fetch(presignedUrl, {
        method: 'PUT',
        body: file,
        headers: { 'Content-Type': file.type }
      });

      setProgress(80);

      // 5. Update track as ready
      const streamUrl = `https://${process.env.NEXT_PUBLIC_AWS_S3_BUCKET}.s3.amazonaws.com/${key}`;
      await updateTrack(track.id, {
        status: 'ready',
        stream_url: streamUrl,
        visible: true,
      });

      setProgress(100);
      onUploadComplete?.();
    } catch (err) {
      console.error('Upload error:', err);
      setError(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="upload-container">
      <label className={`upload-zone ${uploading ? 'uploading' : ''}`}>
        <input 
          type="file" 
          accept="audio/*"
          onChange={handleUpload}
          disabled={uploading}
          style={{ display: 'none' }}
        />
        {uploading ? (
          <div className="upload-state">
            <Upload size={32} strokeWidth={1.5} className="animate-pulse" />
            <p className="mt-2">Uploading...</p>
            <div className="upload-progress mt-2">
              <div className="upload-progress-bar" style={{ width: `${progress}%` }} />
            </div>
          </div>
        ) : (
          <div className="upload-state">
            <Plus size={32} strokeWidth={1.5} />
            <p className="mt-2">Drop your music here or click to upload</p>
            <p className="text-muted mt-1">MP3, WAV, FLAC, OGG (max 100MB)</p>
          </div>
        )}
      </label>
      {error && <p className="text-error mt-2">{error}</p>}
    </div>
  );
}

// Header
function Header({ user, onLogin }: { user: any; onLogin: () => void }) {
  return (
    <header className="header">
      <div className="header-inner">
        <Link href="/" className="logo">African Archive Radio</Link>
        <nav className="nav">
          <Link href="/explore" className="nav-link">Explore</Link>
          {user ? (
            <>
              <Link href="/upload" className="nav-link">
                <Plus size={16} style={{ marginRight: 4, verticalAlign: 'middle' }} />
                Upload
              </Link>
              <Link href="/my-music" className="nav-link">My Music</Link>
              <button onClick={() => supabase.auth.signOut()} className="nav-link">Sign Out</button>
            </>
          ) : (
            <button onClick={onLogin} className="btn btn-primary">Sign In</button>
          )}
        </nav>
      </div>
    </header>
  );
}

// Main page
export default function Home() {
  const [tracks, setTracks] = useState<Track[]>([]);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check auth
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    // Load tracks
    loadTracks();

    return () => subscription.unsubscribe();
  }, []);

  const loadTracks = async () => {
    try {
      const data = await getTracks();
      setTracks(data);
    } catch (err) {
      console.error('Failed to load tracks:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'github',
      options: { redirectTo: window.location.origin }
    });
  };

  const handleUploadComplete = () => {
    loadTracks();
  };

  return (
    <>
      <Header user={user} onLogin={handleLogin} />
      <main className="container mt-4">
        {user && (
          <section className="mb-4">
            <h2 className="section-title">Upload Music</h2>
            <UploadZone onUploadComplete={handleUploadComplete} />
          </section>
        )}
        
        <section>
          <h2 className="section-title">Recent Uploads</h2>
          {loading ? (
            <p className="text-center text-muted">Loading...</p>
          ) : tracks.length === 0 ? (
            <p className="text-center text-muted">No tracks yet. Be the first to upload!</p>
          ) : (
            <div className="grid grid-4">
              {tracks.map(track => (
                <TrackCell key={track.id} track={track} />
              ))}
            </div>
          )}
        </section>
      </main>
    </>
  );
}

async function getTracks() {
  const { data, error } = await supabase
    .from('tracks')
    .select('*')
    .eq('visible', true)
    .eq('status', 'ready')
    .order('created_at', { ascending: false })
    .limit(50);
  
  if (error) throw error;
  return data as Track[];
}