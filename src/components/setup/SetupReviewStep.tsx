import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, Loader2, DollarSign, User, Image, Target } from 'lucide-react';
import { formatNZD } from '@/services/commissionService';

interface ReviewData {
  businessSplit: string;
  leaseSplit: string;
  propertySplit: string;
  withholdingRate: string;
  goalAmount: number;
  name: string;
  email: string;
  hasLogo: boolean;
  logoUrl: string | null;
}

interface Props {
  data: ReviewData;
  saving: boolean;
  onApply: () => void;
  onBack: () => void;
}

function ReviewRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-center gap-3 py-2">
      <div className="text-primary shrink-0">{icon}</div>
      <span className="text-sm text-muted-foreground flex-1">{label}</span>
      <Badge variant="secondary" className="font-mono text-xs shrink-0">{value}</Badge>
    </div>
  );
}

export function SetupReviewStep({ data, saving, onApply, onBack }: Props) {
  return (
    <Card className="shadow-card animate-slide-up">
      <CardHeader>
        <CardTitle className="text-lg font-heading flex items-center gap-2">
          <Check size={20} className="text-primary" />
          Review & Apply
        </CardTitle>
        <CardDescription>
          Here's a summary of your setup. You can always change these in Settings.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="rounded-lg border border-border bg-muted/30 p-4 space-y-1 divide-y divide-border/50">
          <ReviewRow icon={<DollarSign size={14} />} label="Business Sale Split" value={data.businessSplit} />
          <ReviewRow icon={<DollarSign size={14} />} label="Lease Split" value={data.leaseSplit} />
          <ReviewRow icon={<DollarSign size={14} />} label="Property Sale Split" value={data.propertySplit} />
          <ReviewRow icon={<DollarSign size={14} />} label="Withholding Tax" value={data.withholdingRate} />
          <ReviewRow icon={<Target size={14} />} label="Commission Goal" value={data.goalAmount > 0 ? formatNZD(data.goalAmount) : 'Not set'} />
          {data.name && <ReviewRow icon={<User size={14} />} label="Name" value={data.name} />}
          {data.email && <ReviewRow icon={<User size={14} />} label="Email" value={data.email} />}
          <ReviewRow icon={<Image size={14} />} label="Logo" value={data.hasLogo ? 'Uploaded' : 'Skipped'} />
        </div>

        {data.logoUrl && (
          <div className="rounded-lg border border-border p-3 flex items-center gap-3">
            <img src={data.logoUrl} alt="Logo preview" className="h-10 w-auto object-contain" />
            <div>
              <p className="text-xs font-medium">Dashboard Header Preview</p>
              <p className="text-[10px] text-muted-foreground">Your logo will appear in the sidebar and reports</p>
            </div>
          </div>
        )}

        <div className="flex gap-2 pt-2">
          <Button variant="outline" onClick={onBack} className="flex-1">Back</Button>
          <Button onClick={onApply} disabled={saving} className="flex-1">
            {saving ? <Loader2 size={16} className="mr-1.5 animate-spin" /> : <Check size={16} className="mr-1.5" />}
            Apply & Launch Dashboard
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
