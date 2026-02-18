import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { PageHeader } from '@/components/PageHeader';
import { EmptyState } from '@/components/EmptyState';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowRightLeft, Plus, Search, Pencil, Trash2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { formatNZDPrecise } from '@/services/commissionService';
import { cn } from '@/lib/utils';
import { TransactionDialog } from '@/components/transactions/TransactionDialog';
import { useToast } from '@/hooks/use-toast';

interface Transaction {
  id: string;
  date: string;
  description: string;
  amount: number;
  type: string;
  status: string;
  is_demo: boolean;
  category_id: string | null;
  bank_account_id: string | null;
  reference: string | null;
  gst_amount: number | null;
}

export default function TransactionsPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [txns, setTxns] = useState<Transaction[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingTxn, setEditingTxn] = useState<Transaction | null>(null);

  useEffect(() => {
    if (!user) return;
    loadTransactions();
  }, [user]);

  function loadTransactions() {
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
  }

  async function deleteTxn(id: string) {
    await supabase.from('transactions').delete().eq('id', id);
    setTxns(prev => prev.filter(t => t.id !== id));
    toast({ title: 'Transaction deleted' });
  }

  const filtered = txns.filter(t =>
    t.description?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <>
      <PageHeader
        title="Transactions"
        description="Track and categorise your income and expenses"
        action={
          <Button size="sm" onClick={() => { setEditingTxn(null); setDialogOpen(true); }}>
            <Plus size={16} className="mr-1.5" />
            Add Transaction
          </Button>
        }
      />

      <TransactionDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        transaction={editingTxn}
        onSaved={loadTransactions}
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
          description="Add your first transaction or load demo data from the Dashboard."
          action={<Button size="sm" onClick={() => { setEditingTxn(null); setDialogOpen(true); }}><Plus size={16} className="mr-1.5" /> Add Transaction</Button>}
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
                  <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider w-20"></th>
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
                    <td className="px-4 py-3 text-right">
                      <div className="flex justify-end gap-1">
                        <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => { setEditingTxn(txn); setDialogOpen(true); }}>
                          <Pencil size={13} />
                        </Button>
                        <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-destructive hover:text-destructive" onClick={() => deleteTxn(txn.id)}>
                          <Trash2 size={13} />
                        </Button>
                      </div>
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
