import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { PageHeader } from '@/components/PageHeader';
import { EmptyState } from '@/components/EmptyState';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowRightLeft, Plus, Search, Pencil, Trash2, Paperclip, ChevronDown, ChevronUp, ExternalLink } from 'lucide-react';
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

interface Attachment {
  id: string;
  file_name: string | null;
  file_url: string;
  file_type: string | null;
  file_size: number | null;
}

export default function TransactionsPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [txns, setTxns] = useState<Transaction[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingTxn, setEditingTxn] = useState<Transaction | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [attachmentsMap, setAttachmentsMap] = useState<Record<string, Attachment[]>>({});
  const [categories, setCategories] = useState<Record<string, string>>({});
  const [bankAccounts, setBankAccounts] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!user) return;
    loadTransactions();
    // Load categories and bank accounts for display
    Promise.all([
      supabase.from('categories').select('id, name').eq('owner_user_id', user.id),
      supabase.from('bank_accounts').select('id, bank_name, account_name').eq('owner_user_id', user.id),
    ]).then(([catRes, bankRes]) => {
      setCategories(Object.fromEntries((catRes.data ?? []).map(c => [c.id, c.name])));
      setBankAccounts(Object.fromEntries((bankRes.data ?? []).map(b => [b.id, `${b.bank_name} — ${b.account_name}`])));
    });
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

  async function loadAttachments(txnId: string) {
    if (attachmentsMap[txnId]) return;
    const { data } = await supabase.from('attachments')
      .select('id, file_name, file_url, file_type, file_size')
      .eq('entity_id', txnId)
      .eq('entity_type', 'transaction');
    setAttachmentsMap(prev => ({ ...prev, [txnId]: (data as Attachment[]) ?? [] }));
  }

  async function deleteTxn(id: string) {
    await supabase.from('attachments').delete().eq('entity_id', id).eq('entity_type', 'transaction');
    await supabase.from('transactions').delete().eq('id', id);
    setTxns(prev => prev.filter(t => t.id !== id));
    toast({ title: 'Transaction deleted' });
  }

  function toggleExpand(txnId: string) {
    if (expandedId === txnId) {
      setExpandedId(null);
    } else {
      setExpandedId(txnId);
      loadAttachments(txnId);
    }
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
        onSaved={() => { loadTransactions(); setExpandedId(null); }}
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
        <div className="space-y-2">
          {filtered.map(txn => (
            <div key={txn.id} className="rounded-xl border border-border bg-card shadow-card overflow-hidden">
              {/* Row */}
              <div
                className="flex items-center cursor-pointer hover:bg-muted/30 transition-colors px-4 py-3"
                onClick={() => toggleExpand(txn.id)}
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-foreground truncate">{txn.description}</span>
                    {txn.is_demo && <Badge variant="outline" className="text-xs">Demo</Badge>}
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {new Date(txn.date).toLocaleDateString('en-NZ', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <span className={cn(
                    'text-sm font-semibold whitespace-nowrap',
                    txn.type === 'credit' ? 'text-success' : 'text-foreground'
                  )}>
                    {txn.type === 'credit' ? '+' : ''}{formatNZDPrecise(txn.amount)}
                  </span>
                  <Badge variant={txn.status === 'cleared' ? 'default' : 'secondary'} className="text-xs">
                    {txn.status}
                  </Badge>
                  {expandedId === txn.id ? <ChevronUp size={16} className="text-muted-foreground" /> : <ChevronDown size={16} className="text-muted-foreground" />}
                </div>
              </div>

              {/* Expanded details */}
              {expandedId === txn.id && (
                <div className="border-t border-border px-4 py-4 bg-muted/20 animate-fade-in">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4 text-sm">
                    <div>
                      <p className="text-xs text-muted-foreground">Category</p>
                      <p className="font-medium">{txn.category_id ? categories[txn.category_id] || 'Unknown' : 'Uncategorised'}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Bank Account</p>
                      <p className="font-medium">{txn.bank_account_id ? bankAccounts[txn.bank_account_id] || 'Unknown' : 'None'}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">GST</p>
                      <p className="font-medium">{txn.gst_amount ? formatNZDPrecise(txn.gst_amount) : '$0.00'}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Reference</p>
                      <p className="font-medium">{txn.reference || '—'}</p>
                    </div>
                  </div>

                  {/* Attachments */}
                  {attachmentsMap[txn.id] && attachmentsMap[txn.id].length > 0 && (
                    <div className="mb-4">
                      <p className="text-xs text-muted-foreground mb-2 flex items-center gap-1"><Paperclip size={12} /> Attachments</p>
                      <div className="flex flex-wrap gap-2">
                        {attachmentsMap[txn.id].map(att => (
                          <a
                            key={att.id}
                            href={att.file_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1.5 bg-card border border-border rounded-lg px-3 py-2 text-xs hover:bg-muted transition-colors"
                          >
                            {att.file_type?.startsWith('image/') ? (
                              <img src={att.file_url} alt={att.file_name || 'attachment'} className="h-8 w-8 rounded object-cover" />
                            ) : (
                              <Paperclip size={14} className="text-muted-foreground" />
                            )}
                            <span className="truncate max-w-[120px]">{att.file_name || 'File'}</span>
                            <ExternalLink size={10} className="text-muted-foreground" />
                          </a>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={(e) => { e.stopPropagation(); setEditingTxn(txn); setDialogOpen(true); }}>
                      <Pencil size={13} className="mr-1" /> Edit
                    </Button>
                    <Button size="sm" variant="outline" className="text-destructive hover:text-destructive" onClick={(e) => { e.stopPropagation(); deleteTxn(txn.id); }}>
                      <Trash2 size={13} className="mr-1" /> Delete
                    </Button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </>
  );
}
