import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2 } from 'lucide-react';
import { GST_RATE } from '@/services/commissionService';

interface TransactionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  transaction?: any;
  onSaved: () => void;
}

export function TransactionDialog({ open, onOpenChange, transaction, onSaved }: TransactionDialogProps) {
  const { user } = useAuth();
  const [saving, setSaving] = useState(false);
  const [categories, setCategories] = useState<any[]>([]);
  const [bankAccounts, setBankAccounts] = useState<any[]>([]);
  const [form, setForm] = useState({
    description: '',
    amount: '',
    type: 'debit',
    date: new Date().toISOString().split('T')[0],
    category_id: '',
    bank_account_id: '',
    reference: '',
    gst_amount: '',
  });

  useEffect(() => {
    if (!user) return;
    Promise.all([
      supabase.from('categories').select('id, name').eq('owner_user_id', user.id).order('name'),
      supabase.from('bank_accounts').select('id, bank_name, account_name').eq('owner_user_id', user.id),
    ]).then(([catRes, bankRes]) => {
      setCategories(catRes.data ?? []);
      setBankAccounts(bankRes.data ?? []);
    });
  }, [user]);

  useEffect(() => {
    if (transaction) {
      setForm({
        description: transaction.description || '',
        amount: Math.abs(transaction.amount).toString(),
        type: transaction.type || 'debit',
        date: transaction.date || new Date().toISOString().split('T')[0],
        category_id: transaction.category_id || '',
        bank_account_id: transaction.bank_account_id || '',
        reference: transaction.reference || '',
        gst_amount: transaction.gst_amount?.toString() || '',
      });
    } else {
      setForm({
        description: '', amount: '', type: 'debit',
        date: new Date().toISOString().split('T')[0],
        category_id: '', bank_account_id: '', reference: '', gst_amount: '',
      });
    }
  }, [transaction, open]);

  // Auto-calc GST when amount changes
  useEffect(() => {
    const amt = parseFloat(form.amount);
    if (amt > 0) {
      const gst = amt * GST_RATE / (1 + GST_RATE);
      setForm(f => ({ ...f, gst_amount: gst.toFixed(2) }));
    }
  }, [form.amount]);

  async function handleSave() {
    if (!user || !form.description.trim() || !form.amount) return;
    setSaving(true);

    const amount = parseFloat(form.amount);
    const row = {
      owner_user_id: user.id,
      description: form.description,
      amount: form.type === 'debit' ? -Math.abs(amount) : Math.abs(amount),
      type: form.type,
      date: form.date,
      category_id: form.category_id || null,
      bank_account_id: form.bank_account_id || null,
      reference: form.reference || null,
      gst_amount: parseFloat(form.gst_amount) || 0,
    };

    if (transaction?.id) {
      await supabase.from('transactions').update(row).eq('id', transaction.id);
    } else {
      await supabase.from('transactions').insert(row);
    }

    setSaving(false);
    onOpenChange(false);
    onSaved();
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="font-heading">{transaction ? 'Edit Transaction' : 'Add Transaction'}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Description</Label>
            <Input
              placeholder="e.g. Office Rent, Commission Payment"
              value={form.description}
              onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>Type</Label>
              <Select value={form.type} onValueChange={v => setForm(f => ({ ...f, type: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="debit">Expense (Debit)</SelectItem>
                  <SelectItem value="credit">Income (Credit)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Date</Label>
              <Input
                type="date"
                value={form.date}
                onChange={e => setForm(f => ({ ...f, date: e.target.value }))}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>Amount (NZD)</Label>
              <Input
                type="number" min="0" step="0.01" placeholder="0.00"
                value={form.amount}
                onChange={e => setForm(f => ({ ...f, amount: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label>GST (auto)</Label>
              <Input
                type="number" step="0.01" placeholder="0.00"
                value={form.gst_amount}
                onChange={e => setForm(f => ({ ...f, gst_amount: e.target.value }))}
              />
            </div>
          </div>

          {categories.length > 0 && (
            <div className="space-y-2">
              <Label>Category</Label>
              <Select value={form.category_id} onValueChange={v => setForm(f => ({ ...f, category_id: v }))}>
                <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
                <SelectContent>
                  {categories.map(c => (
                    <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {bankAccounts.length > 0 && (
            <div className="space-y-2">
              <Label>Bank Account</Label>
              <Select value={form.bank_account_id} onValueChange={v => setForm(f => ({ ...f, bank_account_id: v }))}>
                <SelectTrigger><SelectValue placeholder="Select account" /></SelectTrigger>
                <SelectContent>
                  {bankAccounts.map(b => (
                    <SelectItem key={b.id} value={b.id}>{b.bank_name} — {b.account_name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="space-y-2">
            <Label>Reference (optional)</Label>
            <Input
              placeholder="Invoice #, receipt ref"
              value={form.reference}
              onChange={e => setForm(f => ({ ...f, reference: e.target.value }))}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleSave} disabled={saving || !form.description.trim() || !form.amount}>
            {saving && <Loader2 size={16} className="mr-1.5 animate-spin" />}
            {transaction ? 'Update' : 'Add Transaction'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
