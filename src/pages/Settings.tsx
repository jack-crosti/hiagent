import { useAuth } from '@/contexts/AuthContext';
import { PageHeader } from '@/components/PageHeader';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Shield, Key, Download, Monitor, Trash2 } from 'lucide-react';

export default function SettingsPage() {
  const { user, signOut } = useAuth();

  return (
    <>
      <PageHeader title="Settings" description="Account, privacy, and security" />

      <div className="max-w-2xl space-y-6">
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
