import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

export interface ThemeDefinition {
  id: string;
  name: string;
  description: string;
  family: string;
  dark?: boolean;
  pairId?: string;
  vars: Record<string, string>;
}

export interface ThemeFamily {
  id: string;
  name: string;
  description: string;
  previewBg: string;
  previewSidebar: string;
  previewPrimary: string;
}

export const THEME_FAMILIES: ThemeFamily[] = [
  { id: 'lavender', name: 'Lavender', description: 'Soft purple with lavender accents', previewBg: '#ECEAF4', previewSidebar: '#D8D4E8', previewPrimary: '#7C5CFC' },
  { id: 'ocean', name: 'Ocean', description: 'Cool blue with navy sidebar', previewBg: '#E5EAF0', previewSidebar: '#1C2A3A', previewPrimary: '#2E7DD6' },
  { id: 'sunset', name: 'Sunset', description: 'Warm tones with dark sidebar', previewBg: '#F0E6DC', previewSidebar: '#2E2218', previewPrimary: '#D95030' },
];

export const THEMES: ThemeDefinition[] = [
  // ── Lavender ──
  {
    id: 'lavender', name: 'Lavender', description: 'Soft lavender with purple accents',
    family: 'lavender', pairId: 'dark-lavender',
    vars: {
      '--primary': '260 55% 55%', '--primary-foreground': '0 0% 100%',
      '--accent': '190 70% 50%', '--accent-foreground': '0 0% 100%',
      '--secondary': '260 20% 93%', '--secondary-foreground': '240 20% 14%',
      '--background': '260 20% 97%', '--foreground': '240 20% 14%',
      '--card': '260 15% 100%', '--card-foreground': '240 20% 14%',
      '--popover': '260 15% 100%', '--popover-foreground': '240 20% 14%',
      '--muted': '260 15% 93%', '--muted-foreground': '240 10% 42%',
      '--border': '260 12% 88%', '--input': '260 12% 88%',
      '--destructive': '0 72% 51%', '--destructive-foreground': '0 0% 100%',
      '--sidebar-background': '250 20% 90%', '--sidebar-accent': '250 18% 86%',
      '--sidebar-foreground': '240 20% 14%',
      '--chart-1': '260 55% 55%', '--chart-2': '190 70% 50%',
      '--chart-3': '38 92% 50%', '--chart-4': '340 60% 55%', '--chart-5': '152 56% 42%',
    },
  },
  {
    id: 'dark-lavender', name: 'Dark Lavender', description: 'Dark mode with lavender accents',
    family: 'lavender', dark: true, pairId: 'lavender',
    vars: {
      '--primary': '260 55% 62%', '--primary-foreground': '0 0% 5%',
      '--accent': '190 70% 55%', '--accent-foreground': '0 0% 5%',
      '--secondary': '260 12% 18%', '--secondary-foreground': '260 12% 90%',
      '--background': '260 20% 7%', '--foreground': '260 10% 92%',
      '--card': '260 18% 10%', '--card-foreground': '260 10% 92%',
      '--popover': '260 18% 10%', '--popover-foreground': '260 10% 92%',
      '--muted': '260 12% 15%', '--muted-foreground': '260 8% 58%',
      '--destructive': '0 62% 40%', '--destructive-foreground': '0 0% 95%',
      '--border': '260 12% 18%', '--input': '260 12% 18%',
      '--sidebar-background': '250 20% 8%', '--sidebar-accent': '250 15% 12%',
      '--sidebar-foreground': '260 10% 92%',
      '--chart-1': '260 55% 65%', '--chart-2': '190 70% 55%',
      '--chart-3': '38 85% 58%', '--chart-4': '340 60% 60%', '--chart-5': '152 55% 50%',
    },
  },
  // ── Ocean ──
  {
    id: 'ocean', name: 'Ocean', description: 'Cool blue with navy sidebar',
    family: 'ocean', pairId: 'dark-ocean',
    vars: {
      '--primary': '210 70% 50%', '--primary-foreground': '0 0% 100%',
      '--accent': '185 70% 45%', '--accent-foreground': '0 0% 100%',
      '--secondary': '210 20% 93%', '--secondary-foreground': '210 25% 14%',
      '--background': '210 20% 96%', '--foreground': '210 25% 14%',
      '--card': '0 0% 100%', '--card-foreground': '210 25% 14%',
      '--popover': '0 0% 100%', '--popover-foreground': '210 25% 14%',
      '--muted': '210 15% 92%', '--muted-foreground': '210 10% 42%',
      '--border': '210 12% 87%', '--input': '210 12% 87%',
      '--destructive': '0 72% 51%', '--destructive-foreground': '0 0% 100%',
      '--sidebar-background': '210 25% 15%', '--sidebar-accent': '210 22% 20%',
      '--sidebar-foreground': '210 10% 90%',
      '--chart-1': '210 70% 50%', '--chart-2': '185 70% 45%',
      '--chart-3': '38 92% 50%', '--chart-4': '340 60% 55%', '--chart-5': '152 56% 42%',
    },
  },
  {
    id: 'dark-ocean', name: 'Dark Ocean', description: 'Deep navy dark mode',
    family: 'ocean', dark: true, pairId: 'ocean',
    vars: {
      '--primary': '210 70% 58%', '--primary-foreground': '0 0% 5%',
      '--accent': '185 70% 50%', '--accent-foreground': '0 0% 5%',
      '--secondary': '210 15% 18%', '--secondary-foreground': '210 12% 90%',
      '--background': '210 25% 7%', '--foreground': '210 10% 92%',
      '--card': '210 22% 10%', '--card-foreground': '210 10% 92%',
      '--popover': '210 22% 10%', '--popover-foreground': '210 10% 92%',
      '--muted': '210 15% 14%', '--muted-foreground': '210 8% 55%',
      '--destructive': '0 62% 40%', '--destructive-foreground': '0 0% 95%',
      '--border': '210 15% 18%', '--input': '210 15% 18%',
      '--sidebar-background': '210 25% 5%', '--sidebar-accent': '210 20% 10%',
      '--sidebar-foreground': '210 10% 90%',
      '--chart-1': '210 70% 60%', '--chart-2': '185 70% 50%',
      '--chart-3': '38 85% 58%', '--chart-4': '340 60% 60%', '--chart-5': '152 55% 50%',
    },
  },
  // ── Sunset ──
  {
    id: 'sunset', name: 'Sunset', description: 'Warm tones with dark sidebar',
    family: 'sunset', pairId: 'dark-sunset',
    vars: {
      '--primary': '15 75% 55%', '--primary-foreground': '0 0% 100%',
      '--accent': '42 80% 50%', '--accent-foreground': '0 0% 10%',
      '--secondary': '25 25% 92%', '--secondary-foreground': '25 20% 14%',
      '--background': '25 30% 96%', '--foreground': '25 20% 14%',
      '--card': '0 0% 100%', '--card-foreground': '25 20% 14%',
      '--popover': '0 0% 100%', '--popover-foreground': '25 20% 14%',
      '--muted': '25 18% 91%', '--muted-foreground': '25 10% 42%',
      '--border': '25 14% 86%', '--input': '25 14% 86%',
      '--destructive': '0 72% 51%', '--destructive-foreground': '0 0% 100%',
      '--sidebar-background': '25 20% 15%', '--sidebar-accent': '25 18% 20%',
      '--sidebar-foreground': '25 15% 90%',
      '--chart-1': '15 75% 55%', '--chart-2': '42 80% 50%',
      '--chart-3': '340 60% 55%', '--chart-4': '190 70% 50%', '--chart-5': '152 56% 42%',
    },
  },
  {
    id: 'dark-sunset', name: 'Dark Sunset', description: 'Warm dark mode',
    family: 'sunset', dark: true, pairId: 'sunset',
    vars: {
      '--primary': '15 75% 58%', '--primary-foreground': '0 0% 5%',
      '--accent': '42 80% 55%', '--accent-foreground': '0 0% 5%',
      '--secondary': '25 12% 18%', '--secondary-foreground': '25 12% 90%',
      '--background': '25 18% 7%', '--foreground': '25 10% 92%',
      '--card': '25 15% 10%', '--card-foreground': '25 10% 92%',
      '--popover': '25 15% 10%', '--popover-foreground': '25 10% 92%',
      '--muted': '25 12% 14%', '--muted-foreground': '25 8% 55%',
      '--destructive': '0 62% 40%', '--destructive-foreground': '0 0% 95%',
      '--border': '25 12% 18%', '--input': '25 12% 18%',
      '--sidebar-background': '25 18% 5%', '--sidebar-accent': '25 14% 10%',
      '--sidebar-foreground': '25 15% 90%',
      '--chart-1': '15 75% 60%', '--chart-2': '42 80% 55%',
      '--chart-3': '340 60% 60%', '--chart-4': '190 70% 55%', '--chart-5': '152 55% 50%',
    },
  },
];

