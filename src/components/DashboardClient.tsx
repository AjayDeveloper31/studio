"use client";

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Sparkles, Play, StopCircle, AppWindow } from 'lucide-react';
import BlockScreen from './BlockScreen';
import { addUsageStat } from '@/lib/storage';
import { useToast } from '@/hooks/use-toast';

const MOCK_APPS = ['Social Media', 'Streaming Video', 'Online Shopping', 'Games', 'News Feeds'];
const TIMER_OPTIONS = [1, 2, 3, 4, 5];

type SessionState = 'idle' | 'running' | 'blocked';

export default function DashboardClient() {
  const [selectedApps, setSelectedApps] = useState<Set<string>>(new Set());
  const [timerDuration, setTimerDuration] = useState<number>(TIMER_OPTIONS[0]);
  const [sessionState, setSessionState] = useState<SessionState>('idle');
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

  const startSession = () => {
    if (selectedApps.size === 0) {
      toast({
        variant: "destructive",
        title: "No apps selected",
        description: "Please select at least one app to monitor.",
      });
      return;
    }
    setSessionState('running');
    toast({
      title: "Focus session started!",
      description: "We'll nudge you if you spend too much time on selected apps.",
    });
  };

  const endSession = useCallback(() => {
    setSessionState('idle');
    setActiveApp(null);
    setTimeLeft(null);
    toast({
      title: "Session ended",
      description: "Great work staying focused!",
    });
  }, [toast]);

  const simulateAppUsage = (appName: string) => {
    setActiveApp(appName);
    setTimeLeft(timerDuration * 60);
  };

  useEffect(() => {
    if (sessionState !== 'running' || !activeApp || timeLeft === null) {
      return;
    }

    if (timeLeft <= 0) {
      addUsageStat({ appName: activeApp, duration: timerDuration });
      setSessionState('blocked');
      return;
    }

    const intervalId = setInterval(() => {
      setTimeLeft(prev => (prev !== null ? prev - 1 : null));
    }, 1000);

    return () => clearInterval(intervalId);
  }, [timeLeft, sessionState, activeApp, timerDuration]);

  if (sessionState === 'blocked' && activeApp) {
    return <BlockScreen appName={activeApp} onReset={endSession} />;
  }

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle className="font-headline text-2xl">Focus Session Setup</CardTitle>
          <CardDescription>Select apps to monitor and set your time limit.</CardDescription>
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
                    disabled={sessionState === 'running'}
                  />
                  <Label htmlFor={app} className="font-normal">{app}</Label>
                </div>
              ))}
            </div>
          </div>
          <div className="space-y-4">
            <Label htmlFor="timer-select" className="font-semibold">2. Set Nudge Interval</Label>
            <Select
              value={String(timerDuration)}
              onValueChange={(value) => setTimerDuration(Number(value))}
              disabled={sessionState === 'running'}
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
            <p className="text-sm text-muted-foreground">We'll nudge you after this much continuous usage.</p>
          </div>
        </CardContent>
        <CardFooter>
          {sessionState === 'idle' ? (
            <Button size="lg" onClick={startSession}>
              <Play className="mr-2" /> Start Focus Session
            </Button>
          ) : (
            <Button size="lg" variant="destructive" onClick={endSession}>
              <StopCircle className="mr-2" /> End Session
            </Button>
          )}
        </CardFooter>
      </Card>

      {sessionState === 'running' && (
        <Card>
          <CardHeader>
            <CardTitle className="font-headline text-2xl">Session in Progress</CardTitle>
            <CardDescription>Click an app to simulate using it. The timer will begin.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {activeApp && timeLeft !== null ? (
              <div className="space-y-3">
                <p>Simulating usage of: <span className="font-bold text-primary">{activeApp}</span></p>
                <Progress value={(timeLeft / (timerDuration * 60)) * 100} className="w-full" />
                <p className="text-center text-lg font-mono">
                  {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
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

      {sessionState === 'idle' && (
         <Alert className="bg-primary/10 border-primary/50">
          <Sparkles className="h-4 w-4 text-primary" />
          <AlertTitle className="font-headline text-primary">How it works</AlertTitle>
          <AlertDescription>
            NudgeBlock helps you build better habits. Start a session to monitor your app usage. If you spend too much time on a distracting app, we'll gently nudge you and suggest a more productive alternative.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}
