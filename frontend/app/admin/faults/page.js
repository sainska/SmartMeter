'use client';

import { BackLink } from '@/components/layout/BackLink';
import { PageHeader } from '@/components/layout/AppShell';
import { Card, ListItem, Badge, Button } from '@/components/ui';
import { DataLoading, DataError } from '@/components/ui/DataState';
import { useLiveData } from '@/hooks/useLiveData';
import { api } from '@/lib/api';
import { IconTool } from '@/components/icons';
import { ROUTES } from '@/lib/routes';

export default function FaultCenterPage() {
  const { data: faults, loading, error, reload } = useLiveData(() => api.faultSummary(), []);

  if (loading) return <DataLoading />;
  if (error) return <DataError error={error} onRetry={reload} />;

  return (
    <>
      <BackLink href={ROUTES.admin.operations} label="Back to operations center" />
      <PageHeader title="Fault diagnostics" description="Malfunctions by category (live from incidents)" />

      <Card>
        {(faults ?? []).map((f) => (
          <ListItem
            key={f.title}
            href={ROUTES.admin.incidents}
            icon={IconTool}
            title={f.title}
            meta={<Badge variant={f.variant}>{f.count} active</Badge>}
            action={<Button href={ROUTES.admin.incidents} sm variant="ghost">View incidents</Button>}
          />
        ))}
      </Card>
    </>
  );
}
