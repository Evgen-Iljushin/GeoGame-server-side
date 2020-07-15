module.exports = {
  env: {
      browser: true,
      commonjs: true,
      es6: true
  },
  extends: [
      'eslint:recommended',
      'plugin:react/recommended'
  ],
  globals: {
      Atomics: 'readonly',
      SharedArrayBuffer: 'readonly',
      process: 'readonly',
      Buffer: 'readonly',
      exports: 'writable',
      __dirname: 'readonly',
      __filename: 'readonly'
  },
  parserOptions: {
      ecmaFeatures: {
          'jsx': true
      },
      ecmaVersion: 2018,
      sourceType: 'module'
  },
  plugins: [
      'react'
  ],
  ignorePatterns: ['*.test.js', 'tests/*'], // remove if needs to check test files
  rules: {
      'no-inner-declarations': 'off',
      'no-case-declarations': 'off',
      'react/prop-types': 'off',
      'no-unused-vars': 'warn',
      'no-empty': 'warn'
  }
};