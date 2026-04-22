-- African Archive Radio Database Schema
-- Run this in Supabase SQL Editor

-- Enable RLS
alter table auth.users enable row level security;
alter table tracks enable row level security;

-- Create tracks table
create table public.tracks (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  artist text not null default 'Unknown',
  user_id uuid references auth.users(id) on delete cascade not null,
  s3_key text not null,
  stream_url text,
  cover_url text,
  duration integer,
  country text,
  license text check (license in ('public_domain', 'cc_by', 'cc_by_sa', 'all_rights_reserved')) default 'cc_by',
  status text check (status in ('uploading', 'processing', 'ready', 'error')) default 'uploading',
  plays integer default 0,
  visible boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- RLS Policies for tracks
create policy "Anyone can view visible tracks"
  on public.tracks for select
  using (visible = true and status = 'ready');

create policy "Users can view their own tracks"
  on public.tracks for select
  using (auth.uid() = user_id);

create policy "Users can insert their own tracks"
  on public.tracks for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own tracks"
  on public.tracks for update
  using (auth.uid() = user_id);

create policy "Users can delete their own tracks"
  on public.tracks for delete
  using (auth.uid() = user_id);

-- Create indexes
create index tracks_user_id_idx on public.tracks(user_id);
create index tracks_status_idx on public.tracks(status);
create index tracks_visible_idx on public.tracks(visible);
create index tracks_created_at_idx on public.tracks(created_at desc);

-- Storage bucket for audio files
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('audio', 'audio', true, 104857600, ARRAY['audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/ogg', 'audio/flac', 'audio/aac', 'audio/mp4'])
on conflict (id) do nothing;

-- Storage policies
create policy "Anyone can view audio files"
  on storage.objects for select
  using (bucket_id = 'audio');

create policy "Authenticated users can upload audio"
  on storage.objects for insert
  with check (bucket_id = 'audio' and auth.role() = 'authenticated');

create policy "Users can delete their own audio"
  on storage.objects for delete
  using (bucket_id = 'audio' and auth.uid()::text = (storage.foldername(name))[1]);