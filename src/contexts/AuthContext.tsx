
"use client";

import type { ReactNode } from 'react';
import { createContext, useContext, useEffect, useState } from 'react';
import { auth, googleProvider, signInWithPopup, signOut as firebaseSignOut, onAuthStateChanged, type User } from '@/lib/firebase';
import { useToast } from "@/hooks/use-toast";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    if (!auth) {
      console.error("AuthContext: Firebase Auth instance is not available. Cannot set up onAuthStateChanged listener.");
      setLoading(false);
      return;
    }
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
      if (currentUser) {
        console.log("AuthContext: User state changed, user:", currentUser.uid);
      } else {
        console.log("AuthContext: User state changed, no user.");
      }
    });
    return () => unsubscribe();
  }, []);

  const signInWithGoogle = async () => {
    if (!auth || !googleProvider) {
      console.error("AuthContext: Firebase Auth or Google Provider is not available. Cannot sign in.");
      toast({
        title: "Configuration Error",
        description: "Firebase authentication is not properly configured. Please contact support.",
        variant: "destructive",
      });
      return;
    }
    setLoading(true);
    try {
      await signInWithPopup(auth, googleProvider);
      // onAuthStateChanged will handle setting the user and setLoading(false)
      toast({
        title: "Signed In",
        description: "Successfully signed in with Google.",
      });
    } catch (error) {
      console.error("AuthContext: Error signing in with Google:", error); // Log the full error object
      const firebaseError = error as { code?: string; message?: string };
      toast({
        title: "Sign-in Error",
        description: firebaseError.message || "Failed to sign in with Google. Check console for details.",
        variant: "destructive",
      });
      setLoading(false); // Ensure loading is false on error
    }
  };

  const logout = async () => {
    if (!auth) {
      console.error("AuthContext: Firebase Auth is not available. Cannot sign out.");
      toast({
        title: "Configuration Error",
        description: "Firebase authentication is not properly configured.",
        variant: "destructive",
      });
      return;
    }
    setLoading(true);
    try {
      await firebaseSignOut(auth);
      // onAuthStateChanged will handle setting the user to null and setLoading(false)
      toast({
        title: "Signed Out",
        description: "Successfully signed out.",
      });
    } catch (error) {
      console.error("AuthContext: Error signing out:", error); // Log the full error object
      const firebaseError = error as { code?: string; message?: string };
      toast({
        title: "Sign-out Error",
        description: firebaseError.message || "Failed to sign out. Check console for details.",
        variant: "destructive",
      });
      setLoading(false); // Ensure loading is false on error
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, signInWithGoogle, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
