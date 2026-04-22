'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { supabase, Track, getUserTracks } from '@/lib/supabase';
import { Upload as UploadIcon, Music, Play, Pause, Trash2 } from 'lucide-react';

function UploadSection({ onComplete }: { onComplete?: () => void }) {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);

  const handleUpload = async (files: FileList | null) => {
    const file = files?.[0];
    if (!file) return;

    setUploading(true);
    setError(null);
    setProgress(0);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Not authenticated');

      const ext = file.name.split('.').pop() || 'mp3';
      const key = `uploads/${session.user.id}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
      
      // Create track record
      const { data: track, error: createError } = await supabase
        .from('tracks')
        .insert({
          title: file.name.replace(/\.[^/.]+$/, ''),
          artist: 'Unknown Artist',
          user_id: session.user.id,
          s3_key: key,
          status: 'uploading',
          visible: false,
          license: 'cc_by',
          plays: 0,
        })
        .select()
        .single();

      if (createError) throw createError;

      // Get presigned URL from Edge Function
      const { data, error: fnError } = await supabase.functions.invoke('get-upload-url', {
        body: { trackId: track.id, key, contentType: file.type }
      });

      if (fnError || !data?.presignedUrl) {
        throw new Error('Failed to get upload URL');
      }

      // Upload to S3
      const response = await fetch(data.presignedUrl, {
        method: 'PUT',
        body: file,
        headers: { 'Content-Type': file.type }
      });

      if (!response.ok) throw new Error('Upload failed');

      setProgress(80);

      // Update track as ready
      const streamUrl = `${process.env.NEXT_PUBLIC_AWS_S3_BUCKET ? `https://${process.env.NEXT_PUBLIC_AWS_S3_BUCKET}.s3.amazonaws.com/${key}` : ''}`;
      await supabase
        .from('tracks')
        .update({ status: 'ready', stream_url: streamUrl, visible: true })
        .eq('id', track.id);

      setProgress(100);
      onComplete?.();
    } catch (err) {
      console.error('Upload error:', err);
      setError(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    handleUpload(e.dataTransfer.files);
  }, []);

  return (
    <div className="upload-page">
      <h1 className="page-title">Upload Music</h1>
      <p className="page-description">
        Share your African music with the world. Your tracks will be available for streaming.
      </p>

      <div
        className={`upload-zone ${dragOver ? 'dragover' : ''} ${uploading ? 'uploading' : ''}`}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        onClick={() => !uploading && document.getElementById('file-input')?.click()}
      >
        <input 
          id="file-input"
          type="file" 
          accept="audio/*"
          onChange={(e) => handleUpload(e.target.files)}
          disabled={uploading}
          style={{ display: 'none' }}
        />
        
        <UploadIcon size={48} strokeWidth={1.5} style={{ color: 'var(--text-muted)' }} />
        
        <p className="mt-2" style={{ fontSize: '16px', fontWeight: 500 }}>
          {uploading ? 'Uploading...' : 'Drop your music here'}
        </p>
        <p className="text-muted mt-1">or click to browse</p>
        <p className="text-muted mt-1" style={{ fontSize: '12px' }}>
          MP3, WAV, FLAC, OGG, AAC (max 100MB)
        </p>

        {uploading && (
          <div className="upload-progress mt-3" style={{ width: '100%', maxWidth: '300px' }}>
            <div className="upload-progress-bar" style={{ width: `${progress}%` }} />
          </div>
        )}
      </div>

      {error && (
        <div className="error-box mt-3">
          <p className="text-error">{error}</p>
        </div>
      )}

      <div className="upload-info mt-4">
        <h3>Licensing</h3>
        <p className="text-muted">
          All uploads are licensed under CC BY unless you specify otherwise.
          Make sure you have the rights to share the music you're uploading.
        </p>
      </div>
    </div>
  );
}

function TrackRow({ track, onDelete }: { track: Track; onDelete: () => void }) {
  const [playing, setPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);

  const togglePlay = () => {
    if (audioRef.current) {
      if (playing) audioRef.current.pause();
      else audioRef.current.play();
      setPlaying(!playing);
    }
  };

  return (
    <div className="track-row">
      <div className="track-cover">
        {track.cover_url ? (
          <img src={track.cover_url} alt={track.title} />
        ) : (
          <Music size={20} style={{ color: 'var(--text-muted)' }} />
        )}
      </div>
      
      <button className="play-btn" onClick={togglePlay}>
        {playing ? <Pause size={18} /> : <Play size={18} />}
      </button>
      
      <audio ref={audioRef} src={track.stream_url} onEnded={() => setPlaying(false)} />
      
      <div className="track-info">
        <div className="track-title">{track.title}</div>
        <div className="track-meta">
          {track.artist} • {track.plays} plays • {track.status}
        </div>
      </div>

      <button className="delete-btn" onClick={onDelete} title="Delete">
        <Trash2 size={16} />
      </button>
    </div>
  );
}

export default function UploadPage() {
  const [user, setUser] = useState<any>(null);
  const [tracks, setTracks] = useState<Track[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push('/');
        return;
      }
      setUser(session.user);
      loadTracks(session.user.id);
    };

    checkAuth();
  }, [router]);

  const loadTracks = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('tracks')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTracks(data as Track[]);
    } catch (err) {
      console.error('Failed to load tracks:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (trackId: string) => {
    if (!confirm('Delete this track?')) return;
    
    const { error } = await supabase.from('tracks').delete().eq('id', trackId);
    if (!error) {
      setTracks(tracks.filter(t => t.id !== trackId));
    }
  };

  return (
    <div className="container mt-4">
      <UploadSection onComplete={() => user && loadTracks(user.id)} />
      
      <section className="mt-4">
        <h2 className="section-title">Your Uploads</h2>
        {loading ? (
          <p className="text-center text-muted">Loading...</p>
        ) : tracks.length === 0 ? (
          <p className="text-center text-muted">You haven't uploaded any music yet.</p>
        ) : (
          <div className="tracks-list">
            {tracks.map(track => (
              <TrackRow key={track.id} track={track} onDelete={() => handleDelete(track.id)} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}