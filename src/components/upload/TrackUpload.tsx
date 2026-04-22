'use client';

import { useState, useRef, useCallback } from 'react';
import axios from 'axios';

interface UploadResponse {
  track_id: string;
  upload_url: string;
  key: string;
  expires_in: number;
}

interface TrackUploadProps {
  token: string;
  onSuccess?: (trackId: string) => void;
  onError?: (error: string) => void;
}

type UploadMode = 'idle' | 'requesting' | 'uploading' | 'processing' | 'done' | 'error';

export default function TrackUpload({ token, onSuccess, onError }: TrackUploadProps) {
  const [mode, setMode] = useState<UploadMode>('idle');
  const [progress, setProgress] = useState(0);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) {
      setMode('idle');
      return;
    }

    if (file.type.startsWith('audio/')) {
      setPreviewUrl(URL.createObjectURL(file));
    }

    setMode('requesting');

    try {
      // Step 1: Request upload policy
      const { data: policy } = await axios.post<UploadResponse>(
        '/api/upload',
        {
          filename: file.name,
          contentType: file.type,
          size: file.size,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      // Step 2: Get presigned URL
      const { data: presigned } = await axios.get<{ upload_url: string }>(
        `/api/upload/${policy.track_id}/direct`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setMode('uploading');

      // Step 3: Upload directly to S3
      await axios.put(presigned.upload_url, file, {
        headers: { 'Content-Type': file.type },
        onUploadProgress: (progressEvent) => {
          const pct = progressEvent.progress || 0;
          setProgress(Math.round(pct * 100));
        },
      });

      setMode('processing');

      // Step 4: Complete upload
      const s3Url = `https://${process.env.NEXT_PUBLIC_AWS_S3_BUCKET}.s3.amazonaws.com/${policy.key}`;
      
      await axios.post(
        `/api/upload/${policy.track_id}/direct`,
        { streaming_url: s3Url },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setMode('done');
      onSuccess?.(policy.track_id);
    } catch (err) {
      console.error('Upload error:', err);
      setMode('error');
      onError?.(err instanceof Error ? err.message : 'Upload failed');
    }
  }, [token, onSuccess, onError]);

  const triggerFileSelect = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    inputRef.current?.click();
  }, []);

  const reset = useCallback(() => {
    setMode('idle');
    setProgress(0);
    setPreviewUrl(null);
    if (inputRef.current) inputRef.current.value = '';
  }, []);

  return (
    <div className="upload-component">
      <input
        ref={inputRef}
        type="file"
        accept="audio/mpeg,audio/mp3,audio/wav,audio/ogg,audio/flac,audio/aac,audio/mp4"
        onChange={handleFileSelect}
        style={{ display: 'none' }}
      />

      {previewUrl && (
        <audio src={previewUrl} controls className="w-full mb-4" />
      )}

      <div className="text-center py-4">
        {mode === 'idle' && (
          <button onClick={triggerFileSelect} className="btn-primary">
            Upload Music
          </button>
        )}

        {mode === 'requesting' && (
          <span className="text-text-muted">Preparing upload...</span>
        )}

        {mode === 'uploading' && (
          <div>
            <div className="w-full h-2 bg-surface rounded-full overflow-hidden mb-2">
              <div
                className="h-full bg-primary transition-all duration-200"
                style={{ width: `${progress}%` }}
              />
            </div>
            <span className="text-sm text-text-muted">Uploading {progress}%</span>
          </div>
        )}

        {mode === 'processing' && (
          <span className="text-text-muted">Processing your track...</span>
        )}

        {mode === 'done' && (
          <div className="text-center">
            <div className="text-green-400 mb-2">✓ Upload complete!</div>
            <button onClick={reset} className="btn-secondary">Upload Another</button>
          </div>
        )}

        {mode === 'error' && (
          <div className="text-center">
            <div className="text-red-400 mb-2">Upload failed. Please try again.</div>
            <button onClick={reset} className="btn-secondary">Try Again</button>
          </div>
        )}
      </div>

      <p className="text-xs text-text-muted text-center">
        Accepted: MP3, WAV, OGG, FLAC, AAC, M4A (max 100MB)
      </p>
    </div>
  );
}