module.exports = {
    "env": {
        "browser": true,
        "es6": true,
        "node": true
    },
    "ignorePatterns": [
        "node_modules",
        "generated",
        "**/__tests__/*",
        "**/__mocks__/*",
        "Dangerfile.*",
        "*.d.ts"
    ],
    "parser": "@typescript-eslint/parser",
    "parserOptions": {
        "project": "tsconfig.json",
        "sourceType": "module"
    },
    "extends": [
        "@pagopa/eslint-config/strong",
    ],
    "rules": {
        "functional/prefer-readonly-type": "off",
        "prefer-arrow/prefer-arrow-functions": "off",
        "@typescript-eslint/no-use-before-define": "off",
        "import/order": "off",
        "@typescript-eslint/no-floating-promises": "off",
        "prettier/prettier": "off",
        "sort-keys": "off",
        "@typescript-eslint/semi": "off",
        "@typescript-eslint/explicit-member-accessibility": "off",
        "jsdoc/newline-after-description": "off",
        "arrow-body-style": "off"
    }
}
