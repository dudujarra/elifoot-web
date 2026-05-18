module.exports = {
  content: ['src/**/*.jsx', 'src/**/*.js', 'src/**/*.ts', 'src/**/*.tsx', 'index.html'],
  css: ['src/styles/**/*.css'],
  output: 'purge_output/',
  safelist: {
    standard: [
      /^bg-/, /^text-/, /^border-/, /active/, /hover/, /focus/, /disabled/, /is-/, /has-/, /::-webkit-scrollbar/,
      /^ef-btn-/, /^ef-panel-/, /^animate-/, /^ef-icon/
    ],
    deep: [/var\(/]
  },
  keyframes: true, // Keep all keyframes!
  fontFace: true,
  variables: true, // Do not remove CSS variables
  defaultExtractor: content => content.match(/[\w-/:]+(?<!:)/g) || []
}
