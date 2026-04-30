# AI-Powered Personalized Election Companion 🗳️

![Next.js](https://img.shields.io/badge/Next.js-16-black)
![TypeScript](https://img.shields.io/badge/TypeScript-Ready-blue)
![Tailwind](https://img.shields.io/badge/TailwindCSS-V4-teal)
![Gemini](https://img.shields.io/badge/Google-Gemini_2.5_Flash-orange)
![WCAG](https://img.shields.io/badge/WCAG-2.1_Compliant-green)
![Firebase](https://img.shields.io/badge/Firebase-Firestore%20%7C%20Auth%20%7C%20Analytics-yellow)

A production-ready, accessible, secure, and scalable web application that helps users understand the election process. Built with modern React architectures and deeply integrated with Google Gemini API for personalized, AI-driven features.

## 🚀 Key Features

1. **Personalized Voter Journey**: An AI-generated roadmap tailored to your specific demographics (age, location, voter status). Automatically extracts deadlines and required documents into a step-by-step checklist.
2. **Conversational FAQ Bot**: Context-aware chat with session memory, providing confident, verified answers based on official election protocols without hallucinations.
3. **Interactive Election Timeline**: A horizontal, fully accessible timeline detailing each phase of the election process, ensuring you never miss a registration window.
4. **"Am I Ready to Vote?" Checklist**: Interactive progress tracking that visually celebrates when you successfully secure all required documentation.
5. **Election Myth Buster**: Real-time AI verification that evaluates claims, fact-checks against reliable sources, and definitively flags election falsehoods with a True/False/Partial rating.

## 🏗️ Tech Stack

- **Frontend:** Next.js 16 (App Router), TypeScript, Tailwind CSS v4, `shadcn/ui`, Framer Motion.
- **Backend:** Node.js API Routes, Zod Validation, Firebase Admin SDK.
- **Database:** Google Cloud Firestore (for session memories, user checklists, AI response cache).
- **AI Integration:** Google Gemini (`gemini-2.5-flash`) with structured JSON output, safety settings, and system instructions.
- **Testing Engine:** Jest (`ts-jest`), React Testing Library for accessibility coverage.

## ☁️ Google Services Integration

| Service | Usage |
|---|---|
| **Google Gemini 2.5 Flash** | AI backbone for all 3 generative features (Voter Journey, FAQ Bot, Myth Buster). Configured with safety settings (BLOCK_MEDIUM_AND_ABOVE), structured JSON output, and generation config (temperature, topP, maxOutputTokens). |
| **Firebase Authentication** | Google Sign-In via popup with `onAuthStateChanged` listener for session persistence. |
| **Cloud Firestore** | Stores FAQ chat sessions, user checklists, AI response cache (with TTL expiration), and election stage data. Protected by security rules. |
| **Firebase Analytics** | Client-side event tracking for all user interactions (journey generated, FAQ asked, myth checked, checklist toggled, sign-in/sign-out). |
| **Firebase Hosting** | Production deployment with Next.js framework support (`frameworksBackend`). |
| **Google Cloud Logging** | Structured JSON logging with severity levels, service labels, and `logging.googleapis.com/labels` for automatic Cloud Logging integration. |

## 🔒 Security Features

- **Content Security Policy** headers restricting script/connect/frame sources
- **HSTS**, **X-Content-Type-Options**, **X-Frame-Options**, **X-XSS-Protection** headers
- **Firestore Security Rules** with owner-based access control
- **Input sanitization** on all user-supplied strings before Gemini prompts
- **Rate limiting** (20 requests/minute per client) on all AI endpoints
- **Zod schema validation** on all API inputs
- **Server-side secrets** — API keys never exposed to client

## ⚙️ Environment Configuration

To run this application locally, you must provide your own API backend keys. Create a `.env.local` file at the root of the project with the following shape:

```ini
# Core AI SDK (Requires Google AI Studio access)
GEMINI_API_KEY=your_gemini_api_key_here

# Firebase Client Configuration (For Auth & Client Reads)
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_web_app_id
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=G-XXXXXXXXXX

# Firebase Server Configuration (Required for API writes to DB without failure)
# Get from Project Settings -> Service Accounts -> Generate New Private Key
FIREBASE_ADMIN_SDK='{ "type": "service_account", "project_id": "...", "private_key": "...", ... }'
```

## 🛠️ Usage & Setup

**1. Install Dependencies**
```bash
npm install
```

**2. Start the Development Server**
```bash
npm run dev
```
Open `http://localhost:3000` to interact with the application.

**3. Run the Test Suites**
```bash
npm run test
```
*Current Coverage Target: 80%+. Ensure `--detectOpenHandles` is applied if Jest hangs after teardown.*

**4. Build for Production**
```bash
npm run build
```

**5. Deploy to Firebase**
```bash
npm run deploy:firebase
```

## ♿ Accessibility Standard
This software leverages robust `aria-controls`, Semantic HTML grouping, keyboard-navigable scroll-areas, ARIA Live Regions, and skip-to-content links for optimal Screen Reader delivery complying with strict **WCAG 2.1 Guidelines**.

---
*Built as a civic education and engagement aide, ensuring safety against hallucinations via system grounding and Gemini safety settings.*
