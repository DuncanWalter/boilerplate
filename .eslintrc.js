const prettierConfig = require('eslint-config-prettier')
const reactConfig = require('eslint-config-react')

module.exports = [
  prettierConfig,
  reactConfig,
  {
    rules: {
      'no-shadow': 'error',
      'prefer-spread': 'off',
      'react/display-name': 'off',
      'react-hooks/exhaustive-deps': 'off',
      'react/react-in-jsx-scope': 'off',
    },
  },
]
