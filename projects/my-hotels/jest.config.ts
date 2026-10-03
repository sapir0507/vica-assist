module.exports = {
  displayName: "my-hotels",

  setupFilesAfterEnv: ["<rootDir>/src/test-setup.ts"],
  globals: {
    "ts-jest": {
      tsconfig: "<rootDir>/tsconfig.spec.json",
      stringifyContentPathRegex: "\\.(html|svg)$",
    },
  },
  transform: {
    "^.+\\.(ts|js|mjs|html)$": "jest-preset-angular",
  },
  transformIgnorePatterns: ["node_modules/(?!.*\\.mjs$|rxjs)"],
  snapshotSerializers: [
    "jest-preset-angular/build/serializers/no-ng-attributes",
    "jest-preset-angular/build/serializers/ng-snapshot",
    "jest-preset-angular/build/serializers/html-comment",
  ],
  moduleFileExtensions: ["ts", "tsx", "js", "jsx", "mjs", "html"],
  coverageDirectory: "../../coverage/projects/my-hotels","preset": "../../jest.preset.ts"
};
