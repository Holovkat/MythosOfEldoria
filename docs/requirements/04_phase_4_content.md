# Phase 4: Multimedia & Content

## Objective
Add the "Wow" factor: Inline generative images and infinite scrolling optimizations, along with final content polish.

## Technical Requirements

### 4.1 Image Generation Integration
- [ ] **Trigger Logic:**
    - Define heuristics for "Key Moments" (e.g., new location detected, boss entity introduced).
    - Or use an explicit tag from Gemini: `[GENERATE_IMAGE: "A looming dark tower..."]`.
- [ ] **API Connection:**
    - Integrate with an Image Gen API (DALL-E 3, Stable Diffusion, or Gemini Vision if capable).
- [ ] **UI Integration:**
    - Create `StoryImage` component.
    - Inject into the chat stream at the correct index.
    - Loading state (skeleton or "Painting the scene..." text).

### 4.2 Infinite Scroll & Performance
- [ ] **Virtualization:**
    - If the story gets very long, implement `react-window` or similar to virtualize the chat list.
- [ ] **Auto-Scroll:**
    - Logic to keep the view at the bottom while AI is typing, but pause if user scrolls up.

### 4.3 Content Polish
- [ ] **Prompt Engineering Tuning:**
    - Refine the "Voice" to be strictly High Fantasy.
    - Ensure consistency in NPC names and locations.
- [ ] **Save/Load System:**
    - Persist `GameState` to `localStorage` (or database).
    - Ability to resume a session.

## Deliverables
- AI-generated images appearing in the story.
- Smooth performance on long sessions.
- Persisted game sessions.
