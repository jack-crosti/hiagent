import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowRight, Palette } from 'lucide-react';

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
  return (
    <Card className="shadow-card animate-slide-up max-h-[80vh] overflow-y-auto">
      <CardHeader>
        <CardTitle className="text-lg font-heading flex items-center gap-2">
          <Palette size={20} className="text-primary" />
          Customize Your Brand Colors
        </CardTitle>
        <CardDescription>
          Pick your brand colors to personalise the look and feel.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
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
