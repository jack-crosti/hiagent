
# Enhanced 3D Cards + Clickable Dashboard Stats

## Part 1: More 3D Card Styling

Update the shadow CSS variables in `src/index.css` and the card classes to create a pronounced 3D "floating" effect at rest, with an even more dramatic lift on hover.

### Changes to `src/index.css`
- **Light mode**: Make `--shadow-card` deeper with multiple layered shadows (bottom edge highlight + diffuse shadow) to simulate depth at rest. Make `--shadow-elevated` significantly more dramatic.
- **Dark mode**: Same approach with darker, more spread shadows.
- Add a new `--shadow-3d` variable for the static "resting" 3D look (a tight bottom shadow simulating a card sitting on a surface).

### Changes to `src/components/ui/card.tsx`
- Increase resting shadow to use the new deeper 3D shadow.
- Increase hover translate from `-translate-y-0.5` to `-translate-y-2` for a more obvious lift.
- Add a subtle bottom border highlight (`border-b-2 border-white/20`) to enhance the 3D edge illusion.

### Changes to `src/components/StatCard.tsx`
- Same approach: deepen the resting shadow, increase hover lift from `-translate-y-1` to `-translate-y-3`.
- Make the gradient overlay on hover more visible (`from-primary/8` instead of `/5`).
- Increase the icon scale on hover from `scale-110` to `scale-115`.

## Part 2: Clickable Dashboard Stat Cards

Wrap each of the four stat cards on the Dashboard in `<Link>` components pointing to the relevant pages:

| Stat Card | Links To |
|---|---|
| Total Income | `/transactions` |
| Total Expenses | `/transactions` |
| Pending GST | `/gst` |
| Pipeline Value | `/personal-finance` |

Add a `cursor-pointer` class and a subtle arrow or visual hint so users know these are clickable.

### Changes to `src/pages/Dashboard.tsx`
- Import `Link` (already imported).
- Wrap each `<StatCard>` in a `<Link to="...">` with `className="block"`.

## Technical Details

**Files modified (4):**
- `src/index.css` -- shadow variables
- `src/components/ui/card.tsx` -- base Card hover/3D classes
- `src/components/StatCard.tsx` -- stat card hover/3D classes
- `src/pages/Dashboard.tsx` -- wrap stat cards in Links
