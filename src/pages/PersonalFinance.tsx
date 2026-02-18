import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { PageHeader } from '@/components/PageHeader';
import { StatCard } from '@/components/StatCard';
import { EmptyState } from '@/components/EmptyState';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Target, TrendingUp, DollarSign, Plus, BarChart3, Pencil, Trash2 } from 'lucide-react';
import { formatNZD, generateScenarios, DEFAULT_SPLITS, type UserSplits } from '@/services/commissionService';
import { cn } from '@/lib/utils';
import { DealDialog } from '@/components/deals/DealDialog';
import { useToast } from '@/hooks/use-toast';

export default function PersonalFinancePage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [deals, setDeals] = useState<any[]>([]);
  const [goalPlan, setGoalPlan] = useState<any>(null);
  const [splits, setSplits] = useState<UserSplits>(DEFAULT_SPLITS);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingDeal, setEditingDeal] = useState<any>(null);

  useEffect(() => {
    if (!user) return;
    loadData();
  }, [user]);

  function loadData() {
    if (!user) return;
    Promise.all([
      supabase.from('deals').select('*').eq('owner_user_id', user.id).order('created_at', { ascending: false }),
      supabase.from('goal_plans').select('*').eq('owner_user_id', user.id).eq('is_active', true).maybeSingle(),
      supabase.from('profiles').select('withholding_rate, business_sale_user_share, business_sale_company_share, lease_user_share, lease_company_share, property_sale_user_share, property_sale_company_share, probability_threshold')
        .eq('owner_user_id', user.id).maybeSingle(),
    ]).then(([dealsRes, goalRes, profileRes]) => {
      setDeals(dealsRes.data ?? []);
      setGoalPlan(goalRes.data);
      if (profileRes.data) {
        setSplits({
          withholding_rate: profileRes.data.withholding_rate ?? 0.20,
          business_sale_user_share: profileRes.data.business_sale_user_share ?? 0.75,
          business_sale_company_share: profileRes.data.business_sale_company_share ?? 0.25,
          lease_user_share: profileRes.data.lease_user_share ?? 0.80,
          lease_company_share: profileRes.data.lease_company_share ?? 0.20,
          property_sale_user_share: profileRes.data.property_sale_user_share ?? 0.75,
          property_sale_company_share: profileRes.data.property_sale_company_share ?? 0.25,
        });
      }
      setLoading(false);
    });
  }

  async function deleteDeal(id: string) {
    await supabase.from('deals').delete().eq('id', id);
    setDeals(prev => prev.filter(d => d.id !== id));
    toast({ title: 'Deal deleted' });
  }

  async function closeDeal(id: string) {
    await supabase.from('deals').update({ status: 'closed', closed_at: new Date().toISOString() }).eq('id', id);
    loadData();
    toast({ title: 'Deal marked as closed' });
  }

  const closedDeals = deals.filter(d => d.status === 'closed');
  const pipelineDeals = deals.filter(d => d.status === 'pipeline');
  
  const earnedNet = closedDeals.reduce((s, d) => s + Number(d.net_to_user_after_tax), 0);
  const pipelineForecast = pipelineDeals.reduce((s, d) => s + Number(d.net_to_user_after_tax) * Number(d.probability), 0);
  const targetNet = goalPlan?.target_net_amount ?? 200000;
  const progressPercent = Math.min(100, (earnedNet / targetNet) * 100);
  const gap = Math.max(0, targetNet - earnedNet);

  const whrPct = Math.round(splits.withholding_rate * 100);

  const scenarios = generateScenarios({
    targetNetAmount: gap,
    splits,
    probabilityThreshold: goalPlan?.probability_threshold ?? 0.60,
    dealTypes: ['business_sale', 'lease'],
  });

  if (loading) {
    return (
      <>
        <PageHeader title="Personal Finance" />
        <div className="space-y-4">
          {[1,2,3].map(i => <div key={i} className="h-32 rounded-xl bg-muted animate-pulse" />)}
        </div>
      </>
    );
  }

  return (
    <>
      <PageHeader
        title="Personal Finance"
        description="Track your commission goals, pipeline, and scenarios"
        action={
          <Button size="sm" onClick={() => { setEditingDeal(null); setDialogOpen(true); }}>
            <Plus size={16} className="mr-1.5" />
            Add Deal
          </Button>
        }
      />

      <DealDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        deal={editingDeal}
        onSaved={loadData}
      />

      {/* Goal Card */}
      <Card className="shadow-card mb-6 border-primary/20">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="font-heading text-lg font-semibold">
                {goalPlan?.name ?? 'Net Commission Goal'}
              </h3>
              <p className="text-sm text-muted-foreground">
                Target: {formatNZD(targetNet)} net after withholding
              </p>
            </div>
            <div className="text-right">
              <p className="font-heading text-2xl font-bold text-primary">{formatNZD(earnedNet)}</p>
              <p className="text-xs text-muted-foreground">earned to date</p>
            </div>
          </div>
          <Progress value={progressPercent} className="h-3 mb-2" />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>{progressPercent.toFixed(0)}% complete</span>
            <span>{formatNZD(gap)} remaining</span>
          </div>
          {pipelineForecast > 0 && (
            <p className="mt-2 text-sm text-info">
              Pipeline forecast: {formatNZD(pipelineForecast)} (probability-weighted)
            </p>
          )}
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-3 mb-6">
        <StatCard title="Earned (Net)" value={formatNZD(earnedNet)} icon={<DollarSign size={20} />} />
        <StatCard title="Pipeline Forecast" value={formatNZD(pipelineForecast)} icon={<TrendingUp size={20} />} subtitle={`${pipelineDeals.length} deals`} />
        <StatCard title="Gap to Goal" value={formatNZD(gap)} icon={<Target size={20} />} />
      </div>

      {/* Deals Pipeline */}
      <Card className="shadow-card mb-6">
        <CardHeader>
          <CardTitle className="text-lg font-heading">Deals Pipeline</CardTitle>
        </CardHeader>
        <CardContent>
          {deals.length === 0 ? (
            <EmptyState
              icon={TrendingUp}
              title="No deals yet"
              description="Add your first deal to start tracking your commission pipeline."
              action={<Button size="sm" onClick={() => { setEditingDeal(null); setDialogOpen(true); }}><Plus size={16} className="mr-1.5" /> Add Deal</Button>}
            />
          ) : (
            <div className="space-y-3">
              {deals.map(deal => (
                <div key={deal.id} className="flex items-center justify-between rounded-lg border border-border p-4 hover:bg-muted/30 transition-colors">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-sm">{deal.listing_name}</span>
                      {deal.is_demo && <Badge variant="outline" className="text-xs">Demo</Badge>}
                      <Badge variant={deal.status === 'closed' ? 'default' : 'secondary'} className="text-xs capitalize">{deal.status}</Badge>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      <Badge variant="secondary" className="text-xs capitalize">{deal.deal_type.replace('_', ' ')}</Badge>
                      <span>{Math.round(deal.probability * 100)}% probability</span>
                      {deal.expected_close_date && (
                        <span>Close: {new Date(deal.expected_close_date).toLocaleDateString('en-NZ', { month: 'short', year: 'numeric' })}</span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <p className="font-heading font-semibold text-sm">{formatNZD(deal.net_to_user_after_tax)}</p>
                      <p className="text-xs text-muted-foreground">net to you</p>
                    </div>
                    <div className="flex gap-1">
                      {deal.status === 'pipeline' && (
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => closeDeal(deal.id)}>
                          <Target size={14} />
                        </Button>
                      )}
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => { setEditingDeal(deal); setDialogOpen(true); }}>
                        <Pencil size={14} />
                      </Button>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-destructive hover:text-destructive" onClick={() => deleteDeal(deal.id)}>
                        <Trash2 size={14} />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Scenarios */}
      {gap > 0 && (
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="text-lg font-heading flex items-center gap-2">
              <BarChart3 size={18} className="text-primary" />
              What's Needed to Hit Your Goal
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              {scenarios.map(scenario => (
                <div
                  key={scenario.type}
                  className={cn(
                    'rounded-xl border p-4 space-y-3',
                    scenario.type === 'realistic' ? 'border-primary/30 bg-primary/5' : 'border-border'
                  )}
                >
                  <div className="flex items-center justify-between">
                    <Badge variant={scenario.type === 'realistic' ? 'default' : 'secondary'} className="capitalize">
                      {scenario.type}
                    </Badge>
                    <span className="font-heading font-bold text-sm">{formatNZD(scenario.totalNet)}</span>
                  </div>
                  
                  <div className="space-y-1.5 text-xs">
                    {scenario.deals.map((d, i) => (
                      <div key={i} className="flex justify-between">
                        <span className="text-muted-foreground">
                          {d.count}× {d.deal_type.replace('_', ' ')} @ {d.sale_price ? formatNZD(d.sale_price) : 'min'}
                        </span>
                      </div>
                    ))}
                  </div>

                  <div className="border-t border-border pt-2 space-y-1 text-xs text-muted-foreground">
                    <div className="flex justify-between"><span>Gross</span><span>{formatNZD(scenario.totalGross)}</span></div>
                    <div className="flex justify-between"><span>Fees</span><span>-{formatNZD(scenario.totalFees)}</span></div>
                    <div className="flex justify-between"><span>Your share</span><span>{formatNZD(scenario.totalUserShare)}</span></div>
                    <div className="flex justify-between"><span>Less Withholding tax ({whrPct}%)</span><span>-{formatNZD(scenario.totalTax)}</span></div>
                    <div className="flex justify-between font-semibold text-foreground">
                      <span>Net to you</span><span>{formatNZD(scenario.totalNet)}</span>
                    </div>
                  </div>

                  <div className="pt-1">
                    {scenario.assumptions.map((a, i) => (
                      <p key={i} className="text-xs text-muted-foreground">• {a}</p>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </>
  );
}
