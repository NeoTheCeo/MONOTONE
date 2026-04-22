/**
 * Internet Archive Ingestion Engine
 * 
 * Queries Archive.org for African music and ingests tracks into PocketBase.
 * ONLY includes tracks with safe licenses: PD, CC-BY, CC-BY-SA
 * 
 * Usage: npx tsx scripts/ingest.ts
 */

const ARCHIVE_API = 'https://archive.org/advancedsearch.php';

// Safe licenses only - ALLOWLIST approach
const ALLOWED_LICENSES = [
  'publicdomain',
  'creativecommons.org/licenses/by/4.0',
  'creativecommons.org/licenses/by-sa/4.0',
  'creativecommons.org/licenses/by/3.0',
  'creativecommons.org/licenses/by-sa/3.0',
  'creativecommons.org/licenses/by/2.5',
  'creativecommons.org/licenses/by-sa/2.5',
  'creativecommons.org/licenses/publicdomain',
  'creativecommons.org/publicdomain/mark/1.0',
  'creativecommons.org/publicdomain/zero/1.0',
  'cc0',
];

// African countries and regions for search
const AFRICAN_KEYWORDS = [
  'Africa', 'African', 'Nigeria', 'Ghana', 'Kenya', 'South Africa',
  'Senegal', 'Mali', 'Ethiopia', 'Egypt', 'Morocco', 'Algeria',
  'Tanzania', 'Uganda', 'Cameroon', "Cote d'Ivoire", 'Zimbabwe',
  'Congo', 'Togo', 'Benin', 'Burkina Faso', 'Guinea', 'Rai',
  'Gnawa', 'Highlife', 'Afrobeat', 'Fela', 'Miriam Makeba',
];

interface ArchiveItem {
  identifier: string;
  title?: string;
  creator?: string;
  subject?: string;
  licenseurl?: string;
  language?: string;
  description?: string;
}

function isLicenseAllowed(licenseUrl: string | undefined): boolean {
  if (!licenseUrl) return false;
  
  const normalized = licenseUrl.toLowerCase().trim();
  
  // Check exact matches
  for (const allowed of ALLOWED_LICENSES) {
    if (normalized.includes(allowed.toLowerCase())) {
      return true;
    }
  }
  
  // Block known problematic licenses (non-commercial, no derivatives)
  const blocked = ['nc', 'non-commercial', 'nd', 'no-derivatives'];
  for (const block of blocked) {
    if (normalized.includes(block)) {
      return false;
    }
  }
  
  // If has "by" but also has problematic terms, block
  if (normalized.includes('by') && blocked.some(b => normalized.includes(b))) {
    return false;
  }
  
  // Be conservative - if not explicitly allowed, exclude
  return false;
}

function extractCountry(metadata: Record<string, unknown>): string | undefined {
  const fields = ['subject', 'description', 'creator', 'language'];
  const allText = fields
    .map(f => metadata[f])
    .filter(Boolean)
    .map(v => String(v).toLowerCase())
    .join(' ');
  
  const countries = [
    'Nigeria', 'Ghana', 'Kenya', 'South Africa', 'Senegal', 'Mali',
    'Ethiopia', 'Egypt', 'Morocco', 'Algeria', 'Tanzania', 'Uganda',
    'Cameroon', "Cote d'Ivoire", 'Ivory Coast', 'Zimbabwe', 'Congo',
    'Togo', 'Benin', 'Burkina Faso', 'Guinea', 'Rwanda', 'Burundi',
    'Liberia', 'Sierra Leone', 'Gambia', 'Namibia', 'Botswana',
    'Mozambique', 'Zambia', 'Malawi', 'Madagascar', 'Mauritius',
  ];
  
  for (const country of countries) {
    if (allText.includes(country.toLowerCase())) {
      return country;
    }
  }
  
  return undefined;
}

function determineLicense(licenseUrl: string | undefined): 'PD' | 'CC-BY' | 'CC-BY-SA' {
  if (!licenseUrl) return 'PD';
  
  const url = licenseUrl.toLowerCase();
  
  if (url.includes('by-sa') || url.includes('by-sa')) {
    return 'CC-BY-SA';
  }
  if (url.includes('by')) {
    return 'CC-BY';
  }
  if (url.includes('publicdomain') || url.includes('cc0')) {
    return 'PD';
  }
  
  return 'PD';
}

