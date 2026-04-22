# African Archive Radio - Specification

## Project Overview
- **Name**: African Archive Radio
- **Type**: Streaming web platform for African music from Internet Archive
- **Stack**: Next.js 14 (App Router) + PocketBase + Render
- **Legal Rule**: ONLY Public Domain or CC BY/CC BY-SA content

## UI/UX Specification

### Layout Structure
- **Header**: Logo + Navigation (Home, Explore, Copyright)
- **Main Content**: Flexible grid for tracks
- **Persistent Player**: Bottom bar with current track
- **Mobile-first**: Responsive breakpoints (640, 768, 1024)

### Color Palette (Dark, African-inspired)
- `--background`: #0A0A0A (near black)
- `--surface`: #141414 (cards)
- `--surface-hover`: #1F1F1F
- `--primary`: #D4AF37 (African gold)
- `--primary-hover`: #E5C158
- `--accent`: #8B4513 (saddle brown)
- `--text`: #FAFAFA
- `--text-muted`: #A0A0A0
- `--border`: #2A2A2A

### Typography
- **Headings**: "Playfair Display" (serif, elegant)
- **Body**: "Source Sans Pro" (sans-serif, readable)

### Components
1. **Track Card**: Thumbnail, title, artist, country badge, play button
2. **Player Bar**: Album art, track info, play/pause, progress
3. **Country Filter**: Dropdown pills
4. **Report Button**: Modal form

## Functionality

### 1. Data Model (PocketBase)
- **tracks** collection:
  - title (text)
  - artist (text)
  - country (text, optional)
  - license (select: PD, CC-BY, CC-BY-SA)
  - archive_url (url)
  - streaming_url (url)
  - thumbnail (url)
  - duration (number)
  - plays (number, default 0)
  - visible (bool, default true)
  - created_at (date)

- **reports** collection:
  - track_id (relation to tracks)
  - reason (text)
  - contact_email (email, optional)
  - status (select: pending, reviewed, resolved)
  - created_at (date)

### 2. Internet Archive Ingestion
- Query: `collection:etree` + `subject:Africa` OR subject with African country names
- Filter by license (safelist approach)
- Fetch metadata via Archive.org API

### 3. Streaming
- Direct from Internet Archive + `?format=json` for metadata
- HTML5 `<audio>` with controls
- Fallback: show error, allow report

### 4. Pages
- `/` - Home (curated visible tracks, paginated)
- `/explore` - Filter by country
- `/copyright` - Legal info page
- `/api/tracks` - Internal API
- `/api/reports` - Submit report

## Acceptance Criteria
1. Only PD/CC-BY/CC-BY-SA tracks visible
2. Attribution always displayed
3. Report button functional
4. Responsive on mobile
5. Player works with Archive URLs