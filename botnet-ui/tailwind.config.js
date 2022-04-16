module.exports = {
  mode: "jit",

  darkMode: "class", // or 'media' or 'class'
  variants: {
    extend: {},
  },

  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./node_modules/@vechaiui/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [require("@tailwindcss/forms"), require("@vechaiui/core")],
};
