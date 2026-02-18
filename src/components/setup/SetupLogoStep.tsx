import { useState, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowRight, Upload, Image, Check, Loader2, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface LogoItem {
  url: string;
  name: string;
}

interface Props {
  logos: LogoItem[];
  activeLogo: string | null;
  onLogosChange: (logos: LogoItem[], active: string | null) => void;
  onNext: () => void;
  onBack: () => void;
  onSkipLogo: () => void;
}

const ACCEPTED = '.png,.jpg,.jpeg,.svg,.webp';

export function SetupLogoStep({ logos, activeLogo, onLogosChange, onNext, onBack, onSkipLogo }: Props) {
  const { user } = useAuth();
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files?.length || !user) return;

    setUploading(true);
    const newLogos = [...logos];

    for (const file of Array.from(files)) {
      const ext = file.name.split('.').pop()?.toLowerCase() || '';
      if (!['png', 'jpg', 'jpeg', 'svg', 'webp'].includes(ext)) {
        toast.error(`Unsupported format: .${ext}`);
        continue;
      }
      if (file.size > 5 * 1024 * 1024) {
        toast.error(`File too large: ${file.name} (max 5MB)`);
        continue;
      }

      const path = `${user.id}/${Date.now()}-${file.name}`;
      const { error } = await supabase.storage.from('logos').upload(path, file, {
        cacheControl: '3600',
        upsert: false,
      });

      if (error) {
        toast.error(`Upload failed: ${error.message}`);
        continue;
      }

      const { data: publicUrl } = supabase.storage.from('logos').getPublicUrl(path);
      newLogos.push({ url: publicUrl.publicUrl, name: file.name });
    }

    const active = newLogos.length === 1 ? newLogos[0].url : activeLogo;
    onLogosChange(newLogos, active);
    setUploading(false);
    if (inputRef.current) inputRef.current.value = '';
  }

  function removeLogo(idx: number) {
    const newLogos = logos.filter((_, i) => i !== idx);
    const newActive = activeLogo === logos[idx].url
      ? (newLogos.length ? newLogos[0].url : null)
      : activeLogo;
    onLogosChange(newLogos, newActive);
  }

  return (
    <Card className="shadow-card animate-slide-up">
      <CardHeader>
        <CardTitle className="text-lg font-heading flex items-center gap-2">
          <Image size={20} className="text-primary" />
          Upload Your Logo
        </CardTitle>
        <CardDescription>
          Upload one or more logos. The active logo appears on your dashboard and reports.
          Supported: PNG, JPG, SVG, WebP (max 5MB).
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <input
          ref={inputRef}
          type="file"
          accept={ACCEPTED}
          multiple
          onChange={handleUpload}
          className="hidden"
        />

        {/* Upload area */}
        <button
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="w-full rounded-lg border-2 border-dashed border-border hover:border-primary/40 transition-colors p-8 text-center"
        >
          {uploading ? (
            <Loader2 size={24} className="mx-auto animate-spin text-muted-foreground" />
          ) : (
            <Upload size={24} className="mx-auto text-muted-foreground mb-2" />
          )}
          <p className="text-sm text-muted-foreground">
            {uploading ? 'Uploading...' : 'Click to upload or drag & drop'}
          </p>
        </button>

        {/* Logo grid */}
        {logos.length > 0 && (
          <div className="grid grid-cols-3 gap-3">
            {logos.map((logo, idx) => (
              <div
                key={idx}
                className={cn(
                  'relative rounded-lg border-2 p-2 cursor-pointer transition-all group',
                  activeLogo === logo.url
                    ? 'border-primary bg-primary/5 ring-1 ring-primary/20'
                    : 'border-border hover:border-primary/30'
                )}
                onClick={() => onLogosChange(logos, logo.url)}
              >
                <img
                  src={logo.url}
                  alt={logo.name}
                  className="h-16 w-full object-contain"
                />
                {activeLogo === logo.url && (
                  <div className="absolute top-1 right-1">
                    <Check size={14} className="text-primary" />
                  </div>
                )}
                <button
                  onClick={(e) => { e.stopPropagation(); removeLogo(idx); }}
                  className="absolute bottom-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded bg-destructive/10 text-destructive hover:bg-destructive/20"
                >
                  <Trash2 size={12} />
                </button>
                <p className="text-[10px] text-muted-foreground truncate mt-1 text-center">{logo.name}</p>
              </div>
            ))}
          </div>
        )}

        <div className="flex gap-2 pt-2">
          <Button variant="outline" onClick={onBack} className="flex-1">
            Back
          </Button>
          <Button onClick={onNext} disabled={!activeLogo} className="flex-1">
            Continue
            <ArrowRight size={16} className="ml-1.5" />
          </Button>
        </div>

        <div className="text-center">
          <button
            onClick={onSkipLogo}
            className="text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            Skip logo for now
          </button>
        </div>
      </CardContent>
    </Card>
  );
}
