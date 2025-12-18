import { GoogleGenerativeAI } from '@google/generative-ai';
import type { Character, InventoryItem } from '@/types/game';

export interface MessageBlock {
  type: 'narration' | 'dialogue';
  content: string;
  speaker?: string;
}

interface GameStateUpdates {
  character?: Partial<Character>;
  inventory?: InventoryItem[];
  achievements?: string[];
}

export class GeminiService {
  private get genAI() {
    return new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
  }

  private get model() {
    return this.genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
  }

  async generateNarrative(
    history: string[],
    userAction: string,
    characterState: Character
  ): Promise<{
    narrative: string;
    blocks: MessageBlock[];
    stateUpdates?: GameStateUpdates;
    imagePrompt?: string;
    suggestions?: string[];
  }> {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.error('GEMINI_API_KEY is not defined in environment variables');
      return {
        narrative: 'The magical resonance is missing. Please check your API key configuration.',
        blocks: [{ type: 'narration', content: 'The magical resonance is missing. Please check your API key configuration.' }]
      };
    }

    const interactionCount = Math.floor(history.length / 2) + 1;
    const shouldForceImage = interactionCount % 5 === 0 || interactionCount === 1;

    const systemPrompt = this.buildGameMasterPrompt(characterState, shouldForceImage, interactionCount);
    const contextPrompt = this.buildContextPrompt(history, userAction);
    const fullPrompt = `${systemPrompt}\n\n${contextPrompt}`;

    // Try multiple models - prioritizing high-quota standard models for stability
    const models = [
      'gemini-1.5-flash',
      'gemini-2.5-flash', 
      'gemini-2.0-flash', 
      'gemini-1.5-pro'
    ];
    let lastError: Error | null = null;

