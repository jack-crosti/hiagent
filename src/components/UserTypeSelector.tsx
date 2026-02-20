import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { GradientBackground } from '@/components/ui/gradient-background';
import { Building2, Home, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface UserTypeSelectorProps {
  onComplete: () => void;
}

export function UserTypeSelector({ onComplete }: UserTypeSelectorProps) {
  const { user } = useAuth();
  const [selected, setSelected] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function handleContinue() {
    if (!user || !selected) return;
    setSaving(true);
    await supabase.from('profiles').update({ user_type: selected }).eq('owner_user_id', user.id);
    setSaving(false);
    onComplete();
  }

  return (
    <GradientBackground
      className="min-h-screen"
      overlay
      overlayOpacity={0.4}
      gradients={[
        "linear-gradient(135deg, #2d1b69 0%, #11998e 100%)",
        "linear-gradient(135deg, #8e2de2 0%, #4a00e0 100%)",
        "linear-gradient(135deg, #0f3460 0%, #e94560 100%)",
        "linear-gradient(135deg, #134e5e 0%, #71b280 100%)",
        "linear-gradient(135deg, #2d1b69 0%, #11998e 100%)",
      ]}
    >
      <div className="w-full max-w-lg space-y-6 animate-fade-in p-4">
        <div className="text-center space-y-2">
          <div className="flex justify-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/20 backdrop-blur-sm text-white font-heading font-bold text-lg">
              Hi
            </div>
          </div>
          <h1 className="font-heading text-2xl font-bold text-white">What best describes you?</h1>
          <p className="text-white/70 text-sm">We'll personalise your experience to match your workflow</p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <button
            onClick={() => setSelected('business_broker')}
            className={cn(
              'rounded-xl border-2 p-6 text-center transition-all backdrop-blur-sm',
              selected === 'business_broker'
                ? 'border-white bg-white/20 ring-2 ring-white/30'
                : 'border-white/20 bg-white/10 hover:border-white/40'
            )}
          >
            <Building2 size={32} className="mx-auto mb-3 text-white" />
            <p className="font-heading font-semibold text-white">Business Broker</p>
          </button>

          <button
            onClick={() => setSelected('real_estate_agent')}
            className={cn(
              'rounded-xl border-2 p-6 text-center transition-all backdrop-blur-sm',
              selected === 'real_estate_agent'
                ? 'border-white bg-white/20 ring-2 ring-white/30'
                : 'border-white/20 bg-white/10 hover:border-white/40'
            )}
          >
            <Home size={32} className="mx-auto mb-3 text-white" />
            <p className="font-heading font-semibold text-white">Real Estate Agent</p>
          </button>
        </div>

        <Button onClick={handleContinue} disabled={!selected || saving} className="w-full bg-white text-foreground hover:bg-white/90 font-semibold">
          {saving && <Loader2 size={16} className="mr-1.5 animate-spin" />}
          Continue
        </Button>
      </div>
    </GradientBackground>
  );
}
