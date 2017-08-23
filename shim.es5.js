var pathData = (function () {
'use strict';

function createCommonjsModule(fn, module) {
	return module = { exports: {} }, fn(module, module.exports), module.exports;
}

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var polyfill = createCommonjsModule(function (module, exports) {
  var commandsMap = {
    "Z": "Z", "M": "M", "L": "L", "C": "C", "Q": "Q", "A": "A", "H": "H", "V": "V", "S": "S", "T": "T",
    "z": "Z", "m": "m", "l": "l", "c": "c", "q": "q", "a": "a", "h": "h", "v": "v", "s": "s", "t": "t"
  };

  var Source = function () {
    function Source(string) {
      _classCallCheck(this, Source);

      this._string = string;
      this._currentIndex = 0;
      this._endIndex = this._string.length;
      this._prevCommand = null;

      this._skipOptionalSpaces();
    }

    _createClass(Source, [{
      key: "parseSegment",
      value: function parseSegment() {
        var char = this._string[this._currentIndex];
        var command = commandsMap[char] ? commandsMap[char] : null;

        if (command === null) {
          if (this._prevCommand === null) {
            return null;
          }

          if ((char === "+" || char === "-" || char === "." || char >= "0" && char <= "9") && this._prevCommand !== "Z") {
            if (this._prevCommand === "M") {
              command = "L";
            } else if (this._prevCommand === "m") {
              command = "l";
            } else {
              command = this._prevCommand;
            }
          } else {
            command = null;
          }

          if (command === null) {
            return null;
          }
        } else {
          this._currentIndex += 1;
        }

        this._prevCommand = command;

        var values = null;
        var cmd = command.toUpperCase();

        if (cmd === "H" || cmd === "V") {
          values = [this._parseNumber()];
        } else if (cmd === "M" || cmd === "L" || cmd === "T") {
          values = [this._parseNumber(), this._parseNumber()];
        } else if (cmd === "S" || cmd === "Q") {
          values = [this._parseNumber(), this._parseNumber(), this._parseNumber(), this._parseNumber()];
        } else if (cmd === "C") {
          values = [this._parseNumber(), this._parseNumber(), this._parseNumber(), this._parseNumber(), this._parseNumber(), this._parseNumber()];
        } else if (cmd === "A") {
          values = [this._parseNumber(), this._parseNumber(), this._parseNumber(), this._parseArcFlag(), this._parseArcFlag(), this._parseNumber(), this._parseNumber()];
        } else if (cmd === "Z") {
          this._skipOptionalSpaces();
          values = [];
        }

        if (values === null || values.indexOf(null) >= 0) {
          return null;
        } else {
          return { type: command, values: values };
        }
      }
    }, {
      key: "hasMoreData",
      value: function hasMoreData() {
        return this._currentIndex < this._endIndex;
      }
    }, {
      key: "peekSegmentType",
      value: function peekSegmentType() {
        var char = this._string[this._currentIndex];
        return commandsMap[char] ? commandsMap[char] : null;
      }
    }, {
      key: "initialCommandIsMoveTo",
      value: function initialCommandIsMoveTo() {
        if (!this.hasMoreData()) {
          return true;
        }

        var command = this.peekSegmentType();
        return command === "M" || command === "m";
      }
    }, {
      key: "_isCurrentSpace",
      value: function _isCurrentSpace() {
        var char = this._string[this._currentIndex];
        return char <= " " && (char === " " || char === "\n" || char === "\t" || char === "\r" || char === "\f");
      }
    }, {
      key: "_skipOptionalSpaces",
      value: function _skipOptionalSpaces() {
        while (this._currentIndex < this._endIndex && this._isCurrentSpace()) {
          this._currentIndex += 1;
        }

        return this._currentIndex < this._endIndex;
      }
    }, {
      key: "_skipOptionalSpacesOrDelimiter",
      value: function _skipOptionalSpacesOrDelimiter() {
        if (this._currentIndex < this._endIndex && !this._isCurrentSpace() && this._string[this._currentIndex] !== ",") {
          return false;
        }

        if (this._skipOptionalSpaces()) {
          if (this._currentIndex < this._endIndex && this._string[this._currentIndex] === ",") {
            this._currentIndex += 1;
            this._skipOptionalSpaces();
          }
        }
        return this._currentIndex < this._endIndex;
      }
    }, {
      key: "_parseNumber",
      value: function _parseNumber() {
        var exponent = 0;
        var integer = 0;
        var frac = 1;
        var decimal = 0;
        var sign = 1;
        var expsign = 1;
        var startIndex = this._currentIndex;

        this._skipOptionalSpaces();

        if (this._currentIndex < this._endIndex && this._string[this._currentIndex] === "+") {
          this._currentIndex += 1;
        } else if (this._currentIndex < this._endIndex && this._string[this._currentIndex] === "-") {
          this._currentIndex += 1;
          sign = -1;
        }

        if (this._currentIndex === this._endIndex || (this._string[this._currentIndex] < "0" || this._string[this._currentIndex] > "9") && this._string[this._currentIndex] !== ".") {
          return null;
        }

        var startIntPartIndex = this._currentIndex;

        while (this._currentIndex < this._endIndex && this._string[this._currentIndex] >= "0" && this._string[this._currentIndex] <= "9") {
          this._currentIndex += 1;
        }

        if (this._currentIndex !== startIntPartIndex) {
          var scanIntPartIndex = this._currentIndex - 1;
          var multiplier = 1;

          while (scanIntPartIndex >= startIntPartIndex) {
            integer += multiplier * (this._string[scanIntPartIndex] - "0");
            scanIntPartIndex -= 1;
            multiplier *= 10;
          }
        }

        if (this._currentIndex < this._endIndex && this._string[this._currentIndex] === ".") {
          this._currentIndex += 1;

          if (this._currentIndex >= this._endIndex || this._string[this._currentIndex] < "0" || this._string[this._currentIndex] > "9") {
            return null;
          }

          while (this._currentIndex < this._endIndex && this._string[this._currentIndex] >= "0" && this._string[this._currentIndex] <= "9") {
            frac *= 10;
            decimal += (this._string.charAt(this._currentIndex) - "0") / frac;
            this._currentIndex += 1;
          }
        }

        if (this._currentIndex !== startIndex && this._currentIndex + 1 < this._endIndex && (this._string[this._currentIndex] === "e" || this._string[this._currentIndex] === "E") && this._string[this._currentIndex + 1] !== "x" && this._string[this._currentIndex + 1] !== "m") {
          this._currentIndex += 1;

          if (this._string[this._currentIndex] === "+") {
            this._currentIndex += 1;
          } else if (this._string[this._currentIndex] === "-") {
            this._currentIndex += 1;
            expsign = -1;
          }

          if (this._currentIndex >= this._endIndex || this._string[this._currentIndex] < "0" || this._string[this._currentIndex] > "9") {
            return null;
          }

          while (this._currentIndex < this._endIndex && this._string[this._currentIndex] >= "0" && this._string[this._currentIndex] <= "9") {
            exponent *= 10;
            exponent += this._string[this._currentIndex] - "0";
            this._currentIndex += 1;
          }
        }

        var number = integer + decimal;
        number *= sign;

        if (exponent) {
          number *= Math.pow(10, expsign * exponent);
        }

        if (startIndex === this._currentIndex) {
          return null;
        }

        this._skipOptionalSpacesOrDelimiter();

        return number;
      }
    }, {
      key: "_parseArcFlag",
      value: function _parseArcFlag() {
        if (this._currentIndex >= this._endIndex) {
          return null;
        }

        var flag = null;
        var flagChar = this._string[this._currentIndex];

        this._currentIndex += 1;

        if (flagChar === "0") {
          flag = 0;
        } else if (flagChar === "1") {
          flag = 1;
        } else {
          return null;
        }

        this._skipOptionalSpacesOrDelimiter();
        return flag;
      }
    }]);

    return Source;
  }();

  exports.parsePathData = function (string, normalize) {
    if (!string) return [];

    var source = new Source(string);
    var pathData = [];

    if (source.initialCommandIsMoveTo()) {
      while (source.hasMoreData()) {
        var pathSeg = source.parseSegment();

        if (pathSeg === null) {
          break;
        } else {
          pathData.push(pathSeg);
        }
      }
    }

    return normalize ? reducePathData(absolutizePathData(pathData)) : pathData;
  };

  var degToRad = function degToRad(degrees) {
    return Math.PI * degrees / 180;
  };

  var rotate = function rotate(x, y, angleRad) {
    return {
      x: x * Math.cos(angleRad) - y * Math.sin(angleRad),
      y: x * Math.sin(angleRad) + y * Math.cos(angleRad)
    };
  };

  // @info
  //   Get an array of corresponding cubic bezier curve parameters for given arc curve paramters.
  var arcToCubicCurves = function arcToCubicCurves(x1, y1, x2, y2, r1, r2, angle, largeArcFlag, sweepFlag, _recursive) {

    var angleRad = degToRad(angle);
    var params = [];
    var f1 = void 0,
        f2 = void 0,
        cx = void 0,
        cy = void 0;

    if (_recursive) {
      f1 = _recursive[0];
      f2 = _recursive[1];
      cx = _recursive[2];
      cy = _recursive[3];
    } else {
      var _rotate = rotate(_x, _y, -angleRad),
          _x = _rotate.x,
          _y = _rotate.y;

      var _rotate2 = rotate(_x2, _y2, -angleRad),
          _x2 = _rotate2.x,
          _y2 = _rotate2.y;

      var x = (_x - _x2) / 2;
      var y = (_y - _y2) / 2;
      var h = x * x / (r1 * r1) + y * y / (r2 * r2);

      if (h > 1) {
        h = Math.sqrt(h);
        r1 = h * r1;
        r2 = h * r2;
      }

      var sign = largeArcFlag === sweepFlag ? -1 : 1;

      var r1Pow = r1 * r1;
      var r2Pow = r2 * r2;

      var left = r1Pow * r2Pow - r1Pow * y * y - r2Pow * x * x;
      var right = r1Pow * y * y + r2Pow * x * x;

      var k = sign * Math.sqrt(Math.abs(left / right));

      cx = k * r1 * y / r2 + (_x + _x2) / 2;
      cy = k * -r2 * x / r1 + (_y + _y2) / 2;

      f1 = Math.asin(Math.round((_y - cy) / r2 * 1e9) / 1e9);
      f2 = Math.asin(Math.round((_y2 - cy) / r2 * 1e9) / 1e9);

      if (_x < cx) {
        f1 = Math.PI - f1;
      }
      if (_x2 < cx) {
        f2 = Math.PI - f2;
      }

      if (f1 < 0) {
        f1 = Math.PI * 2 + f1;
      }
      if (f2 < 0) {
        f2 = Math.PI * 2 + f2;
      }

      if (sweepFlag && f1 > f2) {
        f1 = f1 - Math.PI * 2;
      }
      if (!sweepFlag && f2 > f1) {
        f2 = f2 - Math.PI * 2;
      }
    }

    var df = f2 - f1;

    if (Math.abs(df) > Math.PI * 120 / 180) {
      var f2old = f2;
      var x2old = x2;
      var y2old = y2;

      if (sweepFlag && f2 > f1) {
        f2 = f1 + Math.PI * 120 / 180 * 1;
      } else {
        f2 = f1 + Math.PI * 120 / 180 * -1;
      }

      x2 = cx + r1 * Math.cos(f2);
      y2 = cy + r2 * Math.sin(f2);
      params = arcToCubicCurves(x2, y2, x2old, y2old, r1, r2, angle, 0, sweepFlag, [f2, f2old, cx, cy]);
    }

    df = f2 - f1;

    var c1 = Math.cos(f1);
    var s1 = Math.sin(f1);
    var c2 = Math.cos(f2);
    var s2 = Math.sin(f2);
    var t = Math.tan(df / 4);
    var hx = 4 / 3 * r1 * t;
    var hy = 4 / 3 * r2 * t;

    var m1 = [x1, y1];
    var m2 = [x1 + hx * s1, y1 - hy * c1];
    var m3 = [x2 + hx * s2, y2 - hy * c2];
    var m4 = [x2, y2];

    m2[0] = 2 * m1[0] - m2[0];
    m2[1] = 2 * m1[1] - m2[1];

    if (_recursive) {
      return [m2, m3, m4].concat(params);
    } else {
      params = [m2, m3, m4].concat(params).join().split(",");

      var newParams = [];

      for (var i = 0; i < params.length; i++) {
        newParams[i] = i % 2 ? rotate(params[i - 1], params[i], angleRad).y : rotate(params[i], params[i + 1], angleRad).x;
      }

      return newParams;
    }
  };

  exports.clonePathData = function (pathData) {
    return pathData.map(function (seg) {
      return { type: seg.type, values: [].concat(_toConsumableArray(seg.values)) };
    });
  };

  // @info
  //   Takes any path data, returns path data that consists only from absolute commands.
  function absolutizePathData(pathData) {
    var absolutizedPathData = [];

    var currentX = null;
    var currentY = null;

    var subpathX = null;
    var subpathY = null;

    var _iteratorNormalCompletion = true;
    var _didIteratorError = false;
    var _iteratorError = undefined;

    try {
      for (var _iterator = pathData[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
        var seg = _step.value;

        var type = seg.type;

        if (type === "M") {
          var _seg$values = _slicedToArray(seg.values, 2),
              x = _seg$values[0],
              y = _seg$values[1];

          absolutizedPathData.push({ type: "M", values: [x, y] });

          subpathX = x;
          subpathY = y;

          currentX = x;
          currentY = y;
        } else if (type === "m") {
          var _seg$values2 = _slicedToArray(seg.values, 2),
              _x3 = _seg$values2[0],
              _y3 = _seg$values2[1];

          _x3 += currentX;
          _y3 += currentY;

          absolutizedPathData.push({ type: "M", values: [_x3, _y3] });

          subpathX = _x3;
          subpathY = _y3;

          currentX = _x3;
          currentY = _y3;
        } else if (type === "L") {
          var _seg$values3 = _slicedToArray(seg.values, 2),
              _x4 = _seg$values3[0],
              _y4 = _seg$values3[1];

          absolutizedPathData.push({ type: "L", values: [_x4, _y4] });

          currentX = _x4;
          currentY = _y4;
        } else if (type === "l") {
          var _seg$values4 = _slicedToArray(seg.values, 2),
              _x5 = _seg$values4[0],
              _y5 = _seg$values4[1];

          _x5 += currentX;
          _y5 += currentY;

          absolutizedPathData.push({ type: "L", values: [_x5, _y5] });

          currentX = _x5;
          currentY = _y5;
        } else if (type === "C") {
          var _seg$values5 = _slicedToArray(seg.values, 6),
              x1 = _seg$values5[0],
              y1 = _seg$values5[1],
              x2 = _seg$values5[2],
              y2 = _seg$values5[3],
              _x6 = _seg$values5[4],
              _y6 = _seg$values5[5];

          absolutizedPathData.push({ type: "C", values: [x1, y1, x2, y2, _x6, _y6] });

          currentX = _x6;
          currentY = _y6;
        } else if (type === "c") {
          var _seg$values6 = _slicedToArray(seg.values, 6),
              _x7 = _seg$values6[0],
              _y7 = _seg$values6[1],
              _x8 = _seg$values6[2],
              _y8 = _seg$values6[3],
              _x9 = _seg$values6[4],
              _y9 = _seg$values6[5];

          _x7 += currentX;
          _y7 += currentY;
          _x8 += currentX;
          _y8 += currentY;
          _x9 += currentX;
          _y9 += currentY;

          absolutizedPathData.push({ type: "C", values: [_x7, _y7, _x8, _y8, _x9, _y9] });

          currentX = _x9;
          currentY = _y9;
        } else if (type === "Q") {
          var _seg$values7 = _slicedToArray(seg.values, 4),
              _x10 = _seg$values7[0],
              _y10 = _seg$values7[1],
              _x11 = _seg$values7[2],
              _y11 = _seg$values7[3];

          absolutizedPathData.push({ type: "Q", values: [_x10, _y10, _x11, _y11] });

          currentX = _x11;
          currentY = _y11;
        } else if (type === "q") {
          var _seg$values8 = _slicedToArray(seg.values, 4),
              _x12 = _seg$values8[0],
              _y12 = _seg$values8[1],
              _x13 = _seg$values8[2],
              _y13 = _seg$values8[3];

          _x12 += currentX;
          _y12 += currentY;
          _x13 += currentX;
          _y13 += currentY;

          absolutizedPathData.push({ type: "Q", values: [_x12, _y12, _x13, _y13] });

          currentX = _x13;
          currentY = _y13;
        } else if (type === "A") {
          var _seg$values9 = _slicedToArray(seg.values, 7),
              rx = _seg$values9[0],
              ry = _seg$values9[1],
              xAxisRotation = _seg$values9[2],
              largeArcFlag = _seg$values9[3],
              sweepFlag = _seg$values9[4],
              _x14 = _seg$values9[5],
              _y14 = _seg$values9[6];

          absolutizedPathData.push({
            type: "A",
            values: [rx, ry, xAxisRotation, largeArcFlag, sweepFlag, _x14, _y14]
          });

          currentX = _x14;
          currentY = _y14;
        } else if (type === "a") {
          var _seg$values10 = _slicedToArray(seg.values, 7),
              _rx = _seg$values10[0],
              _ry = _seg$values10[1],
              _xAxisRotation = _seg$values10[2],
              _largeArcFlag = _seg$values10[3],
              _sweepFlag = _seg$values10[4],
              _x15 = _seg$values10[5],
              _y15 = _seg$values10[6];

          _x15 += currentX;
          _y15 += currentY;

          absolutizedPathData.push({
            type: "A",
            values: [_rx, _ry, _xAxisRotation, _largeArcFlag, _sweepFlag, _x15, _y15]
          });

          currentX = _x15;
          currentY = _y15;
        } else if (type === "H") {
          var _seg$values11 = _slicedToArray(seg.values, 1),
              _x16 = _seg$values11[0];

          absolutizedPathData.push({ type: "H", values: [_x16] });
          currentX = _x16;
        } else if (type === "h") {
          var _seg$values12 = _slicedToArray(seg.values, 1),
              _x17 = _seg$values12[0];

          _x17 += currentX;

          absolutizedPathData.push({ type: "H", values: [_x17] });
          currentX = _x17;
        } else if (type === "V") {
          var _seg$values13 = _slicedToArray(seg.values, 1),
              _y16 = _seg$values13[0];

          absolutizedPathData.push({ type: "V", values: [_y16] });
          currentY = _y16;
        } else if (type === "v") {
          var _seg$values14 = _slicedToArray(seg.values, 1),
              _y17 = _seg$values14[0];

          _y17 += currentY;

          absolutizedPathData.push({ type: "V", values: [_y17] });
          currentY = _y17;
        } else if (type === "S") {
          var _seg$values15 = _slicedToArray(seg.values, 4),
              _x18 = _seg$values15[0],
              _y18 = _seg$values15[1],
              _x19 = _seg$values15[2],
              _y19 = _seg$values15[3];

          absolutizedPathData.push({ type: "S", values: [_x18, _y18, _x19, _y19] });

          currentX = _x19;
          currentY = _y19;
        } else if (type === "s") {
          var _seg$values16 = _slicedToArray(seg.values, 4),
              _x20 = _seg$values16[0],
              _y20 = _seg$values16[1],
              _x21 = _seg$values16[2],
              _y21 = _seg$values16[3];

          _x20 += currentX;
          _y20 += currentY;
          _x21 += currentX;
          _y21 += currentY;

          absolutizedPathData.push({ type: "S", values: [_x20, _y20, _x21, _y21] });

          currentX = _x21;
          currentY = _y21;
        } else if (type === "T") {
          var _seg$values17 = _slicedToArray(seg.values, 2),
              _x22 = _seg$values17[0],
              _y22 = _seg$values17[1];

          absolutizedPathData.push({ type: "T", values: [_x22, _y22] });

          currentX = _x22;
          currentY = _y22;
        } else if (type === "t") {
          var _seg$values18 = _slicedToArray(seg.values, 2),
              _x23 = _seg$values18[0],
              _y23 = _seg$values18[1];

          _x23 += currentX;
          _y23 += currentY;

          absolutizedPathData.push({ type: "T", values: [_x23, _y23] });

          currentX = _x23;
          currentY = _y23;
        } else if (type === "Z" || type === "z") {
          absolutizedPathData.push({ type: "Z", values: [] });

          currentX = subpathX;
          currentY = subpathY;
        }
      }
    } catch (err) {
      _didIteratorError = true;
      _iteratorError = err;
    } finally {
      try {
        if (!_iteratorNormalCompletion && _iterator.return) {
          _iterator.return();
        }
      } finally {
        if (_didIteratorError) {
          throw _iteratorError;
        }
      }
    }

    return absolutizedPathData;
  }

  // @info
  //   Takes path data that consists only from absolute commands, returns path data that consists only from
  //   "M", "L", "C" and "Z" commands.
  function reducePathData(pathData) {
    var reducedPathData = [];
    var lastType = null;

    var lastControlX = null;
    var lastControlY = null;

    var currentX = null;
    var currentY = null;

    var subpathX = null;
    var subpathY = null;

    var _iteratorNormalCompletion2 = true;
    var _didIteratorError2 = false;
    var _iteratorError2 = undefined;

    try {
      for (var _iterator2 = pathData[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
        var seg = _step2.value;

        if (seg.type === "M") {
          var _seg$values19 = _slicedToArray(seg.values, 2),
              x = _seg$values19[0],
              y = _seg$values19[1];

          reducedPathData.push({ type: "M", values: [x, y] });

          subpathX = x;
          subpathY = y;

          currentX = x;
          currentY = y;
        } else if (seg.type === "C") {
          var _seg$values20 = _slicedToArray(seg.values, 6),
              x1 = _seg$values20[0],
              y1 = _seg$values20[1],
              x2 = _seg$values20[2],
              y2 = _seg$values20[3],
              _x24 = _seg$values20[4],
              _y24 = _seg$values20[5];

          reducedPathData.push({ type: "C", values: [x1, y1, x2, y2, _x24, _y24] });

          lastControlX = x2;
          lastControlY = y2;

          currentX = _x24;
          currentY = _y24;
        } else if (seg.type === "L") {
          var _seg$values21 = _slicedToArray(seg.values, 2),
              _x25 = _seg$values21[0],
              _y25 = _seg$values21[1];

          reducedPathData.push({ type: "L", values: [_x25, _y25] });

          currentX = _x25;
          currentY = _y25;
        } else if (seg.type === "H") {
          var _seg$values22 = _slicedToArray(seg.values, 1),
              _x26 = _seg$values22[0];

          reducedPathData.push({ type: "L", values: [_x26, currentY] });

          currentX = _x26;
        } else if (seg.type === "V") {
          var _seg$values23 = _slicedToArray(seg.values, 1),
              _y26 = _seg$values23[0];

          reducedPathData.push({ type: "L", values: [currentX, _y26] });

          currentY = _y26;
        } else if (seg.type === "S") {
          var _seg$values24 = _slicedToArray(seg.values, 4),
              _x27 = _seg$values24[0],
              _y27 = _seg$values24[1],
              _x28 = _seg$values24[2],
              _y28 = _seg$values24[3];

          var cx1 = void 0,
              cy1 = void 0;

          if (lastType === "C" || lastType === "S") {
            cx1 = currentX + (currentX - lastControlX);
            cy1 = currentY + (currentY - lastControlY);
          } else {
            cx1 = currentX;
            cy1 = currentY;
          }

          reducedPathData.push({ type: "C", values: [cx1, cy1, _x27, _y27, _x28, _y28] });

          lastControlX = _x27;
          lastControlY = _y27;

          currentX = _x28;
          currentY = _y28;
        } else if (seg.type === "T") {
          var _seg$values25 = _slicedToArray(seg.values, 2),
              _x29 = _seg$values25[0],
              _y29 = _seg$values25[1];

          var _x30 = void 0,
              _y30 = void 0;

          if (lastType === "Q" || lastType === "T") {
            _x30 = currentX + (currentX - lastControlX);
            _y30 = currentY + (currentY - lastControlY);
          } else {
            _x30 = currentX;
            _y30 = currentY;
          }

          var _cx = currentX + 2 * (_x30 - currentX) / 3;
          var _cy = currentY + 2 * (_y30 - currentY) / 3;
          var cx2 = _x29 + 2 * (_x30 - _x29) / 3;
          var cy2 = _y29 + 2 * (_y30 - _y29) / 3;

          reducedPathData.push({ type: "C", values: [_cx, _cy, cx2, cy2, _x29, _y29] });

          lastControlX = _x30;
          lastControlY = _y30;

          currentX = _x29;
          currentY = _y29;
        } else if (seg.type === "Q") {
          var _seg$values26 = _slicedToArray(seg.values, 4),
              _x31 = _seg$values26[0],
              _y31 = _seg$values26[1],
              _x32 = _seg$values26[2],
              _y32 = _seg$values26[3];

          var _cx2 = currentX + 2 * (_x31 - currentX) / 3;
          var _cy2 = currentY + 2 * (_y31 - currentY) / 3;
          var _cx3 = _x32 + 2 * (_x31 - _x32) / 3;
          var _cy3 = _y32 + 2 * (_y31 - _y32) / 3;

          reducedPathData.push({ type: "C", values: [_cx2, _cy2, _cx3, _cy3, _x32, _y32] });

          lastControlX = _x31;
          lastControlY = _y31;

          currentX = _x32;
          currentY = _y32;
        } else if (seg.type === "A") {
          (function () {
            var _seg$values27 = _slicedToArray(seg.values, 7),
                r1 = _seg$values27[0],
                r2 = _seg$values27[1],
                angle = _seg$values27[2],
                largeArcFlag = _seg$values27[3],
                sweepFlag = _seg$values27[4],
                x = _seg$values27[5],
                y = _seg$values27[6];

            if (r1 === 0 || r2 === 0) {
              reducedPathData.push({ type: "C", values: [currentX, currentY, x, y, x, y] });

              currentX = x;
              currentY = y;
            } else {
              if (currentX !== x || currentY !== y) {
                var curves = arcToCubicCurves(currentX, currentY, x, y, r1, r2, angle, largeArcFlag, sweepFlag);

                curves.forEach(function (curve) {
                  reducedPathData.push({ type: "C", values: curve });

                  currentX = x;
                  currentY = y;
                });
              }
            }
          })();
        } else if (seg.type === "Z") {
          reducedPathData.push(seg);

          currentX = subpathX;
          currentY = subpathY;
        }

        lastType = seg.type;
      }
    } catch (err) {
      _didIteratorError2 = true;
      _iteratorError2 = err;
    } finally {
      try {
        if (!_iteratorNormalCompletion2 && _iterator2.return) {
          _iterator2.return();
        }
      } finally {
        if (_didIteratorError2) {
          throw _iteratorError2;
        }
      }
    }

    return reducedPathData;
  }

  exports.getRectPathData = function (options) {
    var x = this.x.baseVal.value;
    var y = this.y.baseVal.value;
    var width = this.width.baseVal.value;
    var height = this.height.baseVal.value;
    var rx = this.hasAttribute("rx") ? this.rx.baseVal.value : this.ry.baseVal.value;
    var ry = this.hasAttribute("ry") ? this.ry.baseVal.value : this.rx.baseVal.value;

    if (rx > width / 2) {
      rx = width / 2;
    }

    if (ry > height / 2) {
      ry = height / 2;
    }

    var pathData = [{ type: "M", values: [x + rx, y] }, { type: "H", values: [x + width - rx] }, { type: "A", values: [rx, ry, 0, 0, 1, x + width, y + ry] }, { type: "V", values: [y + height - ry] }, { type: "A", values: [rx, ry, 0, 0, 1, x + width - rx, y + height] }, { type: "H", values: [x + rx] }, { type: "A", values: [rx, ry, 0, 0, 1, x, y + height - ry] }, { type: "V", values: [y + ry] }, { type: "A", values: [rx, ry, 0, 0, 1, x + rx, y] }, { type: "Z", values: [] }];

    // Get rid of redundant "A" segs when either rx or ry is 0
    pathData = pathData.filter(function (s) {
      return s.type === "A" && (s.values[0] === 0 || s.values[1] === 0) ? false : true;
    });

    if (options && options.normalize === true) {
      pathData = reducePathData(pathData);
    }

    return pathData;
  };

  exports.getCirclePathData = function (options) {
    var cx = this.cx.baseVal.value;
    var cy = this.cy.baseVal.value;
    var r = this.r.baseVal.value;

    var pathData = [{ type: "M", values: [cx + r, cy] }, { type: "A", values: [r, r, 0, 0, 1, cx, cy + r] }, { type: "A", values: [r, r, 0, 0, 1, cx - r, cy] }, { type: "A", values: [r, r, 0, 0, 1, cx, cy - r] }, { type: "A", values: [r, r, 0, 0, 1, cx + r, cy] }, { type: "Z", values: [] }];

    if (options && options.normalize === true) {
      pathData = reducePathData(pathData);
    }

    return pathData;
  };

  exports.getEllipsePathData = function (options) {
    var cx = this.cx.baseVal.value;
    var cy = this.cy.baseVal.value;
    var rx = this.rx.baseVal.value;
    var ry = this.ry.baseVal.value;

    var pathData = [{ type: "M", values: [cx + rx, cy] }, { type: "A", values: [rx, ry, 0, 0, 1, cx, cy + ry] }, { type: "A", values: [rx, ry, 0, 0, 1, cx - rx, cy] }, { type: "A", values: [rx, ry, 0, 0, 1, cx, cy - ry] }, { type: "A", values: [rx, ry, 0, 0, 1, cx + rx, cy] }, { type: "Z", values: [] }];

    if (options && options.normalize === true) {
      pathData = reducePathData(pathData);
    }

    return pathData;
  };

  exports.getLinePathData = function () {
    return [{ type: "M", values: [this.x1.baseVal.value, this.y1.baseVal.value] }, { type: "L", values: [this.x2.baseVal.value, this.y2.baseVal.value] }];
  };

  exports.getPolylinePathData = function () {
    var pathData = [];

    for (var i = 0; i < this.points.numberOfItems; i += 1) {
      var point = this.points.getItem(i);

      pathData.push({
        type: i === 0 ? "M" : "L",
        values: [point.x, point.y]
      });
    }

    return pathData;
  };

  exports.getPolygonPathData = function () {
    var pathData = [];

    for (var i = 0; i < this.points.numberOfItems; i += 1) {
      var point = this.points.getItem(i);

      pathData.push({
        type: i === 0 ? "M" : "L",
        values: [point.x, point.y]
      });
    }

    pathData.push({
      type: "Z",
      values: []
    });

    return pathData;
  };
});

// @info
//   Polyfill for SVG 2 getPathData() and setPathData() methods. Based on:
//   - SVGPathSeg polyfill by Philip Rogers (MIT License)
//     https://github.com/progers/pathseg
//   - SVGPathNormalizer by Tadahisa Motooka (MIT License)
//     https://github.com/motooka/SVGPathNormalizer/tree/master/src
//   - arcToCubicCurves() by Dmitry Baranovskiy (MIT License)
//     https://github.com/DmitryBaranovskiy/raphael/blob/v2.1.1/raphael.core.js#L1837
// @author
//   Jarosław Foksa
// @license
//   MIT License

var parsePathData = polyfill.parsePathData;
var clonePathData = polyfill.clonePathData;
var getRectPathData = polyfill.getRectPathData;
var getCirclePathData = polyfill.getCirclePathData;
var getEllipsePathData = polyfill.getEllipsePathData;
var getLinePathData = polyfill.getLinePathData;
var getPolylinePathData = polyfill.getPolylinePathData;
var getPolygonPathData = polyfill.getPolygonPathData;


if (!SVGPathElement.prototype.getPathData || !SVGPathElement.prototype.setPathData) {
  var setAttribute = SVGPathElement.prototype.setAttribute;
  var removeAttribute = SVGPathElement.prototype.removeAttribute;

  var $cachedPathData = Symbol();
  var $cachedNormalizedPathData = Symbol();

  SVGPathElement.prototype.setAttribute = function (name, value) {
    if (name === "d") {
      this[$cachedPathData] = null;
      this[$cachedNormalizedPathData] = null;
    }

    setAttribute.call(this, name, value);
  };

  SVGPathElement.prototype.removeAttribute = function (name, value) {
    if (name === "d") {
      this[$cachedPathData] = null;
      this[$cachedNormalizedPathData] = null;
    }

    removeAttribute.call(this, name);
  };

  SVGPathElement.prototype.getPathData = function (options) {
    if (options && options.normalize) {
      if (this[$cachedNormalizedPathData]) {
        return clonePathData(this[$cachedNormalizedPathData]);
      } else {
        var normalizedPathData = parsePathData(this.getAttribute("d") || "", true);
        this[$cachedNormalizedPathData] = clonePathData(normalizedPathData);
        return normalizedPathData;
      }
    } else {
      if (this[$cachedPathData]) {
        return clonePathData(this[$cachedPathData]);
      } else {
        var pathData = parsePathData(this.getAttribute("d") || "");
        this[$cachedPathData] = clonePathData(pathData);
        return pathData;
      }
    }
  };

  SVGPathElement.prototype.setPathData = function (pathData) {
    if (pathData.length === 0) {
      this.removeAttribute("d");
    } else {
      var segs = pathData.map(function (seg) {
        return seg.type + (seg.values || []).join(" ");
      });

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

var shim = {};

return shim;

}());
