'use client';

import { useState, useRef, useEffect, useCallback, memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card } from '@/components/ui/card';
import { Send, Bot, User, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { FAQResponse } from '@/types';
import { trackFAQAsked } from '@/lib/analytics';
import { API_ENDPOINTS } from '@/lib/constants';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  metadata?: FAQResponse;
}

/**
 * FAQ Bot component — conversational AI assistant for election queries.
 * Maintains session state for multi-turn conversations via Firestore.
 */
function FAQBotComponent({ userId = 'guest' }: { userId?: string }) {
  const [messages, setMessages] = useState<Message[]>([
    { id: 'initial', role: 'assistant', content: 'Hello! I am your neutral election guide for India. How can I help you understand the voting process today?' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
        const scrollContainer = scrollRef.current.querySelector('[data-radix-scroll-area-viewport]');
        if(scrollContainer) {
            scrollContainer.scrollTo({ top: scrollContainer.scrollHeight, behavior: 'smooth' });
        }
    }
  }, [messages, isLoading]);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    const newMessageId = Date.now().toString();

    setMessages(prev => [...prev, { id: newMessageId, role: 'user', content: userMessage }]);
    setIsLoading(true);

    try {
      const response = await fetch(API_ENDPOINTS.FAQ_CHAT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMessage, userId, sessionId }),
      });

      if (!response.ok) throw new Error('API request failed');

      const data = await response.json();
      
      if (data.sessionId && !sessionId) {
        setSessionId(data.sessionId);
      }

      setMessages(prev => [...prev, { 
        id: (Date.now() + 1).toString(), 
        role: 'assistant', 
        content: data.answer,
        metadata: data as FAQResponse
      }]);

      // Track analytics
      trackFAQAsked(userMessage.length);

    } catch {
      setMessages(prev => [...prev, { 
          id: (Date.now() + 1).toString(), 
          role: 'assistant', 
          content: 'Sorry, I am having trouble connecting right now. Please try again later.' 
      }]);
    } finally {
      setIsLoading(false);
    }
  }, [input, isLoading, userId, sessionId]);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);
  }, []);

  return (
    <Card className="flex flex-col h-[600px] w-full max-w-2xl mx-auto shadow-xl border-primary/20 overflow-hidden bg-background/50 backdrop-blur" role="region" aria-label="Election FAQ Chatbot">
        
      <div className="bg-primary/10 p-4 border-b flex items-center shadow-sm">
         <div className="bg-primary p-2 rounded-full mr-3 text-primary-foreground">
             <Bot className="w-5 h-5" />
         </div>
         <div>
            <h2 className="font-bold">Election Support Bot</h2>
            <p className="text-xs text-muted-foreground flex items-center">
                <span className="w-2 h-2 rounded-full bg-green-500 mr-1 animate-pulse" aria-hidden="true"></span>Online
            </p>
         </div>
      </div>

      <ScrollArea className="flex-1 p-4" ref={scrollRef}>
        <div className="space-y-4" role="log" aria-label="Chat messages" aria-live="polite">
          <AnimatePresence initial={false}>
            {messages.map((msg) => (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                className={`flex w-full ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`flex max-w-[85%] ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                    
                    <div className={`shrink-0 flex items-center justify-center w-8 h-8 rounded-full mt-auto ${msg.role === 'user' ? 'bg-primary text-primary-foreground ml-2' : 'bg-muted border mr-2'}`} aria-hidden="true">
                        {msg.role === 'user' ? <User className="w-4 h-4"/> : <Bot className="w-4 h-4 text-primary" />}
                    </div>
                    
                    <div className={`flex flex-col space-y-1 ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                        <div className={`p-3 rounded-2xl shadow-sm text-sm ${
                            msg.role === 'user' 
                                ? 'bg-primary text-primary-foreground rounded-br-sm' 
                                : 'bg-card border rounded-bl-sm'
                            }`}
                        >
                            <p className="whitespace-pre-wrap">{msg.content}</p>
                        </div>
                        
                        {/* Render Metadata for assistant responses */}
                        {msg.metadata && msg.metadata.isElectionRelated && (
                            <div className="flex flex-col gap-1 w-full mt-1 px-1">
                                {msg.metadata.confidence < 60 ? (
                                    <span className="text-[10px] text-amber-500 flex items-center"><AlertTriangle className="w-3 h-3 mr-1" aria-hidden="true"/> Unverified / Low Confidence</span>
                                ) : (
                                    <span className="text-[10px] text-green-600 flex items-center"><CheckCircle2 className="w-3 h-3 mr-1" aria-hidden="true"/> High Confidence</span>
                                )}
                                <span className="text-[10px] text-muted-foreground opacity-80">{msg.metadata.disclaimer}</span>
                            </div>
                        )}
                    </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
          
          {isLoading && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start" role="status" aria-label="Bot is typing">
              <div className="flex bg-muted p-4 rounded-2xl rounded-bl-sm ml-10 space-x-2 w-16 justify-center">
                 <div className="w-2 h-2 rounded-full bg-primary/40 animate-bounce" style={{ animationDelay: '0ms' }} />
                 <div className="w-2 h-2 rounded-full bg-primary/40 animate-bounce" style={{ animationDelay: '150ms' }} />
                 <div className="w-2 h-2 rounded-full bg-primary/40 animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </motion.div>
          )}
        </div>
      </ScrollArea>

      <div className="p-4 bg-background/80 backdrop-blur border-t">
        <form onSubmit={handleSubmit} className="flex gap-2 relative">
          <Input 
            value={input}
            onChange={handleInputChange}
            placeholder="Ask about registration, dates, documents..."
            className="flex-1 pr-12 rounded-full border-primary/20 focus-visible:ring-primary/50"
            disabled={isLoading}
            aria-label="Chat input"
          />
          <Button 
            type="submit" 
            size="icon" 
            disabled={isLoading || !input.trim()} 
            className="absolute right-1 top-1 bottom-1 h-auto rounded-full w-10 shrink-0 shadow-none transition-transform hover:scale-105 active:scale-95"
            aria-label="Send message"
          >
            <Send className="w-4 h-4 ml-0.5" />
          </Button>
        </form>
        <p className="text-center text-[10px] text-muted-foreground mt-2" role="note">AI can make mistakes. Check official election sources.</p>
      </div>
    </Card>
  );
}

export const FAQBot = memo(FAQBotComponent);
