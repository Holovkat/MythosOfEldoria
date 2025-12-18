import { NextRequest, NextResponse } from 'next/server';
import { GeminiService } from '@/lib/gemini';

export async function POST(request: NextRequest) {
  try {
    const { action, history, characterState } = await request.json();

    if (!action || !characterState) {
      return NextResponse.json(
        { error: 'Missing required parameters' },
        { status: 400 }
      );
    }

    const geminiService = new GeminiService();
    const result = await geminiService.generateNarrative(
      history || [],
      action,
      characterState
    );

    return NextResponse.json(result);
  } catch (error) {
    console.error('Game master API error:', error);
    return NextResponse.json(
      { error: 'Failed to process game action' },
      { status: 500 }
    );
  }
}