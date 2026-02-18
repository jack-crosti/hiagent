import { useState } from 'react';
import { PageHeader } from '@/components/PageHeader';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Zap, PiggyBank, Bell, FileText, Camera, ArrowRight } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Automation {
  id: string;
  title: string;
  description: string;
  icon: typeof Zap;
  badge: string;
  enabled: boolean;
  status: 'active' | 'setup_required' | 'coming_soon';
}

const DEFAULT_AUTOMATIONS: Automation[] = [
  {
    id: 'tax_provision',
    title: 'Tax Provisioning',
    description: 'Automatically set aside a percentage of each commission payment into a tax reserve bucket.',
    icon: PiggyBank,
    badge: 'Tax',
    enabled: false,
    status: 'setup_required',
  },
  {
    id: 'gst_reminder',
    title: 'GST Filing Reminders',
    description: 'Get notified 14 days and 7 days before each GST filing deadline.',
    icon: Bell,
    badge: 'GST',
    enabled: false,
    status: 'setup_required',
  },
  {
    id: 'invoice_tracking',
    title: 'Invoice Tracking',
    description: 'Track outstanding invoices and send automatic follow-ups for overdue amounts.',
    icon: FileText,
    badge: 'Billing',
    enabled: false,
    status: 'coming_soon',
  },
  {
    id: 'receipt_capture',
    title: 'Receipt Capture',
    description: 'Upload receipts via photo — auto-categorise and link to transactions.',
    icon: Camera,
    badge: 'Expenses',
    enabled: false,
    status: 'coming_soon',
  },
];

export default function AutomationsPage() {
  const { toast } = useToast();
  const [automations, setAutomations] = useState(DEFAULT_AUTOMATIONS);

  function toggleAutomation(id: string) {
    setAutomations(prev => prev.map(a => {
      if (a.id === id) {
        if (a.status === 'coming_soon') {
          toast({ title: 'Coming soon', description: 'This automation is currently in development.' });
          return a;
        }
        toast({
          title: a.enabled ? 'Automation disabled' : 'Automation enabled',
          description: a.title,
        });
        return { ...a, enabled: !a.enabled };
      }
      return a;
    }));
  }

  return (
    <>
      <PageHeader
        title="Automations"
        description="Tax provisioning, reminders, invoicing, and receipt capture"
      />

      <div className="grid gap-4 sm:grid-cols-2">
        {automations.map(auto => (
          <Card key={auto.id} className="shadow-card">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                    <auto.icon size={20} className="text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-base font-heading">{auto.title}</CardTitle>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="secondary" className="text-xs">{auto.badge}</Badge>
                      {auto.status === 'coming_soon' && (
                        <Badge variant="outline" className="text-xs text-muted-foreground">Coming Soon</Badge>
                      )}
                    </div>
                  </div>
                </div>
                <Switch
                  checked={auto.enabled}
                  onCheckedChange={() => toggleAutomation(auto.id)}
                  disabled={auto.status === 'coming_soon'}
                />
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">{auto.description}</p>
              {auto.status === 'setup_required' && auto.enabled && (
                <Button variant="outline" size="sm" className="mt-3">
                  Configure <ArrowRight size={14} className="ml-1" />
                </Button>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </>
  );
}
