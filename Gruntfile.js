module.exports = function (grunt) {

    grunt.initConfig({

        karma: {
            unit: {
                options: {
                    basePath: './',
                    plugins: [
                        'karma-qunit',
                        'karma-phantomjs-launcher',
                        'karma-mocha-reporter'
                    ],
                    frameworks: ['qunit'],

                    reporters: ['mocha'],

                    port: 9877,
                    colors: true,
                    logLevel: 'INFO',
                    autoWatch: false,
                    browsers: ['PhantomJS'],
                    singleRun: true,

                    // list of files / patterns to load in the browser
                    files: [
                        'test/vendor/object-assign-polyfill.js',
                        'test/vendor/prototype-bind-polyfill.js',
                        'test/vendor/bluebird.js',
                        'test/vendor/gmaps.js',
                        'test/vendor/underscore.js',
                        'test/vendor/jquery.js',
                        'dist/ig_turfhelper.js',
                        'test/ig_turfhelper/setup/*.js',
                        'test/ig_turfhelper/*.js',
                        'https://maps.googleapis.com/maps/api/js?callback=__google_maps_callback__&v=3.exp&libraries=visualization,places,drawing,geometry&key=AIzaSyCsQ6i68i9hQ90ic34cSdnROS_WcMCVksM'
                    ]
                }

            }
        }
    });

    grunt.loadNpmTasks('grunt-karma');

};
