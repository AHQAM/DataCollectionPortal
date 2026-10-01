const baseConfig = require("./jest.config");

module.exports = {
  ...baseConfig,
  collectCoverage: true,
  coverageThreshold: {
    global: {
      statements: 40,
      branches: 29,
      functions: 50,
      lines: 41,
    },
  },
};
