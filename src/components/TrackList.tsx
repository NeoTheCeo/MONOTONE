'use client';

import { useState } from 'react';
import { Track } from '@/lib/pb';
import Player from '@/components/Player';
import TrackCard from '@/components/TrackCard';

export default function TrackList({ tracks }: { tracks: Track[] }) {
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null);

  return (
    <>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {tracks.map((track) => (
          <TrackCard key={track.id} track={track} onPlay={setCurrentTrack} />
        ))}
      </div>
      {currentTrack && (
        <Player 
          currentTrack={currentTrack} 
          onClose={() => setCurrentTrack(null)} 
        />
      )}
    </>
  );
}