import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

export interface ThemeDefinition {
  id: string;
  name: string;
  description: string;
  dark?: boolean;
  /** The corresponding light/dark pair id */
  pairId?: string;
  vars: Record<string, string>;
}

/**
 * Each "color family" has a light + dark variant.
 * The sidebar selector only shows light IDs;
 * toggling dark mode swaps to the paired dark variant.
 */
export const THEMES: ThemeDefinition[] = [
  // ──────────── LIGHT THEMES ────────────
  {
    id: 'teal-warm',
    name: 'Teal & Warm',
    description: 'Friendly teal with warm sand tones',
    pairId: 'dark-teal',
    vars: {
      '--primary': '174 58% 39%',
      '--primary-foreground': '0 0% 100%',
      '--accent': '12 76% 61%',
      '--accent-foreground': '0 0% 100%',
      '--secondary': '36 33% 92%',
      '--secondary-foreground': '220 20% 14%',
      '--background': '40 33% 97%',
      '--foreground': '220 20% 14%',
      '--card': '0 0% 100%',
      '--card-foreground': '220 20% 14%',
      '--popover': '0 0% 100%',
      '--popover-foreground': '220 20% 14%',
      '--muted': '40 20% 94%',
      '--muted-foreground': '220 10% 42%',
      '--border': '220 13% 88%',
      '--input': '220 13% 88%',
      '--destructive': '0 72% 51%',
      '--destructive-foreground': '0 0% 100%',
      '--sidebar-background': '174 30% 15%',
      '--sidebar-accent': '174 25% 22%',
      // Chart colors — vivid, high contrast on white
      '--chart-1': '174 58% 39%',
      '--chart-2': '12 76% 55%',
      '--chart-3': '38 92% 50%',
      '--chart-4': '260 50% 55%',
      '--chart-5': '330 65% 50%',
    },
  },
  {
    id: 'ocean-blue',
    name: 'Ocean Blue',
    description: 'Professional blue with golden accents',
    pairId: 'dark-blue',
    vars: {
      '--primary': '210 80% 45%',
      '--primary-foreground': '0 0% 100%',
      '--accent': '38 92% 50%',
      '--accent-foreground': '0 0% 100%',
      '--secondary': '210 25% 92%',
      '--secondary-foreground': '210 30% 12%',
      '--background': '210 25% 97%',
      '--foreground': '210 30% 12%',
      '--card': '0 0% 100%',
      '--card-foreground': '210 30% 12%',
      '--popover': '0 0% 100%',
      '--popover-foreground': '210 30% 12%',
      '--muted': '210 20% 93%',
      '--muted-foreground': '210 15% 40%',
      '--border': '210 15% 86%',
      '--input': '210 15% 86%',
      '--destructive': '0 72% 51%',
      '--destructive-foreground': '0 0% 100%',
      '--sidebar-background': '210 35% 12%',
      '--sidebar-accent': '210 30% 18%',
      '--chart-1': '210 80% 45%',
      '--chart-2': '38 92% 50%',
      '--chart-3': '160 55% 40%',
      '--chart-4': '340 60% 55%',
      '--chart-5': '280 45% 55%',
    },
  },
  {
    id: 'forest-green',
    name: 'Forest Green',
    description: 'Earthy green with amber highlights',
    pairId: 'dark-green',
    vars: {
      '--primary': '152 56% 32%',
      '--primary-foreground': '0 0% 100%',
      '--accent': '24 85% 52%',
      '--accent-foreground': '0 0% 100%',
      '--secondary': '90 20% 91%',
      '--secondary-foreground': '150 25% 12%',
      '--background': '80 18% 96%',
      '--foreground': '150 25% 12%',
      '--card': '60 15% 99%',
      '--card-foreground': '150 25% 12%',
      '--popover': '60 15% 99%',
      '--popover-foreground': '150 25% 12%',
      '--muted': '80 15% 92%',
      '--muted-foreground': '150 12% 38%',
      '--border': '150 12% 85%',
      '--input': '150 12% 85%',
      '--destructive': '0 72% 51%',
      '--destructive-foreground': '0 0% 100%',
      '--sidebar-background': '150 30% 10%',
      '--sidebar-accent': '150 25% 16%',
      '--chart-1': '152 56% 35%',
      '--chart-2': '24 85% 52%',
      '--chart-3': '200 60% 45%',
      '--chart-4': '340 55% 50%',
      '--chart-5': '52 75% 45%',
    },
  },
  {
    id: 'royal-purple',
    name: 'Royal Purple',
    description: 'Rich purple with rose gold accents',
    pairId: 'dark-purple',
    vars: {
      '--primary': '270 55% 48%',
      '--primary-foreground': '0 0% 100%',
      '--accent': '340 65% 55%',
      '--accent-foreground': '0 0% 100%',
      '--secondary': '270 20% 92%',
      '--secondary-foreground': '270 30% 12%',
      '--background': '270 15% 97%',
      '--foreground': '270 30% 12%',
      '--card': '280 10% 100%',
      '--card-foreground': '270 30% 12%',
      '--popover': '280 10% 100%',
      '--popover-foreground': '270 30% 12%',
      '--muted': '270 12% 92%',
      '--muted-foreground': '270 12% 40%',
      '--border': '270 12% 86%',
      '--input': '270 12% 86%',
      '--destructive': '0 72% 51%',
      '--destructive-foreground': '0 0% 100%',
      '--sidebar-background': '270 35% 10%',
      '--sidebar-accent': '270 30% 16%',
      '--chart-1': '270 55% 50%',
      '--chart-2': '340 65% 55%',
      '--chart-3': '38 80% 50%',
      '--chart-4': '170 55% 40%',
      '--chart-5': '210 60% 50%',
    },
  },
  {
    id: 'sunset-coral',
    name: 'Sunset Coral',
    description: 'Vibrant coral with teal accents',
    pairId: 'dark-coral',
    vars: {
      '--primary': '12 76% 48%',
      '--primary-foreground': '0 0% 100%',
      '--accent': '174 58% 36%',
      '--accent-foreground': '0 0% 100%',
      '--secondary': '20 35% 92%',
      '--secondary-foreground': '15 30% 12%',
      '--background': '20 30% 97%',
      '--foreground': '15 30% 12%',
      '--card': '15 20% 99%',
      '--card-foreground': '15 30% 12%',
      '--popover': '15 20% 99%',
      '--popover-foreground': '15 30% 12%',
      '--muted': '20 22% 92%',
      '--muted-foreground': '15 15% 38%',
      '--border': '20 15% 85%',
      '--input': '20 15% 85%',
      '--destructive': '0 72% 51%',
      '--destructive-foreground': '0 0% 100%',
      '--sidebar-background': '15 35% 10%',
      '--sidebar-accent': '15 30% 16%',
      '--chart-1': '12 76% 50%',
      '--chart-2': '174 58% 39%',
      '--chart-3': '38 85% 50%',
      '--chart-4': '260 50% 55%',
      '--chart-5': '330 60% 52%',
    },
  },

  // ──────────── DARK THEMES ────────────
  {
    id: 'dark-teal',
    name: 'Dark Teal',
    description: 'Dark mode with teal accents',
    dark: true,
    pairId: 'teal-warm',
    vars: {
      '--primary': '174 60% 50%',
      '--primary-foreground': '0 0% 5%',
      '--accent': '12 80% 65%',
      '--accent-foreground': '0 0% 5%',
      '--secondary': '180 10% 18%',
      '--secondary-foreground': '174 15% 90%',
      '--background': '180 15% 7%',
      '--foreground': '174 10% 92%',
      '--card': '180 12% 10%',
      '--card-foreground': '174 10% 92%',
      '--popover': '180 12% 10%',
      '--popover-foreground': '174 10% 92%',
      '--muted': '180 10% 15%',
      '--muted-foreground': '174 10% 60%',
      '--destructive': '0 62% 40%',
      '--destructive-foreground': '0 0% 95%',
      '--border': '180 10% 18%',
      '--input': '180 10% 18%',
      '--sidebar-background': '180 15% 5%',
      '--sidebar-accent': '180 12% 12%',
      '--chart-1': '174 65% 55%',
      '--chart-2': '12 80% 65%',
      '--chart-3': '38 85% 60%',
      '--chart-4': '270 50% 65%',
      '--chart-5': '330 60% 60%',
    },
  },
  {
    id: 'dark-blue',
    name: 'Dark Blue',
    description: 'Dark mode with ocean blue accents',
    dark: true,
    pairId: 'ocean-blue',
    vars: {
      '--primary': '210 85% 58%',
      '--primary-foreground': '0 0% 5%',
      '--accent': '38 92% 58%',
      '--accent-foreground': '0 0% 5%',
      '--secondary': '215 15% 18%',
      '--secondary-foreground': '210 20% 90%',
      '--background': '215 25% 7%',
      '--foreground': '210 15% 92%',
      '--card': '215 22% 10%',
      '--card-foreground': '210 15% 92%',
      '--popover': '215 22% 10%',
      '--popover-foreground': '210 15% 92%',
      '--muted': '215 15% 15%',
      '--muted-foreground': '210 12% 58%',
      '--destructive': '0 62% 40%',
      '--destructive-foreground': '0 0% 95%',
      '--border': '215 15% 18%',
      '--input': '215 15% 18%',
      '--sidebar-background': '215 25% 5%',
      '--sidebar-accent': '215 18% 12%',
      '--chart-1': '210 85% 60%',
      '--chart-2': '38 92% 60%',
      '--chart-3': '160 60% 50%',
      '--chart-4': '340 60% 60%',
      '--chart-5': '280 50% 62%',
    },
  },
  {
    id: 'dark-green',
    name: 'Dark Green',
    description: 'Dark mode with forest green accents',
    dark: true,
    pairId: 'forest-green',
    vars: {
      '--primary': '152 55% 45%',
      '--primary-foreground': '0 0% 5%',
      '--accent': '24 85% 60%',
      '--accent-foreground': '0 0% 5%',
      '--secondary': '150 12% 18%',
      '--secondary-foreground': '150 15% 90%',
      '--background': '150 18% 7%',
      '--foreground': '150 10% 92%',
      '--card': '150 15% 10%',
      '--card-foreground': '150 10% 92%',
      '--popover': '150 15% 10%',
      '--popover-foreground': '150 10% 92%',
      '--muted': '150 10% 15%',
      '--muted-foreground': '150 10% 58%',
      '--destructive': '0 62% 40%',
      '--destructive-foreground': '0 0% 95%',
      '--border': '150 10% 18%',
      '--input': '150 10% 18%',
      '--sidebar-background': '150 18% 5%',
      '--sidebar-accent': '150 12% 12%',
      '--chart-1': '152 55% 50%',
      '--chart-2': '24 85% 60%',
      '--chart-3': '200 65% 55%',
      '--chart-4': '340 55% 60%',
      '--chart-5': '52 70% 55%',
    },
  },
  {
    id: 'dark-purple',
    name: 'Dark Purple',
    description: 'Dark mode with royal purple accents',
    dark: true,
    pairId: 'royal-purple',
    vars: {
      '--primary': '270 55% 62%',
      '--primary-foreground': '0 0% 5%',
      '--accent': '340 65% 62%',
      '--accent-foreground': '0 0% 5%',
      '--secondary': '270 12% 18%',
      '--secondary-foreground': '270 12% 90%',
      '--background': '270 20% 7%',
      '--foreground': '270 8% 92%',
      '--card': '270 18% 10%',
      '--card-foreground': '270 8% 92%',
      '--popover': '270 18% 10%',
      '--popover-foreground': '270 8% 92%',
      '--muted': '270 12% 15%',
      '--muted-foreground': '270 8% 58%',
      '--destructive': '0 62% 40%',
      '--destructive-foreground': '0 0% 95%',
      '--border': '270 12% 18%',
      '--input': '270 12% 18%',
      '--sidebar-background': '270 20% 5%',
      '--sidebar-accent': '270 15% 12%',
      '--chart-1': '270 55% 65%',
      '--chart-2': '340 65% 62%',
      '--chart-3': '38 80% 58%',
      '--chart-4': '170 55% 50%',
      '--chart-5': '210 60% 58%',
    },
  },
  {
    id: 'dark-coral',
    name: 'Dark Coral',
    description: 'Dark mode with coral accents',
    dark: true,
    pairId: 'sunset-coral',
    vars: {
      '--primary': '12 80% 58%',
      '--primary-foreground': '0 0% 5%',
      '--accent': '174 60% 48%',
      '--accent-foreground': '0 0% 5%',
      '--secondary': '15 12% 18%',
      '--secondary-foreground': '15 15% 90%',
      '--background': '15 18% 7%',
      '--foreground': '15 10% 92%',
      '--card': '15 15% 10%',
      '--card-foreground': '15 10% 92%',
      '--popover': '15 15% 10%',
      '--popover-foreground': '15 10% 92%',
      '--muted': '15 10% 15%',
      '--muted-foreground': '15 8% 58%',
      '--destructive': '0 62% 40%',
      '--destructive-foreground': '0 0% 95%',
      '--border': '15 10% 18%',
      '--input': '15 10% 18%',
      '--sidebar-background': '15 18% 5%',
      '--sidebar-accent': '15 12% 12%',
      '--chart-1': '12 80% 62%',
      '--chart-2': '174 60% 50%',
      '--chart-3': '38 85% 58%',
      '--chart-4': '260 50% 62%',
      '--chart-5': '330 60% 58%',
    },
  },
];

