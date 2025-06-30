import { NextResponse } from 'next/server';
import { suggestProductiveAlternatives } from '@/ai/flows/suggest-productive-alternatives';
import { z } from 'zod';

const requestSchema = z.object({
  distractingAppName: z.string(),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = requestSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
    }

    const { distractingAppName } = parsed.data;

    const suggestion = await suggestProductiveAlternatives({
      distractingAppName,
    });
    
    return NextResponse.json(suggestion);
  } catch (error) {
    console.error('Error in suggestion API:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return NextResponse.json({ error: 'Failed to get suggestion', details: errorMessage }, { status: 500 });
  }
}
