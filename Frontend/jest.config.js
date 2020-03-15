module.exports = {
  preset: '@vue/cli-plugin-unit-jest',
  collectCoverage: true,
  collectCoverageFrom: ['**/*.{js,vue}', '!**/node_modules/**', '!**.config.js',
    '!coverage/**', '!dist/**', '!src/main.js', '!src/router/index.js', '!public/service-worker.js'],
  coverageReporters: ['html', 'text'],
};
