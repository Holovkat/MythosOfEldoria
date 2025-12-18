import { NextRequest, NextResponse } from 'next/server';
import { GeminiService } from '@/lib/gemini';

export async function POST(request: NextRequest) {
  try {
    const { description } = await request.json();

    if (!description) {
      return NextResponse.json(
        { error: 'Description is required' },
        { status: 400 }
      );
    }

    const geminiService = new GeminiService();
    const stats = await geminiService.generateStatsFromDescription(description);

    return NextResponse.json(stats);
  } catch (error) {
    console.error('Character generation error:', error);
    return NextResponse.json(
      { error: 'Failed to generate character' },
      { status: 500 }
    );
  }
}