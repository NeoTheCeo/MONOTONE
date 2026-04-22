# African Archive Radio

Music upload platform built with Are.na design principles and Supabase backend.

## Setup

### 1. Supabase Setup

1. Create a new Supabase project
2. Run the SQL in `supabase/schema.sql` in the SQL Editor
3. Configure GitHub OAuth in Authentication > Providers
4. Create an S3 bucket and get credentials

### 2. Environment Variables

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
AWS_ACCESS_KEY_ID=your_s3_key
AWS_SECRET_ACCESS_KEY=your_s3_secret
AWS_S3_BUCKET=your_bucket_name
AWS_REGION=us-east-1
```

### 3. Install & Run

```bash
npm install
npm run dev
```

### 4. Deploy Edge Function

```bash
supabase functions deploy get-upload-url
```

## Architecture

- **Frontend**: Next.js 14 with Are.na-inspired design
- **Backend**: Supabase (Auth + Database + Storage)
- **File Storage**: AWS S3 with presigned URLs for direct uploads
- **Upload Flow**: Client → Get Presigned URL → Upload Direct to S3 → Update Record