    for (const modelName of models) {
      try {
        console.log(`Attempting narration with model: ${modelName}`);
        const model = this.genAI.getGenerativeModel({ model: modelName });
        const result = await model.generateContent(fullPrompt);
        const response = await result.response;
        const text = response.text();

        return this.parseResponse(text);
      } catch (error) {
        const err = error instanceof Error ? error : new Error(String(error));
        lastError = err;
        console.warn(`Model ${modelName} failed:`, err.message);
        continue; // Try next model
      }
    }
    console.error('All Gemini models failed:', lastError);
    return {
      narrative: 'The ancient magic flickers momentarily, but the story continues...',
      blocks: [{ 
        type: 'narration', 
        content: 'The ancient magic flickers momentarily, but the story continues...' 
      }]
    };
  }

  async generateImage(prompt: string): Promise<{ url: string } | { error: string }> {
    // --- STRATEGY: Help out the Gemini Quota by using Pollinations as the Primary ---
    // This ensures narration (text) always has enough magical energy.
    try {
      console.log('Using Original Image Gen (Pollinations.ai) for:', prompt);
      const seed = Math.floor(Math.random() * 1000000);
      const url = `https://pollinations.ai/p/${encodeURIComponent(prompt)}?width=1024&height=1024&seed=${seed}&nologo=true`;
      return { url };
    } catch (fallbackError) {
      console.error('Original Image Gen failed, attempting Nano Banana:', fallbackError);
    }

    // --- FALLBACK TO GOOGLE NANO BANANA ---
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return { error: 'Magical core missing (API KEY)' };
    }

    try {
      console.log(`Attempting Nano Banana (gemini-2.5-flash-image) as fallback: ${prompt}`);
      const model = this.genAI.getGenerativeModel({ model: 'gemini-2.5-flash-image' });
      
      const result = await model.generateContent(prompt);
      const response = await result.response;
      
      const imagePart = response.candidates?.[0].content.parts.find(part => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const p = part as any;
        return p.inlineData || p.fileData;
      });
      
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      if ((imagePart as any)?.inlineData) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const base64Data = (imagePart as any).inlineData.data;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const mimeType = (imagePart as any).inlineData.mimeType;
        return { url: `data:${mimeType};base64,${base64Data}` };
      }
    } catch (error) {
      console.error('Nano Banana fallback failed (Quota/Error):', error instanceof Error ? error.message : error);
    }

    return { error: 'Both magical engines have been exhausted for now.' };
  }

  async analyzeAction(userAction: string): Promise<{
    statCheck?: { type: string; dc: number; success: boolean };
    achievement?: string;
    narrative?: string;
  }> {
    const prompt = `Analyze this D&D action for hidden mechanics: "${userAction}"

Return JSON with:
- statCheck: {type: "strength|dexterity|intelligence|charisma|wisdom|constitution", dc: number, success: boolean}
- achievement: string (if warranted)
- narrative: string (brief description)

Only include if there's a clear skill check or achievement opportunity.`;

    try {
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
    } catch (error) {
      console.error('Action analysis error:', error);
    }

    return {};
  }

  async generateStatsFromDescription(description: string): Promise<{
    name: string;
    class: string;
    stats: {
      strength: number;
      dexterity: number;
      intelligence: number;
      charisma: number;
      wisdom: number;
      constitution: number;
    };
  }> {
    const prompt = `Generate D&D 5e compatible stats for a character based on this description: "${description}"

Return JSON with:
- name: string (character's name)
- class: string (character class)
- stats: {
  strength: number (8-18)
  dexterity: number (8-18)
  intelligence: number (8-18)
  charisma: number (8-18)
  wisdom: number (8-18)
  constitution: number (8-18)
}

Total stats should balance to around 75-80. Be realistic but slightly heroic.`;

    try {
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
    } catch (error) {
      console.error('Stat generation error:', error);
    }

    return {
      name: 'Unknown Hero',
      class: 'Adventurer',
      stats: {
        strength: 10,
        dexterity: 10,
        intelligence: 10,
        charisma: 10,
        wisdom: 10,
        constitution: 10,
      },
    };
  }

  async generateAdventureTitles(history: string[], characterState: Character): Promise<string[]> {
    const recentHistory = history.slice(-10).join('\n');
    const prompt = `Based on the following D&D adventure context and character, suggest 5 evocative, high-fantasy adventure titles.
    
Character: ${characterState.name} (${characterState.class})
Recent History:
${recentHistory}

Return only a JSON array of 5 strings. Example: ["The Shadows of Silverhaven", "Echoes of the Prancing Pony"]`;

    try {
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      const jsonMatch = text.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
    } catch (error) {
      console.error('Title generation error:', error);
    }

    return ["A Mysterious Journey", "The Unfolding Tale", "Eldoria's Call", "Legends of Silverhaven", "The Hero's Path"];
  }

  private buildGameMasterPrompt(characterState: Character, forceImage: boolean = false, interactionCount: number = 1): string {
    return `You are a D&D Game Master for a high fantasy adventure in the style of Lord of the Rings. 

CURRENT SCENE: The Prancing Pony Inn in the village of Silverhaven
The character has just entered this cozy tavern. The room is warm with a crackling fireplace. Several patrons are drinking and talking quietly. A burly bartender with a thick beard is polishing mugs behind a long wooden bar. In the corner, a hooded figure watches the door. The air smells of ale, woodsmoke, and roasting meat.

Character State:
${JSON.stringify(characterState, null, 2)}

Your responsibilities:
1. Narrate epic, immersive descriptions based on the current scene
2. Handle player actions naturally within this tavern setting
3. Make invisible skill checks when needed
4. Track story progression and character interactions

Guidelines:
- Write in LOTR-style: serious, epic, descriptive
- Use tags to distinguish narration/storyline from character dialogue:
  [NARRATION] describing the scene, actions, or atmosphere. NEVER include character speech here.
  [DIALOGUE: Name] for when a character (including the DM) speaks directly to the player. Use the NPC's name or "Game Master". NEVER include narration or "He says" inside these tags.
- Example: [NARRATION] Gareth looks up from the counter, his eyes twinkling in the firelight. [DIALOGUE: Gareth] "Welcome, traveler. What brings you to Silverhaven?"
- CRITICAL: Do not mix narration and dialogue. If a character speaks while performing an action, use two separate blocks: [NARRATION] for the action, followed by [DIALOGUE: Name] for the speech.
- Never show dice rolls or mechanics to player
- Describe outcomes narratively ("You deftly pick the lock" vs "You rolled 15")
- Include sensory details and atmosphere (smells, sounds, sights)
- Keep responses concise (2-4 sentences max)
- React appropriately to different actions (talking, examining, moving)
- Remember the bartender's name is "Gareth" and he's been working here 20 years

When a visually significant event occurs, append this tag following these BEST PRACTICES:
1. **Hyper-Specific**: Describe textures, lighting, and materials (e.g., "worn leather", "etched silver", "volumetric damp mist").
2. **Composition & Camera**: Specify camera angles and lens types (e.g., "Low-angle cinematic shot", "Wide-angle landscape", "Macro focus on the crystal").
3. **Step-by-Step instructions**: Layer the scene (Background -> Midground -> Foreground -> Subject).
4. **Context & Intent**: Define the mood and purpose (e.g., "A tense, claustrophobic atmosphere for a stealth mission").
5. **Photorealistic High Fantasy**: Aim for a cinematic 8k look, avoiding abstract or low-quality terms.

GENERATE_IMAGE: "A [Camera Angle] shot of [Background] with [Midground/Foreground elements]. The lighting is [Atmospheric Lighting]. Subject: [Hyper-specific description of focus]. Style: Photorealistic High Fantasy, 8k, cinematic."

Note: This is interaction #${interactionCount}. 
${forceImage ? 'CRITICAL: You MUST include a GENERATE_IMAGE tag for this response to illustrate the current scene.' : 'Only include a GENERATE_IMAGE tag if something truly monumental happens.'}

When state changes are needed, append JSON at the end:
STATE_UPDATE: {"character": {"experience": 100}, "inventory": [{"name": "Gold Coin", "quantity": 5}]}

At the very end of your response, you MUST provide 3 short suggested actions for the player as a JSON array:
SUGGESTED_ACTIONS: ["Action 1", "Action 2", "Action 3"]
`;
  }

  private buildContextPrompt(history: string[], userAction: string): string {
    const recentHistory = history.slice(-5).join('\n');
    
    return `Recent Game History:
${recentHistory}

Current Player Action: "${userAction}"

Respond with narrative blocks using [NARRATION] and [DIALOGUE] tags. If stats/inventory need updating, include STATE_UPDATE JSON at the end.

Examples of appropriate responses:
- [NARRATION] The bartender greets you with a wary smile. [DIALOGUE] "What's your pleasure, friend?"
- [NARRATION] You examine the room. The air is thick with the scent of roasted mutton and stale ale.`;
  }

  private parseResponse(text: string): {
    narrative: string;
    blocks: MessageBlock[];
    stateUpdates?: GameStateUpdates;
    imagePrompt?: string;
    suggestions?: string[];
  } {
    let rawText = text;
    let stateUpdates: GameStateUpdates | undefined = undefined;
    let imagePrompt: string | undefined = undefined;
    let suggestions: string[] | undefined = undefined;
    const blocks: MessageBlock[] = [];

    // Extract image prompt
    const imageMatch = rawText.match(/GENERATE_IMAGE:\s*"([^"]+)"/);
    if (imageMatch) {
      imagePrompt = imageMatch[1];
      rawText = rawText.replace(imageMatch[0], '').trim();
    }
    // Extract state updates
    const stateMatch = rawText.match(/STATE_UPDATE:\s*(\{[\s\S]*\})/);
    if (stateMatch) {
      try {
        stateUpdates = JSON.parse(stateMatch[1]);
        rawText = rawText.replace(stateMatch[0], '').trim();
      } catch (error) {
        console.error('Failed to parse state updates:', error);
      }
    }

    // Extract suggested actions (JSON array)
    const suggestionsMatch = rawText.match(/SUGGESTED_ACTIONS:\s*(\[[\s\S]*?\])/);
    if (suggestionsMatch) {
      try {
        suggestions = JSON.parse(suggestionsMatch[1]);
        rawText = rawText.replace(suggestionsMatch[0], '').trim();
      } catch (error) {
        console.error('Failed to parse suggestions:', error);
      }
    }

    // Parse blocks - improved regex to catch [DIALOGUE] and [DIALOGUE: Name]
    const splitByTags = rawText.split(/(\[NARRATION\]|\[DIALOGUE(?::\s*[^\]]+)?\])/g).filter(Boolean);
    
    let currentType: 'narration' | 'dialogue' = 'narration';
    let currentSpeaker: string | undefined = undefined;
    
    for (const item of splitByTags) {
        const upperItem = item.toUpperCase();
        if (upperItem === '[NARRATION]') {
            currentType = 'narration';
            currentSpeaker = undefined;
        } else if (upperItem.startsWith('[DIALOGUE')) {
            currentType = 'dialogue';
            // Extract speaker if present, otherwise default to "Game Master"
            const match = item.match(/\[DIALOGUE:\s*([^\]]+)\]/i);
            currentSpeaker = match ? match[1].trim() : 'Game Master';
        } else {
            const trimmed = item.trim();
            if (trimmed) {
                blocks.push({ 
                    type: currentType, 
                    content: trimmed,
                    speaker: currentSpeaker 
                });
            }
        }
    }

    // If no tags were found, treat the whole thing as one narration block
    if (blocks.length === 0 && rawText.trim()) {
        blocks.push({ type: 'narration', content: rawText.trim() });
    }

    return { 
      narrative: rawText.trim(), 
      blocks,
      stateUpdates, 
      imagePrompt,
      suggestions
    };
  }
}