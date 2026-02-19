import React from "react";

export default function Footer() {
    return (
        <footer className="bg-primary border-t border-primary/20 py-8 px-8 mt-auto">
            <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6 text-center md:text-left">
                <p className="text-[11px] text-white/80 font-medium">
                    © {new Date().getFullYear()} KnowledgeTransfer. All rights reserved by Ideassion.
                </p>
                <div className="flex flex-wrap justify-center gap-8 text-[10px] font-semibold text-white/60 uppercase tracking-wider">
                    <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
                    <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
                    <a href="#" className="hover:text-white transition-colors">Support</a>
                </div>
            </div>
        </footer>
    );
}
