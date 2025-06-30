"use client";

import { useEffect, useState } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Ban, Lightbulb, Loader2 } from 'lucide-react';
import type { SuggestProductiveAlternativesOutput } from '@/ai/flows/suggest-productive-alternatives';
import { Skeleton } from './ui/skeleton';

interface BlockScreenProps {
  appName: string;
  onReset: () => void;
}

export default function BlockScreen({ appName, onReset }: BlockScreenProps) {
  const [suggestion, setSuggestion] = useState<SuggestProductiveAlternativesOutput | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSuggestion = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await fetch('/api/suggest', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ distractingAppName: appName }),
        });
        if (!response.ok) {
          throw new Error('Failed to fetch suggestion');
        }
        const data = await response.json();
        setSuggestion(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An unknown error occurred');
      } finally {
        setIsLoading(false);
      }
    };

    fetchSuggestion();
  }, [appName]);

  return (
    <div className="fixed inset-0 bg-background/90 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="max-w-lg w-full text-center shadow-2xl animate-in fade-in-50 zoom-in-90">
        <CardHeader>
          <div className="mx-auto bg-destructive/10 rounded-full p-4 w-fit">
            <Ban className="h-12 w-12 text-destructive" />
          </div>
          <CardTitle className="font-headline text-3xl mt-4">Time's Up on {appName}!</CardTitle>
          <CardDescription>Let's get back to being productive. Here's a suggestion for you.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="bg-accent/20 border border-accent/50 rounded-lg p-4">
            <h3 className="font-semibold text-lg flex items-center justify-center gap-2">
              <Lightbulb className="text-accent-foreground" />
              Productive Alternative
            </h3>
            {isLoading && (
              <div className="space-y-2 mt-2">
                <Skeleton className="h-6 w-1/2 mx-auto" />
                <Skeleton className="h-4 w-3/4 mx-auto" />
              </div>
            )}
            {error && <p className="text-destructive mt-2">{error}</p>}
            {suggestion && (
              <div className="mt-2">
                <p className="font-bold text-xl text-primary">{suggestion.suggestedAppName}</p>
                <p className="text-muted-foreground">{suggestion.reason}</p>
              </div>
            )}
          </div>
          <Button size="lg" onClick={onReset}>
            I Understand, Back to Work
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
