import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

interface UserTypeContextType {
  userType: string | null;
  isAgent: boolean;
  isBroker: boolean;
  loading: boolean;
}

const UserTypeContext = createContext<UserTypeContextType>({
  userType: null, isAgent: true, isBroker: false, loading: true,
});

export function UserTypeProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [userType, setUserType] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) { setLoading(false); return; }
    supabase.from('profiles').select('user_type').eq('owner_user_id', user.id).maybeSingle()
      .then(({ data }) => {
        setUserType(data?.user_type ?? null);
        setLoading(false);
      });
  }, [user]);

  const isBroker = userType === 'business_broker';
  const isAgent = !isBroker;

  return (
    <UserTypeContext.Provider value={{ userType, isAgent, isBroker, loading }}>
      {children}
    </UserTypeContext.Provider>
  );
}

export function useUserType() {
  return useContext(UserTypeContext);
}
