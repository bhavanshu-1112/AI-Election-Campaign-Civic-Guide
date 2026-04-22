# AI-Powered Personalized Election Companion 🗳️

![Next.js](https://img.shields.io/badge/Next.js-14-black)
![TypeScript](https://img.shields.io/badge/TypeScript-Ready-blue)
![Tailwind](https://img.shields.io/badge/TailwindCSS-V4-teal)
![Gemini](https://img.shields.io/badge/Google-Gemini_2.5_Flash-orange)
![WCAG](https://img.shields.io/badge/WCAG-2.1_Compliant-green)

A production-ready, accessible, secure, and scalable web application that helps users understand the election process. Built with modern React architectures and deeply integrated with Google Gemini API for personalized, AI-driven features.

## 🚀 Key Features

1. **Personalized Voter Journey**: An AI-generated roadmap tailored to your specific demographics (age, location, voter status). Automatically extracts deadlines and required documents into a step-by-step checklist.
2. **Conversational FAQ Bot**: Context-aware chat with session memory, providing confident, verified answers based on official election protocols without hallucinations.
3. **Interactive Election Timeline**: A horizontal, fully accessible timeline detailing each phase of the election process, ensuring you never miss a registration window.
4. **"Am I Ready to Vote?" Checklist**: Interactive progress tracking that visually celebrates when you successfully secure all required documentation.
5. **Election Myth Buster**: Real-time AI verification that evaluates claims, fact-checks against reliable sources, and definitively flags election falsehoods with a True/False/Partial rating.

## 🏗️ Tech Stack

- **Frontend:** Next.js 14 (App Router), TypeScript, Tailwind CSS, `shadcn/ui`, Framer Motion.
- **Backend:** Node.js API Routes, Zod Validation, Firebase Admin SDK.
- **Database:** Google Firestore (for session memories, user checklists).
- **AI Integration:** Google Gemini (`gemini-2.5-flash`) structured JSON output validation.
- **Testing Engine:** Jest (`ts-jest`), RTL wrapper for accessibility coverage.

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
*Current Coverage Target: 70%. Ensure `--detectOpenHandles` is applied if Jest hangs after teardown.*

**4. Build for Production**
```bash
npm run build
```

## ♿ Accessibility standard
This software leverages robust `aria-controls`, Semantic HTML grouping, keyboard-navigable scroll-areas, and ARIA Live Regions for optimal Screen Reader delivery complying with strict **WCAG 2.1 Guidelines**.

---
*Built as a civic education and engagement aide, ensuring safety against hallucinations via system grounding.*
