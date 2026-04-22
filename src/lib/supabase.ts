import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface Track {
  id: string;
  title: string;
  artist: string;
  user_id: string;
  s3_key: string;
  stream_url: string;
  cover_url?: string;
  duration?: number;
  country?: string;
  license: 'public_domain' | 'cc_by' | 'cc_by_sa' | 'all_rights_reserved';
  status: 'uploading' | 'processing' | 'ready' | 'error';
  plays: number;
  visible: boolean;
  created_at: string;
}

export async function getTracks(visible = true) {
  let query = supabase.from('tracks').select('*').order('created_at', { ascending: false });
  if (visible) query = query.eq('visible', true).eq('status', 'ready');
  const { data, error } = await query.limit(50);
  if (error) throw error;
  return data as Track[];
}

export async function getTrack(id: string) {
  const { data, error } = await supabase.from('tracks').select('*').eq('id', id).single();
  if (error) return null;
  return data as Track;
}

export async function getUserTracks(userId: string) {
  const { data, error } = await supabase
    .from('tracks')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data as Track[];
}

export async function createTrack(data: Partial<Track>) {
  const { data: track, error } = await supabase.from('tracks').insert(data).select().single();
  if (error) throw error;
  return track as Track;
}

export async function updateTrack(id: string, data: Partial<Track>) {
  const { data: track, error } = await supabase.from('tracks').update(data).eq('id', id).select().single();
  if (error) throw error;
  return track as Track;
}