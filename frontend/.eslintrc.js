/* global __dirname:false require:false module:true */
const path = require("path");

module.exports = {
    "extends": ["eslint:recommended", "plugin:import/recommended"],
    "settings": {
        "import/resolver": {
            "eslint-import-resolver-custom-alias": {
                alias: {
                    "@assets": path.resolve(__dirname, "./assets"),
                    "@wails": path.resolve(__dirname, "./wailsjs/runtime"),
                    "@backend": path.resolve(__dirname, "./wailsjs/go/backend")
                },
                extensions: [".js"]
            }
        }
    },
    "env": {
        node: false,
        browser: true,
        es6: true
    },
    "plugins": [
        "svelte3"
    ],
    "overrides": [
        {
          files: ["*.svelte"],
          processor: "svelte3/svelte3"
        }
    ],
    "parserOptions": {
        ecmaVersion: 2022,
        sourceType: "module"
    },
    "rules": {
        "accessor-pairs": "error",
        "block-spacing": ["error", "never"],
        "brace-style": ["error", "stroustrup", {allowSingleLine: true}],
        "curly": ["error", "multi-line", "consistent"],
        "dot-location": ["error", "property"],
        "dot-notation": "error",
        // "eqeqeq": ["error", "smart"],
        "func-call-spacing": "error",
        "handle-callback-err": "error",
        "key-spacing": "error",
        "keyword-spacing": "error",
        "linebreak-style": ["error", "windows"],
        "new-cap": ["error", {newIsCap: true}],
        "no-array-constructor": "error",
        "no-caller": "error",
        "no-console": "error",
        "no-duplicate-imports": "error",
        "no-else-return": "error",
        "no-eval": "error",
        "no-floating-decimal": "error",
        "no-implied-eval": "error",
        "no-iterator": "error",
        "no-label-var": "error",
        "no-labels": "error",
        "no-lone-blocks": "error",
        "no-mixed-spaces-and-tabs": "error",
        "no-multi-spaces": "error",
        "no-multi-str": "error",
        "no-new": "error",
        "no-new-func": "error",
        "no-new-object": "error",
        "no-new-wrappers": "error",
        "no-octal-escape": "error",
        "no-path-concat": "error",
        "no-proto": "error",
        "no-prototype-builtins": "off",
        "no-redeclare": ["error", {builtinGlobals: true}],
        "no-self-compare": "error",
        "no-sequences": "error",
        "no-shadow": ["warn", {builtinGlobals: false, hoist: "functions"}],
        "no-tabs": "error",
        "no-template-curly-in-string": "error",
        "no-throw-literal": "error",
        // "no-trailing-spaces": "error",
        "no-undef": "error",
        "no-undef-init": "error",
        "no-unmodified-loop-condition": "error",
        "no-unneeded-ternary": "error",
        "no-useless-call": "error",
        "no-useless-computed-key": "error",
        "no-useless-constructor": "error",
        "no-useless-rename": "error",
        "no-var": "error",
        "no-whitespace-before-property": "error",
        "object-curly-spacing": ["error", "never", {objectsInObjects: false}],
        "object-property-newline": ["error", {allowAllPropertiesOnSameLine: true}],
        "operator-linebreak": ["error", "none", {overrides: {"?": "before", ":": "before"}}],
        "prefer-const": "error",
        "quote-props": ["error", "consistent-as-needed", {keywords: true}],
        "quotes": ["error", "double", {allowTemplateLiterals: true}],
        "rest-spread-spacing": "error",
        "semi": "error",
        "semi-spacing": "error",
        "space-before-blocks": "error",
        "space-in-parens": "error",
        "space-infix-ops": "error",
        "space-unary-ops": ["error", {words: true, nonwords: false, overrides: {"typeof": false}}],
        "spaced-comment": ["error", "always", {exceptions: ["-", "*"]}],
        "template-curly-spacing": "error",
        "wrap-iife": ["error", "inside"],
        "yield-star-spacing": "error",
        "yoda": "error"
    },
    "globals": {
        __INSTALLER_LICENSE__: "readonly"
    }
};