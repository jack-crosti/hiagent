import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowRight, User } from 'lucide-react';

interface PersonalData {
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  companyName: string;
  title: string;
}

interface Props {
  data: PersonalData;
  onChange: (data: PersonalData) => void;
  onNext: () => void;
  onBack: () => void;
}

export function SetupPersonalStep({ data, onChange, onNext, onBack }: Props) {
  return (
    <Card className="shadow-card animate-slide-up">
      <CardHeader>
        <CardTitle className="text-lg font-heading flex items-center gap-2">
          <User size={20} className="text-primary" />
          Personal Details
        </CardTitle>
        <CardDescription>
          Tell us about yourself. Company name and title are optional.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label htmlFor="firstName" className="text-xs">First Name</Label>
            <Input
              id="firstName"
              placeholder="Jane"
              value={data.firstName}
              onChange={(e) => onChange({ ...data, firstName: e.target.value })}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="lastName" className="text-xs">Last Name</Label>
            <Input
              id="lastName"
              placeholder="Smith"
              value={data.lastName}
              onChange={(e) => onChange({ ...data, lastName: e.target.value })}
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="email" className="text-xs">Email</Label>
          <Input
            id="email"
            type="email"
            placeholder="jane@example.co.nz"
            value={data.email}
            onChange={(e) => onChange({ ...data, email: e.target.value })}
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="phone" className="text-xs">Phone</Label>
          <Input
            id="phone"
            type="tel"
            placeholder="+64 21 123 4567"
            value={data.phone}
            onChange={(e) => onChange({ ...data, phone: e.target.value })}
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label htmlFor="companyName" className="text-xs">Company Name <span className="text-muted-foreground">(optional)</span></Label>
            <Input
              id="companyName"
              placeholder="ABC Business Sales"
              value={data.companyName}
              onChange={(e) => onChange({ ...data, companyName: e.target.value })}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="title" className="text-xs">Title <span className="text-muted-foreground">(optional)</span></Label>
            <Input
              id="title"
              placeholder="Senior Broker"
              value={data.title}
              onChange={(e) => onChange({ ...data, title: e.target.value })}
            />
          </div>
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
