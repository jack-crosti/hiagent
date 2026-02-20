
# Fix Demo Data for Real Estate Agents, Dashboard Graphs, and Demo Exit

## Problem Summary

1. **Demo deals are business-only for RE agents**: The `DemoModeCard` seeds "Cafe & Restaurant", "Automotive Workshop", and "Office Space" deals using `business_sale` and `lease` deal types regardless of user type. Real estate agents should see property listings like "3-Bed Villa - Parnell" instead.

2. **Scenario engine is hardcoded to business deals**: The `generateScenarios` function in `commissionService.ts` always uses `DEFAULT_BUSINESS_SALE_RULE` with business-sale price points ($250k, $600k, $1.5M). Real estate agents should see property-sale scenarios with appropriate price points ($800k, $1.2M, $2.5M).

3. **Dashboard graphs not showing**: The charts only render when `!stats.isDemo`, which checks whether any deals or transactions exist. After seeding demo data, the `IncomeExpenseChart` and `PipelineChart` should appear, but there may be a timing/state issue. Additionally, the `PipelineChart` only renders deals with `status === 'pipeline'` -- the seeded deals should have this default, but need to verify. The fix will also ensure the chart section renders reliably after data load.

4. **No demo exit to clear data**: While the guided tour has an "Exit Demo" button, there is no way to clear seeded demo data and return to a clean personal interface. Users need a "Clear Demo Data" action.

---

## Changes

### 1. Role-Aware Demo Data (`src/components/dashboard/DemoModeCard.tsx`)

- Import `useUserType` to detect whether user is a broker or agent.
- Branch the seed data:
  - **Business Broker** (current): Keep existing business-sale deals (Cafe, Workshop) and lease deals.
  - **Real Estate Agent** (new): Seed `property_sale` deals with residential listings:
    - "3-Bed Villa - Parnell" ($1,200,000, 70% probability)
    - "Townhouse - Mt Eden" ($850,000, 80% probability)  
    - "Lifestyle Block - Kumeu" ($1,800,000, 45% probability)
  - Use `DEFAULT_PROPERTY_SALE_RULE` tiers for commission calculations.
  - Update transaction descriptions for agents (e.g., "Commission - 42 Remuera Rd Sale" instead of "Commission - Jones Business Sale").
- Add a **"Clear Demo Data"** button that deletes all `is_demo = true` records across tables and calls `onComplete` to refresh.

### 2. Role-Aware Scenario Engine (`src/services/commissionService.ts`)

- Update `generateScenarios` to accept and use `property_sale` deal types:
  - When `dealTypes` includes `property_sale`, use `DEFAULT_PROPERTY_SALE_RULE` with property-appropriate price points:
    - **Conservative**: $800k properties (standard residential)
    - **Realistic**: Mix of $1.2M and $800k properties
    - **Aggressive**: $2.5M premium properties
  - Update assumption text to say "property sale" instead of "business sale".
- When `dealTypes` includes `business_sale`, keep existing behavior.

### 3. PersonalFinance Page Role-Aware Deal Types (`src/pages/PersonalFinance.tsx`)

- Import `useUserType`.
- Change the `dealTypes` passed to `generateScenarios`:
  - **Broker**: `['business_sale', 'lease']` (current)
  - **Agent**: `['property_sale']`

### 4. Fix Dashboard Graphs (`src/pages/Dashboard.tsx`)

- The charts are gated behind `!stats.isDemo`. After demo data is seeded, `loadStats` runs and `hasData` should become true. The fix:
  - Ensure `loadStats` correctly detects seeded data by also checking transactions count (not just pipeline deals).
  - Remove the strict `status=eq.pipeline` filter for the chart deals query -- fetch all non-closed deals for the pipeline chart.
  - Always render the chart section if there are transactions OR deals (already the intent, but verify the state update triggers a re-render properly).

### 5. Demo Exit with Data Cleanup (`src/components/dashboard/DemoModeCard.tsx` + `src/components/DemoBanner.tsx`)

- Add an `async clearDemoData()` function in `DemoModeCard` that:
  - Deletes from `deals`, `transactions`, `bank_accounts`, `categories`, `commission_rules`, `gst_periods`, `goal_plans` where `is_demo = true` and `owner_user_id = userId`.
  - Calls `onComplete` to refresh the dashboard.
  - Shows a toast confirmation.
- In `DemoBanner.tsx`, update the "Exit Demo" button to also offer clearing demo data when the user exits the guided tour (if demo data exists).
- Add a persistent "Clear Demo Data" option on the dashboard `DemoModeCard` area that appears when demo data is detected (post-seed).

---

## Files Modified (5)

| File | Change |
|---|---|
| `src/components/dashboard/DemoModeCard.tsx` | Role-aware seed data + clear demo data button |
| `src/services/commissionService.ts` | Role-aware `generateScenarios` with property sale support |
| `src/pages/PersonalFinance.tsx` | Pass role-aware deal types to scenarios |
| `src/pages/Dashboard.tsx` | Fix chart visibility after demo seed |
| `src/components/DemoBanner.tsx` | Add "Clear Demo Data" option to exit flow |
