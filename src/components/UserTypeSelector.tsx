import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { TubesBackground } from '@/components/ui/neon-flow';
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
    <TubesBackground className="min-h-screen">
      <div className="w-full max-w-lg space-y-6 animate-fade-in p-4">
        <div className="text-center space-y-2">
          <div className="flex justify-center">
            <span className="font-heading font-bold text-[7.5rem] leading-none text-white">
              Hi<span className="text-violet-500">Agent</span>
            </span>
          </div>
          <h1 className="font-heading text-2xl font-bold text-white pt-6">What best describes you?</h1>
          <p className="text-white/70 text-sm">We'll personalise your experience to match your workflow</p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <button
            onClick={() => setSelected('business_broker')}
            className={cn(
              'rounded-xl border-2 p-6 text-center transition-all backdrop-blur-sm',
              selected === 'business_broker'
                ? 'border-violet-500 bg-white/25 ring-4 ring-violet-500/40 shadow-lg shadow-violet-500/20 scale-[1.03]'
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
                ? 'border-violet-500 bg-white/25 ring-4 ring-violet-500/40 shadow-lg shadow-violet-500/20 scale-[1.03]'
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
    </TubesBackground>
  );
}
