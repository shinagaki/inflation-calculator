import plugin from 'tailwindcss/plugin'

/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {},
    fontFamily: {
      body: [
        'Twemoji Country Flags',
        'Hiragino Sans',
        'ヒラギノ角ゴシック',
        'メイリオ',
        'Meiryo',
        'MS Ｐゴシック',
        'MS PGothic',
        'sans-serif',
        'YuGothic',
        'Yu Gothic',
      ],
    },
  },
  plugins: [
    plugin(({ addUtilities }) => {
      addUtilities({
        '.text-webkit-center': {
          'text-align': '-webkit-center',
        },
        '.text-moz-center': {
          'text-align': '-moz-center',
        },
      })
    }),
  ],
}
