/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      animation: {
        'progressBar': 'progressBar 1.5s ease-in-out infinite',
        'fadeIn': 'fadeIn 0.5s ease-in',
        'fadeOut': 'fadeOut 0.5s ease-out',
        'slideUp': 'slideUp 0.3s ease-out',
        'slideDown': 'slideDown 0.3s ease-in',
        'scaleIn': 'scaleIn 0.3s ease-out',
      },
      keyframes: {
        progressBar: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(100%)' }
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' }
        },
        fadeOut: {
          '0%': { opacity: '1' },
          '100%': { opacity: '0' }
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' }
        },
        slideDown: {
          '0%': { transform: 'translateY(-20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' }
        },
        scaleIn: {
          '0%': { transform: 'scale(0.9)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' }
        },
      },
      typography: {
        DEFAULT: {
          css: {
            'code::before': { content: '""' },
            'code::after': { content: '""' },
            'blockquote p:first-of-type::before': { content: '""' },
            'blockquote p:last-of-type::after': { content: '""' },
            lineHeight: '1.8',
            p: {
              marginTop: '1.5em',
              marginBottom: '1.5em',
            },
            'ul > li': {
              marginTop: '0.5em',
              marginBottom: '0.5em',
              paddingLeft: '0.375em',
            },
            'ol > li': {
              marginTop: '0.5em',
              marginBottom: '0.5em',
              paddingLeft: '0.375em',
            },
            ol: {
              listStyleType: 'decimal',
              marginTop: '1.25em',
              marginBottom: '1.25em',
              paddingLeft: '1.625em',
            },
            ul: {
              listStyleType: 'disc',
              marginTop: '1.25em',
              marginBottom: '1.25em',
              paddingLeft: '1.625em',
            },
            code: {
              backgroundColor: '#f3f4f6',
              color: '#ef4444',
              fontWeight: '500',
              padding: '0.2em 0.4em',
              borderRadius: '0.25rem',
              fontSize: '0.875em',
              '&::before': { content: '""' },
              '&::after': { content: '""' }
            },
            'code:not(pre code)': {
              backgroundColor: '#f3f4f6',
              color: '#ef4444',
              fontWeight: '500',
              padding: '0.2em 0.4em',
              borderRadius: '0.25rem',
              fontSize: '0.875em',
            },
            '.dark code:not(pre code)': {
              backgroundColor: '#374151',
              color: '#f87171',
            },
            pre: {
              backgroundColor: '#1a1a1a',
              color: '#fff',
              overflowX: 'auto',
              fontSize: '0.875em',
              lineHeight: '1.7142857',
              margin: '1.7142857em 0',
              borderRadius: '0.375rem',
              paddingTop: '0.8571429em',
              paddingRight: '1.1428571em',
              paddingBottom: '0.8571429em',
              paddingLeft: '1.1428571em',
            },
            'pre code': {
              backgroundColor: 'transparent',
              borderWidth: '0',
              borderRadius: '0',
              padding: '0',
              fontWeight: '400',
              color: 'inherit',
              fontSize: 'inherit',
              fontFamily: 'inherit',
              lineHeight: 'inherit',
              '&::before': { content: '""' },
              '&::after': { content: '""' }
            },
          },
        },
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
} 