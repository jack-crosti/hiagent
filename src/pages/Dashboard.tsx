import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useUserType } from '@/contexts/UserTypeContext';
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

interface TxnRow { date: string; amount: number; type: string; is_demo?: boolean | null; }
interface DealRow { listing_name: string | null; deal_type: string; net_to_user_after_tax: number | null; probability: number | null; status: string | null; is_demo?: boolean | null; }

export default function Dashboard() {
  const { user } = useAuth();
  const { isBroker } = useUserType();
  const [stats, setStats] = useState({ totalIncome: 0, totalExpenses: 0, pendingGst: 0, dealsPipeline: 0, dealsCount: 0, isDemo: true, hasDemoData: false });
  const [txns, setTxns] = useState<TxnRow[]>([]);
  const [deals, setDeals] = useState<DealRow[]>([]);
  const [firstName, setFirstName] = useState('');

  useEffect(() => {
    if (!user) return;
    loadStats();
    supabase.from('profiles').select('first_name').eq('owner_user_id', user.id).maybeSingle()
      .then(({ data }) => setFirstName(data?.first_name || user.email?.split('@')[0] || ''));
  }, [user]);

  async function loadStats() {
    const [{ data: dealsData }, { data: txnsData }, { data: gstPeriods }, { data: profile }] = await Promise.all([
      supabase.from('deals').select('*').eq('owner_user_id', user!.id).neq('status', 'closed'),
      supabase.from('transactions').select('amount, type, date, is_demo').eq('owner_user_id', user!.id),
      supabase.from('gst_periods').select('net_gst, status').eq('owner_user_id', user!.id).eq('status', 'open'),
      supabase.from('profiles').select('avatar_url').eq('owner_user_id', user!.id).maybeSingle(),
    ]);

    const income = txnsData?.filter(t => t.type === 'credit').reduce((s, t) => s + Number(t.amount), 0) ?? 0;
    const expenses = txnsData?.filter(t => t.type === 'debit').reduce((s, t) => s + Math.abs(Number(t.amount)), 0) ?? 0;
    const gst = gstPeriods?.reduce((s, g) => s + Number(g.net_gst), 0) ?? 0;
    const pipeline = dealsData?.reduce((s, d) => s + Number(d.net_to_user_after_tax) * Number(d.probability), 0) ?? 0;
    const hasData = (dealsData?.length ?? 0) > 0 || (txnsData?.length ?? 0) > 0;
    const hasDemoData = dealsData?.some(d => d.is_demo) || txnsData?.some(t => t.is_demo) || false;

    setTxns((txnsData as TxnRow[]) ?? []);
    setDeals((dealsData as DealRow[]) ?? []);
    setStats({ totalIncome: income, totalExpenses: expenses, pendingGst: gst, dealsPipeline: pipeline, dealsCount: dealsData?.length ?? 0, isDemo: !hasData, hasDemoData });
  }

  return (
    <>
      <PageHeader
        title="Dashboard"
        description={`Hi, ${firstName}${stats.isDemo ? ' — try demo mode to explore' : ''}`}
        action={
          <div className="flex items-center gap-3">
            <Link to="/personal-finance">
              <Button size="sm"><Target size={16} className="mr-1.5" />View Goals</Button>
            </Link>
          </div>
        }
      />

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-8 scroll-reveal-stagger">
        <Link to="/transactions" className="block h-full scroll-reveal">
          <StatCard title="Total Income" value={formatNZD(stats.totalIncome)} icon={<DollarSign size={22} />}
            trend={stats.totalIncome > 0 ? { value: 'This period', positive: true } : undefined} className="cursor-pointer h-full" />
        </Link>
        <Link to="/transactions" className="block h-full scroll-reveal">
          <StatCard title="Total Expenses" value={formatNZD(stats.totalExpenses)} icon={<ArrowRightLeft size={22} />} className="cursor-pointer h-full" />
        </Link>
        <Link to="/gst" className="block h-full scroll-reveal">
          <StatCard title="Pending GST" value={formatNZD(stats.pendingGst)} icon={<Receipt size={22} />} subtitle="Current period" className="cursor-pointer h-full" />
        </Link>
        <Link to="/personal-finance" className="block h-full scroll-reveal">
          <StatCard title="Pipeline Value" value={formatNZD(stats.dealsPipeline)} icon={<TrendingUp size={22} />}
            subtitle={`${stats.dealsCount} active deals`} className="cursor-pointer h-full" />
        </Link>
      </div>

      {/* Charts — bento grid */}
      {(txns.length > 0 || deals.length > 0) && (
        <div className="grid gap-6 lg:grid-cols-3 mb-8 animate-fade-in">
          <div className="lg:col-span-2">
            <IncomeExpenseChart transactions={txns} />
          </div>
          <div>
            <PipelineChart deals={deals} />
          </div>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-3 scroll-reveal-stagger">
        <div className="lg:col-span-2 scroll-reveal">
          <Card>
            <CardHeader><CardTitle className="text-lg font-heading">Quick Actions</CardTitle></CardHeader>
            <CardContent className="space-y-2">
              <Link to="/transactions" className="block">
                <Button variant="outline" className="w-full justify-start"><Plus size={16} className="mr-2" /> Add Transaction</Button>
              </Link>
              <Link to="/personal-finance" className="block">
                <Button variant="outline" className="w-full justify-start"><Target size={16} className="mr-2" /> {isBroker ? 'Add New Deal' : 'Add New Listing'}</Button>
              </Link>
              <Link to="/gst" className="block">
                <Button variant="outline" className="w-full justify-start"><Receipt size={16} className="mr-2" /> Check GST Status</Button>
              </Link>
            </CardContent>
          </Card>
        </div>

        {(stats.isDemo || stats.hasDemoData) && <div className="scroll-reveal"><DemoModeCard userId={user?.id ?? ''} onComplete={loadStats} /></div>}

        {!stats.isDemo && !stats.hasDemoData && (
          <div className="scroll-reveal">
            <Card>
              <CardHeader><CardTitle className="text-lg font-heading">Recent Activity</CardTitle></CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">Your recent transactions and deals will appear here.</p>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </>
  );
}
