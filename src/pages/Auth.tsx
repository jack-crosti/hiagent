import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { Navigate } from 'react-router-dom';

export default function AuthPage() {
  const { user, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    );
  }
  
  if (user) return <Navigate to="/" replace />;
  
  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="w-full max-w-md animate-fade-in">
        <div className="mb-8 text-center">
          <h1 className="font-heading text-3xl font-bold tracking-tight text-foreground">
            Ledger<span className="text-primary">Pilot</span>
          </h1>
          <p className="mt-2 text-muted-foreground">
            Smart finance management for NZ brokers
          </p>
        </div>
        
        <Card className="shadow-elevated border-border/60">
          <Tabs defaultValue="signin">
            <TabsList className="grid w-full grid-cols-2 mx-auto">
              <TabsTrigger value="signin">Sign In</TabsTrigger>
              <TabsTrigger value="signup">Sign Up</TabsTrigger>
            </TabsList>
            
            <TabsContent value="signin">
              <SignInForm />
            </TabsContent>
            <TabsContent value="signup">
              <SignUpForm />
            </TabsContent>
          </Tabs>
        </Card>
      </div>
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
        <CardTitle>Welcome back</CardTitle>
        <CardDescription>Sign in to your LedgerPilot account</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="signin-email">Email</Label>
          <Input id="signin-email" type="email" required value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="signin-password">Password</Label>
          <Input id="signin-password" type="password" required value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" />
        </div>
        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? 'Signing in...' : 'Sign In'}
        </Button>
      </CardContent>
    </form>
  );
}

function SignUpForm() {
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
        <CardTitle>Create account</CardTitle>
        <CardDescription>Start managing your commissions and finances</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="signup-email">Email</Label>
          <Input id="signup-email" type="email" required value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="signup-password">Password</Label>
          <Input id="signup-password" type="password" required value={password} onChange={e => setPassword(e.target.value)} placeholder="Min 6 characters" />
        </div>
        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? 'Creating account...' : 'Create Account'}
        </Button>
      </CardContent>
    </form>
  );
}
