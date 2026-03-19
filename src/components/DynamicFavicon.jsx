import { useEffect } from 'react';

/**
 * DynamicFavicon — switches the browser tab favicon based on the OS/browser
 * colour-scheme preference (prefers-color-scheme: dark / light).
 *
 * Light OS theme  → favicon-dark.png   (dark-coloured logo, visible on white tab bar)
 * Dark OS theme   → favicon-light.png  (light-coloured logo, visible on dark tab bar)
 *
 * This intentionally uses the BROWSER theme, not the in-app theme toggle,
 * because the browser tab chrome itself follows the OS preference regardless
 * of what theme the app is displaying.
 */
export default function DynamicFavicon() {
    useEffect(() => {
        const favicon = document.getElementById('favicon');
        if (!favicon) return;

        const apply = (isDarkOS) => {
            favicon.href = isDarkOS ? '/favicon-light.png' : '/favicon-dark.png';
        };

        const matcher = window.matchMedia('(prefers-color-scheme: dark)');

        // Apply immediately on mount
        apply(matcher.matches);

        // Keep synced whenever the OS theme changes
        const handleChange = (e) => apply(e.matches);
        matcher.addEventListener('change', handleChange);

        return () => matcher.removeEventListener('change', handleChange);
    }, []);

    return null;
}
