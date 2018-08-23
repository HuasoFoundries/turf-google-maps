import resolve from "rollup-plugin-node-resolve";
import commonjs from "rollup-plugin-commonjs";
import alias from 'rollup-plugin-alias';
import babel from 'rollup-plugin-babel';
import replace from 'rollup-plugin-replace'
import uglify from 'rollup-plugin-uglify';
import pkgConfig from "./package.json";

var banner =
	`
/*
 * turf-google-maps
 * version ${pkgConfig.version}
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
			banner: banner
		},
		{
			file: "dist/ig_turfhelper.esm.js",
			format: "es"
		}
	],
	plugins = [
		commonjs(),
		alias({
			'lodash-es': 'node_modules/lodash-es'
		}),
		replace({
			const: 'var',
			let: 'var',

		}),
		resolve(),
		babel()
	];
if (process.env.MINIFY) {
	input = "dist/ig_turfhelper.js";
	output = [{
		file: "dist/ig_turfhelper.min.js",
		format: "umd",
		name: 'turfHelper',
		sourcemap: true,
		exports: 'named',
		banner: banner,
	}];
	plugins.push(uglify({
		mangle: false
	}));
}
if (process.env.UTILS) {
	input = "src/components/utils.js";
	output = [{
		file: "dist/utils.min.js",
		format: "umd",
		name: 'turfUtils',
		sourcemap: true,
		exports: 'named',
		banner: banner
	}];
	plugins.push(uglify());
}

export default {

	input: input,
	extend: true,

	plugins: plugins,
	output: output

};
