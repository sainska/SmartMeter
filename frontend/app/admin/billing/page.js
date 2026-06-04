'use client';

import Link from 'next/link';
import { PageHeader } from '@/components/layout/AppShell';
import styles from '@/components/layout/layout.module.css';
import { ROUTES } from '@/lib/routes';

export default function BillingModulePage() {
  return (
    <>
      <PageHeader title="Billing & tariff management" description="Tariffs, invoices, and financial reporting" />

      <div className={styles.moduleGrid}>
        <Link href={ROUTES.admin.tariffs} className={styles.moduleLink}>
          <h3>Tariff management</h3>
          <p className="text-sm text-muted">Tier pricing and rural subsidies</p>
        </Link>
        <Link href={ROUTES.admin.invoices} className={styles.moduleLink}>
          <h3>Invoice management</h3>
          <p className="text-sm text-muted">Batch and scheduled invoicing</p>
        </Link>
        <Link href={ROUTES.admin.revenue} className={styles.moduleLink}>
          <h3>Revenue tracking</h3>
          <p className="text-sm text-muted">Collections and outstanding balances</p>
        </Link>
      </div>
    </>
  );
}
