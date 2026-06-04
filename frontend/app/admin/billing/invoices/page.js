'use client';

import { useState } from 'react';
import { BackLink } from '@/components/layout/BackLink';
import { PageHeader } from '@/components/layout/AppShell';
import { Card, Button, Badge, DataTable } from '@/components/ui';
import { DataLoading, DataError } from '@/components/ui/DataState';
import { useLiveData } from '@/hooks/useLiveData';
import { api } from '@/lib/api';
import { ROUTES } from '@/lib/routes';

export default function InvoicesPage() {
  const [dlError, setDlError] = useState('');
  const { data: summary, loading: sLoading, error: sError, reload: sReload } = useLiveData(
    () => api.billingSummary(),
    [],
  );
  const { data: bills, loading: bLoading, error: bError, reload: bReload } = useLiveData(() => api.bills(), []);

  const downloadInvoice = async (billId) => {
    setDlError('');
    try {
      await api.downloadInvoicePdf(billId);
    } catch (err) {
      setDlError(err.message);
    }
  };

  if (sLoading || bLoading) return <DataLoading />;
  if (sError) return <DataError error={sError} onRetry={sReload} />;
  if (bError) return <DataError error={bError} onRetry={bReload} />;

  const rows = (bills ?? []).slice(0, 20).map((b) => ({
    id: b.invoice_number || b.id.slice(0, 8),
    period: b.period,
    amount: `${b.currency ?? 'KES'} ${Number(b.amount).toLocaleString()}`,
    status: <Badge variant={b.status === 'paid' ? 'success' : 'warning'}>{b.status}</Badge>,
    due: b.due,
    actions: (
      <Button type="button" variant="ghost" sm onClick={() => downloadInvoice(b.id)}>
        PDF
      </Button>
    ),
  }));

  return (
    <>
      <BackLink href={ROUTES.admin.billing} label="Back to billing" />
      <PageHeader title="Invoice management" description="Generate, download PDF invoices, and track payment status" />
      {dlError && (
        <p className="text-sm" style={{ color: 'var(--color-danger)', marginBottom: 12 }}>
          {dlError}
        </p>
      )}
      <div className="grid-2" style={{ marginBottom: 16 }}>
        <Card title="Batch invoicing">
          <p className="text-sm text-muted" style={{ marginBottom: 12 }}>
            Latest period: {summary.lastInvoiceRun} — {summary.totalBills} invoices in system
          </p>
          <p className="text-sm">Paid: {summary.paidCount} · Unpaid: {summary.unpaidCount}</p>
        </Card>
        <Card title="Outstanding">
          <Badge variant="warning">KES {Number(summary.outstanding).toLocaleString()}</Badge>
        </Card>
      </div>
      <Card title="Recent invoices">
        <DataTable
          columns={[
            { key: 'id', label: 'Invoice' },
            { key: 'period', label: 'Period' },
            { key: 'amount', label: 'Amount' },
            { key: 'due', label: 'Due' },
            { key: 'status', label: 'Status' },
            { key: 'actions', label: '' },
          ]}
          rows={rows}
        />
      </Card>
    </>
  );
}
