'use client';

import { Track } from '@/lib/pb';

interface TrackListProps {
  tracks: Track[];
}

function TrackCard({ track }: { track: Track }) {
  return (
    <div className="card flex gap-4 items-center">
      <div className="w-16 h-16 rounded bg-surface flex items-center justify-center flex-shrink-0">
        {track.thumbnail ? (
          <img src={track.thumbnail} alt={track.title} className="w-full h-full object-cover rounded" />
        ) : (
          <svg className="w-8 h-8 text-text-muted" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/>
          </svg>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <h4 className="font-semibold truncate">{track.title}</h4>
        <p className="text-sm text-text-muted truncate">{track.artist}</p>
      </div>
      {track.country && (
        <span className="text-xs px-2 py-1 rounded-full bg-surface">{track.country}</span>
      )}
      <audio controls className="w-32 h-8" src={track.streaming_url} />
    </div>
  );
}

export default function TrackList({ tracks }: TrackListProps) {
  return (
    <div className="space-y-2">
      {tracks.map((track) => (
        <TrackCard key={track.id} track={track} />
      ))}
    </div>
  );
}
