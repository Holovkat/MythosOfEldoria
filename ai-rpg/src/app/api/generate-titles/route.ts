import { NextResponse } from 'next/server';
import { GeminiService } from '@/lib/gemini';

const gemini = new GeminiService();

export async function POST(req: Request) {
  try {
    const { history, characterState } = await req.json();

    if (!characterState) {
      return NextResponse.json({ error: 'Character state is required' }, { status: 400 });
    }

    const titles = await gemini.generateAdventureTitles(history || [], characterState);

    return NextResponse.json({ titles });
  } catch (error) {
    console.error('API Error:', error instanceof Error ? error.message : error);
    return NextResponse.json({ error: 'Failed to generate titles' }, { status: 500 });
  }
}
