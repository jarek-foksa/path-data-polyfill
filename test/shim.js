const assert = require('assert');
const {JSDOM} = require('jsdom');

const jsdom = new JSDOM();
global.window = jsdom.window;
global.document = jsdom.window.document;

// make the following classes global so the polyfill find them
global.SVGCircleElement   = jsdom.window.SVGCircleElement;
global.SVGEllipseElement  = jsdom.window.SVGEllipseElement;
global.SVGLineElement     = jsdom.window.SVGLineElement;
global.SVGPathElement     = jsdom.window.SVGPathElement;
global.SVGPolygonElement  = jsdom.window.SVGPolygonElement;
global.SVGPolylineElement = jsdom.window.SVGPolylineElement;
global.SVGRectElement     = jsdom.window.SVGRectElement;

require('../');

const path = JSDOM.fragment`<svg>
	<path d="M10,10h10l20-20L10,20Z" />
</svg>`.firstChild.querySelector('path');

const pathData = path.getPathData({normalize: true});

assert.deepEqual(
	pathData,
	[ 
		{ type: 'M', values: [ 10, 10 ] },
		{ type: 'L', values: [ 20, 10 ] },
		{ type: 'L', values: [ 40, -10 ] },
		{ type: 'L', values: [ 10, 20 ] },
		{ type: 'Z', values: [] }
	]
);

pathData[3].values = [-9, -3.2];

path.setPathData(pathData);

assert.equal(path.getAttribute('d'), "M10 10L20 10L40 -10L-9 -3.2Z");

const line = JSDOM.fragment`<svg>
	<line x1="1" y1="-.3" x2="-99.7" y2=".6" />
</svg>`.firstChild.querySelector('line');

assert.deepEqual(
	line.getPathData({normalize: true}),
	[ 
		{ type: 'M', values: [ 1, -0.3 ] },
  	{ type: 'L', values: [ -99.7, 0.6 ] }
	]
);