import { clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs) {
    return twMerge(clsx(inputs))
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
