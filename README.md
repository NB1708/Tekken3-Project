# Tekken 3: AI-Sensei Reborn 🥋🤖

## [Submission Challenge: Prompt Wars - Warm Up Round]

### **Chosen Vertical:** Smart Gaming & Performance Assistant
### **Persona:** The "Gemini AI Sensei" (Integrated Combat Coach)

---

## 📖 **Project Overview**

**Tekken 3: AI-Sensei Reborn** is a modern, 3D-integrated browser reimagining of the classic fighting game. It doesn't just recreate the combat—it revolutionizes the player experience by integrating **Google's Gemini 1.5 Flash Vision API** directly into the game loop.

This project features a real-time **AI Sensei** that observes your gameplay, analyzes whether you are playing effectively or defensively, and provides context-aware coaching via high-fidelity text and voice.

---

## 🧠 **Approach & Logic**

### 1. **Computer Vision Intergration**
The game uses a dual-engine architecture:
- **Three.js Engine**: Renders 3D character models and environments.
- **Gemini 1.5 Vision Analysis**: Every period (dynamic interval), the game captures the combat state and sends it to the Gemini API.

### 2. **Context-Aware Coaching**
Gemini analyzes:
- Health gaps between players.
- Combat behavior (Agression vs. Purtly Defensive).
- Specific character moves.
- Strategic openings.

### 3. **The "Sensei" Feedback Loop**
The logic creates a dynamic assistant that talks to the player through **SpeechSynthesis** and an **Advanced Holographic HUD**. If you're losing, it encourages you; if you're holding back, it pushes you to strike.

---

## 🎮 **How It Works**

1.  **Local Multiplayer & Arcade**: Supports fully optimized dual-player VS mode and a single-player Arcade mode.
2.  **Ultra-Responsive Mobile Controls**: Features an "Elite Dual-Touch System" with zero-overlap quadrant controls, enabling pro-level fighting on any mobile device. (Portrait-to-Landscape forced rotation logic).
3.  **Real-Time Assistant**: The "AI Coach Settings" button allow you to authorize your Gemini API key. Once authorized, the Sensei becomes your shadow, talking to you during the fight.
4.  **Audio & Visuals**: Synthetic audio engine (white noise & impact synthesis) + 3D post-processing effects (Hit-Stop, Camera Shake).

---

## 🛠️ **Google Services Integration**

- **Gemini API (Google Gemini 1.5 Flash)**: Acts as the brain of the assistant. It is used to generate low-latency, strategic combat analysis.
- **Google Fonts (Orbitron/Rajdhani)**: Used for the futuristic, premium game UI.

---

## 💡 **Assumptions & Decisions**

- **Assumption 1**: The user wants a mobile-first experience. Final logic implements forced rotation to maximize 3D arena visibility.
- **Assumption 2**: Low-latency is critical for feedback. Decision was made to use *Gemini 1.5 Flash* specifically for its high speed in vision-based prompting.
- **Constraint Handling**: Since 3D assets are large, the project uses a standard GLB loader with pre-mapped procedural animations to keep the repository < 1MB (by linking to optimized cloud-hosted binary assets).

---

## 🚀 **Installation & Submission Rules**

- **Branch**: `main` (Single branch rule followed).
- **Size**: < 10MB (Rule followed).
- **Visibility**: Public (Rule followed).

---
*Created for the Hack2Skill Prompt Wars Challenge.*
