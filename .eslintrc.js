module.exports = {
  env: {
    browser: true,
    commonjs: true,
    es2021: true,
  },
  extends: [
    'airbnb-base',
  ],
  parserOptions: {
    ecmaVersion: 'latest',
  },
  rules: {
    'global-require': 0,
    'no-new': 0,
    'prefer-destructuring': 0,
    'class-methods-use-this': 0
  },
};
