import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../services/supabaseClient';
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
        const { error } = await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: {
                redirectTo: window.location.origin // Redirect back to Vercel app
            }
        });
        if (error) throw error;
    };

    const logout = async () => {
        await supabase.auth.signOut();
        setUser(null);
    };

    const deductCredits = async (cost: number, action: string): Promise<boolean> => {
        if (!user) return false;

        // Call the Postgres function we defined in SQL Editor
        const { data, error } = await supabase.rpc('deduct_credits', { amount: cost });

        if (error) {
            console.error("Credit transaction failed:", error);
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