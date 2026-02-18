import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

export interface ThemeDefinition {
  id: string;
  name: string;
  description: string;
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
];

interface ThemeContextType {
  activeTheme: string;
  setTheme: (themeId: string) => void;
  themes: ThemeDefinition[];
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [activeTheme, setActiveTheme] = useState('teal-warm');

  useEffect(() => {
    if (!user) return;
    supabase.from('profiles').select('active_theme').eq('owner_user_id', user.id).maybeSingle()
      .then(({ data }) => {
        if (data?.active_theme) setActiveTheme(data.active_theme);
      });
  }, [user]);

  useEffect(() => {
    const theme = THEMES.find(t => t.id === activeTheme);
    if (!theme) return;
    const root = document.documentElement;
    Object.entries(theme.vars).forEach(([key, value]) => {
      root.style.setProperty(key, value);
    });
    // Also update related vars
    root.style.setProperty('--ring', theme.vars['--primary']);
    root.style.setProperty('--sidebar-primary', theme.vars['--primary']);
    root.style.setProperty('--sidebar-ring', theme.vars['--primary']);
    // Update sidebar foreground based on brightness
    const isDarkSidebar = theme.vars['--sidebar-background'] !== '0 0% 100%';
    if (isDarkSidebar) {
      root.style.setProperty('--sidebar-foreground', '40 20% 90%');
      root.style.setProperty('--sidebar-primary-foreground', '0 0% 100%');
      root.style.setProperty('--sidebar-accent-foreground', '40 20% 90%');
      root.style.setProperty('--sidebar-border', theme.vars['--sidebar-accent']);
    } else {
      root.style.setProperty('--sidebar-foreground', '220 20% 14%');
      root.style.setProperty('--sidebar-primary-foreground', '0 0% 100%');
      root.style.setProperty('--sidebar-accent-foreground', '220 20% 14%');
      root.style.setProperty('--sidebar-border', '220 13% 92%');
    }
  }, [activeTheme]);

  function setTheme(themeId: string) {
    setActiveTheme(themeId);
    if (user) {
      supabase.from('profiles').update({ active_theme: themeId }).eq('owner_user_id', user.id);
    }
  }

  return (
    <ThemeContext.Provider value={{ activeTheme, setTheme, themes: THEMES }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) throw new Error('useTheme must be used within ThemeProvider');
  return context;
}
