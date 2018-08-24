
/*
 * turf-google-maps
 * version v0.9.6
 * MIT Licensed
 * Felipe Figueroa (amenadiel@gmail.com)
 * https://github.com/HuasoFoundries/turf-google-maps
 */
 
(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
  typeof define === 'function' && define.amd ? define(['exports'], factory) :
  (factory((global.turfUtils = {})));
}(this, (function (exports) { 'use strict';

  var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) {
    return typeof obj;
  } : function (obj) {
    return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
  };

  /** @license
   *
   *  Copyright (C) 2012 K. Arthur Endsley (kaendsle@mtu.edu)
   *  Michigan Tech Research Institute (MTRI)
   *  3600 Green Court, Suite 100, Ann Arbor, MI, 48105
   *
   *  This program is free software: you can redistribute it and/or modify
   *  it under the terms of the GNU General Public License as published by
   *  the Free Software Foundation, either version 3 of the License, or
   *  (at your option) any later version.
   *
   *  This program is distributed in the hope that it will be useful,
   *  but WITHOUT ANY WARRANTY; without even the implied warranty of
   *  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
   *  GNU General Public License for more details.
   *
   *  You should have received a copy of the GNU General Public License
   *  along with this program.  If not, see <http://www.gnu.org/licenses/>.
   *
   */
  var beginsWith, endsWith;
  var Wkt = function Wkt(obj) {
      if (obj instanceof Wkt) return obj;
      if (!(this instanceof Wkt)) return new Wkt(obj);
      this._wrapped = obj;
  };
  beginsWith = function beginsWith(str, sub) {
      return str.substring(0, sub.length) === sub;
  };
  endsWith = function endsWith(str, sub) {
      return str.substring(str.length - sub.length) === sub;
  };
  Wkt.delimiter = ' ';
  Wkt.isArray = function (obj) {
      return !!(obj && obj.constructor === Array);
  };
  Wkt.trim = function (str, sub) {
      sub = sub || ' ';
      while (beginsWith(str, sub)) {
          str = str.substring(1);
      }
      while (endsWith(str, sub)) {
          str = str.substring(0, str.length - 1);
      }
      return str;
  };
  Wkt.Wkt = function (initializer) {
      this.delimiter = Wkt.delimiter || ' ';
      this.wrapVertices = true;
      this.regExes = {
          'typeStr': /^\s*(\w+)\s*\(\s*(.*)\s*\)\s*$/,
          'spaces': /\s+|\+/,
          'numeric': /-*\d+(\.*\d+)?/,
          'comma': /\s*,\s*/,
          'parenComma': /\)\s*,\s*\(/,
          'coord': /-*\d+\.*\d+ -*\d+\.*\d+/,
          'doubleParenComma': /\)\s*\)\s*,\s*\(\s*\(/,
          'trimParens': /^\s*\(?(.*?)\)?\s*$/,
          'ogcTypes': /^(multi)?(point|line|polygon|box)?(string)?$/i,
          'crudeJson': /^{.*"(type|coordinates|geometries|features)":.*}$/
      };
      this.components = undefined;
      if (initializer && typeof initializer === 'string') {
          this.read(initializer);
      } else if (initializer && (typeof initializer === 'undefined' ? 'undefined' : _typeof(initializer)) !== undefined) {
          this.fromObject(initializer);
      }
  };
  Wkt.Wkt.prototype.isCollection = function () {
      switch (this.type.slice(0, 5)) {
          case 'multi':
              return true;
          case 'polyg':
              return true;
          default:
              return false;
      }
  };
  Wkt.Wkt.prototype.sameCoords = function (a, b) {
      return a.x === b.x && a.y === b.y;
  };
  Wkt.Wkt.prototype.fromObject = function (obj) {
      var result;
      if (obj.hasOwnProperty('type') && obj.hasOwnProperty('coordinates')) {
          result = this.fromJson(obj);
      } else {
          result = this.deconstruct.call(this, obj);
      }
      this.components = result.components;
      this.isRectangle = result.isRectangle || false;
      this.type = result.type;
      return this;
  };
  Wkt.Wkt.prototype.toObject = function (config) {
      var obj = this.construct[this.type].call(this, config);
      if ((typeof obj === 'undefined' ? 'undefined' : _typeof(obj)) === 'object' && !Wkt.isArray(obj)) {
          obj.properties = this.properties;
      }
      return obj;
  };
  Wkt.Wkt.prototype.toString = function (config) {
      return this.write();
  };
  Wkt.Wkt.prototype.fromJson = function (obj) {
      var i, j, k, coords, iring, oring;
      this.type = obj.type.toLowerCase();
      this.components = [];
      if (obj.hasOwnProperty('geometry')) {
          this.fromJson(obj.geometry);
          this.properties = obj.properties;
          return this;
      }
      coords = obj.coordinates;
      if (!Wkt.isArray(coords[0])) {
          this.components.push({
              x: coords[0],
              y: coords[1]
          });
      } else {
          for (i in coords) {
              if (coords.hasOwnProperty(i)) {
                  if (!Wkt.isArray(coords[i][0])) {
                      if (this.type === 'multipoint') {
                          this.components.push([{
                              x: coords[i][0],
                              y: coords[i][1]
                          }]);
                      } else {
                          this.components.push({
                              x: coords[i][0],
                              y: coords[i][1]
                          });
                      }
                  } else {
                      oring = [];
                      for (j in coords[i]) {
                          if (coords[i].hasOwnProperty(j)) {
                              if (!Wkt.isArray(coords[i][j][0])) {
                                  oring.push({
                                      x: coords[i][j][0],
                                      y: coords[i][j][1]
                                  });
                              } else {
                                  iring = [];
                                  for (k in coords[i][j]) {
                                      if (coords[i][j].hasOwnProperty(k)) {
                                          iring.push({
                                              x: coords[i][j][k][0],
                                              y: coords[i][j][k][1]
                                          });
                                      }
                                  }
                                  oring.push(iring);
                              }
                          }
                      }
                      this.components.push(oring);
                  }
              }
          }
      }
      return this;
  };
  Wkt.Wkt.prototype.toJson = function () {
      var cs, json, i, j, k, ring, rings;
      cs = this.components;
      json = {
          coordinates: [],
          type: function () {
              var i, type, s;
              type = this.regExes.ogcTypes.exec(this.type).slice(1);
              s = [];
              for (i in type) {
                  if (type.hasOwnProperty(i)) {
                      if (type[i] !== undefined) {
                          s.push(type[i].toLowerCase().slice(0, 1).toUpperCase() + type[i].toLowerCase().slice(1));
                      }
                  }
              }
              return s;
          }.call(this).join('')
      };if (this.type.toLowerCase() === 'box') {
          json.type = 'Polygon';
          json.bbox = [];
          for (i in cs) {
              if (cs.hasOwnProperty(i)) {
                  json.bbox = json.bbox.concat([cs[i].x, cs[i].y]);
              }
          }
          json.coordinates = [[[cs[0].x, cs[0].y], [cs[0].x, cs[1].y], [cs[1].x, cs[1].y], [cs[1].x, cs[0].y], [cs[0].x, cs[0].y]]];
          return json;
      }
      for (i in cs) {
          if (cs.hasOwnProperty(i)) {
              if (Wkt.isArray(cs[i])) {
                  rings = [];
                  for (j in cs[i]) {
                      if (cs[i].hasOwnProperty(j)) {
                          if (Wkt.isArray(cs[i][j])) {
                              ring = [];
                              for (k in cs[i][j]) {
                                  if (cs[i][j].hasOwnProperty(k)) {
                                      ring.push([cs[i][j][k].x, cs[i][j][k].y]);
                                  }
                              }
                              rings.push(ring);
                          } else {
                              if (cs[i].length > 1) {
                                  rings.push([cs[i][j].x, cs[i][j].y]);
                              } else {
                                  rings = rings.concat([cs[i][j].x, cs[i][j].y]);
                              }
                          }
                      }
                  }
                  json.coordinates.push(rings);
              } else {
                  if (cs.length > 1) {
                      json.coordinates.push([cs[i].x, cs[i].y]);
                  } else {
                      json.coordinates = json.coordinates.concat([cs[i].x, cs[i].y]);
                  }
              }
          }
      }
      return json;
  };
  Wkt.Wkt.prototype.merge = function (wkt) {
      var prefix = this.type.slice(0, 5);
      if (this.type !== wkt.type) {
          if (this.type.slice(5, this.type.length) !== wkt.type) {
              throw TypeError('The input geometry types must agree or the calling Wkt.Wkt instance must be a multigeometry of the other');
          }
      }
      switch (prefix) {
          case 'point':
              this.components = [this.components.concat(wkt.components)];
              break;
          case 'multi':
              this.components = this.components.concat(wkt.type.slice(0, 5) === 'multi' ? wkt.components : [wkt.components]);
              break;
          default:
              this.components = [this.components, wkt.components];
              break;
      }
      if (prefix !== 'multi') {
          this.type = 'multi' + this.type;
      }
      return this;
  };
  Wkt.Wkt.prototype.read = function (str) {
      var matches;
      matches = this.regExes.typeStr.exec(str);
      if (matches) {
          this.type = matches[1].toLowerCase();
          this.base = matches[2];
          if (this.ingest[this.type]) {
              this.components = this.ingest[this.type].apply(this, [this.base]);
          }
      } else {
          if (this.regExes.crudeJson.test(str)) {
              if ((typeof JSON === 'undefined' ? 'undefined' : _typeof(JSON)) === 'object' && typeof JSON.parse === 'function') {
                  this.fromJson(JSON.parse(str));
              } else {
                  console.log('JSON.parse() is not available; cannot parse GeoJSON strings');
                  throw {
                      name: 'JSONError',
                      message: 'JSON.parse() is not available; cannot parse GeoJSON strings'
                  };
              }
          } else {
              console.log('Invalid WKT string provided to read() ', str);
              throw {
                  name: 'WKTError',
                  message: 'Invalid WKT string provided to read()'
              };
          }
      }
      return this;
  };
  Wkt.Wkt.prototype.write = function (components) {
      var i, pieces, data;
      components = components || this.components;
      pieces = [];
      pieces.push(this.type.toUpperCase() + '(');
      for (i = 0; i < components.length; i += 1) {
          if (this.isCollection() && i > 0) {
              pieces.push(',');
          }
          if (!this.extract[this.type]) {
              return null;
          }
          data = this.extract[this.type].apply(this, [components[i]]);
          if (this.isCollection() && this.type !== 'multipoint') {
              pieces.push('(' + data + ')');
          } else {
              pieces.push(data);
              if (i !== components.length - 1 && this.type !== 'multipoint') {
                  pieces.push(',');
              }
          }
      }
      pieces.push(')');
      return pieces.join('');
  };
  Wkt.Wkt.prototype.extract = {
      point: function point(_point) {
          return String(_point.x) + this.delimiter + String(_point.y);
      },
      multipoint: function multipoint(_multipoint) {
          var i,
              parts = [],
              s;
          for (i = 0; i < _multipoint.length; i += 1) {
              s = this.extract.point.apply(this, [_multipoint[i]]);
              if (this.wrapVertices) {
                  s = '(' + s + ')';
              }
              parts.push(s);
          }
          return parts.join(',');
      },
      linestring: function linestring(_linestring) {
          return this.extract.point.apply(this, [_linestring]);
      },
      multilinestring: function multilinestring(_multilinestring) {
          var i,
              parts = [];
          if (_multilinestring.length) {
              for (i = 0; i < _multilinestring.length; i += 1) {
                  parts.push(this.extract.linestring.apply(this, [_multilinestring[i]]));
              }
          } else {
              parts.push(this.extract.point.apply(this, [_multilinestring]));
          }
          return parts.join(',');
      },
      polygon: function polygon(_polygon) {
          return this.extract.multilinestring.apply(this, [_polygon]);
      },
      multipolygon: function multipolygon(_multipolygon) {
          var i,
              parts = [];
          for (i = 0; i < _multipolygon.length; i += 1) {
              parts.push('(' + this.extract.polygon.apply(this, [_multipolygon[i]]) + ')');
          }
          return parts.join(',');
      },
      box: function box(_box) {
          return this.extract.linestring.apply(this, [_box]);
      },
      geometrycollection: function geometrycollection(str) {
          console.log('The geometrycollection WKT type is not yet supported.');
      }
  };
  Wkt.Wkt.prototype.ingest = {
      point: function point(str) {
          var coords = Wkt.trim(str).split(this.regExes.spaces);
          return [{
              x: parseFloat(this.regExes.numeric.exec(coords[0])[0]),
              y: parseFloat(this.regExes.numeric.exec(coords[1])[0])
          }];
      },
      multipoint: function multipoint(str) {
          var i, components, points;
          components = [];
          points = Wkt.trim(str).split(this.regExes.comma);
          for (i = 0; i < points.length; i += 1) {
              components.push(this.ingest.point.apply(this, [points[i]]));
          }
          return components;
      },
      linestring: function linestring(str) {
          var i, multipoints, components;
          multipoints = this.ingest.multipoint.apply(this, [str]);
          components = [];
          for (i = 0; i < multipoints.length; i += 1) {
              components = components.concat(multipoints[i]);
          }
          return components;
      },
      multilinestring: function multilinestring(str) {
          var i, components, line, lines;
          components = [];
          lines = Wkt.trim(str).split(this.regExes.doubleParenComma);
          if (lines.length === 1) {
              lines = Wkt.trim(str).split(this.regExes.parenComma);
          }
          for (i = 0; i < lines.length; i += 1) {
              line = lines[i].replace(this.regExes.trimParens, '$1');
              components.push(this.ingest.linestring.apply(this, [line]));
          }
          return components;
      },
      polygon: function polygon(str) {
          var i, j, components, subcomponents, ring, rings;
          rings = Wkt.trim(str).split(this.regExes.parenComma);
          components = [];
          for (i = 0; i < rings.length; i += 1) {
              ring = rings[i].replace(this.regExes.trimParens, '$1').split(this.regExes.comma);
              subcomponents = [];
              for (j = 0; j < ring.length; j += 1) {
                  var split = ring[j].split(this.regExes.spaces);
                  if (split.length > 2) {
                      split = split.filter(function (n) {
                          return n != "";
                      });
                  }
                  if (split.length === 2) {
                      var x_cord = split[0];
                      var y_cord = split[1];
                      subcomponents.push({
                          x: parseFloat(x_cord),
                          y: parseFloat(y_cord)
                      });
                  }
              }
              components.push(subcomponents);
          }
          return components;
      },
      box: function box(str) {
          var i, multipoints, components;
          multipoints = this.ingest.multipoint.apply(this, [str]);
          components = [];
          for (i = 0; i < multipoints.length; i += 1) {
              components = components.concat(multipoints[i]);
          }
          return components;
      },
      multipolygon: function multipolygon(str) {
          var i, components, polygon, polygons;
          components = [];
          polygons = Wkt.trim(str).split(this.regExes.doubleParenComma);
          for (i = 0; i < polygons.length; i += 1) {
              polygon = polygons[i].replace(this.regExes.trimParens, '$1');
              components.push(this.ingest.polygon.apply(this, [polygon]));
          }
          return components;
      },
      geometrycollection: function geometrycollection(str) {
          console.log('The geometrycollection WKT type is not yet supported.');
      }
  };
  Wkt.Wkt.prototype.isRectangle = false;
  Wkt.Wkt.prototype.construct = {
      point: function point(config, component) {
          var c = component || this.components;
          config = config || {
              optimized: true
          };
          config.position = new google.maps.LatLng(c[0].y, c[0].x);
          return new google.maps.Marker(config);
      },
      multipoint: function multipoint(config) {
          var i, c, arr;
          c = this.components;
          config = config || {};
          arr = [];
          for (i = 0; i < c.length; i += 1) {
              arr.push(this.construct.point(config, c[i]));
          }
          return arr;
      },
      linestring: function linestring(config, component) {
          var i, c;
          c = component || this.components;
          config = config || {
              editable: false
          };
          config.path = [];
          for (i = 0; i < c.length; i += 1) {
              config.path.push(new google.maps.LatLng(c[i].y, c[i].x));
          }
          return new google.maps.Polyline(config);
      },
      multilinestring: function multilinestring(config) {
          var i, c, arr;
          c = this.components;
          config = config || {
              editable: false
          };
          config.path = [];
          arr = [];
          for (i = 0; i < c.length; i += 1) {
              arr.push(this.construct.linestring(config, c[i]));
          }
          return arr;
      },
      box: function box(config, component) {
          var c = component || this.components;
          config = config || {};
          config.bounds = new google.maps.LatLngBounds(new google.maps.LatLng(c[0].y, c[0].x), new google.maps.LatLng(c[1].y, c[1].x));
          return new google.maps.Rectangle(config);
      },
      polygon: function polygon(config, component) {
          var j, k, c, rings, verts;
          c = component || this.components;
          config = config || {
              editable: false
          };
          config.paths = [];
          rings = [];
          for (j = 0; j < c.length; j += 1) {
              verts = [];
              for (k = 0; k < c[j].length - 1; k += 1) {
                  verts.push(new google.maps.LatLng(c[j][k].y, c[j][k].x));
              }
              if (j !== 0) {
                  if (config.reverseInnerPolygons === null || config.reverseInnerPolygons) {
                      verts.reverse();
                  }
              }
              rings.push(verts);
          }
          config.paths = config.paths.concat(rings);
          if (this.isRectangle) {
              return function () {
                  var bounds, v;
                  bounds = new google.maps.LatLngBounds();
                  for (v in rings[0]) {
                      if (rings[0].hasOwnProperty(v)) {
                          bounds.extend(rings[0][v]);
                      }
                  }
                  return new google.maps.Rectangle({
                      bounds: bounds
                  });
              }();
          } else {
              return new google.maps.Polygon(config);
          }
      },
      multipolygon: function multipolygon(config) {
          var i, c, arr;
          c = this.components;
          config = config || {
              editable: false
          };
          config.path = [];
          arr = [];
          for (i = 0; i < c.length; i += 1) {
              arr.push(this.construct.polygon(config, c[i]));
          }
          return arr;
      }
  };
  Wkt.Wkt.prototype.deconstruct = function (obj, multiFlag) {
      var features, i, j, verts, rings, sign, tmp, response, lat, lng, vertex, ring;
      var polygons, polygon, k, linestring, linestrings;
      if (google.maps.geometry) {
          sign = google.maps.geometry.spherical.computeSignedArea;
      }
      if (obj.constructor === google.maps.LatLng) {
          response = {
              type: 'point',
              components: [{
                  x: obj.lng(),
                  y: obj.lat()
              }]
          };
          return response;
      }
      if (obj.constructor === google.maps.Point) {
          response = {
              type: 'point',
              components: [{
                  x: obj.x,
                  y: obj.y
              }]
          };
          return response;
      }
      if (obj.constructor === google.maps.Marker) {
          response = {
              type: 'point',
              components: [{
                  x: obj.getPosition().lng(),
                  y: obj.getPosition().lat()
              }]
          };
          return response;
      }
      if (obj.constructor === google.maps.Polyline) {
          verts = [];
          for (i = 0; i < obj.getPath().length; i += 1) {
              tmp = obj.getPath().getAt(i);
              verts.push({
                  x: tmp.lng(),
                  y: tmp.lat()
              });
          }
          response = {
              type: 'linestring',
              components: verts
          };
          return response;
      }
      if (obj.constructor === google.maps.Polygon) {
          rings = [];
          if (multiFlag === undefined) {
              multiFlag = function () {
                  var areas, l;
                  l = obj.getPaths().length;
                  if (l <= 1) {
                      return false;
                  }
                  if (l === 2) {
                      if (sign(obj.getPaths().getAt(0)) * sign(obj.getPaths().getAt(1)) < 0) {
                          return false;
                      }
                      return true;
                  }
                  areas = obj.getPaths().getArray().map(function (k) {
                      return sign(k) / Math.abs(sign(k));
                  });
                  if (areas.indexOf(areas[0]) !== areas.lastIndexOf(areas[0])) {
                      multiFlag = true;
                      return true;
                  }
                  return false;
              }();
          }
          for (i = 0; i < obj.getPaths().length; i += 1) {
              tmp = obj.getPaths().getAt(i);
              verts = [];
              for (j = 0; j < obj.getPaths().getAt(i).length; j += 1) {
                  verts.push({
                      x: tmp.getAt(j).lng(),
                      y: tmp.getAt(j).lat()
                  });
              }
              if (!tmp.getAt(tmp.length - 1).equals(tmp.getAt(0))) {
                  if (i % 2 !== 0) {
                      verts.unshift({
                          x: tmp.getAt(tmp.length - 1).lng(),
                          y: tmp.getAt(tmp.length - 1).lat()
                      });
                  } else {
                      verts.push({
                          x: tmp.getAt(0).lng(),
                          y: tmp.getAt(0).lat()
                      });
                  }
              }
              if (obj.getPaths().length > 1 && i > 0) {
                  if (sign(obj.getPaths().getAt(i)) > 0 && sign(obj.getPaths().getAt(i - 1)) > 0 || sign(obj.getPaths().getAt(i)) < 0 && sign(obj.getPaths().getAt(i - 1)) < 0 && !multiFlag) {
                      verts = [verts];
                  }
              }
              if (i % 2 !== 0) {
                  verts.reverse();
              }
              rings.push(verts);
          }
          response = {
              type: multiFlag ? 'multipolygon' : 'polygon',
              components: rings
          };
          return response;
      }
      if (obj.constructor === google.maps.Circle) {
          var point = obj.getCenter();
          var radius = obj.getRadius();
          verts = [];
          var d2r = Math.PI / 180;
          var r2d = 180 / Math.PI;
          radius = radius / 1609;
          var earthsradius = 3963;
          var num_seg = 32;
          var rlat = radius / earthsradius * r2d;
          var rlng = rlat / Math.cos(point.lat() * d2r);
          for (var n = 0; n <= num_seg; n++) {
              var theta = Math.PI * (n / (num_seg / 2));
              lng = point.lng() + rlng * Math.cos(theta);
              lat = point.lat() + rlat * Math.sin(theta);
              verts.push({
                  x: lng,
                  y: lat
              });
          }
          response = {
              type: 'polygon',
              components: [verts]
          };
          return response;
      }
      if (obj.constructor === google.maps.LatLngBounds) {
          tmp = obj;
          verts = [];
          verts.push({
              x: tmp.getSouthWest().lng(),
              y: tmp.getNorthEast().lat()
          });
          verts.push({
              x: tmp.getNorthEast().lng(),
              y: tmp.getNorthEast().lat()
          });
          verts.push({
              x: tmp.getNorthEast().lng(),
              y: tmp.getSouthWest().lat()
          });
          verts.push({
              x: tmp.getSouthWest().lng(),
              y: tmp.getSouthWest().lat()
          });
          verts.push({
              x: tmp.getSouthWest().lng(),
              y: tmp.getNorthEast().lat()
          });
          response = {
              type: 'polygon',
              isRectangle: true,
              components: [verts]
          };
          return response;
      }
      if (obj.constructor === google.maps.Rectangle) {
          tmp = obj.getBounds();
          verts = [];
          verts.push({
              x: tmp.getSouthWest().lng(),
              y: tmp.getNorthEast().lat()
          });
          verts.push({
              x: tmp.getNorthEast().lng(),
              y: tmp.getNorthEast().lat()
          });
          verts.push({
              x: tmp.getNorthEast().lng(),
              y: tmp.getSouthWest().lat()
          });
          verts.push({
              x: tmp.getSouthWest().lng(),
              y: tmp.getSouthWest().lat()
          });
          verts.push({
              x: tmp.getSouthWest().lng(),
              y: tmp.getNorthEast().lat()
          });
          response = {
              type: 'polygon',
              isRectangle: true,
              components: [verts]
          };
          return response;
      }
      if (obj.constructor === google.maps.Data.Feature) {
          return this.deconstruct.call(this, obj.getGeometry());
      }
      if (obj.constructor === google.maps.Data.Point) {
          response = {
              type: 'point',
              components: [{
                  x: obj.get().lng(),
                  y: obj.get().lat()
              }]
          };
          return response;
      }
      if (obj.constructor === google.maps.Data.LineString) {
          verts = [];
          for (i = 0; i < obj.getLength(); i += 1) {
              vertex = obj.getAt(i);
              verts.push({
                  x: vertex.lng(),
                  y: vertex.lat()
              });
          }
          response = {
              type: 'linestring',
              components: verts
          };
          return response;
      }
      if (obj.constructor === google.maps.Data.Polygon) {
          rings = [];
          for (i = 0; i < obj.getLength(); i += 1) {
              ring = obj.getAt(i);
              verts = [];
              for (j = 0; j < ring.getLength(); j += 1) {
                  vertex = ring.getAt(j);
                  verts.push({
                      x: vertex.lng(),
                      y: vertex.lat()
                  });
              }
              verts.push({
                  x: ring.getAt(0).lng(),
                  y: ring.getAt(0).lat()
              });
              rings.push(verts);
          }
          response = {
              type: 'polygon',
              components: rings
          };
          return response;
      }
      if (obj.constructor === google.maps.Data.MultiPoint) {
          verts = [];
          for (i = 0; i < obj.getLength(); i += 1) {
              vertex = obj.getAt(i);
              verts.push([{
                  x: vertex.lng(),
                  y: vertex.lat()
              }]);
          }
          response = {
              type: 'multipoint',
              components: verts
          };
          return response;
      }
      if (obj.constructor === google.maps.Data.MultiLineString) {
          linestrings = [];
          for (i = 0; i < obj.getLength(); i += 1) {
              verts = [];
              linestring = obj.getAt(i);
              for (j = 0; j < linestring.getLength(); j += 1) {
                  vertex = linestring.getAt(j);
                  verts.push({
                      x: vertex.lng(),
                      y: vertex.lat()
                  });
              }
              linestrings.push(verts);
          }
          response = {
              type: 'multilinestring',
              components: linestrings
          };
          return response;
      }
      if (obj.constructor === google.maps.Data.MultiPolygon) {
          polygons = [];
          for (k = 0; k < obj.getLength(); k += 1) {
              polygon = obj.getAt(k);
              rings = [];
              for (i = 0; i < polygon.getLength(); i += 1) {
                  ring = polygon.getAt(i);
                  verts = [];
                  for (j = 0; j < ring.getLength(); j += 1) {
                      vertex = ring.getAt(j);
                      verts.push({
                          x: vertex.lng(),
                          y: vertex.lat()
                      });
                  }
                  verts.push({
                      x: ring.getAt(0).lng(),
                      y: ring.getAt(0).lat()
                  });
                  rings.push(verts);
              }
              polygons.push(rings);
          }
          response = {
              type: 'multipolygon',
              components: polygons
          };
          return response;
      }
      if (obj.constructor === google.maps.Data.GeometryCollection) {
          var objects = [];
          for (k = 0; k < obj.getLength(); k += 1) {
              var object = obj.getAt(k);
              objects.push(this.deconstruct.call(this, object));
          }
          response = {
              type: 'geometrycollection',
              components: objects
          };
          return response;
      }
      if (Wkt.isArray(obj)) {
          features = [];
          for (i = 0; i < obj.length; i += 1) {
              features.push(this.deconstruct.call(this, obj[i], true));
          }
          response = {
              type: function () {
                  var k,
                      type = obj[0].constructor;
                  for (k = 0; k < obj.length; k += 1) {
                      if (obj[k].constructor !== type) {
                          return 'geometrycollection';
                      }
                  }
                  switch (type) {
                      case google.maps.Marker:
                          return 'multipoint';
                      case google.maps.Polyline:
                          return 'multilinestring';
                      case google.maps.Polygon:
                          return 'multipolygon';
                      default:
                          return 'geometrycollection';
                  }
              }(),
              components: function () {
                  var i, comps;
                  comps = [];
                  for (i = 0; i < features.length; i += 1) {
                      if (features[i].components) {
                          comps.push(features[i].components);
                      }
                  }
                  return {
                      comps: comps
                  };
              }()
          };
          response.components = response.components.comps;
          return response;
      }
      console.warn('The passed object does not have any recognizable properties.');
  };

  function arrayMap(array, iteratee) {
    var index = -1,
        length = array == null ? 0 : array.length,
        result = Array(length);
    while (++index < length) {
      result[index] = iteratee(array[index], index, array);
    }
    return result;
  }

  function listCacheClear() {
    this.__data__ = [];
    this.size = 0;
  }

  function eq(value, other) {
    return value === other || value !== value && other !== other;
  }

  function assocIndexOf(array, key) {
    var length = array.length;
    while (length--) {
      if (eq(array[length][0], key)) {
        return length;
      }
    }
    return -1;
  }

  var arrayProto = Array.prototype;
  var splice = arrayProto.splice;
  function listCacheDelete(key) {
    var data = this.__data__,
        index = assocIndexOf(data, key);
    if (index < 0) {
      return false;
    }
    var lastIndex = data.length - 1;
    if (index == lastIndex) {
      data.pop();
    } else {
      splice.call(data, index, 1);
    }
    --this.size;
    return true;
  }

  function listCacheGet(key) {
    var data = this.__data__,
        index = assocIndexOf(data, key);
    return index < 0 ? undefined : data[index][1];
  }

  function listCacheHas(key) {
    return assocIndexOf(this.__data__, key) > -1;
  }

  function listCacheSet(key, value) {
    var data = this.__data__,
        index = assocIndexOf(data, key);
    if (index < 0) {
      ++this.size;
      data.push([key, value]);
    } else {
      data[index][1] = value;
    }
    return this;
  }

  function ListCache(entries) {
    var index = -1,
        length = entries == null ? 0 : entries.length;
    this.clear();
    while (++index < length) {
      var entry = entries[index];
      this.set(entry[0], entry[1]);
    }
  }
  ListCache.prototype.clear = listCacheClear;
  ListCache.prototype['delete'] = listCacheDelete;
  ListCache.prototype.get = listCacheGet;
  ListCache.prototype.has = listCacheHas;
  ListCache.prototype.set = listCacheSet;

  function stackClear() {
    this.__data__ = new ListCache();
    this.size = 0;
  }

  function stackDelete(key) {
    var data = this.__data__,
        result = data['delete'](key);
    this.size = data.size;
    return result;
  }

  function stackGet(key) {
    return this.__data__.get(key);
  }

  function stackHas(key) {
    return this.__data__.has(key);
  }

  var freeGlobal = (typeof global === 'undefined' ? 'undefined' : _typeof(global)) == 'object' && global && global.Object === Object && global;

  var freeSelf = (typeof self === 'undefined' ? 'undefined' : _typeof(self)) == 'object' && self && self.Object === Object && self;
  var root = freeGlobal || freeSelf || Function('return this')();

  var _Symbol = root.Symbol;

  var objectProto = Object.prototype;
  var hasOwnProperty = objectProto.hasOwnProperty;
  var nativeObjectToString = objectProto.toString;
  var symToStringTag = _Symbol ? _Symbol.toStringTag : undefined;
  function getRawTag(value) {
    var isOwn = hasOwnProperty.call(value, symToStringTag),
        tag = value[symToStringTag];
    try {
      value[symToStringTag] = undefined;
    } catch (e) {}
    var result = nativeObjectToString.call(value);
    {
      if (isOwn) {
        value[symToStringTag] = tag;
      } else {
        delete value[symToStringTag];
      }
    }
    return result;
  }

  var objectProto$1 = Object.prototype;
  var nativeObjectToString$1 = objectProto$1.toString;
  function objectToString(value) {
    return nativeObjectToString$1.call(value);
  }

  var nullTag = '[object Null]',
      undefinedTag = '[object Undefined]';
  var symToStringTag$1 = _Symbol ? _Symbol.toStringTag : undefined;
  function baseGetTag(value) {
    if (value == null) {
      return value === undefined ? undefinedTag : nullTag;
    }
    return symToStringTag$1 && symToStringTag$1 in Object(value) ? getRawTag(value) : objectToString(value);
  }

  function isObject(value) {
    var type = typeof value === 'undefined' ? 'undefined' : _typeof(value);
    return value != null && (type == 'object' || type == 'function');
  }

  var asyncTag = '[object AsyncFunction]',
      funcTag = '[object Function]',
      genTag = '[object GeneratorFunction]',
      proxyTag = '[object Proxy]';
  function isFunction(value) {
    if (!isObject(value)) {
      return false;
    }
    var tag = baseGetTag(value);
    return tag == funcTag || tag == genTag || tag == asyncTag || tag == proxyTag;
  }

  var coreJsData = root['__core-js_shared__'];

  var maskSrcKey = function () {
    var uid = /[^.]+$/.exec(coreJsData && coreJsData.keys && coreJsData.keys.IE_PROTO || '');
    return uid ? 'Symbol(src)_1.' + uid : '';
  }();
  function isMasked(func) {
    return !!maskSrcKey && maskSrcKey in func;
  }

  var funcProto = Function.prototype;
  var funcToString = funcProto.toString;
  function toSource(func) {
    if (func != null) {
      try {
        return funcToString.call(func);
      } catch (e) {}
      try {
        return func + '';
      } catch (e) {}
    }
    return '';
  }

  var reRegExpChar = /[\\^$.*+?()[\]{}|]/g;
  var reIsHostCtor = /^\[object .+?Constructor\]$/;
  var funcProto$1 = Function.prototype,
      objectProto$2 = Object.prototype;
  var funcToString$1 = funcProto$1.toString;
  var hasOwnProperty$1 = objectProto$2.hasOwnProperty;
  var reIsNative = RegExp('^' + funcToString$1.call(hasOwnProperty$1).replace(reRegExpChar, '\\$&').replace(/hasOwnProperty|(function).*?(?=\\\()| for .+?(?=\\\])/g, '$1.*?') + '$');
  function baseIsNative(value) {
    if (!isObject(value) || isMasked(value)) {
      return false;
    }
    var pattern = isFunction(value) ? reIsNative : reIsHostCtor;
    return pattern.test(toSource(value));
  }

  function getValue(object, key) {
    return object == null ? undefined : object[key];
  }

  function getNative(object, key) {
    var value = getValue(object, key);
    return baseIsNative(value) ? value : undefined;
  }

  var Map = getNative(root, 'Map');

  var nativeCreate = getNative(Object, 'create');

  function hashClear() {
    this.__data__ = nativeCreate ? nativeCreate(null) : {};
    this.size = 0;
  }

  function hashDelete(key) {
    var result = this.has(key) && delete this.__data__[key];
    this.size -= result ? 1 : 0;
    return result;
  }

  var HASH_UNDEFINED = '__lodash_hash_undefined__';
  var objectProto$3 = Object.prototype;
  var hasOwnProperty$2 = objectProto$3.hasOwnProperty;
  function hashGet(key) {
    var data = this.__data__;
    if (nativeCreate) {
      var result = data[key];
      return result === HASH_UNDEFINED ? undefined : result;
    }
    return hasOwnProperty$2.call(data, key) ? data[key] : undefined;
  }

  var objectProto$4 = Object.prototype;
  var hasOwnProperty$3 = objectProto$4.hasOwnProperty;
  function hashHas(key) {
    var data = this.__data__;
    return nativeCreate ? data[key] !== undefined : hasOwnProperty$3.call(data, key);
  }

  var HASH_UNDEFINED$1 = '__lodash_hash_undefined__';
  function hashSet(key, value) {
    var data = this.__data__;
    this.size += this.has(key) ? 0 : 1;
    data[key] = nativeCreate && value === undefined ? HASH_UNDEFINED$1 : value;
    return this;
  }

  function Hash(entries) {
    var index = -1,
        length = entries == null ? 0 : entries.length;
    this.clear();
    while (++index < length) {
      var entry = entries[index];
      this.set(entry[0], entry[1]);
    }
  }
  Hash.prototype.clear = hashClear;
  Hash.prototype['delete'] = hashDelete;
  Hash.prototype.get = hashGet;
  Hash.prototype.has = hashHas;
  Hash.prototype.set = hashSet;

  function mapCacheClear() {
    this.size = 0;
    this.__data__ = {
      'hash': new Hash(),
      'map': new (Map || ListCache)(),
      'string': new Hash()
    };
  }

  function isKeyable(value) {
    var type = typeof value === 'undefined' ? 'undefined' : _typeof(value);
    return type == 'string' || type == 'number' || type == 'symbol' || type == 'boolean' ? value !== '__proto__' : value === null;
  }

  function getMapData(map, key) {
    var data = map.__data__;
    return isKeyable(key) ? data[typeof key == 'string' ? 'string' : 'hash'] : data.map;
  }

  function mapCacheDelete(key) {
    var result = getMapData(this, key)['delete'](key);
    this.size -= result ? 1 : 0;
    return result;
  }

  function mapCacheGet(key) {
    return getMapData(this, key).get(key);
  }

  function mapCacheHas(key) {
    return getMapData(this, key).has(key);
  }

  function mapCacheSet(key, value) {
    var data = getMapData(this, key),
        size = data.size;
    data.set(key, value);
    this.size += data.size == size ? 0 : 1;
    return this;
  }

  function MapCache(entries) {
    var index = -1,
        length = entries == null ? 0 : entries.length;
    this.clear();
    while (++index < length) {
      var entry = entries[index];
      this.set(entry[0], entry[1]);
    }
  }
  MapCache.prototype.clear = mapCacheClear;
  MapCache.prototype['delete'] = mapCacheDelete;
  MapCache.prototype.get = mapCacheGet;
  MapCache.prototype.has = mapCacheHas;
  MapCache.prototype.set = mapCacheSet;

  var LARGE_ARRAY_SIZE = 200;
  function stackSet(key, value) {
    var data = this.__data__;
    if (data instanceof ListCache) {
      var pairs = data.__data__;
      if (!Map || pairs.length < LARGE_ARRAY_SIZE - 1) {
        pairs.push([key, value]);
        this.size = ++data.size;
        return this;
      }
      data = this.__data__ = new MapCache(pairs);
    }
    data.set(key, value);
    this.size = data.size;
    return this;
  }

  function Stack(entries) {
    var data = this.__data__ = new ListCache(entries);
    this.size = data.size;
  }
  Stack.prototype.clear = stackClear;
  Stack.prototype['delete'] = stackDelete;
  Stack.prototype.get = stackGet;
  Stack.prototype.has = stackHas;
  Stack.prototype.set = stackSet;

  var HASH_UNDEFINED$2 = '__lodash_hash_undefined__';
  function setCacheAdd(value) {
    this.__data__.set(value, HASH_UNDEFINED$2);
    return this;
  }

  function setCacheHas(value) {
    return this.__data__.has(value);
  }

  function SetCache(values) {
    var index = -1,
        length = values == null ? 0 : values.length;
    this.__data__ = new MapCache();
    while (++index < length) {
      this.add(values[index]);
    }
  }
  SetCache.prototype.add = SetCache.prototype.push = setCacheAdd;
  SetCache.prototype.has = setCacheHas;

  function arraySome(array, predicate) {
    var index = -1,
        length = array == null ? 0 : array.length;
    while (++index < length) {
      if (predicate(array[index], index, array)) {
        return true;
      }
    }
    return false;
  }

  function cacheHas(cache, key) {
    return cache.has(key);
  }

  var COMPARE_PARTIAL_FLAG = 1,
      COMPARE_UNORDERED_FLAG = 2;
  function equalArrays(array, other, bitmask, customizer, equalFunc, stack) {
    var isPartial = bitmask & COMPARE_PARTIAL_FLAG,
        arrLength = array.length,
        othLength = other.length;
    if (arrLength != othLength && !(isPartial && othLength > arrLength)) {
      return false;
    }
    var stacked = stack.get(array);
    if (stacked && stack.get(other)) {
      return stacked == other;
    }
    var index = -1,
        result = true,
        seen = bitmask & COMPARE_UNORDERED_FLAG ? new SetCache() : undefined;
    stack.set(array, other);
    stack.set(other, array);
    while (++index < arrLength) {
      var arrValue = array[index],
          othValue = other[index];
      if (customizer) {
        var compared = isPartial ? customizer(othValue, arrValue, index, other, array, stack) : customizer(arrValue, othValue, index, array, other, stack);
      }
      if (compared !== undefined) {
        if (compared) {
          continue;
        }
        result = false;
        break;
      }
      if (seen) {
        if (!arraySome(other, function (othValue, othIndex) {
          if (!cacheHas(seen, othIndex) && (arrValue === othValue || equalFunc(arrValue, othValue, bitmask, customizer, stack))) {
            return seen.push(othIndex);
          }
        })) {
          result = false;
          break;
        }
      } else if (!(arrValue === othValue || equalFunc(arrValue, othValue, bitmask, customizer, stack))) {
        result = false;
        break;
      }
    }
    stack['delete'](array);
    stack['delete'](other);
    return result;
  }

  var Uint8Array = root.Uint8Array;

  function mapToArray(map) {
    var index = -1,
        result = Array(map.size);
    map.forEach(function (value, key) {
      result[++index] = [key, value];
    });
    return result;
  }

  function setToArray(set) {
    var index = -1,
        result = Array(set.size);
    set.forEach(function (value) {
      result[++index] = value;
    });
    return result;
  }

  var COMPARE_PARTIAL_FLAG$1 = 1,
      COMPARE_UNORDERED_FLAG$1 = 2;
  var boolTag = '[object Boolean]',
      dateTag = '[object Date]',
      errorTag = '[object Error]',
      mapTag = '[object Map]',
      numberTag = '[object Number]',
      regexpTag = '[object RegExp]',
      setTag = '[object Set]',
      stringTag = '[object String]',
      symbolTag = '[object Symbol]';
  var arrayBufferTag = '[object ArrayBuffer]',
      dataViewTag = '[object DataView]';
  var symbolProto = _Symbol ? _Symbol.prototype : undefined,
      symbolValueOf = symbolProto ? symbolProto.valueOf : undefined;
  function equalByTag(object, other, tag, bitmask, customizer, equalFunc, stack) {
    switch (tag) {
      case dataViewTag:
        if (object.byteLength != other.byteLength || object.byteOffset != other.byteOffset) {
          return false;
        }
        object = object.buffer;
        other = other.buffer;
      case arrayBufferTag:
        if (object.byteLength != other.byteLength || !equalFunc(new Uint8Array(object), new Uint8Array(other))) {
          return false;
        }
        return true;
      case boolTag:
      case dateTag:
      case numberTag:
        return eq(+object, +other);
      case errorTag:
        return object.name == other.name && object.message == other.message;
      case regexpTag:
      case stringTag:
        return object == other + '';
      case mapTag:
        var convert = mapToArray;
      case setTag:
        var isPartial = bitmask & COMPARE_PARTIAL_FLAG$1;
        convert || (convert = setToArray);
        if (object.size != other.size && !isPartial) {
          return false;
        }
        var stacked = stack.get(object);
        if (stacked) {
          return stacked == other;
        }
        bitmask |= COMPARE_UNORDERED_FLAG$1;
        stack.set(object, other);
        var result = equalArrays(convert(object), convert(other), bitmask, customizer, equalFunc, stack);
        stack['delete'](object);
        return result;
      case symbolTag:
        if (symbolValueOf) {
          return symbolValueOf.call(object) == symbolValueOf.call(other);
        }
    }
    return false;
  }

  function arrayPush(array, values) {
    var index = -1,
        length = values.length,
        offset = array.length;
    while (++index < length) {
      array[offset + index] = values[index];
    }
    return array;
  }

  var isArray = Array.isArray;

  function baseGetAllKeys(object, keysFunc, symbolsFunc) {
    var result = keysFunc(object);
    return isArray(object) ? result : arrayPush(result, symbolsFunc(object));
  }

  function arrayFilter(array, predicate) {
    var index = -1,
        length = array == null ? 0 : array.length,
        resIndex = 0,
        result = [];
    while (++index < length) {
      var value = array[index];
      if (predicate(value, index, array)) {
        result[resIndex++] = value;
      }
    }
    return result;
  }

  function stubArray() {
    return [];
  }

  var objectProto$5 = Object.prototype;
  var propertyIsEnumerable = objectProto$5.propertyIsEnumerable;
  var nativeGetSymbols = Object.getOwnPropertySymbols;
  var getSymbols = !nativeGetSymbols ? stubArray : function (object) {
    if (object == null) {
      return [];
    }
    object = Object(object);
    return arrayFilter(nativeGetSymbols(object), function (symbol) {
      return propertyIsEnumerable.call(object, symbol);
    });
  };

  function baseTimes(n, iteratee) {
    var index = -1,
        result = Array(n);
    while (++index < n) {
      result[index] = iteratee(index);
    }
    return result;
  }

  function isObjectLike(value) {
    return value != null && (typeof value === 'undefined' ? 'undefined' : _typeof(value)) == 'object';
  }

  var argsTag = '[object Arguments]';
  function baseIsArguments(value) {
    return isObjectLike(value) && baseGetTag(value) == argsTag;
  }

  var objectProto$6 = Object.prototype;
  var hasOwnProperty$4 = objectProto$6.hasOwnProperty;
  var propertyIsEnumerable$1 = objectProto$6.propertyIsEnumerable;
  var isArguments = baseIsArguments(function () {
    return arguments;
  }()) ? baseIsArguments : function (value) {
    return isObjectLike(value) && hasOwnProperty$4.call(value, 'callee') && !propertyIsEnumerable$1.call(value, 'callee');
  };

  function stubFalse() {
    return false;
  }

  var freeExports = (typeof exports === 'undefined' ? 'undefined' : _typeof(exports)) == 'object' && exports && !exports.nodeType && exports;
  var freeModule = freeExports && (typeof module === 'undefined' ? 'undefined' : _typeof(module)) == 'object' && module && !module.nodeType && module;
  var moduleExports = freeModule && freeModule.exports === freeExports;
  var Buffer = moduleExports ? root.Buffer : undefined;
  var nativeIsBuffer = Buffer ? Buffer.isBuffer : undefined;
  var isBuffer = nativeIsBuffer || stubFalse;

  var MAX_SAFE_INTEGER = 9007199254740991;
  var reIsUint = /^(?:0|[1-9]\d*)$/;
  function isIndex(value, length) {
    length = length == null ? MAX_SAFE_INTEGER : length;
    return !!length && (typeof value == 'number' || reIsUint.test(value)) && value > -1 && value % 1 == 0 && value < length;
  }

  var MAX_SAFE_INTEGER$1 = 9007199254740991;
  function isLength(value) {
    return typeof value == 'number' && value > -1 && value % 1 == 0 && value <= MAX_SAFE_INTEGER$1;
  }

  var argsTag$1 = '[object Arguments]',
      arrayTag = '[object Array]',
      boolTag$1 = '[object Boolean]',
      dateTag$1 = '[object Date]',
      errorTag$1 = '[object Error]',
      funcTag$1 = '[object Function]',
      mapTag$1 = '[object Map]',
      numberTag$1 = '[object Number]',
      objectTag = '[object Object]',
      regexpTag$1 = '[object RegExp]',
      setTag$1 = '[object Set]',
      stringTag$1 = '[object String]',
      weakMapTag = '[object WeakMap]';
  var arrayBufferTag$1 = '[object ArrayBuffer]',
      dataViewTag$1 = '[object DataView]',
      float32Tag = '[object Float32Array]',
      float64Tag = '[object Float64Array]',
      int8Tag = '[object Int8Array]',
      int16Tag = '[object Int16Array]',
      int32Tag = '[object Int32Array]',
      uint8Tag = '[object Uint8Array]',
      uint8ClampedTag = '[object Uint8ClampedArray]',
      uint16Tag = '[object Uint16Array]',
      uint32Tag = '[object Uint32Array]';
  var typedArrayTags = {};
  typedArrayTags[float32Tag] = typedArrayTags[float64Tag] = typedArrayTags[int8Tag] = typedArrayTags[int16Tag] = typedArrayTags[int32Tag] = typedArrayTags[uint8Tag] = typedArrayTags[uint8ClampedTag] = typedArrayTags[uint16Tag] = typedArrayTags[uint32Tag] = true;
  typedArrayTags[argsTag$1] = typedArrayTags[arrayTag] = typedArrayTags[arrayBufferTag$1] = typedArrayTags[boolTag$1] = typedArrayTags[dataViewTag$1] = typedArrayTags[dateTag$1] = typedArrayTags[errorTag$1] = typedArrayTags[funcTag$1] = typedArrayTags[mapTag$1] = typedArrayTags[numberTag$1] = typedArrayTags[objectTag] = typedArrayTags[regexpTag$1] = typedArrayTags[setTag$1] = typedArrayTags[stringTag$1] = typedArrayTags[weakMapTag] = false;
  function baseIsTypedArray(value) {
      return isObjectLike(value) && isLength(value.length) && !!typedArrayTags[baseGetTag(value)];
  }

  function baseUnary(func) {
    return function (value) {
      return func(value);
    };
  }

  var freeExports$1 = (typeof exports === 'undefined' ? 'undefined' : _typeof(exports)) == 'object' && exports && !exports.nodeType && exports;
  var freeModule$1 = freeExports$1 && (typeof module === 'undefined' ? 'undefined' : _typeof(module)) == 'object' && module && !module.nodeType && module;
  var moduleExports$1 = freeModule$1 && freeModule$1.exports === freeExports$1;
  var freeProcess = moduleExports$1 && freeGlobal.process;
  var nodeUtil = function () {
    try {
      return freeProcess && freeProcess.binding && freeProcess.binding('util');
    } catch (e) {}
  }();

  var nodeIsTypedArray = nodeUtil && nodeUtil.isTypedArray;
  var isTypedArray = nodeIsTypedArray ? baseUnary(nodeIsTypedArray) : baseIsTypedArray;

  var objectProto$7 = Object.prototype;
  var hasOwnProperty$5 = objectProto$7.hasOwnProperty;
  function arrayLikeKeys(value, inherited) {
    var isArr = isArray(value),
        isArg = !isArr && isArguments(value),
        isBuff = !isArr && !isArg && isBuffer(value),
        isType = !isArr && !isArg && !isBuff && isTypedArray(value),
        skipIndexes = isArr || isArg || isBuff || isType,
        result = skipIndexes ? baseTimes(value.length, String) : [],
        length = result.length;
    for (var key in value) {
      if ((inherited || hasOwnProperty$5.call(value, key)) && !(skipIndexes && (
      key == 'length' ||
      isBuff && (key == 'offset' || key == 'parent') ||
      isType && (key == 'buffer' || key == 'byteLength' || key == 'byteOffset') ||
      isIndex(key, length)))) {
        result.push(key);
      }
    }
    return result;
  }

  var objectProto$8 = Object.prototype;
  function isPrototype(value) {
    var Ctor = value && value.constructor,
        proto = typeof Ctor == 'function' && Ctor.prototype || objectProto$8;
    return value === proto;
  }

  function overArg(func, transform) {
    return function (arg) {
      return func(transform(arg));
    };
  }

  var nativeKeys = overArg(Object.keys, Object);

  var objectProto$9 = Object.prototype;
  var hasOwnProperty$6 = objectProto$9.hasOwnProperty;
  function baseKeys(object) {
    if (!isPrototype(object)) {
      return nativeKeys(object);
    }
    var result = [];
    for (var key in Object(object)) {
      if (hasOwnProperty$6.call(object, key) && key != 'constructor') {
        result.push(key);
      }
    }
    return result;
  }

  function isArrayLike(value) {
    return value != null && isLength(value.length) && !isFunction(value);
  }

  function keys(object) {
    return isArrayLike(object) ? arrayLikeKeys(object) : baseKeys(object);
  }

  function getAllKeys(object) {
    return baseGetAllKeys(object, keys, getSymbols);
  }

  var COMPARE_PARTIAL_FLAG$2 = 1;
  var objectProto$a = Object.prototype;
  var hasOwnProperty$7 = objectProto$a.hasOwnProperty;
  function equalObjects(object, other, bitmask, customizer, equalFunc, stack) {
    var isPartial = bitmask & COMPARE_PARTIAL_FLAG$2,
        objProps = getAllKeys(object),
        objLength = objProps.length,
        othProps = getAllKeys(other),
        othLength = othProps.length;
    if (objLength != othLength && !isPartial) {
      return false;
    }
    var index = objLength;
    while (index--) {
      var key = objProps[index];
      if (!(isPartial ? key in other : hasOwnProperty$7.call(other, key))) {
        return false;
      }
    }
    var stacked = stack.get(object);
    if (stacked && stack.get(other)) {
      return stacked == other;
    }
    var result = true;
    stack.set(object, other);
    stack.set(other, object);
    var skipCtor = isPartial;
    while (++index < objLength) {
      key = objProps[index];
      var objValue = object[key],
          othValue = other[key];
      if (customizer) {
        var compared = isPartial ? customizer(othValue, objValue, key, other, object, stack) : customizer(objValue, othValue, key, object, other, stack);
      }
      if (!(compared === undefined ? objValue === othValue || equalFunc(objValue, othValue, bitmask, customizer, stack) : compared)) {
        result = false;
        break;
      }
      skipCtor || (skipCtor = key == 'constructor');
    }
    if (result && !skipCtor) {
      var objCtor = object.constructor,
          othCtor = other.constructor;
      if (objCtor != othCtor && 'constructor' in object && 'constructor' in other && !(typeof objCtor == 'function' && objCtor instanceof objCtor && typeof othCtor == 'function' && othCtor instanceof othCtor)) {
        result = false;
      }
    }
    stack['delete'](object);
    stack['delete'](other);
    return result;
  }

  var DataView = getNative(root, 'DataView');

  var Promise$1 = getNative(root, 'Promise');

  var Set = getNative(root, 'Set');

  var WeakMap = getNative(root, 'WeakMap');

  var mapTag$2 = '[object Map]',
      objectTag$1 = '[object Object]',
      promiseTag = '[object Promise]',
      setTag$2 = '[object Set]',
      weakMapTag$1 = '[object WeakMap]';
  var dataViewTag$2 = '[object DataView]';
  var dataViewCtorString = toSource(DataView),
      mapCtorString = toSource(Map),
      promiseCtorString = toSource(Promise$1),
      setCtorString = toSource(Set),
      weakMapCtorString = toSource(WeakMap);
  var getTag = baseGetTag;
  if (DataView && getTag(new DataView(new ArrayBuffer(1))) != dataViewTag$2 || Map && getTag(new Map()) != mapTag$2 || Promise$1 && getTag(Promise$1.resolve()) != promiseTag || Set && getTag(new Set()) != setTag$2 || WeakMap && getTag(new WeakMap()) != weakMapTag$1) {
      getTag = function getTag(value) {
          var result = baseGetTag(value),
              Ctor = result == objectTag$1 ? value.constructor : undefined,
              ctorString = Ctor ? toSource(Ctor) : '';
          if (ctorString) {
              switch (ctorString) {
                  case dataViewCtorString:
                      return dataViewTag$2;
                  case mapCtorString:
                      return mapTag$2;
                  case promiseCtorString:
                      return promiseTag;
                  case setCtorString:
                      return setTag$2;
                  case weakMapCtorString:
                      return weakMapTag$1;
              }
          }
          return result;
      };
  }
  var getTag$1 = getTag;

  var COMPARE_PARTIAL_FLAG$3 = 1;
  var argsTag$2 = '[object Arguments]',
      arrayTag$1 = '[object Array]',
      objectTag$2 = '[object Object]';
  var objectProto$b = Object.prototype;
  var hasOwnProperty$8 = objectProto$b.hasOwnProperty;
  function baseIsEqualDeep(object, other, bitmask, customizer, equalFunc, stack) {
    var objIsArr = isArray(object),
        othIsArr = isArray(other),
        objTag = objIsArr ? arrayTag$1 : getTag$1(object),
        othTag = othIsArr ? arrayTag$1 : getTag$1(other);
    objTag = objTag == argsTag$2 ? objectTag$2 : objTag;
    othTag = othTag == argsTag$2 ? objectTag$2 : othTag;
    var objIsObj = objTag == objectTag$2,
        othIsObj = othTag == objectTag$2,
        isSameTag = objTag == othTag;
    if (isSameTag && isBuffer(object)) {
      if (!isBuffer(other)) {
        return false;
      }
      objIsArr = true;
      objIsObj = false;
    }
    if (isSameTag && !objIsObj) {
      stack || (stack = new Stack());
      return objIsArr || isTypedArray(object) ? equalArrays(object, other, bitmask, customizer, equalFunc, stack) : equalByTag(object, other, objTag, bitmask, customizer, equalFunc, stack);
    }
    if (!(bitmask & COMPARE_PARTIAL_FLAG$3)) {
      var objIsWrapped = objIsObj && hasOwnProperty$8.call(object, '__wrapped__'),
          othIsWrapped = othIsObj && hasOwnProperty$8.call(other, '__wrapped__');
      if (objIsWrapped || othIsWrapped) {
        var objUnwrapped = objIsWrapped ? object.value() : object,
            othUnwrapped = othIsWrapped ? other.value() : other;
        stack || (stack = new Stack());
        return equalFunc(objUnwrapped, othUnwrapped, bitmask, customizer, stack);
      }
    }
    if (!isSameTag) {
      return false;
    }
    stack || (stack = new Stack());
    return equalObjects(object, other, bitmask, customizer, equalFunc, stack);
  }

  function baseIsEqual(value, other, bitmask, customizer, stack) {
    if (value === other) {
      return true;
    }
    if (value == null || other == null || !isObjectLike(value) && !isObjectLike(other)) {
      return value !== value && other !== other;
    }
    return baseIsEqualDeep(value, other, bitmask, customizer, baseIsEqual, stack);
  }

  var COMPARE_PARTIAL_FLAG$4 = 1,
      COMPARE_UNORDERED_FLAG$2 = 2;
  function baseIsMatch(object, source, matchData, customizer) {
    var index = matchData.length,
        length = index,
        noCustomizer = !customizer;
    if (object == null) {
      return !length;
    }
    object = Object(object);
    while (index--) {
      var data = matchData[index];
      if (noCustomizer && data[2] ? data[1] !== object[data[0]] : !(data[0] in object)) {
        return false;
      }
    }
    while (++index < length) {
      data = matchData[index];
      var key = data[0],
          objValue = object[key],
          srcValue = data[1];
      if (noCustomizer && data[2]) {
        if (objValue === undefined && !(key in object)) {
          return false;
        }
      } else {
        var stack = new Stack();
        if (customizer) {
          var result = customizer(objValue, srcValue, key, object, source, stack);
        }
        if (!(result === undefined ? baseIsEqual(srcValue, objValue, COMPARE_PARTIAL_FLAG$4 | COMPARE_UNORDERED_FLAG$2, customizer, stack) : result)) {
          return false;
        }
      }
    }
    return true;
  }

  function isStrictComparable(value) {
    return value === value && !isObject(value);
  }

  function getMatchData(object) {
    var result = keys(object),
        length = result.length;
    while (length--) {
      var key = result[length],
          value = object[key];
      result[length] = [key, value, isStrictComparable(value)];
    }
    return result;
  }

  function matchesStrictComparable(key, srcValue) {
    return function (object) {
      if (object == null) {
        return false;
      }
      return object[key] === srcValue && (srcValue !== undefined || key in Object(object));
    };
  }

  function baseMatches(source) {
    var matchData = getMatchData(source);
    if (matchData.length == 1 && matchData[0][2]) {
      return matchesStrictComparable(matchData[0][0], matchData[0][1]);
    }
    return function (object) {
      return object === source || baseIsMatch(object, source, matchData);
    };
  }

  var symbolTag$1 = '[object Symbol]';
  function isSymbol(value) {
    return (typeof value === 'undefined' ? 'undefined' : _typeof(value)) == 'symbol' || isObjectLike(value) && baseGetTag(value) == symbolTag$1;
  }

  var reIsDeepProp = /\.|\[(?:[^[\]]*|(["'])(?:(?!\1)[^\\]|\\.)*?\1)\]/,
      reIsPlainProp = /^\w*$/;
  function isKey(value, object) {
    if (isArray(value)) {
      return false;
    }
    var type = typeof value === 'undefined' ? 'undefined' : _typeof(value);
    if (type == 'number' || type == 'symbol' || type == 'boolean' || value == null || isSymbol(value)) {
      return true;
    }
    return reIsPlainProp.test(value) || !reIsDeepProp.test(value) || object != null && value in Object(object);
  }

  var FUNC_ERROR_TEXT = 'Expected a function';
  function memoize(func, resolver) {
    if (typeof func != 'function' || resolver != null && typeof resolver != 'function') {
      throw new TypeError(FUNC_ERROR_TEXT);
    }
    var memoized = function memoized() {
      var args = arguments,
          key = resolver ? resolver.apply(this, args) : args[0],
          cache = memoized.cache;
      if (cache.has(key)) {
        return cache.get(key);
      }
      var result = func.apply(this, args);
      memoized.cache = cache.set(key, result) || cache;
      return result;
    };
    memoized.cache = new (memoize.Cache || MapCache)();
    return memoized;
  }
  memoize.Cache = MapCache;

  var MAX_MEMOIZE_SIZE = 500;
  function memoizeCapped(func) {
    var result = memoize(func, function (key) {
      if (cache.size === MAX_MEMOIZE_SIZE) {
        cache.clear();
      }
      return key;
    });
    var cache = result.cache;
    return result;
  }

  var reLeadingDot = /^\./,
      rePropName = /[^.[\]]+|\[(?:(-?\d+(?:\.\d+)?)|(["'])((?:(?!\2)[^\\]|\\.)*?)\2)\]|(?=(?:\.|\[\])(?:\.|\[\]|$))/g;
  var reEscapeChar = /\\(\\)?/g;
  var stringToPath = memoizeCapped(function (string) {
    var result = [];
    if (reLeadingDot.test(string)) {
      result.push('');
    }
    string.replace(rePropName, function (match, number, quote, string) {
      result.push(quote ? string.replace(reEscapeChar, '$1') : number || match);
    });
    return result;
  });

  var INFINITY = 1 / 0;
  var symbolProto$1 = _Symbol ? _Symbol.prototype : undefined,
      symbolToString = symbolProto$1 ? symbolProto$1.toString : undefined;
  function baseToString(value) {
    if (typeof value == 'string') {
      return value;
    }
    if (isArray(value)) {
      return arrayMap(value, baseToString) + '';
    }
    if (isSymbol(value)) {
      return symbolToString ? symbolToString.call(value) : '';
    }
    var result = value + '';
    return result == '0' && 1 / value == -INFINITY ? '-0' : result;
  }

  function toString(value) {
    return value == null ? '' : baseToString(value);
  }

  function castPath(value, object) {
    if (isArray(value)) {
      return value;
    }
    return isKey(value, object) ? [value] : stringToPath(toString(value));
  }

  var INFINITY$1 = 1 / 0;
  function toKey(value) {
    if (typeof value == 'string' || isSymbol(value)) {
      return value;
    }
    var result = value + '';
    return result == '0' && 1 / value == -INFINITY$1 ? '-0' : result;
  }

  function baseGet(object, path) {
    path = castPath(path, object);
    var index = 0,
        length = path.length;
    while (object != null && index < length) {
      object = object[toKey(path[index++])];
    }
    return index && index == length ? object : undefined;
  }

  function get$1(object, path, defaultValue) {
    var result = object == null ? undefined : baseGet(object, path);
    return result === undefined ? defaultValue : result;
  }

  function baseHasIn(object, key) {
    return object != null && key in Object(object);
  }

  function hasPath(object, path, hasFunc) {
    path = castPath(path, object);
    var index = -1,
        length = path.length,
        result = false;
    while (++index < length) {
      var key = toKey(path[index]);
      if (!(result = object != null && hasFunc(object, key))) {
        break;
      }
      object = object[key];
    }
    if (result || ++index != length) {
      return result;
    }
    length = object == null ? 0 : object.length;
    return !!length && isLength(length) && isIndex(key, length) && (isArray(object) || isArguments(object));
  }

  function hasIn(object, path) {
    return object != null && hasPath(object, path, baseHasIn);
  }

  var COMPARE_PARTIAL_FLAG$5 = 1,
      COMPARE_UNORDERED_FLAG$3 = 2;
  function baseMatchesProperty(path, srcValue) {
    if (isKey(path) && isStrictComparable(srcValue)) {
      return matchesStrictComparable(toKey(path), srcValue);
    }
    return function (object) {
      var objValue = get$1(object, path);
      return objValue === undefined && objValue === srcValue ? hasIn(object, path) : baseIsEqual(srcValue, objValue, COMPARE_PARTIAL_FLAG$5 | COMPARE_UNORDERED_FLAG$3);
    };
  }

  function identity(value) {
    return value;
  }

  function baseProperty(key) {
    return function (object) {
      return object == null ? undefined : object[key];
    };
  }

  function basePropertyDeep(path) {
    return function (object) {
      return baseGet(object, path);
    };
  }

  function property(path) {
    return isKey(path) ? baseProperty(toKey(path)) : basePropertyDeep(path);
  }

  function baseIteratee(value) {
    if (typeof value == 'function') {
      return value;
    }
    if (value == null) {
      return identity;
    }
    if ((typeof value === 'undefined' ? 'undefined' : _typeof(value)) == 'object') {
      return isArray(value) ? baseMatchesProperty(value[0], value[1]) : baseMatches(value);
    }
    return property(value);
  }

  function createBaseFor(fromRight) {
    return function (object, iteratee, keysFunc) {
      var index = -1,
          iterable = Object(object),
          props = keysFunc(object),
          length = props.length;
      while (length--) {
        var key = props[fromRight ? length : ++index];
        if (iteratee(iterable[key], key, iterable) === false) {
          break;
        }
      }
      return object;
    };
  }

  var baseFor = createBaseFor();

  function baseForOwn(object, iteratee) {
    return object && baseFor(object, iteratee, keys);
  }

  function createBaseEach(eachFunc, fromRight) {
    return function (collection, iteratee) {
      if (collection == null) {
        return collection;
      }
      if (!isArrayLike(collection)) {
        return eachFunc(collection, iteratee);
      }
      var length = collection.length,
          index = fromRight ? length : -1,
          iterable = Object(collection);
      while (fromRight ? index-- : ++index < length) {
        if (iteratee(iterable[index], index, iterable) === false) {
          break;
        }
      }
      return collection;
    };
  }

  var baseEach = createBaseEach(baseForOwn);

  function baseMap(collection, iteratee) {
    var index = -1,
        result = isArrayLike(collection) ? Array(collection.length) : [];
    baseEach(collection, function (value, key, collection) {
      result[++index] = iteratee(value, key, collection);
    });
    return result;
  }

  function map(collection, iteratee) {
    var func = isArray(collection) ? arrayMap : baseMap;
    return func(collection, baseIteratee(iteratee, 3));
  }

  function toCoord(LatLng) {
  	if (google.maps && google.maps.LatLng && LatLng instanceof google.maps.LatLng) {
  		return [LatLng.lng(), LatLng.lat()];
  	} else if (LatLng.lat && LatLng.lng) {
  		return [LatLng.lng, LatLng.lat];
  	} else if (LatLng.length && LatLng.length >= 2) {
  		return LatLng;
  	} else {
  		throw new Error('google.maps is not present in the global scope');
  	}
  }
  function toCoords(arrayLatLng, closeRing) {
  	var ring = map(arrayLatLng, toCoord);
  	if (closeRing === true) {
  		var last_coord = ring.pop();
  		if (last_coord[0] === ring[0][0] && last_coord[1] === ring[0][1]) {
  			ring.push(ring[0]);
  		} else {
  			ring.push(last_coord);
  			ring.push(ring[0]);
  		}
  	}
  	return ring;
  }

  function geomEach(geojson, callback) {
      var i,
          j,
          g,
          geometry$$1,
          stopG,
          geometryMaybeCollection,
          isGeometryCollection,
          featureProperties,
          featureBBox,
          featureId,
          featureIndex = 0,
          isFeatureCollection = geojson.type === 'FeatureCollection',
          isFeature = geojson.type === 'Feature',
          stop = isFeatureCollection ? geojson.features.length : 1;
      for (i = 0; i < stop; i++) {
          geometryMaybeCollection = isFeatureCollection ? geojson.features[i].geometry : isFeature ? geojson.geometry : geojson;
          featureProperties = isFeatureCollection ? geojson.features[i].properties : isFeature ? geojson.properties : {};
          featureBBox = isFeatureCollection ? geojson.features[i].bbox : isFeature ? geojson.bbox : undefined;
          featureId = isFeatureCollection ? geojson.features[i].id : isFeature ? geojson.id : undefined;
          isGeometryCollection = geometryMaybeCollection ? geometryMaybeCollection.type === 'GeometryCollection' : false;
          stopG = isGeometryCollection ? geometryMaybeCollection.geometries.length : 1;
          for (g = 0; g < stopG; g++) {
              geometry$$1 = isGeometryCollection ? geometryMaybeCollection.geometries[g] : geometryMaybeCollection;
              if (geometry$$1 === null) {
                  if (callback(null, featureIndex, featureProperties, featureBBox, featureId) === false) return false;
                  continue;
              }
              switch (geometry$$1.type) {
                  case 'Point':
                  case 'LineString':
                  case 'MultiPoint':
                  case 'Polygon':
                  case 'MultiLineString':
                  case 'MultiPolygon':
                      {
                          if (callback(geometry$$1, featureIndex, featureProperties, featureBBox, featureId) === false) return false;
                          break;
                      }
                  case 'GeometryCollection':
                      {
                          for (j = 0; j < geometry$$1.geometries.length; j++) {
                              if (callback(geometry$$1.geometries[j], featureIndex, featureProperties, featureBBox, featureId) === false) return false;
                          }
                          break;
                      }
                  default:
                      throw new Error('Unknown Geometry Type');
              }
          }
          featureIndex++;
      }
  }
  function geomReduce(geojson, callback, initialValue) {
      var previousValue = initialValue;
      geomEach(geojson, function (currentGeometry, featureIndex, featureProperties, featureBBox, featureId) {
          if (featureIndex === 0 && initialValue === undefined) previousValue = currentGeometry;else previousValue = callback(previousValue, currentGeometry, featureIndex, featureProperties, featureBBox, featureId);
      });
      return previousValue;
  }

  function area(geojson) {
      return geomReduce(geojson, function (value, geom) {
          return value + calculateArea(geom);
      }, 0);
  }
  var RADIUS = 6378137;
  function calculateArea(geojson) {
      var area = 0,
          i;
      switch (geojson.type) {
          case 'Polygon':
              return polygonArea(geojson.coordinates);
          case 'MultiPolygon':
              for (i = 0; i < geojson.coordinates.length; i++) {
                  area += polygonArea(geojson.coordinates[i]);
              }
              return area;
          case 'Point':
          case 'MultiPoint':
          case 'LineString':
          case 'MultiLineString':
              return 0;
          case 'GeometryCollection':
              for (i = 0; i < geojson.geometries.length; i++) {
                  area += calculateArea(geojson.geometries[i]);
              }
              return area;
      }
  }
  function polygonArea(coords) {
      var area = 0;
      if (coords && coords.length > 0) {
          area += Math.abs(ringArea(coords[0]));
          for (var i = 1; i < coords.length; i++) {
              area -= Math.abs(ringArea(coords[i]));
          }
      }
      return area;
  }
  function ringArea(coords) {
      var p1;
      var p2;
      var p3;
      var lowerIndex;
      var middleIndex;
      var upperIndex;
      var i;
      var area = 0;
      var coordsLength = coords.length;
      if (coordsLength > 2) {
          for (i = 0; i < coordsLength; i++) {
              if (i === coordsLength - 2) {
                  lowerIndex = coordsLength - 2;
                  middleIndex = coordsLength - 1;
                  upperIndex = 0;
              } else if (i === coordsLength - 1) {
                  lowerIndex = coordsLength - 1;
                  middleIndex = 0;
                  upperIndex = 1;
              } else {
                  lowerIndex = i;
                  middleIndex = i + 1;
                  upperIndex = i + 2;
              }
              p1 = coords[lowerIndex];
              p2 = coords[middleIndex];
              p3 = coords[upperIndex];
              area += (rad(p3[0]) - rad(p1[0])) * Math.sin(rad(p2[1]));
          }
          area = area * RADIUS * RADIUS / 2;
      }
      return area;
  }
  function rad(_) {
      return _ * Math.PI / 180;
  }

  function feature$1(geometry, properties, bbox, id) {
      if (geometry === undefined) throw new Error('geometry is required');
      if (properties && properties.constructor !== Object) throw new Error('properties must be an Object');
      if (bbox) {
          if (!Array.isArray(bbox)) throw new Error('bbox must be an Array');
          if (bbox.length !== 4) throw new Error('bbox must be an Array of 4 numbers');
      }
      if (id && ['string', 'number'].indexOf(typeof id === 'undefined' ? 'undefined' : _typeof(id)) === -1) throw new Error('id must be a number or a string');
      var feat = { type: 'Feature' };
      if (id) feat.id = id;
      if (bbox) feat.bbox = bbox;
      feat.properties = properties || {};
      feat.geometry = geometry;
      return feat;
  }
  function lineString$1(coordinates, properties, bbox, id) {
      if (!coordinates) throw new Error('No coordinates passed');
      if (coordinates.length < 2) throw new Error('Coordinates must be an array of two or more positions');
      if (!isNumber$1(coordinates[0][1]) || !isNumber$1(coordinates[0][1])) throw new Error('Coordinates must contain numbers');
      return feature$1({
          type: 'LineString',
          coordinates: coordinates
      }, properties, bbox, id);
  }
  function isNumber$1(num) {
      return !isNaN(num) && num !== null && !Array.isArray(num);
  }

  var debug = console.debug.bind(console, '%c turfHelper' + ':', "color:#00CC00;font-weight:bold;"),
      warn = console.warn.bind(console, '%c turfHelper' + ':', "color:orange;font-weight:bold;");
  function arrayToFeaturePolygon(LatLngArray) {
      var vertices = toCoords(LatLngArray, true);
      return {
          type: "Feature",
          properties: {},
          geometry: {
              type: "Polygon",
              coordinates: [vertices]
          }
      };
  }
  function latlngToFeaturePoint(LatLng) {
      var coords = toCoords([LatLng])[0],
          feature = {
          type: "Feature",
          geometry: {
              type: "Point",
              coordinates: coords
          }
      };
      return feature;
  }
  function markerToFeaturePoint(marker) {
      if (!marker.getPosition || typeof marker.getPosition !== 'function') {
          throw new Error('input object does not have a getPosition method');
      }
      var position = marker.getPosition(),
          Feature = {
          type: "Feature",
          properties: {},
          geometry: {
              type: "Point",
              coordinates: [position.lng(), position.lat()]
          }
      };
      return Feature;
  }
  function polylineToFeatureLinestring(objeto) {
      var vertices;
      if (objeto instanceof google.maps.Polyline) {
          vertices = toCoords(objeto.getPath().getArray());
      } else {
          vertices = toCoords(objeto);
      }
      return lineString$1(vertices);
  }
  function polygonToFeaturePolygon(object) {
      var ring, polygonFeature;
      if (object.type === 'Feature') {
          polygonFeature = object;
      } else if (object instanceof google.maps.Polygon) {
          object = object.getPath().getArray();
          ring = toCoords(object, true);
          polygonFeature = arrayToFeaturePolygon(ring);
      } else if (!!(object && object.constructor === Array)) {
          ring = toCoords(object, true);
          polygonFeature = arrayToFeaturePolygon(ring);
      } else if (object.geometry) {
          polygonFeature = {
              type: "Feature",
              properties: {},
              geometry: object.geometry
          };
      } else {
          throw new Error('object is not a Feature, google.maps.Polygon nor an array of google.maps.LatLng');
      }
      polygonFeature.properties = {};
      return polygonFeature;
  }
  function arrayToFeaturePoints(latLngArray) {
      var FeatureCollection = {
          "type": "FeatureCollection",
          "features": []
      };
      latLngArray.forEach(function (latLng) {
          var Feature = {
              type: "Feature",
              geometry: {
                  type: "Point",
                  coordinates: toCoords([latLng])[0]
              }
          };
          FeatureCollection.features.push(Feature);
      });
      return FeatureCollection;
  }
  function polygonToFeaturePolygonCollection(polygon) {
      var geojsonPolygon = polygonToFeaturePolygon(polygon);
      var vertexToFeature = function vertexToFeature(vertex) {
          return {
              type: "Feature",
              geometry: {
                  type: "Point",
                  coordinates: vertex
              }
          };
      };
      var FeatureCollection = {
          type: "FeatureCollection",
          features: map(geojsonPolygon.coordinates[0], vertexToFeature)
      };
      FeatureCollection.features.push(vertexToFeature(geojsonPolygon.coordinates[0][0]));
      return FeatureCollection;
  }
  function area$1(object) {
      var polygonFeature = polygonToFeaturePolygon(object);
      return area(polygonFeature);
  }

  exports.debug = debug;
  exports.warn = warn;
  exports.area = area$1;
  exports.arrayToFeaturePolygon = arrayToFeaturePolygon;
  exports.polygonToFeaturePolygonCollection = polygonToFeaturePolygonCollection;
  exports.arrayToFeaturePoints = arrayToFeaturePoints;
  exports.markerToFeaturePoint = markerToFeaturePoint;
  exports.latlngToFeaturePoint = latlngToFeaturePoint;
  exports.polygonToFeaturePolygon = polygonToFeaturePolygon;
  exports.polylineToFeatureLinestring = polylineToFeatureLinestring;

  Object.defineProperty(exports, '__esModule', { value: true });

})));
