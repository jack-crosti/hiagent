import { PageHeader } from '@/components/PageHeader';
import { EmptyState } from '@/components/EmptyState';
import { FileText } from 'lucide-react';

export default function ReportsPage() {
  return (
    <>
      <PageHeader
        title="Reports"
        description="Generate and export PDF reports with your branding"
      />
      <EmptyState
        icon={FileText}
        title="Reports Center"
        description="Generate GST summaries, P&L snapshots, commission pipeline reports, goal scenarios, and monthly plans. Export as PDF or schedule email delivery."
      />
    </>
  );
}
