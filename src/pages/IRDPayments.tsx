import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { PageHeader } from '@/components/PageHeader';
import { EmptyState } from '@/components/EmptyState';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CreditCard, Check, ArrowRight, Copy, ExternalLink, Loader2 } from 'lucide-react';
import { formatNZD } from '@/services/commissionService';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

const IRD_BANK_ACCOUNT = '03-0049-0001100-027';

export default function IRDPaymentsPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [payments, setPayments] = useState<any[]>([]);
  const [gstPeriods, setGstPeriods] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState<string | null>(null);
  const [irdNumber, setIrdNumber] = useState('');
  const [step, setStep] = useState(0);

  useEffect(() => {
    if (!user) return;
    Promise.all([
      supabase.from('payment_instructions').select('*').eq('owner_user_id', user.id).order('created_at', { ascending: false }),
      supabase.from('gst_periods').select('*').eq('owner_user_id', user.id).order('period_start', { ascending: false }),
      supabase.from('profiles').select('ird_number').eq('owner_user_id', user.id).maybeSingle(),
    ]).then(([payRes, gstRes, profRes]) => {
      setPayments(payRes.data ?? []);
      setGstPeriods(gstRes.data ?? []);
      setIrdNumber(profRes.data?.ird_number || '');
      setLoading(false);
    });
  }, [user]);

  const unpaidPeriods = gstPeriods.filter(p =>
    p.status === 'open' && !payments.some(pay => pay.gst_period_id === p.id && pay.status === 'paid')
  );

  async function createPaymentInstruction() {
    if (!user || !selectedPeriod) return;
    setCreating(true);
    const period = gstPeriods.find(p => p.id === selectedPeriod);
    if (!period) return;

    const ref = `GST ${irdNumber || 'XXX-XXX-XXX'}`;
    
    await supabase.from('payment_instructions').insert({
      owner_user_id: user.id,
      gst_period_id: period.id,
      amount: period.net_gst,
      payment_date: period.due_date,
      ird_number: irdNumber || null,
      payment_reference: ref,
    });

    // Save IRD number to profile
    if (irdNumber) {
      await supabase.from('profiles').update({ ird_number: irdNumber }).eq('owner_user_id', user.id);
    }

    const { data } = await supabase.from('payment_instructions').select('*').eq('owner_user_id', user.id).order('created_at', { ascending: false });
    setPayments(data ?? []);
    setCreating(false);
    setStep(0);
    setSelectedPeriod(null);
  }

  async function markPaid(paymentId: string) {
    await supabase.from('payment_instructions').update({
      status: 'paid',
      marked_paid_at: new Date().toISOString(),
    }).eq('id', paymentId);
    setPayments(prev => prev.map(p => p.id === paymentId ? { ...p, status: 'paid', marked_paid_at: new Date().toISOString() } : p));
    toast({ title: 'Payment marked as paid' });
  }

  function copyToClipboard(text: string) {
    navigator.clipboard.writeText(text);
    toast({ title: 'Copied to clipboard' });
  }

  if (loading) {
    return (
      <>
        <PageHeader title="IRD Payments" />
        <div className="h-32 rounded-xl bg-muted animate-pulse" />
      </>
    );
  }

  return (
    <>
      <PageHeader
        title="IRD Payments"
        description="Step-by-step instructions for paying GST to Inland Revenue"
        action={
          unpaidPeriods.length > 0 && step === 0 ? (
            <Button size="sm" onClick={() => setStep(1)}>
              <CreditCard size={16} className="mr-1.5" />
              Create Payment
            </Button>
          ) : undefined
        }
      />

      {/* Create payment wizard */}
      {step > 0 && (
        <Card className="shadow-card mb-6 border-primary/20 animate-slide-up">
          <CardHeader>
            <CardTitle className="text-lg font-heading">Create Payment Instruction</CardTitle>
            <CardDescription>We'll generate step-by-step instructions to pay IRD.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {step === 1 && (
              <>
                <div className="space-y-2">
                  <Label>Select GST Period</Label>
                  <div className="space-y-2">
                    {unpaidPeriods.map(p => (
                      <button
                        key={p.id}
                        onClick={() => setSelectedPeriod(p.id)}
                        className={cn(
                          'w-full rounded-lg border p-3 text-left transition-all',
                          selectedPeriod === p.id ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/30'
                        )}
                      >
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium">
                            {new Date(p.period_start).toLocaleDateString('en-NZ', { month: 'short', year: 'numeric' })} — {new Date(p.period_end).toLocaleDateString('en-NZ', { month: 'short', year: 'numeric' })}
                          </span>
                          <span className="font-heading font-semibold">{formatNZD(p.net_gst)}</span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          Due: {p.due_date ? new Date(p.due_date).toLocaleDateString('en-NZ') : 'TBC'}
                        </p>
                      </button>
                    ))}
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Your IRD Number</Label>
                  <Input
                    placeholder="123-456-789"
                    value={irdNumber}
                    onChange={e => setIrdNumber(e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground">Used for the payment reference</p>
                </div>
                <div className="flex gap-2">
                  <Button onClick={createPaymentInstruction} disabled={!selectedPeriod || creating} className="flex-1">
                    {creating ? <Loader2 size={16} className="mr-1.5 animate-spin" /> : <ArrowRight size={16} className="mr-1.5" />}
                    Generate Instructions
                  </Button>
                  <Button variant="ghost" onClick={() => { setStep(0); setSelectedPeriod(null); }}>Cancel</Button>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      )}

      {/* Payment instructions list */}
      {payments.length === 0 && step === 0 ? (
        <EmptyState
          icon={CreditCard}
          title="No payment instructions"
          description={unpaidPeriods.length > 0
            ? "You have GST periods ready for payment. Create a payment instruction to get started."
            : "Load demo data from the Dashboard to see GST periods here."
          }
          action={unpaidPeriods.length > 0 ? (
            <Button size="sm" onClick={() => setStep(1)}>
              <CreditCard size={16} className="mr-1.5" /> Create Payment
            </Button>
          ) : undefined}
        />
      ) : (
        <div className="space-y-4">
          {payments.map(payment => {
            const period = gstPeriods.find(p => p.id === payment.gst_period_id);
            return (
              <Card key={payment.id} className="shadow-card">
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="font-heading font-semibold">
                        GST Payment — {formatNZD(payment.amount)}
                      </h3>
                      {period && (
                        <p className="text-sm text-muted-foreground">
                          Period: {new Date(period.period_start).toLocaleDateString('en-NZ', { month: 'short' })} — {new Date(period.period_end).toLocaleDateString('en-NZ', { month: 'short', year: 'numeric' })}
                        </p>
                      )}
                    </div>
                    <Badge variant={payment.status === 'paid' ? 'default' : 'secondary'} className="capitalize">
                      {payment.status}
                    </Badge>
                  </div>

                  {payment.status !== 'paid' && (
                    <div className="space-y-3 rounded-lg bg-muted/50 p-4">
                      <p className="text-sm font-medium">Payment Steps:</p>
                      <div className="space-y-2 text-sm">
                        <div className="flex items-start gap-3">
                          <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-bold">1</span>
                          <div>
                            <p>Log in to your internet banking</p>
                          </div>
                        </div>
                        <div className="flex items-start gap-3">
                          <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-bold">2</span>
                          <div>
                            <p>Add IRD as a payee with account number:</p>
                            <div className="flex items-center gap-2 mt-1">
                              <code className="rounded bg-background px-2 py-1 text-xs font-mono border">{IRD_BANK_ACCOUNT}</code>
                              <button onClick={() => copyToClipboard(IRD_BANK_ACCOUNT)} className="text-primary hover:text-primary/80">
                                <Copy size={14} />
                              </button>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-start gap-3">
                          <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-bold">3</span>
                          <div>
                            <p>Set the amount to <strong>{formatNZD(payment.amount)}</strong></p>
                          </div>
                        </div>
                        <div className="flex items-start gap-3">
                          <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-bold">4</span>
                          <div>
                            <p>Use this reference:</p>
                            <div className="flex items-center gap-2 mt-1">
                              <code className="rounded bg-background px-2 py-1 text-xs font-mono border">{payment.payment_reference}</code>
                              <button onClick={() => copyToClipboard(payment.payment_reference)} className="text-primary hover:text-primary/80">
                                <Copy size={14} />
                              </button>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-start gap-3">
                          <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-bold">5</span>
                          <div>
                            <p>Schedule payment for <strong>{payment.payment_date ? new Date(payment.payment_date).toLocaleDateString('en-NZ') : 'the due date'}</strong></p>
                          </div>
                        </div>
                      </div>

                      <div className="flex gap-2 pt-2">
                        <Button size="sm" onClick={() => markPaid(payment.id)}>
                          <Check size={14} className="mr-1" /> Mark as Paid
                        </Button>
                        <Button size="sm" variant="outline" asChild>
                          <a href="https://www.ird.govt.nz/managing-my-tax/make-a-payment" target="_blank" rel="noopener noreferrer">
                            <ExternalLink size={14} className="mr-1" /> IRD Website
                          </a>
                        </Button>
                      </div>
                    </div>
                  )}

                  {payment.status === 'paid' && payment.marked_paid_at && (
                    <p className="text-sm text-muted-foreground">
                      Marked paid on {new Date(payment.marked_paid_at).toLocaleDateString('en-NZ')}
                    </p>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </>
  );
}
