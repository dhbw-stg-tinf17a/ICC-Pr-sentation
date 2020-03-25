module.exports = {
  testEnvironment: 'node',
  collectCoverage: true,
  collectCoverageFrom: [
    '**/*.js',
  ],
  coveragePathIgnorePatterns: [
    '/node_modules/',
    '/coverage/',
  ],
};
