import { createContext, useContext, useState, ReactNode } from 'react';

interface DemoContextType {
  isDemoMode: boolean;
  enterDemo: () => void;
  exitDemo: () => void;
  tourStep: number;
  setTourStep: (step: number) => void;
  showTour: boolean;
  setShowTour: (show: boolean) => void;
}

const DemoContext = createContext<DemoContextType | undefined>(undefined);

const TOUR_STEPS = [
  { title: 'Dashboard', description: 'Your financial overview — income, expenses, pipeline value, and GST at a glance.', path: '/' },
  { title: 'Transactions', description: 'Track income and expenses. Add, edit, categorise and attach receipts to each transaction.', path: '/transactions' },
  { title: 'Deals & Pipeline', description: 'Manage your listings and deals with automatic commission calculations.', path: '/personal-finance' },
  { title: 'GST Management', description: 'Track GST periods, mark filings, and monitor what you owe IRD.', path: '/gst' },
  { title: 'Tax Advisor', description: 'AI-powered NZ tax guidance — ask questions about deductions, GST, and compliance.', path: '/tax-advisor' },
  { title: 'Reports', description: 'Generate income statements, GST summaries, and commission reports.', path: '/reports' },
];

export { TOUR_STEPS };

export function DemoProvider({ children }: { children: ReactNode }) {
  const [isDemoMode, setIsDemoMode] = useState(false);
  const [tourStep, setTourStep] = useState(0);
  const [showTour, setShowTour] = useState(false);

  return (
    <DemoContext.Provider value={{
      isDemoMode,
      enterDemo: () => { setIsDemoMode(true); setShowTour(true); setTourStep(0); },
      exitDemo: () => { setIsDemoMode(false); setShowTour(false); setTourStep(0); },
      tourStep,
      setTourStep,
      showTour,
      setShowTour,
    }}>
      {children}
    </DemoContext.Provider>
  );
}

export function useDemo() {
  const context = useContext(DemoContext);
  if (!context) throw new Error('useDemo must be used within DemoProvider');
  return context;
}
