import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase, isSupabaseConfigured } from '../services/supabaseClient';
import { User as SupabaseUser } from '@supabase/supabase-js';

interface User {
    id: string;
    name: string;
    email: string;
    credits: number;
}

interface AuthContextType {
    user: User | null;
    loginWithGoogle: () => Promise<void>;
    logout: () => Promise<void>;
    deductCredits: (cost: number, action: string) => Promise<boolean>;
    isLoading: boolean;
    error: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Fetch profile data (credits) from 'profiles' table
    const fetchProfile = async (authUser: SupabaseUser) => {
        if (!isSupabaseConfigured) return;
        
        try {
            // First, try to get existing profile
            let { data, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', authUser.id)
                .single();

            // If profile doesn't exist, create it (Upsert)
            if (!data) {
                const newProfile = {
                    id: authUser.id,
                    full_name: authUser.user_metadata.full_name || authUser.email?.split('@')[0] || 'User',
                    credits: 10, // Default free credits
                    email: authUser.email
                };
                
                const { data: createdData, error: createError } = await supabase
                    .from('profiles')
                    .upsert(newProfile)
                    .select()
                    .single();
                
                if (createError) throw createError;
                data = createdData;
            }

            if (data) {
                setUser({
                    id: authUser.id,
                    email: authUser.email || '',
                    name: data.full_name || 'User',
                    credits: data.credits
                });
            }
        } catch (e: any) {
            console.error("Error fetching/creating profile:", e);
            // Fallback user object if profile fetch fails but auth succeeded
            setUser({
                id: authUser.id,
                email: authUser.email || '',
                name: authUser.user_metadata.full_name || 'User',
                credits: 0 // Show 0 credits on error
            });
        }
    };

    useEffect(() => {
        if (!isSupabaseConfigured) {
            setIsLoading(false);
            return;
        }

        // Check active session
        supabase.auth.getSession().then(({ data: { session } }) => {
            if (session?.user) {
                fetchProfile(session.user);
            }
            setIsLoading(false);
        });

        // Listen for auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
            if (event === 'SIGNED_IN' && session?.user) {
                await fetchProfile(session.user);
            } else if (event === 'SIGNED_OUT') {
                setUser(null);
            }
            setIsLoading(false);
        });

        return () => subscription.unsubscribe();
    }, []);

    const loginWithGoogle = async () => {
        setError(null);
        if (!isSupabaseConfigured) {
            console.warn("Supabase not configured. Using Mock Login for Demo.");
            // SIMULATE LOGIN for Demo Mode
            setTimeout(() => {
                setUser({
                    id: 'demo-user-123',
                    name: 'Demo User',
                    email: 'demo@magistory.com',
                    credits: 50
                });
            }, 1000);
            return;
        }

        // Detect current URL to redirect back correctly (handles localhost vs production)
        const redirectUrl = window.location.origin;

        const { error } = await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: {
                redirectTo: redirectUrl,
                queryParams: {
                    access_type: 'offline',
                    prompt: 'consent',
                },
            }
        });
        
        if (error) {
            console.error("Supabase Login Error:", error);
            setError(error.message);
            throw error;
        }
    };

    const logout = async () => {
        if (isSupabaseConfigured) {
            await supabase.auth.signOut();
        }
        setUser(null);
    };

    const deductCredits = async (cost: number, action: string): Promise<boolean> => {
        if (!user) return false;

        // DEMO MODE LOGIC
        if (!isSupabaseConfigured) {
            if (user.credits >= cost) {
                setUser(prev => prev ? { ...prev, credits: prev.credits - cost } : null);
                return true;
            } else {
                alert("Insufficient demo credits! Refresh to reset.");
                return false;
            }
        }

        // REAL MODE LOGIC via RPC
        try {
            const { data, error } = await supabase.rpc('deduct_credits', { amount: cost });

            if (error) {
                console.error("Credit transaction failed:", error);
                // Fallback: Optimistic update if RPC fails but user has credits (not ideal but keeps UX smooth)
                // Ideally, you should show an error.
                return false;
            }

            if (data === true) {
                setUser(prev => prev ? { ...prev, credits: prev.credits - cost } : null);
                return true;
            } else {
                alert("Insufficient credits! Please top up.");
                return false;
            }
        } catch (e) {
            console.error(e);
            return false;
        }
    };

    return (
        <AuthContext.Provider value={{ user, loginWithGoogle, logout, deductCredits, isLoading, error }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) throw new Error("useAuth must be used within an AuthProvider");
    return context;
};