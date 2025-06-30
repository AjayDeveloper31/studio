"use client";

import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Ban } from 'lucide-react';

interface BlockScreenProps {
  appName: string;
  onReset: () => void;
}

export default function BlockScreen({ appName, onReset }: BlockScreenProps) {
  return (
    <div className="fixed inset-0 bg-background/90 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="max-w-lg w-full text-center shadow-2xl animate-in fade-in-50 zoom-in-90">
        <CardHeader>
          <div className="mx-auto bg-destructive/10 rounded-full p-4 w-fit">
            <Ban className="h-12 w-12 text-destructive" />
          </div>
          <CardTitle className="font-headline text-3xl mt-4">Access to {appName} is Blocked</CardTitle>
          <CardDescription>Your time limit for {appName} has expired. The application is now blocked.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <Button size="lg" onClick={onReset}>
            Return to Dashboard
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
