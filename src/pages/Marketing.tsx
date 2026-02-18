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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Megaphone, Plus, Calendar, Mail, Lightbulb, Sparkles, Copy, Check } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

const WEEKLY_TEMPLATES = [
  { day: 'Monday', action: 'Post market insight on LinkedIn', platform: 'LinkedIn', type: 'content' },
  { day: 'Tuesday', action: 'Follow up 3 warm leads via email', platform: 'Email', type: 'outreach' },
  { day: 'Wednesday', action: 'Share listing photo on Instagram', platform: 'Instagram', type: 'content' },
  { day: 'Thursday', action: 'Attend networking event or BNI', platform: 'In-person', type: 'networking' },
  { day: 'Friday', action: 'Send weekly newsletter to database', platform: 'Email', type: 'email' },
];

const CONTENT_IDEAS = [
  { title: 'Market Update', desc: 'Share latest NZ business sale stats & trends', tags: ['LinkedIn', 'Blog'] },
  { title: 'Success Story', desc: 'Client testimonial or recent deal closure', tags: ['LinkedIn', 'Instagram'] },
  { title: 'Valuation Tips', desc: 'How business owners can prepare for sale', tags: ['Blog', 'Email'] },
  { title: 'Industry Spotlight', desc: 'Sector analysis (hospitality, retail, etc.)', tags: ['LinkedIn', 'Newsletter'] },
  { title: 'Behind the Scenes', desc: 'A day in the life of a broker', tags: ['Instagram', 'TikTok'] },
];

const GOAL_TYPES = [
  'New listing launch', 'Listing just sold', 'Buyer wanted',
  'Vendor lead generation', 'Brand awareness', 'Educational for sellers',
  'Educational for buyers', 'Testimonial or case study', 'Behind the scenes',
];

const STYLE_MODES = [
  { id: 'direct', label: 'Direct and punchy' },
  { id: 'educational', label: 'Educational and credible' },
  { id: 'personal', label: 'Personal story' },
  { id: 'market_update', label: 'Market update' },
];

const CTA_OPTIONS = [
  'Enquire now', 'Book a call', 'Download info pack', 'Join buyer list',
];

const PLATFORMS = ['LinkedIn', 'Instagram', 'Facebook', 'TikTok', 'YouTube'];

