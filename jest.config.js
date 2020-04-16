module.exports = {
  clearMocks: true,
  preset: 'ts-jest',
  testMatch: ['**/*test.(js|ts)'],
  testPathIgnorePatterns: ['<rootDir>/dist/', '<rootDir>/node_modules/'],
  globals: {
    'ts-jest': {
      isolatedModules: true,
    },
  },
};
