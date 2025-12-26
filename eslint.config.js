const tseslint = require('@typescript-eslint/eslint-plugin');
const tsparser = require('@typescript-eslint/parser');
const prettier = require('eslint-plugin-prettier/recommended');

module.exports = [
  {
    ignores: ['node_modules/**', '.wrangler/**', 'dist/**', 'build/**', '*.min.js']
  },
  {
    files: ['**/*.ts', '**/*.js'],
    languageOptions: {
      parser: tsparser,
      ecmaVersion: 6,
      sourceType: 'module',
      globals: {
        DISCORD_APP_ID: true,
        DISCORD_PUBLIC_KEY: true,
        DISCORD_BOT_TOKEN: true,
        DEVELOPMENT_GUILD_ID: true,
        NODE_ENV: true,
        GOOGLE_API_KEY: true,
        LAST_COMMIT: true,
        LAST_COMMIT_SHORT: true,
        CF_DEPLOYMENT_ID: true,
        API_KEY: true,
        API_BASE_ROUTE: true,
        GITHUB_TOKEN: true
      }
    },
    plugins: {
      '@typescript-eslint': tseslint
    },
    rules: {
      'prettier/prettier': 'warn',
      'no-cond-assign': ['error', 'except-parens'],
      'no-unused-vars': 'off',
      '@typescript-eslint/no-unused-vars': 'warn',
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
    }
  },
  {
    files: ['slash-up.config.js', 'webpack.config.js'],
    languageOptions: {
      globals: {
        process: true,
        __dirname: true,
        __filename: true,
        module: true,
        require: true,
        exports: true
      }
    }
  },
  prettier
];
