'use client';

import { useState } from 'react';
import { PageHeader } from '@/components/layout/AppShell';
import { Card, DataTable, Badge, Button } from '@/components/ui';
import { DataLoading, DataError } from '@/components/ui/DataState';
import { useLiveData } from '@/hooks/useLiveData';
import { api } from '@/lib/api';
import { ROUTES } from '@/lib/routes';

export default function ConsumerBillsPage() {
  const [dlError, setDlError] = useState('');
  const { data: bills, loading, error, reload } = useLiveData(() => api.bills(), []);

  const downloadInvoice = async (billId) => {
    setDlError('');
    try {
      await api.downloadInvoicePdf(billId);
    } catch (err) {
      setDlError(err.message);
    }
  };

  if (loading) return <DataLoading />;
  if (error) return <DataError error={error} onRetry={reload} />;

  const rows = (bills ?? []).map((b) => ({
    id: b.invoice_number || b.id.slice(0, 8),
    period: b.period,
    amount: `${b.currency ?? 'KES'} ${Number(b.amount).toLocaleString()}`,
    due: b.due,
    status: (
      <Badge variant={b.status === 'paid' ? 'success' : b.status === 'unpaid' ? 'warning' : 'neutral'}>
        {b.status}
      </Badge>
    ),
    actions: (
      <Button type="button" variant="ghost" sm onClick={() => downloadInvoice(b.id)}>
        Invoice PDF
      </Button>
    ),
  }));

  return (
    <>
      <PageHeader
        title="Bills & invoices"
        description="Download invoice PDFs and pay via M-Pesa STK push"
        action={<Button href={ROUTES.consumer.payments}>Pay now</Button>}
      />
      {dlError && (
        <p className="text-sm" style={{ color: 'var(--color-danger)', marginBottom: 12 }}>
          {dlError}
        </p>
      )}
      <Card>
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
