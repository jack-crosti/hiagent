import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { PageHeader } from '@/components/PageHeader';
import { StatCard } from '@/components/StatCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { formatNZD } from '@/services/commissionService';
import {
  DollarSign, TrendingUp, Receipt, Target, ArrowRightLeft, Plus,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { IncomeExpenseChart } from '@/components/dashboard/IncomeExpenseChart';
import { PipelineChart } from '@/components/dashboard/PipelineChart';
import { DemoModeCard } from '@/components/dashboard/DemoModeCard';

interface TxnRow { date: string; amount: number; type: string; }
interface DealRow { listing_name: string | null; deal_type: string; net_to_user_after_tax: number | null; probability: number | null; status: string | null; }

export default function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState({ totalIncome: 0, totalExpenses: 0, pendingGst: 0, dealsPipeline: 0, dealsCount: 0, isDemo: true });
  const [txns, setTxns] = useState<TxnRow[]>([]);
  const [deals, setDeals] = useState<DealRow[]>([]);
  const [logoUrl, setLogoUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    loadStats();
  }, [user]);

  async function loadStats() {
    const [{ data: dealsData }, { data: txnsData }, { data: gstPeriods }, { data: profile }] = await Promise.all([
      supabase.from('deals').select('*').eq('owner_user_id', user!.id).eq('status', 'pipeline'),
      supabase.from('transactions').select('amount, type, date').eq('owner_user_id', user!.id),
      supabase.from('gst_periods').select('net_gst, status').eq('owner_user_id', user!.id).eq('status', 'open'),
      supabase.from('profiles').select('avatar_url').eq('owner_user_id', user!.id).maybeSingle(),
    ]);

    setLogoUrl(profile?.avatar_url || null);

    const income = txnsData?.filter(t => t.type === 'credit').reduce((s, t) => s + Number(t.amount), 0) ?? 0;
    const expenses = txnsData?.filter(t => t.type === 'debit').reduce((s, t) => s + Math.abs(Number(t.amount)), 0) ?? 0;
    const gst = gstPeriods?.reduce((s, g) => s + Number(g.net_gst), 0) ?? 0;
    const pipeline = dealsData?.reduce((s, d) => s + Number(d.net_to_user_after_tax) * Number(d.probability), 0) ?? 0;
    const hasData = (dealsData?.length ?? 0) > 0 || (txnsData?.length ?? 0) > 0;

    setTxns((txnsData as TxnRow[]) ?? []);
    setDeals((dealsData as DealRow[]) ?? []);
    setStats({ totalIncome: income, totalExpenses: expenses, pendingGst: gst, dealsPipeline: pipeline, dealsCount: dealsData?.length ?? 0, isDemo: !hasData });
  }

  return (
    <>
      <PageHeader
        title="Dashboard"
        description={`Welcome back${stats.isDemo ? ' — try demo mode to explore' : ''}`}
        action={
          <div className="flex items-center gap-3">
            {logoUrl && (
              <img src={logoUrl} alt="Logo" className="h-8 w-auto object-contain rounded" />
            )}
            <Link to="/personal-finance">
              <Button size="sm"><Target size={16} className="mr-1.5" />View Goals</Button>
            </Link>
          </div>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-6">
        <StatCard title="Total Income" value={formatNZD(stats.totalIncome)} icon={<DollarSign size={20} />}
          trend={stats.totalIncome > 0 ? { value: 'This period', positive: true } : undefined} />
        <StatCard title="Total Expenses" value={formatNZD(stats.totalExpenses)} icon={<ArrowRightLeft size={20} />} />
        <StatCard title="Pending GST" value={formatNZD(stats.pendingGst)} icon={<Receipt size={20} />} subtitle="Current period" />
        <StatCard title="Pipeline Value" value={formatNZD(stats.dealsPipeline)} icon={<TrendingUp size={20} />}
          subtitle={`${stats.dealsCount} active deals`} />
      </div>

      {/* Charts */}
      {!stats.isDemo && (
        <div className="grid gap-4 md:grid-cols-2 mb-6">
          <IncomeExpenseChart transactions={txns} />
          <PipelineChart deals={deals} />
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2">
        <Card className="shadow-card">
          <CardHeader><CardTitle className="text-lg font-heading">Quick Actions</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            <Link to="/transactions" className="block">
              <Button variant="outline" className="w-full justify-start"><Plus size={16} className="mr-2" /> Add Transaction</Button>
            </Link>
            <Link to="/personal-finance" className="block">
              <Button variant="outline" className="w-full justify-start"><Target size={16} className="mr-2" /> Add New Listing</Button>
            </Link>
            <Link to="/gst" className="block">
              <Button variant="outline" className="w-full justify-start"><Receipt size={16} className="mr-2" /> Check GST Status</Button>
            </Link>
          </CardContent>
        </Card>

        {stats.isDemo && <DemoModeCard userId={user?.id ?? ''} onComplete={loadStats} />}

        {!stats.isDemo && (
          <Card className="shadow-card">
            <CardHeader><CardTitle className="text-lg font-heading">Recent Activity</CardTitle></CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">Your recent transactions and deals will appear here.</p>
            </CardContent>
          </Card>
        )}
      </div>
    </>
  );
}
