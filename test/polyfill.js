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


assert.equal(
	parsePathData("M10,10h10l20-20L10,20a2.2,-6.3,36,1,0,85.3,67.3Z", true)
		.map(seg => seg.type + (seg.values || []).join(" ")).join(""),
	"M10 10L20 10L40 -10L10 20C67.13984458801455 -74.41176218302412 160.60040865747968 -108.72200954002473 153.63105216824832 -38.05369894061284C150.39656256512524 -5.256421852369257 58.646558113423744 81.87125641332061 25.785667038799595 126.6431181524056Z"
);
