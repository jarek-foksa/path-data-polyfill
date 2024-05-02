interface SVGPathElement {
  /**
   * See https://github.com/jarek-foksa/path-data-polyfill
   *
   * See https://svgwg.org/specs/paths/#InterfaceSVGPathData
   */
  getPathData: (settings?: SVGPathDataSettings) => Array<SVGPathSegment>;
  /**
   * See https://github.com/jarek-foksa/path-data-polyfill
   *
   * See https://svgwg.org/specs/paths/#InterfaceSVGPathData
   */
  setPathData: (pathData: Array<SVGPathSegment>) => void;
}

type SVGPathDataCommand =
  | "A"
  | "a"
  | "C"
  | "c"
  | "H"
  | "h"
  | "L"
  | "l"
  | "M"
  | "m"
  | "Q"
  | "q"
  | "S"
  | "s"
  | "T"
  | "t"
  | "V"
  | "v"
  | "Z"
  | "z";

interface SVGPathDataSettings {
  normalize: boolean;
}

interface SVGPathSegment {
  type: SVGPathDataCommand;
  values: Array<number>;
}
