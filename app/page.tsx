'use client';

import { VoterJourney } from '@/components/features/VoterJourney';
import { InteractiveTimeline } from '@/components/features/InteractiveTimeline';
import { ReadinessChecklist } from '@/components/features/ReadinessChecklist';
import { FAQBot } from '@/components/features/FAQBot';
import { MythBuster } from '@/components/features/MythBuster';
import { AuthButton, useAuth } from '@/components/features/AuthProvider';
import { Shield, Sparkles } from 'lucide-react';

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
              <p>Built securely using Google Cloud, Firebase & Next.js.</p>
              <p className="mt-2">Always verify critical dates and requirements with the official Election Commission portals.</p>
          </div>
      </footer>
    </main>
  );
}
