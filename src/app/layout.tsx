import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'African Archive Radio',
  description: 'Upload and share African music',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}