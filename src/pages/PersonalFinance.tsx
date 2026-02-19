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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Target, TrendingUp, DollarSign, Plus, BarChart3, Pencil, Trash2, Settings2, Loader2 } from 'lucide-react';
import { formatNZD, generateScenarios, DEFAULT_SPLITS, type UserSplits } from '@/services/commissionService';
import { cn } from '@/lib/utils';
import { DealDialog } from '@/components/deals/DealDialog';
import { useToast } from '@/hooks/use-toast';

const DEAL_STATUSES = [
  { value: 'on_market', label: 'On Market', color: 'bg-blue-500' },
  { value: 'under_contract', label: 'Under Contract', color: 'bg-amber-500' },
  { value: 'sold', label: 'Sold', color: 'bg-red-500' },
] as const;

export default function PersonalFinancePage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [deals, setDeals] = useState<any[]>([]);
  const [goalPlan, setGoalPlan] = useState<any>(null);
  const [splits, setSplits] = useState<UserSplits>(DEFAULT_SPLITS);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingDeal, setEditingDeal] = useState<any>(null);

  // Goal editing
  const [goalDialogOpen, setGoalDialogOpen] = useState(false);
  const [goalForm, setGoalForm] = useState({ name: 'Annual Goal', target: 200000, start: '', end: '' });
  const [savingGoal, setSavingGoal] = useState(false);

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

  function openGoalDialog() {
    const currentYear = new Date().getFullYear();
    setGoalForm({
      name: goalPlan?.name || 'Annual Goal',
      target: goalPlan?.target_net_amount || 200000,
      start: goalPlan?.period_start || `${currentYear}-04-01`,
      end: goalPlan?.period_end || `${currentYear + 1}-03-31`,
    });
    setGoalDialogOpen(true);
  }

  async function saveGoal() {
    if (!user) return;
    setSavingGoal(true);
    const { error } = await supabase.from('goal_plans').upsert({
      owner_user_id: user.id,
      name: goalForm.name,
      target_net_amount: goalForm.target,
      period_start: goalForm.start,
      period_end: goalForm.end,
      is_active: true,
    }, { onConflict: 'owner_user_id' });

    if (error) {
      await supabase.from('goal_plans').insert({
        owner_user_id: user.id,
        name: goalForm.name,
        target_net_amount: goalForm.target,
        period_start: goalForm.start,
        period_end: goalForm.end,
        is_active: true,
      });
    }

    setSavingGoal(false);
    setGoalDialogOpen(false);
    toast({ title: 'Goal updated' });
    loadData();
  }

  async function deleteDeal(id: string) {
    await supabase.from('deals').delete().eq('id', id);
    setDeals(prev => prev.filter(d => d.id !== id));
    toast({ title: 'Deal deleted' });
  }

  async function updateDealStatus(id: string, newStatus: string) {
    const updates: Record<string, any> = { status: newStatus };
    if (newStatus === 'sold') {
      updates.closed_at = new Date().toISOString();
      updates.probability = 1;
    }
    await supabase.from('deals').update(updates).eq('id', id);
    loadData();
    toast({ title: newStatus === 'sold' ? 'Deal marked as Sold' : 'Status updated' });
  }

  // Sold deals go to Earned tab, everything else is Pipeline
  const soldDeals = deals.filter(d => d.status === 'sold' || d.status === 'closed');
  const pipelineDeals = deals.filter(d => d.status !== 'sold' && d.status !== 'closed');
  
  const earnedNet = soldDeals.reduce((s, d) => s + Number(d.net_to_user_after_tax), 0);
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

  function DealCard({ deal }: { deal: any }) {
    const currentStatus = deal.status === 'closed' ? 'sold' : (deal.status || 'on_market');
    const isSold = currentStatus === 'sold';

    return (
      <div className="flex items-center justify-between rounded-lg border border-border p-4 hover:bg-muted/30 transition-colors">
        <div className="space-y-2 flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-medium text-sm">{deal.listing_name}</span>
            {deal.is_demo && <Badge variant="outline" className="text-xs">Demo</Badge>}
            {isSold && (
              <Badge className="bg-red-500 text-white text-xs font-bold">SOLD</Badge>
            )}
          </div>
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <Badge variant="secondary" className="text-xs capitalize">{deal.deal_type.replace('_', ' ')}</Badge>
            {!isSold && <span>{Math.round(deal.probability * 100)}% probability</span>}
            {deal.expected_close_date && (
              <span>Close: {new Date(deal.expected_close_date).toLocaleDateString('en-NZ', { month: 'short', year: 'numeric' })}</span>
            )}
          </div>
          {/* Status toggle */}
          {!isSold && (
            <div className="flex gap-1 pt-1">
              {DEAL_STATUSES.map(s => (
                <button
                  key={s.value}
                  onClick={() => updateDealStatus(deal.id, s.value)}
                  className={cn(
                    'rounded-full px-3 py-1 text-xs font-medium transition-all border',
                    currentStatus === s.value
                      ? `${s.color} text-white border-transparent`
                      : 'border-border text-muted-foreground hover:border-foreground/30'
                  )}
                >
                  {s.label}
                </button>
              ))}
            </div>
          )}
        </div>
        <div className="flex items-center gap-3 ml-3">
          <div className="text-right">
            <p className="font-heading font-semibold text-sm">{formatNZD(deal.net_to_user_after_tax)}</p>
            <p className="text-xs text-muted-foreground">net to you</p>
          </div>
          <div className="flex gap-1">
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => { setEditingDeal(deal); setDialogOpen(true); }}>
              <Pencil size={14} />
            </Button>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-destructive hover:text-destructive" onClick={() => deleteDeal(deal.id)}>
              <Trash2 size={14} />
            </Button>
          </div>
        </div>
      </div>
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

      {/* Goal Dialog */}
      <Dialog open={goalDialogOpen} onOpenChange={setGoalDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="font-heading">Set Commission Goal</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>Goal Name</Label>
              <Input value={goalForm.name} onChange={(e) => setGoalForm(f => ({ ...f, name: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label>Net Commission Target ($)</Label>
              <Input type="number" min={0} step={1000} value={goalForm.target}
                onChange={(e) => setGoalForm(f => ({ ...f, target: Number(e.target.value) || 0 }))} />
              <div className="flex flex-wrap gap-2 pt-1">
                {[100000, 150000, 200000, 250000, 300000, 500000].map((amt) => (
                  <button
                    key={amt}
                    onClick={() => setGoalForm(f => ({ ...f, target: amt }))}
                    className={`rounded-full border px-2.5 py-0.5 text-xs transition-all ${
                      goalForm.target === amt
                        ? 'border-primary bg-primary/10 text-primary font-medium'
                        : 'border-border text-muted-foreground hover:border-primary/40'
                    }`}
                  >
                    {formatNZD(amt)}
                  </button>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs">Period Start</Label>
                <Input type="date" value={goalForm.start} onChange={(e) => setGoalForm(f => ({ ...f, start: e.target.value }))} />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Period End</Label>
                <Input type="date" value={goalForm.end} onChange={(e) => setGoalForm(f => ({ ...f, end: e.target.value }))} />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setGoalDialogOpen(false)}>Cancel</Button>
            <Button onClick={saveGoal} disabled={savingGoal}>
              {savingGoal && <Loader2 size={14} className="mr-1.5 animate-spin" />}
              Save Goal
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

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
            <div className="flex items-center gap-3">
              <div className="text-right">
                <p className="font-heading text-2xl font-bold text-primary">{formatNZD(earnedNet)}</p>
                <p className="text-xs text-muted-foreground">earned to date</p>
              </div>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={openGoalDialog}>
                <Settings2 size={16} className="text-muted-foreground" />
              </Button>
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

      {/* Deals with Tabs */}
      <Card className="shadow-card mb-6">
        <CardHeader>
          <CardTitle className="text-lg font-heading">Deals</CardTitle>
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
            <Tabs defaultValue="pipeline">
              <TabsList className="mb-4">
                <TabsTrigger value="pipeline">Pipeline ({pipelineDeals.length})</TabsTrigger>
                <TabsTrigger value="earned">Earned ({soldDeals.length})</TabsTrigger>
              </TabsList>
              <TabsContent value="pipeline">
                {pipelineDeals.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-6">No active pipeline deals. All deals have been sold!</p>
                ) : (
                  <div className="space-y-3">
                    {pipelineDeals.map(deal => <DealCard key={deal.id} deal={deal} />)}
                  </div>
                )}
              </TabsContent>
              <TabsContent value="earned">
                {soldDeals.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-6">No sold deals yet. Mark a deal as Sold to see it here.</p>
                ) : (
                  <div className="space-y-3">
                    {soldDeals.map(deal => <DealCard key={deal.id} deal={deal} />)}
                  </div>
                )}
              </TabsContent>
            </Tabs>
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