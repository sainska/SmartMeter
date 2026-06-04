import Link from 'next/link';

export function BackLink({ href, label = 'Back' }) {
  return (
    <Link
      href={href}
      className="text-sm"
      style={{ fontWeight: 600, display: 'inline-block', marginBottom: 12 }}
    >
      {label}
    </Link>
  );
}
