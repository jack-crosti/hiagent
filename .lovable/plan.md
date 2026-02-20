
# Simplify to Single Purple Theme with Dark Mode Toggle

## Overview

Replace the multi-theme system with a single lavender/purple theme inspired by the uploaded screenshot, keep only the dark mode toggle, and remove the website URL color import from both the setup wizard and settings.

The screenshot shows: soft lavender/purple backgrounds, light purple sidebar with a white/clean aesthetic, rounded cards, blue-purple accent colors, and a modern dashboard feel.

## Changes

### 1. Replace all theme presets with one "Lavender" light + dark pair (`src/contexts/ThemeContext.tsx`)

- Replace the entire `THEMES` array with just two entries: `lavender` (light) and `dark-lavender` (dark)
- Color values derived from the screenshot:
  - Primary: soft blue-purple (~`260 55% 55%`)
  - Accent: cyan/teal highlights (~`190 70% 50%`)
  - Background: very light lavender (`260 20% 97%`)
  - Cards: white with subtle purple tint
  - Sidebar: light lavender (not dark) in light mode, matching the screenshot's white/purple sidebar
  - Muted: soft purple-grey tones
- The `toggleDarkMode` function stays as-is (switches between lavender and dark-lavender)
- Remove `setColorFamily` since there is only one family now (simplify to just toggle)
- Default theme becomes `lavender` instead of `teal-warm`

### 2. Remove theme selector from sidebar (`src/components/AppSidebar.tsx`)

- Remove the "Theme" label and `Select` dropdown (lines 100-128)
- Keep the dark mode toggle (Moon icon + Switch)

### 3. Remove theme preset grid from Settings (`src/pages/Settings.tsx`)

- Remove the "Theme Preset" section (lines 266-280) with the 5-color grid
- Keep: Logo upload, Custom Brand Colors, Fonts, Animations toggle
- The brand colors override still works on top of the single lavender base

### 4. Simplify setup wizard theme step (`src/components/setup/SetupThemeStep.tsx`)

- Remove the "Theme Base" selector (light/dark/brand buttons)
- Remove the "Import Colors from Website" section entirely
- Remove the `websiteUrl` field from `ThemeData`
- Keep only: color pickers (primary, secondary, accent, background, text) for custom branding
- Simplify to just "Pick your brand colors" with the color pickers

### 5. Update QuickSetup to remove websiteUrl references (`src/components/QuickSetup.tsx`)

- Remove `websiteUrl` from the initial `theme` state
- Remove `website_url` from the profile and setup_state saves
- Hardcode `active_theme: 'lavender'` on save (or `dark-lavender` if user picked dark)

### 6. Update CSS variables (`src/index.css`)

- Update the `:root` light theme variables to match the lavender palette
- Update the `.dark` variables to match the dark lavender variant
- Keep all the utility classes, animations, and scrollbar styles unchanged

### 7. Update AppLayout setup check (`src/components/AppLayout.tsx`)

- Remove `themeNotSet` from `isSetupIncomplete` since there is now only one theme and it is always set

## Technical Details

**New lavender light theme CSS variables (`:root`):**
```text
--background: 260 20% 97%
--foreground: 240 20% 14%
--card: 260 15% 100%
--card-foreground: 240 20% 14%
--primary: 260 55% 55%
--primary-foreground: 0 0% 100%
--secondary: 260 20% 93%
--secondary-foreground: 240 20% 14%
--accent: 190 70% 50%
--accent-foreground: 0 0% 100%
--muted: 260 15% 93%
--muted-foreground: 240 10% 42%
--border: 260 12% 88%
--sidebar-background: 260 20% 95%
--sidebar-accent: 260 18% 90%
```

**New dark lavender theme CSS variables (`.dark`):**
```text
--background: 260 20% 7%
--foreground: 260 10% 92%
--card: 260 18% 10%
--primary: 260 55% 62%
--accent: 190 70% 55%
--muted: 260 12% 15%
--border: 260 12% 18%
--sidebar-background: 260 20% 5%
```

**THEMES array reduced to:**
```text
THEMES = [
  { id: 'lavender', name: 'Lavender', dark: false, pairId: 'dark-lavender', vars: {...} },
  { id: 'dark-lavender', name: 'Dark Lavender', dark: true, pairId: 'lavender', vars: {...} },
]
```

**Sidebar theme section becomes just:**
```text
<div className="flex items-center justify-between px-3 py-2">
  <div className="flex items-center gap-2">
    <Moon size={14} />
    <span className="text-xs">Dark mode</span>
  </div>
  <Switch checked={isDark} onCheckedChange={toggleDarkMode} />
</div>
```

**SetupThemeStep simplified:** Remove theme base buttons, remove website URL import section, keep only color pickers with a simpler heading "Customize your brand colors".

**Files changed:** 6 files total (ThemeContext, AppSidebar, Settings, SetupThemeStep, QuickSetup, index.css, AppLayout)
