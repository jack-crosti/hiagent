import { PageHeader } from '@/components/PageHeader';
import { EmptyState } from '@/components/EmptyState';
import { Zap } from 'lucide-react';

export default function AutomationsPage() {
  return (
    <>
      <PageHeader
        title="Automations"
        description="Tax provisioning, reminders, invoicing, and receipt capture"
      />
      <EmptyState
        icon={Zap}
        title="Automations"
        description="Set up tax provisioning buckets, GST reminders, invoice tracking, and receipt capture. All linked to your ledger with approval flows."
      />
    </>
  );
}
