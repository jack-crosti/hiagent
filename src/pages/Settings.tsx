import { useEffect, useState, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme, THEMES } from '@/contexts/ThemeContext';
import { supabase } from '@/integrations/supabase/client';
import { PageHeader } from '@/components/PageHeader';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger
} from '@/components/ui/alert-dialog';
import { Shield, Key, Download, Monitor, Trash2, Save, Loader2, UserCircle, Upload, Palette, Paintbrush } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

export default function SettingsPage() {
  const { user, signOut } = useAuth();
  const { toast } = useToast();
  const { activeTheme, setTheme, themes } = useTheme();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [logoUrl, setLogoUrl] = useState('');
  const [animationsEnabled, setAnimationsEnabled] = useState(true);
  const logoInputRef = useRef<HTMLInputElement>(null);
  const [profile, setProfile] = useState({
    first_name: '',
    last_name: '',
    company_name: '',
    title: '',
    phone: '',
    ird_number: '',
    effective_tax_rate: '33',
    probability_threshold: '60',
  });
  const [brand, setBrand] = useState({
    primary_color: '#2A9D8F',
    secondary_color: '#E9C46A',
    accent_color: '#E76F51',
    font_heading: 'Plus Jakarta Sans',
    font_body: 'DM Sans',
  });

  useEffect(() => {
    if (!user) return;
    Promise.all([
      supabase.from('profiles').select('*').eq('owner_user_id', user.id).maybeSingle(),
      supabase.from('brand_profiles').select('*').eq('owner_user_id', user.id).maybeSingle(),
    ]).then(([profileRes, brandRes]) => {
      const data = profileRes.data;
      if (data) {
        setProfile({
          first_name: data.first_name || '',
          last_name: data.last_name || '',
          company_name: data.company_name || '',
          title: data.title || '',
          phone: data.phone || '',
          ird_number: data.ird_number || '',
          effective_tax_rate: ((data.effective_tax_rate || 0.33) * 100).toString(),
          probability_threshold: ((data.probability_threshold || 0.60) * 100).toString(),
        });
        setAnimationsEnabled(data.animations_enabled ?? true);
      }
      const b = brandRes.data;
      if (b) {
        setBrand({
          primary_color: b.primary_color || '#2A9D8F',
          secondary_color: b.secondary_color || '#E9C46A',
          accent_color: b.accent_color || '#E76F51',
          font_heading: b.font_heading || 'Plus Jakarta Sans',
          font_body: b.font_body || 'DM Sans',
        });
        setLogoUrl(b.logo_url || '');
      }
      setLoading(false);
    });
  }, [user]);

  async function handleSave() {
    if (!user) return;
    setSaving(true);
    await Promise.all([
      supabase.from('profiles').update({
        first_name: profile.first_name || null,
        last_name: profile.last_name || null,
        company_name: profile.company_name || null,
        title: profile.title || null,
        phone: profile.phone || null,
        ird_number: profile.ird_number || null,
        effective_tax_rate: (parseFloat(profile.effective_tax_rate) || 33) / 100,
        probability_threshold: (parseFloat(profile.probability_threshold) || 60) / 100,
        animations_enabled: animationsEnabled,
      }).eq('owner_user_id', user.id),
      supabase.from('brand_profiles').upsert({
        owner_user_id: user.id,
        ...brand,
        logo_url: logoUrl || null,
      }, { onConflict: 'owner_user_id' }),
    ]);
    setSaving(false);
    toast({ title: 'Settings saved' });
  }

  async function handleLogoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    const path = `${user.id}/${Date.now()}_${file.name}`;
    const { error } = await supabase.storage.from('logos').upload(path, file);
    if (!error) {
      const { data } = supabase.storage.from('logos').getPublicUrl(path);
      setLogoUrl(data.publicUrl);
      toast({ title: 'Logo uploaded' });
    }
  }

  async function handleDeleteAccount() {
    if (!user) return;
    setDeleting(true);
    try {
      const { error } = await supabase.rpc('delete_user_account');
      if (error) throw error;
      await signOut();
      toast({ title: 'Account deleted', description: 'Your account and all data have been removed.' });
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    }
    setDeleting(false);
  }

  if (loading) {
    return (
      <>
        <PageHeader title="Settings" />
        <div className="h-48 rounded-xl bg-muted animate-pulse" />
      </>
    );
  }

  return (
    <>
      <PageHeader title="Settings" description="Account, profile, appearance, and privacy" />

      <div className="max-w-2xl space-y-6">
        {/* Profile */}
        <Card className="shadow-card">
          <CardHeader>
            <div className="flex items-center gap-2">
              <UserCircle size={20} className="text-primary" />
              <CardTitle className="text-lg font-heading">Profile</CardTitle>
            </div>
            <CardDescription>Your personal and business details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>First Name</Label>
                <Input value={profile.first_name} onChange={e => setProfile(p => ({ ...p, first_name: e.target.value }))} />
              </div>
              <div className="space-y-2">
                <Label>Last Name</Label>
                <Input value={profile.last_name} onChange={e => setProfile(p => ({ ...p, last_name: e.target.value }))} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Company / Brokerage</Label>
                <Input value={profile.company_name} onChange={e => setProfile(p => ({ ...p, company_name: e.target.value }))} />
              </div>
              <div className="space-y-2">
                <Label>Title</Label>
                <Input placeholder="e.g. Business Broker" value={profile.title} onChange={e => setProfile(p => ({ ...p, title: e.target.value }))} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Phone</Label>
                <Input type="tel" placeholder="+64 21 123 4567" value={profile.phone} onChange={e => setProfile(p => ({ ...p, phone: e.target.value }))} />
              </div>
              <div className="space-y-2">
                <Label>IRD Number</Label>
                <Input placeholder="123-456-789" value={profile.ird_number} onChange={e => setProfile(p => ({ ...p, ird_number: e.target.value }))} />
              </div>
            </div>
            <Separator />
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Effective Tax Rate (%)</Label>
                <Input type="number" min="0" max="100" value={profile.effective_tax_rate} onChange={e => setProfile(p => ({ ...p, effective_tax_rate: e.target.value }))} />
              </div>
              <div className="space-y-2">
                <Label>Probability Threshold (%)</Label>
                <Input type="number" min="0" max="100" value={profile.probability_threshold} onChange={e => setProfile(p => ({ ...p, probability_threshold: e.target.value }))} />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Appearance — Theme Picker */}
        <Card className="shadow-card">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Paintbrush size={20} className="text-primary" />
              <CardTitle className="text-lg font-heading">Appearance</CardTitle>
            </div>
            <CardDescription>Choose a theme, upload your logo, customise colors and fonts</CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            {/* Theme presets */}
            <div>
              <Label className="mb-2 block">Theme Preset</Label>
              <div className="grid grid-cols-5 gap-2">
                {themes.map(t => (
                  <button
                    key={t.id}
                    onClick={() => setTheme(t.id)}
                    className={cn(
                      'rounded-xl border-2 p-3 text-center transition-all',
                      activeTheme === t.id ? 'border-primary ring-2 ring-primary/20' : 'border-border hover:border-primary/40'
                    )}
                  >
                    <div className="flex gap-1 justify-center mb-2">
                      <div className="h-4 w-4 rounded-full" style={{ backgroundColor: `hsl(${t.vars['--primary']})` }} />
                      <div className="h-4 w-4 rounded-full" style={{ backgroundColor: `hsl(${t.vars['--accent']})` }} />
                    </div>
                    <p className="text-xs font-medium">{t.name}</p>
                  </button>
                ))}
              </div>
            </div>

            <Separator />

            {/* Logo Upload */}
            <div>
              <Label className="mb-2 block">Logo</Label>
              <div className="flex items-center gap-4">
                {logoUrl ? (
                  <img src={logoUrl} alt="Logo" className="h-12 w-12 rounded-lg object-contain border border-border" />
                ) : (
                  <div className="h-12 w-12 rounded-lg border border-dashed border-border flex items-center justify-center">
                    <Upload size={16} className="text-muted-foreground" />
                  </div>
                )}
                <div>
                  <input ref={logoInputRef} type="file" accept="image/*" className="hidden" onChange={handleLogoUpload} />
                  <Button variant="outline" size="sm" onClick={() => logoInputRef.current?.click()}>
                    <Upload size={14} className="mr-1.5" /> Upload Logo
                  </Button>
                  <p className="text-xs text-muted-foreground mt-1">Displayed in sidebar and exported reports</p>
                </div>
              </div>
            </div>

            <Separator />

            {/* Custom Colors */}
            <div>
              <Label className="mb-2 block">Custom Brand Colors</Label>
              <div className="grid grid-cols-3 gap-4">
                {(['primary_color', 'secondary_color', 'accent_color'] as const).map(key => (
                  <div key={key} className="space-y-1.5">
                    <Label className="text-xs capitalize">{key.replace('_', ' ')}</Label>
                    <div className="flex items-center gap-2">
                      <input type="color" value={brand[key]} onChange={e => setBrand(b => ({ ...b, [key]: e.target.value }))} className="h-8 w-8 rounded border cursor-pointer" />
                      <Input value={brand[key]} onChange={e => setBrand(b => ({ ...b, [key]: e.target.value }))} className="font-mono text-xs h-8" />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <Separator />

            {/* Typography */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Heading Font</Label>
                <Input value={brand.font_heading} onChange={e => setBrand(b => ({ ...b, font_heading: e.target.value }))} />
              </div>
              <div className="space-y-2">
                <Label>Body Font</Label>
                <Input value={brand.font_body} onChange={e => setBrand(b => ({ ...b, font_body: e.target.value }))} />
              </div>
            </div>

            <Separator />

            {/* Animation Toggle */}
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Animations</p>
                <p className="text-xs text-muted-foreground">Enable page transitions and micro-interactions</p>
              </div>
              <Switch checked={animationsEnabled} onCheckedChange={setAnimationsEnabled} />
            </div>
          </CardContent>
        </Card>

        {/* Account */}
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="text-lg font-heading">Account</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <p className="text-sm font-medium">Email</p>
              <p className="text-sm text-muted-foreground">{user?.email}</p>
            </div>
            <div>
              <p className="text-sm font-medium">Last sign in</p>
              <p className="text-sm text-muted-foreground">
                {user?.last_sign_in_at ? new Date(user.last_sign_in_at).toLocaleString('en-NZ') : 'Unknown'}
              </p>
            </div>
            <Button variant="outline" size="sm" onClick={signOut}>Sign Out</Button>
          </CardContent>
        </Card>

        {/* Privacy Center */}
        <Card className="shadow-card">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Shield size={20} className="text-primary" />
              <CardTitle className="text-lg font-heading">Privacy Center</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-lg bg-muted/50 p-4 space-y-2 text-sm text-muted-foreground">
              <p>✓ Your data is isolated to your logged-in account.</p>
              <p>✓ Data is not shared with other accounts.</p>
              <p>✓ The app creator cannot view your data.</p>
            </div>
          </CardContent>
        </Card>

        {/* Danger Zone — Delete Account */}
        <Card className="shadow-card border-destructive/30">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Trash2 size={20} className="text-destructive" />
              <CardTitle className="text-lg font-heading text-destructive">Danger Zone</CardTitle>
            </div>
            <CardDescription>Permanently delete your account and all associated data. This action cannot be undone.</CardDescription>
          </CardHeader>
          <CardContent>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" size="sm">
                  <Trash2 size={14} className="mr-1.5" /> Delete My Account
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will permanently delete your account and all data including transactions, deals, GST periods, and settings. 
                    You will be signed out and can sign up again with the same email.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleDeleteAccount} disabled={deleting} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                    {deleting && <Loader2 size={14} className="mr-1.5 animate-spin" />}
                    Yes, Delete Everything
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </CardContent>
        </Card>

        <Button onClick={handleSave} disabled={saving} className="w-full">
          {saving ? <Loader2 size={16} className="mr-1.5 animate-spin" /> : <Save size={16} className="mr-1.5" />}
          Save All Settings
        </Button>
      </div>
    </>
  );
}
