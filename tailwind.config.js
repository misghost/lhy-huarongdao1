
module.exports = {
  content: [
    "./index.html",
    "./index.tsx",
    "./App.tsx",
    "./services/**/*.{ts,tsx}",
    "./constants.ts"
  ],
  theme: {
    extend: {
      colors: {
        morandi: {
          orange: '#E29578',
          green: '#84A59D',
          red: '#F28482',
          pink: '#F5CAC3',
          cream: '#F7EDE2',
          lightblue: '#A8dadc',
          darkblue: '#457b9d',
          yellowgreen: '#D4E09B',
        }
      }
    },
  },
  plugins: [],
}
