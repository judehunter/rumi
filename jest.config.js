/* eslint-disable no-undef */
/* eslint-disable @typescript-eslint/no-var-requires */
// const {pathsToModuleNameMapper} = require('ts-jest/utils');
// const {compilerOptions} = require('./tsconfig.json');

/** @type {import('ts-jest/dist/types').InitialOptionsTsJest} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  // projects: ['<rootDir>/packages/*'],
  globals: {
    'ts-jest': {
      // babelConfig: 'babel.config.js',
    },
  },
  moduleNameMapper: {
    '^@rumi/(.*)$': '<rootDir>/packages/$1/src',
  },
};
