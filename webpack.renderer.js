module.exports = config => {
    delete config.optimization.namedModules;
    config.output.hashFunction = "xxhash64";
    config.module.rules.push({
        test: /\.(html|svelte)$/,
        use: "svelte-loader"
    });
    return config;
};