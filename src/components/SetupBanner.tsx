import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { AlertTriangle, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function SetupBanner() {
  const { user } = useAuth();
  const navigate = useNavigate();
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
        // Show banner if setup was skipped but not completed
        if (data && data.skipped && !data.is_complete) setShow(true);
      });
  }, [user]);

  if (!show || dismissed) return null;

  return (
    <div className="flex items-center gap-3 bg-warning/10 border-b border-warning/20 px-4 py-2.5 text-sm">
      <AlertTriangle size={16} className="text-warning shrink-0" />
      <span className="flex-1 text-foreground">
        Complete setup to enable correct commission calculations and branding
      </span>
      <Button
        size="sm"
        variant="outline"
        className="shrink-0 h-7 text-xs"
        onClick={() => navigate('/settings')}
      >
        Finish setup
      </Button>
      <button onClick={() => setDismissed(true)} className="text-muted-foreground hover:text-foreground">
        <X size={14} />
      </button>
    </div>
  );
}
