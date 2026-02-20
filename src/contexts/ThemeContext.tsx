import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

export interface ThemeDefinition {
  id: string;
  name: string;
  description: string;
  dark?: boolean;
  pairId?: string;
  vars: Record<string, string>;
}

export const THEMES: ThemeDefinition[] = [
  {
    id: 'lavender',
    name: 'Lavender',
    description: 'Soft lavender with purple accents',
    pairId: 'dark-lavender',
    vars: {
      '--primary': '260 55% 55%',
      '--primary-foreground': '0 0% 100%',
      '--accent': '190 70% 50%',
      '--accent-foreground': '0 0% 100%',
      '--secondary': '260 20% 93%',
      '--secondary-foreground': '240 20% 14%',
      '--background': '260 20% 97%',
      '--foreground': '240 20% 14%',
      '--card': '260 15% 100%',
      '--card-foreground': '240 20% 14%',
      '--popover': '260 15% 100%',
      '--popover-foreground': '240 20% 14%',
      '--muted': '260 15% 93%',
      '--muted-foreground': '240 10% 42%',
      '--border': '260 12% 88%',
      '--input': '260 12% 88%',
      '--destructive': '0 72% 51%',
      '--destructive-foreground': '0 0% 100%',
      '--sidebar-background': '260 20% 95%',
      '--sidebar-accent': '260 18% 90%',
      '--chart-1': '260 55% 55%',
      '--chart-2': '190 70% 50%',
      '--chart-3': '38 92% 50%',
      '--chart-4': '340 60% 55%',
      '--chart-5': '152 56% 42%',
    },
  },
  {
    id: 'dark-lavender',
    name: 'Dark Lavender',
    description: 'Dark mode with lavender accents',
    dark: true,
    pairId: 'lavender',
    vars: {
      '--primary': '260 55% 62%',
      '--primary-foreground': '0 0% 5%',
      '--accent': '190 70% 55%',
      '--accent-foreground': '0 0% 5%',
      '--secondary': '260 12% 18%',
      '--secondary-foreground': '260 12% 90%',
      '--background': '260 20% 7%',
      '--foreground': '260 10% 92%',
      '--card': '260 18% 10%',
      '--card-foreground': '260 10% 92%',
      '--popover': '260 18% 10%',
      '--popover-foreground': '260 10% 92%',
      '--muted': '260 12% 15%',
      '--muted-foreground': '260 8% 58%',
      '--destructive': '0 62% 40%',
      '--destructive-foreground': '0 0% 95%',
      '--border': '260 12% 18%',
      '--input': '260 12% 18%',
      '--sidebar-background': '260 20% 5%',
      '--sidebar-accent': '260 15% 12%',
      '--chart-1': '260 55% 65%',
      '--chart-2': '190 70% 55%',
      '--chart-3': '38 85% 58%',
      '--chart-4': '340 60% 60%',
      '--chart-5': '152 55% 50%',
    },
  },
];

const DARK_MAP: Record<string, string> = {};
const LIGHT_MAP: Record<string, string> = {};
THEMES.forEach(t => {
  if (!t.dark && t.pairId) DARK_MAP[t.id] = t.pairId;
  if (t.dark && t.pairId) LIGHT_MAP[t.id] = t.pairId;
});

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
  themes: ThemeDefinition[];
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
        if (data?.active_theme) {
          // Map old themes to lavender
          const old = data.active_theme;
          const darkIds = ['dark-teal', 'dark-blue', 'dark-green', 'dark-purple', 'dark-coral'];
          if (darkIds.includes(old)) {
            setActiveTheme('dark-lavender');
          } else if (old === 'lavender' || old === 'dark-lavender') {
            setActiveTheme(old);
          } else {
            setActiveTheme('lavender');
          }
        }
      });
    loadBrand();
  }, [user]);

  const currentTheme = THEMES.find(t => t.id === activeTheme);
  const isDark = currentTheme?.dark ?? false;

  useEffect(() => {
    if (!currentTheme) return;
    const root = document.documentElement;

    if (currentTheme.dark) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }

    Object.entries(currentTheme.vars).forEach(([key, value]) => {
      root.style.setProperty(key, value);
    });

    root.style.setProperty('--ring', currentTheme.vars['--primary']);
    root.style.setProperty('--sidebar-primary', currentTheme.vars['--primary']);
    root.style.setProperty('--sidebar-ring', currentTheme.vars['--primary']);

    if (currentTheme.dark) {
      root.style.setProperty('--sidebar-foreground', currentTheme.vars['--foreground']);
      root.style.setProperty('--sidebar-primary-foreground', '0 0% 100%');
      root.style.setProperty('--sidebar-accent-foreground', currentTheme.vars['--foreground']);
      root.style.setProperty('--sidebar-border', currentTheme.vars['--border']);
    } else {
      root.style.setProperty('--sidebar-foreground', '240 20% 14%');
      root.style.setProperty('--sidebar-primary-foreground', '0 0% 100%');
      root.style.setProperty('--sidebar-accent-foreground', '240 15% 30%');
      root.style.setProperty('--sidebar-border', '260 12% 88%');
    }
  }, [activeTheme, currentTheme]);

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

  function setTheme(themeId: string) {
    persistTheme(themeId);
  }

  function toggleDarkMode() {
    if (isDark) {
      persistTheme('lavender');
    } else {
      persistTheme('dark-lavender');
    }
  }

  function refreshBrand() {
    loadBrand();
  }

  return (
    <ThemeContext.Provider value={{ activeTheme, setTheme, themes: THEMES, refreshBrand, isDark, toggleDarkMode }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) throw new Error('useTheme must be used within ThemeProvider');
  return context;
}
