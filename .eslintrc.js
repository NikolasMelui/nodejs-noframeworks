module.exports = {
  env: {
    browser: true,
    es6: true,
    node: true
  },
  extends: ['prettier'],
  parserOptions: {
    sourceType: 'module',
    ecmaVersion: 8
  },
  rules: {
    'comma-dangle': [
      'error',
      {
        arrays: 'never',
        objects: 'never',
        imports: 'never',
        exports: 'never',
        functions: 'never'
      }
    ]
  }
};
