
# Premium Visual Overhaul — Outstaff-Inspired Design

## Overview

Transform the entire app's visual identity to match the premium, modern dashboard shown in the reference screenshot. This includes larger border radii, glassmorphism effects, smoother page/sidebar transitions, refined card styles with subtle gradients, and polished micro-interactions throughout.

## Key Design Principles from Reference

- **Extra-rounded cards** (border-radius ~1rem / 16px instead of current 12px)
- **Soft, layered card shadows** with slightly elevated feel
- **Lavender/lilac background** with white cards (already close, needs refinement)
- **Smooth sidebar navigation transitions** with active state highlighting (filled pill background)
- **Page content transitions** — fade + slide when switching routes
- **Dialog/modal animations** — smoother scale + backdrop blur
- **Micro-interactions** — hover lift on cards, subtle scale on buttons, smooth color transitions on nav items
- **Cleaner typography spacing** — more whitespace, larger headings

---

## Changes

### 1. CSS Variables and Global Styles (`src/index.css`)

- Increase `--radius` from `0.75rem` to `1rem` for rounder cards matching the screenshot
- Add new CSS variables: `--shadow-elevated` for hover states, `--glass` for glassmorphism
- Add page transition keyframes: `pageEnter` (fade + slide up), `pageExit`
- Add card hover animation: subtle translateY(-2px) + shadow increase
- Add `.glass` utility class: `backdrop-blur-xl bg-card/80`
- Enhance scrollbar styling with smoother rounded thumb
- Add smooth transition to body for dark mode color switches

### 2. Tailwind Config (`tailwind.config.ts`)

- Add new keyframes: `page-enter`, `card-hover-up`, `sidebar-highlight`
- Add corresponding animation utilities
- Add `glass` and `elevated-hover` as reusable shadow values
- Increase default transition duration references

### 3. Sidebar — Premium Transitions (`src/components/AppSidebar.tsx`)

- Add `transition-all duration-200` to all nav links (already partially there)
- Active nav item: add a smooth pill background animation using CSS transition on background-color + transform
- Add slight left-border indicator (3px rounded primary bar) on active item, animated in with scaleY
- Sidebar collapse/expand: add `transition-[width] duration-300 ease-in-out` for smoother width change
- Logo area: add subtle hover scale effect

### 4. Page Transitions (`src/components/AppLayout.tsx`)

- Wrap `{children}` in a container with a CSS animation that triggers on route change
- Use a `key={location.pathname}` on the content wrapper so React re-mounts with the fade-in animation on navigation
- Animation: `animate-page-enter` — opacity 0 to 1, translateY(8px) to 0, over 300ms ease-out

### 5. Card Component — Premium Style (`src/components/ui/card.tsx`)

- Update default Card classes: increase rounding to `rounded-2xl`, add `transition-all duration-200`
- Add hover effect: `hover:shadow-elevated hover:-translate-y-0.5` for a subtle lift
- Keep border but make it softer: `border-border/50` for a more subtle divider

### 6. StatCard — Refined Look (`src/components/StatCard.tsx`)

- Add gradient backgrounds: subtle `bg-gradient-to-br from-card to-card/80`
- Icon container: make it slightly larger (h-11 w-11), add `rounded-xl` instead of `rounded-lg`
- Add `group` class to parent, icon scales slightly on hover: `group-hover:scale-110 transition-transform`
- Value text: slightly larger (text-3xl on desktop)

### 7. Button — Smoother Interactions (`src/components/ui/button.tsx`)

- Add `transition-all duration-200` (currently just `transition-colors`)
- Default variant: add `hover:shadow-md hover:-translate-y-px active:translate-y-0` for press feedback
- Increase border-radius to `rounded-xl` for all sizes
- Ghost variant: add `hover:bg-accent/50` for softer hover

### 8. Dialog — Premium Open/Close (`src/components/ui/dialog.tsx`)

