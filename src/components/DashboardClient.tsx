"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Sparkles, StopCircle, AppWindow } from 'lucide-react';
import { addUsageStat } from '@/lib/storage';
import { useToast } from '@/hooks/use-toast';

const MOCK_APPS = ['Instagram', 'YouTube', 'Browser', 'WhatsApp', 'TikTok'];
const TIMER_OPTIONS = [1, 2, 3, 4, 5];

export default function DashboardClient() {
  const [selectedApps, setSelectedApps] = useState<Set<string>>(new Set());
  const [timerDuration, setTimerDuration] = useState<number>(TIMER_OPTIONS[0]);
  const [activeApp, setActiveApp] = useState<string | null>(null);
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const { toast } = useToast();

  const handleAppSelection = (appName: string, checked: boolean) => {
    setSelectedApps(prev => {
      const newSet = new Set(prev);
      if (checked) {
        newSet.add(appName);
      } else {
        newSet.delete(appName);
      }
      return newSet;
    });
  };

  const simulateAppUsage = (appName: string) => {
    setActiveApp(appName);
    setTimeLeft(timerDuration * 60);
    toast({
      title: `Simulating ${appName} usage`,
      description: `Timer started for ${timerDuration} minute(s).`
    })
  };

  const stopUsingApp = (manual: boolean = true) => {
    if (manual && activeApp) {
        toast({
            title: `Stopped using ${activeApp}`,
            description: `Timer has been reset.`
        });
    }
    setActiveApp(null);
    setTimeLeft(null);
  };

  useEffect(() => {
    if (!activeApp || timeLeft === null) {
      return;
    }

    if (timeLeft <= 0) {
      addUsageStat({ appName: activeApp, duration: timerDuration });
      toast({
          title: `Time's up!`,
          description: `Closing ${activeApp}. You can reopen it again.`
      });
      stopUsingApp(false);
      return;
    }

    const intervalId = setInterval(() => {
      setTimeLeft(prev => (prev !== null ? prev - 1 : null));
    }, 1000);

    return () => clearInterval(intervalId);
  }, [timeLeft, activeApp, timerDuration, toast]);

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle className="font-headline text-2xl">Monitoring Configuration</CardTitle>
          <CardDescription>Select apps to monitor and the time limit for each use.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-6 md:grid-cols-2">
          <div className="space-y-4">
            <Label className="font-semibold">1. Select Distracting Apps</Label>
            <div className="space-y-2 rounded-md border p-4 shadow-sm">
              {MOCK_APPS.map(app => (
                <div key={app} className="flex items-center space-x-2">
                  <Checkbox
                    id={app}
                    onCheckedChange={(checked) => handleAppSelection(app, !!checked)}
                    checked={selectedApps.has(app)}
                  />
                  <Label htmlFor={app} className="font-normal">{app}</Label>
                </div>
              ))}
            </div>
          </div>
          <div className="space-y-4">
            <Label htmlFor="timer-select" className="font-semibold">2. Set Time Limit Per Use</Label>
            <Select
              value={String(timerDuration)}
              onValueChange={(value) => setTimerDuration(Number(value))}
            >
              <SelectTrigger id="timer-select" className="w-[180px]">
                <SelectValue placeholder="Select duration" />
              </SelectTrigger>
              <SelectContent>
                {TIMER_OPTIONS.map(opt => (
                  <SelectItem key={opt} value={String(opt)}>
                    {opt} minute{opt > 1 ? 's' : ''}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-sm text-muted-foreground">The app will automatically close after this much continuous usage. You can reopen it immediately.</p>
          </div>
        </CardContent>
      </Card>

      {selectedApps.size > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="font-headline text-2xl">Simulate App Usage</CardTitle>
            <CardDescription>Click an app to simulate opening it. The countdown will begin.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {activeApp && timeLeft !== null ? (
              <div className="flex flex-col items-center gap-4">
                <p>Simulating usage of: <span className="font-bold text-primary">{activeApp}</span></p>
                <Progress value={(timeLeft / (timerDuration * 60)) * 100} className="w-full" />
                <p className="text-center text-2xl font-mono">
                  {Math.floor(timeLeft / 60).toString().padStart(2, '0')}:{(timeLeft % 60).toString().padStart(2, '0')}
                </p>
                <Button variant="destructive" onClick={() => stopUsingApp(true)}>
                  <StopCircle className="mr-2" /> Stop Using App
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                {Array.from(selectedApps).map(app => (
                  <Button key={app} variant="outline" size="lg" onClick={() => simulateAppUsage(app)}>
                    <AppWindow className="mr-2" />
                    {app}
                  </Button>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {selectedApps.size === 0 && (
         <Alert className="bg-primary/10 border-primary/50">
          <Sparkles className="h-4 w-4 text-primary" />
          <AlertTitle className="font-headline text-primary">How it works</AlertTitle>
          <AlertDescription>
           NudgeBlock helps you build better habits. Select apps you find distracting, and set a usage time limit for each time you open them. After the time is up, the app will close.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}
