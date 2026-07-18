module.exports = {
  root: true,
  env: { node: true, es2023: true },
  extends: ['eslint:recommended'],
  parserOptions: { ecmaVersion: 'latest', sourceType: 'module' },
  rules: {
    // Express handlers keep unused (req, next) params; catch blocks often
    // intentionally discard the error after mapping it to a response.
    'no-unused-vars': ['error', { args: 'none', caughtErrors: 'none', varsIgnorePattern: '^_' }],
  },
};
