import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowRight, DollarSign, Info } from 'lucide-react';

interface CommissionData {
  businessSaleUser: number;
  businessSaleCompany: number;
  leaseUser: number;
  leaseCompany: number;
  propertyUser: number;
  propertyCompany: number;
  withholdingRate: number;
}

interface Props {
  data: CommissionData;
  onChange: (data: CommissionData) => void;
  onNext: () => void;
}

function SplitSlider({
  label,
  userShare,
  onChange,
}: {
  label: string;
  userShare: number;
  onChange: (user: number) => void;
}) {
  const pct = Math.round(userShare * 100);
  const companyPct = 100 - pct;
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Label className="text-sm font-medium">{label}</Label>
        <Badge variant="secondary" className="font-mono text-xs">
          {pct}/{companyPct}
        </Badge>
      </div>
      <Slider
        value={[pct]}
        onValueChange={([v]) => onChange(v / 100)}
        min={50}
        max={95}
        step={5}
      />
      <div className="flex justify-between text-xs text-muted-foreground">
        <span>Your share: {pct}%</span>
        <span>Company: {companyPct}%</span>
      </div>
    </div>
  );
}

export function SetupCommissionStep({ data, onChange, onNext }: Props) {
  const whrPct = Math.round(data.withholdingRate * 100);

  return (
    <Card className="shadow-card animate-slide-up">
      <CardHeader>
        <CardTitle className="text-lg font-heading flex items-center gap-2">
          <DollarSign size={20} className="text-primary" />
          Commission Settings
        </CardTitle>
        <CardDescription>
          Set your default commission splits and withholding tax rate.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Splits */}
        <div className="space-y-5">
          <SplitSlider
            label="Business Sale Split"
            userShare={data.businessSaleUser}
            onChange={(v) =>
              onChange({ ...data, businessSaleUser: v, businessSaleCompany: 1 - v })
            }
          />
          <SplitSlider
            label="Lease Split"
            userShare={data.leaseUser}
            onChange={(v) =>
              onChange({ ...data, leaseUser: v, leaseCompany: 1 - v })
            }
          />
          <SplitSlider
            label="Property Sale Split"
            userShare={data.propertyUser}
            onChange={(v) =>
              onChange({ ...data, propertyUser: v, propertyCompany: 1 - v })
            }
          />
        </div>

        {/* Off-the-top fee info */}
        <div className="rounded-lg border border-border bg-muted/30 p-3 space-y-1">
          <div className="flex items-center gap-2 text-sm font-medium">
            <Info size={14} className="text-muted-foreground" />
            Off-the-Top Fee (The Network)
          </div>
          <p className="text-xs text-muted-foreground">
            Minimum $1,650 or 6% of gross commission (whichever is greater). No cap.
            Deducted from gross before your split is applied.
          </p>
        </div>

        {/* Withholding tax */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label className="text-sm font-medium">Withholding Tax Rate</Label>
            <Badge variant="outline" className="font-mono text-xs">
              {whrPct}%
            </Badge>
          </div>
          <div className="flex items-center gap-3">
            <Slider
              value={[whrPct]}
              onValueChange={([v]) => onChange({ ...data, withholdingRate: v / 100 })}
              min={0}
              max={45}
              step={1}
              className="flex-1"
            />
            <Input
              type="number"
              value={whrPct}
              onChange={(e) => {
                const v = Math.min(45, Math.max(0, Number(e.target.value)));
                onChange({ ...data, withholdingRate: v / 100 });
              }}
              className="w-20 text-center"
              min={0}
              max={45}
            />
          </div>
          <p className="text-xs text-muted-foreground">
            Less Withholding tax ({whrPct}%) will be deducted from your share on each deal.
          </p>
        </div>

        <Button onClick={onNext} className="w-full">
          Continue
          <ArrowRight size={16} className="ml-1.5" />
        </Button>
      </CardContent>
    </Card>
  );
}
