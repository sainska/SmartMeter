'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { RoleHeader } from './RoleHeader';
import { SideNav } from './SideNav';
import { SidebarProvider, useSidebar } from '@/context/SidebarContext';
import { useAuth } from '@/context/AuthContext';
import { IconBolt } from '../icons';
import styles from './layout.module.css';

function AppShellInner({ title, subtitle, navSections, children }) {
  const pathname = usePathname();
  const { signOut, profile, consumer } = useAuth();
  const { collapsed, mobileOpen, toggleCollapsed, closeMobile, hydrated } = useSidebar();

  useEffect(() => {
    closeMobile();
  }, [pathname, closeMobile]);

  useEffect(() => {
    if (!mobileOpen) return undefined;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [mobileOpen]);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', 'dark');
  }, []);

  const displayName = consumer?.full_name || profile?.full_name || profile?.email || 'User';
  const initials = displayName
    .split(' ')
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  const sideClass = [
    styles.sideNav,
    hydrated && collapsed ? styles.sideNavCollapsed : '',
    mobileOpen ? styles.sideNavOpen : '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={styles.portalShell}>
      {mobileOpen && (
        <button
          type="button"
          className={styles.sideNavBackdrop}
          aria-label="Close menu"
          onClick={closeMobile}
        />
      )}

      <aside className={sideClass} aria-label="Main navigation">
        <div className={styles.sideNavBrand}>
          <div className={styles.brandLockup}>
            <span className={styles.brandIcon} aria-hidden>
              <IconBolt size={22} />
            </span>
            {!collapsed && (
              <div>
                <span className={styles.brandName}>SmartMeterX</span>
                <span className={styles.brandTag}>Rural Edition</span>
              </div>
            )}
          </div>
          <button
            type="button"
            className={styles.sideNavCollapseBtn}
            onClick={toggleCollapsed}
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            title={collapsed ? 'Expand' : 'Collapse'}
          >
            {collapsed ? '»' : '«'}
          </button>
        </div>

        {!collapsed && (
          <div className={styles.sideNavUser}>
            <span className={styles.sideNavAvatar}>{initials}</span>
            <div className={styles.sideNavUserMeta}>
              <span className={styles.sideNavUserName}>{displayName}</span>
              <span className={styles.sideNavUserStatus}>Active</span>
            </div>
          </div>
        )}

        <SideNav navSections={navSections} onNavigate={closeMobile} />

        <div className={styles.sideNavFooter}>
          {!collapsed && (
            <p className={styles.sideNavStatus}>
              <span className={styles.statusDot} /> All systems operational
            </p>
          )}
          <button
            type="button"
            className={styles.sideNavSignOut}
            onClick={() => signOut()}
            title="Sign out"
          >
            {collapsed ? '⎋' : 'Sign out'}
          </button>
        </div>
      </aside>

      <div
        className={`${styles.appBody} ${hydrated && collapsed ? styles.appBodyCollapsed : ''}`}
      >
        <RoleHeader title={title} subtitle={subtitle} />
        <main className={styles.appMain}>{children}</main>
      </div>
    </div>
  );
}

export function AppShell({ title, subtitle, navSections, children }) {
  return (
    <SidebarProvider>
      <AppShellInner title={title} subtitle={subtitle} navSections={navSections}>
        {children}
      </AppShellInner>
    </SidebarProvider>
  );
}

export function PageHeader({ title, description, action, live }) {
  return (
    <div className={styles.pageHeader}>
      <div className={styles.pageHeaderRow}>
        <div>
          <div className={styles.pageHeaderTitleRow}>
            <h1>{title}</h1>
            {live && <span className={styles.liveBadge}>Live</span>}
          </div>
          {description && <p className="text-muted text-sm">{description}</p>}
        </div>
        {action}
      </div>
    </div>
  );
}
