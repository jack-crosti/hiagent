import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Link } from 'react-router-dom';
import { AlertTriangle, X } from 'lucide-react';

export function SetupBanner() {
  const { user } = useAuth();
  const [show, setShow] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if (!user) return;
    supabase
      .from('setup_state')
      .select('is_complete, skipped')
      .eq('owner_user_id', user.id)
      .maybeSingle()
      .then(({ data }) => {
        if (data && !data.is_complete) setShow(true);
      });
  }, [user]);

  if (!show || dismissed) return null;

  return (
    <div className="flex items-center gap-3 bg-warning/10 border-b border-warning/20 px-4 py-2.5 text-sm">
      <AlertTriangle size={16} className="text-warning shrink-0" />
      <span className="flex-1 text-foreground">
        Finish setup to personalise branding and reports.
      </span>
      <Link
        to="/customization"
        className="font-medium text-primary hover:underline shrink-0"
      >
        Resume
      </Link>
      <button onClick={() => setDismissed(true)} className="text-muted-foreground hover:text-foreground">
        <X size={14} />
      </button>
    </div>
  );
}
