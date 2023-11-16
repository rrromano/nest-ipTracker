module.exports = {
  moduleFileExtensions: ['js', 'json', 'ts'],
  testRegex: '.*\\.spec\\.ts$',
  transform: {
    '^.+\\.(t|j)s$': 'ts-jest',
  },
  coverageDirectory: '../coverage',
  collectCoverage: true,
  collectCoverageFrom: ['src/**/*.(t|j)s', '!src/config/**', '!src/models/**'],
  testEnvironment: 'node',
};
