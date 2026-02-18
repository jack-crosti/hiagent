import { PageHeader } from '@/components/PageHeader';
import { EmptyState } from '@/components/EmptyState';
import { Palette } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function CustomizationPage() {
  return (
    <>
      <PageHeader
        title="Customization"
        description="Brand your app, reports, and emails"
      />
      <EmptyState
        icon={Palette}
        title="Quick Setup"
        description="Enter your website URL to scan your brand — logo, colours, and fonts. Customise how branding applies to the app UI, PDF exports, and emails."
        action={<Button size="sm">Start Brand Setup</Button>}
      />
    </>
  );
}
