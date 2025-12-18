# AI-Driven High Fantasy RPG - Game Design Document

## 1. Overview
**Title:** (TBD) - AI D&D Adventure
**Genre:** Interactive Fiction / RPG
**Setting:** Classic High Fantasy (Lord of the Rings style)
**Platform:** Web (shadcn/ui)
**Core Tech:** Gemini API (Logic & Narrative), Stable Diffusion/DALL-E (Images - TBD provider via Gemini or separate)

## 2. Core Gameplay Loop
The player engages in an infinite text-based adventure managed by an AI Game Master (Gemini). The experience mimics a Dungeons & Dragons session but with a seamless narrative interface.

- **Input:** Natural language chat (e.g., "I sneak up on the orc" or "I examine the ancient rune").
- **Resolution:** The AI evaluates the action based on character stats and hidden dice rolls, returning a narrative outcome (Success/Failure/Partial).
- **Progression:** The story advances through chapters. Achievements are tracked in real-time.

## 3. Key Features

### 3.1 Character Creation (Hybrid)
- **Presets:** Quick-start cards (e.g., "The Ranger", "The Wizard", "The Warrior") with pre-defined stats.
- **Custom:** A conversational prompt where the user describes their hero, and the AI generates the stats (Strength, Dexterity, Intelligence, Charisma, etc.) in the background.

### 3.2 Narrative Mechanics (Seamless)
- **Hidden Math:** No visible dice rolls or stat checks.
- **Narrative Feedback:** Success is described ("You deftly pick the lock..."), not calculated ("Rolled 15 vs DC 12").
- **Context Window:** The AI maintains a "Character Sheet" and "Inventory" in its context to ensure consistency.

### 3.3 Visuals
- **Inline Images:** Generated only at "Key Moments" (New location, Boss reveal, Plot twist) to preserve pacing and API usage.
- **Style:** Consistent High Fantasy art style.
- **Layout:** Images embedded in the chat stream, scrollable with the text.

### 3.4 Interface (shadcn/ui)
- **Layout:** Minimalist.
    - **Left/Center:** Main Chat Stream (Infinite Scroll).
    - **Right Panel:** Dynamic Dashboard (Character Status, Inventory, Achievements).
- **Theme:** Clean, typography-focused, dark/fantasy mode.

### 3.5 Achievements (Hybrid System)
- **Fixed:** Storyline milestones (e.g., "Complete Chapter 1").
- **Dynamic:** AI-detected "cool moments" (e.g., "Silver Tongue: Talked out of a fatal battle").
- **Display:** Real-time updates in the right panel.

## 4. Content
- **Initial Storylines:** 2-3 fixed starting scenarios (e.g., "The Tavern Brawl", "The Ancient Ruins").
- **Tone:** Epic, serious, immersive (LOTR vibes).

## 5. Technical Stack
- **Frontend:** React / Next.js
- **UI Component Library:** shadcn/ui
- **AI API:** Google Gemini (for Chat & Logic)
- **State Management:** Local Storage / Context API (initial), Database (future).
