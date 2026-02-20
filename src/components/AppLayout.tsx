import { ReactNode, useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
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
import { Search, Bell } from 'lucide-react';

/**
 * Checks whether the user's required settings are complete.
 * Setup wizard triggers if ANY of these are missing.
 */
function isSetupIncomplete(profile: Record<string, unknown> | null, setupState: Record<string, unknown> | null): boolean {
  if (!profile) return true;

  const splitsNotSet =
    profile.business_sale_user_share == null ||
    profile.lease_user_share == null ||
    profile.property_sale_user_share == null;

  const whrNotSet = profile.withholding_rate == null;

  const logoSkipped = setupState?.skipped === true;
  const logoNotSet = !profile.avatar_url && !logoSkipped;

  return splitsNotSet || whrNotSet || logoNotSet;
}

export function AppLayout({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const isMobile = useIsMobile();
  const [setupComplete, setSetupComplete] = useState<boolean | null>(null);
  const [userType, setUserType] = useState<string | null | undefined>(undefined);
  const [userName, setUserName] = useState<string>('');

  useEffect(() => {
    if (!user) return;
    Promise.all([
      supabase.from('setup_state').select('is_complete, skipped').eq('owner_user_id', user.id).maybeSingle(),
      supabase.from('profiles').select('user_type, business_sale_user_share, lease_user_share, property_sale_user_share, withholding_rate, avatar_url, active_theme, first_name').eq('owner_user_id', user.id).maybeSingle(),
    ]).then(([setupRes, profileRes]) => {
      setUserType(profileRes.data?.user_type ?? null);
      setUserName(profileRes.data?.first_name || user.email?.split('@')[0] || '');

      if (setupRes.data?.is_complete) {
        setSetupComplete(true);
        return;
      }

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

  if (!userType) {
    return <UserTypeSelector onComplete={() => { setUserType('set'); }} />;
  }

  if (!setupComplete) {
    return <QuickSetup onComplete={() => { setSetupComplete(true); navigate('/', { replace: true }); }} />;
  }

  return (
    <div className="flex min-h-screen w-full bg-background">
      {!isMobile && <AppSidebar />}
      <main className="flex-1 flex flex-col min-h-screen">
        {/* Top header bar */}
        <div className="flex items-center justify-between px-6 py-4 shrink-0">
          <div />
          <div className="flex items-center gap-3">
            <button className="p-2.5 rounded-xl hover:bg-card hover:shadow-card transition-all duration-200">
              <Search size={18} className="text-muted-foreground" />
            </button>
            <button className="p-2.5 rounded-xl hover:bg-card hover:shadow-card transition-all duration-200 relative">
              <Bell size={18} className="text-muted-foreground" />
            </button>
            <div className="flex items-center gap-2 pl-2">
              <div className="h-8 w-8 rounded-xl bg-primary/10 flex items-center justify-center text-primary font-heading font-bold text-xs">
                {userName.charAt(0).toUpperCase() || 'U'}
              </div>
              {!isMobile && <span className="text-sm font-medium text-foreground">{userName}</span>}
            </div>
          </div>
        </div>
        <DemoBanner />
        <SetupBanner />
        <div key={location.pathname} className="flex-1 px-6 pb-20 md:pb-8 animate-page-enter">
          {children}
        </div>
      </main>
      {isMobile && <BottomNav />}
    </div>
  );
}
