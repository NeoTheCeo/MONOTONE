/**
 * Seed script to add initial sample tracks
 * Run with: npx tsx scripts/seed.ts
 * 
 * NOTE: These are placeholder tracks for demonstration.
 * Replace with real Internet Archive identifiers after running the ingest script.
 */

const SAMPLE_TRACKS = [
  {
    title: 'African Rhythm',
    artist: 'Fela Kuti',
    country: 'Nigeria',
    license: 'CC-BY' as const,
    archive_url: 'https://archive.org/details/african-rhythm',
    streaming_url: 'https://archive.org/download/african-rhythm/track.mp3',
    thumbnail: 'https://archive.org/services/img/african-rhythm',
    visible: true,
    plays: 0,
  },
  {
    title: 'Highlife Medley',
    artist: 'E.T. Mensah',
    country: 'Ghana',
    license: 'PD' as const,
    archive_url: 'https://archive.org/details/highlife-medu',
    streaming_url: 'https://archive.org/download/highlife-medu/track.mp3',
    thumbnail: 'https://archive.org/services/img/highlife-medu',
    visible: true,
    plays: 0,
  },
];

export async function seedTracks(pb: { collection: (name: string) => { create: (data: object) => Promise<unknown>; getList: (page: number, perPage: number, opts?: object) => Promise<{ items: Array<{ id: string }> }> } }): Promise<number> {
  let added = 0;
  
  for (const track of SAMPLE_TRACKS) {
    try {
      // Check if exists
      const existing = await pb.collection('tracks').getList(1, 1, {
        filter: `title="${track.title}" && artist="${track.artist}"`,
      });
      
      if (existing.items.length > 0) {
        console.log(`⏭️  Already exists: ${track.title}`);
        continue;
      }
      
      await pb.collection('tracks').create(track);
      console.log(`✅ Added: ${track.title} - ${track.artist}`);
      added++;
    } catch (err) {
      console.error(`❌ Failed: ${track.title}`, err);
    }
  }
  
  return added;
}

if (require.main === module) {
  console.log('Run this script with admin access to PocketBase:');
  console.log('  npx tsx scripts/seed.ts');
}