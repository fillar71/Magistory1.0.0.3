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
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    // Fetch profile data (credits) from 'profiles' table
    const fetchProfile = async (authUser: SupabaseUser) => {
        if (!isSupabaseConfigured) return;
        
        try {
            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', authUser.id)
                .single();

            if (data) {
                setUser({
                    id: authUser.id,
                    email: authUser.email || '',
                    name: data.full_name || authUser.user_metadata.full_name || 'User',
                    credits: data.credits
                });
            } else if (error) {
                console.error("Error fetching profile:", error);
            }
        } catch (e) {
            console.error(e);
        }
    };

    useEffect(() => {
        if (!isSupabaseConfigured) {
            // In Demo mode, we don't persist session automatically to avoid confusion, 
            // or we could check localStorage manually. For now, simple init.
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
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            if (session?.user) {
                fetchProfile(session.user);
            } else {
                setUser(null);
            }
            setIsLoading(false);
        });

        return () => subscription.unsubscribe();
    }, []);

    const loginWithGoogle = async () => {
        if (!isSupabaseConfigured) {
            console.warn("Supabase not configured. Using Mock Login for Demo.");
            // SIMULATE LOGIN for Demo Mode
            setUser({
                id: 'demo-user-123',
                name: 'Demo User',
                email: 'demo@magistory.com',
                credits: 50 // Give free credits in demo mode
            });
            return;
        }

        const { error } = await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: {
                redirectTo: window.location.origin // Redirect back to Vercel app
            }
        });
        if (error) throw error;
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

        // REAL MODE LOGIC
        // Call the Postgres function we defined in SQL Editor
        const { data, error } = await supabase.rpc('deduct_credits', { amount: cost });

        if (error) {
            console.error("Credit transaction failed:", error);
            // Fallback for UI if RPC fails but we are logged in (e.g. network glitch)
            return false;
        }

        if (data === true) {
            // Update local state to reflect new balance immediately
            setUser(prev => prev ? { ...prev, credits: prev.credits - cost } : null);
            return true;
        } else {
            alert("Insufficient credits!");
            return false;
        }
    };

    return (
        <AuthContext.Provider value={{ user, loginWithGoogle, logout, deductCredits, isLoading }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) throw new Error("useAuth must be used within an AuthProvider");
    return context;
};