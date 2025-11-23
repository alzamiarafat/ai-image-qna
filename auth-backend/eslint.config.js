const js = require('@eslint/js');

module.exports = [
  {
    ignores: [
      'node_modules/',
      'build/',
      'dist/',
      '*.log',
      'coverage/',
      '.env*',
      '.DS_Store',
      '.vscode/',
      '.idea/',
      '.eslintcache',
      '.npm'
    ]
  },
  js.configs.recommended,
  {
    languageOptions: {
      ecmaVersion: 2021,
      sourceType: 'commonjs',
      globals: {
        console: 'readonly',
        process: 'readonly',
        Buffer: 'readonly',
        __dirname: 'readonly',
        __filename: 'readonly',
        module: 'readonly',
        require: 'readonly',
        exports: 'readonly',
        global: 'readonly',
        setTimeout: 'readonly',
        clearTimeout: 'readonly',
        setInterval: 'readonly',
        clearInterval: 'readonly'

      }
    },
    rules: {
      // Your existing rules
      'no-undef': 'error',                 // Disallow use of undeclared variables
      'no-unused-vars': 'warn',            // Warn about variables that are declared but never used
      'no-console': 'off',                 // Allow console.log statements
      'no-useless-catch': 'off',           // Allow catch clauses that only rethrow the original error
      'no-await-in-loop': 'warn',          // Warn about using await inside loops (performance concern)
      'no-const-assign': 'error',          // Disallow reassigning const variables
      'no-dupe-args': 'error',             // Disallow duplicate arguments in function definitions
      'no-dupe-else-if': 'error',          // Disallow duplicate conditions in if-else-if chains
      'no-duplicate-case': 'error',        // Disallow duplicate case labels in switch statements
      'no-duplicate-imports': 'error',     // Disallow duplicate module imports

      // Common JavaScript best practices
      'eqeqeq': 'error',                    // Require === and !==
      'no-var': 'error',                    // Require let/const instead of var
      'prefer-const': 'warn',               // Prefer const when variable is never reassigned
      'no-unreachable': 'error',            // Disallow unreachable code
      'no-empty': 'warn',                   // Disallow empty block statements
      'no-extra-semi': 'error',             // Disallow unnecessary semicolons
      'no-func-assign': 'error',            // Disallow reassigning function declarations
      'no-redeclare': 'error',              // Disallow variable redeclaration
      'no-shadow': 'warn',                  // Disallow variable declarations from shadowing
      'no-use-before-define': 'error',      // Disallow use of variables before they are defined

      // Code quality
      'consistent-return': 'warn',          // Require return statements to either always or never specify values
      'default-case': 'warn',               // Require default case in switch statements
      'no-fallthrough': 'error',            // Disallow fallthrough of case statements
      'no-implicit-globals': 'error',       // Disallow declarations in global scope
      'no-loop-func': 'warn',               // Disallow function declarations in loops
      'no-return-assign': 'error',          // Disallow assignment in return statements
      'no-self-compare': 'error',           // Disallow comparisons where both sides are exactly the same
      'no-throw-literal': 'error',          // Disallow throwing literals as exceptions

      // Stylistic preferences (warnings)
      'camelcase': 'warn',                  // Enforce camelcase naming convention
      'quotes': ['warn', 'single'],         // Enforce single quotes
      'no-trailing-spaces': 'warn',         // Disallow trailing whitespace
      'no-multiple-empty-lines': ['warn', { 'max': 2 }], // Limit consecutive empty lines

      // ES6+ features
      'arrow-spacing': 'warn',              // Enforce spacing around arrow functions
      'template-curly-spacing': 'warn'      // Enforce spacing in template literals
    }
  }
];
