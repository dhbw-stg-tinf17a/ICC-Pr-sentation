module.exports = {
  preset: '@vue/cli-plugin-unit-jest',
  collectCoverage: true,
  collectCoverageFrom: ['**/*.{js,vue}', '!**/node_modules/**', '!**.config.js',
    '!coverage/**', '!dist/**'],
  coverageReporters: ['html', 'text'],
};
