import { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface Transaction {
  date: string;
  amount: number;
  type: string;
}

export function IncomeExpenseChart({ transactions }: { transactions: Transaction[] }) {
  const data = useMemo(() => {
    const months: Record<string, { month: string; income: number; expenses: number }> = {};

    transactions.forEach(t => {
      const d = new Date(t.date);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      const label = d.toLocaleDateString('en-NZ', { month: 'short', year: '2-digit' });
      if (!months[key]) months[key] = { month: label, income: 0, expenses: 0 };
      if (t.type === 'credit') months[key].income += Number(t.amount);
      else months[key].expenses += Math.abs(Number(t.amount));
    });

    return Object.entries(months)
      .sort(([a], [b]) => a.localeCompare(b))
      .slice(-6)
      .map(([, v]) => v);
  }, [transactions]);

  if (data.length === 0) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-heading">Income vs Expenses</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} barGap={8} barSize={28}>
              <XAxis dataKey="month" tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }} tickFormatter={v => `$${(v / 1000).toFixed(0)}k`} axisLine={false} tickLine={false} />
              <Tooltip
                formatter={(value: number) =>
                  new Intl.NumberFormat('en-NZ', { style: 'currency', currency: 'NZD', maximumFractionDigits: 0 }).format(value)
                }
                contentStyle={{
                  borderRadius: 12,
                  border: 'none',
                  background: 'hsl(var(--card))',
                  color: 'hsl(var(--card-foreground))',
                  boxShadow: '0 4px 20px -4px rgba(0,0,0,0.1)',
                }}
                labelStyle={{ color: 'hsl(var(--card-foreground))' }}
              />
              <Legend wrapperStyle={{ color: 'hsl(var(--foreground))' }} />
              <Bar dataKey="income" name="Income" fill="hsl(var(--primary))" radius={[8, 8, 0, 0]} />
              <Bar dataKey="expenses" name="Expenses" fill="hsl(var(--muted))" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
