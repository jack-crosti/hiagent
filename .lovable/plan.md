

# Make Dashboard Stat Cards Equal Height

## Problem
The four stat cards on the dashboard have inconsistent heights because some have a `subtitle` or `trend` line and others don't. "Total Expenses" in particular has neither, making it visibly shorter.

## Solution
Two small changes to ensure all cards in the grid are the same height:

### 1. Make the grid stretch cards equally (`src/pages/Dashboard.tsx`)
Add `h-full` to the `StatCard` wrapper and the `Link` elements so each card stretches to fill its grid cell.

- Each `<Link>` gets `className="block h-full"`
- Each `<StatCard>` gets `h-full` added to its className

### 2. Make StatCard fill its container (`src/components/StatCard.tsx`)
Add `h-full` to the outer `<div>` so the card element stretches to the height of its parent grid cell. This ensures all four cards match the tallest one.

## Technical Details
**Files modified (2):**
- `src/pages/Dashboard.tsx` -- add `h-full` to each `Link` wrapper
- `src/components/StatCard.tsx` -- add `h-full` to the root div

No layout or shadow changes needed -- purely a height consistency fix.