/** Convert hex (#RRGGBB) to HSL string "H S% L%" */
function hexToHsl(hex: string): string {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) return '';
  let r = parseInt(result[1], 16) / 255;
  let g = parseInt(result[2], 16) / 255;
  let b = parseInt(result[3], 16) / 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h = 0, s = 0;
  const l = (max + min) / 2;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
      case g: h = ((b - r) / d + 2) / 6; break;
      case b: h = ((r - g) / d + 4) / 6; break;
    }
  }
  return `${Math.round(h * 360)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`;
}

export function loadGoogleFont(fontName: string) {
  const id = `gfont-${fontName.replace(/\s+/g, '-')}`;
  if (document.getElementById(id)) return;
  const link = document.createElement('link');
  link.id = id;
  link.rel = 'stylesheet';
  link.href = `https://fonts.googleapis.com/css2?family=${encodeURIComponent(fontName)}:wght@300;400;500;600;700&display=swap`;
  document.head.appendChild(link);
}

export function getThemeFamily(themeId: string): string {
  return THEMES.find(t => t.id === themeId)?.family ?? 'lavender';
}

interface BrandColors {
  primary_color: string | null;
  secondary_color: string | null;
  accent_color: string | null;
  apply_to_ui: boolean;
  font_heading: string | null;
  font_body: string | null;
}

