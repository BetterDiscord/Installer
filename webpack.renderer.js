module.exports = {
    target: "node",
    module: {
        rules: [
            {
                test: /\.(html|svelte)$/,
                use: "svelte-loader"
              }
        ]
    }
};