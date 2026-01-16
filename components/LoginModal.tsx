import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import LoadingSpinner from './LoadingSpinner';
import { MagicWandIcon } from './icons';

interface LoginModalProps {
    isOpen: boolean;
    onClose?: () => void;
    message?: string;
}

const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onClose, message }) => {
    const { loginWithGoogle } = useAuth();
    const [isProcessing, setIsProcessing] = useState(false);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);

    if (!isOpen) return null;

    const handleGoogleLogin = async () => {
        setIsProcessing(true);
        setErrorMsg(null);
        try {
            await loginWithGoogle();
            // User will be redirected, so no need to close modal explicitly here usually
        } catch (err: any) {
            console.error("Login Error:", err);
            setErrorMsg(err.message || "Failed to connect to Google.");
            setIsProcessing(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-md flex items-center justify-center z-[100] animate-fade-in">
            <div className="bg-gray-800 p-8 rounded-xl shadow-2xl border border-gray-700 text-center max-w-md w-full relative">
                
                {onClose && (
                    <button onClick={onClose} className="absolute top-4 right-4 text-gray-500 hover:text-white text-xl">✕</button>
                )}

                <div className="flex justify-center mb-6">
                    <div className="w-16 h-16 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-purple-900/50">
                         <MagicWandIcon className="w-8 h-8 text-white" />
                    </div>
                </div>

                <h2 className="text-2xl font-bold text-white mb-2">Welcome to Magistory</h2>
                <p className="text-gray-400 mb-8">{message || "Sign in to generate AI videos instantly."}</p>
                
                {errorMsg && (
                    <div className="mb-6 p-3 bg-red-900/30 border border-red-500/50 rounded text-red-200 text-xs text-left">
                        <strong>Error:</strong> {errorMsg}
                    </div>
                )}

                <div className="flex flex-col gap-4">
                    <button 
                        onClick={handleGoogleLogin}
                        disabled={isProcessing}
                        className="w-full py-3 bg-white hover:bg-gray-100 text-gray-900 font-bold rounded-lg transition-transform hover:scale-[1.02] flex items-center justify-center gap-2 shadow-lg disabled:opacity-70"
                    >
                        {isProcessing ? <LoadingSpinner /> : (
                            <svg className="w-5 h-5" viewBox="0 0 24 24">
                                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                            </svg>
                        )}
                        {isProcessing ? 'Connecting...' : 'Sign in with Google'}
                    </button>
                    
                    <p className="text-[10px] text-gray-500 mt-2">
                        Secured by Supabase Authentication.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default LoginModal;