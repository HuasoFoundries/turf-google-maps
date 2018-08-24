module.exports = function (config) {
	config.set({
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
			'test/assets/*.assets.js',
			'test/vendor/object-assign-polyfill.js',
			'test/vendor/prototype-bind-polyfill.js',
			'test/vendor/jsts-polyfills.js',
			'test/vendor/bluebird.js',
			'test/vendor/gmaps.js',
			'test/vendor/jquery.js',
			process.env.MINIFY ? 'dist/ig_turfhelper.min.js' : 'dist/ig_turfhelper.js',
			process.env.MINIFY ? 'dist/utils.min.js' : 'dist/utils.js',
			process.env.MINIFY ? 'dist/ig_subset.min.js' : 'dist/ig_subset.js',
			'test/specs/setup/*.js',
			'test/specs/*.test.js',
			'https://maps.googleapis.com/maps/api/js?callback=__google_maps_callback__&v=3.exp&libraries=visualization,places,drawing,geometry&key=AIzaSyCsQ6i68i9hQ90ic34cSdnROS_WcMCVksM' // eslint-disable-line max-len
		]
	});

};
