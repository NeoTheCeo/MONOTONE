'use client';

import { useState } from 'react';
import { Track } from '@/lib/pb';

interface TrackCardProps {
  track: Track;
  onPlay: (track: Track) => void;
}

export default function TrackCard({ track, onPlay }: TrackCardProps) {
  const [showReport, setShowReport] = useState(false);

  const licenseColors: Record<string, string> = {
    'PD': 'bg-green-500/20 text-green-400',
    'CC-BY': 'bg-blue-500/20 text-blue-400',
    'CC-BY-SA': 'bg-purple-500/20 text-purple-400',
  };

  return (
    <>
      <div className="card group">
        <div className="relative aspect-square mb-3 rounded-lg overflow-hidden bg-background">
          {track.thumbnail ? (
            <img 
              src={track.thumbnail} 
              alt={track.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <svg className="w-16 h-16 text-text-muted" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/>
              </svg>
            </div>
          )}
          
          {/* Play Button Overlay */}
          <button
            onClick={() => onPlay(track)}
            className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <div className="w-14 h-14 rounded-full bg-primary flex items-center justify-center">
              <svg className="w-8 h-8 text-background ml-1" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z"/>
              </svg>
            </div>
          </button>
        </div>

        <h3 className="font-semibold truncate mb-1">{track.title}</h3>
        <p className="text-sm text-text-muted truncate mb-2">{track.artist}</p>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className={`px-2 py-0.5 rounded text-xs ${licenseColors[track.license] || 'bg-gray-500/20 text-gray-400'}`}>
              {track.license}
            </span>
            {track.country && (
              <span className="px-2 py-0.5 bg-surface-hover rounded text-xs text-text-muted">
                {track.country}
              </span>
            )}
          </div>
          
          <button
            onClick={() => setShowReport(true)}
            className="text-xs text-text-muted hover:text-red-400 transition-colors"
            title="Report this track"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6h-8.5l-1-1H5a2 2 0 00-2 2zm9-13.5V9" />
            </svg>
          </button>
        </div>
      </div>

      {/* Report Modal */}
      {showReport && (
        <ReportModal track={track} onClose={() => setShowReport(false)} />
      )}
    </>
  );
}

function ReportModal({ track, onClose }: { track: Track; onClose: () => void }) {
  const [reason, setReason] = useState('');
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      await fetch('/api/reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          track_id: track.id,
          reason,
          contact_email: email || undefined,
        }),
      });
      setSubmitted(true);
    } catch (err) {
      console.error('Failed to submit report:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
      <div className="bg-surface border border-border rounded-lg max-w-md w-full p-6">
        {submitted ? (
          <div className="text-center py-8">
            <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 className="font-display text-xl font-bold mb-2">Report Submitted</h3>
            <p className="text-text-muted mb-4">Thank you. We will review this track.</p>
            <button onClick={onClose} className="btn-primary">Close</button>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-display text-xl font-bold">Report Track</h3>
              <button onClick={onClose} className="text-text-muted hover:text-text">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <p className="text-text-muted text-sm mb-4">
              Reporting: <span className="text-text">{track.title}</span>
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Reason for report</label>
                <select
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  required
                  className="input w-full"
                >
                  <option value="">Select a reason</option>
                  <option value="copyright">Copyright infringement</option>
                  <option value="inappropriate">Inappropriate content</option>
                  <option value="wrong_metadata">Wrong metadata</option>
                  <option value="unclear_license">Unclear license</option>
                  <option value="other">Other</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Email (optional)</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  className="input w-full"
                />
              </div>

              <div className="flex gap-3">
                <button type="button" onClick={onClose} className="btn-secondary flex-1">
                  Cancel
                </button>
                <button type="submit" disabled={loading} className="btn-primary flex-1">
                  {loading ? 'Submitting...' : 'Submit Report'}
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
}