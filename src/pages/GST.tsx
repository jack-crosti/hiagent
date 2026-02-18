import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { PageHeader } from '@/components/PageHeader';
import { StatCard } from '@/components/StatCard';
import { EmptyState } from '@/components/EmptyState';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Receipt } from 'lucide-react';
import { formatNZD } from '@/services/commissionService';

export default function GSTPage() {
  const { user } = useAuth();
  const [periods, setPeriods] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    supabase.from('gst_periods').select('*').eq('owner_user_id', user.id)
      .order('period_start', { ascending: false })
      .then(({ data }) => { setPeriods(data ?? []); setLoading(false); });
  }, [user]);

  const currentPeriod = periods[0];

  return (
    <>
      <PageHeader title="GST" description="Track GST periods, filings, and health checks — 15% NZ rate" />
      
      {loading ? (
        <div className="h-32 rounded-xl bg-muted animate-pulse" />
      ) : periods.length === 0 ? (
        <EmptyState icon={Receipt} title="No GST periods" description="GST periods will be created when you start tracking income and expenses." />
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-3 mb-6">
            <StatCard title="GST Collected" value={formatNZD(currentPeriod?.gst_collected ?? 0)} />
            <StatCard title="GST Paid" value={formatNZD(currentPeriod?.gst_paid ?? 0)} />
            <StatCard title="Net GST Due" value={formatNZD(currentPeriod?.net_gst ?? 0)} />
          </div>

          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="text-lg font-heading">GST Periods</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {periods.map(p => (
                  <div key={p.id} className="flex items-center justify-between rounded-lg border border-border p-4">
                    <div>
                      <span className="text-sm font-medium">
                        {new Date(p.period_start).toLocaleDateString('en-NZ', { month: 'short', year: 'numeric' })} — {new Date(p.period_end).toLocaleDateString('en-NZ', { month: 'short', year: 'numeric' })}
                      </span>
                      {p.is_demo && <Badge variant="outline" className="ml-2 text-xs">Demo</Badge>}
                      <p className="text-xs text-muted-foreground mt-0.5">
                        Due: {p.due_date ? new Date(p.due_date).toLocaleDateString('en-NZ') : 'TBC'}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-heading font-semibold text-sm">{formatNZD(p.net_gst)}</p>
                      <Badge variant={p.status === 'open' ? 'secondary' : 'default'} className="text-xs capitalize mt-1">
                        {p.filing_status.replace('_', ' ')}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </>
  );
}
