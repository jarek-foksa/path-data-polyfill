const {parsePathData} = require('../polyfill');

const str = pd => pd.map(seg => seg.type + (seg.values || []).join(" ")).join("");

console.log(str(parsePathData("M10,10h10l20-20L10,20a2.2,-6.3,36,1,0,85.3,67.3Z", true)));

// https://jsfiddle.net/crl/tvy0Ldm4/
