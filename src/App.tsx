import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { DemoProvider } from "@/contexts/DemoContext";
import { AppLayout } from "@/components/AppLayout";
import AuthPage from "@/pages/Auth";
import Dashboard from "@/pages/Dashboard";
import TransactionsPage from "@/pages/Transactions";
import LedgerPage from "@/pages/Ledger";
import GSTPage from "@/pages/GST";
import IRDPaymentsPage from "@/pages/IRDPayments";
import TaxAdvisorPage from "@/pages/TaxAdvisor";
import AutomationsPage from "@/pages/Automations";
import PersonalFinancePage from "@/pages/PersonalFinance";
import MarketingPage from "@/pages/Marketing";
import ReportsPage from "@/pages/Reports";
import CustomizationPage from "@/pages/Customization";
import SettingsPage from "@/pages/Settings";
import GuidePage from "@/pages/Guide";
import NotFound from "@/pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <ThemeProvider>
            <DemoProvider>
              <Routes>
                <Route path="/auth" element={<AuthPage />} />
                <Route path="/" element={<AppLayout><Dashboard /></AppLayout>} />
                <Route path="/transactions" element={<AppLayout><TransactionsPage /></AppLayout>} />
                <Route path="/ledger" element={<AppLayout><LedgerPage /></AppLayout>} />
                <Route path="/gst" element={<AppLayout><GSTPage /></AppLayout>} />
                <Route path="/ird-payments" element={<AppLayout><IRDPaymentsPage /></AppLayout>} />
                <Route path="/tax-advisor" element={<AppLayout><TaxAdvisorPage /></AppLayout>} />
                <Route path="/automations" element={<AppLayout><AutomationsPage /></AppLayout>} />
                <Route path="/personal-finance" element={<AppLayout><PersonalFinancePage /></AppLayout>} />
                <Route path="/marketing" element={<AppLayout><MarketingPage /></AppLayout>} />
                <Route path="/reports" element={<AppLayout><ReportsPage /></AppLayout>} />
                <Route path="/customization" element={<AppLayout><CustomizationPage /></AppLayout>} />
                <Route path="/settings" element={<AppLayout><SettingsPage /></AppLayout>} />
                <Route path="/guide" element={<AppLayout><GuidePage /></AppLayout>} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </DemoProvider>
          </ThemeProvider>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
