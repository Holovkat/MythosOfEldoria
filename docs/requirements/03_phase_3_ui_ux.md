# Phase 3: UI/UX & Achievements

## Objective
Flesh out the "Game" aspects: The right-side dashboard, visual feedback for achievements, and chat interface polish.

## Technical Requirements

### 3.1 Chat Interface Polish
- [ ] **Message Components:**
    - `UserMessage`: Distinct styling (aligned right, different color).
    - `AIMessage`: Markdown support (bolding key terms, italics for whispers).
- [ ] **Typing Effect:** Simulate real-time typing for AI responses to improve immersion.
- [ ] **Input Area:** Sticky footer with auto-expanding textarea and "Send" button.

### 3.2 Right Panel Dashboard
- [ ] **Character Tab:**
    - Display Name, Class, Level.
    - Visual bars for HP/Mana (if applicable) or simple text for Stats.
- [ ] **Inventory Tab:**
    - List of items.
    - Tooltips for item descriptions.
- [ ] **Achievements Tab:**
    - Scrollable list of unlocked badges.
    - "Locked" state for fixed story milestones.

### 3.3 Achievement Logic (Hybrid)
- [ ] **Fixed Milestones:**
    - Hardcode triggers in the story progression (e.g., if `chapter === 2`, unlock "The Journey Begins").
- [ ] **Dynamic Awards:**
    - Parse Gemini's hidden JSON response for `new_achievement` fields.
    - Trigger a "Toast" notification (Shadcn Toast) when an achievement is unlocked.
    - Add to the persistent achievement list.

## Deliverables
- Polished Chat UI with markdown and typing effects.
- Fully functional Right Panel synced with game state.
- Achievement notification system.