/** Build maps from pairId for light↔dark switching */
const DARK_MAP: Record<string, string> = {};
const LIGHT_MAP: Record<string, string> = {};
THEMES.forEach(t => {
  if (!t.dark && t.pairId) DARK_MAP[t.id] = t.pairId;
  if (t.dark && t.pairId) LIGHT_MAP[t.id] = t.pairId;
});

/** Get the light base id for any theme */
export function getLightBase(themeId: string): string {
  return LIGHT_MAP[themeId] || themeId;
}

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

interface BrandColors {
  primary_color: string | null;
  secondary_color: string | null;
  accent_color: string | null;
  apply_to_ui: boolean;
}

interface ThemeContextType {
  activeTheme: string;
  setTheme: (themeId: string) => void;
  /** Set theme by light base id — automatically resolves to dark variant if dark mode is on */
  setColorFamily: (lightId: string) => void;
  themes: ThemeDefinition[];
  refreshBrand: () => void;
  isDark: boolean;
  toggleDarkMode: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [activeTheme, setActiveTheme] = useState('teal-warm');
  const [brandColors, setBrandColors] = useState<BrandColors | null>(null);

  function loadBrand() {
    if (!user) return;
    supabase.from('brand_profiles').select('primary_color, secondary_color, accent_color, apply_to_ui')
      .eq('owner_user_id', user.id).maybeSingle()
      .then(({ data }) => {
        if (data) setBrandColors(data as BrandColors);
      });
  }

