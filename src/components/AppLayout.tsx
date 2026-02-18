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

/**
 * Checks whether the user's required settings are complete.
 * Setup wizard triggers if ANY of these are missing.
 */
function isSetupIncomplete(profile: Record<string, unknown> | null, setupState: Record<string, unknown> | null): boolean {
  if (!profile) return true;

  // Splits not set (still at exact default or null)
  const splitsNotSet =
    profile.business_sale_user_share == null ||
    profile.lease_user_share == null ||
    profile.property_sale_user_share == null;

  // Withholding rate not set
  const whrNotSet = profile.withholding_rate == null;

  // Logo not set and user hasn't explicitly skipped
  const logoSkipped = setupState?.skipped === true;
  const logoNotSet = !profile.avatar_url && !logoSkipped;

  // Theme not set
  const themeNotSet = !profile.active_theme;

  return splitsNotSet || whrNotSet || logoNotSet || themeNotSet;
}

export function AppLayout({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();
  const isMobile = useIsMobile();
  const [setupComplete, setSetupComplete] = useState<boolean | null>(null);
  const [userType, setUserType] = useState<string | null | undefined>(undefined);

  useEffect(() => {
    if (!user) return;
    Promise.all([
      supabase.from('setup_state').select('is_complete, skipped').eq('owner_user_id', user.id).maybeSingle(),
      supabase.from('profiles').select('user_type, business_sale_user_share, lease_user_share, property_sale_user_share, withholding_rate, avatar_url, active_theme').eq('owner_user_id', user.id).maybeSingle(),
    ]).then(([setupRes, profileRes]) => {
      setUserType(profileRes.data?.user_type ?? null);

      // If setup is explicitly marked complete, honour that
      if (setupRes.data?.is_complete) {
        setSetupComplete(true);
        return;
      }

      // Otherwise check if required settings are actually filled
      const incomplete = isSetupIncomplete(
        profileRes.data as Record<string, unknown> | null,
        setupRes.data as Record<string, unknown> | null
      );
      setSetupComplete(!incomplete);
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
