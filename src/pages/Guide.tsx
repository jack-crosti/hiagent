import { useState } from "react";
import {
  LayoutDashboard, ArrowRightLeft, BookOpen, Receipt,
  CreditCard, Brain, Zap, User, Megaphone, FileText,
  Palette, Settings, Play, ExternalLink, ChevronRight,
  Lightbulb, GraduationCap
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { AspectRatio } from "@/components/ui/aspect-ratio";

interface GuideSection {
  id: string;
  title: string;
  description: string;
  icon: React.ElementType;
  route: string;
  category: string;
  videoUrl?: string;
  steps: string[];
  tips: string[];
}

const guideSections: GuideSection[] = [
  {
    id: "dashboard",
    title: "Dashboard",
    description: "Your command centre \u2014 see income, expenses, GST, pipeline value, and quick actions at a glance.",
    icon: LayoutDashboard,
    route: "/",
    category: "Overview",
    steps: [
      "Open the Dashboard from the sidebar or bottom nav \u2014 it is the default landing page after login.",
      "Review the four stat cards at the top: Total Income, Total Expenses, Net GST Due, and Pipeline Value. Each shows the current period totals.",
      "If you are new, click \"Try Demo\" in the sidebar footer to load sample data \u2014 property sale commissions, marketing expenses, and a pipeline of listings.",
      "Scroll down to the Income vs Expense chart. It shows monthly bars comparing what came in versus what went out.",
      "Below that, the Pipeline by Deal donut chart breaks down your active listings by name and value (e.g. \"Parnell Townhouse $45k\").",
      "Use the Quick Actions row \u2014 \"Add Transaction\", \"Add Listing\", and \"Check GST\" \u2014 to jump directly to common tasks.",
      "The Demo banner at the top (when active) reminds you that you are viewing sample data. Click \"Exit Demo\" to return to your real data.",
    ],
    tips: [
      "Pipeline Value only includes deals with status \"Active\" or \"Pending\" \u2014 closed deals move to income.",
      "The dashboard auto-refreshes when you add or edit transactions and deals elsewhere in the app.",
    ],
  },
  {
    id: "transactions",
    title: "Transactions",
    description: "Record every dollar in and out \u2014 income, expenses, commissions, and GST-inclusive amounts.",
    icon: ArrowRightLeft,
    route: "/transactions",
    category: "Finance",
    steps: [
      "Navigate to Transactions from the sidebar. You will see a searchable, filterable table of all your entries.",
      "Click \"+ Add Transaction\" to open the form. Choose the type: Income or Expense.",
      "Fill in the date, amount, description, and optionally assign a category (e.g. \"Commission Income\", \"Marketing\", \"Office Supplies\").",
      "If the transaction is GST-inclusive, the GST amount is auto-calculated at 15% and shown separately.",
      "Use the search bar to find transactions by description or reference number.",
      "Filter by type (Income / Expense) or date range to narrow results.",
      "Click any row to edit \u2014 update the amount, recategorise, or delete the entry.",
      "Demo transactions are tagged with a \"Demo\" badge and are removed when you exit demo mode.",
    ],
    tips: [
      "Assign categories consistently \u2014 the automation rules on the Automations page can do this for you automatically.",
      "GST amounts flow through to the GST page, so accurate entries here save work at filing time.",
    ],
  },
  {
    id: "ledger",
    title: "Ledger",
    description: "Double-entry bookkeeping with a NZ-standard chart of accounts \u2014 debits and credits balanced automatically.",
    icon: BookOpen,
    route: "/ledger",
    category: "Finance",
    steps: [
      "Open the Ledger page from the sidebar. If this is your first visit, you will see the empty state with an option to load demo accounts.",
      "Click \"Load Demo Data\" to seed a standard NZ chart of accounts \u2014 Assets, Liabilities, Equity, Revenue, and Expenses.",
      "Each account shows its code (e.g. 1000 for Bank Account), name, type, and current balance.",
      "Click an account to see its journal entries: each entry has a date, description, debit column, and credit column.",
      "Add a manual journal entry by clicking \"+ Add Entry\", selecting the debit and credit accounts, and entering the amount.",
      "Entries linked to transactions show a reference link back to the original transaction.",
    ],
    tips: [
      "Every transaction you add automatically creates matching ledger entries \u2014 you rarely need manual journals.",
      "System accounts (marked with a lock icon) cannot be deleted or renamed.",
    ],
  },
  {
    id: "gst",
    title: "GST",
    description: "Track GST collected and paid across filing periods, see net GST due, and manage filing status.",
    icon: Receipt,
    route: "/gst",
    category: "Tax",
    steps: [
      "Navigate to the GST page. You will see a table of GST periods (e.g. \"1 Dec 2025 \u2013 31 Mar 2026\").",
      "Each period shows GST Collected (from income), GST Paid (from expenses), and Net GST Due.",
      "Click a period row to see the breakdown of transactions contributing to that period.",
      "Update the Filing Status dropdown \u2014 Not Filed, Filed, or Paid \u2014 to track your IRD submissions.",
      "The due date column shows when each period GST return is due to IRD.",
      "Use \"Load Demo Data\" if you want to see sample periods with realistic NZ commission data.",
    ],
    tips: [
      "GST periods are created automatically based on your transactions \u2014 you do not need to set them up manually.",
      "Net GST Due = GST Collected minus GST Paid. A positive number means you owe IRD.",
    ],
  },
  {
    id: "ird-payments",
    title: "IRD Payments",
    description: "Schedule and track provisional tax, GST, and income tax payments to Inland Revenue.",
    icon: CreditCard,
    route: "/ird-payments",
    category: "Tax",
    steps: [
      "Open IRD Payments from the sidebar. This page lists all scheduled and completed payments to IRD.",
      "Click \"+ Add Payment\" to schedule a new payment \u2014 select the type (Provisional Tax, GST, Income Tax).",
      "Enter the amount, payment date, and optionally your IRD number and bank account reference.",
      "Pending payments show with a yellow status badge. Once paid, click \"Mark as Paid\" to update.",
      "The history section shows all completed payments with dates and confirmation references.",
    ],
    tips: [
      "Link payments to specific GST periods to keep your records aligned with IRD filing dates.",
      "Set up reminders by noting due dates \u2014 the app shows upcoming payments sorted by date.",
    ],
  },
  {
    id: "tax-advisor",
    title: "Tax Advisor",
    description: "AI-powered NZ tax Q&A \u2014 ask about deductions, GST rules, provisional tax, and compliance.",
    icon: Brain,
    route: "/tax-advisor",
    category: "AI Tools",
    steps: [
      "Navigate to Tax Advisor. You will see a chat interface with suggested prompts on the right.",
      "Type a question in the message box, e.g. \"Can I claim my home office as a deduction?\"",
      "The AI responds with NZ-specific tax guidance, citing relevant IRD rules where applicable.",
      "Try the suggested prompts: \"What expenses can I claim?\", \"How does provisional tax work?\", \"GST on commission income\".",
      "Conversations are not saved between sessions \u2014 copy any important advice before navigating away.",
      "The AI provides general guidance only \u2014 always confirm with your accountant for specific situations.",
    ],
    tips: [
      "Be specific in your questions \u2014 \"Can I deduct fuel for property viewings?\" gets better answers than \"What can I deduct?\"",
      "The advisor understands NZ tax terminology: PAYE, RWT, PIE, FIF, and more.",
    ],
  },
  {
    id: "automations",
    title: "Automations",
    description: "Set up rules to auto-categorise transactions, schedule recurring entries, and automate tax tasks.",
    icon: Zap,
    route: "/automations",
    category: "Productivity",
    steps: [
      "Open the Automations page. You will see four automation cards: Tax Calculations, GST Filing, Invoice Generation, and Receipt Scanning.",
      "Each card shows its current status (Active / Inactive) and a brief description of what it automates.",
      "Click \"Configure\" on any card to set up or modify the automation rules.",
      "For auto-categorisation: define match rules like \"Description contains Barfoot\" \u2192 Category: Commission Income.",
      "Set priority numbers to control which rules apply first when multiple rules could match.",
      "Toggle automations on/off with the switch \u2014 disabled rules are kept but not applied.",
    ],
    tips: [
      "Start with 3\u20135 broad rules (e.g. bank names, common vendors) then add specific ones as patterns emerge.",
      "Test rules by adding a transaction and checking if the correct category is auto-assigned.",
    ],
  },
  {
    id: "personal-finance",
    title: "Personal Finance",
    description: "Manage your deal pipeline, run commission scenarios, set income goals, and track progress.",
    icon: User,
    route: "/personal-finance",
    category: "Planning",
    steps: [
      "Navigate to Personal Finance. The page has three main sections: Deals Pipeline, Scenarios, and Goals.",
      "In the Deals Pipeline, click \"+ Add Listing\" to create a new deal \u2014 enter the listing name, deal type (Property Sale, Lease, Business Sale), sale price, and probability.",
      "The app auto-calculates your commission share based on your split settings (configured in Settings).",
      "View three scenario columns: Conservative (low probability deals excluded), Realistic (weighted by probability), and Aggressive (all deals at face value).",
      "Each scenario shows: Gross Commission, Company Fee, Your Share, Estimated Tax, and Net Take-Home.",
      "Set an income goal by clicking \"Set Goal\" \u2014 enter your target net income and the period.",
      "The progress bar shows how close your pipeline gets you to the goal under each scenario.",
    ],
    tips: [
      "Update deal probabilities regularly \u2014 moving a deal from 50% to 90% significantly changes your realistic forecast.",
      "The withholding rate used for tax estimates comes from your Settings page \u2014 keep it current.",
    ],
  },
  {
    id: "marketing",
    title: "Marketing Planner",
    description: "Plan campaigns, generate AI social media posts, and schedule content across platforms.",
    icon: Megaphone,
    route: "/marketing",
    category: "AI Tools",
    steps: [
      "Open Marketing Planner from the sidebar. The main feature is the AI Post Generator.",
      "Select your platform: Instagram, Facebook, LinkedIn, or Twitter/X.",
      "Choose a style: Professional, Casual, or Storytelling.",
      "Pick a goal type: Brand Awareness, Lead Generation, or Engagement.",
      "Enter a topic or let the AI suggest one based on your deal pipeline.",
      "Click \"Generate\" \u2014 the AI creates a platform-optimised post with hashtags and a call-to-action.",
      "Copy the generated post to your clipboard, or edit it before using.",
      "The content calendar section lets you schedule posts across the week.",
    ],
    tips: [
      "LinkedIn posts work best with \"Professional\" style; Instagram thrives with \"Storytelling\".",
      "Generate multiple versions and pick the best \u2014 the AI produces different results each time.",
    ],
  },
  {
    id: "reports",
    title: "Reports",
    description: "Generate GST summaries, profit & loss statements, commission reports, and goal progress exports.",
    icon: FileText,
    route: "/reports",
    category: "Finance",
    steps: [
      "Navigate to the Reports page. You will see five report cards: GST Summary, Profit & Loss, Commission Report, Goal Progress, and Action Plan.",
      "Click any report card to generate it for the current period.",
      "The GST Summary pulls data from your GST page \u2014 showing collected, paid, and net amounts.",
      "Profit & Loss shows total income minus total expenses for the selected date range.",
      "The Commission Report breaks down each deal\u2019s gross commission, company share, your share, and tax.",
      "Goal Progress shows your targets vs actual pipeline performance.",
      "Export reports as needed for your accountant or records.",
    ],
    tips: [
      "Run the Commission Report monthly to track your earnings trend.",
      "The P&L report is useful for your annual tax return preparation.",
    ],
  },
  {
    id: "customization",
    title: "Customization",
    description: "Personalise your dashboard layout, choose themes, set brand colours, and configure widgets.",
    icon: Palette,
    route: "/customization",
    category: "Settings",
    steps: [
      "Open Customization from the sidebar. You will see sections for Theme, Brand Identity, and UI preferences.",
      "Choose a theme family from the dropdown in the sidebar footer \u2014 options include Default, Ocean, Forest, Sunset, and more.",
      "Toggle Dark Mode on/off using the switch in the sidebar.",
      "In Brand Identity, enter your primary and accent colours as hex values to match your real estate brand.",
      "Upload your company logo \u2014 it appears in the sidebar header and on exported reports.",
      "Choose heading and body fonts to match your brand guidelines.",
      "Toggle \"Apply brand to UI\" to override the default theme with your brand colours.",
    ],
    tips: [
      "Your brand colours only apply when \"Apply brand to UI\" is enabled \u2014 disable it to return to the selected theme.",
      "Logo uploads accept PNG, JPG, and SVG formats. Square logos work best.",
    ],
  },
  {
    id: "settings",
    title: "Settings",
    description: "Configure commission splits, tax rates, profile details, privacy options, and account management.",
    icon: Settings,
    route: "/settings",
    category: "Settings",
    steps: [
      "Navigate to Settings from the sidebar. The page has several sections: Profile, Commission Splits, Tax, Privacy, and Account.",
      "In Profile, update your name, email, phone, company name, and title.",
      "Commission Splits: set your share percentage for each deal type \u2014 Property Sale, Lease, and Business Sale. The company share auto-calculates.",
      "Enter your withholding tax rate (e.g. 33%) \u2014 this is used for tax estimates across the app.",
      "Add your IRD number for payment references.",
      "In Privacy, manage data consent and notification preferences.",
      "Account section allows you to reset all data or delete your account entirely.",
    ],
    tips: [
      "Commission splits are the foundation of all your financial calculations \u2014 set these up first during onboarding.",
      "If your company changes split structures, update here and all future calculations adjust automatically.",
    ],
  },
];

const categoryColors: Record<string, string> = {
  "Overview": "bg-primary/10 text-primary",
  "Finance": "bg-chart-2/10 text-chart-2",
  "Tax": "bg-chart-4/10 text-chart-4",
  "AI Tools": "bg-accent/10 text-accent",
  "Productivity": "bg-chart-3/10 text-chart-3",
  "Planning": "bg-chart-5/10 text-chart-5",
  "Settings": "bg-muted-foreground/10 text-muted-foreground",
};

export default function GuidePage() {
  const [selectedGuide, setSelectedGuide] = useState<GuideSection | null>(null);
  const navigate = useNavigate();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Guide"
        description="Step-by-step tutorials for every feature \u2014 learn how to get the most out of HiAgent."
      />

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {guideSections.map((section) => (
          <Card
            key={section.id}
            className="group cursor-pointer hover:shadow-elevated transition-all duration-300"
            onClick={() => setSelectedGuide(section)}
          >
            <CardContent className="p-0">
              <div className="relative overflow-hidden rounded-t-2xl bg-gradient-to-br from-primary/5 to-accent/5">
                <AspectRatio ratio={16 / 9}>
                  <div className="flex flex-col items-center justify-center h-full gap-3">
                    <div className="rounded-2xl bg-primary/10 p-4">
                      <section.icon size={32} className="text-primary" />
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Play size={14} className="text-primary" />
                      <span>Video Coming Soon</span>
                    </div>
                  </div>
                </AspectRatio>
              </div>

              <div className="p-4 space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-semibold text-base text-foreground">{section.title}</h3>
                  <Badge variant="secondary" className={`text-[10px] shrink-0 ${categoryColors[section.category] || ""}`}>
                    {section.category}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground line-clamp-2">{section.description}</p>
                <div className="flex items-center gap-1 text-xs text-primary font-medium group-hover:gap-2 transition-all">
                  <span>View Guide</span>
                  <ChevronRight size={14} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={!!selectedGuide} onOpenChange={() => setSelectedGuide(null)}>
        <DialogContent className="max-w-2xl max-h-[85vh] p-0 gap-0">
          {selectedGuide && (
            <>
              <div className="relative overflow-hidden rounded-t-2xl bg-gradient-to-br from-primary/5 via-accent/5 to-primary/5">
                <AspectRatio ratio={16 / 9}>
                  {selectedGuide.videoUrl ? (
                    <iframe
                      src={selectedGuide.videoUrl}
                      className="w-full h-full"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  ) : (
                    <div className="flex flex-col items-center justify-center h-full gap-3">
                      <div className="rounded-2xl bg-primary/10 p-5">
                        <selectedGuide.icon size={40} className="text-primary" />
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Play size={16} className="text-primary" />
                        <span>Video walkthrough coming soon</span>
                      </div>
                    </div>
                  )}
                </AspectRatio>
              </div>

              <ScrollArea className="max-h-[calc(85vh-16rem)]">
                <div className="p-6 space-y-5">
                  <DialogHeader>
                    <div className="flex items-center gap-3">
                      <div className="rounded-xl bg-primary/10 p-2">
                        <selectedGuide.icon size={20} className="text-primary" />
                      </div>
                      <div>
                        <DialogTitle className="text-xl">{selectedGuide.title}</DialogTitle>
                        <DialogDescription>{selectedGuide.description}</DialogDescription>
                      </div>
                    </div>
                  </DialogHeader>

                  <Separator />

                  <div className="space-y-3">
                    <h4 className="font-semibold text-sm text-foreground flex items-center gap-2">
                      <GraduationCap size={16} className="text-primary" />
                      Step-by-Step Guide
                    </h4>
                    <ol className="space-y-2.5">
                      {selectedGuide.steps.map((step, i) => (
                        <li key={i} className="flex gap-3 text-sm text-muted-foreground">
                          <span className="shrink-0 flex items-center justify-center h-6 w-6 rounded-full bg-primary/10 text-primary text-xs font-bold">
                            {i + 1}
                          </span>
                          <span className="pt-0.5">{step}</span>
                        </li>
                      ))}
                    </ol>
                  </div>

                  <Separator />

                  <div className="space-y-3">
                    <h4 className="font-semibold text-sm text-foreground flex items-center gap-2">
                      <Lightbulb size={16} className="text-chart-4" />
                      Tips & Notes
                    </h4>
                    <ul className="space-y-2">
                      {selectedGuide.tips.map((tip, i) => (
                        <li key={i} className="flex gap-2 text-sm text-muted-foreground">
                          <span className="text-chart-4 shrink-0 mt-1">&bull;</span>
                          <span>{tip}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <Button
                    className="w-full"
                    onClick={() => {
                      setSelectedGuide(null);
                      navigate(selectedGuide.route);
                    }}
                  >
                    <ExternalLink size={16} className="mr-2" />
                    Go to {selectedGuide.title}
                  </Button>
                </div>
              </ScrollArea>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
