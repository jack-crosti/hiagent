import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Globe, Building2, ArrowRight, SkipForward, Check, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

const BROKERS = [
  { id: 'abc_business', name: 'ABC Business Sales', desc: 'NZ business brokerage' },
  { id: 'link_business', name: 'LINK Business', desc: 'NZ & AU business sales' },
  { id: 'nz_business_sales', name: 'NZ Business Sales', desc: 'Regional brokerage' },
  { id: 'bayleys', name: 'Bayleys', desc: 'Property & commercial' },
  { id: 'colliers', name: 'Colliers NZ', desc: 'Commercial real estate' },
  { id: 'other', name: 'Other / Independent', desc: 'Custom setup' },
];

interface QuickSetupProps {
  onComplete: () => void;
}

export function QuickSetup({ onComplete }: QuickSetupProps) {
  const { user } = useAuth();
  const [step, setStep] = useState(0);
  const [websiteUrl, setWebsiteUrl] = useState('');
  const [selectedBroker, setSelectedBroker] = useState<string | null>(null);
  const [scanning, setScanning] = useState(false);
  const [saving, setSaving] = useState(false);

  async function handleScan() {
    if (!websiteUrl.trim()) {
      setStep(2);
      return;
    }
    setScanning(true);
    // Simulate brand scan (will be replaced with AI edge function later)
    await new Promise(r => setTimeout(r, 1500));
    setScanning(false);
    setStep(2);
  }

  async function handleComplete(skipped = false) {
    if (!user) return;
    setSaving(true);
    
    await supabase.from('setup_state').upsert({
      owner_user_id: user.id,
      current_step: 3,
      is_complete: true,
      skipped,
      selected_broker: selectedBroker,
      website_url: websiteUrl || null,
    }, { onConflict: 'owner_user_id' });

    // Create default profile fields if not exist
    await supabase.from('profiles').upsert({
      owner_user_id: user.id,
      company_name: selectedBroker ? BROKERS.find(b => b.id === selectedBroker)?.name : null,
    }, { onConflict: 'owner_user_id' });

    setSaving(false);
    onComplete();
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-lg space-y-6 animate-fade-in">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="flex justify-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-primary-foreground font-heading font-bold text-lg">
              LP
            </div>
          </div>
          <h1 className="font-heading text-2xl font-bold text-foreground">Welcome to LedgerPilot</h1>
          <p className="text-muted-foreground text-sm">Let's get you set up in under a minute</p>
          
          {/* Steps indicator */}
          <div className="flex justify-center gap-2 pt-2">
            {[0, 1, 2].map(i => (
              <div
                key={i}
                className={cn(
                  'h-1.5 rounded-full transition-all duration-300',
                  i <= step ? 'bg-primary w-8' : 'bg-muted w-4'
                )}
              />
            ))}
          </div>
        </div>

        {/* Step 0: Website scan */}
        {step === 0 && (
          <Card className="shadow-card animate-slide-up">
            <CardHeader>
              <CardTitle className="text-lg font-heading flex items-center gap-2">
                <Globe size={20} className="text-primary" />
                Brand Your App
              </CardTitle>
              <CardDescription>
                Enter your website URL to auto-detect your logo, colours, and fonts.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="website">Website URL</Label>
                <Input
                  id="website"
                  placeholder="https://yourcompany.co.nz"
                  value={websiteUrl}
                  onChange={e => setWebsiteUrl(e.target.value)}
                />
              </div>
              <div className="flex gap-2">
                <Button onClick={handleScan} disabled={scanning} className="flex-1">
                  {scanning ? (
                    <>
                      <Loader2 size={16} className="mr-1.5 animate-spin" />
                      Scanning...
                    </>
                  ) : (
                    <>
                      Scan Website
                      <ArrowRight size={16} className="ml-1.5" />
                    </>
                  )}
                </Button>
                <Button variant="ghost" onClick={() => setStep(1)}>
                  Skip
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 1: Select broker */}
        {step === 1 && (
          <Card className="shadow-card animate-slide-up">
            <CardHeader>
              <CardTitle className="text-lg font-heading flex items-center gap-2">
                <Building2 size={20} className="text-primary" />
                Select Your Brokerage
              </CardTitle>
              <CardDescription>
                This helps us pre-fill commission structures and rules.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-2">
                {BROKERS.map(broker => (
                  <button
                    key={broker.id}
                    onClick={() => setSelectedBroker(broker.id)}
                    className={cn(
                      'rounded-lg border p-3 text-left transition-all hover:border-primary/40',
                      selectedBroker === broker.id
                        ? 'border-primary bg-primary/5 ring-1 ring-primary/20'
                        : 'border-border'
                    )}
                  >
                    <p className="text-sm font-medium">{broker.name}</p>
                    <p className="text-xs text-muted-foreground">{broker.desc}</p>
                    {selectedBroker === broker.id && (
                      <Check size={14} className="text-primary mt-1" />
                    )}
                  </button>
                ))}
              </div>
              <div className="flex gap-2 pt-2">
                <Button onClick={() => setStep(2)} disabled={!selectedBroker} className="flex-1">
                  Continue
                  <ArrowRight size={16} className="ml-1.5" />
                </Button>
                <Button variant="ghost" onClick={() => setStep(2)}>Skip</Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 2: Confirmation */}
        {step === 2 && (
          <Card className="shadow-card animate-slide-up">
            <CardHeader>
              <CardTitle className="text-lg font-heading">You're All Set!</CardTitle>
              <CardDescription>
                Your personalised dashboard is ready. You can always change these later in Settings.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-lg bg-muted/50 p-4 space-y-2 text-sm">
                {websiteUrl && (
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary">Website</Badge>
                    <span className="text-muted-foreground truncate">{websiteUrl}</span>
                  </div>
                )}
                {selectedBroker && (
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary">Broker</Badge>
                    <span className="text-muted-foreground">
                      {BROKERS.find(b => b.id === selectedBroker)?.name}
                    </span>
                  </div>
                )}
                {!websiteUrl && !selectedBroker && (
                  <p className="text-muted-foreground">Using default settings — you can customise later.</p>
                )}
              </div>
              <Button onClick={() => handleComplete(false)} disabled={saving} className="w-full">
                {saving ? (
                  <Loader2 size={16} className="mr-1.5 animate-spin" />
                ) : (
                  <Check size={16} className="mr-1.5" />
                )}
                Launch Dashboard
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Skip all */}
        {step < 2 && (
          <div className="text-center">
            <button
              onClick={() => handleComplete(true)}
              className="text-xs text-muted-foreground hover:text-foreground transition-colors inline-flex items-center gap-1"
            >
              <SkipForward size={12} />
              Skip setup entirely
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
