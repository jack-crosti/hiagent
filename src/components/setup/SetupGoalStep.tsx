import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, Target } from 'lucide-react';
import { formatNZD } from '@/services/commissionService';

interface GoalData {
  targetNetAmount: number;
  periodStart: string;
  periodEnd: string;
}

interface Props {
  data: GoalData;
  onChange: (data: GoalData) => void;
  onNext: () => void;
  onBack: () => void;
}

export function SetupGoalStep({ data, onChange, onNext, onBack }: Props) {
  // Default to NZ financial year (1 Apr - 31 Mar)
  const currentYear = new Date().getFullYear();
  const defaultStart = `${currentYear}-04-01`;
  const defaultEnd = `${currentYear + 1}-03-31`;

  return (
    <Card className="shadow-card animate-slide-up">
      <CardHeader>
        <CardTitle className="text-lg font-heading flex items-center gap-2">
          <Target size={20} className="text-primary" />
          Financial Year Goal
        </CardTitle>
        <CardDescription>
          What's your net commission target this financial year? This helps track your progress and generate deal scenarios.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
        {/* Target amount */}
        <div className="space-y-2">
          <Label className="text-sm font-medium">Net Commission Target (after withholding)</Label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">$</span>
            <Input
              type="number"
              min={0}
              step={1000}
              value={data.targetNetAmount || ''}
              onChange={(e) => onChange({ ...data, targetNetAmount: Number(e.target.value) || 0 })}
              className="pl-7 text-lg font-heading"
              placeholder="200,000"
            />
          </div>
          {data.targetNetAmount > 0 && (
            <p className="text-xs text-muted-foreground">
              Target: <span className="font-semibold text-primary">{formatNZD(data.targetNetAmount)}</span> net to you after withholding tax
            </p>
          )}
        </div>

        {/* Quick presets */}
        <div className="space-y-2">
          <Label className="text-xs text-muted-foreground">Quick presets</Label>
          <div className="flex flex-wrap gap-2">
            {[100000, 150000, 200000, 250000, 300000, 500000].map((amt) => (
              <button
                key={amt}
                onClick={() => onChange({ ...data, targetNetAmount: amt })}
                className={`rounded-full border px-3 py-1 text-xs transition-all ${
                  data.targetNetAmount === amt
                    ? 'border-primary bg-primary/10 text-primary font-medium'
                    : 'border-border text-muted-foreground hover:border-primary/40'
                }`}
              >
                {formatNZD(amt)}
              </button>
            ))}
          </div>
        </div>

        {/* Period */}
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <Label className="text-xs">Period Start</Label>
            <Input
              type="date"
              value={data.periodStart || defaultStart}
              onChange={(e) => onChange({ ...data, periodStart: e.target.value })}
            />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Period End</Label>
            <Input
              type="date"
              value={data.periodEnd || defaultEnd}
              onChange={(e) => onChange({ ...data, periodEnd: e.target.value })}
            />
          </div>
        </div>

        <div className="rounded-lg border border-border bg-muted/30 p-3">
          <p className="text-xs text-muted-foreground">
            💡 Your goal is used on the <span className="font-medium">Personal Finance</span> page to calculate how many deals you need and track your progress throughout the year.
          </p>
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
