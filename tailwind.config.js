import tailwindAnimate from "tailwindcss-animate";

/** @type {import('tailwindcss').Config} */
export default {
    darkMode: ["class"],
    content: [
        "./index.html",
        "./src/**/*.{js,jsx,ts,tsx}"
    ],
    theme: {
        extend: {
            borderRadius: {
                xl: "var(--radius)",
                lg: "calc(var(--radius) * 0.8)",
                md: "calc(var(--radius) * 0.6)",
                sm: "calc(var(--radius) * 0.4)",
                full: "9999px"
            },
            fontFamily: {
                sans: ['Inter', 'system-ui', 'sans-serif'],
                mono: ['JetBrains Mono', 'Fira Code', 'monospace']
            },
            fontSize: {
                xs: ['12px', '1.5'],
                sm: ['14px', '1.5'],
                base: ['16px', '1.5'],
                lg: ['18px', '1.2'],
                xl: ['20px', '1.2'],
                '2xl': ['28px', '1.2'],
                '3xl': ['32px', '1.2'],
                '4xl': ['40px', '1.2']
            },
            fontWeight: {
                normal: '400',
                medium: '500',
                semibold: '600',
            },
            boxShadow: {
                xs: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
                sm: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
                md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
                lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
                xl: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
            },
            colors: {
                background: "hsl(var(--background))",
                foreground: "hsl(var(--foreground))",
                card: "hsl(var(--card))",
                "card-foreground": "hsl(var(--card-foreground))",
                popover: "hsl(var(--popover))",
                "popover-foreground": "hsl(var(--popover-foreground))",
                primary: "hsl(var(--primary))",
                "primary-foreground": "hsl(var(--primary-foreground))",
                secondary: "hsl(var(--secondary))",
                "secondary-foreground": "hsl(var(--secondary-foreground))",
                tertiary: "hsl(var(--tertiary))",
                "tertiary-foreground": "hsl(var(--tertiary-foreground))",
                muted: "hsl(var(--muted))",
                "muted-foreground": "hsl(var(--muted-foreground))",
                accent: "hsl(var(--accent))",
                "accent-foreground": "hsl(var(--accent-foreground))",
                destructive: "hsl(var(--destructive))",
                "destructive-foreground": "hsl(var(--destructive-foreground))",
                success: "hsl(var(--success))",
                "success-foreground": "hsl(var(--success-foreground))",
                warning: "hsl(var(--warning))",
                "warning-foreground": "hsl(var(--warning-foreground))",
                info: "hsl(var(--info))",
                "info-foreground": "hsl(var(--info-foreground))",
                border: "hsl(var(--border))",
                input: "hsl(var(--input))",
                ring: "hsl(var(--ring))"
            },
            keyframes: {
                "gradient-x": {
                    "0%, 100%": {
                        "background-size": "200% 200%",
                        "background-position": "left center",
                    },
                    "50%": {
                        "background-size": "200% 200%",
                        "background-position": "right center",
                    },
                },
            },
            animation: {
                "gradient-x": "gradient-x 3s ease infinite",
            },
        }
    },
    plugins: [tailwindAnimate]
};
