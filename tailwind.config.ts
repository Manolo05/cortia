import type { Config } from 'tailwindcss'

const config: Config = {
    content: [
          './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
          './src/components/**/*.{js,ts,jsx,tsx,mdx}',
          './src/app/**/*.{js,ts,jsx,tsx,mdx}',
        ],
    theme: {
          extend: {
                  colors: {
                            primary: {
                                        50: '#eff6ff',
                                        100: '#dbeafe',
                                        200: '#bfdbfe',
                                        300: '#93c5fd',
                                        400: '#60a5fa',
                                        500: '#3b82f6',
                                        600: '#2563eb',
                                        700: '#1d4ed8',
                                        800: '#1e40af',
                                        900: '#1e3a8a',
                                        950: '#172554',
                            },
                            cortia: {
                                        blue: '#2563eb',
                                        navy: '#1e3a8a',
                                        light: '#eff6ff',
                            },
                            background: 'hsl(var(--background))',
                            foreground: 'hsl(var(--foreground))',
                            border: 'hsl(var(--border))',
                            input: 'hsl(var(--input))',
                            ring: 'hsl(var(--ring))',
                            card: { DEFAULT: 'hsl(var(--card))', foreground: 'hsl(var(--card-foreground))' },
                            muted: { DEFAULT: 'hsl(var(--muted))', foreground: 'hsl(var(--muted-foreground))' },
                            accent: { DEFAULT: 'hsl(var(--accent))', foreground: 'hsl(var(--accent-foreground))' },
                            destructive: { DEFAULT: 'hsl(var(--destructive))', foreground: 'hsl(var(--destructive-foreground))' },
                            popover: { DEFAULT: 'hsl(var(--popover))', foreground: 'hsl(var(--popover-foreground))' },
                            secondary: { DEFAULT: 'hsl(var(--secondary))', foreground: 'hsl(var(--secondary-foreground))' },
                  },
                  fontFamily: {
                            sans: ['Inter', 'system-ui', 'sans-serif'],
                  },
                  animation: {
                            'fade-in': 'fadeIn 0.5s ease-in-out',
                            'slide-up': 'slideUp 0.3s ease-out',
                            'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
                  },
                  keyframes: {
                            fadeIn: {
                                        '0%': { opacity: '0' },
                                        '100%': { opacity: '1' },
                            },
                            slideUp: {
                                        '0%': { transform: 'translateY(10px)', opacity: '0' },
                                        '100%': { transform: 'translateY(0)', opacity: '1' },
                            },
                  },
          },
    },
    plugins: [],
}

export default config
