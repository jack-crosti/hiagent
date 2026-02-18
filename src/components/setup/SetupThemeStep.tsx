import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, Palette, Sun, Moon, Paintbrush, Globe, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export const TEXTURE_BACKGROUNDS = [
  { id: 'linen-light', name: 'Linen Light', css: 'repeating-linear-gradient(0deg, transparent, transparent 2px, hsl(40 30% 95% / 0.4) 2px, hsl(40 30% 95% / 0.4) 4px)' },
  { id: 'linen-dark', name: 'Linen Dark', css: 'repeating-linear-gradient(0deg, transparent, transparent 2px, hsl(220 15% 15% / 0.3) 2px, hsl(220 15% 15% / 0.3) 4px)' },
  { id: 'soft-grain', name: 'Soft Grain', css: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 200 200\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noise\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.65\' numOctaves=\'3\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noise)\' opacity=\'0.04\'/%3E%3C/svg%3E")' },
  { id: 'concrete-mist', name: 'Concrete Mist', css: 'radial-gradient(circle at 50% 50%, hsl(0 0% 90% / 0.3), transparent 70%), radial-gradient(circle at 80% 20%, hsl(0 0% 85% / 0.2), transparent 60%)' },
  { id: 'concrete-charcoal', name: 'Concrete Charcoal', css: 'radial-gradient(circle at 50% 50%, hsl(0 0% 25% / 0.3), transparent 70%), radial-gradient(circle at 80% 20%, hsl(0 0% 20% / 0.2), transparent 60%)' },
  { id: 'paper-warm', name: 'Paper Warm', css: 'linear-gradient(180deg, hsl(40 30% 96%), hsl(36 25% 94%))' },
  { id: 'paper-cool', name: 'Paper Cool', css: 'linear-gradient(180deg, hsl(210 20% 97%), hsl(210 15% 94%))' },
  { id: 'marble-light', name: 'Marble Light', css: 'radial-gradient(ellipse at 20% 50%, hsl(0 0% 95% / 0.6), transparent 50%), radial-gradient(ellipse at 80% 50%, hsl(0 0% 92% / 0.4), transparent 50%)' },
  { id: 'marble-dark', name: 'Marble Dark', css: 'radial-gradient(ellipse at 20% 50%, hsl(0 0% 18% / 0.5), transparent 50%), radial-gradient(ellipse at 80% 50%, hsl(0 0% 15% / 0.4), transparent 50%)' },
  { id: 'carbon-fiber', name: 'Carbon Fiber', css: 'repeating-linear-gradient(45deg, transparent, transparent 1px, hsl(0 0% 10% / 0.05) 1px, hsl(0 0% 10% / 0.05) 2px)' },
  { id: 'subtle-dots', name: 'Subtle Dots', css: 'radial-gradient(circle, hsl(0 0% 50% / 0.08) 1px, transparent 1px)' },
  { id: 'subtle-grid', name: 'Subtle Grid', css: 'linear-gradient(hsl(0 0% 50% / 0.06) 1px, transparent 1px), linear-gradient(to right, hsl(0 0% 50% / 0.06) 1px, transparent 1px)' },
  { id: 'topo-lines', name: 'Topographic Lines', css: 'repeating-radial-gradient(circle at 50% 50%, transparent 0, transparent 10px, hsl(0 0% 50% / 0.04) 10px, hsl(0 0% 50% / 0.04) 11px)' },
  { id: 'brush-texture', name: 'Brush Texture', css: 'repeating-linear-gradient(88deg, transparent, transparent 3px, hsl(0 0% 50% / 0.03) 3px, hsl(0 0% 50% / 0.03) 5px)' },
  { id: 'satin-wave', name: 'Satin Wave', css: 'linear-gradient(135deg, hsl(0 0% 100% / 0.05) 25%, transparent 25%, transparent 50%, hsl(0 0% 100% / 0.05) 50%, hsl(0 0% 100% / 0.05) 75%, transparent 75%)' },
];

