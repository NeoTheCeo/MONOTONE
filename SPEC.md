# African Archive Radio

> Upload and stream African music. Direct from creators to listeners.

## About

A music upload and streaming platform for African music. Artists upload their tracks directly to S3, listeners stream from anywhere.

**Architecture inspired by Are.na**:
- Direct S3 uploads (client → S3, no server proxy)
- Presigned URLs for secure access
- PocketBase for metadata and auth

## Features

- **Direct S3 Upload** - Large files go straight to S3 (Are.na pattern)
- **Presigned URLs** - Secure, time-limited access to uploaded files
- **Music Streaming** - Stream uploaded African music
- **User Authentication** - Sign up, log in, manage your uploads
- **Explore by Country** - Browse music by African country
- **Report System** - Takedown requests for rights holders

## Tech Stack

- **Frontend**: Next.js 14 (App Router)
- **Backend**: PocketBase
- **Storage**: AWS S3
- **Styling**: Tailwind CSS
- **Hosting**: Render

## Data Model

### Track Collection

| Field | Type | Description |
|-------|------|-------------|
| title | text | Track title |
| artist | text | Artist name |
| user | relation | Uploader |
| s3_key | text | S3 object key |
| streaming_url | url | Audio URL |
| thumbnail | url | Cover art |
| duration | number | Length in seconds |
| country | text | Origin country |
| license | select | CC-BY, All Rights Reserved |
| status | select | uploading, ready, processing, error |
| plays | number | Play count |
| visible | bool | Public visibility |

### User Collection

PocketBase built-in auth collection with:
- email
- username
- avatar

## API Endpoints

### Upload Flow

```
1. POST /api/upload → Get track ID + upload policy
2. GET /api/upload/[id]/direct → Get presigned S3 URL
3. PUT [presigned_url] → Upload directly to S3
4. POST /api/upload/[id]/direct → Complete upload
```

### Storage

S3 bucket structure:
```
uploads/{userId}/{timestamp}-{filename}.mp3
```
