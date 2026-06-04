'use client';

import Link from 'next/link';
import { PageHeader } from '@/components/layout/AppShell';
import { adminModuleGroups } from '@/lib/config';
import styles from '@/components/layout/layout.module.css';

export default function AdminMorePage() {
  return (
    <>
      <PageHeader title="All modules" description="Administrative, technical, and intelligence hubs" />
      {adminModuleGroups.map((group) => (
        <section key={group.title} style={{ marginBottom: 24 }}>
          <h2 className="text-sm text-muted" style={{ marginBottom: 12, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            {group.title}
          </h2>
          <div className={styles.moduleGrid}>
            {group.modules.map((mod) => (
              <Link key={mod.href} href={mod.href} className={styles.moduleLink}>
                <h3>{mod.title}</h3>
                <p className="text-sm text-muted">{mod.desc}</p>
              </Link>
            ))}
          </div>
        </section>
      ))}
    </>
  );
}