export type ThemeBase = 'light' | 'dark' | 'brand';
export type BackgroundMode = 'solid' | 'gradient' | 'texture';

export interface ThemeData {
  themeBase: ThemeBase;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  backgroundColor: string;
  textColor: string;
  backgroundMode: BackgroundMode;
  backgroundTextureId: string | null;
  websiteUrl: string;
}

interface Props {
  data: ThemeData;
  onChange: (data: ThemeData) => void;
  onNext: () => void;
  onBack: () => void;
}

function ColorPicker({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div className="space-y-1">
      <Label className="text-xs">{label}</Label>
      <div className="flex items-center gap-2">
        <input
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="h-8 w-8 rounded border border-border cursor-pointer"
        />
        <Input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="h-8 text-xs font-mono flex-1"
        />
      </div>
    </div>
  );
}

export function SetupThemeStep({ data, onChange, onNext, onBack }: Props) {
  const [importing, setImporting] = useState(false);
  const [palettes, setPalettes] = useState<{ primary: string; secondary: string; accent: string }[] | null>(null);

  async function handleImport() {
    if (!data.websiteUrl.trim()) return;
    setImporting(true);
    // Simulate palette extraction (would call edge function in production)
    await new Promise((r) => setTimeout(r, 1500));
    setPalettes([
      { primary: '#2A9D8F', secondary: '#E9C46A', accent: '#E76F51' },
      { primary: '#264653', secondary: '#F4A261', accent: '#E76F51' },
      { primary: '#1D3557', secondary: '#457B9D', accent: '#E63946' },
    ]);
    setImporting(false);
  }

  function applyPalette(p: { primary: string; secondary: string; accent: string }) {
    onChange({
      ...data,
      primaryColor: p.primary,
      secondaryColor: p.secondary,
      accentColor: p.accent,
    });
    setPalettes(null);
  }

  const themeOptions: { value: ThemeBase; label: string; icon: React.ReactNode; desc: string }[] = [
    { value: 'light', label: 'Light', icon: <Sun size={18} />, desc: 'Clean light background' },
    { value: 'dark', label: 'Dark', icon: <Moon size={18} />, desc: 'Easy on the eyes' },
    { value: 'brand', label: 'Brand', icon: <Paintbrush size={18} />, desc: 'Custom brand colors' },
  ];

  const bgOptions: { value: BackgroundMode; label: string }[] = [
    { value: 'solid', label: 'Solid' },
    { value: 'gradient', label: 'Gradient' },
    { value: 'texture', label: 'Texture' },
  ];

  return (
    <Card className="shadow-card animate-slide-up max-h-[80vh] overflow-y-auto">
      <CardHeader>
        <CardTitle className="text-lg font-heading flex items-center gap-2">
          <Palette size={20} className="text-primary" />
          Theme & Colors
        </CardTitle>
        <CardDescription>
          Choose a theme base, set your brand colors, and pick a background style.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
        {/* Theme base */}
        <div className="space-y-2">
          <Label className="text-sm font-medium">Theme Base</Label>
          <div className="grid grid-cols-3 gap-2">
            {themeOptions.map((opt) => (
              <button
                key={opt.value}
                onClick={() => onChange({ ...data, themeBase: opt.value })}
                className={cn(
                  'rounded-lg border p-3 text-center transition-all hover:border-primary/40',
                  data.themeBase === opt.value
                    ? 'border-primary bg-primary/5 ring-1 ring-primary/20'
                    : 'border-border'
                )}
              >
                <div className="flex justify-center mb-1 text-primary">{opt.icon}</div>
                <p className="text-xs font-medium">{opt.label}</p>
                <p className="text-[10px] text-muted-foreground">{opt.desc}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Color pickers */}
        <div className="space-y-2">
          <Label className="text-sm font-medium">Colors</Label>
          <div className="grid grid-cols-2 gap-3">
            <ColorPicker label="Primary" value={data.primaryColor} onChange={(v) => onChange({ ...data, primaryColor: v })} />
            <ColorPicker label="Secondary" value={data.secondaryColor} onChange={(v) => onChange({ ...data, secondaryColor: v })} />
            <ColorPicker label="Accent" value={data.accentColor} onChange={(v) => onChange({ ...data, accentColor: v })} />
            <ColorPicker label="Background" value={data.backgroundColor} onChange={(v) => onChange({ ...data, backgroundColor: v })} />
          </div>
          <ColorPicker label="Text" value={data.textColor} onChange={(v) => onChange({ ...data, textColor: v })} />
        </div>

        {/* Import from website */}
        <div className="space-y-2 rounded-lg border border-border p-3">
          <Label className="text-xs flex items-center gap-1.5">
            <Globe size={14} />
            Import Colors from Website
          </Label>
          <div className="flex gap-2">
            <Input
              placeholder="https://yourcompany.co.nz"
              value={data.websiteUrl}
              onChange={(e) => onChange({ ...data, websiteUrl: e.target.value })}
              className="flex-1"
            />
            <Button size="sm" variant="outline" onClick={handleImport} disabled={importing || !data.websiteUrl.trim()}>
              {importing ? <Loader2 size={14} className="animate-spin" /> : 'Extract'}
            </Button>
          </div>
          {palettes && (
            <div className="grid grid-cols-3 gap-2 pt-2">
              {palettes.map((p, i) => (
                <button
                  key={i}
                  onClick={() => applyPalette(p)}
                  className="rounded-lg border border-border p-2 hover:border-primary/40 transition-all"
                >
                  <div className="flex gap-1 mb-1">
                    <div className="h-4 w-4 rounded" style={{ background: p.primary }} />
                    <div className="h-4 w-4 rounded" style={{ background: p.secondary }} />
                    <div className="h-4 w-4 rounded" style={{ background: p.accent }} />
                  </div>
                  <p className="text-[10px] text-muted-foreground">Palette {i + 1}</p>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Background mode */}
        <div className="space-y-2">
          <Label className="text-sm font-medium">Background Style</Label>
          <div className="flex gap-2">
            {bgOptions.map((opt) => (
              <Button
                key={opt.value}
                variant={data.backgroundMode === opt.value ? 'default' : 'outline'}
                size="sm"
                onClick={() => onChange({ ...data, backgroundMode: opt.value })}
              >
                {opt.label}
              </Button>
            ))}
          </div>
        </div>

        {/* Texture picker */}
        {data.backgroundMode === 'texture' && (
          <div className="space-y-2">
            <Label className="text-sm font-medium">Texture</Label>
            <div className="grid grid-cols-5 gap-2 max-h-48 overflow-y-auto">
              {TEXTURE_BACKGROUNDS.map((tex) => (
                <button
                  key={tex.id}
                  onClick={() => onChange({ ...data, backgroundTextureId: tex.id })}
                  className={cn(
                    'rounded-lg border p-1.5 transition-all',
                    data.backgroundTextureId === tex.id
                      ? 'border-primary ring-1 ring-primary/20'
                      : 'border-border hover:border-primary/30'
                  )}
                >
                  <div
                    className="h-10 w-full rounded"
                    style={{
                      background: tex.css,
                      backgroundSize: tex.id === 'subtle-dots' ? '16px 16px' : tex.id === 'subtle-grid' ? '20px 20px' : undefined,
                      backgroundColor: 'hsl(var(--background))',
                    }}
                  />
                  <p className="text-[9px] text-muted-foreground mt-1 text-center truncate">{tex.name}</p>
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="flex gap-2 pt-2">
          <Button variant="outline" onClick={onBack} className="flex-1">
            Back
          </Button>
          <Button onClick={onNext} className="flex-1">
            Continue
            <ArrowRight size={16} className="ml-1.5" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
