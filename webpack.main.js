module.exports = config => {
    delete config.optimization.namedModules;
    config.output.hashFunction = "xxhash64";
    return config;
};