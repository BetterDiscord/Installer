module.exports = {
    module: {
        rules: [{
            test: /\.(html|svelte)$/,
            exclude: [],
            use: {
                loader: 'svelte-loader',
                options: {
                    preprocess: require('svelte-preprocess')({
                        defaults: {
                            style: 'scss'
                        }
                    })
                }
            }
        }]
    }
};