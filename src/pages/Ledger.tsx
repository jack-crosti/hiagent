import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { PageHeader } from '@/components/PageHeader';
import { EmptyState } from '@/components/EmptyState';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BookOpen } from 'lucide-react';
import { formatNZDPrecise } from '@/services/commissionService';
import { cn } from '@/lib/utils';

interface LedgerAccount {
  id: string;
  name: string;
  code: string;
  account_type: string;
  is_system: boolean;
  is_demo: boolean;
}

interface LedgerEntry {
  id: string;
  date: string;
  description: string;
  debit: number;
  credit: number;
  ledger_account_id: string;
  is_demo: boolean;
}

export default function LedgerPage() {
  const { user } = useAuth();
  const [accounts, setAccounts] = useState<LedgerAccount[]>([]);
  const [entries, setEntries] = useState<LedgerEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('accounts');

  useEffect(() => {
    if (!user) return;
    Promise.all([
      supabase.from('ledger_accounts').select('*').eq('owner_user_id', user.id).order('code'),
      supabase.from('ledger_entries').select('*').eq('owner_user_id', user.id).order('date', { ascending: false }).limit(100),
    ]).then(([accRes, entRes]) => {
      setAccounts((accRes.data as LedgerAccount[]) ?? []);
      setEntries((entRes.data as LedgerEntry[]) ?? []);
      setLoading(false);
    });
  }, [user]);

  const grouped = accounts.reduce((acc, a) => {
    if (!acc[a.account_type]) acc[a.account_type] = [];
    acc[a.account_type].push(a);
    return acc;
  }, {} as Record<string, LedgerAccount[]>);

  const typeOrder = ['asset', 'liability', 'equity', 'revenue', 'expense'];
  const typeLabels: Record<string, string> = {
    asset: 'Assets', liability: 'Liabilities', equity: 'Equity',
    revenue: 'Revenue', expense: 'Expenses',
  };

  function getAccountBalance(accountId: string) {
    const acctEntries = entries.filter(e => e.ledger_account_id === accountId);
    const totalDebit = acctEntries.reduce((s, e) => s + Number(e.debit), 0);
    const totalCredit = acctEntries.reduce((s, e) => s + Number(e.credit), 0);
    return totalDebit - totalCredit;
  }

  if (loading) {
    return (
      <>
        <PageHeader title="Ledger" />
        <div className="space-y-4">
          {[1, 2, 3].map(i => <div key={i} className="h-24 rounded-xl bg-muted animate-pulse" />)}
        </div>
      </>
    );
  }

  if (accounts.length === 0) {
    return (
      <>
        <PageHeader title="Ledger" description="Double-entry bookkeeping with NZ chart of accounts" />
        <EmptyState
          icon={BookOpen}
          title="No ledger accounts"
          description="Load demo data from the Dashboard to populate your chart of accounts and sample entries."
        />
      </>
    );
  }

  return (
    <>
      <PageHeader title="Ledger" description="Double-entry bookkeeping with NZ chart of accounts" />

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-4">
          <TabsTrigger value="accounts">Chart of Accounts</TabsTrigger>
          <TabsTrigger value="journal">Journal Entries</TabsTrigger>
        </TabsList>

        <TabsContent value="accounts">
          <div className="space-y-4">
            {typeOrder.map(type => {
              const accts = grouped[type];
              if (!accts?.length) return null;
              return (
                <Card key={type} className="shadow-card">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base font-heading capitalize">{typeLabels[type]}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-1">
                      {accts.map(a => {
                        const balance = getAccountBalance(a.id);
                        return (
                          <div key={a.id} className="flex items-center justify-between rounded-lg px-3 py-2 hover:bg-muted/30 transition-colors">
                            <div className="flex items-center gap-3">
                              <span className="text-xs text-muted-foreground font-mono w-12">{a.code}</span>
                              <span className="text-sm font-medium">{a.name}</span>
                              {a.is_demo && <Badge variant="outline" className="text-xs">Demo</Badge>}
                            </div>
                            <span className={cn(
                              'text-sm font-semibold font-mono',
                              balance >= 0 ? 'text-foreground' : 'text-destructive'
                            )}>
                              {formatNZDPrecise(Math.abs(balance))}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="journal">
          {entries.length === 0 ? (
            <EmptyState icon={BookOpen} title="No journal entries" description="Entries will appear here when transactions are recorded." />
          ) : (
            <Card className="shadow-card overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border bg-muted/50">
                      <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Date</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Description</th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground uppercase">Debit</th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground uppercase">Credit</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {entries.map(e => (
                      <tr key={e.id} className="hover:bg-muted/30 transition-colors">
                        <td className="px-4 py-3 text-sm text-muted-foreground whitespace-nowrap">
                          {new Date(e.date).toLocaleDateString('en-NZ', { day: 'numeric', month: 'short' })}
                        </td>
                        <td className="px-4 py-3 text-sm font-medium">
                          {e.description}
                          {e.is_demo && <Badge variant="outline" className="ml-2 text-xs">Demo</Badge>}
                        </td>
                        <td className="px-4 py-3 text-sm text-right font-mono">
                          {Number(e.debit) > 0 ? formatNZDPrecise(Number(e.debit)) : ''}
                        </td>
                        <td className="px-4 py-3 text-sm text-right font-mono">
                          {Number(e.credit) > 0 ? formatNZDPrecise(Number(e.credit)) : ''}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </>
  );
}
