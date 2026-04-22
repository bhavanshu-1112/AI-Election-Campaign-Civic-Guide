'use client';

import { useState, useCallback, memo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { VoterJourneyResponse } from '@/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Check, ClipboardList, AlertCircle, ArrowRight } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { trackJourneyGenerated } from '@/lib/analytics';
import { API_ENDPOINTS, VALIDATION } from '@/lib/constants';

const formSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  state: z.string().min(1, 'State is required'),
  city: z.string().min(1, 'City is required'),
  age: z.string().min(1, 'Age is required'),
  isFirstTimeVoter: z.boolean(),
  role: z.enum(['voter', 'candidate']),
});

type FormValues = z.infer<typeof formSchema>;

/**
 * Voter Journey component — generates a personalized election roadmap.
 * Uses Google Gemini AI via the voter journey API endpoint.
 */
function VoterJourneyComponent() {
  const [journeyContent, setJourneyContent] = useState<VoterJourneyResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { register, handleSubmit, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      isFirstTimeVoter: true,
      role: 'voter',
      age: ''
    }
  });

  const onSubmit = useCallback(async (values: FormValues) => {
    
    if (parseInt(values.age) < VALIDATION.MIN_VOTING_AGE) {
        setError('Must be at least 18 to vote.');
        return;
    }
    
    setLoading(true);
    setError(null);
    try {
      const payload = {
        name: values.name,
        location: { state: values.state, city: values.city },
        age: parseInt(values.age),
        isFirstTimeVoter: values.isFirstTimeVoter,
        role: values.role
      };

      const response = await fetch(API_ENDPOINTS.VOTER_JOURNEY, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to generate journey');
      }

      const data = await response.json();
      setJourneyContent(data);

      // Track analytics event
      trackJourneyGenerated(values.state, values.isFirstTimeVoter);

    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Something went wrong';
      setError(message);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleReset = useCallback(() => setJourneyContent(null), []);

  return (
    <div className="w-full max-w-4xl mx-auto space-y-8" role="region" aria-label="Personalized Voter Journey Builder">
      {!journeyContent ? (
        <Card className="shadow-lg border-2 border-primary/20 bg-background/50 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-3xl font-bold bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">Get Your Election Roadmap</CardTitle>
            <CardDescription>Enter your details and an AI guide will instantly prepare your required documents, deadlines, and next steps.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input id="name" {...register('name')} aria-invalid={!!errors.name} aria-describedby={errors.name ? 'name-error' : undefined} />
                  {errors.name && <p id="name-error" className="text-sm text-red-500" role="alert">{errors.name.message as string}</p>}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="age">Age</Label>
                  <Input id="age" type="number" {...register('age')} aria-invalid={!!errors.age} aria-describedby={errors.age ? 'age-error' : undefined} />
                  {errors.age && <p id="age-error" className="text-sm text-red-500" role="alert">{errors.age.message as string}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="state">State</Label>
                  <Input id="state" {...register('state')} aria-invalid={!!errors.state} aria-describedby={errors.state ? 'state-error' : undefined} />
                  {errors.state && <p id="state-error" className="text-sm text-red-500" role="alert">{errors.state.message as string}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="city">City</Label>
                  <Input id="city" {...register('city')} aria-invalid={!!errors.city} aria-describedby={errors.city ? 'city-error' : undefined} />
                  {errors.city && <p id="city-error" className="text-sm text-red-500" role="alert">{errors.city.message as string}</p>}
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <input type="checkbox" id="firstTime" {...register('isFirstTimeVoter')} className="w-4 h-4 rounded appearance-none border border-primary checked:bg-primary checked:after:content-['✓'] checked:after:text-white flex items-center justify-center"/>
                <Label htmlFor="firstTime">I am a first-time voter</Label>
              </div>

              {error && (
                <Alert variant="destructive" role="alert">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Error</AlertTitle>
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <Button type="submit" className="w-full font-bold h-12 text-lg transition-transform hover:scale-[1.02]" disabled={loading} aria-busy={loading}>
                {loading ? 'Generating Strategy...' : 'Generate Roadmap'} <ArrowRight className="ml-2 w-5 h-5"/>
              </Button>
            </form>
          </CardContent>
        </Card>
      ) : (
        <AnimatePresence>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6" aria-live="polite">
                
                <Alert className="bg-primary/10 border-primary/20">
                    <ClipboardList className="h-5 w-5 text-primary" />
                    <AlertTitle className="text-lg font-semibold text-primary">Your Strategy is Ready</AlertTitle>
                    <AlertDescription className="text-muted-foreground mt-1">
                        {journeyContent.summary}
                    </AlertDescription>
                </Alert>

                {journeyContent.urgentActions.length > 0 && (
                     <Card className="border-orange-500/50 bg-orange-500/5 dark:bg-orange-500/10">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-orange-600 dark:text-orange-400 text-lg flex items-center">
                                <AlertCircle className="w-5 h-5 mr-2" /> Urgent Actions
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <ul className="list-disc list-inside space-y-1 text-sm text-foreground/80">
                                {journeyContent.urgentActions.map((action, i) => (
                                    <li key={i}>{action}</li>
                                ))}
                            </ul>
                        </CardContent>
                    </Card>
                )}

                <div className="space-y-4 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-primary/30 before:to-transparent">
                     {journeyContent.steps.map((step, idx) => (
                        <motion.div 
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: idx * 0.15 }}
                            key={idx} 
                            className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active"
                        >
                            <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-background bg-primary text-primary-foreground shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 font-bold z-10">
                                {step.order}
                            </div>
                            
                            <Card className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] hover:shadow-md transition-shadow">
                                <CardHeader className="p-4">
                                    <CardTitle className="text-xl flex justify-between items-start">
                                        <span>{step.title}</span>
                                    </CardTitle>
                                    <CardDescription className="text-primary font-medium">{step.deadline}</CardDescription>
                                </CardHeader>
                                <CardContent className="p-4 pt-0 space-y-3">
                                    <p className="text-sm">{step.description}</p>
                                    
                                    {step.documents.length > 0 && (
                                        <div className="pt-2 border-t text-sm">
                                            <span className="font-semibold text-xs uppercase tracking-wider text-muted-foreground block mb-1">Required</span>
                                            <ul className="space-y-1">
                                                {step.documents.map((doc, i) => (
                                                    <li key={i} className="flex items-start text-xs"><Check className="w-3 h-3 text-green-500 mr-2 shrink-0 mt-0.5" />{doc}</li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </motion.div>
                     ))}
                </div>
                
                <Button variant="outline" onClick={handleReset} className="w-full mt-8">Start Over</Button>

            </motion.div>
        </AnimatePresence>
      )}
    </div>
  );
}

export const VoterJourney = memo(VoterJourneyComponent);
