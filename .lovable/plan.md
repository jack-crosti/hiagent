

# Role-Aware Terminology Across the Entire App

## Problem
Many UI labels, placeholder texts, goal types, content topics, and CTAs are hardcoded for real estate agents, even when the user has selected "Business Broker." The app needs to show role-appropriate terminology throughout.

## Approach
Create a centralized hook/context that exposes the user's `user_type` globally, then update every file that contains role-specific text to conditionally render broker vs agent terminology.

## Step 1: Create a UserType Context
Create `src/contexts/UserTypeContext.tsx` that fetches and caches the user's `user_type` from the `profiles` table. This avoids each page independently fetching `user_type`.

Provides: `userType`, `isAgent`, `isBroker` helpers.

## Step 2: Wire Context into AppLayout
Wrap children with `UserTypeProvider` in `AppLayout.tsx`. Pass `userType` to `AppSidebar` (currently missing -- a bug).

## Step 3: Fix AppSidebar branding
`AppLayout` currently renders `<AppSidebar />` without passing `userType`. Fix to pass it from context so sidebar shows "HiBroker" for brokers.

## Step 4: Fix QuickSetup branding
`QuickSetup.tsx` line 153 hardcodes "Welcome to HiAgent". Make it dynamic: "Welcome to HiBroker" for business brokers.

## Step 5: Marketing Planner (Marketing.tsx) -- the biggest change
Replace static arrays with role-aware versions:

| Element | Real Estate Agent | Business Broker |
|---|---|---|
| GOAL_TYPES | "New listing launch", "Open home promotion", "Buyer wanted", etc. | "New business listing", "Business just sold", "Buyer search", "Vendor lead generation", etc. |
| CTA_OPTIONS | "Visit open home", "Get a free appraisal", "View listing" | "Request info memorandum", "Book a confidential discussion", "View business profile" |
| PLAN_GOALS | "Generate seller leads", "Attract buyers", "Promote active listings" | "Generate vendor leads", "Attract qualified buyers", "Promote active listings", "Build referral network" |
| CONTENT_TOPICS | "Property styling", "Finance & mortgages", "First home buyers", "Auction tips" | "Business valuation", "Exit planning", "Due diligence tips", "Franchise opportunities", "Buyer financing" |
| Listing Name placeholder | "e.g. 3-bed Villa -- Ponsonby" | "e.g. $300K profit Restaurant -- Ponsonby" |
| Listing URL placeholder | "https://www.realestate.co.nz/..." | "https://www.nzbizbuysell.co.nz/..." |
| URL helper text | "...extract property details automatically" | "...extract business details automatically" |
| Property Details label | "Property Details:" | "Business Details:" |
| Style instructions placeholder | "...Always use our brand name 'Elite Realty'..." | "...Always use our brand name 'Elite Business Sales'..." |
| Custom topic placeholder | "e.g. Downsizing tips for retirees" | "e.g. How to value a cafe business" |

Use the existing `userType` state (already fetched in Marketing.tsx) to select the correct set.

## Step 6: DealDialog (DealDialog.tsx)
- Listing Name placeholder: Agent: "e.g. 3-bed Villa -- Ponsonby" / Broker: "e.g. Cafe & Restaurant -- Ponsonby" (already broker-ish but needs to be dynamic)
- Default `deal_type`: Agent should default to `property_sale`, Broker to `business_sale`
- For agents, hide or de-emphasize the "Business Sale" deal type option
- Needs `userType` passed as a prop or consumed from context

## Step 7: Dashboard (Dashboard.tsx)
- "Add New Listing" quick action label: Agent keeps "Add New Listing" / Broker changes to "Add New Deal"
- Fetch `userType` from context

## Step 8: Settings (Settings.tsx)
- Title placeholder line 247: currently "e.g. Business Broker" -- make dynamic: Agent: "e.g. Sales Consultant" / Broker: "e.g. Business Broker"
- For real estate agents, hide the "Business Sale" commission split row (consistent with SetupCommissionStep which already does this)
- Fetch `userType` from context

## Step 9: SetupPersonalStep (SetupPersonalStep.tsx)
- Company placeholder: Agent: "e.g. Harcourts Real Estate" / Broker: "e.g. ABC Business Sales" (currently broker-only)
- Title placeholder: Agent: "e.g. Sales Consultant" / Broker: "e.g. Senior Broker"
- Pass `userType` as prop from QuickSetup

## Step 10: Edge Function (marketing-ai/index.ts)
Already has role-aware master prompts. No changes needed -- it already switches based on `userType` param.

## Technical Details
- New file: `src/contexts/UserTypeContext.tsx`
- Modified files (9): `AppLayout.tsx`, `AppSidebar.tsx`, `QuickSetup.tsx`, `Marketing.tsx`, `DealDialog.tsx`, `Dashboard.tsx`, `Settings.tsx`, `SetupPersonalStep.tsx`, `PersonalFinance.tsx`
- No database changes needed
- No new dependencies

