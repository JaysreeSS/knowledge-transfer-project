import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from "../contexts/AuthContext.jsx";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Eye, EyeOff, Loader2, ArrowRight } from "lucide-react";
import logo from '../assets/logo.png';
import logoSmall from '../assets/logo-small.png';

/* ── Twinkling and drifting galaxy background ── */
function StarryBackground() {
    const stars = useMemo(() =>
        Array.from({ length: 150 }, (_, i) => ({
            id: i,
            x: Math.random() * 110 - 5, // Slightly wider than 100% to cover drift
            y: Math.random() * 110 - 5,
            size: 0.4 + Math.random() * 1.4,
            duration: 4 + Math.random() * 6,
            driftDuration: 100 + Math.random() * 150,
            delay: Math.random() * -10,
            opacity: 0.2 + Math.random() * 0.8,
        }))
        , []);

    return (
        <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
            {/* Brightened space gradient following app theme */}
            <div className="absolute inset-0 bg-gradient-to-br from-[#1a0a2e] via-[#2d1450] to-[#1a0a2e]" />

            {/* Galactic glow spots (Nebulae) - Higher visibility */}
            <div className="absolute top-[10%] left-[20%] w-[800px] h-[800px] rounded-full bg-primary/10 blur-[140px] animate-pulse [animation-duration:5s]" />
            <div className="absolute bottom-[20%] right-[10%] w-[600px] h-[600px] rounded-full bg-primary/5 blur-[120px] animate-pulse [animation-duration:10s]" />
            <div className="absolute top-[50%] left-[50%] -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[400px] rounded-full bg-primary/5 blur-[150px] rotate-45" />

            {/* Drifting Galaxy Stars */}
            <svg className="absolute inset-0 w-full h-full">
                {stars.map((star) => (
                    <circle
                        key={star.id}
                        cx={`${star.x}%`}
                        cy={`${star.y}%`}
                        r={star.size}
                        fill="white"
                        className="opacity-0"
                        style={{
                            animation: `
                                twinkle ${star.duration}s ease-in-out ${star.delay}s infinite,
                                drift ${star.driftDuration}s linear ${star.delay}s infinite
                            `,
                            filter: star.size > 1.2 ? 'blur(0.5px)' : 'none'
                        }}
                    />
                ))}
            </svg>

            <style>{`
                @keyframes twinkle {
                    0%, 100% { opacity: ${0.1}; }
                    50% { opacity: ${0.7}; }
                }
                @keyframes drift {
                    0% { transform: translate(0, 0); }
                    100% { transform: translate(-30px, -30px); }
                }
            `}</style>
        </div>
    );
}

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
                navigate('/icr/dashboard');
            }
        }
    }, [user, navigate]);

    const handleLogin = async (e) => {
        e.preventDefault();
        setError("");
        setIsLoading(true);

        try {
            const response = await login(username, password);

            if (!response.success) {
                setError(response.error || "Invalid credentials.");
                setIsLoading(false);
            }
        } catch (err) {
            setIsLoading(false);
            setError("An error occurred during login.");
        }
    };

    return (
        <div className="min-h-screen w-full flex flex-col items-center justify-center relative overflow-hidden font-sans antialiased text-base">

            {/* Animated Starry Background */}
            <StarryBackground />

            <div className="z-10 w-full max-w-sm px-4 flex flex-col items-center animate-in fade-in zoom-in-95 duration-700">

                {/* Logo & Title */}
                <header className="flex items-center justify-center gap-4 mb-10">
                    <div className="transition-transform duration-500 hover:scale-105">
                        <img
                            src={logoSmall}
                            alt="Logo"
                            className="h-8 w-auto brightness-0 invert opacity-90"
                        />
                    </div>
                    <h1 className="text-2xl font-semibold tracking-tight text-white">
                        {(() => {
                            const portalName = localStorage.getItem('s_portal_name') || 'Knowledge Transfer';
                            const words = portalName.split(' ');
                            if (words.length > 1) {
                                return (
                                    <>
                                        {words[0]}<span className="bg-clip-text text-transparent bg-gradient-to-r from-primary via-white/40 to-primary bg-[length:200%_auto] animate-gradient-x">{words.slice(1).join(' ')}</span>
                                    </>
                                );
                            }
                            return portalName;
                        })()}
                    </h1>
                </header>

                {/* Login Card — frosted glass */}
                <Card className="w-full border-none shadow-2xl shadow-primary/30 bg-white/[0.07] backdrop-blur-xl rounded-2xl overflow-hidden ring-1 ring-white/[0.12]">
                    <CardContent className="p-8 pt-8">
                        <form onSubmit={handleLogin} className="space-y-5">
                            <div className="space-y-2">
                                <Label htmlFor="username" className="text-xs font-medium text-white/70 uppercase tracking-label ml-1">
                                    System ID
                                </Label>
                                <Input
                                    id="username"
                                    placeholder="name@domain.com"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    className="h-10 rounded-lg bg-white/[0.08] border-white/[0.1] text-white placeholder:text-white/30 focus:bg-white/[0.12] focus:ring-2 focus:ring-primary/30 focus:border-primary/30 transition-all font-medium text-base"
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="password" className="text-xs font-medium text-white/70 uppercase tracking-label ml-1">
                                    Password
                                </Label>
                                <div className="relative">
                                    <Input
                                        id="password"
                                        type={showPassword ? "text" : "password"}
                                        placeholder="••••••••"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="h-10 rounded-lg bg-white/[0.08] border-white/[0.1] text-white placeholder:text-white/30 focus:bg-white/[0.12] focus:ring-2 focus:ring-primary/30 focus:border-primary/30 transition-all pr-10 font-medium text-base"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/70 transition-colors"
                                    >
                                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                    </button>
                                </div>
                            </div>

                            {error && (
                                <div className="p-3 rounded-lg bg-red-500/15 border border-red-400/20 text-red-300 text-xs font-medium text-center animate-in fade-in">
                                    {error}
                                </div>
                            )}

                            <Button
                                type="submit"
                                disabled={isLoading}
                                className="w-full h-11 bg-primary hover:bg-primary/90 text-white rounded-lg font-semibold tracking-button text-sm shadow-xl shadow-primary/30 hover:shadow-primary/40 transition-all"
                            >
                                {isLoading ? (
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                    <span className="flex items-center gap-2">
                                        Sign in <ArrowRight className="w-4 h-4" />
                                    </span>
                                )}
                            </Button>
                        </form>
                    </CardContent>
                </Card>

            </div>
        </div>
    );
}
