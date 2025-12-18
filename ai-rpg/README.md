# 🎮 Mythos of Eldoria: Application Core (`ai-rpg/`)

This directory contains the primary Next.js application for the Mythos of Eldoria RPG.

## 🛠️ Tech Stack

- **Framework**: Next.js 16 (App Router, Turbopack)
- **Styling**: Vanilla CSS + Tailwind V4 (Logic) + shadcn/ui
- **AI Engine**: Gemini API (`google-generative-ai`)
- **Database/Cloud**: Convex (Real-time backend)
- **State Management**: Zustand (Local game logic & persistence)
- **Animations**: Custom CSS Typewriter (Fade-in effect) & `tw-animate-css`

## 🧠 Core Systems

### `src/lib/gemini.ts`

The heart of the Game Master. Handles multi-model fallbacks (1.5 Flash -> 2.5 Flash -> 2.0 Flash) and the elite image generation logic. It implements hyper-specific prompting standards to ensure high-fidelity outputs.

### `src/store/gameStore.ts`

Manages the reactive state of the world, including:

- Character statistics and dynamic leveling.
- Inventory tracking.
- Achievement detection.
- Story history and branching logic.

### `src/components/StoryImage.tsx`

Handles the rendering of AI visuals. Implements a robust base64-vs-URL logic to support both native Gemini images and the Pollinations.ai fallback engine.

## 🏃 Development

```bash
# Install dependencies
npm install

# Run dev server
npm run dev

# Lint check
npm run lint

# Production build
npm run build
```

## 📜 Archives (Convex Setup)

This project uses Convex for server-side persistence. All mutations and schemas are defined in the sibling `convex/` directory (mapped via `tsconfig` if applicable, or referenced directly).

---

Return to [Root README](../README.md) for project-wide documentation.
