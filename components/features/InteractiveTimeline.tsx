'use client';

import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { ElectionStage } from '@/types';
import { ChevronRight, ChevronLeft, Map, Calendar, FileText, Lightbulb, Clock } from 'lucide-react';

// Hardcoded seed data for initial render to prevent hydration mismatch before fetch
// In production, fetch via server component or SWR
const SEED_STAGES: ElectionStage[] = [
  { id: '1', title: 'Voter Registration', description: 'Ensure your name is on the electoral roll.', order: 1, deadline: 'Typically 2-3 weeks before election day', requiredDocuments: ['Proof of Age', 'Proof of Residence'], tips: ['Check status online at NVSP portal.'] },
  { id: '2', title: 'Nomination Filing', description: 'Candidates submit their formal intention to run.', order: 2, deadline: 'Notified by ECI', requiredDocuments: ['Affidavit Form 26', 'Security Deposit'], tips: ['Voters can review candidate affidavits online.'] },
  { id: '3', title: 'Campaigning', description: 'Candidates reach out to constituents.', order: 3, deadline: 'Ends 48 hours before polling', requiredDocuments: [], tips: ['Attend local debates.', 'Watch out for Model Code of Conduct violations.'] },
  { id: '4', title: 'Voting Day', description: 'Cast your ballot at the designated polling station.', order: 4, deadline: 'Poll Day (7 AM - 6 PM mostly)', requiredDocuments: ['Voter ID (EPIC) or alternate approved ID', 'Voter Slip'], tips: ['Go early to avoid lines.', 'Phones are not allowed inside.'] },
  { id: '5', title: 'Counting & Results', description: 'EVMs are opened and votes are tallied.', order: 5, deadline: 'Result Day', requiredDocuments: [], tips: ['Watch live updates on ECI website.'] }
];

