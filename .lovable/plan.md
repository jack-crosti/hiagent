

## Move Greeting from Sidebar to Dashboard

### What changes

1. **Sidebar (`AppSidebar.tsx`)** -- Remove the "Hi, {firstName}" line beneath the HiAgent logo. The logo stays, just the greeting text goes away.

2. **Dashboard (`Dashboard.tsx`)** -- Change the description under "Dashboard" from "Welcome back..." to "Hi, {firstName}...". This requires fetching the user's first name from the profiles table (same query pattern already used in the sidebar).

### Technical details

**AppSidebar.tsx (line 70-72):**
- Remove the `{!collapsed && firstName && (<p>Hi, {firstName}</p>)}` block
- The `firstName` state and its `useEffect` fetch can also be removed since they're no longer needed

**Dashboard.tsx:**
- Add state for `firstName` and fetch it from `profiles` table (same pattern as sidebar)
- Change the `PageHeader` description from `` `Welcome back${...}` `` to `` `Hi, ${firstName}${stats.isDemo ? ' — try demo mode to explore' : ''}` ``

**Files changed:** `AppSidebar.tsx`, `Dashboard.tsx`

