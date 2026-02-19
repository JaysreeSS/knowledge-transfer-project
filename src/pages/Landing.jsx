import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from "../contexts/AuthContext.jsx";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Eye, EyeOff, Loader2, ArrowRight } from "lucide-react";
import logo from '../assets/logo.png';

export default function Landing() {
    const { user, login } = useAuth();
    const navigate = useNavigate();

    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    // Unified navigation logic based on user role
    useEffect(() => {
        if (user) {
            if (user.role === 'System Admin' || user.isAdmin) {
                navigate('/admin');
            } else if (user.role === 'Manager') {
                navigate('/manager');
            } else {
                // Default to ICR Dashboard for other roles
                navigate('/icr/dashboard');
            }
        }
    }, [user, navigate]);

    const handleLogin = async (e) => {
        e.preventDefault();
        setError("");
        setIsLoading(true);

        try {
            // Initiate login - state updates via AuthContext will trigger navigation
            const response = await login(username, password);

            // Only handle errors here. Success case is handled by useEffect.
            if (!response.success) {
                setError(response.error || "Invalid credentials.");
                setIsLoading(false);
            }
            // If success, keep loading state valid until navigation happens (component unmounts)
        } catch (err) {
            setIsLoading(false);
            setError("An error occurred during login.");
        }
    };


    return (
        <div className="min-h-screen w-full bg-[#f8f9fc] flex flex-col items-center justify-center relative overflow-hidden font-sans">

            {/* Subtle Background Blobs */}
            <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] bg-indigo-50/50 rounded-full blur-[100px] pointer-events-none" />
            <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] bg-blue-50/50 rounded-full blur-[100px] pointer-events-none" />

            <div className="z-10 w-full max-w-sm px-4 flex flex-col items-center animate-in fade-in zoom-in-95 duration-700">

                {/* Minimal Header */}
                <header className="text-center mb-8 space-y-3">
                    <div className="flex justify-center mb-4">
                        {/* <img
                            src={logo}
                            alt="Logo"
                            className="h-10 w-auto opacity-90 grayscale-[0.2]"
                        /> */}
                    </div>
                    <h1 className="text-lg font-black tracking-tight text-slate-800 uppercase">
                        Knowledge Transfer Portal
                    </h1>
                </header>

                {/* Login Card */}
                <Card className="w-full border-none shadow-xl shadow-slate-200/50 bg-white/80 backdrop-blur-sm rounded-2xl overflow-hidden ring-1 ring-slate-100">
                    <CardContent className="p-8 pt-8">
                        <form onSubmit={handleLogin} className="space-y-5">
                            <div className="space-y-2">
                                <Label htmlFor="username" className="text-xs font-black text-slate-500 uppercase tracking-widest ml-1">
                                    System ID
                                </Label>
                                <Input
                                    id="username"
                                    placeholder="Enter your username"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    className="h-10 rounded-lg bg-slate-50 border-slate-200 focus:bg-white focus:ring-2 focus:ring-primary/20 transition-all font-bold text-slate-900 text-sm"
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="password" className="text-xs font-black text-slate-500 uppercase tracking-widest ml-1">
                                    Password
                                </Label>
                                <div className="relative">
                                    <Input
                                        id="password"
                                        type={showPassword ? "text" : "password"}
                                        placeholder="••••••••"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="h-10 rounded-lg bg-slate-50 border-slate-200 focus:bg-white focus:ring-2 focus:ring-primary/20 transition-all pr-10 text-slate-900 font-bold text-sm"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                                    >
                                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                    </button>
                                </div>
                            </div>

                            {error && (
                                <div className="p-3 rounded-lg bg-red-50 text-red-600 text-xs font-semibold text-center animate-in fade-in">
                                    {error}
                                </div>
                            )}

                            <Button
                                type="submit"
                                disabled={isLoading}
                                className="w-full h-11 bg-primary hover:bg-primary/90 text-white rounded-lg font-bold uppercase tracking-widest text-[10px] shadow-md hover:shadow-lg transition-all"
                            >
                                {isLoading ? (
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                    <span className="flex items-center gap-2">
                                        Sign In <ArrowRight className="w-4 h-4" />
                                    </span>
                                )}
                            </Button>
                        </form>
                    </CardContent>
                </Card>

                {/* Footer - Contained within layout */}
                <footer className="mt-8 text-center space-y-2">
                    <p className="text-xs text-slate-400 font-bold uppercase tracking-tight">
                        © {new Date().getFullYear()} Ideassion KT Portal
                    </p>
                    <div className="flex justify-center gap-4 text-[10px] text-slate-300 font-bold uppercase tracking-widest">
                        <span className="hover:text-primary transition-colors cursor-pointer">Privacy</span>
                        <span className="hover:text-primary transition-colors cursor-pointer">Help</span>
                    </div>
                </footer>

            </div>
        </div>
    );
}
