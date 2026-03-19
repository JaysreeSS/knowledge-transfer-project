import React from "react";
import { Outlet, useLocation } from "react-router-dom";
import ScrollToTop from "./ScrollToTop";

export default function GeneralLayout() {
    const location = useLocation();
    return (
        <div className="flex flex-col min-h-screen bg-slate-50 dark:bg-slate-950 font-sans transition-colors duration-300">
            <ScrollToTop />
            <main className="flex-grow">
                <div key={location.pathname} className="animate-in fade-in duration-500">
                    <Outlet />
                </div>
            </main>
        </div>
    );
}
