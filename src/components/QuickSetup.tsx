import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { SkipForward } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { SetupCommissionStep } from '@/components/setup/SetupCommissionStep';
import { SetupGoalStep } from '@/components/setup/SetupGoalStep';
import { SetupPersonalStep } from '@/components/setup/SetupPersonalStep';
import { SetupLogoStep } from '@/components/setup/SetupLogoStep';
import { SetupReviewStep } from '@/components/setup/SetupReviewStep';

const STEP_LABELS = ['Commission', 'Goal', 'Details', 'Logo', 'Review'];

interface QuickSetupProps {
  onComplete: () => void;
}

export function QuickSetup({ onComplete }: QuickSetupProps) {
  const { user } = useAuth();
  const [step, setStep] = useState(0);
  const [saving, setSaving] = useState(false);
  const [userType, setUserType] = useState<string | null>(null);

  const [commission, setCommission] = useState({
    businessSaleUser: 0.75, businessSaleCompany: 0.25,
    leaseUser: 0.80, leaseCompany: 0.20,
    propertyUser: 0.75, propertyCompany: 0.25,
    withholdingRate: 0.20,
  });

  const currentYear = new Date().getFullYear();
  const [goal, setGoal] = useState({
    targetNetAmount: 200000,
    periodStart: `${currentYear}-04-01`,
    periodEnd: `${currentYear + 1}-03-31`,
  });

  const [personal, setPersonal] = useState({
    firstName: '', lastName: '', phone: '', email: '',
    companyName: '', title: '',
  });

  const [logos, setLogos] = useState<{ url: string; name: string }[]>([]);
  const [activeLogo, setActiveLogo] = useState<string | null>(null);
  const [logoSkipped, setLogoSkipped] = useState(false);

  useEffect(() => {
    if (!user) return;
    supabase.from('profiles').select('user_type').eq('owner_user_id', user.id).maybeSingle()
      .then(({ data }) => { if (data?.user_type) setUserType(data.user_type); });
  }, [user]);

  useEffect(() => {
    if (user?.email && !personal.email) {
      setPersonal(p => ({ ...p, email: user.email! }));
    }
  }, [user]);

  async function writeAuditLog(eventType: string, details?: Record<string, unknown>) {
    if (!user) return;
    await supabase.from('audit_logs').insert([{
      owner_user_id: user.id,
      event_type: eventType,
      details: (details ?? {}) as Record<string, string | number | boolean>,
    }]);
  }

  useEffect(() => { writeAuditLog('SetupStarted'); }, []);

  async function handleComplete(skipped = false) {
    if (!user) return;
    setSaving(true);

    try {
      await supabase.from('profiles').update({
        first_name: personal.firstName || null,
        last_name: personal.lastName || null,
        phone: personal.phone || null,
        email: personal.email || null,
        company_name: personal.companyName || null,
        title: personal.title || null,
        business_sale_user_share: commission.businessSaleUser,
        business_sale_company_share: commission.businessSaleCompany,
        lease_user_share: commission.leaseUser,
        lease_company_share: commission.leaseCompany,
        property_sale_user_share: commission.propertyUser,
        property_sale_company_share: commission.propertyCompany,
        withholding_rate: commission.withholdingRate,
        active_theme: 'lavender',
        avatar_url: activeLogo || null,
      }).eq('owner_user_id', user.id);

      await supabase.from('brand_profiles').upsert({
        owner_user_id: user.id,
        logo_url: activeLogo || null,
      }, { onConflict: 'owner_user_id' });

      if (goal.targetNetAmount > 0) {
        await supabase.from('goal_plans').upsert({
          owner_user_id: user.id,
          name: 'Annual Goal',
          target_net_amount: goal.targetNetAmount,
          period_start: goal.periodStart,
          period_end: goal.periodEnd,
          is_active: true,
        }, { onConflict: 'owner_user_id' });
      }

      await supabase.from('setup_state').upsert({
        owner_user_id: user.id,
        current_step: STEP_LABELS.length,
        is_complete: !skipped,
        skipped,
      }, { onConflict: 'owner_user_id' });

      if (!skipped) {
        await Promise.all([
          writeAuditLog('CommissionSettingsUpdated', {
            businessSplit: `${Math.round(commission.businessSaleUser * 100)}/${Math.round(commission.businessSaleCompany * 100)}`,
            leaseSplit: `${Math.round(commission.leaseUser * 100)}/${Math.round(commission.leaseCompany * 100)}`,
            withholdingRate: commission.withholdingRate,
          }),
          writeAuditLog('GoalSet', { targetNetAmount: goal.targetNetAmount }),
          writeAuditLog('BrandingUpdated', { hasLogo: !!activeLogo, logoSkipped }),
          writeAuditLog('SetupCompleted'),
        ]);
      } else {
        await writeAuditLog('SetupSkipped');
      }

      toast.success(skipped ? 'Setup skipped — you can finish later in Settings' : 'Setup complete!');
      onComplete();
    } catch (err) {
      console.error('Setup save error:', err);
      toast.error('Failed to save setup. Please try again.');
    } finally {
      setSaving(false);
    }
  }

  const lastStep = STEP_LABELS.length - 1;

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-lg space-y-6 animate-fade-in">
        <div className="text-center space-y-2">
          <div className="flex justify-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-primary-foreground font-heading font-bold text-lg">
              Hi
            </div>
          </div>
          <h1 className="font-heading text-2xl font-bold text-foreground">Welcome to {userType === 'business_broker' ? 'HiBroker' : 'HiAgent'}</h1>
          <p className="text-muted-foreground text-sm">Let's personalise your experience</p>

          <div className="flex justify-center gap-1.5 pt-2">
            {STEP_LABELS.map((label, i) => (
              <div key={i} className="flex flex-col items-center gap-1">
                <div className={cn('h-1.5 rounded-full transition-all duration-300', i <= step ? 'bg-primary w-6' : 'bg-muted w-3')} />
                <span className={cn('text-[9px] transition-colors', i <= step ? 'text-primary font-medium' : 'text-muted-foreground')}>{label}</span>
              </div>
            ))}
          </div>
        </div>

        {step === 0 && <SetupCommissionStep data={commission} onChange={setCommission} onNext={() => setStep(1)} userType={userType} />}
        {step === 1 && <SetupGoalStep data={goal} onChange={setGoal} onNext={() => setStep(2)} onBack={() => setStep(0)} />}
        {step === 2 && <SetupPersonalStep data={personal} onChange={setPersonal} onNext={() => setStep(3)} onBack={() => setStep(1)} userType={userType} />}
        {step === 3 && (
          <SetupLogoStep
            logos={logos}
            activeLogo={activeLogo}
            onLogosChange={(l, a) => { setLogos(l); setActiveLogo(a); }}
            onNext={() => setStep(4)}
            onBack={() => setStep(2)}
            onSkipLogo={() => { setLogoSkipped(true); setStep(4); }}
          />
        )}
        {step === 4 && (
          <SetupReviewStep
            data={{
              businessSplit: `${Math.round(commission.businessSaleUser * 100)}/${Math.round(commission.businessSaleCompany * 100)}`,
              leaseSplit: `${Math.round(commission.leaseUser * 100)}/${Math.round(commission.leaseCompany * 100)}`,
              propertySplit: `${Math.round(commission.propertyUser * 100)}/${Math.round(commission.propertyCompany * 100)}`,
              withholdingRate: `${Math.round(commission.withholdingRate * 100)}%`,
              goalAmount: goal.targetNetAmount,
              name: [personal.firstName, personal.lastName].filter(Boolean).join(' '),
              email: personal.email,
              hasLogo: !!activeLogo,
              logoUrl: activeLogo,
            }}
            saving={saving}
            onApply={() => handleComplete(false)}
            onBack={() => setStep(3)}
          />
        )}

        {step < lastStep && (
          <div className="text-center">
            <button onClick={() => handleComplete(true)} className="text-xs text-muted-foreground hover:text-foreground transition-colors inline-flex items-center gap-1">
              <SkipForward size={12} />
              Skip setup entirely
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
