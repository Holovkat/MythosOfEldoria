# 🛡️ Mythos of Eldoria: The Infinite Saga

[![Vercel Deployment](https://img.shields.io/badge/Deployed-Vercel-black?style=for-the-badge&logo=vercel)](https://mythos-of-eldoria.vercel.app)
[![Tech Stack: Next.js](https://img.shields.io/badge/Next.js-16--Turbopack-000000?style=for-the-badge&logo=nextdotjs)](https://nextjs.org)
[![Database: Convex](https://img.shields.io/badge/Database-Convex-black?style=for-the-badge&logo=convex)](https://convex.dev)
[![AI: Gemini 2.x](https://img.shields.io/badge/AI-Gemini_Pro-blue?style=for-the-badge&logo=google-gemini)](https://ai.google.dev)

Step into a living, breathing high-fantasy world where your choices don't just influence the story—they _create_ it. **Mythos of Eldoria** is a next-generation AI RPG that blends serious Lord of the Rings-style narration with high-fidelity cinematic visuals.

---

## 📁 Repository Map

This repository is organized as a multi-domain workspace to handle both the development of the game and its extensive narrative architecture:

- **`ai-rpg/`**: The core **Next.js 16** (Turbopack) application. This contains the game loop, character engine, and elite illustration protocols.
- **`docs/`**: The "Grand Archives." Contains all Master Checklists, Requirements documents, and the architectural roadmap that guides development.
- **`.agent/`**: AI Workflow configurations (BMAD-compliant) used to facilitate collaborative development with assistant agents.

---

## ⚔️ Core Pillars

### 🧠 The Sentient Game Master

Powered by **Gemini 1.5/2.x**, our GM is not just a chatbot. It is a storyteller trained in the arts of high fantasy, reacting with consistency and depth to your actions, inventory, and character traits.

### 🖼️ Elite Illustration Engine

Experience true immersion with our **"Nano Banana"** (Gemini 2.5 Flash Image) integration.

- **Hyper-Specific Prompting:** Uses cinematic camera angles and layered composition.
- **Silent Fallback:** Seamlessly pivots to **Pollinations.ai** if quotas are reached, ensuring your saga never loses its luster.

### ☁️ Immortal Progress (Cloud Save)

The **Convex-powered** persistence layer ensures your legend is truly immortal.

- **Auto-Save Rituals:** Progress is preserved every 5 interactions and upon page exit.
- **Archives Page:** Browse and delete your historical legends directly from the game interface.

---

## 🚀 Deployment Instructions

### Local Forge

1. **Navigate:** `cd ai-rpg`
2. **Ignite:** `npm install`
3. **Environment:** Create `.env.local` with keys for Gemini and Convex.
4. **Resonance:** `npm run dev`

### Vercel Ascension

When linking this repo to Vercel:

- **Root Directory:** Set to `ai-rpg`.
- **Framework Preset:** Next.js.
- **Env Vars:** Map `GEMINI_API_KEY`, `NEXT_PUBLIC_CONVEX_URL`, and `CONVEX_DEPLOYMENT`.

---

Built with pride by the seekers of Eldoria. 🛡️⚔️📜✨
