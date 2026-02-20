

# Theme System Overhaul, Setup Cleanup, and Customization Fixes

## Overview

Four distinct workstreams:
1. Remove the color/theme step from the initial setup wizard
2. Add 3 visually distinct themes (with light/dark variants) and a theme picker in the sidebar
3. Fix the "Import Colors from Website" feature using an AI-powered edge function
4. Fix font selection so chosen fonts actually load and apply
5. Add the theme picker to the Customization page too

---

## 1. Remove Theme Step from Setup Wizard

**Files:** `src/components/QuickSetup.tsx`, `src/components/setup/SetupThemeStep.tsx`, `src/components/setup/SetupReviewStep.tsx`

- Remove step index 4 (Theme) from the wizard -- go straight from Logo (step 3) to Review (step 4)
- Update `STEP_LABELS` from `['Commission', 'Goal', 'Details', 'Logo', 'Theme', 'Review']` to `['Commission', 'Goal', 'Details', 'Logo', 'Review']`
- Remove the `theme` state and the `SetupThemeStep` import/render
- Remove theme-related fields from the Review step data (`themeBase`, `backgroundMode`)
- Remove theme-related rows from ReviewStep display
- Remove theme-related fields from the `handleComplete` save logic (`background_mode`, `background_asset_id`)
- Keep `SetupThemeStep.tsx` file (unused but harmless) or delete it

---

## 2. Three Distinct Themes with Sidebar Picker

**File:** `src/contexts/ThemeContext.tsx`

Add 3 theme families (each with a light and dark variant = 6 total themes). Each theme has distinctly different background and sidebar colors with proper text contrast:

