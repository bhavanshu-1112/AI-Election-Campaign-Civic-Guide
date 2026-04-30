'use client';

import dynamic from 'next/dynamic';
import { useAuth } from '@/components/features/AuthProvider';
import { AuthButton } from '@/components/features/AuthProvider';
import { Shield, Sparkles } from 'lucide-react';

// ─── Dynamic Imports with Loading Skeletons ─────────────────────────────────
// Lazily load heavy feature components to reduce initial bundle size and improve TTI.

const VoterJourney = dynamic(() => import('@/components/features/VoterJourney').then(m => ({ default: m.VoterJourney })), {
  loading: () => <div className="h-96 rounded-2xl bg-muted/50 animate-pulse" aria-label="Loading voter journey..." />,
  ssr: false,
});

const InteractiveTimeline = dynamic(() => import('@/components/features/InteractiveTimeline').then(m => ({ default: m.InteractiveTimeline })), {
  loading: () => <div className="h-64 rounded-2xl bg-muted/50 animate-pulse" aria-label="Loading timeline..." />,
  ssr: false,
});

const ReadinessChecklist = dynamic(() => import('@/components/features/ReadinessChecklist').then(m => ({ default: m.ReadinessChecklist })), {
  loading: () => <div className="h-64 rounded-2xl bg-muted/50 animate-pulse" aria-label="Loading checklist..." />,
  ssr: false,
});

const FAQBot = dynamic(() => import('@/components/features/FAQBot').then(m => ({ default: m.FAQBot })), {
  loading: () => <div className="h-64 rounded-2xl bg-muted/50 animate-pulse" aria-label="Loading FAQ bot..." />,
  ssr: false,
});

const MythBuster = dynamic(() => import('@/components/features/MythBuster').then(m => ({ default: m.MythBuster })), {
  loading: () => <div className="h-64 rounded-2xl bg-muted/50 animate-pulse" aria-label="Loading myth buster..." />,
  ssr: false,
});

export default function Home() {
  const { user } = useAuth();
  const userId = user?.uid || 'guest';

  return (
    <main className="min-h-screen pb-20">
      {/* Skip to Main Content Link for Accessibility */}
      <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-primary text-primary-foreground p-3 rounded-md z-50 font-bold focus:outline-none focus:ring-4 focus:ring-primary/50">
        Skip to main content
      </a>

      {/* Top Navigation Bar with Auth */}
      <nav className="fixed top-0 left-0 right-0 z-40 bg-background/80 backdrop-blur-lg border-b border-border/50" aria-label="Main navigation">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            <span className="font-bold text-lg">CivicGuide AI</span>
          </div>
          <AuthButton />
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-28 pb-16 lg:pt-36 lg:pb-24 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary font-semibold text-sm mb-8 border border-primary/20 backdrop-blur-md transition-transform hover:scale-105 cursor-pointer">
            <Sparkles className="w-4 h-4" /> AI-Powered V3
          </div>
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6">
            Your Personalized <br className="hidden md:block"/>
            <span className="bg-gradient-to-r from-blue-500 via-primary to-purple-500 bg-clip-text text-transparent"> Election Companion</span>
          </h1>
          <p className="mt-4 max-w-2xl text-xl text-muted-foreground mx-auto font-medium">
            Navigate the democratic process with confidence. Tailored roadmaps, instant fact-checking, and interactive timelines all in one place.
          </p>
        </div>
      </section>

      <div id="main-content" className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-32">
        
        {/* Core Journey Flow */}
        <section aria-labelledby="journey-heading" className="scroll-mt-24">
            <h2 id="journey-heading" className="sr-only">Voter Journey</h2>
            <VoterJourney />
        </section>

        {/* Readiness and Fact Checking Split */}
        <section aria-labelledby="readiness-fact-heading" className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-8 scroll-mt-24">
            <h2 id="readiness-fact-heading" className="sr-only">Readiness and Fact Checking</h2>
            <div className="flex flex-col h-full justify-center">
                <ReadinessChecklist userId={userId} />
            </div>
            <div className="flex flex-col h-full justify-center">
                <MythBuster />
            </div>
        </section>

        {/* Interactive Timeline Full Width */}
        <section aria-labelledby="timeline-heading" className="scroll-mt-24">
            <h2 id="timeline-heading" className="sr-only">Election Timeline</h2>
            <InteractiveTimeline />
        </section>

        {/* FAQ Chatbot section */}
        <section aria-labelledby="faq-heading" className="scroll-mt-24 max-w-4xl mx-auto w-full">
            <div className="text-center mb-8">
                <h2 id="faq-heading" className="text-3xl font-bold mb-4">Have Questions?</h2>
                <p className="text-muted-foreground text-lg">Our AI assistant is trained on official election documentation.</p>
            </div>
            <FAQBot userId={userId} />
        </section>

      </div>

      {/* Footer */}
      <footer className="mt-32 border-t py-12 bg-muted/30">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 text-center text-muted-foreground text-sm font-medium flex flex-col items-center">
              <Shield className="w-8 h-8 mb-4 opacity-50" />
              <p>Built securely using Google Cloud, Firebase &amp; Next.js.</p>
              <p className="mt-2">Always verify critical dates and requirements with the official Election Commission portals.</p>
          </div>
      </footer>
    </main>
  );
}
