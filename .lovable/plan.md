
# Dynamic Branding, Theme Backgrounds, Sidebar Collapse, and Dashboard Polish

## Overview

Four changes:
1. Dynamic app name: "HiAgent" for real estate agents, "HiBroker" for business brokers -- everywhere
2. Richer theme backgrounds: Ocean and Sunset get more saturated, non-white backgrounds; Sunset sidebar text gets lighter
3. Bigger logo in dashboard header, aligned with "Dashboard" title
4. Move sidebar collapse toggle to top-right with a better icon

---

## 1. Dynamic App Name Based on User Type

The `user_type` field in `profiles` is either `real_estate_agent` or `business_broker`. We need to propagate this so the branding text changes throughout the app.

**Files:** `AppLayout.tsx`, `AppSidebar.tsx`, `Dashboard.tsx`, `UserTypeSelector.tsx`, `QuickSetup.tsx`

- In `AppLayout.tsx`, the `userType` state is already fetched. Pass it down or make it available via a shared mechanism. The simplest approach: create a small React context or pass the user type to AppSidebar as a prop.
- Create a helper: `getAppName(userType)` returns `{ prefix: 'Hi', suffix: 'Agent' }` or `{ prefix: 'Hi', suffix: 'Broker' }`.
- Replace all hardcoded `Hi<span>Agent</span>` with the dynamic version in:
  - `AppSidebar.tsx` (sidebar brand)
  - `AppLayout.tsx` (top header bar)
  - `UserTypeSelector.tsx` (personalization text)
  - Loading spinner text in `AppLayout.tsx`
- The `AppSidebar` currently fetches `first_name` separately. Update it to also fetch `user_type`, or receive it as a prop from `AppLayout`.

**Approach:** Pass `userType` as a prop from `AppLayout` to `AppSidebar` to avoid a duplicate query, since `AppLayout` already fetches it.

---

## 2. Richer Theme Backgrounds

**File:** `ThemeContext.tsx`

Current values are too close to white. Update:

- **Ocean light mode** `--background`: change from `210 20% 96%` to `210 25% 88%` (a visible steel-blue tint, not white). Also adjust `--muted` and `--secondary` to be proportionally darker so they remain distinct.
- **Sunset light mode** `--background`: change from `25 30% 96%` to `30 35% 86%` (a warm sand/cream tone). Adjust `--muted` and `--secondary` similarly.
- **Sunset sidebar text** `--sidebar-foreground`: change from `25 15% 90%` to `25 10% 95%` (brighter/whiter for better readability against the dark sidebar).
- **Lavender** stays as-is (user said it's okay).

Also update the `THEME_FAMILIES` preview colors to match the new background values.

---

## 3. Bigger Logo on Dashboard, Aligned with Title

**File:** `AppLayout.tsx`

Currently the header shows "HiAgent" at `text-2xl` absolutely centered. Change to:
- Increase to `text-5xl` (4x bigger than the original small size)
- Position it on the left side of the header (not absolute centered), so it aligns with the "Dashboard" title below it
- Keep it visually centered within the content area (using normal flow, not absolute positioning)

**File:** `AppLayout.tsx` header section:
- Remove `absolute left-1/2 -translate-x-1/2`
- Make the brand name the first element, left-aligned
- Size: `text-5xl font-heading font-bold`
- Push search/bell/avatar to the right with `ml-auto`

---

## 4. Move Sidebar Collapse Toggle to Top-Right

**File:** `AppSidebar.tsx`

Currently the collapse button is at the very bottom of the sidebar using `ChevronLeft`/`ChevronRight`. Move it to the top-right corner of the sidebar brand area, and use a better icon:
- Use `PanelLeftClose` (when expanded) and `PanelLeftOpen` (when collapsed) from lucide-react -- these clearly indicate "collapse/expand sidebar"
- Position it in the brand header area, top-right corner
- Remove the bottom collapse button entirely

---

## Technical Details

### Helper function for app name:

```text
function getAppName(userType: string | null): { prefix: string; suffix: string } {
  if (userType === 'business_broker') return { prefix: 'Hi', suffix: 'Broker' };
  return { prefix: 'Hi', suffix: 'Agent' };
}
```

### AppLayout prop passing:

```text
// In AppLayout, pass userType to AppSidebar:
<AppSidebar userType={userType} />

// AppSidebar accepts:
interface AppSidebarProps { userType?: string | null; }
```

### Updated theme background values (ThemeContext.tsx):

```text
// Ocean light
'--background': '210 25% 88%'
'--muted': '210 18% 83%'
'--secondary': '210 20% 85%'

// Sunset light
'--background': '30 35% 86%'
'--muted': '25 25% 82%'
'--secondary': '25 28% 83%'
'--sidebar-foreground': '25 10% 95%'
```

### Sidebar collapse button (top-right of brand area):

```text
<div className="px-5 py-6 flex items-start justify-between">
  <div>
    <span className="font-heading font-bold text-3xl ...">Hi<span ...>Agent</span></span>
    {!collapsed && firstName && <p ...>Hi, {firstName}</p>}
  </div>
  <button onClick={() => setCollapsed(!collapsed)} className="...">
    {collapsed ? <PanelLeftOpen size={18} /> : <PanelLeftClose size={18} />}
  </button>
</div>
```

### Dashboard header (AppLayout.tsx):

```text
<div className="flex items-center justify-between px-6 py-4 shrink-0">
  <span className="font-heading font-bold text-5xl text-foreground">
    Hi<span className="text-primary">{appName.suffix}</span>
  </span>
  <div className="flex items-center gap-3">
    <!-- search, bell, avatar -->
  </div>
</div>
```

**Files changed:** 3 files (`ThemeContext.tsx`, `AppSidebar.tsx`, `AppLayout.tsx`)
