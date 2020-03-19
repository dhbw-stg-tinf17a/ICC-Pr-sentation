module.exports = {
  preset: '@vue/cli-plugin-unit-jest',
  collectCoverage: true,
  collectCoverageFrom: ['**/*.{js,vue}', '!**/node_modules/**', '!**.config.js',
    '!coverage/**', '!dist/**',
    '!src/main.js', // ignored because test makes no sense and nothing to test
    '!src/router/index.js', // not directly testable; tested indirectly in other tests
    '!public/service-worker.js', // not testable with unit tests; tested manually
    // SpeechSynthesisUtterance not defined in test run.
    // Mocking not useful. HTML speech api is already tested from creators, no need to test again.
    '!src/services/SpeechSynthesis.js',
  ],
  coverageReporters: ['html', 'text'],
};
