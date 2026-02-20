

# Sidebar & Branding Layout Adjustments

## Overview

Make the sidebar more visually distinct with a darker background, enlarge the "HiAgent" branding, remove the uploaded logo from the sidebar, add a personalized greeting below it, and place the "HiAgent" brand name prominently centered in the dashboard top header.

## Changes

### 1. Darker Sidebar Background (`src/index.css`)

Update the sidebar CSS variable to a noticeably darker lavender shade so it contrasts with the white main content area.

- Light mode: change `--sidebar-background` from `0 0% 100%` (white) to `250 20% 90%` (soft purple-grey)
- Dark mode: darken proportionally to `250 20% 8%`
- Adjust `--sidebar-accent` slightly darker to match

### 2. Sidebar Branding Overhaul (`src/components/AppSidebar.tsx`)

- **Remove** the uploaded logo image and the "Hi" icon square entirely from the top section
- **Double the size** of "HiAgent" text: from `text-lg` to `text-3xl`
- **Add greeting below**: "Hi, {firstName}" in a smaller muted text, fetching `first_name` from the profile (already fetched in AppLayout, needs to be passed or fetched here)
- Fetch `first_name` alongside `avatar_url` in the existing sidebar profile query
- Remove the `logoUrl` state and the logo fetch since the logo is no longer shown in the sidebar

### 3. Centered "HiAgent" in Dashboard Header (`src/components/AppLayout.tsx`)

- Replace the empty `<div />` on the left side of the top header bar with the "HiAgent" brand name
- Style it as `text-2xl font-heading font-bold` with the "Agent" part in primary color
- This gives a prominent centered brand presence at the top of the main content area

### 4. Dashboard Page Cleanup (`src/pages/Dashboard.tsx`)

- Remove the `logoUrl` state and the logo image from the PageHeader action area (since branding is now in the sidebar and top bar)
- Remove the profile `avatar_url` fetch from `loadStats` since it's no longer needed here

---

## Technical Details

### CSS variable changes (`src/index.css`):

```text
/* Light mode */
--sidebar-background: 250 20% 90%;
--sidebar-accent: 250 18% 86%;

/* Dark mode */
--sidebar-background: 250 20% 8%;
--sidebar-accent: 250 15% 12%;
```

### Sidebar top section (`src/components/AppSidebar.tsx`):

```text
<!-- Remove logo/icon, enlarge brand name, add greeting -->
<div className="px-5 py-6">
  <span className="font-heading font-bold text-3xl text-sidebar-foreground">
    Hi<span className="text-primary">Agent</span>
  </span>
  <p className="text-sm text-muted-foreground mt-1">
    Hi, {firstName}
  </p>
</div>
```

- Fetch `first_name` in the existing profile query: `.select('avatar_url, first_name')`
- Store in new state `firstName`
- Fallback to user email prefix if `first_name` is empty

### Top header bar (`src/components/AppLayout.tsx`):

```text
<div className="flex items-center justify-between px-6 py-4 shrink-0">
  <div />
  <span className="font-heading font-bold text-2xl text-foreground absolute left-1/2 -translate-x-1/2">
    Hi<span className="text-primary">Agent</span>
  </span>
  <div className="flex items-center gap-3">
    <!-- search, bell, avatar stay the same -->
  </div>
</div>
```

The header container gets `relative` positioning so the brand name can be absolutely centered.

### Dashboard cleanup (`src/pages/Dashboard.tsx`):

- Remove `logoUrl` state variable
- Remove `avatar_url` from the profile select in `loadStats`
- Remove the `{logoUrl && <img ...>}` block from the PageHeader action

**Files changed:** 4 files (index.css, AppSidebar.tsx, AppLayout.tsx, Dashboard.tsx)
