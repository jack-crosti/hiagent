import { NavLink as RouterNavLink, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { useDemo } from '@/contexts/DemoContext';
import { supabase } from '@/integrations/supabase/client';
import {
  LayoutDashboard, ArrowRightLeft, BookOpen, Receipt,
  CreditCard, Brain, Zap, User, Megaphone, FileText,
  Palette, Settings, LogOut, ChevronLeft, ChevronRight, Eye, Moon } from
'lucide-react';
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
{ to: '/settings', label: 'Settings', icon: Settings }];


export function AppSidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const { user, signOut } = useAuth();
  const { isDark, toggleDarkMode } = useTheme();
  const { isDemoMode, enterDemo, exitDemo } = useDemo();
  const location = useLocation();
  const [firstName, setFirstName] = useState<string>('');

  useEffect(() => {
    if (!user) return;
    supabase.from('profiles').select('first_name').eq('owner_user_id', user.id).maybeSingle().
    then(({ data }) => setFirstName(data?.first_name || user.email?.split('@')[0] || ''));
  }, [user]);

  return (
    <aside
      className={cn(
        'flex flex-col border-r border-sidebar-border/20 bg-sidebar transition-[width] duration-300 ease-in-out sticky top-0 h-screen',
        collapsed ? 'w-16' : 'w-64'
      )}>

      {/* Brand */}
      <div className="px-5 py-6">
        <span className="font-heading font-bold text-3xl text-sidebar-foreground">
          Hi<span className="text-primary">Agent</span>
        </span>
        {!collapsed && firstName && (
          <p className="text-sm text-muted-foreground mt-1">Hi, {firstName}</p>
        )}
      </div>

      <Separator className="mb-3 opacity-50" />

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 py-1 space-y-1">
        {navItems.map((item) => {
          const isActive = item.to === '/' ?
          location.pathname === '/' :
          location.pathname.startsWith(item.to);
          return (
            <RouterNavLink
              key={item.to}
              to={item.to}
              className={cn(
                'flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-medium transition-all duration-200',
                isActive ?
                'bg-primary text-primary-foreground shadow-md' :
                'text-muted-foreground hover:bg-muted hover:text-foreground'
              )}>

              <item.icon className="shrink-0" size={18} />
              {!collapsed && <span className="truncate">{item.label}</span>}
            </RouterNavLink>);

        })}
      </nav>

      <Separator className="mt-2 opacity-50" />

      {/* Dark mode toggle */}
      {!collapsed &&
      <div className="px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Moon size={14} className="text-muted-foreground" />
              <span className="text-xs font-medium text-muted-foreground">Dark mode</span>
            </div>
            <Switch checked={isDark} onCheckedChange={toggleDarkMode} className="scale-90" />
          </div>
        </div>
      }

      {/* Footer */}
      <div className="p-3 space-y-1">
        <button
          onClick={isDemoMode ? exitDemo : enterDemo}
          className={cn(
            'flex w-full items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-medium transition-all duration-200',
            isDemoMode ?
            'bg-accent/10 text-accent' :
            'text-muted-foreground hover:bg-muted hover:text-foreground'
          )}>

          <Eye size={16} className="shrink-0" />
          {!collapsed && <span>{isDemoMode ? 'Exit Demo' : 'Try Demo'}</span>}
        </button>

        <button
          onClick={signOut}
          className="flex w-full items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-destructive transition-all duration-200">

          <LogOut size={18} className="shrink-0" />
          {!collapsed && <span>Sign Out</span>}
        </button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setCollapsed(!collapsed)}
          className="w-full justify-center text-muted-foreground">

          {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </Button>
      </div>
    </aside>);

}
