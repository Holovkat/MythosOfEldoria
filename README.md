# MythosOfEldoria

Step into an infinite saga where your choices weave the very fabric of legend. "Mythos of Eldoria" is an AI-powered RPG experience that combines deep narrative storytelling with dynamic visuals and persistent cloud saves.

## 📁 Repository Structure

- **`ai-rpg/`**: The core Next.js application, including the game engine and UI.
- **`docs/`**: Comprehensive requirements, roadmaps, and architecture documentation.
- **`.agent/`**: Agent configurations and workflows for BMAD.

## 🛡️ Core Features

- **Gemini-Powered DM**: A serious, LOTR-style Game Master that reacts to your every choice.
- **Dynamic Visuals**: Photorealistic AI-generated scenes that bring your story to life.
- **Cloud Persistence**: Your adventure is automatically preserved in the archives (Convex).
- **Interactive Narrative**: Suggested actions, inventory management, and character progression.

## 🚀 Getting Started

To run the application locally:

1.  **Navigate to the app**:
    ```bash
    cd ai-rpg
    ```
2.  **Install dependencies**:
    ```bash
    npm install
    ```
3.  **Forge your environment**:
    Create a `.env.local` with your `GEMINI_API_KEY` and Convex configuration.
4.  **Enter the realm**:
    ```bash
    npm run dev
    ```

## ☁️ Deployment (Vercel)

When deploying to Vercel, ensure you set the **Root Directory** to `ai-rpg`.

Built with Next.js, Gemini API, and Convex. ⚔️✨📜