async function searchArchive(): Promise<ArchiveItem[]> {
  // Search for live music archive items with African keywords
  const queries = [
    'collection:etree AND (Africa OR African)',
    'collection:etree AND (Highlife OR Afrobeat)',
    'subject:(African Music)',
  ];
  
  const results: ArchiveItem[] = [];
  
  for (const query of queries.slice(0, 1)) { // Start with first query
    const params = new URLSearchParams({
      q: query,
      fl: 'identifier,title,creator,subject,licenseurl,language,description',
      rows: '25',
      output: 'json',
      mediatype: 'audio',
    });

    console.log(`Searching: ${query.slice(0, 50)}...`);
    
    try {
      const response = await fetch(`${ARCHIVE_API}?${params}`);
      const data = await response.json();
      
      if (data.response?.docs) {
        results.push(...data.response.docs);
      }
    } catch (err) {
      console.error('Search failed:', err);
    }
    
    // Rate limit
    await new Promise(r => setTimeout(r, 300));
  }
  
  // Deduplicate
  const seen = new Set<string>();
  return results.filter(item => {
    if (seen.has(item.identifier)) return false;
    seen.add(item.identifier);
    return true;
  });
}

async function getAudioFiles(identifier: string): Promise<{ url: string; format: string } | null> {
  try {
    const response = await fetch(
      `https://archive.org/metadata/${identifier}`
    );
    const data = await response.json();
    
    const audioFiles = (data.files || [])
      .filter((f: { format?: string; name?: string }) => {
        if (!f.format || !f.name) return false;
        const format = f.format.toLowerCase();
        return format.includes('mp3') || format.includes('ogg') || format.includes('vorbis');
      })
      .slice(0, 1);
    
    if (audioFiles.length === 0) return null;
    
    const f = audioFiles[0];
    return {
      url: `https://archive.org/download/${identifier}/${f.name}`,
      format: f.format,
    };
  } catch {
    return null;
  }
}

export async function runIngestion(pb: { collection: (name: string) => { getList: (page: number, perPage: number, opts?: object) => Promise<{ items: Array<{ archive_url: string }> }>; create: (data: object) => Promise<unknown> } }): Promise<number> {
  console.log('🔍 Searching Internet Archive for African music...\n');
  
  const items = await searchArchive();
  console.log(`Found ${items.length} potential items\n`);
  
  let ingested = 0;
  
  for (const item of items) {
    // Check license first - BLOCK if not allowed
    if (!isLicenseAllowed(item.licenseurl)) {
      console.log(`⏭️  Skipping ${item.identifier}: License not allowed`);
      continue;
    }
    
    const audio = await getAudioFiles(item.identifier);
    if (!audio) {
      console.log(`⏭️  Skipping ${item.identifier}: No audio files`);
      continue;
    }
    
    // Get full metadata for country extraction
    let metadata: Record<string, unknown> = {};
    try {
      const resp = await fetch(`https://archive.org/metadata/${item.identifier}`);
      metadata = await resp.json();
    } catch {
      // Use basic fields
    }
    
    const title = item.title || item.identifier;
    const creator = item.creator || 'Unknown Artist';
    const country = extractCountry(metadata);
    const license = determineLicense(item.licenseurl);
    
    // Try to get thumbnail (use archive's image service)
    const thumbnail = `https://archive.org/services/img/${item.identifier}`;
    
    try {
      // Check if already exists
      const existing = await pb.collection('tracks').getList(1, 1, {
        filter: `archive_url~"${item.identifier}"`,
      });
      
      if (existing.items.length > 0) {
        console.log(`⏭️  Already exists: ${title.slice(0, 40)}`);
        continue;
      }
      
      // Create the track record
      await pb.collection('tracks').create({
        title: title.slice(0, 200),
        artist: creator.slice(0, 200),
        country: country || '',
        license,
        archive_url: `https://archive.org/details/${item.identifier}`,
        streaming_url: audio.url,
        thumbnail,
        visible: true,
        plays: 0,
      });
      
      console.log(`✅ Ingested: ${title.slice(0, 40)} (${license})`);
      ingested++;
    } catch (err) {
      console.error(`❌ Failed: ${title.slice(0, 40)}`, err);
    }
    
    // Rate limit
    await new Promise(r => setTimeout(r, 300));
  }
  
  console.log(`\n✨ Ingestion complete! Added ${ingested} tracks.`);
  return ingested;
}

// Allow running directly
if (require.main === module) {
  console.log('This script should be run with access to PocketBase.\n');
  console.log('Import runIngestion() from this file in your Next.js API route.');
}