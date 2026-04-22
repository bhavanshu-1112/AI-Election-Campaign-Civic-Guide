/**
 * @fileoverview Firebase Authentication context provider with Google Sign-In.
 * Provides authenticated user state to the entire application tree.
 * Integrates with Firebase Analytics for sign-in/sign-out tracking.
 */

'use client';

import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from 'react';
import Image from 'next/image';
import { 
  onAuthStateChanged, 
  signInWithPopup, 
  GoogleAuthProvider, 
  signOut as firebaseSignOut, 
  type User 
} from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { trackUserSignedIn, trackUserSignedOut } from '@/lib/analytics';
import { Button } from '@/components/ui/button';
import { LogIn, LogOut, User as UserIcon } from 'lucide-react';

// ─── Context Type ───────────────────────────────────────────────────────────

interface AuthContextType {
  /** The authenticated Firebase user, or null if not signed in */
  user: User | null;
  /** Whether auth state is still being determined */
  loading: boolean;
  /** Trigger Google Sign-In popup */
  signInWithGoogle: () => Promise<void>;
  /** Sign the user out */
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  signInWithGoogle: async () => {},
  signOut: async () => {},
});

/**
 * Hook to access the authentication context.
 * Must be used within an AuthProvider tree.
 *
 * @returns The current auth context with user state and actions
 */
export const useAuth = (): AuthContextType => useContext(AuthContext);

// ─── Provider Component ─────────────────────────────────────────────────────

const googleProvider = new GoogleAuthProvider();

/**
 * Wraps the application tree with Firebase Authentication state.
 * Listens to auth state changes and provides sign-in/sign-out actions.
 */
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signInWithGoogle = useCallback(async () => {
    try {
      await signInWithPopup(auth, googleProvider);
      trackUserSignedIn('google');
    } catch (error) {
      console.error('Sign-in failed:', error);
    }
  }, []);

  const signOut = useCallback(async () => {
    try {
      await firebaseSignOut(auth);
      trackUserSignedOut();
    } catch (error) {
      console.error('Sign-out failed:', error);
    }
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, signInWithGoogle, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

// ─── Auth UI Component ──────────────────────────────────────────────────────

/**
 * Compact auth button that shows Sign In or user avatar + sign out.
 * Designed for the header/navbar area.
 */
export function AuthButton() {
  const { user, loading, signInWithGoogle, signOut } = useAuth();

  if (loading) {
    return (
      <div className="h-10 w-24 rounded-full bg-muted animate-pulse" aria-label="Loading authentication status" />
    );
  }

  if (user) {
    return (
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20">
          {user.photoURL ? (
            <Image 
              src={user.photoURL} 
              alt={user.displayName || 'User avatar'} 
              width={24}
              height={24}
              className="w-6 h-6 rounded-full" 
              referrerPolicy="no-referrer"
            />
          ) : (
            <UserIcon className="w-4 h-4 text-primary" />
          )}
          <span className="text-sm font-medium truncate max-w-[120px]">
            {user.displayName || user.email || 'User'}
          </span>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={signOut}
          className="rounded-full h-8 w-8"
          aria-label="Sign out"
        >
          <LogOut className="w-4 h-4" />
        </Button>
      </div>
    );
  }

  return (
    <Button
      variant="outline"
      onClick={signInWithGoogle}
      className="rounded-full gap-2 font-semibold border-primary/30 hover:bg-primary/10 transition-all"
      aria-label="Sign in with Google"
    >
      <LogIn className="w-4 h-4" />
      Sign In
    </Button>
  );
}
