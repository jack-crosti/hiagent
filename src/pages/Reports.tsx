import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { PageHeader } from '@/components/PageHeader';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { FileText, Download, Receipt, TrendingUp, Target, BarChart3, Calendar } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const REPORT_TYPES = [
  {
    id: 'gst_summary',
    title: 'GST Summary',
    description: 'GST collected, paid, and net amounts for each filing period',
    icon: Receipt,
    badge: 'Finance',
  },
  {
    id: 'pl_snapshot',
    title: 'Profit & Loss',
    description: 'Income vs expenses breakdown by category',
    icon: BarChart3,
    badge: 'Finance',
  },
  {
    id: 'commission_pipeline',
    title: 'Commission Pipeline',
    description: 'All deals with commission calculations, probability weighting, and projections',
    icon: TrendingUp,
    badge: 'Sales',
  },
  {
    id: 'goal_scenarios',
    title: 'Goal Scenarios',
    description: 'Conservative, realistic, and aggressive pathways to hit your net target',
    icon: Target,
    badge: 'Planning',
  },
  {
    id: 'monthly_plan',
    title: 'Monthly Action Plan',
    description: 'Target deals, marketing actions, and milestones by month',
    icon: Calendar,
    badge: 'Planning',
  },
];

export default function ReportsPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [generating, setGenerating] = useState<string | null>(null);

  async function handleGenerate(reportId: string) {
    setGenerating(reportId);
    // Simulated generation — will connect to edge function for PDF export
    await new Promise(r => setTimeout(r, 1500));
    setGenerating(null);
    toast({
      title: 'Report generated',
      description: 'PDF export will be available when the backend function is connected.',
    });
  }

  return (
    <>
      <PageHeader title="Reports" description="Generate and export branded PDF reports" />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {REPORT_TYPES.map(report => (
          <Card key={report.id} className="shadow-card hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                  <report.icon size={20} className="text-primary" />
                </div>
                <Badge variant="secondary" className="text-xs">{report.badge}</Badge>
              </div>
              <CardTitle className="text-base font-heading mt-3">{report.title}</CardTitle>
              <CardDescription className="text-xs">{report.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                variant="outline"
                size="sm"
                className="w-full"
                onClick={() => handleGenerate(report.id)}
                disabled={generating === report.id}
              >
                {generating === report.id ? (
                  'Generating...'
                ) : (
                  <>
                    <Download size={14} className="mr-1.5" />
                    Generate Report
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </>
  );
}
