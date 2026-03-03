import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowRight, DollarSign } from 'lucide-react';
import { CommissionSettingsEditor } from '@/components/commission/CommissionSettingsEditor';
import { GlobalCommissionSettings } from '@/services/commissionService';

interface Props {
  data: GlobalCommissionSettings;
  onChange: (data: GlobalCommissionSettings) => void;
  onNext: () => void;
}

export function SetupCommissionStep({ data, onChange, onNext }: Props) {
  return (
    <Card className="shadow-card animate-slide-up">
      <CardHeader>
        <CardTitle className="text-lg font-heading flex items-center gap-2">
          <DollarSign size={20} className="text-primary" />
          Commission Settings
        </CardTitle>
        <CardDescription>
          Configure your tiered commission structure, splits, and withholding rate.
          These settings power every commission calculation in the app.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <CommissionSettingsEditor value={data} onChange={onChange} showPreview={true} />

        <Button onClick={onNext} className="w-full">
          Continue
          <ArrowRight size={16} className="ml-1.5" />
        </Button>
      </CardContent>
    </Card>
  );
}
