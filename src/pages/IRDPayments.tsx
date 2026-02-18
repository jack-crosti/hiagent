import { PageHeader } from '@/components/PageHeader';
import { EmptyState } from '@/components/EmptyState';
import { CreditCard } from 'lucide-react';

export default function IRDPaymentsPage() {
  return (
    <>
      <PageHeader
        title="IRD Payments"
        description="Step-by-step instructions for paying GST to Inland Revenue"
      />
      <EmptyState
        icon={CreditCard}
        title="No payment instructions"
        description="Create a payment instruction from your GST period to get step-by-step guidance on paying IRD."
      />
    </>
  );
}
