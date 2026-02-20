import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { PageHeader } from '@/components/PageHeader';
import { EmptyState } from '@/components/EmptyState';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import {
  Megaphone, Plus, Calendar, Mail, Lightbulb, Sparkles, Copy, Check,
  Smile, BriefcaseBusiness, Wand2, RefreshCw, Palette, Zap, ChevronDown, ChevronUp, X, Clock, ListChecks
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

const GOAL_TYPES = [
  'New listing launch', 'Listing just sold', 'Buyer wanted',
  'Vendor lead generation', 'Brand awareness', 'Educational for sellers',
  'Educational for buyers', 'Testimonial or case study', 'Behind the scenes',
  'Open home promotion', 'Price reduction', 'Market commentary',
];

const STYLE_MODES = [
  { id: 'direct', label: 'Direct & punchy', icon: Zap },
  { id: 'educational', label: 'Educational & credible', icon: Lightbulb },
  { id: 'personal', label: 'Personal story', icon: Smile },
  { id: 'market_update', label: 'Market update', icon: Palette },
  { id: 'urgency', label: 'Urgency & scarcity', icon: RefreshCw },
  { id: 'aspirational', label: 'Aspirational & lifestyle', icon: Sparkles },
];

const CTA_OPTIONS = [
  'Enquire now', 'Book a call', 'Download info pack', 'Join buyer list',
  'Register interest', 'DM me for details', 'Visit open home', 'Get a free appraisal',
  'View listing', 'Contact me today',
];

const PLATFORMS = ['LinkedIn', 'Instagram', 'Facebook', 'TikTok', 'YouTube', 'X (Twitter)'];

const PLAN_FREQUENCIES = ['Daily', '3x per week', 'Weekly', 'Fortnightly'];

const PLAN_GOALS = [
  'Generate seller leads', 'Attract buyers', 'Build personal brand',
  'Promote active listings', 'Grow social following', 'Nurture database',
];

const CONTENT_TOPICS = [
  'Market trends & data', 'Buyer tips', 'Seller preparation', 'Investment insights',
  'Success stories', 'Local area guides', 'Property styling', 'Finance & mortgages',
  'First home buyers', 'Commercial property', 'Auction tips', 'Behind the scenes',
];

const CONTENT_FORMATS = [
  { id: 'blog', label: 'Blog Post' },
  { id: 'video', label: 'Video' },
  { id: 'carousel', label: 'Carousel' },
  { id: 'infographic', label: 'Infographic' },
  { id: 'story', label: 'Story/Reel' },
];

export default function MarketingPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [plans, setPlans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Global preferences
  const [includeEmojis, setIncludeEmojis] = useState(true);
  const [tone, setTone] = useState<'professional' | 'casual'>('professional');
  const [styleInstructions, setStyleInstructions] = useState('');
  const [userType, setUserType] = useState<string | null>(null);

  // Post builder state
  const [selectedGoal, setSelectedGoal] = useState('');
  const [selectedStyle, setSelectedStyle] = useState('direct');
  const [selectedCta, setSelectedCta] = useState('Enquire now');
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>(['LinkedIn']);
  const [listingName, setListingName] = useState('');
  const [listingUrl, setListingUrl] = useState('');
  const [generating, setGenerating] = useState(false);
  const [generatedPosts, setGeneratedPosts] = useState<any[]>([]);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  // Weekly/Monthly plan state
  const [planType, setPlanType] = useState<'weekly' | 'monthly'>('weekly');
  const [planPlatform, setPlanPlatform] = useState('LinkedIn');
  const [planFrequency, setPlanFrequency] = useState('3x per week');
  const [planGoals, setPlanGoals] = useState<string[]>([]);
  const [generatingPlan, setGeneratingPlan] = useState(false);
  const [generatedPlan, setGeneratedPlan] = useState<any>(null);

  // Content ideas state
  const [selectedTopics, setSelectedTopics] = useState<string[]>([]);
  const [customTopic, setCustomTopic] = useState('');
  const [generatingContent, setGeneratingContent] = useState(false);
  const [generatedIdeas, setGeneratedIdeas] = useState<any[]>([]);

  // Expandable idea state
  const [expandedIdeaIndex, setExpandedIdeaIndex] = useState<number | null>(null);
  const [expandedIdeaDetail, setExpandedIdeaDetail] = useState<any>(null);
  const [expandingIdea, setExpandingIdea] = useState(false);

  useEffect(() => {
    if (!user) return;
    Promise.all([
      supabase.from('marketing_plans').select('*').eq('owner_user_id', user.id),
      supabase.from('profiles').select('user_type').eq('owner_user_id', user.id).maybeSingle(),
    ]).then(([plansRes, profileRes]) => {
      setPlans(plansRes.data ?? []);
      setUserType(profileRes.data?.user_type ?? null);
      setLoading(false);
    });
  }, [user]);

  function togglePlatform(p: string) {
    setSelectedPlatforms(prev =>
      prev.includes(p) ? prev.filter(x => x !== p) : [...prev, p]
    );
  }

  function togglePlanGoal(g: string) {
    setPlanGoals(prev => prev.includes(g) ? prev.filter(x => x !== g) : [...prev, g]);
  }

  function toggleTopic(t: string) {
    setSelectedTopics(prev => prev.includes(t) ? prev.filter(x => x !== t) : [...prev, t]);
  }

  async function callMarketingAI(action: string, params: any) {
    const { data, error } = await supabase.functions.invoke('marketing-ai', {
      body: { action, params: { ...params, includeEmojis, tone, styleInstructions: styleInstructions.trim() || undefined, userType: userType || undefined } },
    });
    if (error) throw new Error(error.message || 'AI request failed');
    if (data?.error) throw new Error(data.error);
    return data.result;
  }

  async function handleGeneratePost() {
    if (!selectedGoal) {
      toast({ title: 'Select a goal type first', variant: 'destructive' });
      return;
    }
    setGenerating(true);
    setGeneratedPosts([]);
    try {
      const style = STYLE_MODES.find(s => s.id === selectedStyle)?.label || 'Direct';
      const posts: any[] = [];
      for (const platform of selectedPlatforms) {
        const result = await callMarketingAI('generate_post', {
          goal: selectedGoal, style, cta: selectedCta,
          platforms: [platform], listingName, listingUrl,
        });
        posts.push({ ...result, platform });
      }
      setGeneratedPosts(posts);
    } catch (err: any) {
      toast({ title: 'Generation failed', description: err.message, variant: 'destructive' });
    } finally {
      setGenerating(false);
    }
  }

  async function handleGeneratePlan() {
    if (planGoals.length === 0) {
      toast({ title: 'Select at least one goal', variant: 'destructive' });
      return;
    }
    setGeneratingPlan(true);
    setGeneratedPlan(null);
    try {
      const result = await callMarketingAI('generate_plan', {
        planType, platform: planPlatform,
        frequency: planFrequency, goals: planGoals.join(', '),
      });
      setGeneratedPlan(result);
    } catch (err: any) {
      toast({ title: 'Generation failed', description: err.message, variant: 'destructive' });
    } finally {
      setGeneratingPlan(false);
    }
  }

  async function handleGenerateContentIdeas() {
    if (selectedTopics.length === 0 && !customTopic.trim()) {
      toast({ title: 'Select topics or add a custom one', variant: 'destructive' });
      return;
    }
    setGeneratingContent(true);
    setGeneratedIdeas([]);
    setExpandedIdeaIndex(null);
    setExpandedIdeaDetail(null);
    try {
      const result = await callMarketingAI('generate_content_ideas', {
        topics: selectedTopics, customTopic: customTopic.trim(),
      });
      setGeneratedIdeas(result.ideas || []);
    } catch (err: any) {
      toast({ title: 'Generation failed', description: err.message, variant: 'destructive' });
    } finally {
      setGeneratingContent(false);
    }
  }

  async function handleExpandIdea(index: number) {
    if (expandedIdeaIndex === index) {
      setExpandedIdeaIndex(null);
      setExpandedIdeaDetail(null);
      return;
    }
    setExpandedIdeaIndex(index);
    setExpandedIdeaDetail(null);
    setExpandingIdea(true);
    try {
      const idea = generatedIdeas[index];
      const result = await callMarketingAI('expand_content_idea', { idea });
      setExpandedIdeaDetail(result);
    } catch (err: any) {
      toast({ title: 'Failed to expand idea', description: err.message, variant: 'destructive' });
      setExpandedIdeaIndex(null);
    } finally {
      setExpandingIdea(false);
    }
  }

  function handleCopy(index: number) {
    const post = generatedPosts[index];
    if (!post) return;
    const text = `${post.hook}\n\n${post.body}\n\n${post.cta}\n\n${post.hashtags}`;
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
    toast({ title: 'Copied to clipboard' });
  }

  const typeColors: Record<string, string> = {
    content: 'bg-primary/10 text-primary',
    outreach: 'bg-accent/10 text-accent',
    networking: 'bg-secondary text-secondary-foreground',
    email: 'bg-muted text-muted-foreground',
  };

  const difficultyColors: Record<string, string> = {
    easy: 'bg-green-500/10 text-green-700 dark:text-green-400',
    medium: 'bg-yellow-500/10 text-yellow-700 dark:text-yellow-400',
    advanced: 'bg-red-500/10 text-red-700 dark:text-red-400',
  };

  function renderPlanActions(actions: any[]) {
    return actions.map((item: any, i: number) => (
      <div key={i} className="flex items-start justify-between rounded-lg border border-border p-3 hover:bg-muted/30 transition-colors">
        <div className="flex items-start gap-3 flex-1">
          <span className="text-xs font-semibold text-muted-foreground w-24 shrink-0 pt-0.5">{item.day}</span>
          <div className="space-y-1">
            <span className="text-sm font-medium">{item.task}</span>
            {item.details && <p className="text-xs text-muted-foreground">{item.details}</p>}
          </div>
        </div>
        <div className="flex gap-1.5 shrink-0 ml-2">
          <Badge variant="secondary" className="text-xs">{item.platform}</Badge>
          {item.type && (
            <Badge className={cn('text-xs', typeColors[item.type] || 'bg-muted text-muted-foreground')}>
              {item.type}
            </Badge>
          )}
        </div>
      </div>
    ));
  }

  return (
    <>
      <PageHeader
        title="Marketing Planner"
        description="AI-powered content, weekly routines, and campaigns aligned to your goals"
      />

      {/* Global Preferences Bar */}
      <Card className="shadow-card mb-6">
        <CardContent className="py-3 flex flex-wrap items-center gap-6">
          <div className="flex items-center gap-2">
            <Smile size={16} className="text-muted-foreground" />
            <Label htmlFor="emoji-toggle" className="text-sm cursor-pointer">Include Emojis</Label>
            <Switch id="emoji-toggle" checked={includeEmojis} onCheckedChange={setIncludeEmojis} />
          </div>
          <div className="flex items-center gap-2">
            <BriefcaseBusiness size={16} className="text-muted-foreground" />
            <Label className="text-sm">Tone</Label>
            <div className="flex rounded-lg border border-border overflow-hidden">
              <button
                onClick={() => setTone('professional')}
                className={cn('px-3 py-1 text-xs font-medium transition-colors',
                  tone === 'professional' ? 'bg-primary text-primary-foreground' : 'bg-card text-muted-foreground hover:bg-muted')}
              >Professional</button>
              <button
                onClick={() => setTone('casual')}
                className={cn('px-3 py-1 text-xs font-medium transition-colors',
                  tone === 'casual' ? 'bg-primary text-primary-foreground' : 'bg-card text-muted-foreground hover:bg-muted')}
              >Casual</button>
           </div>
          </div>
          <div className="flex items-start gap-2 w-full sm:w-auto sm:flex-1">
            <Textarea
              placeholder="e.g. Always use our brand name 'Elite Realty'. Keep sentences under 15 words. Reference NZ market trends."
              value={styleInstructions}
              onChange={e => setStyleInstructions(e.target.value)}
              className="min-h-[36px] h-9 text-xs resize-none"
              rows={1}
            />
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="builder">
        <TabsList className="mb-4">
          <TabsTrigger value="builder">Post Builder</TabsTrigger>
          <TabsTrigger value="weekly">Weekly Actions</TabsTrigger>
          <TabsTrigger value="content">Content Ideas</TabsTrigger>
          <TabsTrigger value="campaigns">Email Campaigns</TabsTrigger>
        </TabsList>

        {/* ===== Post Builder ===== */}
        <TabsContent value="builder">
          <div className="grid gap-6 lg:grid-cols-2">
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle className="text-lg font-heading flex items-center gap-2">
                  <Sparkles size={18} className="text-primary" />
                  AI Post Generator
                </CardTitle>
                <CardDescription>Select your goal, style, and platform — AI writes the copy</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Listing Name (optional)</Label>
                  <Input placeholder="e.g. 3-bed Villa — Ponsonby" value={listingName} onChange={e => setListingName(e.target.value)} />
                </div>

                <div className="space-y-2">
                  <Label>Listing URL (optional)</Label>
                  <Input placeholder="https://www.realestate.co.nz/..." value={listingUrl} onChange={e => setListingUrl(e.target.value)} />
                  <p className="text-xs text-muted-foreground">Paste a listing link and the AI will extract property details automatically</p>
                </div>

                <div className="space-y-2">
                  <Label>Goal Type</Label>
                  <div className="flex flex-wrap gap-2">
                    {GOAL_TYPES.map(g => (
                      <button key={g} onClick={() => setSelectedGoal(g)}
                        className={cn('rounded-full border px-3 py-1.5 text-xs font-medium transition-colors',
                          selectedGoal === g ? 'border-primary bg-primary/10 text-primary' : 'border-border text-muted-foreground hover:border-primary/40')}>
                        {g}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Style</Label>
                  <div className="grid grid-cols-2 gap-2">
                    {STYLE_MODES.map(s => {
                      const Icon = s.icon;
                      return (
                        <button key={s.id} onClick={() => setSelectedStyle(s.id)}
                          className={cn('flex items-center gap-2 rounded-lg border px-3 py-2 text-xs font-medium transition-colors text-left',
                            selectedStyle === s.id ? 'border-primary bg-primary/10 text-primary' : 'border-border text-muted-foreground hover:border-primary/40')}>
                          <Icon size={14} />
                          {s.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>CTA</Label>
                  <Select value={selectedCta} onValueChange={setSelectedCta}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {CTA_OPTIONS.map(c => (
                        <SelectItem key={c} value={c}>{c}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Platforms</Label>
                  <div className="flex flex-wrap gap-2">
                    {PLATFORMS.map(p => (
                      <button key={p} onClick={() => togglePlatform(p)}
                        className={cn('rounded-full border px-3 py-1.5 text-xs font-medium transition-colors',
                          selectedPlatforms.includes(p) ? 'border-primary bg-primary/10 text-primary' : 'border-border text-muted-foreground hover:border-primary/40')}>
                        {p}
                      </button>
                    ))}
                  </div>
                </div>

                <Button onClick={handleGeneratePost} disabled={generating} className="w-full">
                  {generating ? <><RefreshCw size={16} className="mr-1.5 animate-spin" /> Generating...</> : <><Wand2 size={16} className="mr-1.5" /> Generate with AI</>}
                </Button>
              </CardContent>
            </Card>

            {/* Output */}
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle className="text-lg font-heading">Generated Post</CardTitle>
              </CardHeader>
              <CardContent>
                {generatedPosts.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground">
                    <Megaphone size={32} className="mb-3 opacity-50" />
                    <p className="text-sm">Select your options and generate a post</p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {generatedPosts.map((post, i) => (
                      <div key={i} className="space-y-4 border-b border-border pb-5 last:border-0 last:pb-0">
                        <Badge variant="secondary">{post.platform}</Badge>
                        {post.propertyDetails && (
                          <div className="rounded-lg bg-muted/50 px-3 py-2 text-xs text-muted-foreground">
                            <span className="font-semibold">Property Details:</span> {post.propertyDetails}
                          </div>
                        )}
                        <div className="space-y-3 text-sm">
                          {[
                            { label: 'Hook', value: post.hook, bold: true },
                            { label: 'Main Copy', value: post.body },
                            { label: 'CTA', value: post.cta },
                            { label: 'Hashtags', value: post.hashtags, className: 'text-primary' },
                            { label: 'Image Idea', value: post.imageIdea, className: 'italic text-muted-foreground' },
                          ].map(item => item.value && (
                            <div key={item.label}>
                              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">{item.label}</p>
                              <p className={cn(item.bold && 'font-medium', item.className)}>{item.value}</p>
                            </div>
                          ))}
                          {post.videoScript && (
                            <div>
                              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">Video Script</p>
                              <pre className="text-xs text-muted-foreground whitespace-pre-wrap bg-muted/50 rounded-lg p-3">{post.videoScript}</pre>
                            </div>
                          )}
                        </div>
                        <Button variant="outline" size="sm" onClick={() => handleCopy(i)} className="w-full">
                          {copiedIndex === i ? <><Check size={14} className="mr-1.5" /> Copied!</> : <><Copy size={14} className="mr-1.5" /> Copy to Clipboard</>}
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* ===== Weekly Actions / Marketing Routine ===== */}
        <TabsContent value="weekly">
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Preferences */}
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle className="text-lg font-heading flex items-center gap-2">
                  <Calendar size={18} className="text-primary" />
                  Plan Preferences
                </CardTitle>
                <CardDescription>Set your preferences and let AI generate your routine</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Plan Type</Label>
                  <div className="flex rounded-lg border border-border overflow-hidden">
                    <button onClick={() => setPlanType('weekly')}
                      className={cn('flex-1 px-4 py-2 text-sm font-medium transition-colors',
                        planType === 'weekly' ? 'bg-primary text-primary-foreground' : 'bg-card text-muted-foreground hover:bg-muted')}>
                      Weekly
                    </button>
                    <button onClick={() => setPlanType('monthly')}
                      className={cn('flex-1 px-4 py-2 text-sm font-medium transition-colors',
                        planType === 'monthly' ? 'bg-primary text-primary-foreground' : 'bg-card text-muted-foreground hover:bg-muted')}>
                      Monthly
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Primary Platform</Label>
                  <Select value={planPlatform} onValueChange={setPlanPlatform}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {PLATFORMS.map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Posting Frequency</Label>
                  <Select value={planFrequency} onValueChange={setPlanFrequency}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {PLAN_FREQUENCIES.map(f => <SelectItem key={f} value={f}>{f}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Goals</Label>
                  <div className="flex flex-wrap gap-2">
                    {PLAN_GOALS.map(g => (
                      <button key={g} onClick={() => togglePlanGoal(g)}
                        className={cn('rounded-full border px-3 py-1.5 text-xs font-medium transition-colors',
                          planGoals.includes(g) ? 'border-primary bg-primary/10 text-primary' : 'border-border text-muted-foreground hover:border-primary/40')}>
                        {g}
                      </button>
                    ))}
                  </div>
                </div>

                <Button onClick={handleGeneratePlan} disabled={generatingPlan} className="w-full">
                  {generatingPlan ? <><RefreshCw size={16} className="mr-1.5 animate-spin" /> Generating...</> : <><Wand2 size={16} className="mr-1.5" /> Generate {planType} Plan</>}
                </Button>
              </CardContent>
            </Card>

            {/* Generated Plan */}
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle className="text-lg font-heading">
                  {generatedPlan?.title || 'Your Marketing Routine'}
                </CardTitle>
                {generatedPlan?.summary && <CardDescription>{generatedPlan.summary}</CardDescription>}
              </CardHeader>
              <CardContent>
                {!generatedPlan ? (
                  <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground">
                    <Calendar size={32} className="mb-3 opacity-50" />
                    <p className="text-sm">Set your preferences and generate a plan</p>
                  </div>
                ) : generatedPlan.weeks ? (
                  <div className="space-y-5">
                    {generatedPlan.weeks.map((week: any, wi: number) => (
                      <div key={wi} className="space-y-2">
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-semibold text-foreground">{week.week}</h4>
                          {week.theme && <span className="text-xs text-muted-foreground">— {week.theme}</span>}
                        </div>
                        {renderPlanActions(week.actions || [])}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-2">
                    {renderPlanActions(generatedPlan.actions || [])}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* ===== Content Ideas / AI Builder ===== */}
        <TabsContent value="content">
          <div className="space-y-6">
            {/* Topic selector */}
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle className="text-lg font-heading flex items-center gap-2">
                  <Lightbulb size={18} className="text-primary" />
                  AI Content Generator
                </CardTitle>
                <CardDescription>Pick topics or add your own — AI creates structured content ideas. Click any idea to get a detailed execution plan.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Select Topics</Label>
                  <div className="flex flex-wrap gap-2">
                    {CONTENT_TOPICS.map(t => (
                      <button key={t} onClick={() => toggleTopic(t)}
                        className={cn('rounded-full border px-3 py-1.5 text-xs font-medium transition-colors',
                          selectedTopics.includes(t) ? 'border-primary bg-primary/10 text-primary' : 'border-border text-muted-foreground hover:border-primary/40')}>
                        {t}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Custom Topic (optional)</Label>
                  <Input placeholder="e.g. Downsizing tips for retirees" value={customTopic} onChange={e => setCustomTopic(e.target.value)} />
                </div>

                <Button onClick={handleGenerateContentIdeas} disabled={generatingContent} className="w-full sm:w-auto">
                  {generatingContent ? <><RefreshCw size={16} className="mr-1.5 animate-spin" /> Generating...</> : <><Wand2 size={16} className="mr-1.5" /> Generate Ideas</>}
                </Button>
              </CardContent>
            </Card>

            {/* Generated ideas */}
            {generatedIdeas.length > 0 && (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {generatedIdeas.map((idea, i) => (
                  <div key={i}>
                    <Card
                      className={cn(
                        "shadow-card hover:shadow-md transition-shadow cursor-pointer",
                        expandedIdeaIndex === i && "ring-2 ring-primary"
                      )}
                      onClick={() => handleExpandIdea(i)}
                    >
                      <CardContent className="pt-5 space-y-3">
                        <div className="flex items-start gap-3">
                          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                            <Lightbulb size={16} className="text-primary" />
                          </div>
                          <div className="space-y-1 flex-1">
                            <p className="text-sm font-medium">{idea.title}</p>
                            <p className="text-xs text-muted-foreground">{idea.description}</p>
                          </div>
                          <div className="shrink-0">
                            {expandedIdeaIndex === i ? (
                              <ChevronUp size={16} className="text-muted-foreground" />
                            ) : (
                              <ChevronDown size={16} className="text-muted-foreground" />
                            )}
                          </div>
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                          {(idea.platforms || []).map((p: string) => (
                            <Badge key={p} variant="outline" className="text-xs">{p}</Badge>
                          ))}
                          {idea.format && (
                            <Badge variant="secondary" className="text-xs capitalize">{idea.format}</Badge>
                          )}
                          {idea.difficulty && (
                            <Badge className={cn('text-xs', difficultyColors[idea.difficulty] || '')}>
                              {idea.difficulty}
                            </Badge>
                          )}
                        </div>
                      </CardContent>
                    </Card>

                    {/* Expanded detail panel */}
                    {expandedIdeaIndex === i && (
                      <Card className="mt-2 border-primary/30 bg-primary/5">
                        <CardContent className="pt-4 space-y-4">
                          {expandingIdea ? (
                            <div className="flex items-center justify-center py-8 text-muted-foreground">
                              <RefreshCw size={18} className="mr-2 animate-spin" />
                              <span className="text-sm">Generating execution plan...</span>
                            </div>
                          ) : expandedIdeaDetail ? (
                            <>
                              <div className="flex items-center justify-between">
                                <h4 className="text-sm font-semibold flex items-center gap-2">
                                  <ListChecks size={16} className="text-primary" />
                                  Execution Plan
                                </h4>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setExpandedIdeaIndex(null);
                                    setExpandedIdeaDetail(null);
                                  }}
                                >
                                  <X size={14} />
                                </Button>
                              </div>

                              {expandedIdeaDetail.executionSteps?.length > 0 && (
                                <div className="space-y-1.5">
                                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Steps</p>
                                  <ol className="list-decimal list-inside space-y-1 text-sm text-foreground">
                                    {expandedIdeaDetail.executionSteps.map((step: string, si: number) => (
                                      <li key={si}>{step}</li>
                                    ))}
                                  </ol>
                                </div>
                              )}

                              {expandedIdeaDetail.copyOutline && (
                                <div className="space-y-1">
                                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Copy / Script Outline</p>
                                  <p className="text-sm text-foreground whitespace-pre-wrap">{expandedIdeaDetail.copyOutline}</p>
                                </div>
                              )}

                              <div className="grid grid-cols-2 gap-3">
                                {expandedIdeaDetail.schedule && (
                                  <div className="space-y-1">
                                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Schedule</p>
                                    <p className="text-sm">{expandedIdeaDetail.schedule}</p>
                                  </div>
                                )}
                                {expandedIdeaDetail.estimatedTime && (
                                  <div className="space-y-1">
                                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1">
                                      <Clock size={12} /> Est. Time
                                    </p>
                                    <p className="text-sm">{expandedIdeaDetail.estimatedTime}</p>
                                  </div>
                                )}
                              </div>

                              {expandedIdeaDetail.formatTips && (
                                <div className="space-y-1">
                                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Format Tips</p>
                                  <p className="text-sm text-muted-foreground">{expandedIdeaDetail.formatTips}</p>
                                </div>
                              )}
                            </>
                          ) : null}
                        </CardContent>
                      </Card>
                    )}
                  </div>
                ))}
              </div>
            )}

            {generatedIdeas.length === 0 && !generatingContent && (
              <div className="text-center py-8 text-muted-foreground text-sm">
                Select topics above and click Generate to get AI-powered content ideas
              </div>
            )}
          </div>
        </TabsContent>

        {/* ===== Email Campaigns ===== */}
        <TabsContent value="campaigns">
          <EmptyState
            icon={Mail}
            title="Email campaigns coming soon"
            description="Connect your email provider to create automated campaigns tied to your deal pipeline and marketing calendar."
            action={<Button size="sm"><Plus size={16} className="mr-1.5" /> Connect Email</Button>}
          />
        </TabsContent>
      </Tabs>
    </>
  );
}
