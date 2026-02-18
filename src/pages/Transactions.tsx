import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { PageHeader } from '@/components/PageHeader';
import { EmptyState } from '@/components/EmptyState';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowRightLeft, Plus, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { formatNZDPrecise } from '@/services/commissionService';
import { cn } from '@/lib/utils';

interface Transaction {
  id: string;
  date: string;
  description: string;
  amount: number;
  type: string;
  status: string;
  is_demo: boolean;
  category_id: string | null;
}

export default function TransactionsPage() {
  const { user } = useAuth();
  const [txns, setTxns] = useState<Transaction[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    supabase
      .from('transactions')
      .select('*')
      .eq('owner_user_id', user.id)
      .order('date', { ascending: false })
      .then(({ data }) => {
        setTxns((data as Transaction[]) ?? []);
        setLoading(false);
      });
  }, [user]);

  const filtered = txns.filter(t =>
    t.description?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <>
      <PageHeader
        title="Transactions"
        description="Track and categorise your income and expenses"
        action={
          <Button size="sm">
            <Plus size={16} className="mr-1.5" />
            Add Transaction
          </Button>
        }
      />

      <div className="mb-4">
        <div className="relative max-w-sm">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search transactions..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1,2,3].map(i => (
            <div key={i} className="h-16 rounded-lg bg-muted animate-pulse" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={ArrowRightLeft}
          title="No transactions yet"
          description="Add your first transaction or connect a bank to get started."
          action={<Button size="sm"><Plus size={16} className="mr-1.5" /> Add Transaction</Button>}
        />
      ) : (
        <div className="rounded-xl border border-border bg-card shadow-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-muted/50">
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Date</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Description</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">Amount</th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-muted-foreground uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filtered.map(txn => (
                  <tr key={txn.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-3 text-sm text-muted-foreground whitespace-nowrap">
                      {new Date(txn.date).toLocaleDateString('en-NZ', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </td>
                    <td className="px-4 py-3 text-sm font-medium text-foreground">
                      {txn.description}
                      {txn.is_demo && <Badge variant="outline" className="ml-2 text-xs">Demo</Badge>}
                    </td>
                    <td className={cn(
                      'px-4 py-3 text-sm font-semibold text-right whitespace-nowrap',
                      txn.type === 'credit' ? 'text-success' : 'text-foreground'
                    )}>
                      {txn.type === 'credit' ? '+' : ''}{formatNZDPrecise(txn.amount)}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <Badge variant={txn.status === 'cleared' ? 'default' : 'secondary'} className="text-xs">
                        {txn.status}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </>
  );
}
