'use client';

import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { UserChecklist } from '@/types';
import { Sparkles, MapPin, Calendar, CheckSquare, IdCard } from 'lucide-react';
import confetti from 'canvas-confetti';

const CHECKLIST_ITEMS = [
  { id: 'isRegistered', label: 'Voter Registration Confirmed', icon: CheckSquare, desc: 'Ensure name is on the electoral roll.' },
  { id: 'hasValidId', label: 'Valid ID Card Ready', icon: IdCard, desc: 'EPIC (Voter ID) or alternative valid government ID.' },
  { id: 'knowsPollingBooth', label: 'Polling Booth Location Known', icon: MapPin, desc: 'Find your exact polling station.' },
  { id: 'knowsVotingDate', label: 'Voting Date & Time Known', icon: Calendar, desc: 'Know when to vote.' },
] as const;

export function ReadinessChecklist({ userId = 'guest' }: { userId?: string }) {
  const [checklist, setChecklist] = useState<UserChecklist>({
    userId,
    isRegistered: false,
    hasValidId: false,
    knowsPollingBooth: false,
    knowsVotingDate: false,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // In a real app, fetch from API. For demo, we start empty if guest.
    // fetch(`/api/checklist/${userId}`).then(res => res.json()).then(data => { setChecklist(data); setLoading(false); })
    setLoading(false);
  }, [userId]);

  const calculateProgress = () => {
    let checked = 0;
    if (checklist.isRegistered) checked++;
    if (checklist.hasValidId) checked++;
    if (checklist.knowsPollingBooth) checked++;
    if (checklist.knowsVotingDate) checked++;
    return (checked / 4) * 100;
  };

  const progress = calculateProgress();

  const handleToggle = async (key: keyof Omit<UserChecklist, 'userId' | 'updatedAt'>) => {
    const newValue = !checklist[key];
    const newChecklist = { ...checklist, [key]: newValue };
    setChecklist(newChecklist);

    // If reached 100%, trigger confetti
    let newProgress = 0;
    if (newChecklist.isRegistered) newProgress++;
    if (newChecklist.hasValidId) newProgress++;
    if (newChecklist.knowsPollingBooth) newProgress++;
    if (newChecklist.knowsVotingDate) newProgress++;
    
    if (newProgress === 4 && progress < 100) {
      confetti({
        particleCount: 150,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#26ccff', '#a25afd', '#ff5e7e', '#88ff5a', '#fcff42', '#ffa62d', '#ff36ff']
      });
    }

    // Attempt to sync, ignore errors for purely client-side resilience
    try {
      await fetch(`/api/checklist/${userId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ [key]: newValue })
      });
    } catch (e) {
      console.warn("Could not sync checklist status.");
    }
  };

  return (
    <Card className="w-full max-w-xl mx-auto border-2 shadow-lg" aria-label="Am I ready to vote checklist">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between mb-2">
            <CardTitle className="text-2xl font-bold flex items-center">
                <Sparkles className="text-yellow-500 mr-2 w-6 h-6" /> Ready to Vote?
            </CardTitle>
            <span className="text-2xl font-black text-primary">{Math.round(progress)}%</span>
        </div>
        <CardDescription>
            Complete these essential steps to ensure you face no issues on voting day.
        </CardDescription>
        <Progress value={progress} className="h-3 my-2" />
      </CardHeader>
      
      <CardContent className="space-y-3">
        {CHECKLIST_ITEMS.map((item) => {
          const isChecked = checklist[item.id];
          return (
            <label 
              key={item.id} 
              className={`flex items-start p-4 rounded-xl border-2 cursor-pointer transition-all ${
                  isChecked 
                  ? 'bg-primary/5 border-primary/30 shadow-sm' 
                  : 'bg-card hover:bg-muted/50 border-transparent hover:border-border'
              }`}
            >
              <div className="relative flex items-center justify-center shrink-0 w-6 h-6 mt-0.5 mr-4 rounded border-2 border-primary overflow-hidden">
                <input
                  type="checkbox"
                  className="sr-only"
                  checked={isChecked}
                  onChange={() => handleToggle(item.id)}
                  aria-label={item.label}
                  disabled={loading}
                />
                {isChecked && <div className="absolute inset-0 bg-primary flex items-center justify-center"><CheckSquare className="w-4 h-4 text-primary-foreground" /></div>}
              </div>
              
              <div className="flex-1 space-y-1">
                <p className={`font-semibold text-lg leading-none ${isChecked ? 'text-primary' : ''}`}>
                    {item.label}
                </p>
                <div className="flex flex-col text-sm text-muted-foreground">
                    <p>{item.desc}</p>
                </div>
              </div>

              <div className={`shrink-0 ml-4 p-2 rounded-full ${isChecked ? 'bg-primary/20 text-primary' : 'bg-muted text-muted-foreground'}`}>
                  <item.icon className="w-5 h-5"/>
              </div>
            </label>
          );
        })}
      </CardContent>
    </Card>
  );
}
