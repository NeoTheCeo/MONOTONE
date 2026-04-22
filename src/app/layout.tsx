import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'African Archive Radio',
  description: 'Upload and stream African music. Direct from creators to listeners.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="font-sans bg-background text-foreground antialiased">
        {children}
      </body>
    </html>
  );
}
