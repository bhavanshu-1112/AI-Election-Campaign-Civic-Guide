'use client';

import { useState, useCallback, memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { ShieldCheck, ShieldAlert, ShieldQuestion, Loader2, Link as LinkIcon, Info } from 'lucide-react';
import { MythVerificationResponse } from '@/types';
import { Progress } from "@/components/ui/progress";
import { trackMythChecked } from '@/lib/analytics';
import { API_ENDPOINTS, VALIDATION } from '@/lib/constants';

/**
 * Returns display metadata for a given myth verification verdict.
 */
function getVerdictDetails(verdict: string) {
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
}

/**
 * MythBuster component — AI-powered election fact-checking tool.
 * Analyzes user-submitted claims and returns structured verdicts.
 */
function MythBusterComponent() {
  const [claim, setClaim] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<MythVerificationResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleVerify = useCallback(async () => {
    if (!claim.trim() || claim.length < VALIDATION.CLAIM_MIN_LENGTH) return;
    
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch(API_ENDPOINTS.MYTH_VERIFY, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ claim: claim.trim(), userId: "guest" }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to verify claim');
      }

      const data = await response.json();
      setResult(data);

      // Track analytics event
      trackMythChecked(data.verdict, data.confidence);

    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Service unavailable. Please try again later.';
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [claim]);

  const handleClaimChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setClaim(e.target.value);
  }, []);

  return (
    <Card className="w-full max-w-2xl mx-auto shadow-xl" role="region" aria-label="Election Myth Buster Tool">
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
            onChange={handleClaimChange}
            className="min-h-[100px] resize-none focus-visible:ring-primary/40 text-base"
            disabled={loading}
            maxLength={VALIDATION.CLAIM_MAX_LENGTH}
            aria-label="Claim input"
            aria-describedby="claim-help"
          />
          <div id="claim-help" className="flex justify-between items-center text-xs text-muted-foreground px-1">
             <span>Minimum {VALIDATION.CLAIM_MIN_LENGTH} characters.</span>
             <span className={claim.length === VALIDATION.CLAIM_MAX_LENGTH ? 'text-red-500' : ''}>{claim.length}/{VALIDATION.CLAIM_MAX_LENGTH}</span>
          </div>
        </div>

        {error && (
            <p className="text-red-500 text-sm font-medium p-3 bg-red-500/10 rounded-md border border-red-500/20" role="alert">{error}</p>
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
                            return <Icon className="w-8 h-8" aria-hidden="true" />;
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
                            <span aria-label={`Confidence level: ${result.confidence} percent`}>{result.confidence}%</span>
                        </div>
                        <Progress value={result.confidence} className="h-1.5 w-full" aria-label={`Confidence: ${result.confidence}%`} />
                    </div>
                </div>

                <p className="text-sm md:text-base mb-4 leading-relaxed font-medium opacity-90">
                  {result.explanation}
                </p>

                <div className="pt-4 mt-auto border-t border-black/10 dark:border-white/10 flex flex-col md:flex-row justify-between gap-3 md:items-center text-sm">
                   {result.referenceSource && result.referenceSource.toLowerCase() !== "none" && (
                       <div className="flex items-center gap-1.5 text-blue-600 dark:text-blue-400 font-medium bg-blue-500/10 px-2 py-1 rounded">
                           <LinkIcon className="w-3.5 h-3.5" aria-hidden="true" />
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
          disabled={loading || claim.length < VALIDATION.CLAIM_MIN_LENGTH} 
          className="w-full font-bold h-12 text-lg shadow-md transition-all hover:shadow-lg active:scale-[0.98]"
        >
          {loading ? (
            <><Loader2 className="mr-2 h-5 w-5 animate-spin" aria-hidden="true" /> Verifying Fact...</>
          ) : 'Check Fact'}
        </Button>
        <p className="flex items-center text-xs text-muted-foreground mt-4 text-center" role="note">
            <Info className="w-3 h-3 mr-1" aria-hidden="true" /> AI analysis based on general election rules. Always consult official sources.
        </p>
      </CardFooter>
    </Card>
  );
}

export const MythBuster = memo(MythBusterComponent);
