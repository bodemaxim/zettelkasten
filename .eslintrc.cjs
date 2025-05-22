/* eslint-env node */
require('@rushstack/eslint-patch/modern-module-resolution')

module.exports = {
  root: true,
  extends: [
    'plugin:vue/vue3-essential',
    'eslint:recommended',
    '@vue/eslint-config-typescript',
    '@vue/eslint-config-prettier/skip-formatting',
    'plugin:import/errors',
    'plugin:import/warnings',
    'plugin:import/typescript'
  ],
  plugins: ['import'],
  parserOptions: {
    ecmaVersion: 'latest'
  },
  settings: {
    'import/resolver': {
      typescript: {
        alwaysTryTypes: true,
        project: './tsconfig.json'
      },
      alias: {
        map: [['@', './src']],
        extensions: ['.ts', '.js', '.vue']
      }
    }
  },
  rules: {
    'import/order': [
      'error',
      {
        groups: ['builtin', 'external', 'internal', 'parent', 'sibling', 'index'],
        'newlines-between': 'never',
        alphabetize: {
          order: 'asc',
          caseInsensitive: true
        },
        pathGroups: [
          {
            pattern: 'vue**',
            group: 'external',
            position: 'before'
          }
        ],
        pathGroupsExcludedImportTypes: ['vue']
      }
    ]
  }
}
