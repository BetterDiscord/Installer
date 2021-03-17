// This is a required config file for
// the svelte-vscode plugin to properly
// provide intellisense.
//
//https://github.com/sveltejs/svelte-preprocess/blob/main/docs/usage.md

const sveltePreprocess = require('svelte-preprocess');

module.exports = {
    preprocess: sveltePreprocess({
        defaults: {
            style: 'scss'
        }
    })
};