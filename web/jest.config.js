/** @type {import('jest').Config} */
const config = {
  testEnvironment: "node",
  testMatch: ["**/src/__tests__/**/*.test.ts"],
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/src/$1",
  },
  transform: {
    "^.+\\.tsx?$": ["ts-jest", {
      tsconfig: {
        // Override module settings for Jest/CommonJS compatibility
        module: "commonjs",
        moduleResolution: "node",
        esModuleInterop: true,
        resolveJsonModule: true,
      },
    }],
  },
};

module.exports = config;
