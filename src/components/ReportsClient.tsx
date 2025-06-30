"use client";

import { useEffect, useState, useMemo } from 'react';
import { getUsageStats } from '@/lib/storage';
import type { AppUsageStat } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts';
import { ChartContainer, ChartTooltipContent } from '@/components/ui/chart';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Info } from 'lucide-react';

interface AggregatedData {
  appName: string;
  totalDuration: number;
}

export default function ReportsClient() {
  const [stats, setStats] = useState<AppUsageStat[]>([]);

  useEffect(() => {
    // We can only access localStorage on the client
    setStats(getUsageStats());
  }, []);

  const aggregatedData = useMemo(() => {
    const data: { [key: string]: number } = {};
    stats.forEach(stat => {
      data[stat.appName] = (data[stat.appName] || 0) + stat.duration;
    });
    return Object.entries(data)
      .map(([appName, totalDuration]) => ({ appName, totalDuration }))
      .sort((a, b) => b.totalDuration - a.totalDuration);
  }, [stats]);

  const chartConfig = {
    duration: {
      label: 'Duration (minutes)',
      color: 'hsl(var(--primary))',
    },
  };

  return (
    <div className="space-y-6">
       <div className="space-y-2">
         <h1 className="text-3xl font-bold font-headline">Usage Reports</h1>
         <p className="text-muted-foreground">
           See how much time you've spent on distracting apps during focus sessions.
         </p>
       </div>
      <Card>
        <CardHeader>
          <CardTitle>Time Spent on Apps</CardTitle>
          <CardDescription>Total time per app across all focus sessions.</CardDescription>
        </CardHeader>
        <CardContent>
          {aggregatedData.length > 0 ? (
            <ChartContainer config={chartConfig} className="min-h-[200px] w-full">
              <ResponsiveContainer width="100%" height={350}>
                <BarChart data={aggregatedData} margin={{ top: 20, right: 20, bottom: 5, left: 0 }}>
                  <CartesianGrid vertical={false} />
                  <XAxis
                    dataKey="appName"
                    tickLine={false}
                    tickMargin={10}
                    axisLine={false}
                  />
                  <YAxis
                    tickFormatter={(value) => `${value}m`}
                    label={{ value: 'Minutes', angle: -90, position: 'insideLeft' }}
                  />
                  <Tooltip
                    cursor={{ fill: 'hsl(var(--muted))' }}
                    content={<ChartTooltipContent />}
                  />
                  <Bar dataKey="totalDuration" fill="var(--color-duration)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          ) : (
            <div className="flex flex-col items-center justify-center text-center p-8 border-2 border-dashed rounded-lg">
                <p className="text-muted-foreground">No usage data yet.</p>
                <p className="text-sm text-muted-foreground">Start a focus session on the dashboard to see your stats here.</p>
            </div>
          )}
        </CardContent>
      </Card>
      <Alert>
        <Info className="h-4 w-4" />
        <AlertTitle>About This Data</AlertTitle>
        <AlertDescription>
          This report only includes time spent on apps that you were nudged away from. All data is stored locally on your device and is not sent anywhere.
        </AlertDescription>
      </Alert>
    </div>
  );
}
