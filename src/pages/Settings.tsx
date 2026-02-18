import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { PageHeader } from '@/components/PageHeader';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Shield, Key, Download, Monitor, Trash2, Save, Loader2, UserCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function SettingsPage() {
  const { user, signOut } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState({
    first_name: '',
    last_name: '',
    company_name: '',
    title: '',
    phone: '',
    ird_number: '',
    effective_tax_rate: '33',
    probability_threshold: '60',
  });

  useEffect(() => {
    if (!user) return;
    supabase.from('profiles').select('*').eq('owner_user_id', user.id).maybeSingle()
      .then(({ data }) => {
        if (data) {
          setProfile({
            first_name: data.first_name || '',
            last_name: data.last_name || '',
            company_name: data.company_name || '',
            title: data.title || '',
            phone: data.phone || '',
            ird_number: data.ird_number || '',
            effective_tax_rate: ((data.effective_tax_rate || 0.33) * 100).toString(),
            probability_threshold: ((data.probability_threshold || 0.60) * 100).toString(),
          });
        }
        setLoading(false);
      });
  }, [user]);

  async function handleSave() {
    if (!user) return;
    setSaving(true);
    await supabase.from('profiles').update({
      first_name: profile.first_name || null,
      last_name: profile.last_name || null,
      company_name: profile.company_name || null,
      title: profile.title || null,
      phone: profile.phone || null,
      ird_number: profile.ird_number || null,
      effective_tax_rate: (parseFloat(profile.effective_tax_rate) || 33) / 100,
      probability_threshold: (parseFloat(profile.probability_threshold) || 60) / 100,
    }).eq('owner_user_id', user.id);
    setSaving(false);
    toast({ title: 'Profile saved' });
  }

  if (loading) {
    return (
      <>
        <PageHeader title="Settings" />
        <div className="h-48 rounded-xl bg-muted animate-pulse" />
      </>
    );
  }

  return (
    <>
      <PageHeader title="Settings" description="Account, profile, and privacy" />

      <div className="max-w-2xl space-y-6">
        {/* Profile */}
        <Card className="shadow-card">
          <CardHeader>
            <div className="flex items-center gap-2">
              <UserCircle size={20} className="text-primary" />
              <CardTitle className="text-lg font-heading">Profile</CardTitle>
            </div>
            <CardDescription>Your personal and business details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>First Name</Label>
                <Input value={profile.first_name} onChange={e => setProfile(p => ({ ...p, first_name: e.target.value }))} />
              </div>
              <div className="space-y-2">
                <Label>Last Name</Label>
                <Input value={profile.last_name} onChange={e => setProfile(p => ({ ...p, last_name: e.target.value }))} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Company / Brokerage</Label>
                <Input value={profile.company_name} onChange={e => setProfile(p => ({ ...p, company_name: e.target.value }))} />
              </div>
              <div className="space-y-2">
                <Label>Title</Label>
                <Input placeholder="e.g. Business Broker" value={profile.title} onChange={e => setProfile(p => ({ ...p, title: e.target.value }))} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Phone</Label>
                <Input type="tel" placeholder="+64 21 123 4567" value={profile.phone} onChange={e => setProfile(p => ({ ...p, phone: e.target.value }))} />
              </div>
              <div className="space-y-2">
                <Label>IRD Number</Label>
                <Input placeholder="123-456-789" value={profile.ird_number} onChange={e => setProfile(p => ({ ...p, ird_number: e.target.value }))} />
              </div>
            </div>

            <Separator />

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Effective Tax Rate (%)</Label>
                <Input type="number" min="0" max="100" value={profile.effective_tax_rate} onChange={e => setProfile(p => ({ ...p, effective_tax_rate: e.target.value }))} />
                <p className="text-xs text-muted-foreground">Used for commission net calculations</p>
              </div>
              <div className="space-y-2">
                <Label>Probability Threshold (%)</Label>
                <Input type="number" min="0" max="100" value={profile.probability_threshold} onChange={e => setProfile(p => ({ ...p, probability_threshold: e.target.value }))} />
                <p className="text-xs text-muted-foreground">Deals below this are excluded from forecasts</p>
              </div>
            </div>

            <Button onClick={handleSave} disabled={saving}>
              {saving ? <Loader2 size={16} className="mr-1.5 animate-spin" /> : <Save size={16} className="mr-1.5" />}
              Save Profile
            </Button>
          </CardContent>
        </Card>

        {/* Account */}
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="text-lg font-heading">Account</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <p className="text-sm font-medium">Email</p>
              <p className="text-sm text-muted-foreground">{user?.email}</p>
            </div>
            <div>
              <p className="text-sm font-medium">Last sign in</p>
              <p className="text-sm text-muted-foreground">
                {user?.last_sign_in_at ? new Date(user.last_sign_in_at).toLocaleString('en-NZ') : 'Unknown'}
              </p>
            </div>
            <Button variant="outline" size="sm" onClick={signOut}>Sign Out</Button>
          </CardContent>
        </Card>

        {/* Privacy Center */}
        <Card className="shadow-card">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Shield size={20} className="text-primary" />
              <CardTitle className="text-lg font-heading">Privacy Center</CardTitle>
            </div>
            <CardDescription>
              Your data is private to your account. It is not shared with other users.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-lg bg-muted/50 p-4 space-y-2 text-sm text-muted-foreground">
              <p>✓ Your data is isolated to your logged-in account by default.</p>
              <p>✓ Data is not shared with other accounts unless you explicitly export or share.</p>
              <p>✓ The app creator cannot view your data through the product UI.</p>
              <p>✓ Any future support access must be opt-in, time-limited, logged, visible to you, and revocable.</p>
            </div>

            <Separator />

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Key size={16} className="text-muted-foreground" />
                  <span className="text-sm font-medium">Consents & Integrations</span>
                </div>
                <Button variant="outline" size="sm">Manage</Button>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Download size={16} className="text-muted-foreground" />
                  <span className="text-sm font-medium">Export History</span>
                </div>
                <Button variant="outline" size="sm">View</Button>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Monitor size={16} className="text-muted-foreground" />
                  <span className="text-sm font-medium">Active Sessions</span>
                </div>
                <Button variant="outline" size="sm">Manage</Button>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Trash2 size={16} className="text-destructive" />
                  <span className="text-sm font-medium text-destructive">Request Data Deletion</span>
                </div>
                <Button variant="outline" size="sm" className="text-destructive border-destructive/30 hover:bg-destructive/10">
                  Request
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
