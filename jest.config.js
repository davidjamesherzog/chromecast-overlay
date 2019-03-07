// jest.config.js
module.exports = {
  verbose: true,
  collectCoverage: false,
  coverageDirectory: './coverage',
  coveragePathIgnorePatterns: ['/node_modules/', '/jest/'],
  coverageThreshold: {
    global: {
      branches: 10,
      functions: 10,
      lines: 10,
      statements: 10
    }
  },
  setupFiles: ['<rootDir>/jest/globals.js']
};
