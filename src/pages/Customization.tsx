import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { PageHeader } from '@/components/PageHeader';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Palette, Globe, Save, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function CustomizationPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
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

  async function handleSave() {
    if (!user) return;
    setSaving(true);
    await supabase.from('brand_profiles').upsert({
      owner_user_id: user.id,
      ...brand,
    }, { onConflict: 'owner_user_id' });
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
              <div className="space-y-2">
                <Label>Primary</Label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={brand.primary_color}
                    onChange={e => setBrand(b => ({ ...b, primary_color: e.target.value }))}
                    className="h-10 w-10 rounded-lg border cursor-pointer"
                  />
                  <Input
                    value={brand.primary_color}
                    onChange={e => setBrand(b => ({ ...b, primary_color: e.target.value }))}
                    className="font-mono text-xs"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Secondary</Label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={brand.secondary_color}
                    onChange={e => setBrand(b => ({ ...b, secondary_color: e.target.value }))}
                    className="h-10 w-10 rounded-lg border cursor-pointer"
                  />
                  <Input
                    value={brand.secondary_color}
                    onChange={e => setBrand(b => ({ ...b, secondary_color: e.target.value }))}
                    className="font-mono text-xs"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Accent</Label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={brand.accent_color}
                    onChange={e => setBrand(b => ({ ...b, accent_color: e.target.value }))}
                    className="h-10 w-10 rounded-lg border cursor-pointer"
                  />
                  <Input
                    value={brand.accent_color}
                    onChange={e => setBrand(b => ({ ...b, accent_color: e.target.value }))}
                    className="font-mono text-xs"
                  />
                </div>
              </div>
            </div>

            {/* Preview swatch */}
            <div className="flex gap-2">
              <div className="h-8 flex-1 rounded-lg" style={{ backgroundColor: brand.primary_color }} />
              <div className="h-8 flex-1 rounded-lg" style={{ backgroundColor: brand.secondary_color }} />
              <div className="h-8 flex-1 rounded-lg" style={{ backgroundColor: brand.accent_color }} />
            </div>
          </CardContent>
        </Card>

        {/* Fonts */}
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="text-lg font-heading">Typography</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Heading Font</Label>
                <Input
                  value={brand.font_heading}
                  onChange={e => setBrand(b => ({ ...b, font_heading: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label>Body Font</Label>
                <Input
                  value={brand.font_body}
                  onChange={e => setBrand(b => ({ ...b, font_body: e.target.value }))}
                />
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
