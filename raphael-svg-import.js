/*
 * Raphael SVG Import 0.0.1 - Extension to Raphael JS
 *
 * Copyright (c) 2009 Wout Fierens
 * Licensed under the MIT (http://www.opensource.org/licenses/mit-license.php) license.
 */

if (!String.prototype.scan) {
  String.prototype.scan = function(pattern, iterator) {
    var offset = 0;
    var str = this;
    var count = 0;
    do {
      var r = pattern.exec(str);

      if (r && r[0]) {

        offset = r.index + r[0].length;
        str = str.substr(offset, Math.abs(str.length - offset));
        pattern = new RegExp(pattern); // rebuild for another exec

        iterator(r);
        ++count;
        continue;
      }
      else {
        break;
      }

    } while (1);
    return count;
  }
}

if (!Function.prototype.bind) {
  // from prototype.js
  var slice = Array.prototype.slice;
  function update(array, args) {
    var arrayLength = array.length, length = args.length;
    while (length--) array[arrayLength + length] = args[length];
    return array;
  }

  function merge(array, args) {
    array = slice.call(array, 0);
    return update(array, args);
  }

  Function.prototype.bind = function(context) {
    if (arguments.length < 2 && arguments[0] == undefined) return this;
    var __method = this, args = slice.call(arguments, 1);
    return function() {
      var a = merge(args, arguments);
      return __method.apply(context, a);
    }
  }
}

Raphael.fn.importSVG = function (raw_svg) {
  try {
    if (/^\s*$/m.test(raw_svg)) throw "No data was provided.";
    raw_svg = raw_svg.replace(/[\n\r\t]/g, ''); // convert newlines

    if (!raw_svg.match(/<svg(.*?)>(.*)<\/svg>/gi)) throw "The data you entered doesn't contain SVG.";

    var supported = ["rect", "polyline", "circle", "ellipse", "path", "polygon", "image", "text"];
    for (var i = 0, len = supported.length; i < len; ++i) {
      var node = supported[i];

      raw_svg.scan(new RegExp("<" + node + "(.*?)\/>","igm"), (function(match) {
        var attr = { "stroke-width": 0, "fill":"#fff" };
        var shape = null;
        if (match && typeof(match) == 'object' && match[1]) {
          var style;
          match[1].scan(/([a-z\-]+)="(.*?)"/, function(m) {
            switch(m[1]) {
            case "stroke-dasharray":
              attr[m[1]] = "- ";
              break;
            case "style":
              style = m[2];
              break;
            default:
              attr[m[1]] = m[2];
              break;
            }
          });
          if (style) {
            style.scan(/([a-z\-]+) ?: ?([^ ;]+)[ ;]?/, function(m) {
              attr[m[1]] = m[2];
            });
          }
        }
        switch(node) {
          case "rect":
            shape = this.rect();
            break;
          case "circle":
            shape = this.circle();
            break;
          case "ellipse":
            shape = this.ellipse();
            break;
          case "path":
            shape = this.path(attr["d"]);
            break;
          case "polygon":
            shape = this.polygon(attr["points"]);
            break;
          case "image":
            shape = this.image();
            break;
          default:
            shape = {attr:function(){}}
            break;
          //-F case "text":
          //-F   shape = this.text();
          //-F break;
        }
        shape.attr(attr);
      }).bind(this));
    }
  } catch (error) {
    console.error(error);
  }
};

// extending raphael with a polygon function
Raphael.fn.polygon = function(point_string) {
  var poly_array = ["M"];
  if (!point_string) { return this.path(); }
  var points = point_string.split(' ');
  for (var i = 0, len = points.length; i < len; ++i) {
    var point = points[i].split(',');
    for (var j = 0, l = point.length; j < l; ++j) {
      poly_array.push(parseFloat(point[j]));
    }
    if (i == 0) poly_array.push("L");
  }
  poly_array.push("Z");
  var n = []; // remove null's
  for (var i = 0, len = poly_array.length; i < len; ++i) {
    var a = poly_array[i];
    if (a || a == 0) { n.push(a); }
  }
  return this.path(n);
};
