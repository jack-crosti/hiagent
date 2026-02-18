import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, ArrowRightLeft, User, FileText, MoreHorizontal
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useState } from 'react';
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import {
  BookOpen, Receipt, CreditCard, Brain, Zap, Megaphone,
  Palette, Settings
} from 'lucide-react';

const primaryTabs = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/transactions', label: 'Transactions', icon: ArrowRightLeft },
  { to: '/personal-finance', label: 'Finance', icon: User },
  { to: '/reports', label: 'Reports', icon: FileText },
];

const moreItems = [
  { to: '/ledger', label: 'Ledger', icon: BookOpen },
  { to: '/gst', label: 'GST', icon: Receipt },
  { to: '/ird-payments', label: 'IRD Payments', icon: CreditCard },
  { to: '/tax-advisor', label: 'Tax Advisor', icon: Brain },
  { to: '/automations', label: 'Automations', icon: Zap },
  { to: '/marketing', label: 'Marketing Planner', icon: Megaphone },
  { to: '/customization', label: 'Customization', icon: Palette },
  { to: '/settings', label: 'Settings', icon: Settings },
];

export function BottomNav() {
  const location = useLocation();
  const [open, setOpen] = useState(false);
  const isMoreActive = moreItems.some(i => location.pathname.startsWith(i.to));

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80 safe-area-bottom">
      <div className="flex items-center justify-around px-2 py-1">
        {primaryTabs.map(tab => {
          const isActive = tab.to === '/' ? location.pathname === '/' : location.pathname.startsWith(tab.to);
          return (
            <NavLink
              key={tab.to}
              to={tab.to}
              className={cn(
                'flex flex-col items-center gap-0.5 px-3 py-2 rounded-lg text-xs font-medium transition-colors',
                isActive ? 'text-primary' : 'text-muted-foreground'
              )}
            >
              <tab.icon size={20} />
              <span>{tab.label}</span>
            </NavLink>
          );
        })}

        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <button
              className={cn(
                'flex flex-col items-center gap-0.5 px-3 py-2 rounded-lg text-xs font-medium transition-colors',
                isMoreActive ? 'text-primary' : 'text-muted-foreground'
              )}
            >
              <MoreHorizontal size={20} />
              <span>More</span>
            </button>
          </SheetTrigger>
          <SheetContent side="bottom" className="rounded-t-2xl pb-safe">
            <SheetHeader>
              <SheetTitle>More</SheetTitle>
            </SheetHeader>
            <div className="grid grid-cols-4 gap-4 py-4">
              {moreItems.map(item => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  onClick={() => setOpen(false)}
                  className="flex flex-col items-center gap-1.5 rounded-xl p-3 text-center hover:bg-muted transition-colors"
                >
                  <item.icon size={22} className="text-primary" />
                  <span className="text-xs font-medium text-foreground">{item.label}</span>
                </NavLink>
              ))}
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </nav>
  );
}
