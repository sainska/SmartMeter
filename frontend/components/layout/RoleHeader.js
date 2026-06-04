'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useSidebar } from '@/context/SidebarContext';
import { ROLES } from '@/lib/roles';
import { ROUTES } from '@/lib/routes';
import { getPageLabel } from '@/lib/navLabels';
import styles from './layout.module.css';

export function RoleHeader({ title, subtitle }) {
  const pathname = usePathname();
  const { role } = useAuth();
  const { toggleMobile } = useSidebar();
  const roleInfo = ROLES[role] ?? ROLES.consumer;
  const pageLabel = getPageLabel(pathname);

  return (
    <header className={styles.appHeader}>
      <div className={styles.appHeaderStart}>
        <button
          type="button"
          className={styles.menuToggle}
          aria-label="Open navigation menu"
          onClick={toggleMobile}
        >
          <span className={styles.menuBar} />
          <span className={styles.menuBar} />
          <span className={styles.menuBar} />
        </button>
        <div className={styles.appHeaderTitles}>
          <div className={styles.appHeaderTitle}>{pageLabel || title}</div>
          {subtitle && (
            <div className={styles.appHeaderBreadcrumb}>
              <span className={styles.breadcrumbMuted}>{subtitle}</span>
            </div>
          )}
        </div>
      </div>
      <div className={styles.appHeaderEnd}>
        <span className={styles.headerSync}>Synced just now</span>
        <Link href={ROUTES.roleSelection} className={styles.roleBadge} title="Switch role">
          {roleInfo.title}
        </Link>
      </div>
    </header>
  );
}