**Lavender (current default)**
- Background: soft purple-grey (#ECEAF4)
- Sidebar: darker lavender
- Primary: purple
- Already exists, keep as-is

**Ocean**
- Background: soft blue-grey (210 20% 93%)
- Sidebar: dark navy (210 25% 15%)
- Sidebar text: light (white/near-white)
- Primary: deep blue (210 70% 50%)
- Accent: cyan
- Cards: white
- Dark variant: deep navy background

**Sunset**
- Background: warm peach-cream (25 30% 93%)
- Sidebar: dark warm brown (25 20% 15%)
- Sidebar text: light
- Primary: warm orange-red (15 75% 55%)
- Accent: gold
- Cards: white
- Dark variant: deep brown-charcoal background

Each theme definition includes all CSS variables (`--background`, `--card`, `--sidebar-background`, `--sidebar-foreground`, `--primary`, etc.) ensuring proper contrast ratios.

**File:** `src/components/AppSidebar.tsx`

Add a theme selector below the dark mode toggle:
- Use a simple dropdown/select with 3 options showing theme name + a small color swatch circle
- When selected, calls `setTheme(themeId)` which persists to the database
- The dark mode toggle continues to work independently (switching between light/dark variant of the active theme family)

**File:** `src/contexts/ThemeContext.tsx` (logic updates)

- Update `toggleDarkMode` to find the dark/light pair of whichever theme family is active (not just lavender)
- Add a helper to get the "family" of a theme (e.g., `ocean` and `dark-ocean` are the same family)
- `setTheme` accepts a family name and picks light or dark based on current `isDark` state

---

## 3. Fix "Import Colors from Website"

**File:** `supabase/functions/extract-brand-colors/index.ts` (new edge function)

Create an edge function that:
- Receives a website URL
- Fetches the page HTML
- Extracts colors from: meta theme-color, Open Graph meta tags, inline CSS variables, prominent CSS colors
- Falls back to using the Lovable AI (Gemini Flash) to analyze the favicon/page and suggest 3 brand colors
- Returns `{ primary: "#hex", secondary: "#hex", accent: "#hex" }`

**File:** `src/pages/Customization.tsx`

- Update `handleImportColors` to call the new edge function instead of the fake implementation
- Show a loading state while extracting
- Apply the returned colors to the brand state

---

## 4. Fix Font Selection

**File:** `src/pages/Customization.tsx`

The fonts don't work because they're never loaded from Google Fonts. Only "Plus Jakarta Sans" and "DM Sans" are imported in `index.css`.

Fix:
- When a font is selected, dynamically inject a Google Fonts `<link>` tag into the document head
- Create a helper function `loadGoogleFont(fontName: string)` that checks if the font link already exists, and if not, appends it
- Call this on mount for the saved fonts, and on each font change
- Also apply the fonts to `document.documentElement` style properties (`--font-heading`, `--font-body`) on save so the change is visible immediately
- In `ThemeContext`, also load saved brand fonts from `brand_profiles` and apply them

**File:** `src/contexts/ThemeContext.tsx`

- Extend `loadBrand` to also fetch `font_heading` and `font_body`
- When brand fonts are set, dynamically load them and update CSS variables

---

## 5. Theme Picker on Customization Page

**File:** `src/pages/Customization.tsx`

Add a new Card section at the top of the page (before Brand Colors) titled "Theme":
- Show 3 theme options as clickable cards with:
  - A small preview showing the background color, sidebar color, and primary color as swatches
  - The theme name (Lavender, Ocean, Sunset)
  - A checkmark on the active one
- Selecting a theme calls `setTheme()` from the ThemeContext
- Include the dark mode toggle here too

---

## Technical Details

### New theme definitions (ThemeContext):

```text
// Ocean theme family
{
  id: 'ocean',
  name: 'Ocean',
  description: 'Cool blue with navy sidebar',
  pairId: 'dark-ocean',
  vars: {
    '--background': '210 20% 93%',
    '--card': '0 0% 100%',
    '--sidebar-background': '210 25% 15%',
    '--sidebar-foreground': '210 10% 90%',
    '--primary': '210 70% 50%',
    '--primary-foreground': '0 0% 100%',
    '--accent': '185 70% 45%',
    // ... full set of vars
  }
}

// Sunset theme family
{
  id: 'sunset',
  name: 'Sunset',
  description: 'Warm tones with dark sidebar',
  pairId: 'dark-sunset',
  vars: {
    '--background': '25 30% 93%',
    '--card': '0 0% 100%',
    '--sidebar-background': '25 20% 15%',
    '--sidebar-foreground': '25 15% 90%',
    '--primary': '15 75% 55%',
    '--primary-foreground': '0 0% 100%',
    // ... full set of vars
  }
}
```

### Sidebar theme selector:

```text
<Select value={themeFamily} onValueChange={handleThemeChange}>
  <SelectTrigger className="h-8 text-xs">
    <SelectValue />
  </SelectTrigger>
  <SelectContent>
    {families.map(f => (
      <SelectItem key={f.id} value={f.id}>
        <div className="flex items-center gap-2">
          <div className="flex gap-0.5">
            <div className="h-3 w-3 rounded-full" style={{ background: f.previewBg }} />
            <div className="h-3 w-3 rounded-full" style={{ background: f.previewSidebar }} />
            <div className="h-3 w-3 rounded-full" style={{ background: f.previewPrimary }} />
          </div>
          <span>{f.name}</span>
        </div>
      </SelectItem>
    ))}
  </SelectContent>
</Select>
```

### Dynamic font loading helper:

```text
function loadGoogleFont(fontName: string) {
  const id = `gfont-${fontName.replace(/\s+/g, '-')}`;
  if (document.getElementById(id)) return;
  const link = document.createElement('link');
  link.id = id;
  link.rel = 'stylesheet';
  link.href = `https://fonts.googleapis.com/css2?family=${encodeURIComponent(fontName)}:wght@300;400;500;600;700&display=swap`;
  document.head.appendChild(link);
}
```

### Edge function for color extraction:

```text
// supabase/functions/extract-brand-colors/index.ts
// 1. Fetch the HTML of the given URL
// 2. Parse meta tags: <meta name="theme-color">, og:image colors
// 3. Extract CSS custom properties and prominent hex/rgb values
// 4. If not enough colors found, use Lovable AI (Gemini Flash) to suggest brand colors
// 5. Return { primary, secondary, accent }
```

### Setup wizard changes:

```text
// STEP_LABELS: remove 'Theme' -> ['Commission', 'Goal', 'Details', 'Logo', 'Review']
// Step numbering: 0-Commission, 1-Goal, 2-Details, 3-Logo, 4-Review
// Remove step === 4 SetupThemeStep render
// Step 3 (Logo) onNext -> setStep(4) which is now Review
// Step 4 (Review) onBack -> setStep(3) which is Logo
```

**Files changed:** ~6 files (ThemeContext.tsx, AppSidebar.tsx, Customization.tsx, QuickSetup.tsx, SetupReviewStep.tsx) + 1 new edge function (extract-brand-colors)