- Overlay: change from `bg-black/80` to `bg-black/40 backdrop-blur-sm` for a frosted glass effect
- Content: add `rounded-2xl` and `shadow-float` for more depth
- Smoother animation: keep existing but extend duration to 250ms

### 9. Tabs — Polished Switcher (`src/components/ui/tabs.tsx`)

- TabsList: `rounded-xl` instead of `rounded-md`, add `p-1.5` for more padding
- TabsTrigger: `rounded-lg` instead of `rounded-sm`, add `transition-all duration-200`
- Active state: add subtle shadow `data-[state=active]:shadow-sm`

### 10. Badge — Softer Pills (`src/components/ui/badge.tsx`)

- Already rounded-full (good)
- Add `transition-colors duration-200` for smoother variant changes

### 11. Bottom Nav — Glass Effect (`src/components/BottomNav.tsx`)

- Enhance backdrop blur: `backdrop-blur-xl bg-card/70` for stronger glass effect
- Active icon: add scale transition `transition-all duration-200` with `scale-110` when active
- Add a small dot indicator below active icon instead of just color change

### 12. Progress Bar — Animated Fill (`src/components/ui/progress.tsx`)

- Add gradient to the indicator: `bg-gradient-to-r from-primary to-primary/70`
- Add `transition-all duration-500 ease-out` for smoother fill animation
- Increase rounding to match new radius

### 13. PageHeader — More Presence (`src/components/PageHeader.tsx`)

- Increase heading size to `text-3xl` on desktop
- Add bottom margin separator or subtle gradient underline
- Add `animate-page-enter` to the header for coordinated page entry

---

## Technical Details

### New CSS keyframes in `src/index.css`:

```text
@keyframes pageEnter {
  from { opacity: 0; transform: translateY(12px); }
  to { opacity: 1; transform: translateY(0); }
}

@keyframes cardHover {
  to { transform: translateY(-2px); box-shadow: var(--shadow-lg); }
}
```

### New Tailwind animation in `tailwind.config.ts`:

```text
keyframes: {
  "page-enter": {
    "0%": { opacity: "0", transform: "translateY(12px)" },
    "100%": { opacity: "1", transform: "translateY(0)" },
  },
},
animation: {
  "page-enter": "page-enter 0.35s ease-out",
}
```

### AppLayout route-keyed transition:

```text
// In AppLayout, import useLocation
const location = useLocation();

// Wrap children with key for re-mount animation
<div key={location.pathname} className="flex-1 p-4 md:p-6 lg:p-8 pb-20 md:pb-8 animate-page-enter">
  {children}
</div>
```

### Card component update:

```text
<div className={cn(
  "rounded-2xl border border-border/50 bg-card text-card-foreground shadow-card transition-all duration-200 hover:shadow-elevated hover:-translate-y-0.5",
  className
)} />
```

### Dialog overlay glass effect:

```text
<DialogPrimitive.Overlay className={cn(
  "fixed inset-0 z-50 bg-black/40 backdrop-blur-sm ...",
  className
)} />
```

### Sidebar active indicator:

```text
<RouterNavLink className={cn(
  'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200',
  isActive
    ? 'bg-primary text-primary-foreground shadow-sm'
    : 'text-sidebar-foreground/70 hover:bg-sidebar-accent/70 hover:text-sidebar-foreground'
)} />
```

### Button refinement:

```text
"inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-medium ring-offset-background transition-all duration-200 focus-visible:outline-none ..."

// default variant:
"bg-primary text-primary-foreground hover:bg-primary/90 hover:shadow-md hover:-translate-y-px active:translate-y-0 active:shadow-sm"
```

**Files changed:** 11 files (index.css, tailwind.config.ts, AppLayout.tsx, AppSidebar.tsx, card.tsx, StatCard.tsx, button.tsx, dialog.tsx, tabs.tsx, progress.tsx, PageHeader.tsx, BottomNav.tsx, badge.tsx)
