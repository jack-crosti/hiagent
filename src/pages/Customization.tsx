import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { PageHeader } from '@/components/PageHeader';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Palette, Globe, Save, Loader2, Check, Moon } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useTheme, getThemeFamily, THEME_FAMILIES } from '@/contexts/ThemeContext';
import { cn } from '@/lib/utils';

export default function CustomizationPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const { refreshBrand, activeTheme, setTheme, isDark, toggleDarkMode } = useTheme();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [importingColors, setImportingColors] = useState(false);
  const [websiteUrl, setWebsiteUrl] = useState('');
  const [brand, setBrand] = useState({
    logo_url: '',
    primary_color: '#2A9D8F',
    secondary_color: '#E9C46A',
    accent_color: '#E76F51',
    apply_to_ui: true,
    apply_to_exports: true,
  });

  const currentFamily = getThemeFamily(activeTheme);

  useEffect(() => {
    if (!user) return;
    supabase.from('brand_profiles').select('*').eq('owner_user_id', user.id).maybeSingle()
      .then(({ data }) => {
        if (data) {
          setBrand({
            logo_url: data.logo_url || '',
            primary_color: data.primary_color || '#2A9D8F',
            secondary_color: data.secondary_color || '#E9C46A',
            accent_color: data.accent_color || '#E76F51',
            apply_to_ui: data.apply_to_ui ?? true,
            apply_to_exports: data.apply_to_exports ?? true,
          });
        }
        setLoading(false);
      });
  }, [user]);

  async function handleImportColors() {
    if (!websiteUrl.trim()) return;
    setImportingColors(true);
    try {
      const { data, error } = await supabase.functions.invoke('extract-brand-colors', {
        body: { url: websiteUrl.trim() },
      });
      if (error) throw error;
      if (data?.primary) {
        setBrand(b => ({
          ...b,
          primary_color: data.primary,
          secondary_color: data.secondary || b.secondary_color,
          accent_color: data.accent || b.accent_color,
        }));
        toast({ title: 'Colors extracted!', description: 'Brand colors imported from your website.' });
      } else {
        toast({ title: 'No colors found', description: 'Could not extract colors from that URL.', variant: 'destructive' });
      }
    } catch (err) {
      console.error('Import colors error:', err);
      toast({ title: 'Could not import colors', description: 'Please enter colors manually.', variant: 'destructive' });
    }
    setImportingColors(false);
  }

  async function handleSave() {
    if (!user) return;
    setSaving(true);
    await supabase.from('brand_profiles').upsert({
      owner_user_id: user.id,
      ...brand,
    }, { onConflict: 'owner_user_id' });
    setSaving(false);
    refreshBrand();
    toast({ title: 'Brand settings saved' });
  }

  if (loading) {
    return (
      <>
        <PageHeader title="Customization" />
        <div className="h-48 rounded-xl bg-muted animate-pulse" />
      </>
    );
  }

  return (
    <>
      <PageHeader title="Customization" description="Brand your app, reports, and emails" />

      <div className="max-w-2xl space-y-6">
        {/* Theme Picker */}
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="text-lg font-heading flex items-center gap-2">
              <Palette size={18} className="text-primary" />
              Theme
            </CardTitle>
            <CardDescription>Choose a theme and toggle dark mode. Select "Brand Colors" to use your custom palette.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {THEME_FAMILIES.map(f => (
                <button
                  key={f.id}
                  onClick={() => setTheme(f.id)}
                  className={cn(
                    'relative rounded-xl border-2 p-3 text-left transition-all',
                    currentFamily === f.id ? 'border-primary shadow-md' : 'border-border hover:border-primary/40'
                  )}
                >
                  {currentFamily === f.id && (
                    <div className="absolute top-2 right-2 h-5 w-5 rounded-full bg-primary flex items-center justify-center">
                      <Check size={12} className="text-primary-foreground" />
                    </div>
                  )}
                  <div className="flex gap-1 mb-2">
                    <div className="h-6 w-6 rounded-md border border-border" style={{ background: f.id === 'brand' ? brand.primary_color : f.previewBg }} />
                    <div className="h-6 w-6 rounded-md border border-border" style={{ background: f.id === 'brand' ? '#2A2A2A' : f.previewSidebar }} />
                    <div className="h-6 w-6 rounded-md border border-border" style={{ background: f.id === 'brand' ? brand.accent_color : f.previewPrimary }} />
                  </div>
                  <p className="text-sm font-medium">{f.name}</p>
                  <p className="text-[10px] text-muted-foreground">{f.description}</p>
                </button>
              ))}
            </div>

            <div className="flex items-center justify-between pt-2">
              <div className="flex items-center gap-2">
                <Moon size={16} className="text-muted-foreground" />
                <span className="text-sm font-medium">Dark mode</span>
              </div>
              <Switch checked={isDark} onCheckedChange={toggleDarkMode} />
            </div>
          </CardContent>
        </Card>

        {/* Colors */}
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="text-lg font-heading flex items-center gap-2">
              <Palette size={18} className="text-primary" />
              Brand Colors
            </CardTitle>
            <CardDescription>Set your brand colors. Select the "Brand Colors" theme above to apply them to the UI.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              {(['primary_color', 'secondary_color', 'accent_color'] as const).map(key => (
                <div key={key} className="space-y-2">
                  <Label className="capitalize">{key.replace('_', ' ')}</Label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={brand[key]}
                      onChange={e => setBrand(b => ({ ...b, [key]: e.target.value }))}
                      className="h-10 w-10 rounded-lg border cursor-pointer"
                    />
                    <Input
                      value={brand[key]}
                      onChange={e => setBrand(b => ({ ...b, [key]: e.target.value }))}
                      className="font-mono text-xs"
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className="flex gap-2">
              <div className="h-8 flex-1 rounded-lg" style={{ backgroundColor: brand.primary_color }} />
              <div className="h-8 flex-1 rounded-lg" style={{ backgroundColor: brand.secondary_color }} />
              <div className="h-8 flex-1 rounded-lg" style={{ backgroundColor: brand.accent_color }} />
            </div>

            <div className="rounded-lg border border-border p-3 space-y-2">
              <Label className="text-xs flex items-center gap-1.5">
                <Globe size={14} />
                Import Colors from Website
              </Label>
              <div className="flex gap-2">
                <Input
                  placeholder="https://yourcompany.co.nz"
                  value={websiteUrl}
                  onChange={(e) => setWebsiteUrl(e.target.value)}
                  className="flex-1"
                />
                <Button size="sm" variant="outline" onClick={handleImportColors} disabled={importingColors || !websiteUrl.trim()}>
                  {importingColors ? <Loader2 size={14} className="animate-spin" /> : 'Extract'}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Apply settings */}
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="text-lg font-heading">Apply Branding</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Apply to PDF exports</p>
                <p className="text-xs text-muted-foreground">Brand reports, invoices, and emails</p>
              </div>
              <Switch checked={brand.apply_to_exports} onCheckedChange={v => setBrand(b => ({ ...b, apply_to_exports: v }))} />
            </div>
          </CardContent>
        </Card>

        <Button onClick={handleSave} disabled={saving} className="w-full">
          {saving ? <Loader2 size={16} className="mr-1.5 animate-spin" /> : <Save size={16} className="mr-1.5" />}
          Save Brand Settings
        </Button>
      </div>
    </>
  );
}
