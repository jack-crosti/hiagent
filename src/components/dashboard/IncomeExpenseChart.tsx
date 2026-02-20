import { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
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
    <Card className="shadow-card">
      <CardHeader>
        <CardTitle className="text-lg font-heading">Income vs Expenses</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} barGap={4}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="month" tick={{ fontSize: 12, fill: 'hsl(var(--foreground))' }} stroke="hsl(var(--border))" />
              <YAxis tick={{ fontSize: 12, fill: 'hsl(var(--foreground))' }} tickFormatter={v => `$${(v / 1000).toFixed(0)}k`} stroke="hsl(var(--border))" />
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
              <Bar dataKey="income" name="Income" fill="hsl(var(--chart-1))" radius={[4, 4, 0, 0]} />
              <Bar dataKey="expenses" name="Expenses" fill="hsl(var(--chart-2))" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