export default function MarketingPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [plans, setPlans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Post builder state
  const [selectedGoal, setSelectedGoal] = useState('');
  const [selectedStyle, setSelectedStyle] = useState('direct');
  const [selectedCta, setSelectedCta] = useState('Enquire now');
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>(['LinkedIn']);
  const [listingName, setListingName] = useState('');
  const [websiteUrl, setWebsiteUrl] = useState('');
  const [generating, setGenerating] = useState(false);
  const [generatedPost, setGeneratedPost] = useState<any>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!user) return;
    supabase.from('marketing_plans').select('*').eq('owner_user_id', user.id)
      .then(({ data }) => { setPlans(data ?? []); setLoading(false); });
  }, [user]);

  function togglePlatform(p: string) {
    setSelectedPlatforms(prev =>
      prev.includes(p) ? prev.filter(x => x !== p) : [...prev, p]
    );
  }

  async function handleGeneratePost() {
    if (!selectedGoal) {
      toast({ title: 'Select a goal type first', variant: 'destructive' });
      return;
    }
    setGenerating(true);
    setGeneratedPost(null);

    // Build prompt for local generation (template-based for now)
    const style = STYLE_MODES.find(s => s.id === selectedStyle)?.label || 'Direct';
    const platform = selectedPlatforms[0] || 'LinkedIn';

    // Template-based post generation
    const hooks: Record<string, string[]> = {
      'New listing launch': [
        `🔥 Just Listed: ${listingName || 'Exciting new opportunity'}`,
        `📢 New to Market — ${listingName || 'Premium business for sale'}`,
      ],
      'Listing just sold': [
        `✅ SOLD — ${listingName || 'Another successful deal closed'}`,
        `🎉 Congratulations to our vendor! ${listingName || 'Deal done.'}`,
      ],
      'Buyer wanted': [
        `🔍 Looking for the right buyer for ${listingName || 'a fantastic opportunity'}`,
        `💼 Could this be your next move? ${listingName || 'Business for sale'}`,
      ],
      'Vendor lead generation': [
        `Thinking about selling your business? Here's what you need to know.`,
        `Is 2026 the year to sell? Let's talk.`,
      ],
      'Brand awareness': [
        `Why top vendors choose to work with us.`,
        `What makes a great business broker? Here's our approach.`,
      ],
      'Educational for sellers': [
        `3 things every business owner should do before listing.`,
        `How to maximise your sale price — a step-by-step guide.`,
      ],
      'Educational for buyers': [
        `Buying a business in NZ? Here's your checklist.`,
        `5 questions to ask before making an offer.`,
      ],
      'Testimonial or case study': [
        `"Best decision we ever made" — hear from our latest client.`,
        `Case Study: How we achieved 15% above asking price.`,
      ],
      'Behind the scenes': [
        `A day in the life of a business broker 🤝`,
        `What really happens behind a business sale.`,
      ],
    };

    const hookOptions = hooks[selectedGoal] || [`Check out this ${selectedGoal.toLowerCase()}`];
    const hook = hookOptions[Math.floor(Math.random() * hookOptions.length)];

    const bodies: Record<string, string> = {
      direct: `This is an incredible opportunity you don't want to miss. Strong revenue, loyal customer base, and growth potential. Serious enquiries only.`,
      educational: `In the current NZ market, businesses with strong systems and recurring revenue are attracting premium multiples. Here's what makes this one stand out and what buyers should look for.`,
      personal: `I remember the first time I walked through this business. The owner had built something truly special over 15 years. Now it's time for someone new to take the reins.`,
      market_update: `The NZ business sales market is showing resilience in 2026. Transaction volumes are up 12% year-on-year, and well-prepared vendors are achieving strong multiples. Here's what that means for you.`,
    };

    const body = bodies[selectedStyle] || bodies.direct;
    const hashtags = platform === 'LinkedIn'
      ? '#BusinessForSale #NZBusiness #BusinessBroker #Entrepreneurship'
      : platform === 'Instagram'
        ? '#businessforsale #nzbusiness #entrepreneur #smallbusiness #investment'
        : '#business #forsale #opportunity';

    const post = {
      platform,
      hook,
      body,
      cta: `👉 ${selectedCta} — link in bio or DM me directly.`,
      hashtags,
      imageIdea: selectedGoal.includes('sold') ? 'Photo of handshake or "SOLD" overlay on listing image' :
        selectedGoal.includes('Behind') ? 'Candid photo at desk or site visit' :
          'High-quality listing photo or branded template graphic',
      videoScript: (platform === 'TikTok' || platform === 'Instagram') ?
        `[0-3s] Hook: "${hook}"\n[3-10s] Show the key highlights — walk-through or stats overlay\n[10-15s] CTA: "${selectedCta}" with text overlay` : null,
    };

    setGeneratedPost(post);
    setGenerating(false);

    // Log to audit
    if (user) {
      supabase.from('audit_logs').insert({
        owner_user_id: user.id,
        event_type: 'post_generated',
        details: { goal: selectedGoal, style: selectedStyle, platform },
      });
    }
  }

  function handleCopy() {
    if (!generatedPost) return;
    const text = `${generatedPost.hook}\n\n${generatedPost.body}\n\n${generatedPost.cta}\n\n${generatedPost.hashtags}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast({ title: 'Copied to clipboard' });
  }

  return (
    <>
      <PageHeader
        title="Marketing Planner"
        description="Content calendar, post builder, and campaigns aligned to your sales goals"
      />

      <Tabs defaultValue="builder">
        <TabsList className="mb-4">
          <TabsTrigger value="builder">Post Builder</TabsTrigger>
          <TabsTrigger value="weekly">Weekly Actions</TabsTrigger>
          <TabsTrigger value="content">Content Ideas</TabsTrigger>
          <TabsTrigger value="campaigns">Email Campaigns</TabsTrigger>
        </TabsList>

        {/* Post Builder */}
        <TabsContent value="builder">
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Left: Inputs */}
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle className="text-lg font-heading flex items-center gap-2">
                  <Sparkles size={18} className="text-primary" />
                  Generate a Post
                </CardTitle>
                <CardDescription>Select your goal, style, and platform to generate copy</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Listing Name (optional)</Label>
                  <Input placeholder="e.g. Café & Restaurant - Ponsonby" value={listingName} onChange={e => setListingName(e.target.value)} />
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
                  <Select value={selectedStyle} onValueChange={setSelectedStyle}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {STYLE_MODES.map(s => (
                        <SelectItem key={s.id} value={s.id}>{s.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
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
                  {generating ? 'Generating...' : <><Sparkles size={16} className="mr-1.5" /> Generate Post</>}
                </Button>
              </CardContent>
            </Card>

            {/* Right: Output */}
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle className="text-lg font-heading">Generated Post</CardTitle>
              </CardHeader>
              <CardContent>
                {!generatedPost ? (
                  <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground">
                    <Megaphone size={32} className="mb-3 opacity-50" />
                    <p className="text-sm">Select your options and generate a post</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <Badge variant="secondary">{generatedPost.platform}</Badge>
                    <div className="space-y-3 text-sm">
                      <div>
                        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">Hook</p>
                        <p className="font-medium">{generatedPost.hook}</p>
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">Main Copy</p>
                        <p className="text-muted-foreground">{generatedPost.body}</p>
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">CTA</p>
                        <p>{generatedPost.cta}</p>
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">Hashtags</p>
                        <p className="text-xs text-primary">{generatedPost.hashtags}</p>
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">Image Idea</p>
                        <p className="text-xs text-muted-foreground italic">{generatedPost.imageIdea}</p>
                      </div>
                      {generatedPost.videoScript && (
                        <div>
                          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">Short Video Script</p>
                          <pre className="text-xs text-muted-foreground whitespace-pre-wrap bg-muted/50 rounded-lg p-3">{generatedPost.videoScript}</pre>
                        </div>
                      )}
                    </div>
                    <Button variant="outline" size="sm" onClick={handleCopy} className="w-full">
                      {copied ? <><Check size={14} className="mr-1.5" /> Copied!</> : <><Copy size={14} className="mr-1.5" /> Copy to Clipboard</>}
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Weekly Actions */}
        <TabsContent value="weekly">
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="text-lg font-heading flex items-center gap-2">
                <Calendar size={18} className="text-primary" />
                Weekly Marketing Routine
              </CardTitle>
              <CardDescription>Consistent actions aligned with your pipeline goals</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {WEEKLY_TEMPLATES.map((item, i) => (
                  <div key={i} className="flex items-center justify-between rounded-lg border border-border p-3 hover:bg-muted/30 transition-colors">
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-semibold text-muted-foreground w-20">{item.day}</span>
                      <span className="text-sm">{item.action}</span>
                    </div>
                    <Badge variant="secondary" className="text-xs">{item.platform}</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Content Ideas */}
        <TabsContent value="content">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {CONTENT_IDEAS.map((idea, i) => (
              <Card key={i} className="shadow-card hover:shadow-md transition-shadow">
                <CardContent className="pt-5">
                  <div className="flex items-start gap-3">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-accent/10">
                      <Lightbulb size={16} className="text-accent" />
                    </div>
                    <div className="space-y-1.5">
                      <p className="text-sm font-medium">{idea.title}</p>
                      <p className="text-xs text-muted-foreground">{idea.desc}</p>
                      <div className="flex gap-1.5 flex-wrap">
                        {idea.tags.map(tag => (
                          <Badge key={tag} variant="outline" className="text-xs">{tag}</Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Email Campaigns */}
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
