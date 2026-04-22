import Link from 'next/link';

export default function Header() {
  return (
    <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-surface">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="font-display text-xl font-bold">
          African Archive Radio
        </Link>
        <nav className="flex items-center gap-4">
          <Link href="/explore" className="hover:text-primary">Explore</Link>
          <Link href="/upload" className="btn-primary">Upload</Link>
          <Link href="/login" className="text-sm">Log in</Link>
        </nav>
      </div>
    </header>
  );
}
