

# Fix: HiAgent Logo Not Visible on Dashboard

## Problem

The logo image loads successfully (confirmed via network requests), but it's a transparent PNG with light-colored content that blends into the light lavender background, making it invisible.

This affects two places:
1. **Dashboard PageHeader** — small logo next to "View Goals" button
2. **Sidebar** — logo in the top-left branding area

## Solution

Add a subtle dark background or use CSS `filter` to ensure the logo is always visible regardless of its color, in both light and dark modes.

### Approach: Add a tinted background container

Wrap the logo `<img>` in both locations with a slightly contrasting background so transparent logos are always visible.

## Technical Details

### 1. Dashboard logo (`src/pages/Dashboard.tsx`, line 61)

- Add a `dark:invert` class so the logo inverts in dark mode if needed
- Add `bg-foreground/5 p-1 rounded-lg` as a subtle backdrop to ensure contrast in light mode

### 2. Sidebar logo (`src/components/AppSidebar.tsx`, ~line 58)

- Same treatment: add `dark:invert` and a subtle background tint to the logo image

### Alternative (simpler)

Use `mix-blend-mode: multiply` via Tailwind's `mix-blend-multiply` class on the image. This makes white areas transparent and preserves colored areas, which works perfectly for logos on light backgrounds. For dark mode, use `dark:mix-blend-normal dark:invert` or `dark:brightness-0 dark:invert`.

**Recommended classes for both logo images:**
```text
className="h-8 w-auto object-contain rounded mix-blend-multiply dark:brightness-0 dark:invert"
```

This ensures the logo is visible on both light and dark backgrounds without adding extra wrapper elements.

**Files changed:** 2 (Dashboard.tsx, AppSidebar.tsx)
