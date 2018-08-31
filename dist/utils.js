
/*
 * turf-google-maps
 * version v0.9.12
 * MIT Licensed
 * Felipe Figueroa (amenadiel@gmail.com)
 * https://github.com/HuasoFoundries/turf-google-maps
 */
 
(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
	typeof define === 'function' && define.amd ? define(['exports'], factory) :
	(factory((global.turfUtils = {})));
}(this, (function (exports) { 'use strict';

	var commonjsGlobal = typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self : {};

	function createCommonjsModule(fn, module) {
		return module = { exports: {} }, fn(module, module.exports), module.exports;
	}

	var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) {
	  return typeof obj;
	} : function (obj) {
	  return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
	};

	var wicket = createCommonjsModule(function (module, exports) {
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
	    (function (root, factory) {
	        {
	            module.exports = factory();
	        }
	    })(commonjsGlobal, function () {
	        var beginsWith, endsWith, _Wkt;
	        _Wkt = function Wkt(obj) {
	            if (obj instanceof _Wkt) return obj;
	            if (!(this instanceof _Wkt)) return new _Wkt(obj);
	            this._wrapped = obj;
	        };
	        beginsWith = function beginsWith(str, sub) {
	            return str.substring(0, sub.length) === sub;
	        };
	        endsWith = function endsWith(str, sub) {
	            return str.substring(str.length - sub.length) === sub;
	        };
	        _Wkt.delimiter = ' ';
	        _Wkt.isArray = function (obj) {
	            return !!(obj && obj.constructor === Array);
	        };
	        _Wkt.trim = function (str, sub) {
	            sub = sub || ' ';
	            while (beginsWith(str, sub)) {
	                str = str.substring(1);
	            }
	            while (endsWith(str, sub)) {
	                str = str.substring(0, str.length - 1);
	            }
	            return str;
	        };
	        _Wkt.Wkt = function (initializer) {
	            this.delimiter = _Wkt.delimiter || ' ';
	            this.wrapVertices = true;
	            this.regExes = {
	                'typeStr': /^\s*(\w+)\s*\(\s*(.*)\s*\)\s*$/,
	                'spaces': /\s+|\+/,
	                'numeric': /-*\d+(\.*\d+)?/,
	                'comma': /\s*,\s*/,
	                'parenComma': /\)\s*,\s*\(/,
	                'coord': /-*\d+\.*\d+ -*\d+\.*\d+/,
	                'doubleParenComma': /\)\s*\)\s*,\s*\(\s*\(/,
	                'ogcTypes': /^(multi)?(point|line|polygon|box)?(string)?$/i,
	                'crudeJson': /^{.*"(type|coordinates|geometries|features)":.*}$/
	            };
	            this._stripWhitespaceAndParens = function (fullStr) {
	                var trimmed = fullStr.trim();
	                var noParens = trimmed.replace(/^\(?(.*?)\)?$/, '$1');
	                return noParens;
	            };
	            this.components = undefined;
	            if (initializer && typeof initializer === 'string') {
	                this.read(initializer);
	            } else if (initializer && (typeof initializer === 'undefined' ? 'undefined' : _typeof(initializer)) !== undefined) {
	                this.fromObject(initializer);
	            }
	        };
	        _Wkt.Wkt.prototype.isCollection = function () {
	            switch (this.type.slice(0, 5)) {
	                case 'multi':
	                    return true;
	                case 'polyg':
	                    return true;
	                default:
	                    return false;
	            }
	        };
	        _Wkt.Wkt.prototype.sameCoords = function (a, b) {
	            return a.x === b.x && a.y === b.y;
	        };
	        _Wkt.Wkt.prototype.fromObject = function (obj) {
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
	        _Wkt.Wkt.prototype.toObject = function (config) {
	            var obj = this.construct[this.type].call(this, config);
	            if ((typeof obj === 'undefined' ? 'undefined' : _typeof(obj)) === 'object' && !_Wkt.isArray(obj)) {
	                obj.properties = this.properties;
	            }
	            return obj;
	        };
	        _Wkt.Wkt.prototype.toString = function (config) {
	            return this.write();
	        };
	        _Wkt.Wkt.prototype.fromJson = function (obj) {
	            var i, j, k, coords, iring, oring;
	            this.type = obj.type.toLowerCase();
	            this.components = [];
	            if (obj.hasOwnProperty('geometry')) {
	                this.fromJson(obj.geometry);
	                this.properties = obj.properties;
	                return this;
	            }
	            coords = obj.coordinates;
	            if (!_Wkt.isArray(coords[0])) {
	                this.components.push({
	                    x: coords[0],
	                    y: coords[1]
	                });
	            } else {
	                for (i in coords) {
	                    if (coords.hasOwnProperty(i)) {
	                        if (!_Wkt.isArray(coords[i][0])) {
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
	                                    if (!_Wkt.isArray(coords[i][j][0])) {
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
	        _Wkt.Wkt.prototype.toJson = function () {
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
	                    if (_Wkt.isArray(cs[i])) {
	                        rings = [];
	                        for (j in cs[i]) {
	                            if (cs[i].hasOwnProperty(j)) {
	                                if (_Wkt.isArray(cs[i][j])) {
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
	        _Wkt.Wkt.prototype.merge = function (wkt) {
	            var prefix = this.type.slice(0, 5);
	            if (this.type !== wkt.type) {
	                if (this.type.slice(5, this.type.length) !== wkt.type) {
	                    throw TypeError('The input geometry types must agree or the calling this.Wkt.Wkt instance must be a multigeometry of the other');
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
	        _Wkt.Wkt.prototype.read = function (str) {
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
	                    console.log('Invalid WKT string provided to read()');
	                    throw {
	                        name: 'WKTError',
	                        message: 'Invalid WKT string provided to read()'
	                    };
	                }
	            }
	            return this;
	        };
	        _Wkt.Wkt.prototype.write = function (components) {
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
	        _Wkt.Wkt.prototype.extract = {
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
	        _Wkt.Wkt.prototype.ingest = {
	            point: function point(str) {
	                var coords = _Wkt.trim(str).split(this.regExes.spaces);
	                return [{
	                    x: parseFloat(this.regExes.numeric.exec(coords[0])[0]),
	                    y: parseFloat(this.regExes.numeric.exec(coords[1])[0])
	                }];
	            },
	            multipoint: function multipoint(str) {
	                var i, components, points;
	                components = [];
	                points = _Wkt.trim(str).split(this.regExes.comma);
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
	                lines = _Wkt.trim(str).split(this.regExes.doubleParenComma);
	                if (lines.length === 1) {
	                    lines = _Wkt.trim(str).split(this.regExes.parenComma);
	                }
	                for (i = 0; i < lines.length; i += 1) {
	                    line = this._stripWhitespaceAndParens(lines[i]);
	                    components.push(this.ingest.linestring.apply(this, [line]));
	                }
	                return components;
	            },
	            polygon: function polygon(str) {
	                var i, j, components, subcomponents, ring, rings;
	                rings = _Wkt.trim(str).split(this.regExes.parenComma);
	                components = [];
	                for (i = 0; i < rings.length; i += 1) {
	                    ring = this._stripWhitespaceAndParens(rings[i]).split(this.regExes.comma);
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
	                polygons = _Wkt.trim(str).split(this.regExes.doubleParenComma);
	                for (i = 0; i < polygons.length; i += 1) {
	                    polygon = this._stripWhitespaceAndParens(polygons[i]);
	                    components.push(this.ingest.polygon.apply(this, [polygon]));
	                }
	                return components;
	            },
	            geometrycollection: function geometrycollection(str) {
	                console.log('The geometrycollection WKT type is not yet supported.');
	            }
	        };
	        return _Wkt;
	    });
	});

	var wicketGmap3 = createCommonjsModule(function (module, exports) {
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
	    (function (root, factory) {
	        {
	            factory(wicket);
	        }
	    })(commonjsGlobal, function (Wkt) {
	        Wkt.Wkt.prototype.isRectangle = false;
	        Wkt.Wkt.prototype.construct = {
	            point: function point(config, component) {
	                var c = component || this.components;
	                config = config || {};
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
	                var polygonIsClockwise = function polygonIsClockwise(coords) {
	                    var area = 0,
	                        j = null,
	                        i = 0;
	                    for (i = 0; i < coords.length; i++) {
	                        j = (i + 1) % coords.length;
	                        area += coords[i].x * coords[j].x;
	                        area -= coords[j].y * coords[i].y;
	                    }
	                    return area > 0;
	                };
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
	                        if (polygonIsClockwise(c[j]) && this.type == 'polygon') {
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
	            var features, i, j, multiFlag, verts, rings, sign, tmp, response, lat, lng, vertex, ring, linestrings, k;
	            if (google.maps.geometry) {
	                sign = google.maps.geometry.spherical.computeSignedArea;
	            }            if (obj.constructor === google.maps.LatLng) {
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
	                        verts.push({
	                            x: tmp.getAt(0).lng(),
	                            y: tmp.getAt(0).lat()
	                        });
	                        if (i % 2 !== 0) {
	                            verts.reverse();
	                        }
	                    }
	                    if (obj.getPaths().length > 1 && i > 0) {
	                        if (sign(obj.getPaths().getAt(i)) > 0 && sign(obj.getPaths().getAt(i - 1)) > 0 || sign(obj.getPaths().getAt(i)) < 0 && sign(obj.getPaths().getAt(i - 1)) < 0                  ) {
	                                verts = [verts];
	                            } else {
	                            verts.reverse();
	                        }
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
	                var rings = [];
	                for (i = 0; i < obj.getLength(); i += 1) {
	                    ring = obj.getAt(i);
	                    var verts = [];
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
	                    var linestring = obj.getAt(i);
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
	                var polygons = [];
	                for (k = 0; k < obj.getLength(); k += 1) {
	                    var polygon = obj.getAt(k);
	                    var rings = [];
	                    for (i = 0; i < polygon.getLength(); i += 1) {
	                        ring = polygon.getAt(i);
	                        var verts = [];
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
	            console.log('The passed object does not have any recognizable properties.');
	        };
	        return Wkt;
	    });
	});

	function toCoord(LatLng) {
		if (google.maps && google.maps.LatLng && LatLng instanceof google.maps.LatLng) {
			return [LatLng.lng(), LatLng.lat()];
		} else if (LatLng.lat && LatLng.lng) {
			return [LatLng.lng, LatLng.lat];
		} else if (LatLng.length && LatLng.length >= 2) {
			return LatLng;
		} else {
			throw new Error('input must be an instance of google.maps.LatLng, google.maps.LatLngLiteral or Position');
		}
	}
	function toCoords(arrayLatLng, closeRing) {
		var ring = arrayLatLng.map(function (latLng) {
			return toCoord(latLng);
		});
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

	var debug = console.debug.bind(console, 'turfHelper:'),
	    warn = console.warn.bind(console, 'turfHelper:');
	function Wicket() {
	    return new wicket.Wkt();
	}
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
	var validTypes = ['Point', 'MultiPoint', 'LineString', 'MultiLineString', 'Polygon', 'MultiPolygon'];
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
	    } else if (object.coordinates && validTypes.indexOf(object.type) !== -1) {
	        polygonFeature = {
	            type: "Feature",
	            properties: {},
	            geometry: object
	        };
	    } else {
	        throw new Error('object is not a Feature, Geometry, google.maps.Polygon nor an array of google.maps.LatLng');
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
	function polygonToFeaturePolygonCollection(googleObject) {
	    var latLngArray;
	    if (googleObject instanceof google.maps.Polygon || googleObject instanceof google.maps.Polyline) {
	        latLngArray = googleObject.getPath().getArray();
	    }
	    return arrayToFeaturePoints(latLngArray);
	}
	function area$1(object) {
	    var polygonFeature = polygonToFeaturePolygon(object);
	    return area(polygonFeature);
	}

	exports.debug = debug;
	exports.warn = warn;
	exports.area = area$1;
	exports.Wicket = Wicket;
	exports.arrayToFeaturePolygon = arrayToFeaturePolygon;
	exports.polygonToFeaturePolygonCollection = polygonToFeaturePolygonCollection;
	exports.arrayToFeaturePoints = arrayToFeaturePoints;
	exports.markerToFeaturePoint = markerToFeaturePoint;
	exports.latlngToFeaturePoint = latlngToFeaturePoint;
	exports.polygonToFeaturePolygon = polygonToFeaturePolygon;
	exports.polylineToFeatureLinestring = polylineToFeatureLinestring;

	Object.defineProperty(exports, '__esModule', { value: true });

})));
