import { useDemo, TOUR_STEPS } from '@/contexts/DemoContext';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { X, ChevronRight, ChevronLeft, Eye, Info, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { useState } from 'react';

export function DemoBanner() {
  const { isDemoMode, exitDemo, tourStep, setTourStep, showTour, setShowTour } = useDemo();
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [clearing, setClearing] = useState(false);

  if (!isDemoMode) return null;

  async function handleExitAndClear() {
    if (!user) { exitDemo(); return; }
    setClearing(true);
    try {
      const uid = user.id;
      await supabase.from('deals').delete().match({ owner_user_id: uid, is_demo: true });
      await supabase.from('transactions').delete().match({ owner_user_id: uid, is_demo: true });
      await supabase.from('gst_periods').delete().match({ owner_user_id: uid, is_demo: true });
      await supabase.from('goal_plans').delete().match({ owner_user_id: uid, is_demo: true });
      await supabase.from('commission_rules').delete().match({ owner_user_id: uid, is_demo: true });
      await supabase.from('categories').delete().match({ owner_user_id: uid, is_system: true });
      await supabase.from('bank_accounts').delete().match({ owner_user_id: uid, is_demo: true });
      toast({ title: 'Demo data cleared', description: 'Returned to your personal interface.' });
    } catch (err) {
      console.error('Clear demo error:', err);
    }
    setClearing(false);
    exitDemo();
    navigate('/');
  }

  const step = TOUR_STEPS[tourStep];

  return (
    <>
      {/* Fixed demo banner at top */}
      <div className="bg-accent text-accent-foreground px-4 py-2 flex items-center justify-between text-sm z-50">
        <div className="flex items-center gap-2">
          <Eye size={16} />
          <span className="font-medium">Demo Mode</span>
          <span className="hidden sm:inline">— Explore features with sample data. No changes are saved.</span>
        </div>
        <div className="flex items-center gap-2">
          {!showTour && (
            <Button size="sm" variant="ghost" className="h-7 text-accent-foreground hover:bg-accent-foreground/10" onClick={() => setShowTour(true)}>
              <Info size={14} className="mr-1" /> Tour
            </Button>
          )}
          <Button size="sm" variant="ghost" className="h-7 text-accent-foreground hover:bg-accent-foreground/10" onClick={handleExitAndClear} disabled={clearing}>
            <Trash2 size={14} className="mr-1" /> {clearing ? 'Clearing...' : 'Exit & Clear Data'}
          </Button>
          <Button size="sm" variant="ghost" className="h-7 text-accent-foreground hover:bg-accent-foreground/10" onClick={exitDemo}>
            <X size={14} className="mr-1" /> Exit Demo
          </Button>
        </div>
      </div>

      {/* Tour overlay */}
      {showTour && step && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-[90%] max-w-md">
          <Card className="shadow-float border-primary/30">
            <CardContent className="p-4">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <p className="text-xs text-muted-foreground">Step {tourStep + 1} of {TOUR_STEPS.length}</p>
                  <h3 className="font-heading font-semibold text-foreground">{step.title}</h3>
                </div>
                <Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={() => setShowTour(false)}>
                  <X size={14} />
                </Button>
              </div>
              <p className="text-sm text-muted-foreground mb-3">{step.description}</p>
              <div className="flex items-center justify-between">
                <div className="flex gap-1">
                  {TOUR_STEPS.map((_, i) => (
                    <div key={i} className={`h-1.5 rounded-full transition-all ${i === tourStep ? 'bg-primary w-6' : 'bg-muted w-2'}`} />
                  ))}
                </div>
                <div className="flex gap-1">
                  {tourStep > 0 && (
                    <Button size="sm" variant="outline" className="h-7" onClick={() => {
                      const prev = tourStep - 1;
                      setTourStep(prev);
                      navigate(TOUR_STEPS[prev].path);
                    }}>
                      <ChevronLeft size={14} />
                    </Button>
                  )}
                  {tourStep < TOUR_STEPS.length - 1 ? (
                    <Button size="sm" className="h-7" onClick={() => {
                      const next = tourStep + 1;
                      setTourStep(next);
                      navigate(TOUR_STEPS[next].path);
                    }}>
                      Next <ChevronRight size={14} className="ml-1" />
                    </Button>
                  ) : (
                    <Button size="sm" className="h-7" onClick={() => { setShowTour(false); }}>
                      Finish Tour
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </>
  );
}