  useEffect(() => {
    if (!user) return;
    supabase.from('profiles').select('active_theme').eq('owner_user_id', user.id).maybeSingle()
      .then(({ data }) => {
        if (data?.active_theme) setActiveTheme(data.active_theme);
      });
    loadBrand();
  }, [user]);

  const currentTheme = THEMES.find(t => t.id === activeTheme);
  const isDark = currentTheme?.dark ?? false;

  // Apply theme CSS vars
  useEffect(() => {
    if (!currentTheme) return;
    const root = document.documentElement;

    if (currentTheme.dark) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }

    // Apply ALL vars from the theme definition
    Object.entries(currentTheme.vars).forEach(([key, value]) => {
      root.style.setProperty(key, value);
    });

    // Mirror ring/sidebar primary
    root.style.setProperty('--ring', currentTheme.vars['--primary']);
    root.style.setProperty('--sidebar-primary', currentTheme.vars['--primary']);
    root.style.setProperty('--sidebar-ring', currentTheme.vars['--primary']);

    // Sidebar text colors
    if (currentTheme.dark) {
      root.style.setProperty('--sidebar-foreground', currentTheme.vars['--foreground']);
      root.style.setProperty('--sidebar-primary-foreground', '0 0% 100%');
      root.style.setProperty('--sidebar-accent-foreground', currentTheme.vars['--foreground']);
      root.style.setProperty('--sidebar-border', currentTheme.vars['--border']);
    } else {
      // Light themes always have a dark sidebar
      root.style.setProperty('--sidebar-foreground', '0 0% 92%');
      root.style.setProperty('--sidebar-primary-foreground', '0 0% 100%');
      root.style.setProperty('--sidebar-accent-foreground', '0 0% 88%');
      root.style.setProperty('--sidebar-border', currentTheme.vars['--sidebar-accent']);
    }
  }, [activeTheme, currentTheme]);

  // Overlay brand custom colors
  useEffect(() => {
    if (!brandColors?.apply_to_ui) return;
    const root = document.documentElement;
    if (brandColors.primary_color) {
      const hsl = hexToHsl(brandColors.primary_color);
      if (hsl) {
        root.style.setProperty('--primary', hsl);
        root.style.setProperty('--ring', hsl);
        root.style.setProperty('--sidebar-primary', hsl);
        root.style.setProperty('--sidebar-ring', hsl);
      }
    }
    if (brandColors.accent_color) {
      const hsl = hexToHsl(brandColors.accent_color);
      if (hsl) root.style.setProperty('--accent', hsl);
    }
    if (brandColors.secondary_color) {
      const hsl = hexToHsl(brandColors.secondary_color);
      if (hsl) root.style.setProperty('--secondary', hsl);
    }
  }, [brandColors, activeTheme]);

  function persistTheme(themeId: string) {
    setActiveTheme(themeId);
    if (user) {
      supabase.from('profiles').update({ active_theme: themeId }).eq('owner_user_id', user.id);
    }
  }

  /** Set theme directly by id */
  function setTheme(themeId: string) {
    persistTheme(themeId);
  }

  /** Set theme by light family id — resolves to dark variant if currently dark */
  function setColorFamily(lightId: string) {
    if (isDark) {
      persistTheme(DARK_MAP[lightId] || lightId);
    } else {
      persistTheme(lightId);
    }
  }

  function toggleDarkMode() {
    if (isDark) {
      persistTheme(LIGHT_MAP[activeTheme] || 'teal-warm');
    } else {
      persistTheme(DARK_MAP[activeTheme] || 'dark-teal');
    }
  }

  function refreshBrand() {
    loadBrand();
  }

  return (
    <ThemeContext.Provider value={{ activeTheme, setTheme, setColorFamily, themes: THEMES, refreshBrand, isDark, toggleDarkMode }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) throw new Error('useTheme must be used within ThemeProvider');
  return context;
}
