# Phase 2: Core Gameplay & AI Integration

## Objective
Implement the "brain" of the game: Gemini API integration, the seamless narrative engine, and character creation logic.

## Technical Requirements

### 2.1 Gemini API Integration
- [ ] Set up API route handlers in Next.js to securely communicate with Google Gemini.
- [ ] Create a `GeminiService` utility.
    - Function: `generateNarrative(history, userAction, characterState)`
    - Function: `analyzeAction(userAction)` (for hidden dice rolls/achievements).
- [ ] Define **System Prompts**:
    - "Game Master Persona": Enforces LOTR style, rules of the world, and seamless narration.
    - "JSON Output Mode": For structured data updates (stats changes, inventory updates) separate from the narrative text.

### 2.2 Character Creation System
- [ ] Implement `CharacterCreationWizard`.
    - **Selection Mode:** Grid of `CharacterCard` components (Warrior, Mage, Rogue) with pre-set stats.
    - **Custom Mode:** Text input for "Describe your hero".
- [ ] Connect Custom Mode to Gemini:
    - Prompt: "Generate D&D stats (STR, DEX, INT...) based on this description: [User Input]".
    - Parse JSON response to populate the `Character` state.

### 2.3 Narrative Engine (The Loop)
- [ ] Implement the core `GameLoop`:
    1. User inputs text -> UI displays immediately.
    2. Send input + Context to Gemini.
    3. Receive Streamed Text (Story) + Hidden Data (State Updates).
    4. Update Chat UI with text.
    5. Update Right Panel with State Data.
- [ ] Context Management:
    - Limit history tokens (summarize past events if context gets too long).
    - Ensure `CharacterSheet` is always part of the system prompt.

## Deliverables
- Playable text adventure loop.
- Working character creation flow.
- "Invisible" stat checks functioning in the background.
