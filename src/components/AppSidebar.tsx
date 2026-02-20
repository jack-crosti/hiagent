import { NavLink as RouterNavLink, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { useDemo } from '@/contexts/DemoContext';
import { supabase } from '@/integrations/supabase/client';
import {
  LayoutDashboard, ArrowRightLeft, BookOpen, Receipt,
  CreditCard, Brain, Zap, User, Megaphone, FileText,
  Palette, Settings, LogOut, ChevronLeft, ChevronRight, Eye, Moon
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';


const navItems = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/transactions', label: 'Transactions', icon: ArrowRightLeft },
  { to: '/ledger', label: 'Ledger', icon: BookOpen },
  { to: '/gst', label: 'GST', icon: Receipt },
  { to: '/ird-payments', label: 'IRD Payments', icon: CreditCard },
  { to: '/tax-advisor', label: 'Tax Advisor', icon: Brain },
  { to: '/automations', label: 'Automations', icon: Zap },
  { to: '/personal-finance', label: 'Personal Finance', icon: User },
  { to: '/marketing', label: 'Marketing Planner', icon: Megaphone },
  { to: '/reports', label: 'Reports', icon: FileText },
  { to: '/customization', label: 'Customization', icon: Palette },
  { to: '/settings', label: 'Settings', icon: Settings },
];

export function AppSidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const { user, signOut } = useAuth();
  const { isDark, toggleDarkMode } = useTheme();
  const { isDemoMode, enterDemo, exitDemo } = useDemo();
  const location = useLocation();
  const [logoUrl, setLogoUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    supabase.from('profiles').select('avatar_url').eq('owner_user_id', user.id).maybeSingle()
      .then(({ data }) => setLogoUrl(data?.avatar_url || null));
  }, [user]);

  return (
    <aside
      className={cn(
        'flex flex-col border-r border-sidebar-border bg-sidebar transition-[width] duration-300 ease-in-out sticky top-0 h-screen',
        collapsed ? 'w-16' : 'w-60'
      )}
    >
      {/* Logo */}
      <div className="flex items-center gap-2 px-4 py-5">
        {logoUrl ? (
          <img src={logoUrl} alt="Logo" className="h-8 w-8 rounded-lg object-contain shrink-0" />
        ) : (
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground font-heading font-bold text-sm shrink-0">
            Hi
          </div>
        )}
        {!collapsed && (
          <span className="font-heading font-bold text-lg text-sidebar-foreground truncate">
            Hi<span className="text-primary">Agent</span>
          </span>
        )}
      </div>

      <Separator className="mb-2" />

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-2 py-1 space-y-0.5">
        {navItems.map(item => {
          const isActive = item.to === '/' 
            ? location.pathname === '/' 
            : location.pathname.startsWith(item.to);
          return (
            <RouterNavLink
              key={item.to}
              to={item.to}
              className={cn(
                'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200',
                isActive
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'text-sidebar-foreground/70 hover:bg-sidebar-accent/70 hover:text-sidebar-foreground'
              )}
            >
              <item.icon className="h-4.5 w-4.5 shrink-0" size={18} />
              {!collapsed && <span className="truncate">{item.label}</span>}
            </RouterNavLink>
          );
        })}
      </nav>

      <Separator className="mt-2" />

      {/* Dark mode toggle */}
      {!collapsed && (
        <div className="px-3 py-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Moon size={14} className="text-sidebar-foreground/50" />
              <span className="text-xs font-medium text-sidebar-foreground/50">Dark mode</span>
            </div>
            <Switch checked={isDark} onCheckedChange={toggleDarkMode} className="scale-90" />
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="p-2 space-y-1">
        <button
          onClick={isDemoMode ? exitDemo : enterDemo}
          className={cn(
            'flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
            isDemoMode
              ? 'bg-accent/10 text-accent'
              : 'text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground'
          )}
        >
          <Eye size={16} className="shrink-0" />
          {!collapsed && <span>{isDemoMode ? 'Exit Demo' : 'Try Demo'}</span>}
        </button>

        <button
          onClick={signOut}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-destructive transition-colors"
        >
          <LogOut size={18} className="shrink-0" />
          {!collapsed && <span>Sign Out</span>}
        </button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setCollapsed(!collapsed)}
          className="w-full justify-center text-muted-foreground"
        >
          {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </Button>
      </div>
    </aside>
  );
}