interface ThemeContextType {
  activeTheme: string;
  setTheme: (familyId: string) => void;
  themes: ThemeDefinition[];
  families: ThemeFamily[];
  refreshBrand: () => void;
  isDark: boolean;
  toggleDarkMode: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [activeTheme, setActiveTheme] = useState('lavender');
  const [brandColors, setBrandColors] = useState<BrandColors | null>(null);

  function loadBrand() {
    if (!user) return;
    supabase.from('brand_profiles').select('primary_color, secondary_color, accent_color, apply_to_ui, font_heading, font_body')
      .eq('owner_user_id', user.id).maybeSingle()
      .then(({ data }) => {
        if (data) setBrandColors(data as BrandColors);
      });
  }

  useEffect(() => {
    if (!user) return;
    supabase.from('profiles').select('active_theme').eq('owner_user_id', user.id).maybeSingle()
      .then(({ data }) => {
        if (data?.active_theme) {
          const old = data.active_theme;
          // Map old themes
          const validIds = THEMES.map(t => t.id);
          if (validIds.includes(old)) {
            setActiveTheme(old);
          } else if (old.startsWith('dark-')) {
            setActiveTheme('dark-lavender');
          } else {
            setActiveTheme('lavender');
          }
        }
      });
    loadBrand();
  }, [user]);

  const currentTheme = THEMES.find(t => t.id === activeTheme);
  const isDark = currentTheme?.dark ?? false;

  // Apply theme CSS vars
  useEffect(() => {
    if (!currentTheme) return;
    const root = document.documentElement;
    if (currentTheme.dark) { root.classList.add('dark'); } else { root.classList.remove('dark'); }

    Object.entries(currentTheme.vars).forEach(([key, value]) => {
      root.style.setProperty(key, value);
    });

    root.style.setProperty('--ring', currentTheme.vars['--primary']);
    root.style.setProperty('--sidebar-primary', currentTheme.vars['--primary']);
    root.style.setProperty('--sidebar-ring', currentTheme.vars['--primary']);
    root.style.setProperty('--sidebar-primary-foreground', '0 0% 100%');
    root.style.setProperty('--sidebar-accent-foreground', currentTheme.vars['--sidebar-foreground'] || currentTheme.vars['--foreground']);
    root.style.setProperty('--sidebar-border', currentTheme.vars['--border']);
  }, [activeTheme, currentTheme]);

  // Apply brand color overrides
  useEffect(() => {
    if (!brandColors?.apply_to_ui) return;
    const root = document.documentElement;
    if (brandColors.primary_color) {
      const hsl = hexToHsl(brandColors.primary_color);
      if (hsl) { root.style.setProperty('--primary', hsl); root.style.setProperty('--ring', hsl); root.style.setProperty('--sidebar-primary', hsl); root.style.setProperty('--sidebar-ring', hsl); }
    }
    if (brandColors.accent_color) { const hsl = hexToHsl(brandColors.accent_color); if (hsl) root.style.setProperty('--accent', hsl); }
    if (brandColors.secondary_color) { const hsl = hexToHsl(brandColors.secondary_color); if (hsl) root.style.setProperty('--secondary', hsl); }
  }, [brandColors, activeTheme]);

  // Apply brand fonts
  useEffect(() => {
    if (!brandColors) return;
    const root = document.documentElement;
    if (brandColors.font_heading) {
      loadGoogleFont(brandColors.font_heading);
      root.style.setProperty('--font-heading', `"${brandColors.font_heading}"`);
    }
    if (brandColors.font_body) {
      loadGoogleFont(brandColors.font_body);
      root.style.setProperty('--font-body', `"${brandColors.font_body}"`);
    }
  }, [brandColors]);

  function persistTheme(themeId: string) {
    setActiveTheme(themeId);
    if (user) {
      supabase.from('profiles').update({ active_theme: themeId }).eq('owner_user_id', user.id);
    }
  }

  /** Set theme by family name - picks light or dark variant based on current isDark state */
  function setTheme(familyId: string) {
    const wantDark = isDark;
    const match = THEMES.find(t => t.family === familyId && (wantDark ? t.dark : !t.dark));
    if (match) persistTheme(match.id);
  }

  function toggleDarkMode() {
    const family = getThemeFamily(activeTheme);
    const pair = THEMES.find(t => t.family === family && (isDark ? !t.dark : t.dark));
    if (pair) persistTheme(pair.id);
  }

  function refreshBrand() { loadBrand(); }

  return (
    <ThemeContext.Provider value={{ activeTheme, setTheme, themes: THEMES, families: THEME_FAMILIES, refreshBrand, isDark, toggleDarkMode }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) throw new Error('useTheme must be used within ThemeProvider');
  return context;
}
