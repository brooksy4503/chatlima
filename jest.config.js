module.exports = {
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
    '\\.module\\.(css|less|scss|sass)$': 'identity-obj-proxy',
  },
  transform: {
    '^.+\\.(js|jsx|ts|tsx)$': ['babel-jest', { 
      presets: [
        ['next/babel', { 
          'preset-react': { 
            runtime: 'automatic' 
          } 
        }]
      ] 
    }],
  },
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json'],
  testPathIgnorePatterns: [
    '<rootDir>/.next/',
    '<rootDir>/node_modules/',
    '<rootDir>/tests/', // Exclude Playwright tests
  ],
  collectCoverageFrom: [
    'components/**/*.{js,jsx,ts,tsx}',
    '!**/*.d.ts',
  ],
  // React 19 compatible configuration
  testEnvironmentOptions: {
    customExportConditions: [''],
  },
  extensionsToTreatAsEsm: ['.jsx', '.tsx'],
  // Enable fake timers globally to fix waitFor issues
  fakeTimers: {
    enableGlobally: true,
  },
  // Remove deprecated globals
  // globals: {
  //   'ts-jest': {
  //     jsx: 'react',
  //   },
  // },
};