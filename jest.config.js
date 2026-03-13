module.exports = {
  displayName: 'AIOX-CORE Tests',
  testEnvironment: 'node',
  roots: ['<rootDir>'],
  testMatch: [
    '<rootDir>/tests/**/*.test.js'
  ],
  testPathIgnorePatterns: [
    'node_modules',
    '.aiox-core',
    'docs',
    'coverage'
  ],
  collectCoverageFrom: [
    'src/**/*.js',
    'lib/**/*.js',
    '!src/**/*.d.ts',
    '!**/node_modules/**',
    '!**/vendor/**',
    '!**/.aiox-core/**'
  ],
  coverageThreshold: {
    global: {
      statements: 60,
      branches: 50,
      functions: 60,
      lines: 60
    }
  },
  testTimeout: 30000,
  verbose: true,
  collectCoverage: false,
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html', 'json-summary'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1'
  },
  setupFilesAfterEnv: [],
  transform: {},
  moduleFileExtensions: ['js', 'json'],
  bail: false,
  maxWorkers: '50%'
};
