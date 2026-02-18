import { PageHeader } from '@/components/PageHeader';
import { EmptyState } from '@/components/EmptyState';
import { BookOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function LedgerPage() {
  return (
    <>
      <PageHeader
        title="Ledger"
        description="Double-entry bookkeeping with NZ chart of accounts"
      />
      <EmptyState
        icon={BookOpen}
        title="Ledger ready"
        description="Your chart of accounts will be set up when you add transactions or load demo data. Track debits, credits, and reconciliation in a Xero-like interface."
        action={<Button size="sm">View Chart of Accounts</Button>}
      />
    </>
  );
}
