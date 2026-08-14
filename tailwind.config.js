/** @type {import('tailwindcss').Config} */
module.exports = {
    darkMode: ["class"],
    content: ["./index.html", "./src/**/*.{ts,tsx,js,jsx}"],
  theme: {
  	extend: {
  		borderRadius: {
  			lg: 'var(--radius)',
  			md: 'calc(var(--radius) - 2px)',
  			sm: 'calc(var(--radius) - 4px)',
  			xl: 'calc(var(--radius) + 4px)',
  			'2xl': 'calc(var(--radius) + 8px)',
  		},
  		colors: {
  			background: 'hsl(var(--background))',
  			foreground: 'hsl(var(--foreground))',
  			card: {
  				DEFAULT: 'hsl(var(--card))',
  				foreground: 'hsl(var(--card-foreground))'
  			},
  			popover: {
  				DEFAULT: 'hsl(var(--popover))',
  				foreground: 'hsl(var(--popover-foreground))'
  			},
  			primary: {
  				DEFAULT: 'hsl(var(--primary))',
  				foreground: 'hsl(var(--primary-foreground))'
  			},
  			secondary: {
  				DEFAULT: 'hsl(var(--secondary))',
  				foreground: 'hsl(var(--secondary-foreground))'
  			},
  			muted: {
  				DEFAULT: 'hsl(var(--muted))',
  				foreground: 'hsl(var(--muted-foreground))'
  			},
  			accent: {
  				DEFAULT: 'hsl(var(--accent))',
  				foreground: 'hsl(var(--accent-foreground))'
  			},
  			destructive: {
  				DEFAULT: 'hsl(var(--destructive))',
  				foreground: 'hsl(var(--destructive-foreground))'
  			},
  			border: 'hsl(var(--border))',
  			input: 'hsl(var(--input))',
  			ring: 'hsl(var(--ring))',
  			ivory: 'hsl(var(--ivory))',
  			'warm-white': 'hsl(var(--warm-white))',
  			stone: 'hsl(var(--stone))',
  			beige: 'hsl(var(--beige))',
  			sand: 'hsl(var(--sand))',
  			olive: 'hsl(var(--olive))',
  			'olive-muted': 'hsl(var(--olive-muted))',
  			'blue-grey': 'hsl(var(--blue-grey))',
  			charcoal: 'hsl(var(--charcoal))',
  			smoke: 'hsl(var(--smoke))',
  			ridge: 'hsl(var(--ridge))',
  			storm: 'hsl(var(--storm))',
  			powder: 'hsl(var(--powder))',
  			steel: 'hsl(var(--steel))',
  			linen: 'hsl(var(--linen))',
  			urgent: 'hsl(var(--urgent))',
  			'life-blue': 'hsl(var(--life-blue))',
  			'life-blue-soft': 'hsl(var(--life-blue-soft))',
  			'life-blue-deep': 'hsl(var(--life-blue-deep))',
  			'life-sand': 'hsl(var(--life-sand))',
  			'self-burgundy': 'hsl(var(--self-burgundy))',
  			'self-white': 'hsl(var(--self-white))',
  			'self-grey': 'hsl(var(--self-grey))',
  			metal: 'hsl(var(--slick-metal))',
  			marble: 'hsl(var(--slick-marble))',
  			clay: 'hsl(var(--slick-clay))',
  			sky: 'hsl(var(--slick-sky))',
  			slickstorm: 'hsl(var(--slick-storm))',
  		},
  		fontFamily: {
  			heading: ['var(--font-heading)'],
  			body: ['var(--font-body)'],
  			display: ['var(--font-display)'],
  			mono: ['var(--font-mono)']
  		},
  		keyframes: {
  			'accordion-down': { from: { height: '0' }, to: { height: 'var(--radix-accordion-content-height)' } },
  			'accordion-up': { from: { height: 'var(--radix-accordion-content-height)' }, to: { height: '0' } },
  			'fade-in': { from: { opacity: '0' }, to: { opacity: '1' } },
  			'fade-up': { from: { opacity: '0', transform: 'translateY(12px)' }, to: { opacity: '1', transform: 'translateY(0)' } },
  			'route-fade': { from: { opacity: '0' }, to: { opacity: '1' } },
  			'slide-right': { from: { transform: 'translateX(100%)' }, to: { transform: 'translateX(0)' } },
  			'slide-left': { from: { transform: 'translateX(-100%)' }, to: { transform: 'translateX(0)' } },
  			'slide-up': { from: { transform: 'translateY(100%)' }, to: { transform: 'translateY(0)' } },
  			'slide-down': { from: { transform: 'translateY(-100%)' }, to: { transform: 'translateY(0)' } },
  			'scale-in': { from: { opacity: '0', transform: 'scale(0.96)' }, to: { opacity: '1', transform: 'scale(1)' } },
  			'pulse-soft': { '0%, 100%': { opacity: '0.6' }, '50%': { opacity: '1' } },
  		},
  		animation: {
  			'accordion-down': 'accordion-down 0.2s ease-out',
  			'accordion-up': 'accordion-up 0.2s ease-out',
  			'fade-in': 'fade-in 0.5s ease-out',
  			'fade-up': 'fade-up 0.5s cubic-bezier(0.16, 1, 0.3, 1)',
  			'route-fade': 'route-fade 0.45s ease-out',
  			'slide-right': 'slide-right 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
  			'slide-left': 'slide-left 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
  			'slide-up': 'slide-up 0.45s cubic-bezier(0.16, 1, 0.3, 1)',
  			'slide-down': 'slide-down 0.45s cubic-bezier(0.16, 1, 0.3, 1)',
  			'scale-in': 'scale-in 0.35s cubic-bezier(0.16, 1, 0.3, 1)',
  			'pulse-soft': 'pulse-soft 2s ease-in-out infinite',
  		}
  	}
  },
  plugins: [require("tailwindcss-animate")],
}
