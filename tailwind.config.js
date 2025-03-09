/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,ts}",
  ],
  theme: {
    extend: {},
  },
  plugins: [
    require('daisyui'),
    
    
  ],
  daisyui: {
    themes: ["light"],
  },
  corePlugins: {
    preflight: false,  // Disable Tailwind's base styles to prevent conflicts with Bootstrap
  },
}

