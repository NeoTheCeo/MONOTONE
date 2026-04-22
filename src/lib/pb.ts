import PocketBase from 'pocketbase';

const PB_URL = process.env.NEXT_PUBLIC_POCKETBASE_URL || 'http://127.0.0.1:8090';

export const pb = new PocketBase(PB_URL);

export interface Track {
  id: string;
  title: string;
  artist: string;
  country?: string;
  user: string;
  s3_key?: string;
  streaming_url?: string;
  thumbnail?: string;
  duration?: number;
  license: 'PD' | 'CC-BY' | 'CC-BY-SA' | 'All Rights Reserved';
  status: 'uploading' | 'ready' | 'processing' | 'error';
  plays: number;
  visible: boolean;
  created_at: string;
}

export interface User {
  id: string;
  email: string;
  username?: string;
  avatar?: string;
  created_at: string;
}

export async function getTracks(visible = true): Promise<Track[]> {
  const filter = visible ? 'visible = true && status = "ready"' : '';
  const result = await pb.collection('tracks').getList<Track>(1, 50, {
    filter,
    sort: '-created_at',
  });
  return result.items;
}

export async function getTrackById(id: string): Promise<Track | null> {
  try {
    return await pb.collection('tracks').getOne<Track>(id);
  } catch {
    return null;
  }
}

export async function getTracksByCountry(country: string): Promise<Track[]> {
  const result = await pb.collection('tracks').getList<Track>(1, 50, {
    filter: `visible = true && status = "ready" && country = "${country}"`,
    sort: '-created_at',
  });
  return result.items;
}

export async function getCountries(): Promise<string[]> {
  const result = await pb.collection('tracks').getList<Track>(1, 200, {
    filter: 'visible = true && status = "ready"',
  });
  const countries = new Set<string>();
  result.items.forEach(track => {
    if (track.country) countries.add(track.country);
  });
  return Array.from(countries).sort();
}

export async function getMyTracks(userId: string): Promise<Track[]> {
  const result = await pb.collection('tracks').getList<Track>(1, 50, {
    filter: `user = "${userId}"`,
    sort: '-created_at',
  });
  return result.items;
}

export async function updateTrack(id: string, data: Partial<Track>): Promise<Track> {
  return await pb.collection('tracks').update<Track>(id, data);
}

export async function deleteTrack(id: string): Promise<boolean> {
  try {
    await pb.collection('tracks').delete(id);
    return true;
  } catch {
    return false;
  }
}

export async function incrementPlays(trackId: string): Promise<void> {
  const track = await getTrackById(trackId);
  if (track) {
    await pb.collection('tracks').update(trackId, {
      plays: (track.plays || 0) + 1,
    });
  }
}
