import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, Plus, Paperclip, X } from 'lucide-react';
import { GST_RATE } from '@/services/commissionService';
import { useToast } from '@/hooks/use-toast';

interface TransactionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  transaction?: any;
  onSaved: () => void;
}

export function TransactionDialog({ open, onOpenChange, transaction, onSaved }: TransactionDialogProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [saving, setSaving] = useState(false);
  const [categories, setCategories] = useState<any[]>([]);
  const [bankAccounts, setBankAccounts] = useState<any[]>([]);
  const [newCatName, setNewCatName] = useState('');
  const [showNewCat, setShowNewCat] = useState(false);
  const [newBankName, setNewBankName] = useState('');
  const [newBankAccName, setNewBankAccName] = useState('');
  const [showNewBank, setShowNewBank] = useState(false);
  const [attachments, setAttachments] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
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
      setAttachments([]);
    }
    setShowNewCat(false);
    setShowNewBank(false);
  }, [transaction, open]);

  useEffect(() => {
    const amt = parseFloat(form.amount);
    if (amt > 0) {
      const gst = amt * GST_RATE / (1 + GST_RATE);
      setForm(f => ({ ...f, gst_amount: gst.toFixed(2) }));
    }
  }, [form.amount]);

  async function handleAddCategory() {
    if (!user || !newCatName.trim()) return;
    const { data } = await supabase.from('categories').insert({
      owner_user_id: user.id, name: newCatName.trim(),
    }).select().single();
    if (data) {
      setCategories(prev => [...prev, data].sort((a, b) => a.name.localeCompare(b.name)));
      setForm(f => ({ ...f, category_id: data.id }));
      setNewCatName('');
      setShowNewCat(false);
      toast({ title: 'Category created' });
    }
  }

  async function handleAddBankAccount() {
    if (!user || !newBankName.trim()) return;
    const { data } = await supabase.from('bank_accounts').insert({
      owner_user_id: user.id, bank_name: newBankName.trim(), account_name: newBankAccName.trim() || 'Main',
    }).select().single();
    if (data) {
      setBankAccounts(prev => [...prev, data]);
      setForm(f => ({ ...f, bank_account_id: data.id }));
      setNewBankName('');
      setNewBankAccName('');
      setShowNewBank(false);
      toast({ title: 'Bank account added' });
    }
  }

  async function uploadAttachments(txnId: string) {
    if (!user || attachments.length === 0) return;
    for (const file of attachments) {
      const path = `${user.id}/${txnId}/${Date.now()}_${file.name}`;
      const { error } = await supabase.storage.from('attachments').upload(path, file);
      if (!error) {
        const { data: urlData } = supabase.storage.from('attachments').getPublicUrl(path);
        await supabase.from('attachments').insert({
          owner_user_id: user.id,
          entity_id: txnId,
          entity_type: 'transaction',
          file_url: urlData.publicUrl,
          file_name: file.name,
          file_size: file.size,
          file_type: file.type,
        });
      }
    }
  }

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
      if (attachments.length > 0) await uploadAttachments(transaction.id);
    } else {
      const { data } = await supabase.from('transactions').insert(row).select().single();
      if (data && attachments.length > 0) await uploadAttachments(data.id);
    }

    setSaving(false);
    onOpenChange(false);
    onSaved();
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
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
              <Input type="date" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>Amount (NZD)</Label>
              <Input type="number" min="0" step="0.01" placeholder="0.00" value={form.amount} onChange={e => setForm(f => ({ ...f, amount: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label>GST (auto)</Label>
              <Input type="number" step="0.01" placeholder="0.00" value={form.gst_amount} onChange={e => setForm(f => ({ ...f, gst_amount: e.target.value }))} />
            </div>
          </div>

          {/* Category with New option */}
          <div className="space-y-2">
            <Label>Category</Label>
            {showNewCat ? (
              <div className="flex gap-2">
                <Input placeholder="Category name" value={newCatName} onChange={e => setNewCatName(e.target.value)} className="flex-1" />
                <Button size="sm" onClick={handleAddCategory} disabled={!newCatName.trim()}>Add</Button>
                <Button size="sm" variant="ghost" onClick={() => setShowNewCat(false)}>Cancel</Button>
              </div>
            ) : (
              <Select value={form.category_id} onValueChange={v => {
                if (v === '__new__') { setShowNewCat(true); return; }
                setForm(f => ({ ...f, category_id: v }));
              }}>
                <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
                <SelectContent>
                  {categories.map(c => (
                    <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                  ))}
                  <SelectItem value="__new__">
                    <span className="flex items-center gap-1 text-primary"><Plus size={14} /> New Category</span>
                  </SelectItem>
                </SelectContent>
              </Select>
            )}
          </div>

          {/* Bank Account with New option */}
          <div className="space-y-2">
            <Label>Bank Account</Label>
            {showNewBank ? (
              <div className="space-y-2">
                <div className="flex gap-2">
                  <Input placeholder="Bank name (e.g. ANZ)" value={newBankName} onChange={e => setNewBankName(e.target.value)} className="flex-1" />
                  <Input placeholder="Account name" value={newBankAccName} onChange={e => setNewBankAccName(e.target.value)} className="flex-1" />
                </div>
                <div className="flex gap-2">
                  <Button size="sm" onClick={handleAddBankAccount} disabled={!newBankName.trim()}>Add</Button>
                  <Button size="sm" variant="ghost" onClick={() => setShowNewBank(false)}>Cancel</Button>
                </div>
              </div>
            ) : (
              <Select value={form.bank_account_id} onValueChange={v => {
                if (v === '__new__') { setShowNewBank(true); return; }
                setForm(f => ({ ...f, bank_account_id: v }));
              }}>
                <SelectTrigger><SelectValue placeholder="Select account" /></SelectTrigger>
                <SelectContent>
                  {bankAccounts.map(b => (
                    <SelectItem key={b.id} value={b.id}>{b.bank_name} — {b.account_name}</SelectItem>
                  ))}
                  <SelectItem value="__new__">
                    <span className="flex items-center gap-1 text-primary"><Plus size={14} /> New Bank Account</span>
                  </SelectItem>
                </SelectContent>
              </Select>
            )}
          </div>

          <div className="space-y-2">
            <Label>Reference (optional)</Label>
            <Input placeholder="Invoice #, receipt ref" value={form.reference} onChange={e => setForm(f => ({ ...f, reference: e.target.value }))} />
          </div>

          {/* Attachments */}
          <div className="space-y-2">
            <Label>Attachments</Label>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/*,.pdf,.doc,.docx,.xls,.xlsx"
              className="hidden"
              onChange={e => {
                if (e.target.files) setAttachments(prev => [...prev, ...Array.from(e.target.files!)]);
              }}
            />
            <Button type="button" variant="outline" size="sm" onClick={() => fileInputRef.current?.click()}>
              <Paperclip size={14} className="mr-1.5" /> Attach Files
            </Button>
            {attachments.length > 0 && (
              <div className="space-y-1">
                {attachments.map((f, i) => (
                  <div key={i} className="flex items-center justify-between bg-muted rounded-lg px-3 py-1.5 text-xs">
                    <span className="truncate">{f.name}</span>
                    <Button variant="ghost" size="sm" className="h-5 w-5 p-0" onClick={() => setAttachments(prev => prev.filter((_, j) => j !== i))}>
                      <X size={12} />
                    </Button>
                  </div>
                ))}
              </div>
            )}
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
