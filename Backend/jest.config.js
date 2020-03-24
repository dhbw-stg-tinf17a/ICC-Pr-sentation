module.exports = {
  testEnvironment: 'node',
  setupFiles: [
    'dotenv/config',
  ],
  collectCoverage: true,
  collectCoverageFrom: [
    '**/*.js',
  ],
  coveragePathIgnorePatterns: [
    '/node_modules/',
    '/coverage/',
  ],
};
