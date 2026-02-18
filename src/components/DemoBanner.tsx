import { useDemo, TOUR_STEPS } from '@/contexts/DemoContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { X, ChevronRight, ChevronLeft, Eye, Info } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export function DemoBanner() {
  const { isDemoMode, exitDemo, tourStep, setTourStep, showTour, setShowTour } = useDemo();
  const navigate = useNavigate();

  if (!isDemoMode) return null;

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
