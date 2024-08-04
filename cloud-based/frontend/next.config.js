// next.config.js
module.exports = {
    webpack: (config, { isServer }) => {
        // Add csv-loader to handle CSV files
        config.module.rules.push({
            test: /\.csv$/,
            use: ['csv-loader'],
        });

        return config;
    },
};
