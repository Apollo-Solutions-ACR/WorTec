// tailwind.config.js
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./public/index.html",
  ],
  darkMode: false, // or 'media' or 'class'
  theme: {
    extend: {scale: {
        102: '1.02',
      },
    },
  },
  variants: {
    extend: {},
  },
  plugins: [],
}
