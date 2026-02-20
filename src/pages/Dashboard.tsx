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
            <Link to="/personal-finance">
              <Button size="sm"><Target size={16} className="mr-1.5" />View Goals</Button>
            </Link>
          </div>
        }
      />

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        <StatCard title="Total Income" value={formatNZD(stats.totalIncome)} icon={<DollarSign size={22} />}
          trend={stats.totalIncome > 0 ? { value: 'This period', positive: true } : undefined} className="animate-fade-in" />
        <StatCard title="Total Expenses" value={formatNZD(stats.totalExpenses)} icon={<ArrowRightLeft size={22} />} className="animate-fade-in [animation-delay:50ms]" />
        <StatCard title="Pending GST" value={formatNZD(stats.pendingGst)} icon={<Receipt size={22} />} subtitle="Current period" className="animate-fade-in [animation-delay:100ms]" />
        <StatCard title="Pipeline Value" value={formatNZD(stats.dealsPipeline)} icon={<TrendingUp size={22} />}
          subtitle={`${stats.dealsCount} active deals`} className="animate-fade-in [animation-delay:150ms]" />
      </div>

      {/* Charts — bento grid */}
      {!stats.isDemo && (
        <div className="grid gap-6 lg:grid-cols-3 mb-8">
          <div className="lg:col-span-2">
            <IncomeExpenseChart transactions={txns} />
          </div>
          <PipelineChart deals={deals} />
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Card>
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
        </div>

        {stats.isDemo && <DemoModeCard userId={user?.id ?? ''} onComplete={loadStats} />}

        {!stats.isDemo && (
          <Card>
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
