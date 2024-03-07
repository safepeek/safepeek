module.exports = {
  env: {
    commonjs: true,
    es6: true,
    browser: true
  },
  extends: ['eslint:recommended', 'plugin:prettier/recommended'],
  globals: {
    DISCORD_APP_ID: true,
    DISCORD_PUBLIC_KEY: true,
    DISCORD_BOT_TOKEN: true,
    DEVELOPMENT_GUILD_ID: true,
    URL_ENCRYPTION_KEY: true,
    POSTGRES_URL: true,
    NODE_ENV: true,
    LAST_COMMIT: true,
    LAST_COMMIT_SHORT: true
  },
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 6,
    sourceType: 'module'
  },
  plugins: ['@typescript-eslint'],
  rules: {
    'prettier/prettier': 'warn',
    'no-cond-assign': [2, 'except-parens'],
    'no-unused-vars': 0,
    '@typescript-eslint/no-unused-vars': 1,
    'no-empty': [
      'error',
      {
        allowEmptyCatch: true
      }
    ],
    'prefer-const': [
      'warn',
      {
        destructuring: 'all'
      }
    ],
    'spaced-comment': 'warn'
  },
  overrides: [
    {
      files: ['slash-up.config.js', 'webpack.config.js'],
      env: {
        node: true
      }
    }
  ]
};
