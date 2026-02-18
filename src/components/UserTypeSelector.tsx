import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
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
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-lg space-y-6 animate-fade-in">
        <div className="text-center space-y-2">
          <div className="flex justify-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-primary-foreground font-heading font-bold text-lg">
              LP
            </div>
          </div>
          <h1 className="font-heading text-2xl font-bold text-foreground">What best describes you?</h1>
          <p className="text-muted-foreground text-sm">We'll personalise the app to match your workflow</p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <button
            onClick={() => setSelected('business_broker')}
            className={cn(
              'rounded-xl border-2 p-6 text-center transition-all hover:border-primary/40',
              selected === 'business_broker'
                ? 'border-primary bg-primary/5 ring-2 ring-primary/20'
                : 'border-border'
            )}
          >
            <Building2 size={32} className="mx-auto mb-3 text-primary" />
            <p className="font-heading font-semibold">Business Broker</p>
            <p className="text-xs text-muted-foreground mt-1">Business sales, valuations & deals</p>
          </button>

          <button
            onClick={() => setSelected('real_estate_agent')}
            className={cn(
              'rounded-xl border-2 p-6 text-center transition-all hover:border-primary/40',
              selected === 'real_estate_agent'
                ? 'border-primary bg-primary/5 ring-2 ring-primary/20'
                : 'border-border'
            )}
          >
            <Home size={32} className="mx-auto mb-3 text-primary" />
            <p className="font-heading font-semibold">Real Estate Agent</p>
            <p className="text-xs text-muted-foreground mt-1">Property sales, leases & listings</p>
          </button>
        </div>

        <Button onClick={handleContinue} disabled={!selected || saving} className="w-full">
          {saving && <Loader2 size={16} className="mr-1.5 animate-spin" />}
          Continue
        </Button>
      </div>
    </div>
  );
}
