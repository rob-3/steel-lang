/** @type {import('@jest/types').Config.InitialOptions} */
const config = {
  transform: {
    "^.+\\.[t|j]sx?$": "babel-jest",
  },
  extensionsToTreatAsEsm: [".ts"],
	testPathIgnorePatterns: ["<rootDir>/test"],
}

export default config;
