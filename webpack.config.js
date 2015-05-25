var
path = require('path'),
webpack = require('webpack');

var appRoot = __dirname;

module.exports = {
    colors: true,
    watch: true,
    entry: {
        app: "./src/index.js",
        vendor: [
            'immutable',
            'react',
            'babel-runtime/regenerator',
            'babel-runtime/core-js',
            'minitrue',
            'react-router',
            'classnames'
        ]
    },

    output: {
        path: path.join(appRoot, "./js"),
        filename: "app.js"
    },
    devtool: "#source-map",

    resolve: {
        root: path.join(appRoot, "/src/"),
        modulesDirectories: ["node_modules"]
    },

    module: {
        loaders: [
            {
                test: /\.css$/,
                loader: "style-loader!css-loader"
            },
            {
                test: /\.jsx?$/,
                exclude: /node_modules/,
                loader: 'babel-loader?optional=runtime'
            }
            // {
            //     test: /\.styl$/,
            //     loader: 'style-loader!css-loader!stylus-loader'
            // }
        ]
    },

    plugins: [
        // to5Runtime wants to export to the window. This loader grabs the export
        // and instead provides it to the modules that need it.
        //
        // The 'imports?global=>{}!' is optional, but prevents to5Runtime from leaking
        // to the window object.
        //
        // Alternatively, write `require('6to5/runtime')` at the top of your entry point.
        // Leaks the object to the window, but it's simple.
        new webpack.ProvidePlugin({
            'React': 'react',
            'Immutable': 'immutable'
        }),

        new webpack.optimize.CommonsChunkPlugin(/* chunkName= */"vendor", /* filename= */"vendor.js")
    ]
};
