import { PageHeader } from '@/components/PageHeader';
import { EmptyState } from '@/components/EmptyState';
import { Brain } from 'lucide-react';

export default function TaxAdvisorPage() {
  return (
    <>
      <PageHeader
        title="Tax Advisor"
        description="AI-powered NZ tax guidance — informational only, not financial advice"
      />
      <EmptyState
        icon={Brain}
        title="Tax Advisor"
        description="Ask questions about NZ tax, GST, deductions, and commission structures. The advisor uses your data to provide personalised guidance with citations."
      />
    </>
  );
}
