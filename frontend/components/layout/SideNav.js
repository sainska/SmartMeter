'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useNavBadges } from '@/hooks/useNavBadges';
import { useSidebar } from '@/context/SidebarContext';
import styles from './layout.module.css';

function isActive(pathname, item) {
  const paths = item.match || [item.href];
  return paths.some(
    (p) => pathname === p || (p !== '/' && pathname?.startsWith(p)),
  );
}

export function SideNav({ navSections, onNavigate }) {
  const pathname = usePathname();
  const { collapsed } = useSidebar();
  const { data: badges } = useNavBadges();

  const badgeCount = (key) => {
    if (!key || !badges) return 0;
    const n = badges[key];
    return typeof n === 'number' && n > 0 ? n : 0;
  };

  return (
    <nav
      className={`${styles.sideNavLinks} ${collapsed ? styles.sideNavLinksCollapsed : ''}`}
      aria-label="Portal modules"
    >
      {navSections.map((section) => (
        <div key={section.title} className={styles.navSection}>
          {!collapsed && (
            <div className={styles.navSectionTitle}>{section.title}</div>
          )}
          <ul className={styles.navSectionList}>
            {section.items.map((item) => {
              const active = isActive(pathname, item);
              const Icon = item.icon;
              const count = badgeCount(item.badge);
              return (
                <li key={`${section.title}-${item.href}-${item.label}`}>
                  <Link
                    href={item.href}
                    className={`${styles.sideNavItem} ${active ? styles.sideNavItemActive : ''}`}
                    onClick={onNavigate}
                    title={collapsed ? item.label : undefined}
                  >
                    {Icon && <Icon size={20} />}
                    {!collapsed && <span className={styles.sideNavLabel}>{item.label}</span>}
                    {count > 0 && (
                      <span className={styles.navBadge} aria-label={`${count} pending`}>
                        {count > 99 ? '99+' : count}
                      </span>
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </nav>
  );
}
