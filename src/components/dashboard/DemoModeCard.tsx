import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Sparkles, Eye, Trash2 } from 'lucide-react';
import { useDemo } from '@/contexts/DemoContext';
import { useUserType } from '@/contexts/UserTypeContext';
import { useToast } from '@/hooks/use-toast';

export function DemoModeCard({ userId, onComplete }: { userId: string; onComplete: () => void }) {
  const [loading, setLoading] = useState(false);
  const [clearing, setClearing] = useState(false);
  const { enterDemo } = useDemo();
  const { isAgent } = useUserType();
  const { toast } = useToast();

  async function clearDemoData() {
    setClearing(true);
    try {
      const uid = userId;
      await supabase.from('deals').delete().match({ owner_user_id: uid, is_demo: true });
      await supabase.from('transactions').delete().match({ owner_user_id: uid, is_demo: true });
      await supabase.from('gst_periods').delete().match({ owner_user_id: uid, is_demo: true });
      await supabase.from('goal_plans').delete().match({ owner_user_id: uid, is_demo: true });
      await supabase.from('commission_rules').delete().match({ owner_user_id: uid, is_demo: true });
      await supabase.from('categories').delete().match({ owner_user_id: uid, is_system: true });
      await supabase.from('bank_accounts').delete().match({ owner_user_id: uid, is_demo: true });
      toast({ title: 'Demo data cleared', description: 'All sample data has been removed.' });
      onComplete();
    } catch (err) {
      console.error('Clear demo error:', err);
      toast({ title: 'Error clearing demo data', variant: 'destructive' });
    }
    setClearing(false);
  }

  async function seedDemoData() {
    setLoading(true);
    try {
      const { data: bankAcct } = await supabase.from('bank_accounts').insert({
        owner_user_id: userId, bank_name: 'ANZ', account_name: 'Business Cheque',
        account_number: '01-1234-5678900-00', account_type: 'cheque', balance: 45230, is_demo: true,
      }).select().single();

      const cats = ['Commission Income', 'Office Expenses', 'Travel', 'Marketing', 'Insurance', 'Professional Fees'];
      const { data: insertedCats } = await supabase.from('categories').insert(
        cats.map(name => ({ owner_user_id: userId, name, is_system: true }))
      ).select();
      const catMap = Object.fromEntries((insertedCats ?? []).map(c => [c.name, c.id]));

      // Role-aware transactions
      const agentTxns = [
        { date: '2025-11-15', description: 'Commission - 42 Remuera Rd Sale', amount: 32000, type: 'credit', category_id: catMap['Commission Income'] },
        { date: '2025-11-20', description: 'Office Rent', amount: -2200, type: 'debit', category_id: catMap['Office Expenses'] },
        { date: '2025-12-01', description: 'Commission - 8 Parnell Rise Sale', amount: 48000, type: 'credit', category_id: catMap['Commission Income'] },
        { date: '2025-12-05', description: 'Travel - Open Home Signage', amount: -380, type: 'debit', category_id: catMap['Travel'] },
        { date: '2025-12-10', description: 'Facebook Property Ads', amount: -450, type: 'debit', category_id: catMap['Marketing'] },
        { date: '2026-01-05', description: 'Commission - 15 Mt Eden Rd Sale', amount: 22000, type: 'credit', category_id: catMap['Commission Income'] },
        { date: '2026-01-15', description: 'Professional Indemnity Insurance', amount: -1800, type: 'debit', category_id: catMap['Insurance'] },
        { date: '2026-02-01', description: 'Accounting Fees', amount: -1500, type: 'debit', category_id: catMap['Professional Fees'] },
      ];

      const brokerTxns = [
        { date: '2025-11-15', description: 'Commission - Smith Property Sale', amount: 28500, type: 'credit', category_id: catMap['Commission Income'] },
        { date: '2025-11-20', description: 'Office Rent', amount: -2200, type: 'debit', category_id: catMap['Office Expenses'] },
        { date: '2025-12-01', description: 'Commission - Jones Business Sale', amount: 45000, type: 'credit', category_id: catMap['Commission Income'] },
        { date: '2025-12-05', description: 'Travel - Auckland Client Meeting', amount: -380, type: 'debit', category_id: catMap['Travel'] },
        { date: '2025-12-10', description: 'Facebook Ads', amount: -450, type: 'debit', category_id: catMap['Marketing'] },
        { date: '2026-01-05', description: 'Commission - Lease - 123 Queen St', amount: 18750, type: 'credit', category_id: catMap['Commission Income'] },
        { date: '2026-01-15', description: 'Professional Indemnity Insurance', amount: -1800, type: 'debit', category_id: catMap['Insurance'] },
        { date: '2026-02-01', description: 'Accounting Fees', amount: -1500, type: 'debit', category_id: catMap['Professional Fees'] },
      ];

      const txns = isAgent ? agentTxns : brokerTxns;
      await supabase.from('transactions').insert(
        txns.map(t => ({
          owner_user_id: userId, bank_account_id: bankAcct?.id, ...t,
          gst_amount: Math.abs(t.amount) * 0.15 / 1.15, is_demo: true,
        }))
      );

      if (isAgent) {
        // Property sale commission rule
        const { data: propRule } = await supabase.from('commission_rules').insert({
          owner_user_id: userId, name: 'Property Sale Default', deal_type: 'property_sale',
          rule_type: 'tiered', minimum_commission: 23500,
          tiers: [{ threshold: 0, rate: 0.09 }, { threshold: 1000000, rate: 0.07 }],
          is_default: true, user_share_percent: 0.75, company_share_percent: 0.25,
        }).select().single();

        await supabase.from('deals').insert([
          {
            owner_user_id: userId, deal_type: 'property_sale', listing_name: '3-Bed Villa - Parnell',
            expected_close_date: '2026-04-15', probability: 0.7, sale_price: 1200000,
            commission_rule_id: propRule?.id, gross_commission_excl_gst: 104000, gst_on_commission: 15600,
            on_top_fee: 6240, commission_after_fee: 97760, user_share_excl_gst: 73320,
            company_share_excl_gst: 24440, estimated_tax: 14664, net_to_user_after_tax: 58656, is_demo: true,
          },
          {
            owner_user_id: userId, deal_type: 'property_sale', listing_name: 'Townhouse - Mt Eden',
            expected_close_date: '2026-03-20', probability: 0.8, sale_price: 850000,
            commission_rule_id: propRule?.id, gross_commission_excl_gst: 76500, gst_on_commission: 11475,
            on_top_fee: 4590, commission_after_fee: 71910, user_share_excl_gst: 53933,
            company_share_excl_gst: 17978, estimated_tax: 10787, net_to_user_after_tax: 43146, is_demo: true,
          },
          {
            owner_user_id: userId, deal_type: 'property_sale', listing_name: 'Lifestyle Block - Kumeu',
            expected_close_date: '2026-05-30', probability: 0.45, sale_price: 1800000,
            commission_rule_id: propRule?.id, gross_commission_excl_gst: 146000, gst_on_commission: 21900,
            on_top_fee: 8760, commission_after_fee: 137240, user_share_excl_gst: 102930,
            company_share_excl_gst: 34310, estimated_tax: 20586, net_to_user_after_tax: 82344, is_demo: true,
          },
        ]);
      } else {
        // Business broker deals (existing)
        const { data: bizRule } = await supabase.from('commission_rules').insert({
          owner_user_id: userId, name: 'Business Sale Default', deal_type: 'business_sale',
          rule_type: 'tiered', minimum_commission: 23500,
          tiers: [{ threshold: 0, rate: 0.09 }, { threshold: 1000000, rate: 0.07 }],
          is_default: true, user_share_percent: 0.75, company_share_percent: 0.25,
        }).select().single();

        const { data: leaseRule } = await supabase.from('commission_rules').insert({
          owner_user_id: userId, name: 'Lease Default', deal_type: 'lease',
          rule_type: 'minimum_or_calc', minimum_commission: 12500, tiers: [],
          is_default: true, user_share_percent: 0.80, company_share_percent: 0.20,
        }).select().single();

        await supabase.from('deals').insert([
          {
            owner_user_id: userId, deal_type: 'business_sale', listing_name: 'Café & Restaurant - Ponsonby',
            expected_close_date: '2026-04-15', probability: 0.7, sale_price: 850000,
            commission_rule_id: bizRule?.id, gross_commission_excl_gst: 76500, gst_on_commission: 11475,
            on_top_fee: 3000, commission_after_fee: 73500, user_share_excl_gst: 55125,
            company_share_excl_gst: 18375, estimated_tax: 18191, net_to_user_after_tax: 36934, is_demo: true,
          },
          {
            owner_user_id: userId, deal_type: 'business_sale', listing_name: 'Automotive Workshop - Hamilton',
            expected_close_date: '2026-05-30', probability: 0.45, sale_price: 1500000,
            commission_rule_id: bizRule?.id, gross_commission_excl_gst: 125000, gst_on_commission: 18750,
            on_top_fee: 3000, commission_after_fee: 122000, user_share_excl_gst: 91500,
            company_share_excl_gst: 30500, estimated_tax: 30195, net_to_user_after_tax: 61305, is_demo: true,
          },
          {
            owner_user_id: userId, deal_type: 'lease', listing_name: 'Office Space - 45 Queen St',
            expected_close_date: '2026-03-20', probability: 0.85, annual_rent_excl_gst: 120000,
            commission_rule_id: leaseRule?.id, gross_commission_excl_gst: 20000, gst_on_commission: 3000,
            on_top_fee: 1600, commission_after_fee: 18400, user_share_excl_gst: 14720,
            company_share_excl_gst: 3680, estimated_tax: 4858, net_to_user_after_tax: 9862, is_demo: true,
          },
        ]);
      }

      await supabase.from('gst_periods').insert({
        owner_user_id: userId, period_start: '2026-01-01', period_end: '2026-03-31',
        due_date: '2026-05-28', gst_collected: 7031, gst_paid: 945, net_gst: 6086, is_demo: true,
      });

      await supabase.from('goal_plans').insert({
        owner_user_id: userId, name: 'FY 2025-26 Net Goal', target_net_amount: 200000,
        period_start: '2025-04-01', period_end: '2026-03-31', effective_tax_rate: 0.33, is_demo: true,
      });

      onComplete();
    } catch (err) {
      console.error('Demo seed error:', err);
    }
    setLoading(false);
  }

  return (
    <Card className="shadow-card border-primary/20 bg-primary/5">
      <CardHeader>
        <CardTitle className="text-lg font-heading flex items-center gap-2">
          <Sparkles size={18} className="text-primary" />
          Get Started
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-sm text-muted-foreground">
          Load realistic sample data to explore all features, or try a guided demo tour.
        </p>
        <div className="space-y-2">
          <Button onClick={seedDemoData} disabled={loading || clearing} className="w-full">
            {loading ? 'Generating demo data...' : 'Load Demo Data'}
          </Button>
          <Button variant="outline" onClick={enterDemo} className="w-full">
            <Eye size={16} className="mr-1.5" /> Take a Guided Tour
          </Button>
          <Button variant="ghost" onClick={clearDemoData} disabled={clearing || loading} className="w-full text-destructive hover:text-destructive hover:bg-destructive/10">
            <Trash2 size={16} className="mr-1.5" />
            {clearing ? 'Clearing...' : 'Clear Demo Data'}
          </Button>
        </div>
        <p className="text-xs text-muted-foreground">
          Demo data is clearly labeled and can be cleared anytime.
        </p>
      </CardContent>
    </Card>
  );
}
