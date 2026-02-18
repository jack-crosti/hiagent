import { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { AppSidebar } from '@/components/AppSidebar';
import { BottomNav } from '@/components/BottomNav';
import { SetupBanner } from '@/components/SetupBanner';
import { useIsMobile } from '@/hooks/use-mobile';

export function AppLayout({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();
  const isMobile = useIsMobile();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          <span className="text-sm text-muted-foreground">Loading LedgerPilot...</span>
        </div>
      </div>
    );
  }

  if (!user) return <Navigate to="/auth" replace />;

  return (
    <div className="flex min-h-screen w-full bg-background">
      {!isMobile && <AppSidebar />}
      <main className="flex-1 flex flex-col min-h-screen">
        <SetupBanner />
        <div className="flex-1 p-4 md:p-6 lg:p-8 pb-20 md:pb-8 animate-fade-in">
          {children}
        </div>
      </main>
      {isMobile && <BottomNav />}
    </div>
  );
}
