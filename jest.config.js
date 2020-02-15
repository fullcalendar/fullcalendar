
module.exports = {
  preset: 'ts-jest/presets/js-with-ts',
  rootDir: 'packages/__tests__/integration',
  testPathIgnorePatterns: [
    '<rootDir>/lib/'
  ],
  moduleNameMapper: {
    '\\.(css|less|scss|sass)$': '<rootDir>/lib/styleMock.js'
  },
  globals: {
    'ts-jest': {
      tsConfig: 'tsconfig.jest.json'
    }
  },
  setupFilesAfterEnv: [ // "after env" because need access to beforeEach()
    '<rootDir>/lib/globals.js'
  ]
}
