import Link from 'next/link';
import styles from './layout.module.css';

export function QuickLinks({ links }) {
  return (
    <div className={styles.quickLinks}>
      {links.map((link) => (
        <Link key={link.href} href={link.href} className={styles.quickLink}>
          {link.label}
        </Link>
      ))}
    </div>
  );
}
