/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        fk: {
          blue: '#2874f0',
          yellow: '#ff9f00',
          orange: '#fb641b',
          bg: '#f1f3f6',
          text: '#212121',
          muted: '#878787',
          divider: '#e0e0e0',
        },
      },
      borderRadius: {
        'xs': '2px',
        'sm': '4px',
      },
      boxShadow: {
        'fk': '0 2px 4px 0 rgba(0,0,0,.08)',
        'fk-high': '0 12px 24px 0 rgba(0,0,0,.15)',
      },
    },
  },
  plugins: [],
};
