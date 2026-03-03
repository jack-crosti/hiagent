import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { Navigate } from 'react-router-dom';
import { TubesBackground } from '@/components/ui/neon-flow';
import { Building2, Home, ArrowLeft, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

type Step = 'role' | 'auth';

export default function AuthPage() {
  const { user, loading } = useAuth();
  const [step, setStep] = useState<Step>('role');
  const [pendingUserType, setPendingUserType] = useState<string | null>(null);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    );
  }

  if (user) return <Navigate to="/" replace />;

  const handleRoleSelect = (type: string) => {
    setPendingUserType(type);
    localStorage.setItem('hiagent_pending_user_type', type);
    setStep('auth');
  };

  return (
    <TubesBackground className="min-h-screen">
      <div className="w-full max-w-lg p-4 animate-fade-in">
        {step === 'role' ? (
          <RoleStep onSelect={handleRoleSelect} selected={pendingUserType} />
        ) : (
          <AuthStep pendingUserType={pendingUserType} onBack={() => setStep('role')} />
        )}
      </div>
    </TubesBackground>
  );
}

function RoleStep({ onSelect, selected }: { onSelect: (type: string) => void; selected: string | null }) {
  const [localSelected, setLocalSelected] = useState<string | null>(selected);

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <div className="flex justify-center">
          <span className="font-heading font-bold text-[8rem] leading-none text-white">
            Hi<span className="aurora-text">Agent</span>
          </span>
        </div>
        <h1 className="font-heading text-2xl font-bold text-white pt-4">What best describes you?</h1>
        <p className="text-white/70 text-sm">We'll personalise your experience to match your workflow</p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <button
          onClick={() => setLocalSelected('business_broker')}
          className={cn(
            'rounded-xl border-2 p-6 text-center transition-all backdrop-blur-sm',
            localSelected === 'business_broker'
              ? 'border-violet-500 bg-white/25 ring-4 ring-violet-500/40 shadow-lg shadow-violet-500/20 scale-[1.03]'
              : 'border-white/20 bg-white/10 hover:border-white/40'
          )}
        >
          <Building2 size={32} className="mx-auto mb-3 text-white" />
          <p className="font-heading font-semibold text-white">Business Broker</p>
        </button>

        <button
          onClick={() => setLocalSelected('real_estate_agent')}
          className={cn(
            'rounded-xl border-2 p-6 text-center transition-all backdrop-blur-sm',
            localSelected === 'real_estate_agent'
              ? 'border-violet-500 bg-white/25 ring-4 ring-violet-500/40 shadow-lg shadow-violet-500/20 scale-[1.03]'
              : 'border-white/20 bg-white/10 hover:border-white/40'
          )}
        >
          <Home size={32} className="mx-auto mb-3 text-white" />
          <p className="font-heading font-semibold text-white">Real Estate Agent</p>
        </button>
      </div>

      <Button
        onClick={() => localSelected && onSelect(localSelected)}
        disabled={!localSelected}
        className="w-full bg-white text-foreground hover:bg-white/90 font-semibold"
      >
        Continue
      </Button>
    </div>
  );
}

function AuthStep({ pendingUserType, onBack }: { pendingUserType: string | null; onBack: () => void }) {
  return (
    <div className="space-y-4">
      <button
        onClick={onBack}
        className="flex items-center gap-1.5 text-white/70 hover:text-white transition-colors text-sm"
      >
        <ArrowLeft size={16} />
        Back
      </button>

      <div className="text-center mb-2">
        <h1 className="font-heading text-3xl font-bold tracking-tight text-white">
          Hi<span className="aurora-text">Agent</span>
        </h1>
        <p className="mt-1 text-white/70 text-sm">
          {pendingUserType === 'business_broker' ? 'Business Broker' : 'Real Estate Agent'} · Smart finance for NZ brokers
        </p>
      </div>

      <Card className="shadow-elevated border-white/20 bg-white/10 backdrop-blur-sm text-white">
        <Tabs defaultValue="signin">
          <TabsList className="grid w-full grid-cols-2 bg-white/10">
            <TabsTrigger value="signin" className="data-[state=active]:bg-white/20 text-white">Sign In</TabsTrigger>
            <TabsTrigger value="signup" className="data-[state=active]:bg-white/20 text-white">Sign Up</TabsTrigger>
          </TabsList>
          <TabsContent value="signin">
            <SignInForm />
          </TabsContent>
          <TabsContent value="signup">
            <SignUpForm pendingUserType={pendingUserType} />
          </TabsContent>
        </Tabs>
      </Card>
    </div>
  );
}

function SignInForm() {
  const { signIn } = useAuth();
  const { toast } = useToast();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await signIn(email, password);
    if (error) {
      toast({ title: 'Sign in failed', description: error.message, variant: 'destructive' });
    }
    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit}>
      <CardHeader>
        <CardTitle className="text-white">Welcome back</CardTitle>
        <CardDescription className="text-white/60">Sign in to your HiAgent account</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="signin-email" className="text-white/80">Email</Label>
          <Input id="signin-email" type="email" required value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" className="bg-white/10 border-white/20 text-white placeholder:text-white/40" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="signin-password" className="text-white/80">Password</Label>
          <Input id="signin-password" type="password" required value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" className="bg-white/10 border-white/20 text-white placeholder:text-white/40" />
        </div>
        <Button type="submit" className="w-full bg-white text-foreground hover:bg-white/90" disabled={loading}>
          {loading ? <><Loader2 size={16} className="mr-1.5 animate-spin" />Signing in...</> : 'Sign In'}
        </Button>
      </CardContent>
    </form>
  );
}

function SignUpForm({ pendingUserType }: { pendingUserType: string | null }) {
  const { signUp } = useAuth();
  const { toast } = useToast();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 6) {
      toast({ title: 'Password too short', description: 'Minimum 6 characters', variant: 'destructive' });
      return;
    }
    setLoading(true);
    // Ensure pending user type is in localStorage before signup
    if (pendingUserType) {
      localStorage.setItem('hiagent_pending_user_type', pendingUserType);
    }
    const { error } = await signUp(email, password);
    if (error) {
      toast({ title: 'Sign up failed', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Check your email', description: 'We sent you a verification link.' });
    }
    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit}>
      <CardHeader>
        <CardTitle className="text-white">Create account</CardTitle>
        <CardDescription className="text-white/60">Start managing your commissions and finances</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="signup-email" className="text-white/80">Email</Label>
          <Input id="signup-email" type="email" required value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" className="bg-white/10 border-white/20 text-white placeholder:text-white/40" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="signup-password" className="text-white/80">Password</Label>
          <Input id="signup-password" type="password" required value={password} onChange={e => setPassword(e.target.value)} placeholder="Min 6 characters" className="bg-white/10 border-white/20 text-white placeholder:text-white/40" />
        </div>
        <Button type="submit" className="w-full bg-white text-foreground hover:bg-white/90" disabled={loading}>
          {loading ? <><Loader2 size={16} className="mr-1.5 animate-spin" />Creating account...</> : 'Create Account'}
        </Button>
      </CardContent>
    </form>
  );
}
