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
        '.text-center-last': {
          'text-align-last': 'center',
        },
      })
    }),
  ],
}
