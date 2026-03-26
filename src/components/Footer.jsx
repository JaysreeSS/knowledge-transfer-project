import React from "react";

export default function Footer() {
    return (
        <footer className="bg-gradient-to-br from-[#0f041a] via-[#1a0a2e] to-[#0f041a] border-t border-purple-900/30 py-12 px-4 sm:px-8 md:px-12 mt-auto relative overflow-hidden">
            {/* Subtle purple nebula glow to maintain the galaxy theme */}
            <div className="absolute top-0 right-1/4 w-96 h-96 bg-purple-500/10 blur-[130px] pointer-events-none" />

            <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6 text-center md:text-left relative z-10">
                <p className="text-xs text-purple-200/40 font-medium tracking-wide">
                    © {new Date().getFullYear()} <span className="text-purple-100/80 font-semibold">Ideassion KT Portal</span>. All rights reserved.
                </p>
                <div className="flex flex-wrap justify-center gap-8 text-xs font-semibold text-purple-300/30 uppercase tracking-[0.15em]">
                    <a href="#" className="hover:text-purple-200 transition-colors cursor-pointer">Privacy Policy</a>
                    <a href="#" className="hover:text-purple-200 transition-colors cursor-pointer">Terms of Service</a>
                    <a href="#" className="hover:text-white/80 transition-colors cursor-pointer">Contact Support</a>
                </div>
            </div>
        </footer>
    );
}
