/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: "class",
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        base: {
          950: "#08080a",
          900: "#0d0d10",
          850: "#121215",
          800: "#18181c",
          750: "#1e1e22",
          700: "#27272c",
          600: "#3a3a40",
          500: "#54545c",
          400: "#7a7a82",
          300: "#a3a3aa",
          200: "#c6c6cc",
          100: "#e4e4e8",
          50: "#f7f7f9"
        },
        accent: {
          DEFAULT: "#e8e8ec",
          dim: "#9a9aa4"
        }
      },
      fontFamily: {
        sans: [
          "-apple-system",
          "BlinkMacSystemFont",
          "Segoe UI",
          "Inter",
          "Helvetica Neue",
          "Arial",
          "sans-serif"
        ],
        mono: [
          "SF Mono",
          "ui-monospace",
          "Menlo",
          "Consolas",
          "monospace"
        ]
      },
      borderRadius: {
        xl: "1rem",
        "2xl": "1.5rem",
        "3xl": "2rem"
      },
      boxShadow: {
        glass: "0 8px 32px rgba(0, 0, 0, 0.45)",
        glow: "0 0 40px rgba(255, 255, 255, 0.04)"
      },
      animation: {
        "fade-in": "fadeIn 0.5s ease-out forwards",
        "slide-up": "slideUp 0.4s ease-out forwards",
        "pulse-slow": "pulseSlow 2.4s ease-in-out infinite",
        "float": "float 6s ease-in-out infinite"
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" }
        },
        slideUp: {
          "0%": { opacity: "0", transform: "translateY(10px)" },
          "100%": { opacity: "1", transform: "translateY(0)" }
        },
        pulseSlow: {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.5" }
        },
        float: {
          "0%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-4px)" },
          "100%": { transform: "translateY(0px)" }
        }
      }
    }
  },
  plugins: []
};
