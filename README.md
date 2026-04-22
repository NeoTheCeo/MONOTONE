# African Archive Radio

> Rediscover African sound - A curated streaming platform showcasing African music from the Internet Archive.

## About

African Archive Radio is a streaming platform that curates African music from the [Internet Archive](https://archive.org). We strictly adhere to legal filtering - only including tracks with:

- **Public Domain**
- **CC BY** (Attribution required)
- **CC BY-SA** (Attribution + Share-Alike)

We explicitly **exclude**:
- CC BY-NC (Non-commercial)
- CC BY-ND (No derivatives)
- Unknown licenses
- Missing license information

## Tech Stack

- **Frontend**: Next.js 14 (App Router)
- **Backend**: PocketBase
- **Styling**: Tailwind CSS
- **Hosting**: Render

## Getting Started

### Prerequisites

- Node.js 18+
- PocketBase (for local development)

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/african-archive-radio.git
cd african-archive-radio

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your PocketBase URL

# Run development server
npm run dev
```

### Environment Variables

```env
NEXT_PUBLIC_POCKETBASE_URL=http://127.0.0.1:8090
```

### PocketBase Setup

1. Download [PocketBase](https://pocketbase.io/docs/)
2. Run `./pocketbase serve`
3. Create admin account at http://127.0.0.1:8090/_/
4. Create collections:

**tracks collection:**
| Field | Type | Options |
|-------|------|---------|
| title | text | required |
| artist | text | required |
| country | text | |
| license | select | PD, CC-BY, CC-BY-SA |
| archive_url | url | required |
| streaming_url | url | required |
| thumbnail | url | |
| duration | number | |
| plays | number | default: 0 |
| visible | bool | default: true |

**reports collection:**
| Field | Type | Options |
|-------|------|---------|
| track_id | relation | tracks collection |
| reason | select | copyright, inappropriate, wrong_metadata, unclear_license, other |
| contact_email | email | |
| status | select | pending, reviewed, resolved |

## Features

- 🎵 Stream African music directly from Internet Archive
- 🔒 Legal filtering (PD, CC-BY, CC-BY-SA only)
- 📱 Mobile-first responsive design
- 🌍 Browse by country
- 📊 Track attribution on every track
- 🚨 Report system for takedown requests

## Legal

See [Copyright](/src/app/copyright/page.tsx) page for full legal information.

All content is sourced from the Internet Archive. We do not host any audio files.

## License

MIT License - See [LICENSE](LICENSE) for details.