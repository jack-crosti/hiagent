import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { PageHeader } from '@/components/PageHeader';
import { EmptyState } from '@/components/EmptyState';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Megaphone, Plus, Calendar, Mail, Lightbulb } from 'lucide-react';

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

export default function MarketingPage() {
  const { user } = useAuth();
  const [plans, setPlans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    supabase.from('marketing_plans').select('*').eq('owner_user_id', user.id)
      .then(({ data }) => { setPlans(data ?? []); setLoading(false); });
  }, [user]);

  return (
    <>
      <PageHeader
        title="Marketing Planner"
        description="Content calendar and campaigns aligned to your sales goals"
      />

      <Tabs defaultValue="weekly">
        <TabsList className="mb-4">
          <TabsTrigger value="weekly">Weekly Actions</TabsTrigger>
          <TabsTrigger value="content">Content Ideas</TabsTrigger>
          <TabsTrigger value="campaigns">Email Campaigns</TabsTrigger>
        </TabsList>

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
