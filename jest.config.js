const nextJest = require('next/jest');

const createJestConfig = nextJest({
  dir: './',
});

const customJestConfig = {
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
  testEnvironment: 'jest-environment-jsdom',
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
  },
  "collectCoverage": true,
  "coverageReporters": ["json", "lcov", "text", "clover"],
  "collectCoverageFrom": [
    "services/**/*.{ts,tsx}",
    "app/api/**/*.{ts,tsx}",
    "components/features/**/*.{ts,tsx}",
    "!**/*.d.ts",
    "!.next/**",
    "!**/node_modules/**"
  ]
};

module.exports = createJestConfig(customJestConfig);
