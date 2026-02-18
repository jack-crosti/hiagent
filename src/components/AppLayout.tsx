import { ReactNode, useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { AppSidebar } from '@/components/AppSidebar';
import { BottomNav } from '@/components/BottomNav';
import { SetupBanner } from '@/components/SetupBanner';
import { QuickSetup } from '@/components/QuickSetup';
import { UserTypeSelector } from '@/components/UserTypeSelector';
import { DemoBanner } from '@/components/DemoBanner';
import { useIsMobile } from '@/hooks/use-mobile';

export function AppLayout({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();
  const isMobile = useIsMobile();
  const [setupComplete, setSetupComplete] = useState<boolean | null>(null);
  const [userType, setUserType] = useState<string | null | undefined>(undefined);

  useEffect(() => {
    if (!user) return;
    Promise.all([
      supabase.from('setup_state').select('is_complete, skipped').eq('owner_user_id', user.id).maybeSingle(),
      supabase.from('profiles').select('user_type').eq('owner_user_id', user.id).maybeSingle(),
    ]).then(([setupRes, profileRes]) => {
      setSetupComplete(setupRes.data?.is_complete || setupRes.data?.skipped || false);
      setUserType(profileRes.data?.user_type ?? null);
    });
  }, [user]);

  if (loading || (user && (setupComplete === null || userType === undefined))) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          <span className="text-sm text-muted-foreground">Loading HiAgent...</span>
        </div>
      </div>
    );
  }

  if (!user) return <Navigate to="/auth" replace />;

  // Show user type selector first if not set
  if (!userType) {
    return <UserTypeSelector onComplete={() => setUserType('set')} />;
  }

  if (!setupComplete) {
    return <QuickSetup onComplete={() => setSetupComplete(true)} />;
  }

  return (
    <div className="flex min-h-screen w-full bg-background">
      {!isMobile && <AppSidebar />}
      <main className="flex-1 flex flex-col min-h-screen">
        <DemoBanner />
        <SetupBanner />
        <div className="flex-1 p-4 md:p-6 lg:p-8 pb-20 md:pb-8 animate-fade-in">
          {children}
        </div>
      </main>
      {isMobile && <BottomNav />}
    </div>
  );
}
