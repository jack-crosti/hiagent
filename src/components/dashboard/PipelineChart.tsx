import { useMemo } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface Deal {
  listing_name: string | null;
  deal_type: string;
  net_to_user_after_tax: number | null;
  probability: number | null;
}

const CHART_COLORS = [
  'hsl(var(--chart-1))',
  'hsl(var(--chart-2))',
  'hsl(var(--chart-3))',
  'hsl(var(--chart-4))',
  'hsl(var(--chart-5))',
];

export function PipelineChart({ deals }: { deals: Deal[] }) {
  const data = useMemo(() => {
    return deals.map(d => ({
      name: d.listing_name ?? 'Unnamed',
      value: Math.round(Number(d.net_to_user_after_tax ?? 0) * Number(d.probability ?? 0)),
    })).filter(d => d.value > 0);
  }, [deals]);

  if (data.length === 0) return null;

  return (
    <Card className="shadow-card">
      <CardHeader>
        <CardTitle className="text-lg font-heading">Pipeline by Deal</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={90}
                paddingAngle={3}
                dataKey="value"
              >
                {data.map((_, i) => (
                  <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                formatter={(value: number) =>
                  new Intl.NumberFormat('en-NZ', { style: 'currency', currency: 'NZD', maximumFractionDigits: 0 }).format(value)
                }
                contentStyle={{
                  borderRadius: 8,
                  border: '1px solid hsl(var(--border))',
                  background: 'hsl(var(--card))',
                  color: 'hsl(var(--card-foreground))',
                }}
                labelStyle={{ color: 'hsl(var(--card-foreground))' }}
              />
              <Legend wrapperStyle={{ color: 'hsl(var(--foreground))' }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
