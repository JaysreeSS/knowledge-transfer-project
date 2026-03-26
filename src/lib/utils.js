import { clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs) {
    return twMerge(clsx(inputs))
}

export function hexToHsl(hex) {
    if (!hex) return null;
    
    // Remove the hash if it exists
    hex = hex.replace(/^#/, '');

    // Parse the hex values
    let r = parseInt(hex.substring(0, 2), 16) / 255;
    let g = parseInt(hex.substring(2, 4), 16) / 255;
    let b = parseInt(hex.substring(4, 6), 16) / 255;

    let max = Math.max(r, g, b), min = Math.min(r, g, b);
    let h, s, l = (max + min) / 2;

    if (max === min) {
        h = s = 0; // achromatic
    } else {
        let d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        switch (max) {
            case r: h = (g - b) / d + (g < b ? 6 : 0); break;
            case g: h = (b - r) / d + 2; break;
            case b: h = (r - g) / d + 4; break;
        }
        h /= 6;
    }

    return {
        h: Math.round(h * 360),
        s: Math.round(s * 100),
        l: Math.round(l * 100)
    };
}

export function getAvatarUrl(name = 'default', bgColor = '7c3aed') {
    if (name.startsWith('http')) return name;

    // If name is a specific seed (like from our preset), use it
    // If name is a specific seed (like from our preset or a reaction seed), use it directly
    if (name.includes('preset_') || name.includes('reaction_')) {
        return `https://api.dicebear.com/7.x/notionists/svg?seed=${name}&backgroundColor=${bgColor}`;
    }

    const lowerName = name.toLowerCase();
    // Common names list for specific users in the project
    const femaleNames = ['jaysree', 'priya', 'anjali', 'sneha', 'neha', 'divya', 'pooja', 'swati', 'kavita', 'deepa', 'shweta', 'rinku', 'megha'];

    // Heuristics for gender detection (simple)
    const isFemale = femaleNames.some(fn => lowerName.includes(fn)) ||
        (lowerName.endsWith('a') && !['raja', 'ramba'].includes(lowerName)) ||
        lowerName.endsWith('i') ||
        lowerName.endsWith('e');

    // Use specific seeds that tend to produce gender-aligned results in Notionists style
    const seed = isFemale ? `female_${name}` : `male_${name}`;

    return `https://api.dicebear.com/7.x/notionists/svg?seed=${seed}&backgroundColor=${bgColor}`;
}
