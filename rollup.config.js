import resolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';
import babel from 'rollup-plugin-babel';

export default {
	moduleName: 'pathData',
	entry: 'shim.js',
	plugins: [
		resolve(),
		commonjs(),
		babel({
			runtimeHelpers: true
		})
	],
	dest: 'shim.es5.js',
	format: 'iife'
};