export function InteractiveTimeline() {
  const [stages, setStages] = useState<ElectionStage[]>(SEED_STAGES);
  const [selectedStage, setSelectedStage] = useState<ElectionStage>(SEED_STAGES[0]);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Keyboard navigation logic
  const handleKeyDown = (e: React.KeyboardEvent, stage: ElectionStage, index: number) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      setSelectedStage(stage);
    } else if (e.key === 'ArrowRight' && index < stages.length - 1) {
      e.preventDefault();
      setSelectedStage(stages[index + 1]);
      document.getElementById(`timeline-tab-${index + 1}`)?.focus();
    } else if (e.key === 'ArrowLeft' && index > 0) {
      e.preventDefault();
      setSelectedStage(stages[index - 1]);
      document.getElementById(`timeline-tab-${index - 1}`)?.focus();
    }
  };

  const scrollAction = (direction: 'left' | 'right') => {
      if(scrollRef.current) {
          const scrollContainer = scrollRef.current.querySelector('[data-radix-scroll-area-viewport]');
          if(scrollContainer) {
             const amount = 300;
             scrollContainer.scrollBy({ left: direction === 'right' ? amount : -amount, behavior: 'smooth' });
          }
      }
  }

  return (
    <Card className="w-full max-w-5xl mx-auto shadow-2xl border-0 overflow-hidden bg-gradient-to-br from-background to-muted/20" aria-label="Election Process Timeline">
      <div className="p-8 pb-4">
          <h2 className="text-3xl font-bold flex items-center mb-2">
            <Map className="w-8 h-8 mr-3 text-primary" /> The Election Journey
          </h2>
          <p className="text-muted-foreground text-lg mb-8">Understand every phase of the democratic process, from registration to results.</p>
          
          <div className="relative group">
            {/* Scroll Buttons */}
            <Button variant="outline" size="icon" className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-8 h-8 rounded-full shadow-md bg-background/80 backdrop-blur opacity-0 group-hover:opacity-100 transition-opacity disabled:opacity-0" onClick={() => scrollAction('left')} aria-label="Scroll left">
                <ChevronLeft className="w-4 h-4" />
            </Button>
            
            <ScrollArea className="w-full pb-4" ref={scrollRef}>
                <div 
                    className="flex w-max space-x-4 px-1" 
                    role="tablist" 
                    aria-label="Election Stages"
                >
                {stages.map((stage, index) => {
                    const isSelected = selectedStage.id === stage.id;
                    return (
                        <button
                            key={stage.id}
                            id={`timeline-tab-${index}`}
                            role="tab"
                            aria-selected={isSelected}
                            aria-controls="timeline-panel"
                            tabIndex={isSelected ? 0 : -1}
                            onClick={() => setSelectedStage(stage)}
                            onKeyDown={(e) => handleKeyDown(e, stage, index)}
                            className={`relative flex flex-col items-center p-4 min-w-[160px] rounded-xl border-2 transition-all duration-300 outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 ${
                            isSelected 
                                ? 'border-primary bg-primary/10 shadow-md scale-105 z-10' 
                                : 'border-border bg-card hover:border-primary/50 hover:bg-muted'
                            }`}
                        >
                            <span className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm mb-3 transition-colors ${isSelected ? 'bg-primary text-primary-foreground' : 'bg-muted-foreground/20 text-muted-foreground'}`}>
                                {stage.order}
                            </span>
                            <span className={`font-semibold text-center leading-tight ${isSelected ? 'text-primary' : ''}`}>
                                {stage.title}
                            </span>
                            
                            {/* Connector Line (except last) */}
                            {index < stages.length - 1 && (
                                <div className="absolute top-1/2 -right-4 w-4 h-0.5 bg-border -translate-y-1/2 pointer-events-none hidden md:block"></div>
                            )}
                        </button>
                    );
                })}
                </div>
                <ScrollBar orientation="horizontal" className="hidden" />
            </ScrollArea>
            
            <Button variant="outline" size="icon" className="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-8 h-8 rounded-full shadow-md bg-background/80 backdrop-blur opacity-0 group-hover:opacity-100 transition-opacity disabled:opacity-0" onClick={() => scrollAction('right')} aria-label="Scroll right">
                <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
      </div>

      <div className="bg-card p-8 border-t" id="timeline-panel" role="tabpanel" tabIndex={0} aria-labelledby={`timeline-tab-${stages.findIndex(s => s.id === selectedStage.id)}`}>
        <AnimatePresence mode="wait">
          <motion.div
            key={selectedStage.id}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-8"
          >
            <div className="md:col-span-2 space-y-4">
                <h3 className="text-2xl font-bold text-primary flex items-center">
                   {selectedStage.title} 
                </h3>
                <p className="text-lg leading-relaxed text-card-foreground/90">
                    {selectedStage.description}
                </p>

                {selectedStage.deadline && (
                     <div className="flex items-center gap-2 mt-4 inline-flex px-4 py-2 bg-rose-500/10 text-rose-600 dark:text-rose-400 font-semibold rounded-lg border border-rose-500/20">
                        <Clock className="w-5 h-5"/>
                        <span>Deadline / Timing: {String(selectedStage.deadline)}</span>
                    </div>
                )}
            </div>

            <div className="space-y-6">
                {selectedStage.requiredDocuments && selectedStage.requiredDocuments.length > 0 && (
                    <Card className="bg-primary/5 border-none shadow-none">
                        <CardHeader className="py-3 px-4">
                            <CardTitle className="text-sm uppercase tracking-wide text-primary flex items-center">
                                <FileText className="w-4 h-4 mr-2"/> Required Documents
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="px-4 pb-4">
                            <ul className="list-disc list-inside space-y-1 text-sm font-medium">
                                {selectedStage.requiredDocuments.map((doc, idx) => (
                                    <li key={idx}>{doc}</li>
                                ))}
                            </ul>
                        </CardContent>
                    </Card>
                )}

                {selectedStage.tips && selectedStage.tips.length > 0 && (
                    <Card className="bg-amber-500/5 border-none shadow-none dark:bg-amber-500/10">
                        <CardHeader className="py-3 px-4">
                            <CardTitle className="text-sm uppercase tracking-wide text-amber-600 dark:text-amber-500 flex items-center">
                                <Lightbulb className="w-4 h-4 mr-2"/> Pro Tips
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="px-4 pb-4">
                             <ul className="list-disc list-inside space-y-1 text-sm text-foreground/80">
                                {selectedStage.tips.map((tip, idx) => (
                                    <li key={idx}>{tip}</li>
                                ))}
                            </ul>
                        </CardContent>
                    </Card>
                )}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </Card>
  );
}
