import resolve from "rollup-plugin-node-resolve";
import commonjs from "rollup-plugin-commonjs";
import alias from 'rollup-plugin-alias';
import babel from 'rollup-plugin-babel';
import replace from 'rollup-plugin-replace';
import cleanup from 'rollup-plugin-cleanup';
import pkgConfig from "./package.json";

var version = process.env.NEW_VERSION ? process.env.NEW_VERSION : pkgConfig.version;
var banner =
	`
/*
 * turf-google-maps
 * version v${version}
 * MIT Licensed
 * Felipe Figueroa (amenadiel@gmail.com)
 * https://github.com/HuasoFoundries/turf-google-maps
 */
 `;

var input = "src/ig_turfhelper.js",
	output = [{
			file: "dist/ig_turfhelper.js",
			format: "umd",
			name: 'turfHelper',
			exports: 'named',
			extend: false,
			banner
		},
		{
			file: "dist/ig_turfhelper.esm.js",
			format: "es",
			extend: false,
			banner
		}
	],
	plugins = [

		commonjs({
			include: [
				'node_modules/simplify-js/**',
				'node_modules/rbush/**',
				'node_modules/@turf/**',
				'node_modules/quickselect/**'
			]
		}),
		alias({
			'lodash-es': 'node_modules/lodash-es',

		}),
		replace({
			const: 'var',
			let: 'var',

		}),
		resolve({
			module: true, // Default: true
			jsnext: true, // Default: false
			main: false
		}),
		babel(),
		cleanup()

	];


if (process.env.UTILS) {
	input = "src/components/utils.js";
	output = [{
		file: "dist/utils.js",
		format: "umd",
		name: 'turfUtils',
		exports: 'named',
		extend: false,
		banner
	}];

}

if (process.env.SUBSET) {
	input = "src/ig_subset.js";
	output = [{
		file: "dist/ig_subset.js",
		format: "umd",
		name: 'turfSubset',
		exports: 'named',
		extend: false,
		banner
	}];

}

export default {

	input: input,
	plugins: plugins,
	output: output

};
