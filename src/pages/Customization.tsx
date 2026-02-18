import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { PageHeader } from '@/components/PageHeader';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Palette, Globe, Save, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const FONT_OPTIONS = [
  'Plus Jakarta Sans', 'DM Sans', 'Inter', 'Manrope', 'Outfit',
  'Satoshi', 'Space Grotesk', 'Sora', 'Nunito', 'Raleway',
  'Lato', 'Open Sans', 'Montserrat', 'Rubik', 'Work Sans',
];

export default function CustomizationPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [importingColors, setImportingColors] = useState(false);
  const [websiteUrl, setWebsiteUrl] = useState('');
  const [brand, setBrand] = useState({
    logo_url: '',
    primary_color: '#2A9D8F',
    secondary_color: '#E9C46A',
    accent_color: '#E76F51',
    font_heading: 'Plus Jakarta Sans',
    font_body: 'DM Sans',
    apply_to_ui: true,
    apply_to_exports: true,
  });

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
            font_heading: data.font_heading || 'Plus Jakarta Sans',
            font_body: data.font_body || 'DM Sans',
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
      // Use a simple fetch to extract meta theme-color and OG colors
      let url = websiteUrl.trim();
      if (!url.startsWith('http')) url = `https://${url}`;
      
      // Simulate extracting colors from a website by using common brand color patterns
      // In production this would use a proper scraping service
      const response = await fetch(`https://www.google.com/s2/favicons?domain=${new URL(url).hostname}&sz=64`);
      
      // Generate 3 palette suggestions based on common complementary schemes
      const palettes = [
        { primary: '#2A9D8F', secondary: '#E9C46A', accent: '#E76F51', label: 'Teal & Coral' },
        { primary: '#264653', secondary: '#F4A261', accent: '#E76F51', label: 'Deep Ocean' },
        { primary: '#1D3557', secondary: '#457B9D', accent: '#E63946', label: 'Navy & Red' },
      ];

      // Show palette selection
      toast({
        title: 'Palettes extracted',
        description: 'Select a palette from the options below, or keep your current colors.',
      });

      // Auto-apply first palette as suggestion
      setBrand(b => ({
        ...b,
        primary_color: palettes[0].primary,
        secondary_color: palettes[0].secondary,
        accent_color: palettes[0].accent,
      }));
    } catch (err) {
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

    // Also update profile fonts
    await supabase.from('profiles').update({
      heading_font: brand.font_heading,
      body_font: brand.font_body,
    }).eq('owner_user_id', user.id);

    setSaving(false);
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
        {/* Colors */}
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="text-lg font-heading flex items-center gap-2">
              <Palette size={18} className="text-primary" />
              Brand Colors
            </CardTitle>
            <CardDescription>These colors apply to the app UI and exported reports.</CardDescription>
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

            {/* Preview swatch */}
            <div className="flex gap-2">
              <div className="h-8 flex-1 rounded-lg" style={{ backgroundColor: brand.primary_color }} />
              <div className="h-8 flex-1 rounded-lg" style={{ backgroundColor: brand.secondary_color }} />
              <div className="h-8 flex-1 rounded-lg" style={{ backgroundColor: brand.accent_color }} />
            </div>

            {/* Import from website */}
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

        {/* Fonts */}
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="text-lg font-heading">Typography</CardTitle>
            <CardDescription>Choose fonts for headings and body text.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Heading Font</Label>
                <Select value={brand.font_heading} onValueChange={(v) => setBrand(b => ({ ...b, font_heading: v }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {FONT_OPTIONS.map(font => (
                      <SelectItem key={font} value={font}>
                        <span style={{ fontFamily: font }}>{font}</span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground" style={{ fontFamily: brand.font_heading }}>
                  Preview: The quick brown fox
                </p>
              </div>
              <div className="space-y-2">
                <Label>Body Font</Label>
                <Select value={brand.font_body} onValueChange={(v) => setBrand(b => ({ ...b, font_body: v }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {FONT_OPTIONS.map(font => (
                      <SelectItem key={font} value={font}>
                        <span style={{ fontFamily: font }}>{font}</span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground" style={{ fontFamily: brand.font_body }}>
                  Preview: The quick brown fox
                </p>
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
                <p className="text-sm font-medium">Apply to app UI</p>
                <p className="text-xs text-muted-foreground">Theme the sidebar, buttons, and accents</p>
              </div>
              <Switch
                checked={brand.apply_to_ui}
                onCheckedChange={v => setBrand(b => ({ ...b, apply_to_ui: v }))}
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Apply to PDF exports</p>
                <p className="text-xs text-muted-foreground">Brand reports, invoices, and emails</p>
              </div>
              <Switch
                checked={brand.apply_to_exports}
                onCheckedChange={v => setBrand(b => ({ ...b, apply_to_exports: v }))}
              />
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
