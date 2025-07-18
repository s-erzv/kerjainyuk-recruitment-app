// tailwind.config.js
/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Poppins', 'sans-serif'],
      },
      colors: {
        'blue': '#2F39C6',
        'blue-dark': '#99B7F5',
        'dark-bg-primary': '#1A202C',
        'dark-text-primary': '#CBD5E0',
        
        // Custom colors for matching the image's aesthetic more closely
        'primary-blue': '#007BFF', // A bright blue for accents and buttons
        'dark-blue-bg': '#0D1B2A', // Dark background for the overall app (like the image)
        'mid-blue-bg': '#1B2E4A', // Slightly lighter blue for cards/sections (like the image)
        'light-blue': '#4A90E2', // For hover states or lighter accents
        'text-light': '#E0E0E0', // Lighter text on dark backgrounds
        'text-medium': '#B0B0B0', // Slightly darker text for descriptions
        'text-dark': '#2C3E50', // Dark text on light backgrounds
        'accent-teal': '#28B4AF', // Found some teal/greenish accents in the image
        'accent-purple': '#8E44AD', // Hints of purple in some gradients/shapes
      },
      backgroundImage: {
        'hero-gradient': 'linear-gradient(135deg, #0D1B2A 0%, #1B2E4A 100%)', // Simulating the deep blue gradient
        'dark-radial': 'radial-gradient(circle at center, #1B2E4A 0%, #0D1B2A 100%)', // Another option for dark backgrounds
      },
      keyframes: { 
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideInLeft: {
          '0%': { opacity: '0', transform: 'translateX(-20px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        slideInRight: {
          '0%': { opacity: '0', transform: 'translateX(20px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        zoomIn: {
          '0%': { opacity: '0', transform: 'scale(0.9)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
      },
      animation: { 
        'fade-in-up': 'fadeInUp 0.6s ease-out forwards',
        'fade-in': 'fadeIn 0.6s ease-out forwards',
        'slide-in-left': 'slideInLeft 0.6s ease-out forwards',
        'slide-in-right': 'slideInRight 0.6s ease-out forwards',
        'zoom-in': 'zoomIn 0.5s ease-out forwards',
      },
    },
  },
  plugins: [],
}