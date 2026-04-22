'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { ShieldCheck, ShieldAlert, ShieldQuestion, Loader2, Link as LinkIcon, Info } from 'lucide-react';
import { MythVerificationResponse } from '@/types';
import { Progress } from "@/components/ui/progress"

export function MythBuster() {
  const [claim, setClaim] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<MythVerificationResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleVerify = async () => {
    if (!claim.trim() || claim.length < 5) return;
    
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch('/api/myths/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ claim: claim.trim(), userId: "guest" }),
      });

      if (!response.ok) {
        throw new Error('Failed to verify claim');
      }

      const data = await response.json();
      setResult(data);
    } catch (err: any) {
      setError('Service unavailable. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const getVerdictDetails = (verdict: string) => {
    switch (verdict) {
      case 'TRUE':
        return { color: 'text-green-500', bg: 'bg-green-500/10', border: 'border-green-500/20', icon: ShieldCheck, label: 'Verified True' };
      case 'FALSE':
        return { color: 'text-red-500', bg: 'bg-red-500/10', border: 'border-red-500/20', icon: ShieldAlert, label: 'False / Misleading' };
      case 'PARTIALLY_TRUE':
        return { color: 'text-orange-500', bg: 'bg-orange-500/10', border: 'border-orange-500/20', icon: ShieldAlert, label: 'Partially True / Missing Context' };
      default:
        return { color: 'text-slate-500', bg: 'bg-slate-500/10', border: 'border-slate-500/20', icon: ShieldQuestion, label: 'Unverified' };
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto shadow-xl" aria-label="Election Myth Buster Tool">
      <CardHeader>
        <CardTitle className="flex items-center text-2xl font-bold bg-gradient-to-r from-primary to-blue-500 bg-clip-text text-transparent">
          Election Myth Buster
        </CardTitle>
        <CardDescription>
          Heard a rumor? AI-powered fact-checking against official guidelines to stop the spread of misinformation.
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Textarea 
            placeholder="Paste or type a claim you heard here (e.g. 'You can vote online in the upcoming election')"
            value={claim}
            onChange={(e) => setClaim(e.target.value)}
            className="min-h-[100px] resize-none focus-visible:ring-primary/40 text-base"
            disabled={loading}
            maxLength={500}
            aria-label="Claim input"
          />
          <div className="flex justify-between items-center text-xs text-muted-foreground px-1">
             <span>Minimum 5 characters.</span>
             <span className={claim.length === 500 ? 'text-red-500' : ''}>{claim.length}/500</span>
          </div>
        </div>

        {error && (
            <p className="text-red-500 text-sm font-medium p-3 bg-red-500/10 rounded-md border border-red-500/20">{error}</p>
        )}

        <AnimatePresence mode="wait">
          {result && !loading && (
            <motion.div
              initial={{ opacity: 0, height: 0, scale: 0.95 }}
              animate={{ opacity: 1, height: 'auto', scale: 1 }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden pt-4"
              aria-live="polite"
            >
              <div className={`p-6 rounded-xl border-2 ${getVerdictDetails(result.verdict).border} ${getVerdictDetails(result.verdict).bg}`}>
                <div className="flex items-start md:items-center justify-between flex-col md:flex-row mb-4 gap-2">
                    <div className="flex items-center gap-3">
                        <div className={`p-2 bg-background rounded-full shadow-sm ${getVerdictDetails(result.verdict).color}`}>
                            {(() => {
                            const Icon = getVerdictDetails(result.verdict).icon;
                            return <Icon className="w-8 h-8" />;
                            })()}
                        </div>
                        <div>
                           <h3 className={`font-bold text-xl uppercase tracking-wider ${getVerdictDetails(result.verdict).color}`}>
                            {getVerdictDetails(result.verdict).label}
                           </h3>
                        </div>
                    </div>
                    
                    <div className="flex flex-col items-end w-full md:w-32 bg-background/50 p-2 rounded-lg border">
                        <div className="flex justify-between w-full text-xs font-semibold mb-1">
                            <span>Confidence</span>
                            <span>{result.confidence}%</span>
                        </div>
                        <Progress value={result.confidence} className="h-1.5 w-full" />
                    </div>
                </div>

                <p className="text-sm md:text-base mb-4 leading-relaxed font-medium opacity-90">
                  {result.explanation}
                </p>

                <div className="pt-4 mt-auto border-t border-black/10 dark:border-white/10 flex flex-col md:flex-row justify-between gap-3 md:items-center text-sm">
                   {result.referenceSource && result.referenceSource.toLowerCase() !== "none" && (
                       <div className="flex items-center gap-1.5 text-blue-600 dark:text-blue-400 font-medium bg-blue-500/10 px-2 py-1 rounded">
                           <LinkIcon className="w-3.5 h-3.5" />
                           <span className="line-clamp-1">{result.referenceSource}</span>
                       </div>
                   )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </CardContent>

      <CardFooter className="pt-0 flex flex-col items-center">
        <Button 
          onClick={handleVerify} 
          disabled={loading || claim.length < 5} 
          className="w-full font-bold h-12 text-lg shadow-md transition-all hover:shadow-lg active:scale-[0.98]"
        >
          {loading ? (
            <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Verifying Fact...</>
          ) : 'Check Fact'}
        </Button>
        <p className="flex items-center text-xs text-muted-foreground mt-4 text-center">
            <Info className="w-3 h-3 mr-1" /> AI analysis based on general election rules. Always consult official sources.
        </p>
      </CardFooter>
    </Card>
  );
}
