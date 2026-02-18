import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

export interface ThemeDefinition {
  id: string;
  name: string;
  description: string;
  dark?: boolean;
  vars: Record<string, string>;
}

export const THEMES: ThemeDefinition[] = [
  {
    id: 'teal-warm',
    name: 'Teal & Warm',
    description: 'Default — friendly teal with warm sand tones',
    vars: {
      '--primary': '174 58% 39%',
      '--accent': '12 76% 61%',
      '--secondary': '36 33% 94%',
      '--background': '40 33% 98%',
      '--card': '0 0% 100%',
      '--sidebar-background': '0 0% 100%',
      '--sidebar-accent': '40 20% 96%',
    },
  },
  {
    id: 'ocean-blue',
    name: 'Ocean Blue',
    description: 'Professional blue with cool grey accents',
    vars: {
      '--primary': '210 80% 45%',
      '--accent': '38 92% 50%',
      '--secondary': '210 20% 94%',
      '--background': '210 20% 98%',
      '--card': '0 0% 100%',
      '--sidebar-background': '210 30% 12%',
      '--sidebar-accent': '210 25% 18%',
    },
  },
  {
    id: 'forest-green',
    name: 'Forest Green',
    description: 'Earthy green with warm amber highlights',
    vars: {
      '--primary': '152 56% 35%',
      '--accent': '24 85% 56%',
      '--secondary': '80 20% 93%',
      '--background': '80 15% 97%',
      '--card': '0 0% 100%',
      '--sidebar-background': '150 25% 10%',
      '--sidebar-accent': '150 20% 16%',
    },
  },
  {
    id: 'royal-purple',
    name: 'Royal Purple',
    description: 'Rich purple with rose gold accents',
    vars: {
      '--primary': '270 50% 50%',
      '--accent': '340 65% 60%',
      '--secondary': '270 15% 94%',
      '--background': '270 10% 98%',
      '--card': '0 0% 100%',
      '--sidebar-background': '270 30% 10%',
      '--sidebar-accent': '270 25% 16%',
    },
  },
  {
    id: 'sunset-coral',
    name: 'Sunset Coral',
    description: 'Vibrant coral with warm terracotta tones',
    vars: {
      '--primary': '12 76% 52%',
      '--accent': '174 58% 39%',
      '--secondary': '20 30% 94%',
      '--background': '20 25% 98%',
      '--card': '0 0% 100%',
      '--sidebar-background': '15 30% 10%',
      '--sidebar-accent': '15 25% 16%',
    },
  },
  // --- Dark themes ---
  {
    id: 'dark-teal',
    name: 'Dark Teal',
    description: 'Dark mode with teal accents',
    dark: true,
    vars: {
      '--primary': '174 58% 45%',
      '--primary-foreground': '220 20% 8%',
      '--accent': '12 76% 61%',
      '--accent-foreground': '0 0% 100%',
      '--secondary': '220 14% 16%',
      '--secondary-foreground': '40 20% 96%',
      '--background': '220 20% 8%',
      '--foreground': '40 20% 96%',
      '--card': '220 18% 11%',
      '--card-foreground': '40 20% 96%',
      '--popover': '220 18% 11%',
      '--popover-foreground': '40 20% 96%',
      '--muted': '220 14% 16%',
      '--muted-foreground': '220 10% 60%',
      '--destructive': '0 62% 30%',
      '--destructive-foreground': '40 20% 96%',
      '--border': '220 14% 18%',
      '--input': '220 14% 18%',
      '--sidebar-background': '220 20% 6%',
      '--sidebar-accent': '220 14% 14%',
    },
  },
  {
    id: 'dark-blue',
    name: 'Dark Blue',
    description: 'Dark mode with ocean blue accents',
    dark: true,
    vars: {
      '--primary': '210 80% 55%',
      '--primary-foreground': '220 20% 8%',
      '--accent': '38 92% 50%',
      '--accent-foreground': '0 0% 100%',
      '--secondary': '210 14% 16%',
      '--secondary-foreground': '210 20% 94%',
      '--background': '215 22% 8%',
      '--foreground': '210 20% 94%',
      '--card': '215 20% 11%',
      '--card-foreground': '210 20% 94%',
      '--popover': '215 20% 11%',
      '--popover-foreground': '210 20% 94%',
      '--muted': '215 14% 16%',
      '--muted-foreground': '210 10% 58%',
      '--destructive': '0 62% 30%',
      '--destructive-foreground': '210 20% 94%',
      '--border': '215 14% 18%',
      '--input': '215 14% 18%',
      '--sidebar-background': '215 22% 6%',
      '--sidebar-accent': '215 14% 14%',
    },
  },
  {
    id: 'dark-purple',
    name: 'Dark Purple',
    description: 'Dark mode with royal purple accents',
    dark: true,
    vars: {
      '--primary': '270 50% 60%',
      '--primary-foreground': '270 20% 8%',
      '--accent': '340 65% 60%',
      '--accent-foreground': '0 0% 100%',
      '--secondary': '270 14% 16%',
      '--secondary-foreground': '270 15% 94%',
      '--background': '270 18% 8%',
      '--foreground': '270 10% 94%',
      '--card': '270 16% 11%',
      '--card-foreground': '270 10% 94%',
      '--popover': '270 16% 11%',
      '--popover-foreground': '270 10% 94%',
      '--muted': '270 14% 16%',
      '--muted-foreground': '270 10% 58%',
      '--destructive': '0 62% 30%',
      '--destructive-foreground': '270 10% 94%',
      '--border': '270 14% 18%',
      '--input': '270 14% 18%',
      '--sidebar-background': '270 18% 6%',
      '--sidebar-accent': '270 14% 14%',
    },
  },
  {
    id: 'dark-midnight',
    name: 'Midnight',
    description: 'Pure dark with minimal contrast',
    dark: true,
    vars: {
      '--primary': '174 58% 45%',
      '--primary-foreground': '0 0% 5%',
      '--accent': '38 80% 55%',
      '--accent-foreground': '0 0% 100%',
      '--secondary': '0 0% 14%',
      '--secondary-foreground': '0 0% 90%',
      '--background': '0 0% 5%',
      '--foreground': '0 0% 92%',
      '--card': '0 0% 8%',
      '--card-foreground': '0 0% 92%',
      '--popover': '0 0% 8%',
      '--popover-foreground': '0 0% 92%',
      '--muted': '0 0% 14%',
      '--muted-foreground': '0 0% 55%',
      '--destructive': '0 62% 30%',
      '--destructive-foreground': '0 0% 92%',
      '--border': '0 0% 16%',
      '--input': '0 0% 16%',
      '--sidebar-background': '0 0% 4%',
      '--sidebar-accent': '0 0% 12%',
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

  // Apply base theme preset
  useEffect(() => {
    if (!currentTheme) return;
    const root = document.documentElement;

    // Toggle dark class
    if (currentTheme.dark) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }

    // Apply all vars from the theme
    Object.entries(currentTheme.vars).forEach(([key, value]) => {
      root.style.setProperty(key, value);
    });

    // Ring & sidebar primary always mirror --primary
    root.style.setProperty('--ring', currentTheme.vars['--primary']);
    root.style.setProperty('--sidebar-primary', currentTheme.vars['--primary']);
    root.style.setProperty('--sidebar-ring', currentTheme.vars['--primary']);

    // Sidebar foreground logic
    if (currentTheme.dark) {
      root.style.setProperty('--sidebar-foreground', '40 20% 90%');
      root.style.setProperty('--sidebar-primary-foreground', '0 0% 100%');
      root.style.setProperty('--sidebar-accent-foreground', '40 20% 90%');
      root.style.setProperty('--sidebar-border', currentTheme.vars['--sidebar-accent'] || '220 14% 14%');
    } else {
      const isDarkSidebar = currentTheme.vars['--sidebar-background'] !== '0 0% 100%';
      if (isDarkSidebar) {
        root.style.setProperty('--sidebar-foreground', '40 20% 90%');
        root.style.setProperty('--sidebar-primary-foreground', '0 0% 100%');
        root.style.setProperty('--sidebar-accent-foreground', '40 20% 90%');
        root.style.setProperty('--sidebar-border', currentTheme.vars['--sidebar-accent']);
      } else {
        root.style.setProperty('--sidebar-foreground', '220 20% 14%');
        root.style.setProperty('--sidebar-primary-foreground', '0 0% 100%');
        root.style.setProperty('--sidebar-accent-foreground', '220 20% 14%');
        root.style.setProperty('--sidebar-border', '220 13% 92%');
      }
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

  function setTheme(themeId: string) {
    setActiveTheme(themeId);
    if (user) {
      supabase.from('profiles').update({ active_theme: themeId }).eq('owner_user_id', user.id);
    }
  }

  function refreshBrand() {
    loadBrand();
  }

  return (
    <ThemeContext.Provider value={{ activeTheme, setTheme, themes: THEMES, refreshBrand, isDark }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) throw new Error('useTheme must be used within ThemeProvider');
  return context;
}
