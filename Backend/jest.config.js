process.env.PUSH_KEY_PRIVATE = 'PUSH_KEY_PRIVATE';
process.env.PUSH_KEY_PUBLIC = 'PUSH_KEY_PUBLIC';
process.env.PUSH_SUBJECT = 'PUSH_SUBJECT';
process.env.AZURE_MAPS_KEY = 'AZURE_MAPS_KEY';
process.env.VVS_KEY = 'VVS_KEY';
process.env.LOG_LEVEL = 'error';

module.exports = {
  testEnvironment: 'node',
  collectCoverage: true,
  collectCoverageFrom: [
    '**/*.js',
  ],
  coveragePathIgnorePatterns: [
    '/node_modules/',
    '/coverage/',
    '/jest.config.js',
  ],
  watchPathIgnorePatterns: [
    '/coverage/',
    '/node_modules/',
    '<rootDir>/jest.json',
  ],
};
