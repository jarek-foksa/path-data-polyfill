const {
	parsePathData, 
	clonePathData,

	getRectPathData,
	getCirclePathData,
	getEllipsePathData,
	getLinePathData,
	getPolylinePathData,
	getPolygonPathData
} = require('./polyfill');

if (!SVGPathElement.prototype.getPathData || !SVGPathElement.prototype.setPathData) {
	const setAttribute = SVGPathElement.prototype.setAttribute;
  const removeAttribute = SVGPathElement.prototype.removeAttribute;

  const $cachedPathData = Symbol();
  const $cachedNormalizedPathData = Symbol();


  SVGPathElement.prototype.setAttribute = function(name, value) {
    if (name === "d") {
      this[$cachedPathData] = null;
      this[$cachedNormalizedPathData] = null;
    }

    setAttribute.call(this, name, value);
  };

  SVGPathElement.prototype.removeAttribute = function(name, value) {
    if (name === "d") {
      this[$cachedPathData] = null;
      this[$cachedNormalizedPathData] = null;
    }

    removeAttribute.call(this, name);
  };

  SVGPathElement.prototype.getPathData = function(options) {
    if (options && options.normalize) {
      if (!this[$cachedNormalizedPathData]) {
        this[$cachedNormalizedPathData] = parsePathData(this.getAttribute("d") || "", true);
      }
      return clonePathData(this[$cachedNormalizedPathData]);
    }
    
    if (!this[$cachedPathData]) {
      this[$cachedPathData] = parsePathData(this.getAttribute("d") || "");
    }
    return clonePathData(this[$cachedPathData]);
  };

  SVGPathElement.prototype.setPathData = function(pathData) {
    if (pathData.length === 0) {
      this.removeAttribute("d");
    }
    else {
      const segs = pathData.map(seg => seg.type + (seg.values || []).join(" "));

      this.setAttribute("d", segs.join(""));
    }
  };

  SVGRectElement.prototype.getPathData = getRectPathData;

  SVGCircleElement.prototype.getPathData = getCirclePathData;

  SVGEllipseElement.prototype.getPathData = getEllipsePathData;

  SVGLineElement.prototype.getPathData = getLinePathData;

  SVGPolylineElement.prototype.getPathData = getPolylinePathData;

  SVGPolygonElement.prototype.getPathData = getPolygonPathData;

}