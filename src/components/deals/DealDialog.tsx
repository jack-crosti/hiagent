import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useUserType } from '@/contexts/UserTypeContext';
import { supabase } from '@/integrations/supabase/client';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2 } from 'lucide-react';
import {
  calculateDealCommission, formatNZD,
  DEFAULT_BUSINESS_SALE_RULE, DEFAULT_LEASE_RULE, DEFAULT_PROPERTY_SALE_RULE,
  DEFAULT_SPLITS,
  type CommissionRuleConfig, type DealInput, type CommissionBreakdown, type UserSplits
} from '@/services/commissionService';

interface DealDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  deal?: any;
  onSaved: () => void;
}

export function DealDialog({ open, onOpenChange, deal, onSaved }: DealDialogProps) {
  const { user } = useAuth();
  const { isBroker } = useUserType();
  const [saving, setSaving] = useState(false);
  const [splits, setSplits] = useState<UserSplits>(DEFAULT_SPLITS);
  const defaultDealType = isBroker ? 'business_sale' : 'property_sale';
  const [form, setForm] = useState({
    listing_name: '',
    deal_type: defaultDealType as 'business_sale' | 'lease' | 'property_sale',
    sale_price: '',
    annual_rent_excl_gst: '',
    probability: '50',
    expected_close_date: '',
    override_type: '' as '' | 'minimum' | 'percentage',
    override_value: '',
  });

  const [preview, setPreview] = useState<CommissionBreakdown | null>(null);

  // Load user splits
  useEffect(() => {
    if (!user) return;
    supabase.from('profiles').select('withholding_rate, business_sale_user_share, business_sale_company_share, lease_user_share, lease_company_share, property_sale_user_share, property_sale_company_share')
      .eq('owner_user_id', user.id).maybeSingle()
      .then(({ data }) => {
        if (data) {
          setSplits({
            withholding_rate: data.withholding_rate ?? 0.20,
            business_sale_user_share: data.business_sale_user_share ?? 0.75,
            business_sale_company_share: data.business_sale_company_share ?? 0.25,
            lease_user_share: data.lease_user_share ?? 0.80,
            lease_company_share: data.lease_company_share ?? 0.20,
            property_sale_user_share: data.property_sale_user_share ?? 0.75,
            property_sale_company_share: data.property_sale_company_share ?? 0.25,
          });
        }
      });
  }, [user]);

  useEffect(() => {
    if (deal) {
      setForm({
        listing_name: deal.listing_name || '',
        deal_type: deal.deal_type || 'business_sale',
        sale_price: deal.sale_price?.toString() || '',
        annual_rent_excl_gst: deal.annual_rent_excl_gst?.toString() || '',
        probability: ((deal.probability || 0.5) * 100).toString(),
        expected_close_date: deal.expected_close_date || '',
        override_type: deal.override_type || '',
        override_value: deal.override_value?.toString() || '',
      });
    } else {
      setForm({
        listing_name: '', deal_type: defaultDealType, sale_price: '',
        annual_rent_excl_gst: '', probability: '50', expected_close_date: '',
        override_type: '', override_value: '',
      });
    }
  }, [deal, open]);

  // Live commission preview
  useEffect(() => {
    const rule = getRuleForType(form.deal_type);
    const dealInput: DealInput = {
      deal_type: form.deal_type,
      sale_price: parseFloat(form.sale_price) || 0,
      annual_rent_excl_gst: parseFloat(form.annual_rent_excl_gst) || 0,
      probability: (parseFloat(form.probability) || 50) / 100,
      override_type: form.override_type || null,
      override_value: form.override_value ? parseFloat(form.override_value) : undefined,
    };
    const result = calculateDealCommission(dealInput, rule, splits);
    setPreview(result);
  }, [form, splits]);

  function getRuleForType(type: string): CommissionRuleConfig {
    switch (type) {
      case 'lease': return DEFAULT_LEASE_RULE;
      case 'property_sale': return DEFAULT_PROPERTY_SALE_RULE;
      default: return DEFAULT_BUSINESS_SALE_RULE;
    }
  }

  async function handleSave() {
    if (!user || !form.listing_name.trim()) return;
    setSaving(true);

    const rule = getRuleForType(form.deal_type);
    const dealInput: DealInput = {
      deal_type: form.deal_type,
      sale_price: parseFloat(form.sale_price) || undefined,
      annual_rent_excl_gst: parseFloat(form.annual_rent_excl_gst) || undefined,
      probability: (parseFloat(form.probability) || 50) / 100,
      override_type: form.override_type || null,
      override_value: form.override_value ? parseFloat(form.override_value) : undefined,
    };
    const calc = calculateDealCommission(dealInput, rule, splits);

    const row = {
      owner_user_id: user.id,
      listing_name: form.listing_name,
      deal_type: form.deal_type,
      sale_price: parseFloat(form.sale_price) || null,
      annual_rent_excl_gst: parseFloat(form.annual_rent_excl_gst) || null,
      probability: dealInput.probability,
      expected_close_date: form.expected_close_date || null,
      override_type: form.override_type || null,
      override_value: form.override_value ? parseFloat(form.override_value) : null,
      gross_commission_excl_gst: calc.gross_commission_excl_gst,
      gst_on_commission: calc.gst_on_commission,
      on_top_fee: calc.on_top_fee,
      commission_after_fee: calc.commission_after_fee,
      user_share_excl_gst: calc.user_share_excl_gst,
      company_share_excl_gst: calc.company_share_excl_gst,
      estimated_tax: calc.estimated_tax,
      net_to_user_after_tax: calc.net_to_user_after_tax,
    };

    if (deal?.id) {
      await supabase.from('deals').update(row).eq('id', deal.id);
    } else {
      await supabase.from('deals').insert(row);
    }

    setSaving(false);
    onOpenChange(false);
    onSaved();
  }

  const isLease = form.deal_type === 'lease';
  const whrPct = Math.round(splits.withholding_rate * 100);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-heading">{deal ? 'Edit Deal' : 'Add Deal'}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Listing Name</Label>
            <Input
              placeholder={isBroker ? "e.g. Café & Restaurant - Ponsonby" : "e.g. 3-bed Villa - Ponsonby"}
              value={form.listing_name}
              onChange={e => setForm(f => ({ ...f, listing_name: e.target.value }))}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>Deal Type</Label>
              <Select value={form.deal_type} onValueChange={v => setForm(f => ({ ...f, deal_type: v as any }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {isBroker && <SelectItem value="business_sale">Business Sale</SelectItem>}
                  <SelectItem value="property_sale">Property Sale</SelectItem>
                  <SelectItem value="lease">Lease</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Probability %</Label>
              <Input
                type="number" min="0" max="100"
                value={form.probability}
                onChange={e => setForm(f => ({ ...f, probability: e.target.value }))}
              />
            </div>
          </div>

          {isLease ? (
            <div className="space-y-2">
              <Label>Annual Rent (excl GST)</Label>
              <Input
                type="number" placeholder="120000"
                value={form.annual_rent_excl_gst}
                onChange={e => setForm(f => ({ ...f, annual_rent_excl_gst: e.target.value }))}
              />
            </div>
          ) : (
            <div className="space-y-2">
              <Label>Sale Price</Label>
              <Input
                type="number" placeholder="850000"
                value={form.sale_price}
                onChange={e => setForm(f => ({ ...f, sale_price: e.target.value }))}
              />
            </div>
          )}

          <div className="space-y-2">
            <Label>Expected Close Date</Label>
            <Input
              type="date"
              value={form.expected_close_date}
              onChange={e => setForm(f => ({ ...f, expected_close_date: e.target.value }))}
            />
          </div>

          {/* Commission preview */}
          {preview && (preview.gross_commission_excl_gst > 0) && (
            <div className="rounded-lg border border-primary/20 bg-primary/5 p-4 space-y-1.5 text-sm">
              <p className="font-heading font-semibold text-primary text-base">Commission Preview</p>
              <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
                <span className="text-muted-foreground">Gross commission</span>
                <span className="text-right font-medium">{formatNZD(preview.gross_commission_excl_gst)}</span>
                <span className="text-muted-foreground">+ GST (15%)</span>
                <span className="text-right">{formatNZD(preview.gst_on_commission)}</span>
                <span className="text-muted-foreground">On-top fee (The Network)</span>
                <span className="text-right">-{formatNZD(preview.on_top_fee)}</span>
                <span className="text-muted-foreground">Your share (after fee)</span>
                <span className="text-right font-medium">{formatNZD(preview.user_share_excl_gst)}</span>
                <span className="text-muted-foreground">Less Withholding tax ({whrPct}%)</span>
                <span className="text-right">-{formatNZD(preview.estimated_tax)}</span>
                <span className="text-muted-foreground font-semibold pt-1 border-t border-border">Net to you</span>
                <span className="text-right font-heading font-bold text-primary pt-1 border-t border-border">
                  {formatNZD(preview.net_to_user_after_tax)}
                </span>
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleSave} disabled={saving || !form.listing_name.trim()}>
            {saving && <Loader2 size={16} className="mr-1.5 animate-spin" />}
            {deal ? 'Update Deal' : 'Add Deal'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
