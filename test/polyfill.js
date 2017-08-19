const assert = require('assert');

const {parsePathData} = require('../polyfill');

assert.deepEqual(
	parsePathData("M10,10h10l20-20L10,20Z"),
	[ 
		{ type: 'M', values: [ 10, 10 ] },
		{ type: 'h', values: [ 10 ] },
		{ type: 'l', values: [ 20, -20 ] },
		{ type: 'L', values: [ 10, 20 ] },
		{ type: 'Z', values: [] }
	]
);

assert.deepEqual(
	parsePathData("M10,10h10l20-20L10,20Z", true),
	[ 
		{ type: 'M', values: [ 10, 10 ] },
		{ type: 'L', values: [ 20, 10 ] },
		{ type: 'L', values: [ 40, -10 ] },
		{ type: 'L', values: [ 10, 20 ] },
		{ type: 'Z', values: [] }
	]
);

assert.deepEqual(
	parsePathData("M10,10-.3.2"),
	[
		{ type: 'M', values: [ 10, 10 ] },
		{ type: 'L', values: [ -0.3, 0.2 ] }
	]
);
