import { PageHeader } from '@/components/PageHeader';
import { EmptyState } from '@/components/EmptyState';
import { Megaphone } from 'lucide-react';

export default function MarketingPage() {
  return (
    <>
      <PageHeader
        title="Marketing Planner"
        description="Content calendar and campaigns aligned to your sales goals"
      />
      <EmptyState
        icon={Megaphone}
        title="Marketing Planner"
        description="Connect your social profiles and website to generate a monthly marketing plan aligned with your commission targets."
      />
    </>
  );
}
