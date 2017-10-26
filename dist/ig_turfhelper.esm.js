var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) {
  return typeof obj;
} : function (obj) {
  return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
};





var asyncGenerator = function () {
  function AwaitValue(value) {
    this.value = value;
  }

  function AsyncGenerator(gen) {
    var front, back;

    function send(key, arg) {
      return new Promise(function (resolve, reject) {
        var request = {
          key: key,
          arg: arg,
          resolve: resolve,
          reject: reject,
          next: null
        };

        if (back) {
          back = back.next = request;
        } else {
          front = back = request;
          resume(key, arg);
        }
      });
    }

    function resume(key, arg) {
      try {
        var result = gen[key](arg);
        var value = result.value;

        if (value instanceof AwaitValue) {
          Promise.resolve(value.value).then(function (arg) {
            resume("next", arg);
          }, function (arg) {
            resume("throw", arg);
          });
        } else {
          settle(result.done ? "return" : "normal", result.value);
        }
      } catch (err) {
        settle("throw", err);
      }
    }

    function settle(type, value) {
      switch (type) {
        case "return":
          front.resolve({
            value: value,
            done: true
          });
          break;

        case "throw":
          front.reject(value);
          break;

        default:
          front.resolve({
            value: value,
            done: false
          });
          break;
      }

      front = front.next;

      if (front) {
        resume(front.key, front.arg);
      } else {
        back = null;
      }
    }

    this._invoke = send;

    if (typeof gen.return !== "function") {
      this.return = undefined;
    }
  }

  if (typeof Symbol === "function" && Symbol.asyncIterator) {
    AsyncGenerator.prototype[Symbol.asyncIterator] = function () {
      return this;
    };
  }

  AsyncGenerator.prototype.next = function (arg) {
    return this._invoke("next", arg);
  };

  AsyncGenerator.prototype.throw = function (arg) {
    return this._invoke("throw", arg);
  };

  AsyncGenerator.prototype.return = function (arg) {
    return this._invoke("return", arg);
  };

  return {
    wrap: function (fn) {
      return function () {
        return new AsyncGenerator(fn.apply(this, arguments));
      };
    },
    await: function (value) {
      return new AwaitValue(value);
    }
  };
}();

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

var beginsWith;
var endsWith;

/**
 * @desc The Wkt namespace.
 * @property    {String}    delimiter   - The default delimiter for separating components of atomic geometry (coordinates)
 * @namespace
 * @global
 */
var Wkt = function Wkt(obj) {
    if (obj instanceof Wkt) return obj;
    if (!(this instanceof Wkt)) return new Wkt(obj);
    this._wrapped = obj;
};

/**
 * Returns true if the substring is found at the beginning of the string.
 * @param   str {String}    The String to search
 * @param   sub {String}    The substring of interest
 * @return      {Boolean}
 * @private
 */
beginsWith = function beginsWith(str, sub) {
    return str.substring(0, sub.length) === sub;
};

/**
 * Returns true if the substring is found at the end of the string.
 * @param   str {String}    The String to search
 * @param   sub {String}    The substring of interest
 * @return      {Boolean}
 * @private
 */
endsWith = function endsWith(str, sub) {
    return str.substring(str.length - sub.length) === sub;
};

/**
 * The default delimiter for separating components of atomic geometry (coordinates)
 * @ignore
 */
Wkt.delimiter = ' ';

/**
 * Determines whether or not the passed Object is an Array.
 * @param   obj {Object}    The Object in question
 * @return      {Boolean}
 * @member Wkt.isArray
 * @method
 */
Wkt.isArray = function (obj) {
    return !!(obj && obj.constructor === Array);
};

/**
 * Removes given character String(s) from a String.
 * @param   str {String}    The String to search
 * @param   sub {String}    The String character(s) to trim
 * @return      {String}    The trimmed string
 * @member Wkt.trim
 * @method
 */
Wkt.trim = function (str, sub) {
    sub = sub || ' '; // Defaults to trimming spaces
    // Trim beginning spaces
    while (beginsWith(str, sub)) {
        str = str.substring(1);
    }
    // Trim ending spaces
    while (endsWith(str, sub)) {
        str = str.substring(0, str.length - 1);
    }
    return str;
};

/**
 * An object for reading WKT strings and writing geographic features
 * @constructor Wkt.Wkt
 * @param   initializer {String}    An optional WKT string for immediate read
 * @property            {Array}     components      - Holder for atomic geometry objects (internal representation of geometric components)
 * @property            {String}    delimiter       - The default delimiter for separating components of atomic geometry (coordinates)
 * @property            {Object}    regExes         - Some regular expressions copied from OpenLayers.Format.WKT.js
 * @property            {String}    type            - The Well-Known Text name (e.g. 'point') of the geometry
 * @property            {Boolean}   wrapVerticies   - True to wrap vertices in MULTIPOINT geometries; If true: MULTIPOINT((30 10),(10 30),(40 40)); If false: MULTIPOINT(30 10,10 30,40 40)
 * @return              {Wkt.Wkt}
 * @memberof Wkt
 */
Wkt.Wkt = function (initializer) {

    /**
     * The default delimiter between X and Y coordinates.
     * @ignore
     */
    this.delimiter = Wkt.delimiter || ' ';

    /**
     * Configuration parameter for controlling how Wicket seralizes
     * MULTIPOINT strings. Examples; both are valid WKT:
     * If true: MULTIPOINT((30 10),(10 30),(40 40))
     * If false: MULTIPOINT(30 10,10 30,40 40)
     * @ignore
     */
    this.wrapVertices = true;

    /**
     * Some regular expressions copied from OpenLayers.Format.WKT.js
     * @ignore
     */
    this.regExes = {
        'typeStr': /^\s*(\w+)\s*\(\s*(.*)\s*\)\s*$/,
        'spaces': /\s+|\+/, // Matches the '+' or the empty space
        'numeric': /-*\d+(\.*\d+)?/,
        'comma': /\s*,\s*/,
        'parenComma': /\)\s*,\s*\(/,
        'coord': /-*\d+\.*\d+ -*\d+\.*\d+/, // e.g. "24 -14"
        'doubleParenComma': /\)\s*\)\s*,\s*\(\s*\(/,
        'trimParens': /^\s*\(?(.*?)\)?\s*$/,
        'ogcTypes': /^(multi)?(point|line|polygon|box)?(string)?$/i, // Captures e.g. "Multi","Line","String"
        'crudeJson': /^{.*"(type|coordinates|geometries|features)":.*}$/ // Attempts to recognize JSON strings
    };

    /**
     * The internal representation of geometry--the "components" of geometry.
     * @ignore
     */
    this.components = undefined;

    // An initial WKT string may be provided
    if (initializer && typeof initializer === 'string') {
        this.read(initializer);
    } else if (initializer && (typeof initializer === 'undefined' ? 'undefined' : _typeof(initializer)) !== undefined) {
        this.fromObject(initializer);
    }
};

/**
 * Returns true if the internal geometry is a collection of geometries.
 * @return  {Boolean}   Returns true when it is a collection
 * @memberof Wkt.Wkt
 * @method
 */
Wkt.Wkt.prototype.isCollection = function () {
    switch (this.type.slice(0, 5)) {
        case 'multi':
            // Trivial; any multi-geometry is a collection
            return true;
        case 'polyg':
            // Polygons with holes are "collections" of rings
            return true;
        default:
            // Any other geometry is not a collection
            return false;
    }
};

/**
 * Compares two x,y coordinates for equality.
 * @param   a   {Object}    An object with x and y properties
 * @param   b   {Object}    An object with x and y properties
 * @return      {Boolean}
 * @memberof Wkt.Wkt
 * @method
 */
Wkt.Wkt.prototype.sameCoords = function (a, b) {
    return a.x === b.x && a.y === b.y;
};

/**
 * Sets internal geometry (components) from framework geometry (e.g.
 * Google Polygon objects or google.maps.Polygon).
 * @param   obj {Object}    The framework-dependent geometry representation
 * @return      {Wkt.Wkt}   The object itself
 * @memberof Wkt.Wkt
 * @method
 */
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

/**
 * Creates external geometry objects based on a plug-in framework's
 * construction methods and available geometry classes.
 * @param   config  {Object}    An optional framework-dependent properties specification
 * @return          {Object}    The framework-dependent geometry representation
 * @memberof Wkt.Wkt
 * @method
 */
Wkt.Wkt.prototype.toObject = function (config) {
    var obj = this.construct[this.type].call(this, config);
    // Don't assign the "properties" property to an Array
    if ((typeof obj === 'undefined' ? 'undefined' : _typeof(obj)) === 'object' && !Wkt.isArray(obj)) {
        obj.properties = this.properties;
    }
    return obj;
};

/**
 * Returns the WKT string representation; the same as the write() method.
 * @memberof Wkt.Wkt
 * @method
 */
Wkt.Wkt.prototype.toString = function (config) {
    return this.write();
};

/**
 * Parses a JSON representation as an Object.
 * @param   obj {Object}    An Object with the GeoJSON schema
 * @return  {Wkt.Wkt}  The object itself
 * @memberof Wkt.Wkt
 * @method
 */
Wkt.Wkt.prototype.fromJson = function (obj) {
    var i, j, k, coords, iring, oring;

    this.type = obj.type.toLowerCase();
    this.components = [];
    if (obj.hasOwnProperty('geometry')) {
        //Feature
        this.fromJson(obj.geometry);
        this.properties = obj.properties;
        return this;
    }
    coords = obj.coordinates;

    if (!Wkt.isArray(coords[0])) {
        // Point
        this.components.push({
            x: coords[0],
            y: coords[1]
        });
    } else {

        for (i in coords) {
            if (coords.hasOwnProperty(i)) {

                if (!Wkt.isArray(coords[i][0])) {
                    // LineString

                    if (this.type === 'multipoint') {
                        // MultiPoint
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

/**
 * Creates a JSON representation, with the GeoJSON schema, of the geometry.
 * @return    {Object}    The corresponding GeoJSON representation
 * @memberof Wkt.Wkt
 * @method
 */
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

        // Wkt BOX type gets a special bbox property in GeoJSON
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

    // For the coordinates of most simple features
    for (i in cs) {
        if (cs.hasOwnProperty(i)) {

            // For those nested structures
            if (Wkt.isArray(cs[i])) {
                rings = [];

                for (j in cs[i]) {
                    if (cs[i].hasOwnProperty(j)) {

                        if (Wkt.isArray(cs[i][j])) {
                            // MULTIPOLYGONS
                            ring = [];

                            for (k in cs[i][j]) {
                                if (cs[i][j].hasOwnProperty(k)) {
                                    ring.push([cs[i][j][k].x, cs[i][j][k].y]);
                                }
                            }

                            rings.push(ring);
                        } else {
                            // POLYGONS and MULTILINESTRINGS

                            if (cs[i].length > 1) {
                                rings.push([cs[i][j].x, cs[i][j].y]);
                            } else {
                                // MULTIPOINTS
                                rings = rings.concat([cs[i][j].x, cs[i][j].y]);
                            }
                        }
                    }
                }

                json.coordinates.push(rings);
            } else {
                if (cs.length > 1) {
                    // For LINESTRING type
                    json.coordinates.push([cs[i].x, cs[i].y]);
                } else {
                    // For POINT type
                    json.coordinates = json.coordinates.concat([cs[i].x, cs[i].y]);
                }
            }
        }
    }

    return json;
};

/**
 * Absorbs the geometry of another Wkt.Wkt instance, merging it with its own,
 * creating a collection (MULTI-geometry) based on their types, which must agree.
 * For example, creates a MULTIPOLYGON from a POLYGON type merged with another
 * POLYGON type, or adds a POLYGON instance to a MULTIPOLYGON instance.
 * @param   wkt {String}    A Wkt.Wkt object
 * @return  {Wkt.Wkt}  The object itself
 * @memberof Wkt.Wkt
 * @method
 */
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

/**
 * Reads a WKT string, validating and incorporating it.
 * @param   str {String}    A WKT or GeoJSON string
 * @return  {Wkt.Wkt}  The object itself
 * @memberof Wkt.Wkt
 * @method
 */
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
}; // eo readWkt

/**
 * Writes a WKT string.
 * @param   components  {Array}     An Array of internal geometry objects
 * @return              {String}    The corresponding WKT representation
 * @memberof Wkt.Wkt
 * @method
 */
Wkt.Wkt.prototype.write = function (components) {
    var i, pieces, data;

    components = components || this.components;

    pieces = [];

    pieces.push(this.type.toUpperCase() + '(');

    for (i = 0; i < components.length; i += 1) {
        if (this.isCollection() && i > 0) {
            pieces.push(',');
        }

        // There should be an extract function for the named type
        if (!this.extract[this.type]) {
            return null;
        }

        data = this.extract[this.type].apply(this, [components[i]]);
        if (this.isCollection() && this.type !== 'multipoint') {
            pieces.push('(' + data + ')');
        } else {
            pieces.push(data);

            // If not at the end of the components, add a comma
            if (i !== components.length - 1 && this.type !== 'multipoint') {
                pieces.push(',');
            }
        }
    }

    pieces.push(')');

    return pieces.join('');
};

/**
 * This object contains functions as property names that extract WKT
 * strings from the internal representation.
 * @memberof Wkt.Wkt
 * @namespace Wkt.Wkt.extract
 * @instance
 */
Wkt.Wkt.prototype.extract = {
    /**
     * Return a WKT string representing atomic (point) geometry
     * @param   point   {Object}    An object with x and y properties
     * @return          {String}    The WKT representation
     * @memberof Wkt.Wkt.extract
     * @instance
     */
    point: function point(_point) {
        return String(_point.x) + this.delimiter + String(_point.y);
    },

    /**
     * Return a WKT string representing multiple atoms (points)
     * @param   multipoint  {Array}     Multiple x-and-y objects
     * @return              {String}    The WKT representation
     * @memberof Wkt.Wkt.extract
     * @instance
     */
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

    /**
     * Return a WKT string representing a chain (linestring) of atoms
     * @param   linestring  {Array}     Multiple x-and-y objects
     * @return              {String}    The WKT representation
     * @memberof Wkt.Wkt.extract
     * @instance
     */
    linestring: function linestring(_linestring) {
        // Extraction of linestrings is the same as for points
        return this.extract.point.apply(this, [_linestring]);
    },

    /**
     * Return a WKT string representing multiple chains (multilinestring) of atoms
     * @param   multilinestring {Array}     Multiple of multiple x-and-y objects
     * @return                  {String}    The WKT representation
     * @memberof Wkt.Wkt.extract
     * @instance
     */
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

    /**
     * Return a WKT string representing multiple atoms in closed series (polygon)
     * @param   polygon {Array}     Collection of ordered x-and-y objects
     * @return          {String}    The WKT representation
     * @memberof Wkt.Wkt.extract
     * @instance
     */
    polygon: function polygon(_polygon) {
        // Extraction of polygons is the same as for multilinestrings
        return this.extract.multilinestring.apply(this, [_polygon]);
    },

    /**
     * Return a WKT string representing multiple closed series (multipolygons) of multiple atoms
     * @param   multipolygon    {Array}     Collection of ordered x-and-y objects
     * @return                  {String}    The WKT representation
     * @memberof Wkt.Wkt.extract
     * @instance
     */
    multipolygon: function multipolygon(_multipolygon) {
        var i,
            parts = [];
        for (i = 0; i < _multipolygon.length; i += 1) {
            parts.push('(' + this.extract.polygon.apply(this, [_multipolygon[i]]) + ')');
        }
        return parts.join(',');
    },

    /**
     * Return a WKT string representing a 2DBox
     * @param   multipolygon    {Array}     Collection of ordered x-and-y objects
     * @return                  {String}    The WKT representation
     * @memberof Wkt.Wkt.extract
     * @instance
     */
    box: function box(_box) {
        return this.extract.linestring.apply(this, [_box]);
    },

    geometrycollection: function geometrycollection(str) {
        console.log('The geometrycollection WKT type is not yet supported.');
    }
};

/**
 * This object contains functions as property names that ingest WKT
 * strings into the internal representation.
 * @memberof Wkt.Wkt
 * @namespace Wkt.Wkt.ingest
 * @instance
 */
Wkt.Wkt.prototype.ingest = {

    /**
     * Return point feature given a point WKT fragment.
     * @param   str {String}    A WKT fragment representing the point
     * @memberof Wkt.Wkt.ingest
     * @instance
     */
    point: function point(str) {
        var coords = Wkt.trim(str).split(this.regExes.spaces);
        // In case a parenthetical group of coordinates is passed...
        return [{ // ...Search for numeric substrings
            x: parseFloat(this.regExes.numeric.exec(coords[0])[0]),
            y: parseFloat(this.regExes.numeric.exec(coords[1])[0])
        }];
    },

    /**
     * Return a multipoint feature given a multipoint WKT fragment.
     * @param   str {String}    A WKT fragment representing the multipoint
     * @memberof Wkt.Wkt.ingest
     * @instance
     */
    multipoint: function multipoint(str) {
        var i, components, points;
        components = [];
        points = Wkt.trim(str).split(this.regExes.comma);
        for (i = 0; i < points.length; i += 1) {
            components.push(this.ingest.point.apply(this, [points[i]]));
        }
        return components;
    },

    /**
     * Return a linestring feature given a linestring WKT fragment.
     * @param   str {String}    A WKT fragment representing the linestring
     * @memberof Wkt.Wkt.ingest
     * @instance
     */
    linestring: function linestring(str) {
        var i, multipoints, components;

        // In our x-and-y representation of components, parsing
        //  multipoints is the same as parsing linestrings
        multipoints = this.ingest.multipoint.apply(this, [str]);

        // However, the points need to be joined
        components = [];
        for (i = 0; i < multipoints.length; i += 1) {
            components = components.concat(multipoints[i]);
        }
        return components;
    },

    /**
     * Return a multilinestring feature given a multilinestring WKT fragment.
     * @param   str {String}    A WKT fragment representing the multilinestring
     * @memberof Wkt.Wkt.ingest
     * @instance
     */
    multilinestring: function multilinestring(str) {
        var i, components, line, lines;
        components = [];

        lines = Wkt.trim(str).split(this.regExes.doubleParenComma);
        if (lines.length === 1) {
            // If that didn't work...
            lines = Wkt.trim(str).split(this.regExes.parenComma);
        }

        for (i = 0; i < lines.length; i += 1) {
            line = lines[i].replace(this.regExes.trimParens, '$1');
            components.push(this.ingest.linestring.apply(this, [line]));
        }

        return components;
    },

    /**
     * Return a polygon feature given a polygon WKT fragment.
     * @param   str {String}    A WKT fragment representing the polygon
     * @memberof Wkt.Wkt.ingest
     * @instance
     */
    polygon: function polygon(str) {
        var i, j, components, subcomponents, ring, rings;
        rings = Wkt.trim(str).split(this.regExes.parenComma);
        components = []; // Holds one or more rings
        for (i = 0; i < rings.length; i += 1) {
            ring = rings[i].replace(this.regExes.trimParens, '$1').split(this.regExes.comma);
            subcomponents = []; // Holds the outer ring and any inner rings (holes)
            for (j = 0; j < ring.length; j += 1) {
                // Split on the empty space or '+' character (between coordinates)
                var split = ring[j].split(this.regExes.spaces);
                if (split.length > 2) {
                    //remove the elements which are blanks
                    split = split.filter(function (n) {
                        return n != "";
                    });
                }
                if (split.length === 2) {
                    var x_cord = split[0];
                    var y_cord = split[1];

                    //now push
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

    /**
     * Return box vertices (which would become the Rectangle bounds) given a Box WKT fragment.
     * @param   str {String}    A WKT fragment representing the box
     * @memberof Wkt.Wkt.ingest
     * @instance
     */
    box: function box(str) {
        var i, multipoints, components;

        // In our x-and-y representation of components, parsing
        //  multipoints is the same as parsing linestrings
        multipoints = this.ingest.multipoint.apply(this, [str]);

        // However, the points need to be joined
        components = [];
        for (i = 0; i < multipoints.length; i += 1) {
            components = components.concat(multipoints[i]);
        }

        return components;
    },

    /**
     * Return a multipolygon feature given a multipolygon WKT fragment.
     * @param   str {String}    A WKT fragment representing the multipolygon
     * @memberof Wkt.Wkt.ingest
     * @instance
     */
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

    /**
     * Return an array of features given a geometrycollection WKT fragment.
     * @param   str {String}    A WKT fragment representing the geometry collection
     * @memberof Wkt.Wkt.ingest
     * @instance
     */
    geometrycollection: function geometrycollection(str) {
        console.log('The geometrycollection WKT type is not yet supported.');
    }

}; // eo ingest

/**
 * @augments Wkt.Wkt
 * A framework-dependent flag, set for each Wkt.Wkt() instance, that indicates
 * whether or not a closed polygon geometry should be interpreted as a rectangle.
 */
Wkt.Wkt.prototype.isRectangle = false;

/**
 * @augments Wkt.Wkt
 * An object of framework-dependent construction methods used to generate
 * objects belonging to the various geometry classes of the framework.
 */
Wkt.Wkt.prototype.construct = {
    /**
     * Creates the framework's equivalent point geometry object.
     * @param   config      {Object}    An optional properties hash the object should use
     * @param   component   {Object}    An optional component to build from
     * @return              {google.maps.Marker}
     */
    point: function point(config, component) {
        var c = component || this.components;

        config = config || {
            optimized: true
        };

        config.position = new google.maps.LatLng(c[0].y, c[0].x);

        return new google.maps.Marker(config);
    },

    /**
     * Creates the framework's equivalent multipoint geometry object.
     * @param   config  {Object}    An optional properties hash the object should use
     * @return          {Array}     Array containing multiple google.maps.Marker
     */
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

    /**
     * Creates the framework's equivalent linestring geometry object.
     * @param   config      {Object}    An optional properties hash the object should use
     * @param   component   {Object}    An optional component to build from
     * @return              {google.maps.Polyline}
     */
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

    /**
     * Creates the framework's equivalent multilinestring geometry object.
     * @param   config  {Object}    An optional properties hash the object should use
     * @return          {Array}     Array containing multiple google.maps.Polyline instances
     */
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

    /**
     * Creates the framework's equivalent Box or Rectangle geometry object.
     * @param   config      {Object}    An optional properties hash the object should use
     * @param   component   {Object}    An optional component to build from
     * @return              {google.maps.Rectangle}
     */
    box: function box(config, component) {
        var c = component || this.components;

        config = config || {};

        config.bounds = new google.maps.LatLngBounds(new google.maps.LatLng(c[0].y, c[0].x), new google.maps.LatLng(c[1].y, c[1].x));

        return new google.maps.Rectangle(config);
    },

    /**
     * Creates the framework's equivalent polygon geometry object.
     * @param   config      {Object}    An optional properties hash the object should use
     * @param   component   {Object}    An optional component to build from
     * @return              {google.maps.Polygon}
     */
    polygon: function polygon(config, component) {
        var j, k, c, rings, verts;

        c = component || this.components;

        config = config || {
            editable: false // Editable geometry off by default
        };

        config.paths = [];

        rings = [];
        for (j = 0; j < c.length; j += 1) {
            // For each ring...

            verts = [];
            // NOTE: We iterate to one (1) less than the Array length to skip the last vertex
            for (k = 0; k < c[j].length - 1; k += 1) {
                // For each vertex...
                verts.push(new google.maps.LatLng(c[j][k].y, c[j][k].x));
            } // eo for each vertex

            if (j !== 0) {
                // Reverse the order of coordinates in inner rings
                if (config.reverseInnerPolygons === null || config.reverseInnerPolygons) {
                    verts.reverse();
                }
            }

            rings.push(verts);
        } // eo for each ring

        config.paths = config.paths.concat(rings);

        if (this.isRectangle) {
            return function () {
                var bounds, v;

                bounds = new google.maps.LatLngBounds();

                for (v in rings[0]) {
                    // Ought to be only 1 ring in a Rectangle
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

    /**
     * Creates the framework's equivalent multipolygon geometry object.
     * @param   config  {Object}    An optional properties hash the object should use
     * @return          {Array}     Array containing multiple google.maps.Polygon
     */
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

/**
 * @augments Wkt.Wkt
 * A framework-dependent deconstruction method used to generate internal
 * geometric representations from instances of framework geometry. This method
 * uses object detection to attempt to classify members of framework geometry
 * classes into the standard WKT types.
 * @param obj       {Object}    An instance of one of the framework's geometry classes
 * @param multiFlag {Boolean} If true, then the deconstructor will be forced to return a MultiGeometry (multipoint, multilinestring or multipolygon)
 * @return          {Object}    A hash of the 'type' and 'components' thus derived, plus the WKT string of the feature.
 */
Wkt.Wkt.prototype.deconstruct = function (obj, multiFlag) {
    var features, i, j, verts, rings, sign, tmp, response, lat, lng, vertex, ring;
    var polygons, polygon, k, linestring, linestrings;
    // Shortcut to signed area function (determines clockwise vs counter-clock)
    if (google.maps.geometry) {
        sign = google.maps.geometry.spherical.computeSignedArea;
    }

    // google.maps.LatLng //////////////////////////////////////////////////////
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

    // google.maps.Point //////////////////////////////////////////////////////
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

    // google.maps.Marker //////////////////////////////////////////////////////
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

    // google.maps.Polyline ////////////////////////////////////////////////////
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

    // google.maps.Polygon /////////////////////////////////////////////////////
    if (obj.constructor === google.maps.Polygon) {

        rings = [];

        if (multiFlag === undefined) {
            multiFlag = function () {
                var areas, l;

                l = obj.getPaths().length;
                if (l <= 1) {
                    // Trivial; this is a single polygon
                    return false;
                }

                if (l === 2) {
                    // If clockwise*clockwise or counter*counter, i.e.
                    //  (-1)*(-1) or (1)*(1), then result would be positive
                    if (sign(obj.getPaths().getAt(0)) * sign(obj.getPaths().getAt(1)) < 0) {
                        return false; // Most likely single polygon with 1 hole
                    }

                    return true;
                }

                // Must be longer than 3 polygons at this point...
                areas = obj.getPaths().getArray().map(function (k) {
                    return sign(k) / Math.abs(sign(k)); // Unit normalization (outputs 1 or -1)
                });

                // If two clockwise or two counter-clockwise rings are found
                //  (at different indices)...
                if (areas.indexOf(areas[0]) !== areas.lastIndexOf(areas[0])) {
                    multiFlag = true; // Flag for holes in one or more polygons
                    return true;
                }

                return false;
            }();
        }

        for (i = 0; i < obj.getPaths().length; i += 1) {
            // For each polygon (ring)...
            tmp = obj.getPaths().getAt(i);
            verts = [];
            for (j = 0; j < obj.getPaths().getAt(i).length; j += 1) {
                // For each vertex...
                verts.push({
                    x: tmp.getAt(j).lng(),
                    y: tmp.getAt(j).lat()
                });
            }

            if (!tmp.getAt(tmp.length - 1).equals(tmp.getAt(0))) {
                if (i % 2 !== 0) {
                    // In inner rings, coordinates are reversed...
                    verts.unshift({ // Add the first coordinate again for closure
                        x: tmp.getAt(tmp.length - 1).lng(),
                        y: tmp.getAt(tmp.length - 1).lat()
                    });
                } else {
                    verts.push({ // Add the first coordinate again for closure
                        x: tmp.getAt(0).lng(),
                        y: tmp.getAt(0).lat()
                    });
                }
            }

            if (obj.getPaths().length > 1 && i > 0) {
                // If this and the last ring have the same signs...
                if (sign(obj.getPaths().getAt(i)) > 0 && sign(obj.getPaths().getAt(i - 1)) > 0 || sign(obj.getPaths().getAt(i)) < 0 && sign(obj.getPaths().getAt(i - 1)) < 0 && !multiFlag) {
                    // ...They must both be inner rings (or both be outer rings, in a multipolygon)
                    verts = [verts]; // Wrap multipolygons once more (collection)
                }
            }

            //TODO This makes mistakes when a second polygon has holes; it sees them all as individual polygons
            if (i % 2 !== 0) {
                // In inner rings, coordinates are reversed...
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

    // google.maps.Circle //////////////////////////////////////////////////////
    if (obj.constructor === google.maps.Circle) {
        var point = obj.getCenter();
        var radius = obj.getRadius();
        verts = [];
        var d2r = Math.PI / 180; // degrees to radians
        var r2d = 180 / Math.PI; // radians to degrees
        radius = radius / 1609; // meters to miles
        var earthsradius = 3963; // 3963 is the radius of the earth in miles
        var num_seg = 32; // number of segments used to approximate a circle
        var rlat = radius / earthsradius * r2d;
        var rlng = rlat / Math.cos(point.lat() * d2r);

        for (var n = 0; n <= num_seg; n++) {
            var theta = Math.PI * (n / (num_seg / 2));
            lng = point.lng() + rlng * Math.cos(theta); // center a + radius x * cos(theta)
            lat = point.lat() + rlat * Math.sin(theta); // center b + radius y * sin(theta)
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

    // google.maps.LatLngBounds ///////////////////////////////////////////////////
    if (obj.constructor === google.maps.LatLngBounds) {

        tmp = obj;
        verts = [];
        verts.push({ // NW corner
            x: tmp.getSouthWest().lng(),
            y: tmp.getNorthEast().lat()
        });

        verts.push({ // NE corner
            x: tmp.getNorthEast().lng(),
            y: tmp.getNorthEast().lat()
        });

        verts.push({ // SE corner
            x: tmp.getNorthEast().lng(),
            y: tmp.getSouthWest().lat()
        });

        verts.push({ // SW corner
            x: tmp.getSouthWest().lng(),
            y: tmp.getSouthWest().lat()
        });

        verts.push({ // NW corner (again, for closure)
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

    // google.maps.Rectangle ///////////////////////////////////////////////////
    if (obj.constructor === google.maps.Rectangle) {

        tmp = obj.getBounds();
        verts = [];
        verts.push({ // NW corner
            x: tmp.getSouthWest().lng(),
            y: tmp.getNorthEast().lat()
        });

        verts.push({ // NE corner
            x: tmp.getNorthEast().lng(),
            y: tmp.getNorthEast().lat()
        });

        verts.push({ // SE corner
            x: tmp.getNorthEast().lng(),
            y: tmp.getSouthWest().lat()
        });

        verts.push({ // SW corner
            x: tmp.getSouthWest().lng(),
            y: tmp.getSouthWest().lat()
        });

        verts.push({ // NW corner (again, for closure)
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

    // google.maps.Data Geometry Types /////////////////////////////////////////////////////

    // google.maps.Data.Feature /////////////////////////////////////////////////////
    if (obj.constructor === google.maps.Data.Feature) {
        return this.deconstruct.call(this, obj.getGeometry());
    }

    // google.maps.Data.Point /////////////////////////////////////////////////////
    if (obj.constructor === google.maps.Data.Point) {
        //console.zlog('It is a google.maps.Data.Point');
        response = {
            type: 'point',
            components: [{
                x: obj.get().lng(),
                y: obj.get().lat()
            }]
        };
        return response;
    }

    // google.maps.Data.LineString /////////////////////////////////////////////////////
    if (obj.constructor === google.maps.Data.LineString) {
        verts = [];
        //console.zlog('It is a google.maps.Data.LineString');
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

    // google.maps.Data.Polygon /////////////////////////////////////////////////////
    if (obj.constructor === google.maps.Data.Polygon) {
        rings = [];
        //console.zlog('It is a google.maps.Data.Polygon');
        for (i = 0; i < obj.getLength(); i += 1) {
            // For each ring...
            ring = obj.getAt(i);
            verts = [];
            for (j = 0; j < ring.getLength(); j += 1) {
                // For each vertex...
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

    // google.maps.Data.MultiPoint /////////////////////////////////////////////////////
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

    // google.maps.Data.MultiLineString /////////////////////////////////////////////////////
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

    // google.maps.Data.MultiPolygon /////////////////////////////////////////////////////
    if (obj.constructor === google.maps.Data.MultiPolygon) {

        polygons = [];

        //console.zlog('It is a google.maps.Data.MultiPolygon');
        for (k = 0; k < obj.getLength(); k += 1) {
            // For each multipolygon
            polygon = obj.getAt(k);
            rings = [];
            for (i = 0; i < polygon.getLength(); i += 1) {
                // For each ring...
                ring = polygon.getAt(i);
                verts = [];
                for (j = 0; j < ring.getLength(); j += 1) {
                    // For each vertex...
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

    // google.maps.Data.GeometryCollection /////////////////////////////////////////////////////
    if (obj.constructor === google.maps.Data.GeometryCollection) {

        var objects = [];
        for (k = 0; k < obj.getLength(); k += 1) {
            // For each multipolygon
            var object = obj.getAt(k);
            objects.push(this.deconstruct.call(this, object));
        }
        //console.zlog('It is a google.maps.Data.GeometryCollection', objects);
        response = {
            type: 'geometrycollection',
            components: objects
        };
        return response;
    }

    // Array ///////////////////////////////////////////////////////////////////
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
                    // Check that all items have the same constructor as the first item
                    if (obj[k].constructor !== type) {
                        // If they don't, type is heterogeneous geometry collection
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
                // Pluck the components from each Wkt
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

function Wicket$1() {
    return new Wkt.Wkt();
}

/**
 * A specialized version of `_.map` for arrays without support for iteratee
 * shorthands.
 *
 * @private
 * @param {Array} [array] The array to iterate over.
 * @param {Function} iteratee The function invoked per iteration.
 * @returns {Array} Returns the new mapped array.
 */
function arrayMap(array, iteratee) {
  var index = -1,
      length = array == null ? 0 : array.length,
      result = Array(length);

  while (++index < length) {
    result[index] = iteratee(array[index], index, array);
  }
  return result;
}

/**
 * Removes all key-value entries from the list cache.
 *
 * @private
 * @name clear
 * @memberOf ListCache
 */
function listCacheClear() {
  this.__data__ = [];
  this.size = 0;
}

/**
 * Performs a
 * [`SameValueZero`](http://ecma-international.org/ecma-262/7.0/#sec-samevaluezero)
 * comparison between two values to determine if they are equivalent.
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Lang
 * @param {*} value The value to compare.
 * @param {*} other The other value to compare.
 * @returns {boolean} Returns `true` if the values are equivalent, else `false`.
 * @example
 *
 * var object = { 'a': 1 };
 * var other = { 'a': 1 };
 *
 * _.eq(object, object);
 * // => true
 *
 * _.eq(object, other);
 * // => false
 *
 * _.eq('a', 'a');
 * // => true
 *
 * _.eq('a', Object('a'));
 * // => false
 *
 * _.eq(NaN, NaN);
 * // => true
 */
function eq(value, other) {
  return value === other || value !== value && other !== other;
}

/**
 * Gets the index at which the `key` is found in `array` of key-value pairs.
 *
 * @private
 * @param {Array} array The array to inspect.
 * @param {*} key The key to search for.
 * @returns {number} Returns the index of the matched value, else `-1`.
 */
function assocIndexOf(array, key) {
  var length = array.length;
  while (length--) {
    if (eq(array[length][0], key)) {
      return length;
    }
  }
  return -1;
}

/** Used for built-in method references. */
var arrayProto = Array.prototype;

/** Built-in value references. */
var splice = arrayProto.splice;

/**
 * Removes `key` and its value from the list cache.
 *
 * @private
 * @name delete
 * @memberOf ListCache
 * @param {string} key The key of the value to remove.
 * @returns {boolean} Returns `true` if the entry was removed, else `false`.
 */
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

/**
 * Gets the list cache value for `key`.
 *
 * @private
 * @name get
 * @memberOf ListCache
 * @param {string} key The key of the value to get.
 * @returns {*} Returns the entry value.
 */
function listCacheGet(key) {
  var data = this.__data__,
      index = assocIndexOf(data, key);

  return index < 0 ? undefined : data[index][1];
}

/**
 * Checks if a list cache value for `key` exists.
 *
 * @private
 * @name has
 * @memberOf ListCache
 * @param {string} key The key of the entry to check.
 * @returns {boolean} Returns `true` if an entry for `key` exists, else `false`.
 */
function listCacheHas(key) {
  return assocIndexOf(this.__data__, key) > -1;
}

/**
 * Sets the list cache `key` to `value`.
 *
 * @private
 * @name set
 * @memberOf ListCache
 * @param {string} key The key of the value to set.
 * @param {*} value The value to set.
 * @returns {Object} Returns the list cache instance.
 */
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

/**
 * Creates an list cache object.
 *
 * @private
 * @constructor
 * @param {Array} [entries] The key-value pairs to cache.
 */
function ListCache(entries) {
  var index = -1,
      length = entries == null ? 0 : entries.length;

  this.clear();
  while (++index < length) {
    var entry = entries[index];
    this.set(entry[0], entry[1]);
  }
}

// Add methods to `ListCache`.
ListCache.prototype.clear = listCacheClear;
ListCache.prototype['delete'] = listCacheDelete;
ListCache.prototype.get = listCacheGet;
ListCache.prototype.has = listCacheHas;
ListCache.prototype.set = listCacheSet;

/**
 * Removes all key-value entries from the stack.
 *
 * @private
 * @name clear
 * @memberOf Stack
 */
function stackClear() {
  this.__data__ = new ListCache();
  this.size = 0;
}

/**
 * Removes `key` and its value from the stack.
 *
 * @private
 * @name delete
 * @memberOf Stack
 * @param {string} key The key of the value to remove.
 * @returns {boolean} Returns `true` if the entry was removed, else `false`.
 */
function stackDelete(key) {
  var data = this.__data__,
      result = data['delete'](key);

  this.size = data.size;
  return result;
}

/**
 * Gets the stack value for `key`.
 *
 * @private
 * @name get
 * @memberOf Stack
 * @param {string} key The key of the value to get.
 * @returns {*} Returns the entry value.
 */
function stackGet(key) {
  return this.__data__.get(key);
}

/**
 * Checks if a stack value for `key` exists.
 *
 * @private
 * @name has
 * @memberOf Stack
 * @param {string} key The key of the entry to check.
 * @returns {boolean} Returns `true` if an entry for `key` exists, else `false`.
 */
function stackHas(key) {
  return this.__data__.has(key);
}

/** Detect free variable `global` from Node.js. */
var freeGlobal = (typeof global === 'undefined' ? 'undefined' : _typeof(global)) == 'object' && global && global.Object === Object && global;

/** Detect free variable `self`. */
var freeSelf = (typeof self === 'undefined' ? 'undefined' : _typeof(self)) == 'object' && self && self.Object === Object && self;

/** Used as a reference to the global object. */
var root = freeGlobal || freeSelf || Function('return this')();

/** Built-in value references. */
var _Symbol = root.Symbol;

/** Used for built-in method references. */
var objectProto$1 = Object.prototype;

/** Used to check objects for own properties. */
var hasOwnProperty$1 = objectProto$1.hasOwnProperty;

/**
 * Used to resolve the
 * [`toStringTag`](http://ecma-international.org/ecma-262/7.0/#sec-object.prototype.tostring)
 * of values.
 */
var nativeObjectToString = objectProto$1.toString;

/** Built-in value references. */
var symToStringTag$1 = _Symbol ? _Symbol.toStringTag : undefined;

/**
 * A specialized version of `baseGetTag` which ignores `Symbol.toStringTag` values.
 *
 * @private
 * @param {*} value The value to query.
 * @returns {string} Returns the raw `toStringTag`.
 */
function getRawTag(value) {
  var isOwn = hasOwnProperty$1.call(value, symToStringTag$1),
      tag = value[symToStringTag$1];

  try {
    value[symToStringTag$1] = undefined;
    var unmasked = true;
  } catch (e) {}

  var result = nativeObjectToString.call(value);
  if (unmasked) {
    if (isOwn) {
      value[symToStringTag$1] = tag;
    } else {
      delete value[symToStringTag$1];
    }
  }
  return result;
}

/** Used for built-in method references. */
var objectProto$2 = Object.prototype;

/**
 * Used to resolve the
 * [`toStringTag`](http://ecma-international.org/ecma-262/7.0/#sec-object.prototype.tostring)
 * of values.
 */
var nativeObjectToString$1 = objectProto$2.toString;

/**
 * Converts `value` to a string using `Object.prototype.toString`.
 *
 * @private
 * @param {*} value The value to convert.
 * @returns {string} Returns the converted string.
 */
function objectToString(value) {
  return nativeObjectToString$1.call(value);
}

/** `Object#toString` result references. */
var nullTag = '[object Null]';
var undefinedTag = '[object Undefined]';

/** Built-in value references. */
var symToStringTag = _Symbol ? _Symbol.toStringTag : undefined;

/**
 * The base implementation of `getTag` without fallbacks for buggy environments.
 *
 * @private
 * @param {*} value The value to query.
 * @returns {string} Returns the `toStringTag`.
 */
function baseGetTag(value) {
  if (value == null) {
    return value === undefined ? undefinedTag : nullTag;
  }
  return symToStringTag && symToStringTag in Object(value) ? getRawTag(value) : objectToString(value);
}

/**
 * Checks if `value` is the
 * [language type](http://www.ecma-international.org/ecma-262/7.0/#sec-ecmascript-language-types)
 * of `Object`. (e.g. arrays, functions, objects, regexes, `new Number(0)`, and `new String('')`)
 *
 * @static
 * @memberOf _
 * @since 0.1.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is an object, else `false`.
 * @example
 *
 * _.isObject({});
 * // => true
 *
 * _.isObject([1, 2, 3]);
 * // => true
 *
 * _.isObject(_.noop);
 * // => true
 *
 * _.isObject(null);
 * // => false
 */
function isObject(value) {
  var type = typeof value === 'undefined' ? 'undefined' : _typeof(value);
  return value != null && (type == 'object' || type == 'function');
}

/** `Object#toString` result references. */
var asyncTag = '[object AsyncFunction]';
var funcTag = '[object Function]';
var genTag = '[object GeneratorFunction]';
var proxyTag = '[object Proxy]';

/**
 * Checks if `value` is classified as a `Function` object.
 *
 * @static
 * @memberOf _
 * @since 0.1.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a function, else `false`.
 * @example
 *
 * _.isFunction(_);
 * // => true
 *
 * _.isFunction(/abc/);
 * // => false
 */
function isFunction(value) {
  if (!isObject(value)) {
    return false;
  }
  // The use of `Object#toString` avoids issues with the `typeof` operator
  // in Safari 9 which returns 'object' for typed arrays and other constructors.
  var tag = baseGetTag(value);
  return tag == funcTag || tag == genTag || tag == asyncTag || tag == proxyTag;
}

/** Used to detect overreaching core-js shims. */
var coreJsData = root['__core-js_shared__'];

/** Used to detect methods masquerading as native. */
var maskSrcKey = function () {
  var uid = /[^.]+$/.exec(coreJsData && coreJsData.keys && coreJsData.keys.IE_PROTO || '');
  return uid ? 'Symbol(src)_1.' + uid : '';
}();

/**
 * Checks if `func` has its source masked.
 *
 * @private
 * @param {Function} func The function to check.
 * @returns {boolean} Returns `true` if `func` is masked, else `false`.
 */
function isMasked(func) {
  return !!maskSrcKey && maskSrcKey in func;
}

/** Used for built-in method references. */
var funcProto$1 = Function.prototype;

/** Used to resolve the decompiled source of functions. */
var funcToString$1 = funcProto$1.toString;

/**
 * Converts `func` to its source code.
 *
 * @private
 * @param {Function} func The function to convert.
 * @returns {string} Returns the source code.
 */
function toSource(func) {
  if (func != null) {
    try {
      return funcToString$1.call(func);
    } catch (e) {}
    try {
      return func + '';
    } catch (e) {}
  }
  return '';
}

/**
 * Used to match `RegExp`
 * [syntax characters](http://ecma-international.org/ecma-262/7.0/#sec-patterns).
 */
var reRegExpChar = /[\\^$.*+?()[\]{}|]/g;

/** Used to detect host constructors (Safari). */
var reIsHostCtor = /^\[object .+?Constructor\]$/;

/** Used for built-in method references. */
var funcProto = Function.prototype;
var objectProto = Object.prototype;

/** Used to resolve the decompiled source of functions. */
var funcToString = funcProto.toString;

/** Used to check objects for own properties. */
var hasOwnProperty = objectProto.hasOwnProperty;

/** Used to detect if a method is native. */
var reIsNative = RegExp('^' + funcToString.call(hasOwnProperty).replace(reRegExpChar, '\\$&').replace(/hasOwnProperty|(function).*?(?=\\\()| for .+?(?=\\\])/g, '$1.*?') + '$');

/**
 * The base implementation of `_.isNative` without bad shim checks.
 *
 * @private
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a native function,
 *  else `false`.
 */
function baseIsNative(value) {
  if (!isObject(value) || isMasked(value)) {
    return false;
  }
  var pattern = isFunction(value) ? reIsNative : reIsHostCtor;
  return pattern.test(toSource(value));
}

/**
 * Gets the value at `key` of `object`.
 *
 * @private
 * @param {Object} [object] The object to query.
 * @param {string} key The key of the property to get.
 * @returns {*} Returns the property value.
 */
function getValue(object, key) {
  return object == null ? undefined : object[key];
}

/**
 * Gets the native function at `key` of `object`.
 *
 * @private
 * @param {Object} object The object to query.
 * @param {string} key The key of the method to get.
 * @returns {*} Returns the function if it's native, else `undefined`.
 */
function getNative(object, key) {
  var value = getValue(object, key);
  return baseIsNative(value) ? value : undefined;
}

/* Built-in method references that are verified to be native. */
var Map$1 = getNative(root, 'Map');

/* Built-in method references that are verified to be native. */
var nativeCreate = getNative(Object, 'create');

/**
 * Removes all key-value entries from the hash.
 *
 * @private
 * @name clear
 * @memberOf Hash
 */
function hashClear() {
  this.__data__ = nativeCreate ? nativeCreate(null) : {};
  this.size = 0;
}

/**
 * Removes `key` and its value from the hash.
 *
 * @private
 * @name delete
 * @memberOf Hash
 * @param {Object} hash The hash to modify.
 * @param {string} key The key of the value to remove.
 * @returns {boolean} Returns `true` if the entry was removed, else `false`.
 */
function hashDelete(key) {
  var result = this.has(key) && delete this.__data__[key];
  this.size -= result ? 1 : 0;
  return result;
}

/** Used to stand-in for `undefined` hash values. */
var HASH_UNDEFINED = '__lodash_hash_undefined__';

/** Used for built-in method references. */
var objectProto$3 = Object.prototype;

/** Used to check objects for own properties. */
var hasOwnProperty$2 = objectProto$3.hasOwnProperty;

/**
 * Gets the hash value for `key`.
 *
 * @private
 * @name get
 * @memberOf Hash
 * @param {string} key The key of the value to get.
 * @returns {*} Returns the entry value.
 */
function hashGet(key) {
  var data = this.__data__;
  if (nativeCreate) {
    var result = data[key];
    return result === HASH_UNDEFINED ? undefined : result;
  }
  return hasOwnProperty$2.call(data, key) ? data[key] : undefined;
}

/** Used for built-in method references. */
var objectProto$4 = Object.prototype;

/** Used to check objects for own properties. */
var hasOwnProperty$3 = objectProto$4.hasOwnProperty;

/**
 * Checks if a hash value for `key` exists.
 *
 * @private
 * @name has
 * @memberOf Hash
 * @param {string} key The key of the entry to check.
 * @returns {boolean} Returns `true` if an entry for `key` exists, else `false`.
 */
function hashHas(key) {
  var data = this.__data__;
  return nativeCreate ? data[key] !== undefined : hasOwnProperty$3.call(data, key);
}

/** Used to stand-in for `undefined` hash values. */
var HASH_UNDEFINED$1 = '__lodash_hash_undefined__';

/**
 * Sets the hash `key` to `value`.
 *
 * @private
 * @name set
 * @memberOf Hash
 * @param {string} key The key of the value to set.
 * @param {*} value The value to set.
 * @returns {Object} Returns the hash instance.
 */
function hashSet(key, value) {
  var data = this.__data__;
  this.size += this.has(key) ? 0 : 1;
  data[key] = nativeCreate && value === undefined ? HASH_UNDEFINED$1 : value;
  return this;
}

/**
 * Creates a hash object.
 *
 * @private
 * @constructor
 * @param {Array} [entries] The key-value pairs to cache.
 */
function Hash(entries) {
  var index = -1,
      length = entries == null ? 0 : entries.length;

  this.clear();
  while (++index < length) {
    var entry = entries[index];
    this.set(entry[0], entry[1]);
  }
}

// Add methods to `Hash`.
Hash.prototype.clear = hashClear;
Hash.prototype['delete'] = hashDelete;
Hash.prototype.get = hashGet;
Hash.prototype.has = hashHas;
Hash.prototype.set = hashSet;

/**
 * Removes all key-value entries from the map.
 *
 * @private
 * @name clear
 * @memberOf MapCache
 */
function mapCacheClear() {
  this.size = 0;
  this.__data__ = {
    'hash': new Hash(),
    'map': new (Map$1 || ListCache)(),
    'string': new Hash()
  };
}

/**
 * Checks if `value` is suitable for use as unique object key.
 *
 * @private
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is suitable, else `false`.
 */
function isKeyable(value) {
  var type = typeof value === 'undefined' ? 'undefined' : _typeof(value);
  return type == 'string' || type == 'number' || type == 'symbol' || type == 'boolean' ? value !== '__proto__' : value === null;
}

/**
 * Gets the data for `map`.
 *
 * @private
 * @param {Object} map The map to query.
 * @param {string} key The reference key.
 * @returns {*} Returns the map data.
 */
function getMapData(map, key) {
  var data = map.__data__;
  return isKeyable(key) ? data[typeof key == 'string' ? 'string' : 'hash'] : data.map;
}

/**
 * Removes `key` and its value from the map.
 *
 * @private
 * @name delete
 * @memberOf MapCache
 * @param {string} key The key of the value to remove.
 * @returns {boolean} Returns `true` if the entry was removed, else `false`.
 */
function mapCacheDelete(key) {
  var result = getMapData(this, key)['delete'](key);
  this.size -= result ? 1 : 0;
  return result;
}

/**
 * Gets the map value for `key`.
 *
 * @private
 * @name get
 * @memberOf MapCache
 * @param {string} key The key of the value to get.
 * @returns {*} Returns the entry value.
 */
function mapCacheGet(key) {
  return getMapData(this, key).get(key);
}

/**
 * Checks if a map value for `key` exists.
 *
 * @private
 * @name has
 * @memberOf MapCache
 * @param {string} key The key of the entry to check.
 * @returns {boolean} Returns `true` if an entry for `key` exists, else `false`.
 */
function mapCacheHas(key) {
  return getMapData(this, key).has(key);
}

/**
 * Sets the map `key` to `value`.
 *
 * @private
 * @name set
 * @memberOf MapCache
 * @param {string} key The key of the value to set.
 * @param {*} value The value to set.
 * @returns {Object} Returns the map cache instance.
 */
function mapCacheSet(key, value) {
  var data = getMapData(this, key),
      size = data.size;

  data.set(key, value);
  this.size += data.size == size ? 0 : 1;
  return this;
}

/**
 * Creates a map cache object to store key-value pairs.
 *
 * @private
 * @constructor
 * @param {Array} [entries] The key-value pairs to cache.
 */
function MapCache(entries) {
  var index = -1,
      length = entries == null ? 0 : entries.length;

  this.clear();
  while (++index < length) {
    var entry = entries[index];
    this.set(entry[0], entry[1]);
  }
}

// Add methods to `MapCache`.
MapCache.prototype.clear = mapCacheClear;
MapCache.prototype['delete'] = mapCacheDelete;
MapCache.prototype.get = mapCacheGet;
MapCache.prototype.has = mapCacheHas;
MapCache.prototype.set = mapCacheSet;

/** Used as the size to enable large array optimizations. */
var LARGE_ARRAY_SIZE = 200;

/**
 * Sets the stack `key` to `value`.
 *
 * @private
 * @name set
 * @memberOf Stack
 * @param {string} key The key of the value to set.
 * @param {*} value The value to set.
 * @returns {Object} Returns the stack cache instance.
 */
function stackSet(key, value) {
  var data = this.__data__;
  if (data instanceof ListCache) {
    var pairs = data.__data__;
    if (!Map$1 || pairs.length < LARGE_ARRAY_SIZE - 1) {
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

/**
 * Creates a stack cache object to store key-value pairs.
 *
 * @private
 * @constructor
 * @param {Array} [entries] The key-value pairs to cache.
 */
function Stack(entries) {
  var data = this.__data__ = new ListCache(entries);
  this.size = data.size;
}

// Add methods to `Stack`.
Stack.prototype.clear = stackClear;
Stack.prototype['delete'] = stackDelete;
Stack.prototype.get = stackGet;
Stack.prototype.has = stackHas;
Stack.prototype.set = stackSet;

/** Used to stand-in for `undefined` hash values. */
var HASH_UNDEFINED$2 = '__lodash_hash_undefined__';

/**
 * Adds `value` to the array cache.
 *
 * @private
 * @name add
 * @memberOf SetCache
 * @alias push
 * @param {*} value The value to cache.
 * @returns {Object} Returns the cache instance.
 */
function setCacheAdd(value) {
  this.__data__.set(value, HASH_UNDEFINED$2);
  return this;
}

/**
 * Checks if `value` is in the array cache.
 *
 * @private
 * @name has
 * @memberOf SetCache
 * @param {*} value The value to search for.
 * @returns {number} Returns `true` if `value` is found, else `false`.
 */
function setCacheHas(value) {
  return this.__data__.has(value);
}

/**
 *
 * Creates an array cache object to store unique values.
 *
 * @private
 * @constructor
 * @param {Array} [values] The values to cache.
 */
function SetCache(values) {
  var index = -1,
      length = values == null ? 0 : values.length;

  this.__data__ = new MapCache();
  while (++index < length) {
    this.add(values[index]);
  }
}

// Add methods to `SetCache`.
SetCache.prototype.add = SetCache.prototype.push = setCacheAdd;
SetCache.prototype.has = setCacheHas;

/**
 * A specialized version of `_.some` for arrays without support for iteratee
 * shorthands.
 *
 * @private
 * @param {Array} [array] The array to iterate over.
 * @param {Function} predicate The function invoked per iteration.
 * @returns {boolean} Returns `true` if any element passes the predicate check,
 *  else `false`.
 */
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

/**
 * Checks if a `cache` value for `key` exists.
 *
 * @private
 * @param {Object} cache The cache to query.
 * @param {string} key The key of the entry to check.
 * @returns {boolean} Returns `true` if an entry for `key` exists, else `false`.
 */
function cacheHas(cache, key) {
  return cache.has(key);
}

/** Used to compose bitmasks for value comparisons. */
var COMPARE_PARTIAL_FLAG$2 = 1;
var COMPARE_UNORDERED_FLAG$1 = 2;

/**
 * A specialized version of `baseIsEqualDeep` for arrays with support for
 * partial deep comparisons.
 *
 * @private
 * @param {Array} array The array to compare.
 * @param {Array} other The other array to compare.
 * @param {number} bitmask The bitmask flags. See `baseIsEqual` for more details.
 * @param {Function} customizer The function to customize comparisons.
 * @param {Function} equalFunc The function to determine equivalents of values.
 * @param {Object} stack Tracks traversed `array` and `other` objects.
 * @returns {boolean} Returns `true` if the arrays are equivalent, else `false`.
 */
function equalArrays(array, other, bitmask, customizer, equalFunc, stack) {
  var isPartial = bitmask & COMPARE_PARTIAL_FLAG$2,
      arrLength = array.length,
      othLength = other.length;

  if (arrLength != othLength && !(isPartial && othLength > arrLength)) {
    return false;
  }
  // Assume cyclic values are equal.
  var stacked = stack.get(array);
  if (stacked && stack.get(other)) {
    return stacked == other;
  }
  var index = -1,
      result = true,
      seen = bitmask & COMPARE_UNORDERED_FLAG$1 ? new SetCache() : undefined;

  stack.set(array, other);
  stack.set(other, array);

  // Ignore non-index properties.
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
    // Recursively compare arrays (susceptible to call stack limits).
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

/** Built-in value references. */
var Uint8Array$1 = root.Uint8Array;

/**
 * Converts `map` to its key-value pairs.
 *
 * @private
 * @param {Object} map The map to convert.
 * @returns {Array} Returns the key-value pairs.
 */
function mapToArray(map) {
  var index = -1,
      result = Array(map.size);

  map.forEach(function (value, key) {
    result[++index] = [key, value];
  });
  return result;
}

/**
 * Converts `set` to an array of its values.
 *
 * @private
 * @param {Object} set The set to convert.
 * @returns {Array} Returns the values.
 */
function setToArray(set) {
  var index = -1,
      result = Array(set.size);

  set.forEach(function (value) {
    result[++index] = value;
  });
  return result;
}

/** Used to compose bitmasks for value comparisons. */
var COMPARE_PARTIAL_FLAG$3 = 1;
var COMPARE_UNORDERED_FLAG$2 = 2;

/** `Object#toString` result references. */
var boolTag = '[object Boolean]';
var dateTag = '[object Date]';
var errorTag = '[object Error]';
var mapTag = '[object Map]';
var numberTag = '[object Number]';
var regexpTag = '[object RegExp]';
var setTag = '[object Set]';
var stringTag = '[object String]';
var symbolTag = '[object Symbol]';

var arrayBufferTag = '[object ArrayBuffer]';
var dataViewTag = '[object DataView]';

/** Used to convert symbols to primitives and strings. */
var symbolProto = _Symbol ? _Symbol.prototype : undefined;
var symbolValueOf = symbolProto ? symbolProto.valueOf : undefined;

/**
 * A specialized version of `baseIsEqualDeep` for comparing objects of
 * the same `toStringTag`.
 *
 * **Note:** This function only supports comparing values with tags of
 * `Boolean`, `Date`, `Error`, `Number`, `RegExp`, or `String`.
 *
 * @private
 * @param {Object} object The object to compare.
 * @param {Object} other The other object to compare.
 * @param {string} tag The `toStringTag` of the objects to compare.
 * @param {number} bitmask The bitmask flags. See `baseIsEqual` for more details.
 * @param {Function} customizer The function to customize comparisons.
 * @param {Function} equalFunc The function to determine equivalents of values.
 * @param {Object} stack Tracks traversed `object` and `other` objects.
 * @returns {boolean} Returns `true` if the objects are equivalent, else `false`.
 */
function equalByTag(object, other, tag, bitmask, customizer, equalFunc, stack) {
  switch (tag) {
    case dataViewTag:
      if (object.byteLength != other.byteLength || object.byteOffset != other.byteOffset) {
        return false;
      }
      object = object.buffer;
      other = other.buffer;

    case arrayBufferTag:
      if (object.byteLength != other.byteLength || !equalFunc(new Uint8Array$1(object), new Uint8Array$1(other))) {
        return false;
      }
      return true;

    case boolTag:
    case dateTag:
    case numberTag:
      // Coerce booleans to `1` or `0` and dates to milliseconds.
      // Invalid dates are coerced to `NaN`.
      return eq(+object, +other);

    case errorTag:
      return object.name == other.name && object.message == other.message;

    case regexpTag:
    case stringTag:
      // Coerce regexes to strings and treat strings, primitives and objects,
      // as equal. See http://www.ecma-international.org/ecma-262/7.0/#sec-regexp.prototype.tostring
      // for more details.
      return object == other + '';

    case mapTag:
      var convert = mapToArray;

    case setTag:
      var isPartial = bitmask & COMPARE_PARTIAL_FLAG$3;
      convert || (convert = setToArray);

      if (object.size != other.size && !isPartial) {
        return false;
      }
      // Assume cyclic values are equal.
      var stacked = stack.get(object);
      if (stacked) {
        return stacked == other;
      }
      bitmask |= COMPARE_UNORDERED_FLAG$2;

      // Recursively compare objects (susceptible to call stack limits).
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

/**
 * Appends the elements of `values` to `array`.
 *
 * @private
 * @param {Array} array The array to modify.
 * @param {Array} values The values to append.
 * @returns {Array} Returns `array`.
 */
function arrayPush(array, values) {
  var index = -1,
      length = values.length,
      offset = array.length;

  while (++index < length) {
    array[offset + index] = values[index];
  }
  return array;
}

/**
 * Checks if `value` is classified as an `Array` object.
 *
 * @static
 * @memberOf _
 * @since 0.1.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is an array, else `false`.
 * @example
 *
 * _.isArray([1, 2, 3]);
 * // => true
 *
 * _.isArray(document.body.children);
 * // => false
 *
 * _.isArray('abc');
 * // => false
 *
 * _.isArray(_.noop);
 * // => false
 */
var isArray = Array.isArray;

/**
 * The base implementation of `getAllKeys` and `getAllKeysIn` which uses
 * `keysFunc` and `symbolsFunc` to get the enumerable property names and
 * symbols of `object`.
 *
 * @private
 * @param {Object} object The object to query.
 * @param {Function} keysFunc The function to get the keys of `object`.
 * @param {Function} symbolsFunc The function to get the symbols of `object`.
 * @returns {Array} Returns the array of property names and symbols.
 */
function baseGetAllKeys(object, keysFunc, symbolsFunc) {
  var result = keysFunc(object);
  return isArray(object) ? result : arrayPush(result, symbolsFunc(object));
}

/**
 * A specialized version of `_.filter` for arrays without support for
 * iteratee shorthands.
 *
 * @private
 * @param {Array} [array] The array to iterate over.
 * @param {Function} predicate The function invoked per iteration.
 * @returns {Array} Returns the new filtered array.
 */
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

/**
 * This method returns a new empty array.
 *
 * @static
 * @memberOf _
 * @since 4.13.0
 * @category Util
 * @returns {Array} Returns the new empty array.
 * @example
 *
 * var arrays = _.times(2, _.stubArray);
 *
 * console.log(arrays);
 * // => [[], []]
 *
 * console.log(arrays[0] === arrays[1]);
 * // => false
 */
function stubArray() {
  return [];
}

/** Used for built-in method references. */
var objectProto$7 = Object.prototype;

/** Built-in value references. */
var propertyIsEnumerable = objectProto$7.propertyIsEnumerable;

/* Built-in method references for those with the same name as other `lodash` methods. */
var nativeGetSymbols = Object.getOwnPropertySymbols;

/**
 * Creates an array of the own enumerable symbols of `object`.
 *
 * @private
 * @param {Object} object The object to query.
 * @returns {Array} Returns the array of symbols.
 */
var getSymbols = !nativeGetSymbols ? stubArray : function (object) {
  if (object == null) {
    return [];
  }
  object = Object(object);
  return arrayFilter(nativeGetSymbols(object), function (symbol) {
    return propertyIsEnumerable.call(object, symbol);
  });
};

/**
 * The base implementation of `_.times` without support for iteratee shorthands
 * or max array length checks.
 *
 * @private
 * @param {number} n The number of times to invoke `iteratee`.
 * @param {Function} iteratee The function invoked per iteration.
 * @returns {Array} Returns the array of results.
 */
function baseTimes(n, iteratee) {
  var index = -1,
      result = Array(n);

  while (++index < n) {
    result[index] = iteratee(index);
  }
  return result;
}

/**
 * Checks if `value` is object-like. A value is object-like if it's not `null`
 * and has a `typeof` result of "object".
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is object-like, else `false`.
 * @example
 *
 * _.isObjectLike({});
 * // => true
 *
 * _.isObjectLike([1, 2, 3]);
 * // => true
 *
 * _.isObjectLike(_.noop);
 * // => false
 *
 * _.isObjectLike(null);
 * // => false
 */
function isObjectLike(value) {
  return value != null && (typeof value === 'undefined' ? 'undefined' : _typeof(value)) == 'object';
}

/** `Object#toString` result references. */
var argsTag$1 = '[object Arguments]';

/**
 * The base implementation of `_.isArguments`.
 *
 * @private
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is an `arguments` object,
 */
function baseIsArguments(value) {
  return isObjectLike(value) && baseGetTag(value) == argsTag$1;
}

/** Used for built-in method references. */
var objectProto$9 = Object.prototype;

/** Used to check objects for own properties. */
var hasOwnProperty$7 = objectProto$9.hasOwnProperty;

/** Built-in value references. */
var propertyIsEnumerable$1 = objectProto$9.propertyIsEnumerable;

/**
 * Checks if `value` is likely an `arguments` object.
 *
 * @static
 * @memberOf _
 * @since 0.1.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is an `arguments` object,
 *  else `false`.
 * @example
 *
 * _.isArguments(function() { return arguments; }());
 * // => true
 *
 * _.isArguments([1, 2, 3]);
 * // => false
 */
var isArguments = baseIsArguments(function () {
  return arguments;
}()) ? baseIsArguments : function (value) {
  return isObjectLike(value) && hasOwnProperty$7.call(value, 'callee') && !propertyIsEnumerable$1.call(value, 'callee');
};

/**
 * This method returns `false`.
 *
 * @static
 * @memberOf _
 * @since 4.13.0
 * @category Util
 * @returns {boolean} Returns `false`.
 * @example
 *
 * _.times(2, _.stubFalse);
 * // => [false, false]
 */
function stubFalse() {
  return false;
}

/** Detect free variable `exports`. */
var freeExports = (typeof exports === 'undefined' ? 'undefined' : _typeof(exports)) == 'object' && exports && !exports.nodeType && exports;

/** Detect free variable `module`. */
var freeModule = freeExports && (typeof module === 'undefined' ? 'undefined' : _typeof(module)) == 'object' && module && !module.nodeType && module;

/** Detect the popular CommonJS extension `module.exports`. */
var moduleExports = freeModule && freeModule.exports === freeExports;

/** Built-in value references. */
var Buffer = moduleExports ? root.Buffer : undefined;

/* Built-in method references for those with the same name as other `lodash` methods. */
var nativeIsBuffer = Buffer ? Buffer.isBuffer : undefined;

/**
 * Checks if `value` is a buffer.
 *
 * @static
 * @memberOf _
 * @since 4.3.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a buffer, else `false`.
 * @example
 *
 * _.isBuffer(new Buffer(2));
 * // => true
 *
 * _.isBuffer(new Uint8Array(2));
 * // => false
 */
var isBuffer = nativeIsBuffer || stubFalse;

/** Used as references for various `Number` constants. */
var MAX_SAFE_INTEGER = 9007199254740991;

/** Used to detect unsigned integer values. */
var reIsUint = /^(?:0|[1-9]\d*)$/;

/**
 * Checks if `value` is a valid array-like index.
 *
 * @private
 * @param {*} value The value to check.
 * @param {number} [length=MAX_SAFE_INTEGER] The upper bounds of a valid index.
 * @returns {boolean} Returns `true` if `value` is a valid index, else `false`.
 */
function isIndex(value, length) {
  length = length == null ? MAX_SAFE_INTEGER : length;
  return !!length && (typeof value == 'number' || reIsUint.test(value)) && value > -1 && value % 1 == 0 && value < length;
}

/** Used as references for various `Number` constants. */
var MAX_SAFE_INTEGER$1 = 9007199254740991;

/**
 * Checks if `value` is a valid array-like length.
 *
 * **Note:** This method is loosely based on
 * [`ToLength`](http://ecma-international.org/ecma-262/7.0/#sec-tolength).
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a valid length, else `false`.
 * @example
 *
 * _.isLength(3);
 * // => true
 *
 * _.isLength(Number.MIN_VALUE);
 * // => false
 *
 * _.isLength(Infinity);
 * // => false
 *
 * _.isLength('3');
 * // => false
 */
function isLength(value) {
  return typeof value == 'number' && value > -1 && value % 1 == 0 && value <= MAX_SAFE_INTEGER$1;
}

/** `Object#toString` result references. */
var argsTag$2 = '[object Arguments]';
var arrayTag$1 = '[object Array]';
var boolTag$1 = '[object Boolean]';
var dateTag$1 = '[object Date]';
var errorTag$1 = '[object Error]';
var funcTag$1 = '[object Function]';
var mapTag$1 = '[object Map]';
var numberTag$1 = '[object Number]';
var objectTag$1 = '[object Object]';
var regexpTag$1 = '[object RegExp]';
var setTag$1 = '[object Set]';
var stringTag$1 = '[object String]';
var weakMapTag = '[object WeakMap]';

var arrayBufferTag$1 = '[object ArrayBuffer]';
var dataViewTag$1 = '[object DataView]';
var float32Tag = '[object Float32Array]';
var float64Tag = '[object Float64Array]';
var int8Tag = '[object Int8Array]';
var int16Tag = '[object Int16Array]';
var int32Tag = '[object Int32Array]';
var uint8Tag = '[object Uint8Array]';
var uint8ClampedTag = '[object Uint8ClampedArray]';
var uint16Tag = '[object Uint16Array]';
var uint32Tag = '[object Uint32Array]';

/** Used to identify `toStringTag` values of typed arrays. */
var typedArrayTags = {};
typedArrayTags[float32Tag] = typedArrayTags[float64Tag] = typedArrayTags[int8Tag] = typedArrayTags[int16Tag] = typedArrayTags[int32Tag] = typedArrayTags[uint8Tag] = typedArrayTags[uint8ClampedTag] = typedArrayTags[uint16Tag] = typedArrayTags[uint32Tag] = true;
typedArrayTags[argsTag$2] = typedArrayTags[arrayTag$1] = typedArrayTags[arrayBufferTag$1] = typedArrayTags[boolTag$1] = typedArrayTags[dataViewTag$1] = typedArrayTags[dateTag$1] = typedArrayTags[errorTag$1] = typedArrayTags[funcTag$1] = typedArrayTags[mapTag$1] = typedArrayTags[numberTag$1] = typedArrayTags[objectTag$1] = typedArrayTags[regexpTag$1] = typedArrayTags[setTag$1] = typedArrayTags[stringTag$1] = typedArrayTags[weakMapTag] = false;

/**
 * The base implementation of `_.isTypedArray` without Node.js optimizations.
 *
 * @private
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a typed array, else `false`.
 */
function baseIsTypedArray(value) {
    return isObjectLike(value) && isLength(value.length) && !!typedArrayTags[baseGetTag(value)];
}

/**
 * The base implementation of `_.unary` without support for storing metadata.
 *
 * @private
 * @param {Function} func The function to cap arguments for.
 * @returns {Function} Returns the new capped function.
 */
function baseUnary(func) {
  return function (value) {
    return func(value);
  };
}

/** Detect free variable `exports`. */
var freeExports$1 = (typeof exports === 'undefined' ? 'undefined' : _typeof(exports)) == 'object' && exports && !exports.nodeType && exports;

/** Detect free variable `module`. */
var freeModule$1 = freeExports$1 && (typeof module === 'undefined' ? 'undefined' : _typeof(module)) == 'object' && module && !module.nodeType && module;

/** Detect the popular CommonJS extension `module.exports`. */
var moduleExports$1 = freeModule$1 && freeModule$1.exports === freeExports$1;

/** Detect free variable `process` from Node.js. */
var freeProcess = moduleExports$1 && freeGlobal.process;

/** Used to access faster Node.js helpers. */
var nodeUtil = function () {
  try {
    return freeProcess && freeProcess.binding && freeProcess.binding('util');
  } catch (e) {}
}();

/* Node.js helper references. */
var nodeIsTypedArray = nodeUtil && nodeUtil.isTypedArray;

/**
 * Checks if `value` is classified as a typed array.
 *
 * @static
 * @memberOf _
 * @since 3.0.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a typed array, else `false`.
 * @example
 *
 * _.isTypedArray(new Uint8Array);
 * // => true
 *
 * _.isTypedArray([]);
 * // => false
 */
var isTypedArray = nodeIsTypedArray ? baseUnary(nodeIsTypedArray) : baseIsTypedArray;

/** Used for built-in method references. */
var objectProto$8 = Object.prototype;

/** Used to check objects for own properties. */
var hasOwnProperty$6 = objectProto$8.hasOwnProperty;

/**
 * Creates an array of the enumerable property names of the array-like `value`.
 *
 * @private
 * @param {*} value The value to query.
 * @param {boolean} inherited Specify returning inherited property names.
 * @returns {Array} Returns the array of property names.
 */
function arrayLikeKeys(value, inherited) {
  var isArr = isArray(value),
      isArg = !isArr && isArguments(value),
      isBuff = !isArr && !isArg && isBuffer(value),
      isType = !isArr && !isArg && !isBuff && isTypedArray(value),
      skipIndexes = isArr || isArg || isBuff || isType,
      result = skipIndexes ? baseTimes(value.length, String) : [],
      length = result.length;

  for (var key in value) {
    if ((inherited || hasOwnProperty$6.call(value, key)) && !(skipIndexes && (
    // Safari 9 has enumerable `arguments.length` in strict mode.
    key == 'length' ||
    // Node.js 0.10 has enumerable non-index properties on buffers.
    isBuff && (key == 'offset' || key == 'parent') ||
    // PhantomJS 2 has enumerable non-index properties on typed arrays.
    isType && (key == 'buffer' || key == 'byteLength' || key == 'byteOffset') ||
    // Skip index properties.
    isIndex(key, length)))) {
      result.push(key);
    }
  }
  return result;
}

/** Used for built-in method references. */
var objectProto$11 = Object.prototype;

/**
 * Checks if `value` is likely a prototype object.
 *
 * @private
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a prototype, else `false`.
 */
function isPrototype(value) {
  var Ctor = value && value.constructor,
      proto = typeof Ctor == 'function' && Ctor.prototype || objectProto$11;

  return value === proto;
}

/**
 * Creates a unary function that invokes `func` with its argument transformed.
 *
 * @private
 * @param {Function} func The function to wrap.
 * @param {Function} transform The argument transform.
 * @returns {Function} Returns the new function.
 */
function overArg(func, transform) {
  return function (arg) {
    return func(transform(arg));
  };
}

/* Built-in method references for those with the same name as other `lodash` methods. */
var nativeKeys = overArg(Object.keys, Object);

/** Used for built-in method references. */
var objectProto$10 = Object.prototype;

/** Used to check objects for own properties. */
var hasOwnProperty$8 = objectProto$10.hasOwnProperty;

/**
 * The base implementation of `_.keys` which doesn't treat sparse arrays as dense.
 *
 * @private
 * @param {Object} object The object to query.
 * @returns {Array} Returns the array of property names.
 */
function baseKeys(object) {
  if (!isPrototype(object)) {
    return nativeKeys(object);
  }
  var result = [];
  for (var key in Object(object)) {
    if (hasOwnProperty$8.call(object, key) && key != 'constructor') {
      result.push(key);
    }
  }
  return result;
}

/**
 * Checks if `value` is array-like. A value is considered array-like if it's
 * not a function and has a `value.length` that's an integer greater than or
 * equal to `0` and less than or equal to `Number.MAX_SAFE_INTEGER`.
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is array-like, else `false`.
 * @example
 *
 * _.isArrayLike([1, 2, 3]);
 * // => true
 *
 * _.isArrayLike(document.body.children);
 * // => true
 *
 * _.isArrayLike('abc');
 * // => true
 *
 * _.isArrayLike(_.noop);
 * // => false
 */
function isArrayLike(value) {
  return value != null && isLength(value.length) && !isFunction(value);
}

/**
 * Creates an array of the own enumerable property names of `object`.
 *
 * **Note:** Non-object values are coerced to objects. See the
 * [ES spec](http://ecma-international.org/ecma-262/7.0/#sec-object.keys)
 * for more details.
 *
 * @static
 * @since 0.1.0
 * @memberOf _
 * @category Object
 * @param {Object} object The object to query.
 * @returns {Array} Returns the array of property names.
 * @example
 *
 * function Foo() {
 *   this.a = 1;
 *   this.b = 2;
 * }
 *
 * Foo.prototype.c = 3;
 *
 * _.keys(new Foo);
 * // => ['a', 'b'] (iteration order is not guaranteed)
 *
 * _.keys('hi');
 * // => ['0', '1']
 */
function keys(object) {
  return isArrayLike(object) ? arrayLikeKeys(object) : baseKeys(object);
}

/**
 * Creates an array of own enumerable property names and symbols of `object`.
 *
 * @private
 * @param {Object} object The object to query.
 * @returns {Array} Returns the array of property names and symbols.
 */
function getAllKeys(object) {
  return baseGetAllKeys(object, keys, getSymbols);
}

/** Used to compose bitmasks for value comparisons. */
var COMPARE_PARTIAL_FLAG$4 = 1;

/** Used for built-in method references. */
var objectProto$6 = Object.prototype;

/** Used to check objects for own properties. */
var hasOwnProperty$5 = objectProto$6.hasOwnProperty;

/**
 * A specialized version of `baseIsEqualDeep` for objects with support for
 * partial deep comparisons.
 *
 * @private
 * @param {Object} object The object to compare.
 * @param {Object} other The other object to compare.
 * @param {number} bitmask The bitmask flags. See `baseIsEqual` for more details.
 * @param {Function} customizer The function to customize comparisons.
 * @param {Function} equalFunc The function to determine equivalents of values.
 * @param {Object} stack Tracks traversed `object` and `other` objects.
 * @returns {boolean} Returns `true` if the objects are equivalent, else `false`.
 */
function equalObjects(object, other, bitmask, customizer, equalFunc, stack) {
  var isPartial = bitmask & COMPARE_PARTIAL_FLAG$4,
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
    if (!(isPartial ? key in other : hasOwnProperty$5.call(other, key))) {
      return false;
    }
  }
  // Assume cyclic values are equal.
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
    // Recursively compare objects (susceptible to call stack limits).
    if (!(compared === undefined ? objValue === othValue || equalFunc(objValue, othValue, bitmask, customizer, stack) : compared)) {
      result = false;
      break;
    }
    skipCtor || (skipCtor = key == 'constructor');
  }
  if (result && !skipCtor) {
    var objCtor = object.constructor,
        othCtor = other.constructor;

    // Non `Object` object instances with different constructors are not equal.
    if (objCtor != othCtor && 'constructor' in object && 'constructor' in other && !(typeof objCtor == 'function' && objCtor instanceof objCtor && typeof othCtor == 'function' && othCtor instanceof othCtor)) {
      result = false;
    }
  }
  stack['delete'](object);
  stack['delete'](other);
  return result;
}

/* Built-in method references that are verified to be native. */
var DataView = getNative(root, 'DataView');

/* Built-in method references that are verified to be native. */
var Promise$1 = getNative(root, 'Promise');

/* Built-in method references that are verified to be native. */
var Set = getNative(root, 'Set');

/* Built-in method references that are verified to be native. */
var WeakMap = getNative(root, 'WeakMap');

/** `Object#toString` result references. */
var mapTag$2 = '[object Map]';
var objectTag$2 = '[object Object]';
var promiseTag = '[object Promise]';
var setTag$2 = '[object Set]';
var weakMapTag$1 = '[object WeakMap]';

var dataViewTag$2 = '[object DataView]';

/** Used to detect maps, sets, and weakmaps. */
var dataViewCtorString = toSource(DataView);
var mapCtorString = toSource(Map$1);
var promiseCtorString = toSource(Promise$1);
var setCtorString = toSource(Set);
var weakMapCtorString = toSource(WeakMap);

/**
 * Gets the `toStringTag` of `value`.
 *
 * @private
 * @param {*} value The value to query.
 * @returns {string} Returns the `toStringTag`.
 */
var getTag = baseGetTag;

// Fallback for data views, maps, sets, and weak maps in IE 11 and promises in Node.js < 6.
if (DataView && getTag(new DataView(new ArrayBuffer(1))) != dataViewTag$2 || Map$1 && getTag(new Map$1()) != mapTag$2 || Promise$1 && getTag(Promise$1.resolve()) != promiseTag || Set && getTag(new Set()) != setTag$2 || WeakMap && getTag(new WeakMap()) != weakMapTag$1) {
    getTag = function getTag(value) {
        var result = baseGetTag(value),
            Ctor = result == objectTag$2 ? value.constructor : undefined,
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

/** Used to compose bitmasks for value comparisons. */
var COMPARE_PARTIAL_FLAG$1 = 1;

/** `Object#toString` result references. */
var argsTag = '[object Arguments]';
var arrayTag = '[object Array]';
var objectTag = '[object Object]';

/** Used for built-in method references. */
var objectProto$5 = Object.prototype;

/** Used to check objects for own properties. */
var hasOwnProperty$4 = objectProto$5.hasOwnProperty;

/**
 * A specialized version of `baseIsEqual` for arrays and objects which performs
 * deep comparisons and tracks traversed objects enabling objects with circular
 * references to be compared.
 *
 * @private
 * @param {Object} object The object to compare.
 * @param {Object} other The other object to compare.
 * @param {number} bitmask The bitmask flags. See `baseIsEqual` for more details.
 * @param {Function} customizer The function to customize comparisons.
 * @param {Function} equalFunc The function to determine equivalents of values.
 * @param {Object} [stack] Tracks traversed `object` and `other` objects.
 * @returns {boolean} Returns `true` if the objects are equivalent, else `false`.
 */
function baseIsEqualDeep(object, other, bitmask, customizer, equalFunc, stack) {
  var objIsArr = isArray(object),
      othIsArr = isArray(other),
      objTag = objIsArr ? arrayTag : getTag$1(object),
      othTag = othIsArr ? arrayTag : getTag$1(other);

  objTag = objTag == argsTag ? objectTag : objTag;
  othTag = othTag == argsTag ? objectTag : othTag;

  var objIsObj = objTag == objectTag,
      othIsObj = othTag == objectTag,
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
  if (!(bitmask & COMPARE_PARTIAL_FLAG$1)) {
    var objIsWrapped = objIsObj && hasOwnProperty$4.call(object, '__wrapped__'),
        othIsWrapped = othIsObj && hasOwnProperty$4.call(other, '__wrapped__');

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

/**
 * The base implementation of `_.isEqual` which supports partial comparisons
 * and tracks traversed objects.
 *
 * @private
 * @param {*} value The value to compare.
 * @param {*} other The other value to compare.
 * @param {boolean} bitmask The bitmask flags.
 *  1 - Unordered comparison
 *  2 - Partial comparison
 * @param {Function} [customizer] The function to customize comparisons.
 * @param {Object} [stack] Tracks traversed `value` and `other` objects.
 * @returns {boolean} Returns `true` if the values are equivalent, else `false`.
 */
function baseIsEqual(value, other, bitmask, customizer, stack) {
  if (value === other) {
    return true;
  }
  if (value == null || other == null || !isObjectLike(value) && !isObjectLike(other)) {
    return value !== value && other !== other;
  }
  return baseIsEqualDeep(value, other, bitmask, customizer, baseIsEqual, stack);
}

/** Used to compose bitmasks for value comparisons. */
var COMPARE_PARTIAL_FLAG = 1;
var COMPARE_UNORDERED_FLAG = 2;

/**
 * The base implementation of `_.isMatch` without support for iteratee shorthands.
 *
 * @private
 * @param {Object} object The object to inspect.
 * @param {Object} source The object of property values to match.
 * @param {Array} matchData The property names, values, and compare flags to match.
 * @param {Function} [customizer] The function to customize comparisons.
 * @returns {boolean} Returns `true` if `object` is a match, else `false`.
 */
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
      if (!(result === undefined ? baseIsEqual(srcValue, objValue, COMPARE_PARTIAL_FLAG | COMPARE_UNORDERED_FLAG, customizer, stack) : result)) {
        return false;
      }
    }
  }
  return true;
}

/**
 * Checks if `value` is suitable for strict equality comparisons, i.e. `===`.
 *
 * @private
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` if suitable for strict
 *  equality comparisons, else `false`.
 */
function isStrictComparable(value) {
  return value === value && !isObject(value);
}

/**
 * Gets the property names, values, and compare flags of `object`.
 *
 * @private
 * @param {Object} object The object to query.
 * @returns {Array} Returns the match data of `object`.
 */
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

/**
 * A specialized version of `matchesProperty` for source values suitable
 * for strict equality comparisons, i.e. `===`.
 *
 * @private
 * @param {string} key The key of the property to get.
 * @param {*} srcValue The value to match.
 * @returns {Function} Returns the new spec function.
 */
function matchesStrictComparable(key, srcValue) {
  return function (object) {
    if (object == null) {
      return false;
    }
    return object[key] === srcValue && (srcValue !== undefined || key in Object(object));
  };
}

/**
 * The base implementation of `_.matches` which doesn't clone `source`.
 *
 * @private
 * @param {Object} source The object of property values to match.
 * @returns {Function} Returns the new spec function.
 */
function baseMatches(source) {
  var matchData = getMatchData(source);
  if (matchData.length == 1 && matchData[0][2]) {
    return matchesStrictComparable(matchData[0][0], matchData[0][1]);
  }
  return function (object) {
    return object === source || baseIsMatch(object, source, matchData);
  };
}

/** `Object#toString` result references. */
var symbolTag$1 = '[object Symbol]';

/**
 * Checks if `value` is classified as a `Symbol` primitive or object.
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a symbol, else `false`.
 * @example
 *
 * _.isSymbol(Symbol.iterator);
 * // => true
 *
 * _.isSymbol('abc');
 * // => false
 */
function isSymbol(value) {
  return (typeof value === 'undefined' ? 'undefined' : _typeof(value)) == 'symbol' || isObjectLike(value) && baseGetTag(value) == symbolTag$1;
}

/** Used to match property names within property paths. */
var reIsDeepProp = /\.|\[(?:[^[\]]*|(["'])(?:(?!\1)[^\\]|\\.)*?\1)\]/;
var reIsPlainProp = /^\w*$/;

/**
 * Checks if `value` is a property name and not a property path.
 *
 * @private
 * @param {*} value The value to check.
 * @param {Object} [object] The object to query keys on.
 * @returns {boolean} Returns `true` if `value` is a property name, else `false`.
 */
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

/** Error message constants. */
var FUNC_ERROR_TEXT = 'Expected a function';

/**
 * Creates a function that memoizes the result of `func`. If `resolver` is
 * provided, it determines the cache key for storing the result based on the
 * arguments provided to the memoized function. By default, the first argument
 * provided to the memoized function is used as the map cache key. The `func`
 * is invoked with the `this` binding of the memoized function.
 *
 * **Note:** The cache is exposed as the `cache` property on the memoized
 * function. Its creation may be customized by replacing the `_.memoize.Cache`
 * constructor with one whose instances implement the
 * [`Map`](http://ecma-international.org/ecma-262/7.0/#sec-properties-of-the-map-prototype-object)
 * method interface of `clear`, `delete`, `get`, `has`, and `set`.
 *
 * @static
 * @memberOf _
 * @since 0.1.0
 * @category Function
 * @param {Function} func The function to have its output memoized.
 * @param {Function} [resolver] The function to resolve the cache key.
 * @returns {Function} Returns the new memoized function.
 * @example
 *
 * var object = { 'a': 1, 'b': 2 };
 * var other = { 'c': 3, 'd': 4 };
 *
 * var values = _.memoize(_.values);
 * values(object);
 * // => [1, 2]
 *
 * values(other);
 * // => [3, 4]
 *
 * object.a = 2;
 * values(object);
 * // => [1, 2]
 *
 * // Modify the result cache.
 * values.cache.set(object, ['a', 'b']);
 * values(object);
 * // => ['a', 'b']
 *
 * // Replace `_.memoize.Cache`.
 * _.memoize.Cache = WeakMap;
 */
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

// Expose `MapCache`.
memoize.Cache = MapCache;

/** Used as the maximum memoize cache size. */
var MAX_MEMOIZE_SIZE = 500;

/**
 * A specialized version of `_.memoize` which clears the memoized function's
 * cache when it exceeds `MAX_MEMOIZE_SIZE`.
 *
 * @private
 * @param {Function} func The function to have its output memoized.
 * @returns {Function} Returns the new memoized function.
 */
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

/** Used to match property names within property paths. */
var reLeadingDot = /^\./;
var rePropName = /[^.[\]]+|\[(?:(-?\d+(?:\.\d+)?)|(["'])((?:(?!\2)[^\\]|\\.)*?)\2)\]|(?=(?:\.|\[\])(?:\.|\[\]|$))/g;

/** Used to match backslashes in property paths. */
var reEscapeChar = /\\(\\)?/g;

/**
 * Converts `string` to a property path array.
 *
 * @private
 * @param {string} string The string to convert.
 * @returns {Array} Returns the property path array.
 */
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

/** Used as references for various `Number` constants. */
var INFINITY = 1 / 0;

/** Used to convert symbols to primitives and strings. */
var symbolProto$1 = _Symbol ? _Symbol.prototype : undefined;
var symbolToString = symbolProto$1 ? symbolProto$1.toString : undefined;

/**
 * The base implementation of `_.toString` which doesn't convert nullish
 * values to empty strings.
 *
 * @private
 * @param {*} value The value to process.
 * @returns {string} Returns the string.
 */
function baseToString(value) {
  // Exit early for strings to avoid a performance hit in some environments.
  if (typeof value == 'string') {
    return value;
  }
  if (isArray(value)) {
    // Recursively convert values (susceptible to call stack limits).
    return arrayMap(value, baseToString) + '';
  }
  if (isSymbol(value)) {
    return symbolToString ? symbolToString.call(value) : '';
  }
  var result = value + '';
  return result == '0' && 1 / value == -INFINITY ? '-0' : result;
}

/**
 * Converts `value` to a string. An empty string is returned for `null`
 * and `undefined` values. The sign of `-0` is preserved.
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Lang
 * @param {*} value The value to convert.
 * @returns {string} Returns the converted string.
 * @example
 *
 * _.toString(null);
 * // => ''
 *
 * _.toString(-0);
 * // => '-0'
 *
 * _.toString([1, 2, 3]);
 * // => '1,2,3'
 */
function toString(value) {
  return value == null ? '' : baseToString(value);
}

/**
 * Casts `value` to a path array if it's not one.
 *
 * @private
 * @param {*} value The value to inspect.
 * @param {Object} [object] The object to query keys on.
 * @returns {Array} Returns the cast property path array.
 */
function castPath(value, object) {
  if (isArray(value)) {
    return value;
  }
  return isKey(value, object) ? [value] : stringToPath(toString(value));
}

/** Used as references for various `Number` constants. */
var INFINITY$1 = 1 / 0;

/**
 * Converts `value` to a string key if it's not a string or symbol.
 *
 * @private
 * @param {*} value The value to inspect.
 * @returns {string|symbol} Returns the key.
 */
function toKey(value) {
  if (typeof value == 'string' || isSymbol(value)) {
    return value;
  }
  var result = value + '';
  return result == '0' && 1 / value == -INFINITY$1 ? '-0' : result;
}

/**
 * The base implementation of `_.get` without support for default values.
 *
 * @private
 * @param {Object} object The object to query.
 * @param {Array|string} path The path of the property to get.
 * @returns {*} Returns the resolved value.
 */
function baseGet(object, path) {
  path = castPath(path, object);

  var index = 0,
      length = path.length;

  while (object != null && index < length) {
    object = object[toKey(path[index++])];
  }
  return index && index == length ? object : undefined;
}

/**
 * Gets the value at `path` of `object`. If the resolved value is
 * `undefined`, the `defaultValue` is returned in its place.
 *
 * @static
 * @memberOf _
 * @since 3.7.0
 * @category Object
 * @param {Object} object The object to query.
 * @param {Array|string} path The path of the property to get.
 * @param {*} [defaultValue] The value returned for `undefined` resolved values.
 * @returns {*} Returns the resolved value.
 * @example
 *
 * var object = { 'a': [{ 'b': { 'c': 3 } }] };
 *
 * _.get(object, 'a[0].b.c');
 * // => 3
 *
 * _.get(object, ['a', '0', 'b', 'c']);
 * // => 3
 *
 * _.get(object, 'a.b.c', 'default');
 * // => 'default'
 */
function get$1(object, path, defaultValue) {
  var result = object == null ? undefined : baseGet(object, path);
  return result === undefined ? defaultValue : result;
}

/**
 * The base implementation of `_.hasIn` without support for deep paths.
 *
 * @private
 * @param {Object} [object] The object to query.
 * @param {Array|string} key The key to check.
 * @returns {boolean} Returns `true` if `key` exists, else `false`.
 */
function baseHasIn(object, key) {
  return object != null && key in Object(object);
}

/**
 * Checks if `path` exists on `object`.
 *
 * @private
 * @param {Object} object The object to query.
 * @param {Array|string} path The path to check.
 * @param {Function} hasFunc The function to check properties.
 * @returns {boolean} Returns `true` if `path` exists, else `false`.
 */
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

/**
 * Checks if `path` is a direct or inherited property of `object`.
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Object
 * @param {Object} object The object to query.
 * @param {Array|string} path The path to check.
 * @returns {boolean} Returns `true` if `path` exists, else `false`.
 * @example
 *
 * var object = _.create({ 'a': _.create({ 'b': 2 }) });
 *
 * _.hasIn(object, 'a');
 * // => true
 *
 * _.hasIn(object, 'a.b');
 * // => true
 *
 * _.hasIn(object, ['a', 'b']);
 * // => true
 *
 * _.hasIn(object, 'b');
 * // => false
 */
function hasIn(object, path) {
  return object != null && hasPath(object, path, baseHasIn);
}

/** Used to compose bitmasks for value comparisons. */
var COMPARE_PARTIAL_FLAG$5 = 1;
var COMPARE_UNORDERED_FLAG$3 = 2;

/**
 * The base implementation of `_.matchesProperty` which doesn't clone `srcValue`.
 *
 * @private
 * @param {string} path The path of the property to get.
 * @param {*} srcValue The value to match.
 * @returns {Function} Returns the new spec function.
 */
function baseMatchesProperty(path, srcValue) {
  if (isKey(path) && isStrictComparable(srcValue)) {
    return matchesStrictComparable(toKey(path), srcValue);
  }
  return function (object) {
    var objValue = get$1(object, path);
    return objValue === undefined && objValue === srcValue ? hasIn(object, path) : baseIsEqual(srcValue, objValue, COMPARE_PARTIAL_FLAG$5 | COMPARE_UNORDERED_FLAG$3);
  };
}

/**
 * This method returns the first argument it receives.
 *
 * @static
 * @since 0.1.0
 * @memberOf _
 * @category Util
 * @param {*} value Any value.
 * @returns {*} Returns `value`.
 * @example
 *
 * var object = { 'a': 1 };
 *
 * console.log(_.identity(object) === object);
 * // => true
 */
function identity(value) {
  return value;
}

/**
 * The base implementation of `_.property` without support for deep paths.
 *
 * @private
 * @param {string} key The key of the property to get.
 * @returns {Function} Returns the new accessor function.
 */
function baseProperty(key) {
  return function (object) {
    return object == null ? undefined : object[key];
  };
}

/**
 * A specialized version of `baseProperty` which supports deep paths.
 *
 * @private
 * @param {Array|string} path The path of the property to get.
 * @returns {Function} Returns the new accessor function.
 */
function basePropertyDeep(path) {
  return function (object) {
    return baseGet(object, path);
  };
}

/**
 * Creates a function that returns the value at `path` of a given object.
 *
 * @static
 * @memberOf _
 * @since 2.4.0
 * @category Util
 * @param {Array|string} path The path of the property to get.
 * @returns {Function} Returns the new accessor function.
 * @example
 *
 * var objects = [
 *   { 'a': { 'b': 2 } },
 *   { 'a': { 'b': 1 } }
 * ];
 *
 * _.map(objects, _.property('a.b'));
 * // => [2, 1]
 *
 * _.map(_.sortBy(objects, _.property(['a', 'b'])), 'a.b');
 * // => [1, 2]
 */
function property(path) {
  return isKey(path) ? baseProperty(toKey(path)) : basePropertyDeep(path);
}

/**
 * The base implementation of `_.iteratee`.
 *
 * @private
 * @param {*} [value=_.identity] The value to convert to an iteratee.
 * @returns {Function} Returns the iteratee.
 */
function baseIteratee(value) {
  // Don't store the `typeof` result in a variable to avoid a JIT bug in Safari 9.
  // See https://bugs.webkit.org/show_bug.cgi?id=156034 for more details.
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

/**
 * Creates a base function for methods like `_.forIn` and `_.forOwn`.
 *
 * @private
 * @param {boolean} [fromRight] Specify iterating from right to left.
 * @returns {Function} Returns the new base function.
 */
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

/**
 * The base implementation of `baseForOwn` which iterates over `object`
 * properties returned by `keysFunc` and invokes `iteratee` for each property.
 * Iteratee functions may exit iteration early by explicitly returning `false`.
 *
 * @private
 * @param {Object} object The object to iterate over.
 * @param {Function} iteratee The function invoked per iteration.
 * @param {Function} keysFunc The function to get the keys of `object`.
 * @returns {Object} Returns `object`.
 */
var baseFor = createBaseFor();

/**
 * The base implementation of `_.forOwn` without support for iteratee shorthands.
 *
 * @private
 * @param {Object} object The object to iterate over.
 * @param {Function} iteratee The function invoked per iteration.
 * @returns {Object} Returns `object`.
 */
function baseForOwn(object, iteratee) {
  return object && baseFor(object, iteratee, keys);
}

/**
 * Creates a `baseEach` or `baseEachRight` function.
 *
 * @private
 * @param {Function} eachFunc The function to iterate over a collection.
 * @param {boolean} [fromRight] Specify iterating from right to left.
 * @returns {Function} Returns the new base function.
 */
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

/**
 * The base implementation of `_.forEach` without support for iteratee shorthands.
 *
 * @private
 * @param {Array|Object} collection The collection to iterate over.
 * @param {Function} iteratee The function invoked per iteration.
 * @returns {Array|Object} Returns `collection`.
 */
var baseEach = createBaseEach(baseForOwn);

/**
 * The base implementation of `_.map` without support for iteratee shorthands.
 *
 * @private
 * @param {Array|Object} collection The collection to iterate over.
 * @param {Function} iteratee The function invoked per iteration.
 * @returns {Array} Returns the new mapped array.
 */
function baseMap(collection, iteratee) {
  var index = -1,
      result = isArrayLike(collection) ? Array(collection.length) : [];

  baseEach(collection, function (value, key, collection) {
    result[++index] = iteratee(value, key, collection);
  });
  return result;
}

/**
 * Creates an array of values by running each element in `collection` thru
 * `iteratee`. The iteratee is invoked with three arguments:
 * (value, index|key, collection).
 *
 * Many lodash methods are guarded to work as iteratees for methods like
 * `_.every`, `_.filter`, `_.map`, `_.mapValues`, `_.reject`, and `_.some`.
 *
 * The guarded methods are:
 * `ary`, `chunk`, `curry`, `curryRight`, `drop`, `dropRight`, `every`,
 * `fill`, `invert`, `parseInt`, `random`, `range`, `rangeRight`, `repeat`,
 * `sampleSize`, `slice`, `some`, `sortBy`, `split`, `take`, `takeRight`,
 * `template`, `trim`, `trimEnd`, `trimStart`, and `words`
 *
 * @static
 * @memberOf _
 * @since 0.1.0
 * @category Collection
 * @param {Array|Object} collection The collection to iterate over.
 * @param {Function} [iteratee=_.identity] The function invoked per iteration.
 * @returns {Array} Returns the new mapped array.
 * @example
 *
 * function square(n) {
 *   return n * n;
 * }
 *
 * _.map([4, 8], square);
 * // => [16, 64]
 *
 * _.map({ 'a': 4, 'b': 8 }, square);
 * // => [16, 64] (iteration order is not guaranteed)
 *
 * var users = [
 *   { 'user': 'barney' },
 *   { 'user': 'fred' }
 * ];
 *
 * // The `_.property` iteratee shorthand.
 * _.map(users, 'user');
 * // => ['barney', 'fred']
 */
function map(collection, iteratee) {
  var func = isArray(collection) ? arrayMap : baseMap;
  return func(collection, baseIteratee(iteratee, 3));
}

/**
 * A specialized version of `_.forEach` for arrays without support for
 * iteratee shorthands.
 *
 * @private
 * @param {Array} [array] The array to iterate over.
 * @param {Function} iteratee The function invoked per iteration.
 * @returns {Array} Returns `array`.
 */
function arrayEach(array, iteratee) {
  var index = -1,
      length = array == null ? 0 : array.length;

  while (++index < length) {
    if (iteratee(array[index], index, array) === false) {
      break;
    }
  }
  return array;
}

/**
 * Casts `value` to `identity` if it's not a function.
 *
 * @private
 * @param {*} value The value to inspect.
 * @returns {Function} Returns cast function.
 */
function castFunction(value) {
  return typeof value == 'function' ? value : identity;
}

/**
 * Iterates over elements of `collection` and invokes `iteratee` for each element.
 * The iteratee is invoked with three arguments: (value, index|key, collection).
 * Iteratee functions may exit iteration early by explicitly returning `false`.
 *
 * **Note:** As with other "Collections" methods, objects with a "length"
 * property are iterated like arrays. To avoid this behavior use `_.forIn`
 * or `_.forOwn` for object iteration.
 *
 * @static
 * @memberOf _
 * @since 0.1.0
 * @alias each
 * @category Collection
 * @param {Array|Object} collection The collection to iterate over.
 * @param {Function} [iteratee=_.identity] The function invoked per iteration.
 * @returns {Array|Object} Returns `collection`.
 * @see _.forEachRight
 * @example
 *
 * _.forEach([1, 2], function(value) {
 *   console.log(value);
 * });
 * // => Logs `1` then `2`.
 *
 * _.forEach({ 'a': 1, 'b': 2 }, function(value, key) {
 *   console.log(key);
 * });
 * // => Logs 'a' then 'b' (iteration order is not guaranteed).
 */
function forEach(collection, iteratee) {
  var func = isArray(collection) ? arrayEach : baseEach;
  return func(collection, castFunction(iteratee));
}

/**
 * Converts a coordinate pair into a {@link google.maps.LatLngLiteral}
 * @param  {Position|google.maps.LatLngLiteral|google.maps.LatLng} position a coordinate pair 
 * @return {google.maps.LatLngLiteral}     a {@link google.maps.LatLngLiteral}
 * @private
 */
function toLatLng(position) {
	if (position instanceof google.maps.LatLng) {
		return {
			lat: position.lat(),
			lng: position.lng()
		};
	} else if (position.lat && position.lng) {
		return position;
	} else {
		return {
			lat: position[1],
			lng: position[0]
		};
	}
}

/**
 * Transforma un array de LatLng en un array de coordenadas [lng,lat]
 * @param {Array.<Position>} arrayLatLng [description]
 * @return {Array.<google.maps.LatLngLiteral>} array of {@link google.maps.LatLngLiteral}
 */
function toLatLngs(coordinates) {
	return map(coordinates, toLatLng);
}

/**
 * Transforms a {@link google.maps.LatLng} or {@link google.maps.LatLngLiteral}
 * @param  {google.maps.LatLng|google.maps.LatLngLiteral|Position} LatLng a coordinate to transform
 * @return {Position}   a coordinate pair
 * @private
 */
function toCoord$1(LatLng) {
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

/**
 * Transforms an array of coordinates to an array of [Lng, Lat]
 * @param {Array.<google.maps.LatLng>|Array.<google.maps.LatLngLiteral>} arrayLatLng Array of {@link google.maps.LatLng} or {@link google.maps.LatLngLiteral}
 * @param {bool} [closeRing=false] optionally, ensure the passed coordinate array forms a closed ring
 * @return {Array.<Position>} an array of {@link Position}
 */
function toCoords(arrayLatLng, closeRing) {

	var ring = map(arrayLatLng, toCoord$1);

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

/**
 * Gets the size of an ASCII `string`.
 *
 * @private
 * @param {string} string The string inspect.
 * @returns {number} Returns the string size.
 */
var asciiSize = baseProperty('length');

/** Used to compose unicode character classes. */

/** Used to compose unicode character classes. */
var rsAstralRange$1 = '\\ud800-\\udfff';
var rsComboMarksRange$1 = '\\u0300-\\u036f';
var reComboHalfMarksRange$1 = '\\ufe20-\\ufe2f';
var rsComboSymbolsRange$1 = '\\u20d0-\\u20ff';
var rsComboRange$1 = rsComboMarksRange$1 + reComboHalfMarksRange$1 + rsComboSymbolsRange$1;
var rsVarRange$1 = '\\ufe0e\\ufe0f';

/** Used to compose unicode capture groups. */
var rsAstral = '[' + rsAstralRange$1 + ']';
var rsCombo = '[' + rsComboRange$1 + ']';
var rsFitz = '\\ud83c[\\udffb-\\udfff]';
var rsModifier = '(?:' + rsCombo + '|' + rsFitz + ')';
var rsNonAstral = '[^' + rsAstralRange$1 + ']';
var rsRegional = '(?:\\ud83c[\\udde6-\\uddff]){2}';
var rsSurrPair = '[\\ud800-\\udbff][\\udc00-\\udfff]';
var rsZWJ$1 = '\\u200d';

/** Used to compose unicode regexes. */
var reOptMod = rsModifier + '?';
var rsOptVar = '[' + rsVarRange$1 + ']?';
var rsOptJoin = '(?:' + rsZWJ$1 + '(?:' + [rsNonAstral, rsRegional, rsSurrPair].join('|') + ')' + rsOptVar + reOptMod + ')*';
var rsSymbol = '(?:' + [rsNonAstral + rsCombo + '?', rsCombo, rsRegional, rsSurrPair, rsAstral].join('|') + ')';

/**
 * A specialized version of `_.reduce` for arrays without support for
 * iteratee shorthands.
 *
 * @private
 * @param {Array} [array] The array to iterate over.
 * @param {Function} iteratee The function invoked per iteration.
 * @param {*} [accumulator] The initial value.
 * @param {boolean} [initAccum] Specify using the first element of `array` as
 *  the initial value.
 * @returns {*} Returns the accumulated value.
 */

/**
 * The base implementation of `_.reduce` and `_.reduceRight`, without support
 * for iteratee shorthands, which iterates over `collection` using `eachFunc`.
 *
 * @private
 * @param {Array|Object} collection The collection to iterate over.
 * @param {Function} iteratee The function invoked per iteration.
 * @param {*} accumulator The initial value.
 * @param {boolean} initAccum Specify using the first or last element of
 *  `collection` as the initial value.
 * @param {Function} eachFunc The function to iterate over `collection`.
 * @returns {*} Returns the accumulated value.
 */

/**
 * Wraps a GeoJSON {@link Geometry} in a GeoJSON {@link Feature}.
 *
 * @name feature
 * @param {Geometry} geometry input geometry
 * @param {Object} [properties={}] an Object of key-value pairs to add as properties
 * @param {Array<number>} [bbox] BBox [west, south, east, north]
 * @param {string|number} [id] Identifier
 * @returns {Feature} a GeoJSON Feature
 * @example
 * var geometry = {
 *   "type": "Point",
 *   "coordinates": [110, 50]
 * };
 *
 * var feature = turf.feature(geometry);
 *
 * //=feature
 */function feature(geometry,properties,bbox,id){if(geometry===undefined)throw new Error('geometry is required');if(properties&&properties.constructor!==Object)throw new Error('properties must be an Object');if(bbox&&bbox.length!==4)throw new Error('bbox must be an Array of 4 numbers');if(id&&['string','number'].indexOf(typeof id==='undefined'?'undefined':_typeof(id))===-1)throw new Error('id must be a number or a string');var feat={type:'Feature'};if(id)feat.id=id;if(bbox)feat.bbox=bbox;feat.properties=properties||{};feat.geometry=geometry;return feat;}/**
 * Creates a GeoJSON {@link Geometry} from a Geometry string type & coordinates.
 * For GeometryCollection type use `helpers.geometryCollection`
 *
 * @name geometry
 * @param {string} type Geometry Type
 * @param {Array<number>} coordinates Coordinates
 * @param {Array<number>} [bbox] BBox [west, south, east, north]
 * @returns {Geometry} a GeoJSON Geometry
 * @example
 * var type = 'Point';
 * var coordinates = [110, 50];
 *
 * var geometry = turf.geometry(type, coordinates);
 *
 * //=geometry
 *//**
 * Takes coordinates and properties (optional) and returns a new {@link Point} feature.
 *
 * @name point
 * @param {Array<number>} coordinates longitude, latitude position (each in decimal degrees)
 * @param {Object} [properties={}] an Object of key-value pairs to add as properties
 * @param {Array<number>} [bbox] BBox [west, south, east, north]
 * @param {string|number} [id] Identifier
 * @returns {Feature<Point>} a Point feature
 * @example
 * var point = turf.point([-75.343, 39.984]);
 *
 * //=point
 */function point(coordinates,properties,bbox,id){if(!coordinates)throw new Error('No coordinates passed');if(coordinates.length===undefined)throw new Error('Coordinates must be an array');if(coordinates.length<2)throw new Error('Coordinates must be at least 2 numbers long');if(!isNumber(coordinates[0])||!isNumber(coordinates[1]))throw new Error('Coordinates must contain numbers');return feature({type:'Point',coordinates:coordinates},properties,bbox,id);}/**
 * Takes an array of LinearRings and optionally an {@link Object} with properties and returns a {@link Polygon} feature.
 *
 * @name polygon
 * @param {Array<Array<Array<number>>>} coordinates an array of LinearRings
 * @param {Object} [properties={}] an Object of key-value pairs to add as properties
 * @param {Array<number>} [bbox] BBox [west, south, east, north]
 * @param {string|number} [id] Identifier
 * @returns {Feature<Polygon>} a Polygon feature
 * @throws {Error} throw an error if a LinearRing of the polygon has too few positions
 * or if a LinearRing of the Polygon does not have matching Positions at the beginning & end.
 * @example
 * var polygon = turf.polygon([[
 *   [-2.275543, 53.464547],
 *   [-2.275543, 53.489271],
 *   [-2.215118, 53.489271],
 *   [-2.215118, 53.464547],
 *   [-2.275543, 53.464547]
 * ]], { name: 'poly1', population: 400});
 *
 * //=polygon
 */function polygon(coordinates,properties,bbox,id){if(!coordinates)throw new Error('No coordinates passed');for(var i=0;i<coordinates.length;i++){var ring=coordinates[i];if(ring.length<4){throw new Error('Each LinearRing of a Polygon must have 4 or more Positions.');}for(var j=0;j<ring[ring.length-1].length;j++){// Check if first point of Polygon contains two numbers
if(i===0&&j===0&&!isNumber(ring[0][0])||!isNumber(ring[0][1]))throw new Error('Coordinates must contain numbers');if(ring[ring.length-1][j]!==ring[0][j]){throw new Error('First and last Position are not equivalent.');}}}return feature({type:'Polygon',coordinates:coordinates},properties,bbox,id);}/**
 * Creates a {@link LineString} based on a
 * coordinate array. Properties can be added optionally.
 *
 * @name lineString
 * @param {Array<Array<number>>} coordinates an array of Positions
 * @param {Object} [properties={}] an Object of key-value pairs to add as properties
 * @param {Array<number>} [bbox] BBox [west, south, east, north]
 * @param {string|number} [id] Identifier
 * @returns {Feature<LineString>} a LineString feature
 * @throws {Error} if no coordinates are passed
 * @example
 * var linestring1 = turf.lineString([
 *   [-21.964416, 64.148203],
 *   [-21.956176, 64.141316],
 *   [-21.93901, 64.135924],
 *   [-21.927337, 64.136673]
 * ]);
 * var linestring2 = turf.lineString([
 *   [-21.929054, 64.127985],
 *   [-21.912918, 64.134726],
 *   [-21.916007, 64.141016],
 *   [-21.930084, 64.14446]
 * ], {name: 'line 1', distance: 145});
 *
 * //=linestring1
 *
 * //=linestring2
 */function lineString(coordinates,properties,bbox,id){if(!coordinates)throw new Error('No coordinates passed');if(coordinates.length<2)throw new Error('Coordinates must be an array of two or more positions');// Check if first point of LineString contains two numbers
if(!isNumber(coordinates[0][1])||!isNumber(coordinates[0][1]))throw new Error('Coordinates must contain numbers');return feature({type:'LineString',coordinates:coordinates},properties,bbox,id);}/**
 * Takes one or more {@link Feature|Features} and creates a {@link FeatureCollection}.
 *
 * @name featureCollection
 * @param {Feature[]} features input features
 * @param {Array<number>} [bbox] BBox [west, south, east, north]
 * @param {string|number} [id] Identifier
 * @returns {FeatureCollection} a FeatureCollection of input features
 * @example
 * var features = [
 *  turf.point([-75.343, 39.984], {name: 'Location A'}),
 *  turf.point([-75.833, 39.284], {name: 'Location B'}),
 *  turf.point([-75.534, 39.123], {name: 'Location C'})
 * ];
 *
 * var collection = turf.featureCollection(features);
 *
 * //=collection
 */function featureCollection(features,bbox,id){if(!features)throw new Error('No features passed');if(!Array.isArray(features))throw new Error('features must be an Array');if(bbox&&bbox.length!==4)throw new Error('bbox must be an Array of 4 numbers');if(id&&['string','number'].indexOf(typeof id==='undefined'?'undefined':_typeof(id))===-1)throw new Error('id must be a number or a string');var fc={type:'FeatureCollection'};if(id)fc.id=id;if(bbox)fc.bbox=bbox;fc.features=features;return fc;}/**
 * Creates a {@link Feature<MultiLineString>} based on a
 * coordinate array. Properties can be added optionally.
 *
 * @name multiLineString
 * @param {Array<Array<Array<number>>>} coordinates an array of LineStrings
 * @param {Object} [properties={}] an Object of key-value pairs to add as properties
 * @param {Array<number>} [bbox] BBox [west, south, east, north]
 * @param {string|number} [id] Identifier
 * @returns {Feature<MultiLineString>} a MultiLineString feature
 * @throws {Error} if no coordinates are passed
 * @example
 * var multiLine = turf.multiLineString([[[0,0],[10,10]]]);
 *
 * //=multiLine
 *//**
 * Creates a {@link Feature<MultiPoint>} based on a
 * coordinate array. Properties can be added optionally.
 *
 * @name multiPoint
 * @param {Array<Array<number>>} coordinates an array of Positions
 * @param {Object} [properties={}] an Object of key-value pairs to add as properties
 * @param {Array<number>} [bbox] BBox [west, south, east, north]
 * @param {string|number} [id] Identifier
 * @returns {Feature<MultiPoint>} a MultiPoint feature
 * @throws {Error} if no coordinates are passed
 * @example
 * var multiPt = turf.multiPoint([[0,0],[10,10]]);
 *
 * //=multiPt
 *//**
 * Creates a {@link Feature<MultiPolygon>} based on a
 * coordinate array. Properties can be added optionally.
 *
 * @name multiPolygon
 * @param {Array<Array<Array<Array<number>>>>} coordinates an array of Polygons
 * @param {Object} [properties={}] an Object of key-value pairs to add as properties
 * @param {Array<number>} [bbox] BBox [west, south, east, north]
 * @param {string|number} [id] Identifier
 * @returns {Feature<MultiPolygon>} a multipolygon feature
 * @throws {Error} if no coordinates are passed
 * @example
 * var multiPoly = turf.multiPolygon([[[[0,0],[0,10],[10,10],[10,0],[0,0]]]]);
 *
 * //=multiPoly
 *
 *//**
 * Creates a {@link Feature<GeometryCollection>} based on a
 * coordinate array. Properties can be added optionally.
 *
 * @name geometryCollection
 * @param {Array<Geometry>} geometries an array of GeoJSON Geometries
 * @param {Object} [properties={}] an Object of key-value pairs to add as properties
 * @param {Array<number>} [bbox] BBox [west, south, east, north]
 * @param {string|number} [id] Identifier
 * @returns {Feature<GeometryCollection>} a GeoJSON GeometryCollection Feature
 * @example
 * var pt = {
 *     "type": "Point",
 *       "coordinates": [100, 0]
 *     };
 * var line = {
 *     "type": "LineString",
 *     "coordinates": [ [101, 0], [102, 1] ]
 *   };
 * var collection = turf.geometryCollection([pt, line]);
 *
 * //=collection
 */// https://en.wikipedia.org/wiki/Great-circle_distance#Radius_for_spherical_Earth
var factors={miles:3960,nauticalmiles:3441.145,degrees:57.2957795,radians:1,inches:250905600,yards:6969600,meters:6373000,metres:6373000,centimeters:6.373e+8,centimetres:6.373e+8,kilometers:6373,kilometres:6373,feet:20908792.65};/**
 * Round number to precision
 *
 * @param {number} num Number
 * @param {number} [precision=0] Precision
 * @returns {number} rounded number
 * @example
 * turf.round(120.4321)
 * //=120
 *
 * turf.round(120.4321, 2)
 * //=120.43
 *//**
 * Convert a distance measurement (assuming a spherical Earth) from radians to a more friendly unit.
 * Valid units: miles, nauticalmiles, inches, yards, meters, metres, kilometers, centimeters, feet
 *
 * @name radiansToDistance
 * @param {number} radians in radians across the sphere
 * @param {string} [units="kilometers"] can be degrees, radians, miles, or kilometers inches, yards, metres, meters, kilometres, kilometers.
 * @returns {number} distance
 */function radiansToDistance(radians,units){if(radians===undefined||radians===null)throw new Error('radians is required');if(units&&typeof units!=='string')throw new Error('units must be a string');var factor=factors[units||'kilometers'];if(!factor)throw new Error(units+' units is invalid');return radians*factor;}/**
 * Convert a distance measurement (assuming a spherical Earth) from a real-world unit into radians
 * Valid units: miles, nauticalmiles, inches, yards, meters, metres, kilometers, centimeters, feet
 *
 * @name distanceToRadians
 * @param {number} distance in real units
 * @param {string} [units=kilometers] can be degrees, radians, miles, or kilometers inches, yards, metres, meters, kilometres, kilometers.
 * @returns {number} radians
 */function distanceToRadians(distance,units){if(distance===undefined||distance===null)throw new Error('distance is required');if(units&&typeof units!=='string')throw new Error('units must be a string');var factor=factors[units||'kilometers'];if(!factor)throw new Error(units+' units is invalid');return distance/factor;}/**
 * Convert a distance measurement (assuming a spherical Earth) from a real-world unit into degrees
 * Valid units: miles, nauticalmiles, inches, yards, meters, metres, centimeters, kilometres, feet
 *
 * @name distanceToDegrees
 * @param {number} distance in real units
 * @param {string} [units=kilometers] can be degrees, radians, miles, or kilometers inches, yards, metres, meters, kilometres, kilometers.
 * @returns {number} degrees
 *//**
 * Converts any bearing angle from the north line direction (positive clockwise)
 * and returns an angle between 0-360 degrees (positive clockwise), 0 being the north line
 *
 * @name bearingToAngle
 * @param {number} bearing angle, between -180 and +180 degrees
 * @returns {number} angle between 0 and 360 degrees
 *//**
 * Converts an angle in radians to degrees
 *
 * @name radians2degrees
 * @param {number} radians angle in radians
 * @returns {number} degrees between 0 and 360 degrees
 *//**
 * Converts an angle in degrees to radians
 *
 * @name degrees2radians
 * @param {number} degrees angle between 0 and 360 degrees
 * @returns {number} angle in radians
 *//**
 * Converts a distance to the requested unit.
 * Valid units: miles, nauticalmiles, inches, yards, meters, metres, kilometers, centimeters, feet
 *
 * @param {number} distance to be converted
 * @param {string} originalUnit of the distance
 * @param {string} [finalUnit=kilometers] returned unit
 * @returns {number} the converted distance
 *//**
 * Converts a area to the requested unit.
 * Valid units: kilometers, kilometres, meters, metres, centimetres, millimeter, acre, mile, yard, foot, inch
 * @param {number} area to be converted
 * @param {string} [originalUnit=meters] of the distance
 * @param {string} [finalUnit=kilometers] returned unit
 * @returns {number} the converted distance
 *//**
 * isNumber
 *
 * @param {*} num Number to validate
 * @returns {boolean} true/false
 * @example
 * turf.isNumber(123)
 * //=true
 * turf.isNumber('foo')
 * //=false
 */function isNumber(num){return!isNaN(num)&&num!==null&&!Array.isArray(num);}/**
 * isObject
 *
 * @param {*} input variable to validate
 * @returns {boolean} true/false
 * @example
 * turf.isObject({elevation: 10})
 * //=true
 * turf.isObject('foo')
 * //=false
 */function isObject$2(input){return!!input&&input.constructor===Object;}/**
 * Earth Radius used with the Harvesine formula and approximates using a spherical (non-ellipsoid) Earth.
 */var earthRadius=6371008.8;/**
 * Takes a {@link LineString|linestring}, {@link MultiLineString|multi-linestring}, {@link MultiPolygon|multi-polygon}, or {@link Polygon|polygon} and returns {@link Point|points} at all self-intersections.
 *
 * @name kinks
 * @param {Feature<LineString|MultiLineString|MultiPolygon|Polygon>} featureIn input feature
 * @returns {FeatureCollection<Point>} self-intersections
 * @example
 * var poly = turf.polygon([[
 *   [-12.034835, 8.901183],
 *   [-12.060413, 8.899826],
 *   [-12.03638, 8.873199],
 *   [-12.059383, 8.871418],
 *   [-12.034835, 8.901183]
 * ]]);
 *
 * var kinks = turf.kinks(poly);
 *
 * //addToMap
 * var addToMap = [poly, kinks]
 */function kinks(featureIn){var coordinates;var feature$$1;var results={type:'FeatureCollection',features:[]};if(featureIn.type==='Feature'){feature$$1=featureIn.geometry;}else{feature$$1=featureIn;}if(feature$$1.type==='LineString'){coordinates=[feature$$1.coordinates];}else if(feature$$1.type==='MultiLineString'){coordinates=feature$$1.coordinates;}else if(feature$$1.type==='MultiPolygon'){coordinates=[].concat.apply([],feature$$1.coordinates);}else if(feature$$1.type==='Polygon'){coordinates=feature$$1.coordinates;}else{throw new Error('Input must be a LineString, MultiLineString, '+'Polygon, or MultiPolygon Feature or Geometry');}coordinates.forEach(function(line1){coordinates.forEach(function(line2){for(var i=0;i<line1.length-1;i++){// start iteration at i, intersections for k < i have already been checked in previous outer loop iterations
for(var k=i;k<line2.length-1;k++){if(line1===line2){// segments are adjacent and always share a vertex, not a kink
if(Math.abs(i-k)===1){continue;}// first and last segment in a closed lineString or ring always share a vertex, not a kink
if(// segments are first and last segment of lineString
i===0&&k===line1.length-2&&// lineString is closed
line1[i][0]===line1[line1.length-1][0]&&line1[i][1]===line1[line1.length-1][1]){continue;}}var intersection=lineIntersects(line1[i][0],line1[i][1],line1[i+1][0],line1[i+1][1],line2[k][0],line2[k][1],line2[k+1][0],line2[k+1][1]);if(intersection){results.features.push(point([intersection[0],intersection[1]]));}}}});});return results;}// modified from http://jsfiddle.net/justin_c_rounds/Gd2S2/light/
function lineIntersects(line1StartX,line1StartY,line1EndX,line1EndY,line2StartX,line2StartY,line2EndX,line2EndY){// if the lines intersect, the result contains the x and y of the intersection (treating the lines as infinite) and booleans for whether line segment 1 or line segment 2 contain the point
var denominator,a,b,numerator1,numerator2,result={x:null,y:null,onLine1:false,onLine2:false};denominator=(line2EndY-line2StartY)*(line1EndX-line1StartX)-(line2EndX-line2StartX)*(line1EndY-line1StartY);if(denominator===0){if(result.x!==null&&result.y!==null){return result;}else{return false;}}a=line1StartY-line2StartY;b=line1StartX-line2StartX;numerator1=(line2EndX-line2StartX)*a-(line2EndY-line2StartY)*b;numerator2=(line1EndX-line1StartX)*a-(line1EndY-line1StartY)*b;a=numerator1/denominator;b=numerator2/denominator;// if we cast these lines infinitely in both directions, they intersect here:
result.x=line1StartX+a*(line1EndX-line1StartX);result.y=line1StartY+a*(line1EndY-line1StartY);// if line1 is a segment and line2 is infinite, they intersect if:
if(a>=0&&a<=1){result.onLine1=true;}// if line2 is a segment and line1 is infinite, they intersect if:
if(b>=0&&b<=1){result.onLine2=true;}// if line1 and line2 are segments, they intersect if both of the above are true
if(result.onLine1&&result.onLine2){return[result.x,result.y];}else{return false;}}/**
 * Unwrap a coordinate from a Point Feature, Geometry or a single coordinate.
 *
 * @name getCoord
 * @param {Array<number>|Geometry<Point>|Feature<Point>} obj Object
 * @returns {Array<number>} coordinates
 * @example
 * var pt = turf.point([10, 10]);
 *
 * var coord = turf.getCoord(pt);
 * //= [10, 10]
 */function getCoord(obj){if(!obj)throw new Error('obj is required');var coordinates=getCoords(obj);// getCoord() must contain at least two numbers (Point)
if(coordinates.length>1&&isNumber(coordinates[0])&&isNumber(coordinates[1])){return coordinates;}else{throw new Error('Coordinate is not a valid Point');}}/**
 * Unwrap coordinates from a Feature, Geometry Object or an Array of numbers
 *
 * @name getCoords
 * @param {Array<number>|Geometry|Feature} obj Object
 * @returns {Array<number>} coordinates
 * @example
 * var poly = turf.polygon([[[119.32, -8.7], [119.55, -8.69], [119.51, -8.54], [119.32, -8.7]]]);
 *
 * var coord = turf.getCoords(poly);
 * //= [[[119.32, -8.7], [119.55, -8.69], [119.51, -8.54], [119.32, -8.7]]]
 */function getCoords(obj){if(!obj)throw new Error('obj is required');var coordinates;// Array of numbers
if(obj.length){coordinates=obj;// Geometry Object
}else if(obj.coordinates){coordinates=obj.coordinates;// Feature
}else if(obj.geometry&&obj.geometry.coordinates){coordinates=obj.geometry.coordinates;}// Checks if coordinates contains a number
if(coordinates){containsNumber(coordinates);return coordinates;}throw new Error('No valid coordinates');}/**
 * Checks if coordinates contains a number
 *
 * @name containsNumber
 * @param {Array<any>} coordinates GeoJSON Coordinates
 * @returns {boolean} true if Array contains a number
 */function containsNumber(coordinates){if(coordinates.length>1&&isNumber(coordinates[0])&&isNumber(coordinates[1])){return true;}if(Array.isArray(coordinates[0])&&coordinates[0].length){return containsNumber(coordinates[0]);}throw new Error('coordinates must only contain numbers');}/**
 * Enforce expectations about types of GeoJSON objects for Turf.
 *
 * @name geojsonType
 * @param {GeoJSON} value any GeoJSON object
 * @param {string} type expected GeoJSON type
 * @param {string} name name of calling function
 * @throws {Error} if value is not the expected type.
 *//**
 * Enforce expectations about types of {@link Feature} inputs for Turf.
 * Internally this uses {@link geojsonType} to judge geometry types.
 *
 * @name featureOf
 * @param {Feature} feature a feature with an expected geometry type
 * @param {string} type expected GeoJSON type
 * @param {string} name name of calling function
 * @throws {Error} error if value is not the expected type.
 *//**
 * Enforce expectations about types of {@link FeatureCollection} inputs for Turf.
 * Internally this uses {@link geojsonType} to judge geometry types.
 *
 * @name collectionOf
 * @param {FeatureCollection} featureCollection a FeatureCollection for which features will be judged
 * @param {string} type expected GeoJSON type
 * @param {string} name name of calling function
 * @throws {Error} if value is not the expected type.
 *//**
 * Get Geometry from Feature or Geometry Object
 *
 * @param {Feature|Geometry} geojson GeoJSON Feature or Geometry Object
 * @returns {Geometry|null} GeoJSON Geometry Object
 * @throws {Error} if geojson is not a Feature or Geometry Object
 * @example
 * var point = {
 *   "type": "Feature",
 *   "properties": {},
 *   "geometry": {
 *     "type": "Point",
 *     "coordinates": [110, 40]
 *   }
 * }
 * var geom = turf.getGeom(point)
 * //={"type": "Point", "coordinates": [110, 40]}
 *//**
 * Get Geometry Type from Feature or Geometry Object
 *
 * @throws {Error} **DEPRECATED** in v5.0.0 in favor of getType
 *//**
 * Get GeoJSON object's type, Geometry type is prioritize.
 *
 * @param {GeoJSON} geojson GeoJSON object
 * @param {string} [name] name of the variable to display in error message
 * @returns {string} GeoJSON type
 * @example
 * var point = {
 *   "type": "Feature",
 *   "properties": {},
 *   "geometry": {
 *     "type": "Point",
 *     "coordinates": [110, 40]
 *   }
 * }
 * var geom = turf.getType(point)
 * //="Point"
 */function getType(geojson,name){if(!geojson)throw new Error((name||'geojson')+' is required');// GeoJSON Feature & GeometryCollection
if(geojson.geometry&&geojson.geometry.type)return geojson.geometry.type;// GeoJSON Geometry & FeatureCollection
if(geojson.type)return geojson.type;throw new Error((name||'geojson')+' is invalid');}// http://en.wikipedia.org/wiki/Even%E2%80%93odd_rule
// modified from: https://github.com/substack/point-in-polygon/blob/master/index.js
// which was modified from http://www.ecse.rpi.edu/Homepages/wrf/Research/Short_Notes/pnpoly.html
/**
 * Takes a {@link Point} and a {@link Polygon} or {@link MultiPolygon} and determines if the point resides inside the polygon. The polygon can
 * be convex or concave. The function accounts for holes.
 *
 * @name inside
 * @param {Feature<Point>} point input point
 * @param {Feature<Polygon|MultiPolygon>} polygon input polygon or multipolygon
 * @param {Object} [options={}] Optional parameters
 * @param {boolean} [options.ignoreBoundary=false] True if polygon boundary should be ignored when determining if the point is inside the polygon otherwise false.
 * @returns {boolean} `true` if the Point is inside the Polygon; `false` if the Point is not inside the Polygon
 * @example
 * var pt = turf.point([-77, 44]);
 * var poly = turf.polygon([[
 *   [-81, 41],
 *   [-81, 47],
 *   [-72, 47],
 *   [-72, 41],
 *   [-81, 41]
 * ]]);
 *
 * turf.inside(pt, poly);
 * //= true
 */function inside(point,polygon,options){// Optional parameters
options=options||{};if((typeof options==='undefined'?'undefined':_typeof(options))!=='object')throw new Error('options is invalid');var ignoreBoundary=options.ignoreBoundary;// validation
if(!point)throw new Error('point is required');if(!polygon)throw new Error('polygon is required');var pt=getCoord(point);var polys=getCoords(polygon);var type=polygon.geometry?polygon.geometry.type:polygon.type;var bbox=polygon.bbox;// Quick elimination if point is not inside bbox
if(bbox&&inBBox(pt,bbox)===false)return false;// normalize to multipolygon
if(type==='Polygon')polys=[polys];for(var i=0,insidePoly=false;i<polys.length&&!insidePoly;i++){// check if it is in the outer ring first
if(inRing(pt,polys[i][0],ignoreBoundary)){var inHole=false;var k=1;// check for the point in any of the holes
while(k<polys[i].length&&!inHole){if(inRing(pt,polys[i][k],!ignoreBoundary)){inHole=true;}k++;}if(!inHole)insidePoly=true;}}return insidePoly;}/**
 * inRing
 *
 * @private
 * @param {Array<number>} pt [x,y]
 * @param {Array<Array<number>>} ring [[x,y], [x,y],..]
 * @param {boolean} ignoreBoundary ignoreBoundary
 * @returns {boolean} inRing
 */function inRing(pt,ring,ignoreBoundary){var isInside=false;if(ring[0][0]===ring[ring.length-1][0]&&ring[0][1]===ring[ring.length-1][1])ring=ring.slice(0,ring.length-1);for(var i=0,j=ring.length-1;i<ring.length;j=i++){var xi=ring[i][0],yi=ring[i][1];var xj=ring[j][0],yj=ring[j][1];var onBoundary=pt[1]*(xi-xj)+yi*(xj-pt[0])+yj*(pt[0]-xi)===0&&(xi-pt[0])*(xj-pt[0])<=0&&(yi-pt[1])*(yj-pt[1])<=0;if(onBoundary)return!ignoreBoundary;var intersect=yi>pt[1]!==yj>pt[1]&&pt[0]<(xj-xi)*(pt[1]-yi)/(yj-yi)+xi;if(intersect)isInside=!isInside;}return isInside;}/**
 * inBBox
 *
 * @private
 * @param {Array<number>} pt point [x,y]
 * @param {Array<number>} bbox BBox [west, south, east, north]
 * @returns {boolean} true/false if point is inside BBox
 */function inBBox(pt,bbox){return bbox[0]<=pt[0]&&bbox[1]<=pt[1]&&bbox[2]>=pt[0]&&bbox[3]>=pt[1];}/*
 (c) 2013, Vladimir Agafonkin
 Simplify.js, a high-performance JS polyline simplification library
 mourner.github.io/simplify-js
*/// to suit your point format, run search/replace for '.x' and '.y';
// for 3D version, see 3d branch (configurability would draw significant performance overhead)
// square distance between 2 points
function getSqDist(p1,p2){var dx=p1.x-p2.x,dy=p1.y-p2.y;return dx*dx+dy*dy;}// square distance from a point to a segment
function getSqSegDist(p,p1,p2){var x=p1.x,y=p1.y,dx=p2.x-x,dy=p2.y-y;if(dx!==0||dy!==0){var t=((p.x-x)*dx+(p.y-y)*dy)/(dx*dx+dy*dy);if(t>1){x=p2.x;y=p2.y;}else if(t>0){x+=dx*t;y+=dy*t;}}dx=p.x-x;dy=p.y-y;return dx*dx+dy*dy;}// rest of the code doesn't care about point format
// basic distance-based simplification
function simplifyRadialDist(points,sqTolerance){var prevPoint=points[0],newPoints=[prevPoint],point;for(var i=1,len=points.length;i<len;i++){point=points[i];if(getSqDist(point,prevPoint)>sqTolerance){newPoints.push(point);prevPoint=point;}}if(prevPoint!==point)newPoints.push(point);return newPoints;}// simplification using optimized Douglas-Peucker algorithm with recursion elimination
function simplifyDouglasPeucker(points,sqTolerance){var len=points.length,MarkerArray=typeof Uint8Array!=='undefined'?Uint8Array:Array,markers=new MarkerArray(len),first=0,last=len-1,stack=[],newPoints=[],i,maxSqDist,sqDist,index;markers[first]=markers[last]=1;while(last){maxSqDist=0;for(i=first+1;i<last;i++){sqDist=getSqSegDist(points[i],points[first],points[last]);if(sqDist>maxSqDist){index=i;maxSqDist=sqDist;}}if(maxSqDist>sqTolerance){markers[index]=1;stack.push(first,index,index,last);}last=stack.pop();first=stack.pop();}for(i=0;i<len;i++){if(markers[i])newPoints.push(points[i]);}return newPoints;}// both algorithms combined for awesome performance
function simplify$2(points,tolerance,highestQuality){var sqTolerance=tolerance!==undefined?tolerance*tolerance:1;points=highestQuality?points:simplifyRadialDist(points,sqTolerance);points=simplifyDouglasPeucker(points,sqTolerance);return points;}/**
 * Removes redundant coordinates from any GeoJSON Geometry.
 *
 * @name cleanCoords
 * @param {Geometry|Feature} geojson Feature or Geometry
 * @param {Object} [options={}] Optional parameters
 * @param {boolean} [options.mutate=false] allows GeoJSON input to be mutated
 * @returns {Geometry|Feature} the cleaned input Feature/Geometry
 * @example
 * var line = turf.lineString([[0, 0], [0, 2], [0, 5], [0, 8], [0, 8], [0, 10]]);
 * var multiPoint = turf.multiPoint([[0, 0], [0, 0], [2, 2]]);
 *
 * turf.cleanCoords(line).geometry.coordinates;
 * //= [[0, 0], [0, 10]]
 *
 * turf.cleanCoords(multiPoint).geometry.coordinates;
 * //= [[0, 0], [2, 2]]
 */function cleanCoords(geojson,options){// Backwards compatible with v4.0
var mutate=(typeof options==='undefined'?'undefined':_typeof(options))==='object'?options.mutate:options;if(!geojson)throw new Error('geojson is required');var type=getType(geojson);// Store new "clean" points in this Array
var newCoords=[];switch(type){case'LineString':newCoords=cleanLine(geojson);break;case'MultiLineString':case'Polygon':getCoords(geojson).forEach(function(line){newCoords.push(cleanLine(line));});break;case'MultiPolygon':getCoords(geojson).forEach(function(polygons){var polyPoints=[];polygons.forEach(function(ring){polyPoints.push(cleanLine(ring));});newCoords.push(polyPoints);});break;case'Point':return geojson;case'MultiPoint':var existing={};getCoords(geojson).forEach(function(coord){var key=coord.join('-');if(!existing.hasOwnProperty(key)){newCoords.push(coord);existing[key]=true;}});break;default:throw new Error(type+' geometry not supported');}// Support input mutation
if(geojson.coordinates){if(mutate===true){geojson.coordinates=newCoords;return geojson;}return{type:type,coordinates:newCoords};}else{if(mutate===true){geojson.geometry.coordinates=newCoords;return geojson;}return feature({type:type,coordinates:newCoords},geojson.properties,geojson.bbox,geojson.id);}}/**
 * Clean Coords
 *
 * @private
 * @param {Array<number>|LineString} line Line
 * @returns {Array<number>} Cleaned coordinates
 */function cleanLine(line){var points=getCoords(line);// handle "clean" segment
if(points.length===2&&!equals(points[0],points[1]))return points;var prevPoint,point$$1,nextPoint;var newPoints=[];var secondToLast=points.length-1;newPoints.push(points[0]);for(var i=1;i<secondToLast;i++){prevPoint=points[i-1];point$$1=points[i];nextPoint=points[i+1];if(!isPointOnLineSegment(prevPoint,nextPoint,point$$1)){newPoints.push(point$$1);}}newPoints.push(nextPoint);return newPoints;}/**
 * Compares two points and returns if they are equals
 *
 * @private
 * @param {Array<number>} pt1 point
 * @param {Array<number>} pt2 point
 * @returns {boolean} true if they are equals
 */function equals(pt1,pt2){return pt1[0]===pt2[0]&&pt1[1]===pt2[1];}/**
 * Returns if `point` is on the segment between `start` and `end`.
 * Borrowed from `@turf/boolean-point-on-line` to speed up the evaluation (instead of using the module as dependency)
 *
 * @private
 * @param {Array<number>} start coord pair of start of line
 * @param {Array<number>} end coord pair of end of line
 * @param {Array<number>} point coord pair of point to check
 * @returns {boolean} true/false
 */function isPointOnLineSegment(start,end,point$$1){var x=point$$1[0],y=point$$1[1];var startX=start[0],startY=start[1];var endX=end[0],endY=end[1];var dxc=x-startX;var dyc=y-startY;var dxl=endX-startX;var dyl=endY-startY;var cross=dxc*dyl-dyc*dxl;if(cross!==0)return false;else if(Math.abs(dxl)>=Math.abs(dyl))return dxl>0?startX<=x&&x<=endX:endX<=x&&x<=startX;else return dyl>0?startY<=y&&y<=endY:endY<=y&&y<=startY;}/**
 * Returns a cloned copy of the passed GeoJSON Object, including possible 'Foreign Members'.
 * ~3-5x faster than the common JSON.parse + JSON.stringify combo method.
 *
 * @name clone
 * @param {GeoJSON} geojson GeoJSON Object
 * @returns {GeoJSON} cloned GeoJSON Object
 * @example
 * var line = turf.lineString([[-74, 40], [-78, 42], [-82, 35]], {color: 'red'});
 *
 * var lineCloned = turf.clone(line);
 */function clone(geojson){if(!geojson)throw new Error('geojson is required');switch(geojson.type){case'Feature':return cloneFeature(geojson);case'FeatureCollection':return cloneFeatureCollection(geojson);case'Point':case'LineString':case'Polygon':case'MultiPoint':case'MultiLineString':case'MultiPolygon':case'GeometryCollection':return cloneGeometry(geojson);default:throw new Error('unknown GeoJSON type');}}/**
 * Clone Feature
 *
 * @private
 * @param {Feature<any>} geojson GeoJSON Feature
 * @returns {Feature<any>} cloned Feature
 */function cloneFeature(geojson){var cloned={type:'Feature'};// Preserve Foreign Members
Object.keys(geojson).forEach(function(key){switch(key){case'type':case'properties':case'geometry':return;default:cloned[key]=geojson[key];}});// Add properties & geometry last
cloned.properties=cloneProperties(geojson.properties);cloned.geometry=cloneGeometry(geojson.geometry);return cloned;}/**
 * Clone Properties
 *
 * @private
 * @param {Object} properties GeoJSON Properties
 * @returns {Object} cloned Properties
 */function cloneProperties(properties){var cloned={};if(!properties)return cloned;Object.keys(properties).forEach(function(key){var value=properties[key];if((typeof value==='undefined'?'undefined':_typeof(value))==='object'){// handle Array
if(value.length)cloned[key]=value.map(function(item){return item;});// handle Object
cloned[key]=cloneProperties(value);}else cloned[key]=value;});return cloned;}/**
 * Clone Feature Collection
 *
 * @private
 * @param {FeatureCollection<any>} geojson GeoJSON Feature Collection
 * @returns {FeatureCollection<any>} cloned Feature Collection
 */function cloneFeatureCollection(geojson){var cloned={type:'FeatureCollection'};// Preserve Foreign Members
Object.keys(geojson).forEach(function(key){switch(key){case'type':case'features':return;default:cloned[key]=geojson[key];}});// Add features
cloned.features=geojson.features.map(function(feature){return cloneFeature(feature);});return cloned;}/**
 * Clone Geometry
 *
 * @private
 * @param {Geometry<any>} geometry GeoJSON Geometry
 * @returns {Geometry<any>} cloned Geometry
 */function cloneGeometry(geometry){var geom={type:geometry.type};if(geometry.bbox)geom.bbox=geometry.bbox;if(geometry.type==='GeometryCollection'){geom.geometries=geometry.geometries.map(function(geom){return cloneGeometry(geom);});return geom;}geom.coordinates=deepSlice(geometry.coordinates);return geom;}/**
 * Deep Slice coordinates
 *
 * @private
 * @param {Coordinates} coords Coordinates
 * @returns {Coordinates} all coordinates sliced
 */function deepSlice(coords){if(_typeof(coords[0])!=='object'){return coords.slice();}return coords.map(function(coord){return deepSlice(coord);});}/**
 * Callback for coordEach
 *
 * @callback coordEachCallback
 * @param {Array<number>} currentCoord The current coordinate being processed.
 * @param {number} coordIndex The current index of the coordinate being processed.
 * Starts at index 0.
 * @param {number} featureIndex The current index of the feature being processed.
 * @param {number} featureSubIndex The current subIndex of the feature being processed.
 *//**
 * Iterate over coordinates in any GeoJSON object, similar to Array.forEach()
 *
 * @name coordEach
 * @param {(FeatureCollection|Feature|Geometry)} geojson any GeoJSON object
 * @param {Function} callback a method that takes (currentCoord, coordIndex, featureIndex, featureSubIndex)
 * @param {boolean} [excludeWrapCoord=false] whether or not to include the final coordinate of LinearRings that wraps the ring in its iteration.
 * @example
 * var features = turf.featureCollection([
 *   turf.point([26, 37], {"foo": "bar"}),
 *   turf.point([36, 53], {"hello": "world"})
 * ]);
 *
 * turf.coordEach(features, function (currentCoord, coordIndex, featureIndex, featureSubIndex) {
 *   //=currentCoord
 *   //=coordIndex
 *   //=featureIndex
 *   //=featureSubIndex
 * });
 */function coordEach(geojson,callback,excludeWrapCoord){// Handles null Geometry -- Skips this GeoJSON
if(geojson===null)return;var featureIndex,geometryIndex,j,k,l,geometry$$1,stopG,coords,geometryMaybeCollection,wrapShrink=0,coordIndex=0,isGeometryCollection,type=geojson.type,isFeatureCollection=type==='FeatureCollection',isFeature=type==='Feature',stop=isFeatureCollection?geojson.features.length:1;// This logic may look a little weird. The reason why it is that way
// is because it's trying to be fast. GeoJSON supports multiple kinds
// of objects at its root: FeatureCollection, Features, Geometries.
// This function has the responsibility of handling all of them, and that
// means that some of the `for` loops you see below actually just don't apply
// to certain inputs. For instance, if you give this just a
// Point geometry, then both loops are short-circuited and all we do
// is gradually rename the input until it's called 'geometry'.
//
// This also aims to allocate as few resources as possible: just a
// few numbers and booleans, rather than any temporary arrays as would
// be required with the normalization approach.
for(featureIndex=0;featureIndex<stop;featureIndex++){geometryMaybeCollection=isFeatureCollection?geojson.features[featureIndex].geometry:isFeature?geojson.geometry:geojson;isGeometryCollection=geometryMaybeCollection?geometryMaybeCollection.type==='GeometryCollection':false;stopG=isGeometryCollection?geometryMaybeCollection.geometries.length:1;for(geometryIndex=0;geometryIndex<stopG;geometryIndex++){var featureSubIndex=0;geometry$$1=isGeometryCollection?geometryMaybeCollection.geometries[geometryIndex]:geometryMaybeCollection;// Handles null Geometry -- Skips this geometry
if(geometry$$1===null)continue;coords=geometry$$1.coordinates;var geomType=geometry$$1.type;wrapShrink=excludeWrapCoord&&(geomType==='Polygon'||geomType==='MultiPolygon')?1:0;switch(geomType){case null:break;case'Point':callback(coords,coordIndex,featureIndex,featureSubIndex);coordIndex++;featureSubIndex++;break;case'LineString':case'MultiPoint':for(j=0;j<coords.length;j++){callback(coords[j],coordIndex,featureIndex,featureSubIndex);coordIndex++;if(geomType==='MultiPoint')featureSubIndex++;}if(geomType==='LineString')featureSubIndex++;break;case'Polygon':case'MultiLineString':for(j=0;j<coords.length;j++){for(k=0;k<coords[j].length-wrapShrink;k++){callback(coords[j][k],coordIndex,featureIndex,featureSubIndex);coordIndex++;}if(geomType==='MultiLineString')featureSubIndex++;}if(geomType==='Polygon')featureSubIndex++;break;case'MultiPolygon':for(j=0;j<coords.length;j++){for(k=0;k<coords[j].length;k++){for(l=0;l<coords[j][k].length-wrapShrink;l++){callback(coords[j][k][l],coordIndex,featureIndex,featureSubIndex);coordIndex++;}}featureSubIndex++;}break;case'GeometryCollection':for(j=0;j<geometry$$1.geometries.length;j++){coordEach(geometry$$1.geometries[j],callback,excludeWrapCoord);}break;default:throw new Error('Unknown Geometry Type');}}}}/**
 * Callback for coordReduce
 *
 * The first time the callback function is called, the values provided as arguments depend
 * on whether the reduce method has an initialValue argument.
 *
 * If an initialValue is provided to the reduce method:
 *  - The previousValue argument is initialValue.
 *  - The currentValue argument is the value of the first element present in the array.
 *
 * If an initialValue is not provided:
 *  - The previousValue argument is the value of the first element present in the array.
 *  - The currentValue argument is the value of the second element present in the array.
 *
 * @callback coordReduceCallback
 * @param {*} previousValue The accumulated value previously returned in the last invocation
 * of the callback, or initialValue, if supplied.
 * @param {Array<number>} currentCoord The current coordinate being processed.
 * @param {number} coordIndex The current index of the coordinate being processed.
 * Starts at index 0, if an initialValue is provided, and at index 1 otherwise.
 * @param {number} featureIndex The current index of the feature being processed.
 * @param {number} featureSubIndex The current subIndex of the feature being processed.
 *//**
 * Reduce coordinates in any GeoJSON object, similar to Array.reduce()
 *
 * @name coordReduce
 * @param {FeatureCollection|Geometry|Feature} geojson any GeoJSON object
 * @param {Function} callback a method that takes (previousValue, currentCoord, coordIndex)
 * @param {*} [initialValue] Value to use as the first argument to the first call of the callback.
 * @param {boolean} [excludeWrapCoord=false] whether or not to include the final coordinate of LinearRings that wraps the ring in its iteration.
 * @returns {*} The value that results from the reduction.
 * @example
 * var features = turf.featureCollection([
 *   turf.point([26, 37], {"foo": "bar"}),
 *   turf.point([36, 53], {"hello": "world"})
 * ]);
 *
 * turf.coordReduce(features, function (previousValue, currentCoord, coordIndex, featureIndex, featureSubIndex) {
 *   //=previousValue
 *   //=currentCoord
 *   //=coordIndex
 *   //=featureIndex
 *   //=featureSubIndex
 *   return currentCoord;
 * });
 */function coordReduce(geojson,callback,initialValue,excludeWrapCoord){var previousValue=initialValue;coordEach(geojson,function(currentCoord,coordIndex,featureIndex,featureSubIndex){if(coordIndex===0&&initialValue===undefined)previousValue=currentCoord;else previousValue=callback(previousValue,currentCoord,coordIndex,featureIndex,featureSubIndex);},excludeWrapCoord);return previousValue;}/**
 * Callback for propEach
 *
 * @callback propEachCallback
 * @param {Object} currentProperties The current properties being processed.
 * @param {number} featureIndex The index of the current element being processed in the
 * array.Starts at index 0, if an initialValue is provided, and at index 1 otherwise.
 *//**
 * Iterate over properties in any GeoJSON object, similar to Array.forEach()
 *
 * @name propEach
 * @param {(FeatureCollection|Feature)} geojson any GeoJSON object
 * @param {Function} callback a method that takes (currentProperties, featureIndex)
 * @example
 * var features = turf.featureCollection([
 *     turf.point([26, 37], {foo: 'bar'}),
 *     turf.point([36, 53], {hello: 'world'})
 * ]);
 *
 * turf.propEach(features, function (currentProperties, featureIndex) {
 *   //=currentProperties
 *   //=featureIndex
 * });
 */function propEach(geojson,callback){var i;switch(geojson.type){case'FeatureCollection':for(i=0;i<geojson.features.length;i++){callback(geojson.features[i].properties,i);}break;case'Feature':callback(geojson.properties,0);break;}}/**
 * Callback for propReduce
 *
 * The first time the callback function is called, the values provided as arguments depend
 * on whether the reduce method has an initialValue argument.
 *
 * If an initialValue is provided to the reduce method:
 *  - The previousValue argument is initialValue.
 *  - The currentValue argument is the value of the first element present in the array.
 *
 * If an initialValue is not provided:
 *  - The previousValue argument is the value of the first element present in the array.
 *  - The currentValue argument is the value of the second element present in the array.
 *
 * @callback propReduceCallback
 * @param {*} previousValue The accumulated value previously returned in the last invocation
 * of the callback, or initialValue, if supplied.
 * @param {*} currentProperties The current properties being processed.
 * @param {number} featureIndex The index of the current element being processed in the
 * array.Starts at index 0, if an initialValue is provided, and at index 1 otherwise.
 *//**
 * Reduce properties in any GeoJSON object into a single value,
 * similar to how Array.reduce works. However, in this case we lazily run
 * the reduction, so an array of all properties is unnecessary.
 *
 * @name propReduce
 * @param {(FeatureCollection|Feature)} geojson any GeoJSON object
 * @param {Function} callback a method that takes (previousValue, currentProperties, featureIndex)
 * @param {*} [initialValue] Value to use as the first argument to the first call of the callback.
 * @returns {*} The value that results from the reduction.
 * @example
 * var features = turf.featureCollection([
 *     turf.point([26, 37], {foo: 'bar'}),
 *     turf.point([36, 53], {hello: 'world'})
 * ]);
 *
 * turf.propReduce(features, function (previousValue, currentProperties, featureIndex) {
 *   //=previousValue
 *   //=currentProperties
 *   //=featureIndex
 *   return currentProperties
 * });
 */function propReduce(geojson,callback,initialValue){var previousValue=initialValue;propEach(geojson,function(currentProperties,featureIndex){if(featureIndex===0&&initialValue===undefined)previousValue=currentProperties;else previousValue=callback(previousValue,currentProperties,featureIndex);});return previousValue;}/**
 * Callback for featureEach
 *
 * @callback featureEachCallback
 * @param {Feature<any>} currentFeature The current feature being processed.
 * @param {number} featureIndex The index of the current element being processed in the
 * array.Starts at index 0, if an initialValue is provided, and at index 1 otherwise.
 *//**
 * Iterate over features in any GeoJSON object, similar to
 * Array.forEach.
 *
 * @name featureEach
 * @param {(FeatureCollection|Feature|Geometry)} geojson any GeoJSON object
 * @param {Function} callback a method that takes (currentFeature, featureIndex)
 * @example
 * var features = turf.featureCollection([
 *   turf.point([26, 37], {foo: 'bar'}),
 *   turf.point([36, 53], {hello: 'world'})
 * ]);
 *
 * turf.featureEach(features, function (currentFeature, featureIndex) {
 *   //=currentFeature
 *   //=featureIndex
 * });
 */function featureEach(geojson,callback){if(geojson.type==='Feature'){callback(geojson,0);}else if(geojson.type==='FeatureCollection'){for(var i=0;i<geojson.features.length;i++){callback(geojson.features[i],i);}}}/**
 * Callback for featureReduce
 *
 * The first time the callback function is called, the values provided as arguments depend
 * on whether the reduce method has an initialValue argument.
 *
 * If an initialValue is provided to the reduce method:
 *  - The previousValue argument is initialValue.
 *  - The currentValue argument is the value of the first element present in the array.
 *
 * If an initialValue is not provided:
 *  - The previousValue argument is the value of the first element present in the array.
 *  - The currentValue argument is the value of the second element present in the array.
 *
 * @callback featureReduceCallback
 * @param {*} previousValue The accumulated value previously returned in the last invocation
 * of the callback, or initialValue, if supplied.
 * @param {Feature} currentFeature The current Feature being processed.
 * @param {number} featureIndex The index of the current element being processed in the
 * array.Starts at index 0, if an initialValue is provided, and at index 1 otherwise.
 *//**
 * Reduce features in any GeoJSON object, similar to Array.reduce().
 *
 * @name featureReduce
 * @param {(FeatureCollection|Feature|Geometry)} geojson any GeoJSON object
 * @param {Function} callback a method that takes (previousValue, currentFeature, featureIndex)
 * @param {*} [initialValue] Value to use as the first argument to the first call of the callback.
 * @returns {*} The value that results from the reduction.
 * @example
 * var features = turf.featureCollection([
 *   turf.point([26, 37], {"foo": "bar"}),
 *   turf.point([36, 53], {"hello": "world"})
 * ]);
 *
 * turf.featureReduce(features, function (previousValue, currentFeature, featureIndex) {
 *   //=previousValue
 *   //=currentFeature
 *   //=featureIndex
 *   return currentFeature
 * });
 */function featureReduce(geojson,callback,initialValue){var previousValue=initialValue;featureEach(geojson,function(currentFeature,featureIndex){if(featureIndex===0&&initialValue===undefined)previousValue=currentFeature;else previousValue=callback(previousValue,currentFeature,featureIndex);});return previousValue;}/**
 * Get all coordinates from any GeoJSON object.
 *
 * @name coordAll
 * @param {(FeatureCollection|Feature|Geometry)} geojson any GeoJSON object
 * @returns {Array<Array<number>>} coordinate position array
 * @example
 * var features = turf.featureCollection([
 *   turf.point([26, 37], {foo: 'bar'}),
 *   turf.point([36, 53], {hello: 'world'})
 * ]);
 *
 * var coords = turf.coordAll(features);
 * //= [[26, 37], [36, 53]]
 */function coordAll(geojson){var coords=[];coordEach(geojson,function(coord){coords.push(coord);});return coords;}/**
 * Callback for geomEach
 *
 * @callback geomEachCallback
 * @param {Geometry} currentGeometry The current geometry being processed.
 * @param {number} featureIndex The index of the current element being processed in the
 * array. Starts at index 0, if an initialValue is provided, and at index 1 otherwise.
 * @param {Object} featureProperties The current feature properties being processed.
 * @param {Array<number>} featureBBox The current feature BBox being processed.
 * @param {number|string} featureId The current feature Id being processed.
 *//**
 * Iterate over each geometry in any GeoJSON object, similar to Array.forEach()
 *
 * @name geomEach
 * @param {(FeatureCollection|Feature|Geometry)} geojson any GeoJSON object
 * @param {Function} callback a method that takes (currentGeometry, featureIndex, currentProperties)
 * @example
 * var features = turf.featureCollection([
 *     turf.point([26, 37], {foo: 'bar'}),
 *     turf.point([36, 53], {hello: 'world'})
 * ]);
 *
 * turf.geomEach(features, function (currentGeometry, featureIndex, currentProperties) {
 *   //=currentGeometry
 *   //=featureIndex
 *   //=currentProperties
 * });
 */function geomEach(geojson,callback){var i,j,g,geometry$$1,stopG,geometryMaybeCollection,isGeometryCollection,featureProperties,featureBBox,featureId,featureIndex=0,isFeatureCollection=geojson.type==='FeatureCollection',isFeature=geojson.type==='Feature',stop=isFeatureCollection?geojson.features.length:1;// This logic may look a little weird. The reason why it is that way
// is because it's trying to be fast. GeoJSON supports multiple kinds
// of objects at its root: FeatureCollection, Features, Geometries.
// This function has the responsibility of handling all of them, and that
// means that some of the `for` loops you see below actually just don't apply
// to certain inputs. For instance, if you give this just a
// Point geometry, then both loops are short-circuited and all we do
// is gradually rename the input until it's called 'geometry'.
//
// This also aims to allocate as few resources as possible: just a
// few numbers and booleans, rather than any temporary arrays as would
// be required with the normalization approach.
for(i=0;i<stop;i++){geometryMaybeCollection=isFeatureCollection?geojson.features[i].geometry:isFeature?geojson.geometry:geojson;featureProperties=isFeatureCollection?geojson.features[i].properties:isFeature?geojson.properties:{};featureBBox=isFeatureCollection?geojson.features[i].bbox:isFeature?geojson.bbox:undefined;featureId=isFeatureCollection?geojson.features[i].id:isFeature?geojson.id:undefined;isGeometryCollection=geometryMaybeCollection?geometryMaybeCollection.type==='GeometryCollection':false;stopG=isGeometryCollection?geometryMaybeCollection.geometries.length:1;for(g=0;g<stopG;g++){geometry$$1=isGeometryCollection?geometryMaybeCollection.geometries[g]:geometryMaybeCollection;// Handle null Geometry
if(geometry$$1===null){callback(null,featureIndex,featureProperties,featureBBox,featureId);continue;}switch(geometry$$1.type){case'Point':case'LineString':case'MultiPoint':case'Polygon':case'MultiLineString':case'MultiPolygon':{callback(geometry$$1,featureIndex,featureProperties,featureBBox,featureId);break;}case'GeometryCollection':{for(j=0;j<geometry$$1.geometries.length;j++){callback(geometry$$1.geometries[j],featureIndex,featureProperties,featureBBox,featureId);}break;}default:throw new Error('Unknown Geometry Type');}}// Only increase `featureIndex` per each feature
featureIndex++;}}/**
 * Callback for geomReduce
 *
 * The first time the callback function is called, the values provided as arguments depend
 * on whether the reduce method has an initialValue argument.
 *
 * If an initialValue is provided to the reduce method:
 *  - The previousValue argument is initialValue.
 *  - The currentValue argument is the value of the first element present in the array.
 *
 * If an initialValue is not provided:
 *  - The previousValue argument is the value of the first element present in the array.
 *  - The currentValue argument is the value of the second element present in the array.
 *
 * @callback geomReduceCallback
 * @param {*} previousValue The accumulated value previously returned in the last invocation
 * of the callback, or initialValue, if supplied.
 * @param {Geometry} currentGeometry The current Feature being processed.
 * @param {number} currentIndex The index of the current element being processed in the
 * array.Starts at index 0, if an initialValue is provided, and at index 1 otherwise.
 * @param {Object} currentProperties The current feature properties being processed.
 *//**
 * Reduce geometry in any GeoJSON object, similar to Array.reduce().
 *
 * @name geomReduce
 * @param {(FeatureCollection|Feature|Geometry)} geojson any GeoJSON object
 * @param {Function} callback a method that takes (previousValue, currentGeometry, featureIndex, currentProperties)
 * @param {*} [initialValue] Value to use as the first argument to the first call of the callback.
 * @returns {*} The value that results from the reduction.
 * @example
 * var features = turf.featureCollection([
 *     turf.point([26, 37], {foo: 'bar'}),
 *     turf.point([36, 53], {hello: 'world'})
 * ]);
 *
 * turf.geomReduce(features, function (previousValue, currentGeometry, featureIndex, currentProperties) {
 *   //=previousValue
 *   //=currentGeometry
 *   //=featureIndex
 *   //=currentProperties
 *   return currentGeometry
 * });
 */function geomReduce(geojson,callback,initialValue){var previousValue=initialValue;geomEach(geojson,function(currentGeometry,currentIndex,currentProperties){if(currentIndex===0&&initialValue===undefined)previousValue=currentGeometry;else previousValue=callback(previousValue,currentGeometry,currentIndex,currentProperties);});return previousValue;}/**
 * Callback for flattenEach
 *
 * @callback flattenEachCallback
 * @param {Feature} currentFeature The current flattened feature being processed.
 * @param {number} featureIndex The index of the current element being processed in the
 * array. Starts at index 0, if an initialValue is provided, and at index 1 otherwise.
 * @param {number} featureSubIndex The subindex of the current element being processed in the
 * array. Starts at index 0 and increases if the flattened feature was a multi-geometry.
 *//**
 * Iterate over flattened features in any GeoJSON object, similar to
 * Array.forEach.
 *
 * @name flattenEach
 * @param {(FeatureCollection|Feature|Geometry)} geojson any GeoJSON object
 * @param {Function} callback a method that takes (currentFeature, featureIndex, featureSubIndex)
 * @example
 * var features = turf.featureCollection([
 *     turf.point([26, 37], {foo: 'bar'}),
 *     turf.multiPoint([[40, 30], [36, 53]], {hello: 'world'})
 * ]);
 *
 * turf.flattenEach(features, function (currentFeature, featureIndex, featureSubIndex) {
 *   //=currentFeature
 *   //=featureIndex
 *   //=featureSubIndex
 * });
 */function flattenEach(geojson,callback){geomEach(geojson,function(geometry$$1,featureIndex,properties,bbox,id){// Callback for single geometry
var type=geometry$$1===null?null:geometry$$1.type;switch(type){case null:case'Point':case'LineString':case'Polygon':callback(feature(geometry$$1,properties,bbox,id),featureIndex,0);return;}var geomType;// Callback for multi-geometry
switch(type){case'MultiPoint':geomType='Point';break;case'MultiLineString':geomType='LineString';break;case'MultiPolygon':geomType='Polygon';break;}geometry$$1.coordinates.forEach(function(coordinate,featureSubIndex){var geom={type:geomType,coordinates:coordinate};callback(feature(geom,properties),featureIndex,featureSubIndex);});});}/**
 * Callback for flattenReduce
 *
 * The first time the callback function is called, the values provided as arguments depend
 * on whether the reduce method has an initialValue argument.
 *
 * If an initialValue is provided to the reduce method:
 *  - The previousValue argument is initialValue.
 *  - The currentValue argument is the value of the first element present in the array.
 *
 * If an initialValue is not provided:
 *  - The previousValue argument is the value of the first element present in the array.
 *  - The currentValue argument is the value of the second element present in the array.
 *
 * @callback flattenReduceCallback
 * @param {*} previousValue The accumulated value previously returned in the last invocation
 * of the callback, or initialValue, if supplied.
 * @param {Feature} currentFeature The current Feature being processed.
 * @param {number} featureIndex The index of the current element being processed in the
 * array.Starts at index 0, if an initialValue is provided, and at index 1 otherwise.
 * @param {number} featureSubIndex The subindex of the current element being processed in the
 * array. Starts at index 0 and increases if the flattened feature was a multi-geometry.
 *//**
 * Reduce flattened features in any GeoJSON object, similar to Array.reduce().
 *
 * @name flattenReduce
 * @param {(FeatureCollection|Feature|Geometry)} geojson any GeoJSON object
 * @param {Function} callback a method that takes (previousValue, currentFeature, featureIndex, featureSubIndex)
 * @param {*} [initialValue] Value to use as the first argument to the first call of the callback.
 * @returns {*} The value that results from the reduction.
 * @example
 * var features = turf.featureCollection([
 *     turf.point([26, 37], {foo: 'bar'}),
 *     turf.multiPoint([[40, 30], [36, 53]], {hello: 'world'})
 * ]);
 *
 * turf.flattenReduce(features, function (previousValue, currentFeature, featureIndex, featureSubIndex) {
 *   //=previousValue
 *   //=currentFeature
 *   //=featureIndex
 *   //=featureSubIndex
 *   return currentFeature
 * });
 */function flattenReduce(geojson,callback,initialValue){var previousValue=initialValue;flattenEach(geojson,function(currentFeature,featureIndex,featureSubIndex){if(featureIndex===0&&featureSubIndex===0&&initialValue===undefined)previousValue=currentFeature;else previousValue=callback(previousValue,currentFeature,featureIndex,featureSubIndex);});return previousValue;}/**
 * Callback for segmentEach
 *
 * @callback segmentEachCallback
 * @param {Feature<LineString>} currentSegment The current segment being processed.
 * @param {number} featureIndex The featureIndex currently being processed, starts at index 0.
 * @param {number} featureSubIndex The featureSubIndex currently being processed, starts at index 0.
 * @param {number} segmentIndex The segmentIndex currently being processed, starts at index 0.
 * @returns {void}
 *//**
 * Iterate over 2-vertex line segment in any GeoJSON object, similar to Array.forEach()
 * (Multi)Point geometries do not contain segments therefore they are ignored during this operation.
 *
 * @param {(FeatureCollection|Feature|Geometry)} geojson any GeoJSON
 * @param {Function} callback a method that takes (currentSegment, featureIndex, featureSubIndex)
 * @returns {void}
 * @example
 * var polygon = turf.polygon([[[-50, 5], [-40, -10], [-50, -10], [-40, 5], [-50, 5]]]);
 *
 * // Iterate over GeoJSON by 2-vertex segments
 * turf.segmentEach(polygon, function (currentSegment, featureIndex, featureSubIndex, segmentIndex) {
 *   //= currentSegment
 *   //= featureIndex
 *   //= featureSubIndex
 *   //= segmentIndex
 * });
 *
 * // Calculate the total number of segments
 * var total = 0;
 * turf.segmentEach(polygon, function () {
 *     total++;
 * });
 */function segmentEach(geojson,callback){flattenEach(geojson,function(feature$$1,featureIndex,featureSubIndex){var segmentIndex=0;// Exclude null Geometries
if(!feature$$1.geometry)return;// (Multi)Point geometries do not contain segments therefore they are ignored during this operation.
var type=feature$$1.geometry.type;if(type==='Point'||type==='MultiPoint')return;// Generate 2-vertex line segments
coordReduce(feature$$1,function(previousCoords,currentCoord){var currentSegment=lineString([previousCoords,currentCoord],feature$$1.properties);callback(currentSegment,featureIndex,featureSubIndex,segmentIndex);segmentIndex++;return currentCoord;});});}/**
 * Callback for segmentReduce
 *
 * The first time the callback function is called, the values provided as arguments depend
 * on whether the reduce method has an initialValue argument.
 *
 * If an initialValue is provided to the reduce method:
 *  - The previousValue argument is initialValue.
 *  - The currentValue argument is the value of the first element present in the array.
 *
 * If an initialValue is not provided:
 *  - The previousValue argument is the value of the first element present in the array.
 *  - The currentValue argument is the value of the second element present in the array.
 *
 * @callback segmentReduceCallback
 * @param {*} [previousValue] The accumulated value previously returned in the last invocation
 * of the callback, or initialValue, if supplied.
 * @param {Feature<LineString>} [currentSegment] The current segment being processed.
 * @param {number} featureIndex The featureIndex currently being processed, starts at index 0.
 * @param {number} featureSubIndex The featureSubIndex currently being processed, starts at index 0.
 * @param {number} segmentIndex The segmentIndex currently being processed, starts at index 0.
 *//**
 * Reduce 2-vertex line segment in any GeoJSON object, similar to Array.reduce()
 * (Multi)Point geometries do not contain segments therefore they are ignored during this operation.
 *
 * @param {(FeatureCollection|Feature|Geometry)} geojson any GeoJSON
 * @param {Function} callback a method that takes (previousValue, currentSegment, currentIndex)
 * @param {*} [initialValue] Value to use as the first argument to the first call of the callback.
 * @returns {void}
 * @example
 * var polygon = turf.polygon([[[-50, 5], [-40, -10], [-50, -10], [-40, 5], [-50, 5]]]);
 *
 * // Iterate over GeoJSON by 2-vertex segments
 * turf.segmentReduce(polygon, function (previousSegment, currentSegment, featureIndex, featureSubIndex, segmentIndex) {
 *   //= previousSegment
 *   //= currentSegment
 *   //= featureIndex
 *   //= featureSubIndex
 *   //= segmentInex
 *   return currentSegment
 * });
 *
 * // Calculate the total number of segments
 * var initialValue = 0
 * var total = turf.segmentReduce(polygon, function (previousValue) {
 *     previousValue++;
 *     return previousValue;
 * }, initialValue);
 */function segmentReduce(geojson,callback,initialValue){var previousValue=initialValue;var started=false;segmentEach(geojson,function(currentSegment,featureIndex,featureSubIndex,segmentIndex){if(started===false&&initialValue===undefined)previousValue=currentSegment;else previousValue=callback(previousValue,currentSegment,featureIndex,featureSubIndex,segmentIndex);started=true;});return previousValue;}/**
 * Callback for lineEach
 *
 * @callback lineEachCallback
 * @param {Feature<LineString>} currentLine The current LineString|LinearRing being processed.
 * @param {number} featureIndex The feature index of the current element being processed in the array, starts at index 0.
 * @param {number} featureSubIndex The feature sub-index of the current line being processed at index 0
 * @param {number} lineIndex The current line being processed at index 0
 *//**
 * Iterate over line or ring coordinates in LineString, Polygon, MultiLineString, MultiPolygon Features or Geometries,
 * similar to Array.forEach.
 *
 * @name lineEach
 * @param {Geometry|Feature<LineString|Polygon|MultiLineString|MultiPolygon>} geojson object
 * @param {Function} callback a method that takes (currentLine, featureIndex, featureSubIndex, lineIndex)
 * @example
 * var multiLine = turf.multiLineString([
 *   [[26, 37], [35, 45]],
 *   [[36, 53], [38, 50], [41, 55]]
 * ]);
 *
 * turf.lineEach(multiLine, function (currentLine, featureIndex, featureSubIndex, lineIndex) {
 *   //=currentLine
 *   //=featureIndex
 *   //=featureSubIndex
 *   //=lineIndex
 * });
 */function lineEach(geojson,callback){// validation
if(!geojson)throw new Error('geojson is required');flattenEach(geojson,function(feature$$1,featureIndex,featureSubIndex){if(feature$$1.geometry===null)return;var type=feature$$1.geometry.type;var coords=feature$$1.geometry.coordinates;switch(type){case'LineString':callback(feature$$1,featureIndex,featureSubIndex,0);break;case'Polygon':for(var lineIndex=0;lineIndex<coords.length;lineIndex++){callback(lineString(coords[lineIndex],feature$$1.properties),featureIndex,featureSubIndex,lineIndex);}break;}});}/**
 * Callback for lineReduce
 *
 * The first time the callback function is called, the values provided as arguments depend
 * on whether the reduce method has an initialValue argument.
 *
 * If an initialValue is provided to the reduce method:
 *  - The previousValue argument is initialValue.
 *  - The currentValue argument is the value of the first element present in the array.
 *
 * If an initialValue is not provided:
 *  - The previousValue argument is the value of the first element present in the array.
 *  - The currentValue argument is the value of the second element present in the array.
 *
 * @callback lineReduceCallback
 * @param {*} previousValue The accumulated value previously returned in the last invocation
 * of the callback, or initialValue, if supplied.
 * @param {Feature<LineString>} currentLine The current LineString|LinearRing being processed.
 * @param {number} featureIndex The feature index of the current element being processed in the array, starts at index 0.
 * @param {number} featureSubIndex The feature sub-index of the current line being processed at index 0
 * @param {number} lineIndex The current line being processed at index 0
 *//**
 * Reduce features in any GeoJSON object, similar to Array.reduce().
 *
 * @name lineReduce
 * @param {Geometry|Feature<LineString|Polygon|MultiLineString|MultiPolygon>} geojson object
 * @param {Function} callback a method that takes (previousValue, currentFeature, featureIndex)
 * @param {*} [initialValue] Value to use as the first argument to the first call of the callback.
 * @returns {*} The value that results from the reduction.
 * @example
 * var mtp = turf.multiPolygon([
 *   turf.polygon([[[12,48],[2,41],[24,38],[12,48]], [[9,44],[13,41],[13,45],[9,44]]]),
 *   turf.polygon([[[5, 5], [0, 0], [2, 2], [4, 4], [5, 5]]])
 * ]);
 *
 * turf.lineReduce(mtp, function (previousValue, currentLine, featureIndex, featureSubIndex, lineIndex) {
 *   //=previousValue
 *   //=currentLine
 *   //=featureIndex
 *   //=featureSubIndex
 *   //=lineIndex
 *   return currentLine
 * }, 2);
 */function lineReduce(geojson,callback,initialValue){var previousValue=initialValue;lineEach(geojson,function(currentLine,featureIndex,featureSubIndex,lineIndex){if(featureIndex===0&&initialValue===undefined)previousValue=currentLine;else previousValue=callback(previousValue,currentLine,featureIndex,featureSubIndex,lineIndex);});return previousValue;}var meta={coordEach:coordEach,coordReduce:coordReduce,propEach:propEach,propReduce:propReduce,featureEach:featureEach,featureReduce:featureReduce,coordAll:coordAll,geomEach:geomEach,geomReduce:geomReduce,flattenEach:flattenEach,flattenReduce:flattenReduce,segmentEach:segmentEach,segmentReduce:segmentReduce,lineEach:lineEach,lineReduce:lineReduce};var meta$2=Object.freeze({coordEach:coordEach,coordReduce:coordReduce,propEach:propEach,propReduce:propReduce,featureEach:featureEach,featureReduce:featureReduce,coordAll:coordAll,geomEach:geomEach,geomReduce:geomReduce,flattenEach:flattenEach,flattenReduce:flattenReduce,segmentEach:segmentEach,segmentReduce:segmentReduce,lineEach:lineEach,lineReduce:lineReduce,default:meta});/**
 * Takes a {@link GeoJSON} object and returns a simplified version. Internally uses
 * [simplify-js](http://mourner.github.io/simplify-js/) to perform simplification.
 *
 * @name simplify
 * @param {GeoJSON} geojson object to be simplified
 * @param {Object} [options={}] Optional parameters
 * @param {number} [options.tolerance=1] simplification tolerance
 * @param {boolean} [options.highQuality=false] whether or not to spend more time to create a higher-quality simplification with a different algorithm
 * @param {boolean} [options.mutate=false] allows GeoJSON input to be mutated (significant performance increase if true)
 * @returns {GeoJSON} a simplified GeoJSON
 * @example
 * var geojson = turf.polygon([[
 *   [-70.603637, -33.399918],
 *   [-70.614624, -33.395332],
 *   [-70.639343, -33.392466],
 *   [-70.659942, -33.394759],
 *   [-70.683975, -33.404504],
 *   [-70.697021, -33.419406],
 *   [-70.701141, -33.434306],
 *   [-70.700454, -33.446339],
 *   [-70.694274, -33.458369],
 *   [-70.682601, -33.465816],
 *   [-70.668869, -33.472117],
 *   [-70.646209, -33.473835],
 *   [-70.624923, -33.472117],
 *   [-70.609817, -33.468107],
 *   [-70.595397, -33.458369],
 *   [-70.587158, -33.442901],
 *   [-70.587158, -33.426283],
 *   [-70.590591, -33.414248],
 *   [-70.594711, -33.406224],
 *   [-70.603637, -33.399918]
 * ]]);
 * var options = {tolerance: 0.01, highQuality: false};
 * var simplified = turf.simplify(geojson, options);
 *
 * //addToMap
 * var addToMap = [geojson, simplified]
 */function simplify(geojson,options){// Optional parameters
options=options||{};if(!isObject$2(options))throw new Error('options is invalid');var tolerance=options.tolerance;var highQuality=options.highQuality;var mutate=options.mutate;if(!geojson)throw new Error('geojson is required');if(tolerance&&tolerance<0)throw new Error('invalid tolerance');// Clone geojson to avoid side effects
if(mutate!==true)geojson=clone(geojson);geomEach(geojson,function(geom){simplifyGeom(geom,tolerance,highQuality);});return geojson;}/**
 * Simplifies a feature's coordinates
 *
 * @private
 * @param {Geometry} geometry to be simplified
 * @param {number} [tolerance=1] simplification tolerance
 * @param {boolean} [highQuality=false] whether or not to spend more time to create a higher-quality simplification with a different algorithm
 * @returns {Geometry} output
 */function simplifyGeom(geometry$$1,tolerance,highQuality){var type=geometry$$1.type;// "unsimplyfiable" geometry types
if(type==='Point'||type==='MultiPoint')return geometry$$1;// Remove any extra coordinates
cleanCoords(geometry$$1,true);var coordinates=geometry$$1.coordinates;switch(type){case'LineString':geometry$$1['coordinates']=simplifyLine(coordinates,tolerance,highQuality);break;case'MultiLineString':geometry$$1['coordinates']=coordinates.map(function(lines){return simplifyLine(lines,tolerance,highQuality);});break;case'Polygon':geometry$$1['coordinates']=simplifyPolygon(coordinates,tolerance,highQuality);break;case'MultiPolygon':geometry$$1['coordinates']=coordinates.map(function(rings){return simplifyPolygon(rings,tolerance,highQuality);});}return geometry$$1;}/**
 * Simplifies the coordinates of a LineString with simplify-js
 *
 * @private
 * @param {Array<number>} coordinates to be processed
 * @param {number} tolerance simplification tolerance
 * @param {boolean} highQuality whether or not to spend more time to create a higher-quality
 * @returns {Array<Array<number>>} simplified coords
 */function simplifyLine(coordinates,tolerance,highQuality){return simplify$2(coordinates.map(function(coord){return{x:coord[0],y:coord[1],z:coord[2]};}),tolerance,highQuality).map(function(coords){return coords.z?[coords.x,coords.y,coords.z]:[coords.x,coords.y];});}/**
 * Simplifies the coordinates of a Polygon with simplify-js
 *
 * @private
 * @param {Array<number>} coordinates to be processed
 * @param {number} tolerance simplification tolerance
 * @param {boolean} highQuality whether or not to spend more time to create a higher-quality
 * @returns {Array<Array<Array<number>>>} simplified coords
 */function simplifyPolygon(coordinates,tolerance,highQuality){return coordinates.map(function(ring){var pts=ring.map(function(coord){return{x:coord[0],y:coord[1]};});if(pts.length<4){throw new Error('invalid polygon');}var simpleRing=simplify$2(pts,tolerance,highQuality).map(function(coords){return[coords.x,coords.y];});//remove 1 percent of tolerance until enough points to make a triangle
while(!checkValidity(simpleRing)){tolerance-=tolerance*0.01;simpleRing=simplify$2(pts,tolerance,highQuality).map(function(coords){return[coords.x,coords.y];});}if(simpleRing[simpleRing.length-1][0]!==simpleRing[0][0]||simpleRing[simpleRing.length-1][1]!==simpleRing[0][1]){simpleRing.push(simpleRing[0]);}return simpleRing;});}/**
 * Returns true if ring has at least 3 coordinates and its first coordinate is the same as its last
 *
 * @private
 * @param {Array<number>} ring coordinates to be checked
 * @returns {boolean} true if valid
 */function checkValidity(ring){if(ring.length<3)return false;//if the last point is the same as the first, it's not a triangle
return!(ring.length===3&&ring[2][0]===ring[0][0]&&ring[2][1]===ring[0][1]);}'use strict';var quickselect=partialSort;// Floyd-Rivest selection algorithm:
// Rearrange items so that all items in the [left, k] range are smaller than all items in (k, right];
// The k-th element will have the (k - left + 1)th smallest value in [left, right]
function partialSort(arr,k,left,right,compare){left=left||0;right=right||arr.length-1;compare=compare||defaultCompare;while(right>left){if(right-left>600){var n=right-left+1;var m=k-left+1;var z=Math.log(n);var s=0.5*Math.exp(2*z/3);var sd=0.5*Math.sqrt(z*s*(n-s)/n)*(m-n/2<0?-1:1);var newLeft=Math.max(left,Math.floor(k-m*s/n+sd));var newRight=Math.min(right,Math.floor(k+(n-m)*s/n+sd));partialSort(arr,k,newLeft,newRight,compare);}var t=arr[k];var i=left;var j=right;swap(arr,left,k);if(compare(arr[right],t)>0)swap(arr,left,right);while(i<j){swap(arr,i,j);i++;j--;while(compare(arr[i],t)<0){i++;}while(compare(arr[j],t)>0){j--;}}if(compare(arr[left],t)===0)swap(arr,left,j);else{j++;swap(arr,j,right);}if(j<=k)left=j+1;if(k<=j)right=j-1;}}function swap(arr,i,j){var tmp=arr[i];arr[i]=arr[j];arr[j]=tmp;}function defaultCompare(a,b){return a<b?-1:a>b?1:0;}'use strict';var rbush_1=rbush$1;function rbush$1(maxEntries,format){if(!(this instanceof rbush$1))return new rbush$1(maxEntries,format);// max entries in a node is 9 by default; min node fill is 40% for best performance
this._maxEntries=Math.max(4,maxEntries||9);this._minEntries=Math.max(2,Math.ceil(this._maxEntries*0.4));if(format){this._initFormat(format);}this.clear();}rbush$1.prototype={all:function all(){return this._all(this.data,[]);},search:function search(bbox){var node=this.data,result=[],toBBox=this.toBBox;if(!intersects$1(bbox,node))return result;var nodesToSearch=[],i,len,child,childBBox;while(node){for(i=0,len=node.children.length;i<len;i++){child=node.children[i];childBBox=node.leaf?toBBox(child):child;if(intersects$1(bbox,childBBox)){if(node.leaf)result.push(child);else if(contains(bbox,childBBox))this._all(child,result);else nodesToSearch.push(child);}}node=nodesToSearch.pop();}return result;},collides:function collides(bbox){var node=this.data,toBBox=this.toBBox;if(!intersects$1(bbox,node))return false;var nodesToSearch=[],i,len,child,childBBox;while(node){for(i=0,len=node.children.length;i<len;i++){child=node.children[i];childBBox=node.leaf?toBBox(child):child;if(intersects$1(bbox,childBBox)){if(node.leaf||contains(bbox,childBBox))return true;nodesToSearch.push(child);}}node=nodesToSearch.pop();}return false;},load:function load(data){if(!(data&&data.length))return this;if(data.length<this._minEntries){for(var i=0,len=data.length;i<len;i++){this.insert(data[i]);}return this;}// recursively build the tree with the given data from stratch using OMT algorithm
var node=this._build(data.slice(),0,data.length-1,0);if(!this.data.children.length){// save as is if tree is empty
this.data=node;}else if(this.data.height===node.height){// split root if trees have the same height
this._splitRoot(this.data,node);}else{if(this.data.height<node.height){// swap trees if inserted one is bigger
var tmpNode=this.data;this.data=node;node=tmpNode;}// insert the small tree into the large tree at appropriate level
this._insert(node,this.data.height-node.height-1,true);}return this;},insert:function insert(item){if(item)this._insert(item,this.data.height-1);return this;},clear:function clear(){this.data=createNode([]);return this;},remove:function remove(item,equalsFn){if(!item)return this;var node=this.data,bbox=this.toBBox(item),path=[],indexes=[],i,parent,index,goingUp;// depth-first iterative tree traversal
while(node||path.length){if(!node){// go up
node=path.pop();parent=path[path.length-1];i=indexes.pop();goingUp=true;}if(node.leaf){// check current node
index=findItem(item,node.children,equalsFn);if(index!==-1){// item found, remove the item and condense tree upwards
node.children.splice(index,1);path.push(node);this._condense(path);return this;}}if(!goingUp&&!node.leaf&&contains(node,bbox)){// go down
path.push(node);indexes.push(i);i=0;parent=node;node=node.children[0];}else if(parent){// go right
i++;node=parent.children[i];goingUp=false;}else node=null;// nothing found
}return this;},toBBox:function toBBox(item){return item;},compareMinX:compareNodeMinX,compareMinY:compareNodeMinY,toJSON:function toJSON(){return this.data;},fromJSON:function fromJSON(data){this.data=data;return this;},_all:function _all(node,result){var nodesToSearch=[];while(node){if(node.leaf)result.push.apply(result,node.children);else nodesToSearch.push.apply(nodesToSearch,node.children);node=nodesToSearch.pop();}return result;},_build:function _build(items,left,right,height){var N=right-left+1,M=this._maxEntries,node;if(N<=M){// reached leaf level; return leaf
node=createNode(items.slice(left,right+1));calcBBox(node,this.toBBox);return node;}if(!height){// target height of the bulk-loaded tree
height=Math.ceil(Math.log(N)/Math.log(M));// target number of root entries to maximize storage utilization
M=Math.ceil(N/Math.pow(M,height-1));}node=createNode([]);node.leaf=false;node.height=height;// split the items into M mostly square tiles
var N2=Math.ceil(N/M),N1=N2*Math.ceil(Math.sqrt(M)),i,j,right2,right3;multiSelect(items,left,right,N1,this.compareMinX);for(i=left;i<=right;i+=N1){right2=Math.min(i+N1-1,right);multiSelect(items,i,right2,N2,this.compareMinY);for(j=i;j<=right2;j+=N2){right3=Math.min(j+N2-1,right2);// pack each entry recursively
node.children.push(this._build(items,j,right3,height-1));}}calcBBox(node,this.toBBox);return node;},_chooseSubtree:function _chooseSubtree(bbox,node,level,path){var i,len,child,targetNode,area,enlargement,minArea,minEnlargement;while(true){path.push(node);if(node.leaf||path.length-1===level)break;minArea=minEnlargement=Infinity;for(i=0,len=node.children.length;i<len;i++){child=node.children[i];area=bboxArea(child);enlargement=enlargedArea(bbox,child)-area;// choose entry with the least area enlargement
if(enlargement<minEnlargement){minEnlargement=enlargement;minArea=area<minArea?area:minArea;targetNode=child;}else if(enlargement===minEnlargement){// otherwise choose one with the smallest area
if(area<minArea){minArea=area;targetNode=child;}}}node=targetNode||node.children[0];}return node;},_insert:function _insert(item,level,isNode){var toBBox=this.toBBox,bbox=isNode?item:toBBox(item),insertPath=[];// find the best node for accommodating the item, saving all nodes along the path too
var node=this._chooseSubtree(bbox,this.data,level,insertPath);// put the item into the node
node.children.push(item);extend(node,bbox);// split on node overflow; propagate upwards if necessary
while(level>=0){if(insertPath[level].children.length>this._maxEntries){this._split(insertPath,level);level--;}else break;}// adjust bboxes along the insertion path
this._adjustParentBBoxes(bbox,insertPath,level);},// split overflowed node into two
_split:function _split(insertPath,level){var node=insertPath[level],M=node.children.length,m=this._minEntries;this._chooseSplitAxis(node,m,M);var splitIndex=this._chooseSplitIndex(node,m,M);var newNode=createNode(node.children.splice(splitIndex,node.children.length-splitIndex));newNode.height=node.height;newNode.leaf=node.leaf;calcBBox(node,this.toBBox);calcBBox(newNode,this.toBBox);if(level)insertPath[level-1].children.push(newNode);else this._splitRoot(node,newNode);},_splitRoot:function _splitRoot(node,newNode){// split root node
this.data=createNode([node,newNode]);this.data.height=node.height+1;this.data.leaf=false;calcBBox(this.data,this.toBBox);},_chooseSplitIndex:function _chooseSplitIndex(node,m,M){var i,bbox1,bbox2,overlap,area,minOverlap,minArea,index;minOverlap=minArea=Infinity;for(i=m;i<=M-m;i++){bbox1=distBBox(node,0,i,this.toBBox);bbox2=distBBox(node,i,M,this.toBBox);overlap=intersectionArea(bbox1,bbox2);area=bboxArea(bbox1)+bboxArea(bbox2);// choose distribution with minimum overlap
if(overlap<minOverlap){minOverlap=overlap;index=i;minArea=area<minArea?area:minArea;}else if(overlap===minOverlap){// otherwise choose distribution with minimum area
if(area<minArea){minArea=area;index=i;}}}return index;},// sorts node children by the best axis for split
_chooseSplitAxis:function _chooseSplitAxis(node,m,M){var compareMinX=node.leaf?this.compareMinX:compareNodeMinX,compareMinY=node.leaf?this.compareMinY:compareNodeMinY,xMargin=this._allDistMargin(node,m,M,compareMinX),yMargin=this._allDistMargin(node,m,M,compareMinY);// if total distributions margin value is minimal for x, sort by minX,
// otherwise it's already sorted by minY
if(xMargin<yMargin)node.children.sort(compareMinX);},// total margin of all possible split distributions where each node is at least m full
_allDistMargin:function _allDistMargin(node,m,M,compare){node.children.sort(compare);var toBBox=this.toBBox,leftBBox=distBBox(node,0,m,toBBox),rightBBox=distBBox(node,M-m,M,toBBox),margin=bboxMargin(leftBBox)+bboxMargin(rightBBox),i,child;for(i=m;i<M-m;i++){child=node.children[i];extend(leftBBox,node.leaf?toBBox(child):child);margin+=bboxMargin(leftBBox);}for(i=M-m-1;i>=m;i--){child=node.children[i];extend(rightBBox,node.leaf?toBBox(child):child);margin+=bboxMargin(rightBBox);}return margin;},_adjustParentBBoxes:function _adjustParentBBoxes(bbox,path,level){// adjust bboxes along the given tree path
for(var i=level;i>=0;i--){extend(path[i],bbox);}},_condense:function _condense(path){// go through the path, removing empty nodes and updating bboxes
for(var i=path.length-1,siblings;i>=0;i--){if(path[i].children.length===0){if(i>0){siblings=path[i-1].children;siblings.splice(siblings.indexOf(path[i]),1);}else this.clear();}else calcBBox(path[i],this.toBBox);}},_initFormat:function _initFormat(format){// data format (minX, minY, maxX, maxY accessors)
// uses eval-type function compilation instead of just accepting a toBBox function
// because the algorithms are very sensitive to sorting functions performance,
// so they should be dead simple and without inner calls
var compareArr=['return a',' - b',';'];this.compareMinX=new Function('a','b',compareArr.join(format[0]));this.compareMinY=new Function('a','b',compareArr.join(format[1]));this.toBBox=new Function('a','return {minX: a'+format[0]+', minY: a'+format[1]+', maxX: a'+format[2]+', maxY: a'+format[3]+'};');}};function findItem(item,items,equalsFn){if(!equalsFn)return items.indexOf(item);for(var i=0;i<items.length;i++){if(equalsFn(item,items[i]))return i;}return-1;}// calculate node's bbox from bboxes of its children
function calcBBox(node,toBBox){distBBox(node,0,node.children.length,toBBox,node);}// min bounding rectangle of node children from k to p-1
function distBBox(node,k,p,toBBox,destNode){if(!destNode)destNode=createNode(null);destNode.minX=Infinity;destNode.minY=Infinity;destNode.maxX=-Infinity;destNode.maxY=-Infinity;for(var i=k,child;i<p;i++){child=node.children[i];extend(destNode,node.leaf?toBBox(child):child);}return destNode;}function extend(a,b){a.minX=Math.min(a.minX,b.minX);a.minY=Math.min(a.minY,b.minY);a.maxX=Math.max(a.maxX,b.maxX);a.maxY=Math.max(a.maxY,b.maxY);return a;}function compareNodeMinX(a,b){return a.minX-b.minX;}function compareNodeMinY(a,b){return a.minY-b.minY;}function bboxArea(a){return(a.maxX-a.minX)*(a.maxY-a.minY);}function bboxMargin(a){return a.maxX-a.minX+(a.maxY-a.minY);}function enlargedArea(a,b){return(Math.max(b.maxX,a.maxX)-Math.min(b.minX,a.minX))*(Math.max(b.maxY,a.maxY)-Math.min(b.minY,a.minY));}function intersectionArea(a,b){var minX=Math.max(a.minX,b.minX),minY=Math.max(a.minY,b.minY),maxX=Math.min(a.maxX,b.maxX),maxY=Math.min(a.maxY,b.maxY);return Math.max(0,maxX-minX)*Math.max(0,maxY-minY);}function contains(a,b){return a.minX<=b.minX&&a.minY<=b.minY&&b.maxX<=a.maxX&&b.maxY<=a.maxY;}function intersects$1(a,b){return b.minX<=a.maxX&&b.minY<=a.maxY&&b.maxX>=a.minX&&b.maxY>=a.minY;}function createNode(children){return{children:children,height:1,leaf:true,minX:Infinity,minY:Infinity,maxX:-Infinity,maxY:-Infinity};}// sort an array so that items come in groups of n unsorted items, with groups sorted between each other;
// combines selection algorithm with binary divide & conquer approach
function multiSelect(arr,left,right,n,compare){var stack=[left,right],mid;while(stack.length){right=stack.pop();left=stack.pop();if(right-left<=n)continue;mid=left+Math.ceil((right-left)/n/2)*n;quickselect(arr,mid,left,right,compare);stack.push(left,mid,mid,right);}}var meta$3=meta$2&&meta||meta$2;var featureEach$1=meta$3.featureEach;var coordEach$1=meta$3.coordEach;var geojsonRbush_1=geojsonRbush;var default_1=geojsonRbush;/**
 * GeoJSON implementation of [RBush](https://github.com/mourner/rbush#rbush) spatial index.
 *
 * @name rbush
 * @param {number} [maxEntries=9] defines the maximum number of entries in a tree node. 9 (used by default) is a
 * reasonable choice for most applications. Higher value means faster insertion and slower search, and vice versa.
 * @returns {RBush} GeoJSON RBush
 * @example
 * var rbush = require('geojson-rbush')
 * var tree = rbush()
 */function geojsonRbush(maxEntries){var tree=rbush_1(maxEntries);/**
     * [insert](https://github.com/mourner/rbush#data-format)
     *
     * @param {Feature<any>} feature insert single GeoJSON Feature
     * @returns {RBush} GeoJSON RBush
     * @example
     * var polygon = {
     *   "type": "Feature",
     *   "properties": {},
     *   "geometry": {
     *     "type": "Polygon",
     *     "coordinates": [[[-78, 41], [-67, 41], [-67, 48], [-78, 48], [-78, 41]]]
     *   }
     * }
     * tree.insert(polygon)
     */tree.insert=function(feature){if(Array.isArray(feature)){var bbox=feature;feature=bboxPolygon(bbox);feature.bbox=bbox;}else{feature.bbox=feature.bbox?feature.bbox:turfBBox(feature);}return rbush_1.prototype.insert.call(this,feature);};/**
     * [load](https://github.com/mourner/rbush#bulk-inserting-data)
     *
     * @param {BBox[]|FeatureCollection<any>} features load entire GeoJSON FeatureCollection
     * @returns {RBush} GeoJSON RBush
     * @example
     * var polygons = {
     *   "type": "FeatureCollection",
     *   "features": [
     *     {
     *       "type": "Feature",
     *       "properties": {},
     *       "geometry": {
     *         "type": "Polygon",
     *         "coordinates": [[[-78, 41], [-67, 41], [-67, 48], [-78, 48], [-78, 41]]]
     *       }
     *     },
     *     {
     *       "type": "Feature",
     *       "properties": {},
     *       "geometry": {
     *         "type": "Polygon",
     *         "coordinates": [[[-93, 32], [-83, 32], [-83, 39], [-93, 39], [-93, 32]]]
     *       }
     *     }
     *   ]
     * }
     * tree.load(polygons)
     */tree.load=function(features){var load=[];// Load an Array of BBox
if(Array.isArray(features)){features.forEach(function(bbox){var feature=bboxPolygon(bbox);feature.bbox=bbox;load.push(feature);});}else{// Load FeatureCollection
featureEach$1(features,function(feature){feature.bbox=feature.bbox?feature.bbox:turfBBox(feature);load.push(feature);});}return rbush_1.prototype.load.call(this,load);};/**
     * [remove](https://github.com/mourner/rbush#removing-data)
     *
     * @param {BBox|Feature<any>} feature remove single GeoJSON Feature
     * @returns {RBush} GeoJSON RBush
     * @example
     * var polygon = {
     *   "type": "Feature",
     *   "properties": {},
     *   "geometry": {
     *     "type": "Polygon",
     *     "coordinates": [[[-78, 41], [-67, 41], [-67, 48], [-78, 48], [-78, 41]]]
     *   }
     * }
     * tree.remove(polygon)
     */tree.remove=function(feature){if(Array.isArray(feature)){var bbox=feature;feature=bboxPolygon(bbox);feature.bbox=bbox;}return rbush_1.prototype.remove.call(this,feature);};/**
     * [clear](https://github.com/mourner/rbush#removing-data)
     *
     * @returns {RBush} GeoJSON Rbush
     * @example
     * tree.clear()
     */tree.clear=function(){return rbush_1.prototype.clear.call(this);};/**
     * [search](https://github.com/mourner/rbush#search)
     *
     * @param {BBox|FeatureCollection|Feature<any>} geojson search with GeoJSON
     * @returns {FeatureCollection<any>} all features that intersects with the given GeoJSON.
     * @example
     * var polygon = {
     *   "type": "Feature",
     *   "properties": {},
     *   "geometry": {
     *     "type": "Polygon",
     *     "coordinates": [[[-78, 41], [-67, 41], [-67, 48], [-78, 48], [-78, 41]]]
     *   }
     * }
     * tree.search(polygon)
     */tree.search=function(geojson){var features=rbush_1.prototype.search.call(this,this.toBBox(geojson));return{type:'FeatureCollection',features:features};};/**
     * [collides](https://github.com/mourner/rbush#collisions)
     *
     * @param {BBox|FeatureCollection|Feature<any>} geojson collides with GeoJSON
     * @returns {boolean} true if there are any items intersecting the given GeoJSON, otherwise false.
     * @example
     * var polygon = {
     *   "type": "Feature",
     *   "properties": {},
     *   "geometry": {
     *     "type": "Polygon",
     *     "coordinates": [[[-78, 41], [-67, 41], [-67, 48], [-78, 48], [-78, 41]]]
     *   }
     * }
     * tree.collides(polygon)
     */tree.collides=function(geojson){return rbush_1.prototype.collides.call(this,this.toBBox(geojson));};/**
     * [all](https://github.com/mourner/rbush#search)
     *
     * @returns {FeatureCollection<any>} all the features in RBush
     * @example
     * tree.all()
     * //=FeatureCollection
     */tree.all=function(){var features=rbush_1.prototype.all.call(this);return{type:'FeatureCollection',features:features};};/**
     * [toJSON](https://github.com/mourner/rbush#export-and-import)
     *
     * @returns {any} export data as JSON object
     * @example
     * var exported = tree.toJSON()
     * //=JSON object
     */tree.toJSON=function(){return rbush_1.prototype.toJSON.call(this);};/**
     * [fromJSON](https://github.com/mourner/rbush#export-and-import)
     *
     * @param {any} json import previously exported data
     * @returns {RBush} GeoJSON RBush
     * @example
     * var exported = {
     *   "children": [
     *     {
     *       "type": "Feature",
     *       "geometry": {
     *         "type": "Point",
     *         "coordinates": [110, 50]
     *       },
     *       "properties": {},
     *       "bbox": [110, 50, 110, 50]
     *     }
     *   ],
     *   "height": 1,
     *   "leaf": true,
     *   "minX": 110,
     *   "minY": 50,
     *   "maxX": 110,
     *   "maxY": 50
     * }
     * tree.fromJSON(exported)
     */tree.fromJSON=function(json){return rbush_1.prototype.fromJSON.call(this,json);};/**
     * Converts GeoJSON to {minX, minY, maxX, maxY} schema
     *
     * @private
     * @param {BBox|FeatureCollectio|Feature<any>} geojson feature(s) to retrieve BBox from
     * @returns {Object} converted to {minX, minY, maxX, maxY}
     */tree.toBBox=function(geojson){var bbox;if(geojson.bbox)bbox=geojson.bbox;else if(Array.isArray(geojson)&&geojson.length===4)bbox=geojson;else bbox=turfBBox(geojson);return{minX:bbox[0],minY:bbox[1],maxX:bbox[2],maxY:bbox[3]};};return tree;}/**
 * Takes a bbox and returns an equivalent {@link Polygon|polygon}.
 *
 * @private
 * @name bboxPolygon
 * @param {Array<number>} bbox extent in [minX, minY, maxX, maxY] order
 * @returns {Feature<Polygon>} a Polygon representation of the bounding box
 * @example
 * var bbox = [0, 0, 10, 10];
 *
 * var poly = turf.bboxPolygon(bbox);
 *
 * //addToMap
 * var addToMap = [poly]
 */function bboxPolygon(bbox){var lowLeft=[bbox[0],bbox[1]];var topLeft=[bbox[0],bbox[3]];var topRight=[bbox[2],bbox[3]];var lowRight=[bbox[2],bbox[1]];var coordinates=[[lowLeft,lowRight,topRight,topLeft,lowLeft]];return{type:'Feature',bbox:bbox,properties:{},geometry:{type:'Polygon',coordinates:coordinates}};}/**
 * Takes a set of features, calculates the bbox of all input features, and returns a bounding box.
 *
 * @private
 * @name bbox
 * @param {FeatureCollection|Feature<any>} geojson input features
 * @returns {Array<number>} bbox extent in [minX, minY, maxX, maxY] order
 * @example
 * var line = turf.lineString([[-74, 40], [-78, 42], [-82, 35]]);
 * var bbox = turf.bbox(line);
 * var bboxPolygon = turf.bboxPolygon(bbox);
 *
 * //addToMap
 * var addToMap = [line, bboxPolygon]
 */function turfBBox(geojson){var bbox=[Infinity,Infinity,-Infinity,-Infinity];coordEach$1(geojson,function(coord){if(bbox[0]>coord[0])bbox[0]=coord[0];if(bbox[1]>coord[1])bbox[1]=coord[1];if(bbox[2]<coord[0])bbox[2]=coord[0];if(bbox[3]<coord[1])bbox[3]=coord[1];});return bbox;}geojsonRbush_1.default=default_1;/**
 * Creates a {@link FeatureCollection} of 2-vertex {@link LineString} segments from a {@link LineString|(Multi)LineString} or {@link Polygon|(Multi)Polygon}.
 *
 * @name lineSegment
 * @param {Geometry|FeatureCollection|Feature<LineString|MultiLineString|MultiPolygon|Polygon>} geojson GeoJSON Polygon or LineString
 * @returns {FeatureCollection<LineString>} 2-vertex line segments
 * @example
 * var polygon = turf.polygon([[[-50, 5], [-40, -10], [-50, -10], [-40, 5], [-50, 5]]]);
 * var segments = turf.lineSegment(polygon);
 *
 * //addToMap
 * var addToMap = [polygon, segments]
 */function lineSegment(geojson){if(!geojson)throw new Error('geojson is required');var results=[];flattenEach(geojson,function(feature$$1){lineSegmentFeature(feature$$1,results);});return featureCollection(results);}/**
 * Line Segment
 *
 * @private
 * @param {Feature<LineString|Polygon>} geojson Line or polygon feature
 * @param {Array} results push to results
 * @returns {void}
 */function lineSegmentFeature(geojson,results){var coords=[];var geometry$$1=geojson.geometry;switch(geometry$$1.type){case'Polygon':coords=getCoords(geometry$$1);break;case'LineString':coords=[getCoords(geometry$$1)];}coords.forEach(function(coord){var segments=createSegments(coord,geojson.properties);segments.forEach(function(segment){segment.id=results.length;results.push(segment);});});}/**
 * Create Segments from LineString coordinates
 *
 * @private
 * @param {LineString} coords LineString coordinates
 * @param {*} properties GeoJSON properties
 * @returns {Array<Feature<LineString>>} line segments
 */function createSegments(coords,properties){var segments=[];coords.reduce(function(previousCoords,currentCoords){var segment=lineString([previousCoords,currentCoords],properties);segment.bbox=bbox(previousCoords,currentCoords);segments.push(segment);return currentCoords;});return segments;}/**
 * Create BBox between two coordinates (faster than @turf/bbox)
 *
 * @private
 * @param {Array<number>} coords1 Point coordinate
 * @param {Array<number>} coords2 Point coordinate
 * @returns {BBox} [west, south, east, north]
 */function bbox(coords1,coords2){var x1=coords1[0];var y1=coords1[1];var x2=coords2[0];var y2=coords2[1];var west=x1<x2?x1:x2;var south=y1<y2?y1:y2;var east=x1>x2?x1:x2;var north=y1>y2?y1:y2;return[west,south,east,north];}/**
 * Takes any LineString or Polygon GeoJSON and returns the intersecting point(s).
 *
 * @name lineIntersect
 * @param {Geometry|FeatureCollection|Feature<LineString|MultiLineString|Polygon|MultiPolygon>} line1 any LineString or Polygon
 * @param {Geometry|FeatureCollection|Feature<LineString|MultiLineString|Polygon|MultiPolygon>} line2 any LineString or Polygon
 * @returns {FeatureCollection<Point>} point(s) that intersect both
 * @example
 * var line1 = turf.lineString([[126, -11], [129, -21]]);
 * var line2 = turf.lineString([[123, -18], [131, -14]]);
 * var intersects = turf.lineIntersect(line1, line2);
 *
 * //addToMap
 * var addToMap = [line1, line2, intersects]
 */function lineIntersect(line1,line2){var unique={};var results=[];// First, normalize geometries to features
// Then, handle simple 2-vertex segments
if(line1.type==='LineString')line1=feature(line1);if(line2.type==='LineString')line2=feature(line2);if(line1.type==='Feature'&&line2.type==='Feature'&&line1.geometry.type==='LineString'&&line2.geometry.type==='LineString'&&line1.geometry.coordinates.length===2&&line2.geometry.coordinates.length===2){var intersect=intersects(line1,line2);if(intersect)results.push(intersect);return featureCollection(results);}// Handles complex GeoJSON Geometries
var tree=geojsonRbush_1();tree.load(lineSegment(line2));featureEach(lineSegment(line1),function(segment){featureEach(tree.search(segment),function(match){var intersect=intersects(segment,match);if(intersect){// prevent duplicate points https://github.com/Turfjs/turf/issues/688
var key=getCoords(intersect).join(',');if(!unique[key]){unique[key]=true;results.push(intersect);}}});});return featureCollection(results);}/**
 * Find a point that intersects LineStrings with two coordinates each
 *
 * @private
 * @param {Feature<LineString>} line1 GeoJSON LineString (Must only contain 2 coordinates)
 * @param {Feature<LineString>} line2 GeoJSON LineString (Must only contain 2 coordinates)
 * @returns {Feature<Point>} intersecting GeoJSON Point
 */function intersects(line1,line2){var coords1=getCoords(line1);var coords2=getCoords(line2);if(coords1.length!==2){throw new Error('<intersects> line1 must only contain 2 coordinates');}if(coords2.length!==2){throw new Error('<intersects> line2 must only contain 2 coordinates');}var x1=coords1[0][0];var y1=coords1[0][1];var x2=coords1[1][0];var y2=coords1[1][1];var x3=coords2[0][0];var y3=coords2[0][1];var x4=coords2[1][0];var y4=coords2[1][1];var denom=(y4-y3)*(x2-x1)-(x4-x3)*(y2-y1);var numeA=(x4-x3)*(y1-y3)-(y4-y3)*(x1-x3);var numeB=(x2-x1)*(y1-y3)-(y2-y1)*(x1-x3);if(denom===0){if(numeA===0&&numeB===0){return null;}return null;}var uA=numeA/denom;var uB=numeB/denom;if(uA>=0&&uA<=1&&uB>=0&&uB<=1){var x=x1+uA*(x2-x1);var y=y1+uA*(y2-y1);return point([x,y]);}return null;}var hasInterface=function hasInterface(o,i){return o.interfaces_&&o.interfaces_().indexOf(i)>-1;};var extend$1=function extend$1(target,source){for(var key in source){if(source.hasOwnProperty(key))target[key]=source[key];}};function Clonable(){}function CoordinateSequence(){}extend$1(CoordinateSequence.prototype,{setOrdinate:function setOrdinate(index,ordinateIndex,value){},size:function size(){},getOrdinate:function getOrdinate(index,ordinateIndex){},getCoordinate:function getCoordinate(){},getCoordinateCopy:function getCoordinateCopy(i){},getDimension:function getDimension(){},getX:function getX(index){},clone:function clone(){},expandEnvelope:function expandEnvelope(env){},copy:function copy(){},getY:function getY(index){},toCoordinateArray:function toCoordinateArray(){},interfaces_:function interfaces_(){return[Clonable];},getClass:function getClass(){return CoordinateSequence;}});CoordinateSequence.X=0;CoordinateSequence.Y=1;CoordinateSequence.Z=2;CoordinateSequence.M=3;function CoordinateSequenceFactory(){}extend$1(CoordinateSequenceFactory.prototype,{create:function create(){if(arguments.length===1){if(arguments[0]instanceof Array){}else if(hasInterface(arguments[0],CoordinateSequence)){}}else if(arguments.length===2){}},interfaces_:function interfaces_(){return[];},getClass:function getClass(){return CoordinateSequenceFactory;}});function IllegalArgumentException(){}function Location(){}extend$1(Location.prototype,{interfaces_:function interfaces_(){return[];},getClass:function getClass(){return Location;}});Location.toLocationSymbol=function(locationValue){switch(locationValue){case Location.EXTERIOR:return'e';case Location.BOUNDARY:return'b';case Location.INTERIOR:return'i';case Location.NONE:return'-';}throw new IllegalArgumentException("Unknown location value: "+locationValue);};Location.INTERIOR=0;Location.BOUNDARY=1;Location.EXTERIOR=2;Location.NONE=-1;function NumberUtil(){}extend$1(NumberUtil.prototype,{interfaces_:function interfaces_(){return[];},getClass:function getClass(){return NumberUtil;}});NumberUtil.equalsWithTolerance=function(x1,x2,tolerance){return Math.abs(x1-x2)<=tolerance;};function Double(){}Double.isNaN=function(n){return Number.isNaN(n);};Double.doubleToLongBits=function(n){return n;};Double.longBitsToDouble=function(n){return n;};Double.isInfinite=function(n){return!Number.isFinite(n);};Double.MAX_VALUE=Number.MAX_VALUE;function Comparable(){}function Comparator(){}function Serializable(){}function RuntimeException(message){this.name='RuntimeException';this.message=message;this.stack=new Error().stack;Error.call(this,message);}RuntimeException.prototype=Object.create(Error.prototype);RuntimeException.prototype.constructor=Error;var inherits$1=function inherits$$1(c,p){c.prototype=Object.create(p.prototype);c.prototype.constructor=c;};function AssertionFailedException(){if(arguments.length===0){RuntimeException.call(this);}else if(arguments.length===1){var message=arguments[0];RuntimeException.call(this,message);}}inherits$1(AssertionFailedException,RuntimeException);extend$1(AssertionFailedException.prototype,{interfaces_:function interfaces_(){return[];},getClass:function getClass(){return AssertionFailedException;}});function Assert(){}extend$1(Assert.prototype,{interfaces_:function interfaces_(){return[];},getClass:function getClass(){return Assert;}});Assert.shouldNeverReachHere=function(){if(arguments.length===0){Assert.shouldNeverReachHere(null);}else if(arguments.length===1){var message=arguments[0];throw new AssertionFailedException("Should never reach here"+(message!==null?": "+message:""));}};Assert.isTrue=function(){if(arguments.length===1){var assertion=arguments[0];Assert.isTrue(assertion,null);}else if(arguments.length===2){var assertion=arguments[0],message=arguments[1];if(!assertion){if(message===null){throw new AssertionFailedException();}else{throw new AssertionFailedException(message);}}}};Assert.equals=function(){if(arguments.length===2){var expectedValue=arguments[0],actualValue=arguments[1];Assert.equals(expectedValue,actualValue,null);}else if(arguments.length===3){var expectedValue=arguments[0],actualValue=arguments[1],message=arguments[2];if(!actualValue.equals(expectedValue)){throw new AssertionFailedException("Expected "+expectedValue+" but encountered "+actualValue+(message!==null?": "+message:""));}}};function Coordinate(){this.x=null;this.y=null;this.z=null;if(arguments.length===0){Coordinate.call(this,0.0,0.0);}else if(arguments.length===1){var c=arguments[0];Coordinate.call(this,c.x,c.y,c.z);}else if(arguments.length===2){var x=arguments[0],y=arguments[1];Coordinate.call(this,x,y,Coordinate.NULL_ORDINATE);}else if(arguments.length===3){var x=arguments[0],y=arguments[1],z=arguments[2];this.x=x;this.y=y;this.z=z;}}extend$1(Coordinate.prototype,{setOrdinate:function setOrdinate(ordinateIndex,value){switch(ordinateIndex){case Coordinate.X:this.x=value;break;case Coordinate.Y:this.y=value;break;case Coordinate.Z:this.z=value;break;default:throw new IllegalArgumentException("Invalid ordinate index: "+ordinateIndex);}},equals2D:function equals2D(){if(arguments.length===1){var other=arguments[0];if(this.x!==other.x){return false;}if(this.y!==other.y){return false;}return true;}else if(arguments.length===2){var c=arguments[0],tolerance=arguments[1];if(!NumberUtil.equalsWithTolerance(this.x,c.x,tolerance)){return false;}if(!NumberUtil.equalsWithTolerance(this.y,c.y,tolerance)){return false;}return true;}},getOrdinate:function getOrdinate(ordinateIndex){switch(ordinateIndex){case Coordinate.X:return this.x;case Coordinate.Y:return this.y;case Coordinate.Z:return this.z;}throw new IllegalArgumentException("Invalid ordinate index: "+ordinateIndex);},equals3D:function equals3D(other){return this.x===other.x&&this.y===other.y&&(this.z===other.z||Double.isNaN(this.z)&&Double.isNaN(other.z));},equals:function equals(other){if(!(other instanceof Coordinate)){return false;}return this.equals2D(other);},equalInZ:function equalInZ(c,tolerance){return NumberUtil.equalsWithTolerance(this.z,c.z,tolerance);},compareTo:function compareTo(o){var other=o;if(this.x<other.x)return-1;if(this.x>other.x)return 1;if(this.y<other.y)return-1;if(this.y>other.y)return 1;return 0;},clone:function clone(){try{var coord=null;return coord;}catch(e){if(e instanceof CloneNotSupportedException){Assert.shouldNeverReachHere("this shouldn't happen because this class is Cloneable");return null;}else throw e;}finally{}},copy:function copy(){return new Coordinate(this);},toString:function toString(){return"("+this.x+", "+this.y+", "+this.z+")";},distance3D:function distance3D(c){var dx=this.x-c.x;var dy=this.y-c.y;var dz=this.z-c.z;return Math.sqrt(dx*dx+dy*dy+dz*dz);},distance:function distance(c){var dx=this.x-c.x;var dy=this.y-c.y;return Math.sqrt(dx*dx+dy*dy);},hashCode:function hashCode(){var result=17;result=37*result+Coordinate.hashCode(this.x);result=37*result+Coordinate.hashCode(this.y);return result;},setCoordinate:function setCoordinate(other){this.x=other.x;this.y=other.y;this.z=other.z;},interfaces_:function interfaces_(){return[Comparable,Clonable,Serializable];},getClass:function getClass(){return Coordinate;}});Coordinate.hashCode=function(){if(arguments.length===1){var x=arguments[0];var f=Double.doubleToLongBits(x);return Math.trunc(f^f>>>32);}};function DimensionalComparator(){this.dimensionsToTest=2;if(arguments.length===0){DimensionalComparator.call(this,2);}else if(arguments.length===1){var dimensionsToTest=arguments[0];if(dimensionsToTest!==2&&dimensionsToTest!==3)throw new IllegalArgumentException("only 2 or 3 dimensions may be specified");this.dimensionsToTest=dimensionsToTest;}}extend$1(DimensionalComparator.prototype,{compare:function compare(o1,o2){var c1=o1;var c2=o2;var compX=DimensionalComparator.compare(c1.x,c2.x);if(compX!==0)return compX;var compY=DimensionalComparator.compare(c1.y,c2.y);if(compY!==0)return compY;if(this.dimensionsToTest<=2)return 0;var compZ=DimensionalComparator.compare(c1.z,c2.z);return compZ;},interfaces_:function interfaces_(){return[Comparator];},getClass:function getClass(){return DimensionalComparator;}});DimensionalComparator.compare=function(a,b){if(a<b)return-1;if(a>b)return 1;if(Double.isNaN(a)){if(Double.isNaN(b))return 0;return-1;}if(Double.isNaN(b))return 1;return 0;};Coordinate.DimensionalComparator=DimensionalComparator;Coordinate.serialVersionUID=6683108902428366910;Coordinate.NULL_ORDINATE=Double.NaN;Coordinate.X=0;Coordinate.Y=1;Coordinate.Z=2;function MathUtil(){}extend$1(MathUtil.prototype,{interfaces_:function interfaces_(){return[];},getClass:function getClass(){return MathUtil;}});MathUtil.log10=function(x){var ln=Math.log(x);if(Double.isInfinite(ln))return ln;if(Double.isNaN(ln))return ln;return ln/MathUtil.LOG_10;};MathUtil.min=function(v1,v2,v3,v4){var min=v1;if(v2<min)min=v2;if(v3<min)min=v3;if(v4<min)min=v4;return min;};MathUtil.clamp=function(){if(typeof arguments[2]==="number"&&typeof arguments[0]==="number"&&typeof arguments[1]==="number"){var x=arguments[0],min=arguments[1],max=arguments[2];if(x<min)return min;if(x>max)return max;return x;}else if(Number.isInteger(arguments[2])&&Number.isInteger(arguments[0])&&Number.isInteger(arguments[1])){var x=arguments[0],min=arguments[1],max=arguments[2];if(x<min)return min;if(x>max)return max;return x;}};MathUtil.wrap=function(index,max){if(index<0){return max- -index%max;}return index%max;};MathUtil.max=function(){if(arguments.length===3){var v1=arguments[0],v2=arguments[1],v3=arguments[2];var max=v1;if(v2>max)max=v2;if(v3>max)max=v3;return max;}else if(arguments.length===4){var v1=arguments[0],v2=arguments[1],v3=arguments[2],v4=arguments[3];var max=v1;if(v2>max)max=v2;if(v3>max)max=v3;if(v4>max)max=v4;return max;}};MathUtil.average=function(x1,x2){return(x1+x2)/2.0;};MathUtil.LOG_10=Math.log(10);function StringBuffer(str){this.str=str;}StringBuffer.prototype.append=function(e){this.str+=e;};StringBuffer.prototype.setCharAt=function(i,c){this.str=this.str.substr(0,i)+c+this.str.substr(i+1);};StringBuffer.prototype.toString=function(e){return this.str;};function Integer(value){this.value=value;}Integer.prototype.intValue=function(){return this.value;};Integer.prototype.compareTo=function(o){if(this.value<o)return-1;if(this.value>o)return 1;return 0;};Integer.isNaN=function(n){return Number.isNaN(n);};function Character(){}Character.isWhitespace=function(c){return c<=32&&c>=0||c==127;};Character.toUpperCase=function(c){return c.toUpperCase();};function DD(){this.hi=0.0;this.lo=0.0;if(arguments.length===0){this.init(0.0);}else if(arguments.length===1){if(typeof arguments[0]==="number"){var x=arguments[0];this.init(x);}else if(arguments[0]instanceof DD){var dd=arguments[0];this.init(dd);}else if(typeof arguments[0]==="string"){var str=arguments[0];DD.call(this,DD.parse(str));}}else if(arguments.length===2){var hi=arguments[0],lo=arguments[1];this.init(hi,lo);}}extend$1(DD.prototype,{le:function le(y){return this.hi<y.hi||this.hi===y.hi&&this.lo<=y.lo;},extractSignificantDigits:function extractSignificantDigits(insertDecimalPoint,magnitude){var y=this.abs();var mag=DD.magnitude(y.hi);var scale=DD.TEN.pow(mag);y=y.divide(scale);if(y.gt(DD.TEN)){y=y.divide(DD.TEN);mag+=1;}else if(y.lt(DD.ONE)){y=y.multiply(DD.TEN);mag-=1;}var decimalPointPos=mag+1;var buf=new StringBuffer();var numDigits=DD.MAX_PRINT_DIGITS-1;for(var i=0;i<=numDigits;i++){if(insertDecimalPoint&&i===decimalPointPos){buf.append('.');}var digit=Math.trunc(y.hi);if(digit<0){break;}var rebiasBy10=false;var digitChar=0;if(digit>9){rebiasBy10=true;digitChar='9';}else{digitChar='0'+digit;}buf.append(digitChar);y=y.subtract(DD.valueOf(digit)).multiply(DD.TEN);if(rebiasBy10)y.selfAdd(DD.TEN);var continueExtractingDigits=true;var remMag=DD.magnitude(y.hi);if(remMag<0&&Math.abs(remMag)>=numDigits-i)continueExtractingDigits=false;if(!continueExtractingDigits)break;}magnitude[0]=mag;return buf.toString();},sqr:function sqr(){return this.multiply(this);},doubleValue:function doubleValue(){return this.hi+this.lo;},subtract:function subtract(){if(arguments[0]instanceof DD){var y=arguments[0];return this.add(y.negate());}else if(typeof arguments[0]==="number"){var y=arguments[0];return this.add(-y);}},equals:function equals(){if(arguments.length===1){var y=arguments[0];return this.hi===y.hi&&this.lo===y.lo;}},isZero:function isZero(){return this.hi===0.0&&this.lo===0.0;},selfSubtract:function selfSubtract(){if(arguments[0]instanceof DD){var y=arguments[0];if(this.isNaN())return this;return this.selfAdd(-y.hi,-y.lo);}else if(typeof arguments[0]==="number"){var y=arguments[0];if(this.isNaN())return this;return this.selfAdd(-y,0.0);}},getSpecialNumberString:function getSpecialNumberString(){if(this.isZero())return"0.0";if(this.isNaN())return"NaN ";return null;},min:function min(x){if(this.le(x)){return this;}else{return x;}},selfDivide:function selfDivide(){if(arguments.length===1){if(arguments[0]instanceof DD){var y=arguments[0];return this.selfDivide(y.hi,y.lo);}else if(typeof arguments[0]==="number"){var y=arguments[0];return this.selfDivide(y,0.0);}}else if(arguments.length===2){var yhi=arguments[0],ylo=arguments[1];var hc=null,tc=null,hy=null,ty=null,C=null,c=null,U=null,u=null;C=this.hi/yhi;c=DD.SPLIT*C;hc=c-C;u=DD.SPLIT*yhi;hc=c-hc;tc=C-hc;hy=u-yhi;U=C*yhi;hy=u-hy;ty=yhi-hy;u=hc*hy-U+hc*ty+tc*hy+tc*ty;c=(this.hi-U-u+this.lo-C*ylo)/yhi;u=C+c;this.hi=u;this.lo=C-u+c;return this;}},dump:function dump(){return"DD<"+this.hi+", "+this.lo+">";},divide:function divide(){if(arguments[0]instanceof DD){var y=arguments[0];var hc=null,tc=null,hy=null,ty=null,C=null,c=null,U=null,u=null;C=this.hi/y.hi;c=DD.SPLIT*C;hc=c-C;u=DD.SPLIT*y.hi;hc=c-hc;tc=C-hc;hy=u-y.hi;U=C*y.hi;hy=u-hy;ty=y.hi-hy;u=hc*hy-U+hc*ty+tc*hy+tc*ty;c=(this.hi-U-u+this.lo-C*y.lo)/y.hi;u=C+c;var zhi=u;var zlo=C-u+c;return new DD(zhi,zlo);}else if(typeof arguments[0]==="number"){var y=arguments[0];if(Double.isNaN(y))return DD.createNaN();return DD.copy(this).selfDivide(y,0.0);}},ge:function ge(y){return this.hi>y.hi||this.hi===y.hi&&this.lo>=y.lo;},pow:function pow(exp){if(exp===0.0)return DD.valueOf(1.0);var r=new DD(this);var s=DD.valueOf(1.0);var n=Math.abs(exp);if(n>1){while(n>0){if(n%2===1){s.selfMultiply(r);}n/=2;if(n>0)r=r.sqr();}}else{s=r;}if(exp<0)return s.reciprocal();return s;},ceil:function ceil(){if(this.isNaN())return DD.NaN;var fhi=Math.ceil(this.hi);var flo=0.0;if(fhi===this.hi){flo=Math.ceil(this.lo);}return new DD(fhi,flo);},compareTo:function compareTo(o){var other=o;if(this.hi<other.hi)return-1;if(this.hi>other.hi)return 1;if(this.lo<other.lo)return-1;if(this.lo>other.lo)return 1;return 0;},rint:function rint(){if(this.isNaN())return this;var plus5=this.add(0.5);return plus5.floor();},setValue:function setValue(){if(arguments[0]instanceof DD){var value=arguments[0];this.init(value);return this;}else if(typeof arguments[0]==="number"){var value=arguments[0];this.init(value);return this;}},max:function max(x){if(this.ge(x)){return this;}else{return x;}},sqrt:function sqrt(){if(this.isZero())return DD.valueOf(0.0);if(this.isNegative()){return DD.NaN;}var x=1.0/Math.sqrt(this.hi);var ax=this.hi*x;var axdd=DD.valueOf(ax);var diffSq=this.subtract(axdd.sqr());var d2=diffSq.hi*(x*0.5);return axdd.add(d2);},selfAdd:function selfAdd(){if(arguments.length===1){if(arguments[0]instanceof DD){var y=arguments[0];return this.selfAdd(y.hi,y.lo);}else if(typeof arguments[0]==="number"){var y=arguments[0];var H=null,h=null,S=null,s=null,e=null,f=null;S=this.hi+y;e=S-this.hi;s=S-e;s=y-e+(this.hi-s);f=s+this.lo;H=S+f;h=f+(S-H);this.hi=H+h;this.lo=h+(H-this.hi);return this;}}else if(arguments.length===2){var yhi=arguments[0],ylo=arguments[1];var H=null,h=null,T=null,t=null,S=null,s=null,e=null,f=null;S=this.hi+yhi;T=this.lo+ylo;e=S-this.hi;f=T-this.lo;s=S-e;t=T-f;s=yhi-e+(this.hi-s);t=ylo-f+(this.lo-t);e=s+T;H=S+e;h=e+(S-H);e=t+h;var zhi=H+e;var zlo=e+(H-zhi);this.hi=zhi;this.lo=zlo;return this;}},selfMultiply:function selfMultiply(){if(arguments.length===1){if(arguments[0]instanceof DD){var y=arguments[0];return this.selfMultiply(y.hi,y.lo);}else if(typeof arguments[0]==="number"){var y=arguments[0];return this.selfMultiply(y,0.0);}}else if(arguments.length===2){var yhi=arguments[0],ylo=arguments[1];var hx=null,tx=null,hy=null,ty=null,C=null,c=null;C=DD.SPLIT*this.hi;hx=C-this.hi;c=DD.SPLIT*yhi;hx=C-hx;tx=this.hi-hx;hy=c-yhi;C=this.hi*yhi;hy=c-hy;ty=yhi-hy;c=hx*hy-C+hx*ty+tx*hy+tx*ty+(this.hi*ylo+this.lo*yhi);var zhi=C+c;hx=C-zhi;var zlo=c+hx;this.hi=zhi;this.lo=zlo;return this;}},selfSqr:function selfSqr(){return this.selfMultiply(this);},floor:function floor(){if(this.isNaN())return DD.NaN;var fhi=Math.floor(this.hi);var flo=0.0;if(fhi===this.hi){flo=Math.floor(this.lo);}return new DD(fhi,flo);},negate:function negate(){if(this.isNaN())return this;return new DD(-this.hi,-this.lo);},clone:function clone(){try{return null;}catch(ex){if(ex instanceof CloneNotSupportedException){return null;}else throw ex;}finally{}},multiply:function multiply(){if(arguments[0]instanceof DD){var y=arguments[0];if(y.isNaN())return DD.createNaN();return DD.copy(this).selfMultiply(y);}else if(typeof arguments[0]==="number"){var y=arguments[0];if(Double.isNaN(y))return DD.createNaN();return DD.copy(this).selfMultiply(y,0.0);}},isNaN:function isNaN(){return Double.isNaN(this.hi);},intValue:function intValue(){return Math.trunc(this.hi);},toString:function toString(){var mag=DD.magnitude(this.hi);if(mag>=-3&&mag<=20)return this.toStandardNotation();return this.toSciNotation();},toStandardNotation:function toStandardNotation(){var specialStr=this.getSpecialNumberString();if(specialStr!==null)return specialStr;var magnitude=new Array(1).fill(null);var sigDigits=this.extractSignificantDigits(true,magnitude);var decimalPointPos=magnitude[0]+1;var num=sigDigits;if(sigDigits.charAt(0)==='.'){num="0"+sigDigits;}else if(decimalPointPos<0){num="0."+DD.stringOfChar('0',-decimalPointPos)+sigDigits;}else if(sigDigits.indexOf('.')===-1){var numZeroes=decimalPointPos-sigDigits.length;var zeroes=DD.stringOfChar('0',numZeroes);num=sigDigits+zeroes+".0";}if(this.isNegative())return"-"+num;return num;},reciprocal:function reciprocal(){var hc=null,tc=null,hy=null,ty=null,C=null,c=null,U=null,u=null;C=1.0/this.hi;c=DD.SPLIT*C;hc=c-C;u=DD.SPLIT*this.hi;hc=c-hc;tc=C-hc;hy=u-this.hi;U=C*this.hi;hy=u-hy;ty=this.hi-hy;u=hc*hy-U+hc*ty+tc*hy+tc*ty;c=(1.0-U-u-C*this.lo)/this.hi;var zhi=C+c;var zlo=C-zhi+c;return new DD(zhi,zlo);},toSciNotation:function toSciNotation(){if(this.isZero())return DD.SCI_NOT_ZERO;var specialStr=this.getSpecialNumberString();if(specialStr!==null)return specialStr;var magnitude=new Array(1).fill(null);var digits=this.extractSignificantDigits(false,magnitude);var expStr=DD.SCI_NOT_EXPONENT_CHAR+magnitude[0];if(digits.charAt(0)==='0'){throw new IllegalStateException("Found leading zero: "+digits);}var trailingDigits="";if(digits.length>1)trailingDigits=digits.substring(1);var digitsWithDecimal=digits.charAt(0)+"."+trailingDigits;if(this.isNegative())return"-"+digitsWithDecimal+expStr;return digitsWithDecimal+expStr;},abs:function abs(){if(this.isNaN())return DD.NaN;if(this.isNegative())return this.negate();return new DD(this);},isPositive:function isPositive(){return this.hi>0.0||this.hi===0.0&&this.lo>0.0;},lt:function lt(y){return this.hi<y.hi||this.hi===y.hi&&this.lo<y.lo;},add:function add(){if(arguments[0]instanceof DD){var y=arguments[0];return DD.copy(this).selfAdd(y);}else if(typeof arguments[0]==="number"){var y=arguments[0];return DD.copy(this).selfAdd(y);}},init:function init(){if(arguments.length===1){if(typeof arguments[0]==="number"){var x=arguments[0];this.hi=x;this.lo=0.0;}else if(arguments[0]instanceof DD){var dd=arguments[0];this.hi=dd.hi;this.lo=dd.lo;}}else if(arguments.length===2){var hi=arguments[0],lo=arguments[1];this.hi=hi;this.lo=lo;}},gt:function gt(y){return this.hi>y.hi||this.hi===y.hi&&this.lo>y.lo;},isNegative:function isNegative(){return this.hi<0.0||this.hi===0.0&&this.lo<0.0;},trunc:function trunc(){if(this.isNaN())return DD.NaN;if(this.isPositive())return this.floor();else return this.ceil();},signum:function signum(){if(this.hi>0)return 1;if(this.hi<0)return-1;if(this.lo>0)return 1;if(this.lo<0)return-1;return 0;},interfaces_:function interfaces_(){return[Serializable,Comparable,Clonable];},getClass:function getClass(){return DD;}});DD.sqr=function(x){return DD.valueOf(x).selfMultiply(x);};DD.valueOf=function(){if(typeof arguments[0]==="string"){var str=arguments[0];return DD.parse(str);}else if(typeof arguments[0]==="number"){var x=arguments[0];return new DD(x);}};DD.sqrt=function(x){return DD.valueOf(x).sqrt();};DD.parse=function(str){var i=0;var strlen=str.length;while(Character.isWhitespace(str.charAt(i))){i++;}var isNegative=false;if(i<strlen){var signCh=str.charAt(i);if(signCh==='-'||signCh==='+'){i++;if(signCh==='-')isNegative=true;}}var val=new DD();var numDigits=0;var numBeforeDec=0;var exp=0;while(true){if(i>=strlen)break;var ch=str.charAt(i);i++;if(Character.isDigit(ch)){var d=ch-'0';val.selfMultiply(DD.TEN);val.selfAdd(d);numDigits++;continue;}if(ch==='.'){numBeforeDec=numDigits;continue;}if(ch==='e'||ch==='E'){var expStr=str.substring(i);try{exp=Integer.parseInt(expStr);}catch(ex){if(ex instanceof NumberFormatException){throw new NumberFormatException("Invalid exponent "+expStr+" in string "+str);}else throw ex;}finally{}break;}throw new NumberFormatException("Unexpected character '"+ch+"' at position "+i+" in string "+str);}var val2=val;var numDecPlaces=numDigits-numBeforeDec-exp;if(numDecPlaces===0){val2=val;}else if(numDecPlaces>0){var scale=DD.TEN.pow(numDecPlaces);val2=val.divide(scale);}else if(numDecPlaces<0){var scale=DD.TEN.pow(-numDecPlaces);val2=val.multiply(scale);}if(isNegative){return val2.negate();}return val2;};DD.createNaN=function(){return new DD(Double.NaN,Double.NaN);};DD.copy=function(dd){return new DD(dd);};DD.magnitude=function(x){var xAbs=Math.abs(x);var xLog10=Math.log(xAbs)/Math.log(10);var xMag=Math.trunc(Math.floor(xLog10));var xApprox=Math.pow(10,xMag);if(xApprox*10<=xAbs)xMag+=1;return xMag;};DD.stringOfChar=function(ch,len){var buf=new StringBuffer();for(var i=0;i<len;i++){buf.append(ch);}return buf.toString();};DD.PI=new DD(3.141592653589793116e+00,1.224646799147353207e-16);DD.TWO_PI=new DD(6.283185307179586232e+00,2.449293598294706414e-16);DD.PI_2=new DD(1.570796326794896558e+00,6.123233995736766036e-17);DD.E=new DD(2.718281828459045091e+00,1.445646891729250158e-16);DD.NaN=new DD(Double.NaN,Double.NaN);DD.EPS=1.23259516440783e-32;DD.SPLIT=134217729.0;DD.MAX_PRINT_DIGITS=32;DD.TEN=DD.valueOf(10.0);DD.ONE=DD.valueOf(1.0);DD.SCI_NOT_EXPONENT_CHAR="E";DD.SCI_NOT_ZERO="0.0E0";function CGAlgorithmsDD(){}extend$1(CGAlgorithmsDD.prototype,{interfaces_:function interfaces_(){return[];},getClass:function getClass(){return CGAlgorithmsDD;}});CGAlgorithmsDD.orientationIndex=function(p1,p2,q){var index=CGAlgorithmsDD.orientationIndexFilter(p1,p2,q);if(index<=1)return index;var dx1=DD.valueOf(p2.x).selfAdd(-p1.x);var dy1=DD.valueOf(p2.y).selfAdd(-p1.y);var dx2=DD.valueOf(q.x).selfAdd(-p2.x);var dy2=DD.valueOf(q.y).selfAdd(-p2.y);return dx1.selfMultiply(dy2).selfSubtract(dy1.selfMultiply(dx2)).signum();};CGAlgorithmsDD.signOfDet2x2=function(x1,y1,x2,y2){var det=x1.multiply(y2).selfSubtract(y1.multiply(x2));return det.signum();};CGAlgorithmsDD.intersection=function(p1,p2,q1,q2){var denom1=DD.valueOf(q2.y).selfSubtract(q1.y).selfMultiply(DD.valueOf(p2.x).selfSubtract(p1.x));var denom2=DD.valueOf(q2.x).selfSubtract(q1.x).selfMultiply(DD.valueOf(p2.y).selfSubtract(p1.y));var denom=denom1.subtract(denom2);var numx1=DD.valueOf(q2.x).selfSubtract(q1.x).selfMultiply(DD.valueOf(p1.y).selfSubtract(q1.y));var numx2=DD.valueOf(q2.y).selfSubtract(q1.y).selfMultiply(DD.valueOf(p1.x).selfSubtract(q1.x));var numx=numx1.subtract(numx2);var fracP=numx.selfDivide(denom).doubleValue();var x=DD.valueOf(p1.x).selfAdd(DD.valueOf(p2.x).selfSubtract(p1.x).selfMultiply(fracP)).doubleValue();var numy1=DD.valueOf(p2.x).selfSubtract(p1.x).selfMultiply(DD.valueOf(p1.y).selfSubtract(q1.y));var numy2=DD.valueOf(p2.y).selfSubtract(p1.y).selfMultiply(DD.valueOf(p1.x).selfSubtract(q1.x));var numy=numy1.subtract(numy2);var fracQ=numy.selfDivide(denom).doubleValue();var y=DD.valueOf(q1.y).selfAdd(DD.valueOf(q2.y).selfSubtract(q1.y).selfMultiply(fracQ)).doubleValue();return new Coordinate(x,y);};CGAlgorithmsDD.orientationIndexFilter=function(pa,pb,pc){var detsum=null;var detleft=(pa.x-pc.x)*(pb.y-pc.y);var detright=(pa.y-pc.y)*(pb.x-pc.x);var det=detleft-detright;if(detleft>0.0){if(detright<=0.0){return CGAlgorithmsDD.signum(det);}else{detsum=detleft+detright;}}else if(detleft<0.0){if(detright>=0.0){return CGAlgorithmsDD.signum(det);}else{detsum=-detleft-detright;}}else{return CGAlgorithmsDD.signum(det);}var errbound=CGAlgorithmsDD.DP_SAFE_EPSILON*detsum;if(det>=errbound||-det>=errbound){return CGAlgorithmsDD.signum(det);}return 2;};CGAlgorithmsDD.signum=function(x){if(x>0)return 1;if(x<0)return-1;return 0;};CGAlgorithmsDD.DP_SAFE_EPSILON=1e-15;function Exception(){}function NotRepresentableException(){Exception.call(this,"Projective point not representable on the Cartesian plane.");}inherits$1(NotRepresentableException,Exception);extend$1(NotRepresentableException.prototype,{interfaces_:function interfaces_(){return[];},getClass:function getClass(){return NotRepresentableException;}});function System(){}System.arraycopy=function(src,srcPos,dest,destPos,len){var c=0;for(var i=srcPos;i<srcPos+len;i++){dest[destPos+c]=src[i];c++;}};System.getProperty=function(name){return{'line.separator':'\n'}[name];};function HCoordinate(){this.x=null;this.y=null;this.w=null;if(arguments.length===0){this.x=0.0;this.y=0.0;this.w=1.0;}else if(arguments.length===1){var p=arguments[0];this.x=p.x;this.y=p.y;this.w=1.0;}else if(arguments.length===2){if(typeof arguments[0]==="number"&&typeof arguments[1]==="number"){var _x=arguments[0],_y=arguments[1];this.x=_x;this.y=_y;this.w=1.0;}else if(arguments[0]instanceof HCoordinate&&arguments[1]instanceof HCoordinate){var p1=arguments[0],p2=arguments[1];this.x=p1.y*p2.w-p2.y*p1.w;this.y=p2.x*p1.w-p1.x*p2.w;this.w=p1.x*p2.y-p2.x*p1.y;}else if(arguments[0]instanceof Coordinate&&arguments[1]instanceof Coordinate){var p1=arguments[0],p2=arguments[1];this.x=p1.y-p2.y;this.y=p2.x-p1.x;this.w=p1.x*p2.y-p2.x*p1.y;}}else if(arguments.length===3){var _x=arguments[0],_y=arguments[1],_w=arguments[2];this.x=_x;this.y=_y;this.w=_w;}else if(arguments.length===4){var p1=arguments[0],p2=arguments[1],q1=arguments[2],q2=arguments[3];var px=p1.y-p2.y;var py=p2.x-p1.x;var pw=p1.x*p2.y-p2.x*p1.y;var qx=q1.y-q2.y;var qy=q2.x-q1.x;var qw=q1.x*q2.y-q2.x*q1.y;this.x=py*qw-qy*pw;this.y=qx*pw-px*qw;this.w=px*qy-qx*py;}}extend$1(HCoordinate.prototype,{getY:function getY(){var a=this.y/this.w;if(Double.isNaN(a)||Double.isInfinite(a)){throw new NotRepresentableException();}return a;},getX:function getX(){var a=this.x/this.w;if(Double.isNaN(a)||Double.isInfinite(a)){throw new NotRepresentableException();}return a;},getCoordinate:function getCoordinate(){var p=new Coordinate();p.x=this.getX();p.y=this.getY();return p;},interfaces_:function interfaces_(){return[];},getClass:function getClass(){return HCoordinate;}});HCoordinate.intersection=function(p1,p2,q1,q2){var px=p1.y-p2.y;var py=p2.x-p1.x;var pw=p1.x*p2.y-p2.x*p1.y;var qx=q1.y-q2.y;var qy=q2.x-q1.x;var qw=q1.x*q2.y-q2.x*q1.y;var x=py*qw-qy*pw;var y=qx*pw-px*qw;var w=px*qy-qx*py;var xInt=x/w;var yInt=y/w;if(Double.isNaN(xInt)||Double.isInfinite(xInt)||Double.isNaN(yInt)||Double.isInfinite(yInt)){throw new NotRepresentableException();}return new Coordinate(xInt,yInt);};function Envelope(){this.minx=null;this.maxx=null;this.miny=null;this.maxy=null;if(arguments.length===0){this.init();}else if(arguments.length===1){if(arguments[0]instanceof Coordinate){var p=arguments[0];this.init(p.x,p.x,p.y,p.y);}else if(arguments[0]instanceof Envelope){var env=arguments[0];this.init(env);}}else if(arguments.length===2){var p1=arguments[0],p2=arguments[1];this.init(p1.x,p2.x,p1.y,p2.y);}else if(arguments.length===4){var x1=arguments[0],x2=arguments[1],y1=arguments[2],y2=arguments[3];this.init(x1,x2,y1,y2);}}extend$1(Envelope.prototype,{getArea:function getArea(){return this.getWidth()*this.getHeight();},equals:function equals(other){if(!(other instanceof Envelope)){return false;}var otherEnvelope=other;if(this.isNull()){return otherEnvelope.isNull();}return this.maxx===otherEnvelope.getMaxX()&&this.maxy===otherEnvelope.getMaxY()&&this.minx===otherEnvelope.getMinX()&&this.miny===otherEnvelope.getMinY();},intersection:function intersection(env){if(this.isNull()||env.isNull()||!this.intersects(env))return new Envelope();var intMinX=this.minx>env.minx?this.minx:env.minx;var intMinY=this.miny>env.miny?this.miny:env.miny;var intMaxX=this.maxx<env.maxx?this.maxx:env.maxx;var intMaxY=this.maxy<env.maxy?this.maxy:env.maxy;return new Envelope(intMinX,intMaxX,intMinY,intMaxY);},isNull:function isNull(){return this.maxx<this.minx;},getMaxX:function getMaxX(){return this.maxx;},covers:function covers(){if(arguments.length===1){if(arguments[0]instanceof Coordinate){var p=arguments[0];return this.covers(p.x,p.y);}else if(arguments[0]instanceof Envelope){var other=arguments[0];if(this.isNull()||other.isNull()){return false;}return other.getMinX()>=this.minx&&other.getMaxX()<=this.maxx&&other.getMinY()>=this.miny&&other.getMaxY()<=this.maxy;}}else if(arguments.length===2){var x=arguments[0],y=arguments[1];if(this.isNull())return false;return x>=this.minx&&x<=this.maxx&&y>=this.miny&&y<=this.maxy;}},intersects:function intersects(){if(arguments.length===1){if(arguments[0]instanceof Envelope){var other=arguments[0];if(this.isNull()||other.isNull()){return false;}return!(other.minx>this.maxx||other.maxx<this.minx||other.miny>this.maxy||other.maxy<this.miny);}else if(arguments[0]instanceof Coordinate){var p=arguments[0];return this.intersects(p.x,p.y);}}else if(arguments.length===2){var x=arguments[0],y=arguments[1];if(this.isNull())return false;return!(x>this.maxx||x<this.minx||y>this.maxy||y<this.miny);}},getMinY:function getMinY(){return this.miny;},getMinX:function getMinX(){return this.minx;},expandToInclude:function expandToInclude(){if(arguments.length===1){if(arguments[0]instanceof Coordinate){var p=arguments[0];this.expandToInclude(p.x,p.y);}else if(arguments[0]instanceof Envelope){var other=arguments[0];if(other.isNull()){return null;}if(this.isNull()){this.minx=other.getMinX();this.maxx=other.getMaxX();this.miny=other.getMinY();this.maxy=other.getMaxY();}else{if(other.minx<this.minx){this.minx=other.minx;}if(other.maxx>this.maxx){this.maxx=other.maxx;}if(other.miny<this.miny){this.miny=other.miny;}if(other.maxy>this.maxy){this.maxy=other.maxy;}}}}else if(arguments.length===2){var x=arguments[0],y=arguments[1];if(this.isNull()){this.minx=x;this.maxx=x;this.miny=y;this.maxy=y;}else{if(x<this.minx){this.minx=x;}if(x>this.maxx){this.maxx=x;}if(y<this.miny){this.miny=y;}if(y>this.maxy){this.maxy=y;}}}},minExtent:function minExtent(){if(this.isNull())return 0.0;var w=this.getWidth();var h=this.getHeight();if(w<h)return w;return h;},getWidth:function getWidth(){if(this.isNull()){return 0;}return this.maxx-this.minx;},compareTo:function compareTo(o){var env=o;if(this.isNull()){if(env.isNull())return 0;return-1;}else{if(env.isNull())return 1;}if(this.minx<env.minx)return-1;if(this.minx>env.minx)return 1;if(this.miny<env.miny)return-1;if(this.miny>env.miny)return 1;if(this.maxx<env.maxx)return-1;if(this.maxx>env.maxx)return 1;if(this.maxy<env.maxy)return-1;if(this.maxy>env.maxy)return 1;return 0;},translate:function translate(transX,transY){if(this.isNull()){return null;}this.init(this.getMinX()+transX,this.getMaxX()+transX,this.getMinY()+transY,this.getMaxY()+transY);},toString:function toString(){return"Env["+this.minx+" : "+this.maxx+", "+this.miny+" : "+this.maxy+"]";},setToNull:function setToNull(){this.minx=0;this.maxx=-1;this.miny=0;this.maxy=-1;},getHeight:function getHeight(){if(this.isNull()){return 0;}return this.maxy-this.miny;},maxExtent:function maxExtent(){if(this.isNull())return 0.0;var w=this.getWidth();var h=this.getHeight();if(w>h)return w;return h;},expandBy:function expandBy(){if(arguments.length===1){var distance=arguments[0];this.expandBy(distance,distance);}else if(arguments.length===2){var deltaX=arguments[0],deltaY=arguments[1];if(this.isNull())return null;this.minx-=deltaX;this.maxx+=deltaX;this.miny-=deltaY;this.maxy+=deltaY;if(this.minx>this.maxx||this.miny>this.maxy)this.setToNull();}},contains:function contains(){if(arguments.length===1){if(arguments[0]instanceof Envelope){var other=arguments[0];return this.covers(other);}else if(arguments[0]instanceof Coordinate){var p=arguments[0];return this.covers(p);}}else if(arguments.length===2){var x=arguments[0],y=arguments[1];return this.covers(x,y);}},centre:function centre(){if(this.isNull())return null;return new Coordinate((this.getMinX()+this.getMaxX())/2.0,(this.getMinY()+this.getMaxY())/2.0);},init:function init(){if(arguments.length===0){this.setToNull();}else if(arguments.length===1){if(arguments[0]instanceof Coordinate){var p=arguments[0];this.init(p.x,p.x,p.y,p.y);}else if(arguments[0]instanceof Envelope){var env=arguments[0];this.minx=env.minx;this.maxx=env.maxx;this.miny=env.miny;this.maxy=env.maxy;}}else if(arguments.length===2){var p1=arguments[0],p2=arguments[1];this.init(p1.x,p2.x,p1.y,p2.y);}else if(arguments.length===4){var x1=arguments[0],x2=arguments[1],y1=arguments[2],y2=arguments[3];if(x1<x2){this.minx=x1;this.maxx=x2;}else{this.minx=x2;this.maxx=x1;}if(y1<y2){this.miny=y1;this.maxy=y2;}else{this.miny=y2;this.maxy=y1;}}},getMaxY:function getMaxY(){return this.maxy;},distance:function distance(env){if(this.intersects(env))return 0;var dx=0.0;if(this.maxx<env.minx)dx=env.minx-this.maxx;else if(this.minx>env.maxx)dx=this.minx-env.maxx;var dy=0.0;if(this.maxy<env.miny)dy=env.miny-this.maxy;else if(this.miny>env.maxy)dy=this.miny-env.maxy;if(dx===0.0)return dy;if(dy===0.0)return dx;return Math.sqrt(dx*dx+dy*dy);},hashCode:function hashCode(){var result=17;result=37*result+Coordinate.hashCode(this.minx);result=37*result+Coordinate.hashCode(this.maxx);result=37*result+Coordinate.hashCode(this.miny);result=37*result+Coordinate.hashCode(this.maxy);return result;},interfaces_:function interfaces_(){return[Comparable,Serializable];},getClass:function getClass(){return Envelope;}});Envelope.intersects=function(){if(arguments.length===3){var p1=arguments[0],p2=arguments[1],q=arguments[2];if(q.x>=(p1.x<p2.x?p1.x:p2.x)&&q.x<=(p1.x>p2.x?p1.x:p2.x)&&q.y>=(p1.y<p2.y?p1.y:p2.y)&&q.y<=(p1.y>p2.y?p1.y:p2.y)){return true;}return false;}else if(arguments.length===4){var p1=arguments[0],p2=arguments[1],q1=arguments[2],q2=arguments[3];var minq=Math.min(q1.x,q2.x);var maxq=Math.max(q1.x,q2.x);var minp=Math.min(p1.x,p2.x);var maxp=Math.max(p1.x,p2.x);if(minp>maxq)return false;if(maxp<minq)return false;minq=Math.min(q1.y,q2.y);maxq=Math.max(q1.y,q2.y);minp=Math.min(p1.y,p2.y);maxp=Math.max(p1.y,p2.y);if(minp>maxq)return false;if(maxp<minq)return false;return true;}};Envelope.serialVersionUID=5873921885273102420;var regExes={'typeStr':/^\s*(\w+)\s*\(\s*(.*)\s*\)\s*$/,'emptyTypeStr':/^\s*(\w+)\s*EMPTY\s*$/,'spaces':/\s+/,'parenComma':/\)\s*,\s*\(/,'doubleParenComma':/\)\s*\)\s*,\s*\(\s*\(/,// can't use {2} here
'trimParens':/^\s*\(?(.*?)\)?\s*$/};/**
 * Class for reading and writing Well-Known Text.
 *
 * NOTE: Adapted from OpenLayers 2.11 implementation.
 *//** Create a new parser for WKT
 *
 * @param {GeometryFactory} geometryFactory
 * @return An instance of WKTParser.
 * @constructor
 * @private
 */function WKTParser(geometryFactory){this.geometryFactory=geometryFactory||new GeometryFactory();}extend$1(WKTParser.prototype,{/**
   * Deserialize a WKT string and return a geometry. Supports WKT for POINT,
   * MULTIPOINT, LINESTRING, LINEARRING, MULTILINESTRING, POLYGON, MULTIPOLYGON,
   * and GEOMETRYCOLLECTION.
   *
   * @param {String} wkt A WKT string.
   * @return {Geometry} A geometry instance.
   * @private
   */read:function read(wkt){var geometry,type,str;wkt=wkt.replace(/[\n\r]/g,' ');var matches=regExes.typeStr.exec(wkt);if(wkt.search('EMPTY')!==-1){matches=regExes.emptyTypeStr.exec(wkt);matches[2]=undefined;}if(matches){type=matches[1].toLowerCase();str=matches[2];if(parse[type]){geometry=parse[type].apply(this,[str]);}}if(geometry===undefined)throw new Error('Could not parse WKT '+wkt);return geometry;},/**
   * Serialize a geometry into a WKT string.
   *
   * @param {Geometry} geometry A feature or array of features.
   * @return {String} The WKT string representation of the input geometries.
   * @private
   */write:function write(geometry){return this.extractGeometry(geometry);},/**
   * Entry point to construct the WKT for a single Geometry object.
   *
   * @param {Geometry} geometry
   * @return {String} A WKT string of representing the geometry.
   * @private
   */extractGeometry:function extractGeometry(geometry){var type=geometry.getGeometryType().toLowerCase();if(!extract[type]){return null;}var wktType=type.toUpperCase();var data;if(geometry.isEmpty()){data=wktType+' EMPTY';}else{data=wktType+'('+extract[type].apply(this,[geometry])+')';}return data;}});/**
 * Object with properties corresponding to the geometry types. Property values
 * are functions that do the actual data extraction.
 * @private
 */var extract={coordinate:function coordinate(_coordinate){return _coordinate.x+' '+_coordinate.y;},/**
   * Return a space delimited string of point coordinates.
   *
   * @param {Point}
   *          point
   * @return {String} A string of coordinates representing the point.
   */point:function point(_point){return extract.coordinate.call(this,_point.coordinates.coordinates[0]);},/**
   * Return a comma delimited string of point coordinates from a multipoint.
   *
   * @param {MultiPoint}
   *          multipoint
   * @return {String} A string of point coordinate strings representing the
   *         multipoint.
   */multipoint:function multipoint(_multipoint){var array=[];for(var i=0,len=_multipoint.geometries.length;i<len;++i){array.push('('+extract.point.apply(this,[_multipoint.geometries[i]])+')');}return array.join(',');},/**
   * Return a comma delimited string of point coordinates from a line.
   *
   * @param {LineString} linestring
   * @return {String} A string of point coordinate strings representing the linestring.
   */linestring:function linestring(_linestring){var array=[];for(var i=0,len=_linestring.points.coordinates.length;i<len;++i){array.push(extract.coordinate.apply(this,[_linestring.points.coordinates[i]]));}return array.join(',');},linearring:function linearring(_linearring){var array=[];for(var i=0,len=_linearring.points.coordinates.length;i<len;++i){array.push(extract.coordinate.apply(this,[_linearring.points.coordinates[i]]));}return array.join(',');},/**
   * Return a comma delimited string of linestring strings from a
   * multilinestring.
   *
   * @param {MultiLineString} multilinestring
   * @return {String} A string of of linestring strings representing the multilinestring.
   */multilinestring:function multilinestring(_multilinestring){var array=[];for(var i=0,len=_multilinestring.geometries.length;i<len;++i){array.push('('+extract.linestring.apply(this,[_multilinestring.geometries[i]])+')');}return array.join(',');},/**
   * Return a comma delimited string of linear ring arrays from a polygon.
   *
   * @param {Polygon} polygon
   * @return {String} An array of linear ring arrays representing the polygon.
   */polygon:function polygon(_polygon){var array=[];array.push('('+extract.linestring.apply(this,[_polygon.shell])+')');for(var i=0,len=_polygon.holes.length;i<len;++i){array.push('('+extract.linestring.apply(this,[_polygon.holes[i]])+')');}return array.join(',');},/**
   * Return an array of polygon arrays from a multipolygon.
   *
   * @param {MultiPolygon} multipolygon
   * @return {String} An array of polygon arrays representing the multipolygon.
   */multipolygon:function multipolygon(_multipolygon){var array=[];for(var i=0,len=_multipolygon.geometries.length;i<len;++i){array.push('('+extract.polygon.apply(this,[_multipolygon.geometries[i]])+')');}return array.join(',');},/**
   * Return the WKT portion between 'GEOMETRYCOLLECTION(' and ')' for an
   * geometrycollection.
   *
   * @param {GeometryCollection} collection
   * @return {String} internal WKT representation of the collection.
   */geometrycollection:function geometrycollection(collection){var array=[];for(var i=0,len=collection.geometries.length;i<len;++i){array.push(this.extractGeometry(collection.geometries[i]));}return array.join(',');}};/**
 * Object with properties corresponding to the geometry types. Property values
 * are functions that do the actual parsing.
 * @private
 */var parse={/**
   * Return point geometry given a point WKT fragment.
   *
   * @param {String} str A WKT fragment representing the point.
   * @return {Point} A point geometry.
   * @private
   */point:function point(str){if(str===undefined){return this.geometryFactory.createPoint();}var coords=str.trim().split(regExes.spaces);return this.geometryFactory.createPoint(new Coordinate(Number.parseFloat(coords[0]),Number.parseFloat(coords[1])));},/**
   * Return a multipoint geometry given a multipoint WKT fragment.
   *
   * @param {String} str A WKT fragment representing the multipoint.
   * @return {Point} A multipoint feature.
   * @private
   */multipoint:function multipoint(str){if(str===undefined){return this.geometryFactory.createMultiPoint();}var point;var points=str.trim().split(',');var components=[];for(var i=0,len=points.length;i<len;++i){point=points[i].replace(regExes.trimParens,'$1');components.push(parse.point.apply(this,[point]));}return this.geometryFactory.createMultiPoint(components);},/**
   * Return a linestring geometry given a linestring WKT fragment.
   *
   * @param {String} str A WKT fragment representing the linestring.
   * @return {LineString} A linestring geometry.
   * @private
   */linestring:function linestring(str){if(str===undefined){return this.geometryFactory.createLineString();}var points=str.trim().split(',');var components=[];var coords;for(var i=0,len=points.length;i<len;++i){coords=points[i].trim().split(regExes.spaces);components.push(new Coordinate(Number.parseFloat(coords[0]),Number.parseFloat(coords[1])));}return this.geometryFactory.createLineString(components);},/**
   * Return a linearring geometry given a linearring WKT fragment.
   *
   * @param {String} str A WKT fragment representing the linearring.
   * @return {LinearRing} A linearring geometry.
   * @private
   */linearring:function linearring(str){if(str===undefined){return this.geometryFactory.createLinearRing();}var points=str.trim().split(',');var components=[];var coords;for(var i=0,len=points.length;i<len;++i){coords=points[i].trim().split(regExes.spaces);components.push(new Coordinate(Number.parseFloat(coords[0]),Number.parseFloat(coords[1])));}return this.geometryFactory.createLinearRing(components);},/**
   * Return a multilinestring geometry given a multilinestring WKT fragment.
   *
   * @param {String} str A WKT fragment representing the multilinestring.
   * @return {MultiLineString} A multilinestring geometry.
   * @private
   */multilinestring:function multilinestring(str){if(str===undefined){return this.geometryFactory.createMultiLineString();}var line;var lines=str.trim().split(regExes.parenComma);var components=[];for(var i=0,len=lines.length;i<len;++i){line=lines[i].replace(regExes.trimParens,'$1');components.push(parse.linestring.apply(this,[line]));}return this.geometryFactory.createMultiLineString(components);},/**
   * Return a polygon geometry given a polygon WKT fragment.
   *
   * @param {String} str A WKT fragment representing the polygon.
   * @return {Polygon} A polygon geometry.
   * @private
   */polygon:function polygon(str){if(str===undefined){return this.geometryFactory.createPolygon();}var ring,linestring,linearring;var rings=str.trim().split(regExes.parenComma);var shell;var holes=[];for(var i=0,len=rings.length;i<len;++i){ring=rings[i].replace(regExes.trimParens,'$1');linestring=parse.linestring.apply(this,[ring]);linearring=this.geometryFactory.createLinearRing(linestring.points);if(i===0){shell=linearring;}else{holes.push(linearring);}}return this.geometryFactory.createPolygon(shell,holes);},/**
   * Return a multipolygon geometry given a multipolygon WKT fragment.
   *
   * @param {String} str A WKT fragment representing the multipolygon.
   * @return {MultiPolygon} A multipolygon geometry.
   * @private
   */multipolygon:function multipolygon(str){if(str===undefined){return this.geometryFactory.createMultiPolygon();}var polygon;var polygons=str.trim().split(regExes.doubleParenComma);var components=[];for(var i=0,len=polygons.length;i<len;++i){polygon=polygons[i].replace(regExes.trimParens,'$1');components.push(parse.polygon.apply(this,[polygon]));}return this.geometryFactory.createMultiPolygon(components);},/**
   * Return a geometrycollection given a geometrycollection WKT fragment.
   *
   * @param {String} str A WKT fragment representing the geometrycollection.
   * @return {GeometryCollection}
   * @private
   */geometrycollection:function geometrycollection(str){if(str===undefined){return this.geometryFactory.createGeometryCollection();}// separate components of the collection with |
str=str.replace(/,\s*([A-Za-z])/g,'|$1');var wktArray=str.trim().split('|');var components=[];for(var i=0,len=wktArray.length;i<len;++i){components.push(this.read(wktArray[i]));}return this.geometryFactory.createGeometryCollection(components);}};/**
 * Writes the Well-Known Text representation of a {@link Geometry}. The
 * Well-Known Text format is defined in the <A
 * HREF="http://www.opengis.org/techno/specs.htm"> OGC Simple Features
 * Specification for SQL</A>.
 * <p>
 * The <code>WKTWriter</code> outputs coordinates rounded to the precision
 * model. Only the maximum number of decimal places necessary to represent the
 * ordinates to the required precision will be output.
 * <p>
 * The SFS WKT spec does not define a special tag for {@link LinearRing}s.
 * Under the spec, rings are output as <code>LINESTRING</code>s.
 *//**
 * @param {GeometryFactory} geometryFactory
 * @constructor
 */function WKTWriter(geometryFactory){this.parser=new WKTParser(geometryFactory);}extend$1(WKTWriter.prototype,{/**
   * Converts a <code>Geometry</code> to its Well-known Text representation.
   *
   * @param {Geometry} geometry a <code>Geometry</code> to process.
   * @return {string} a <Geometry Tagged Text> string (see the OpenGIS Simple
   *         Features Specification).
   * @memberof WKTWriter
   */write:function write(geometry){return this.parser.write(geometry);}});extend$1(WKTWriter,{/**
   * Generates the WKT for a <tt>LINESTRING</tt> specified by two
   * {@link Coordinate}s.
   *
   * @param p0 the first coordinate.
   * @param p1 the second coordinate.
   *
   * @return the WKT.
   * @private
   */toLineString:function toLineString(p0,p1){if(arguments.length!==2){throw new Error('Not implemented');}return'LINESTRING ( '+p0.x+' '+p0.y+', '+p1.x+' '+p1.y+' )';}});function LineIntersector(){this.result=null;this.inputLines=Array(2).fill().map(function(){return Array(2);});this.intPt=new Array(2).fill(null);this.intLineIndex=null;this._isProper=null;this.pa=null;this.pb=null;this.precisionModel=null;this.intPt[0]=new Coordinate();this.intPt[1]=new Coordinate();this.pa=this.intPt[0];this.pb=this.intPt[1];this.result=0;}extend$1(LineIntersector.prototype,{getIndexAlongSegment:function getIndexAlongSegment(segmentIndex,intIndex){this.computeIntLineIndex();return this.intLineIndex[segmentIndex][intIndex];},getTopologySummary:function getTopologySummary(){var catBuf=new StringBuffer();if(this.isEndPoint())catBuf.append(" endpoint");if(this._isProper)catBuf.append(" proper");if(this.isCollinear())catBuf.append(" collinear");return catBuf.toString();},computeIntersection:function computeIntersection(p1,p2,p3,p4){this.inputLines[0][0]=p1;this.inputLines[0][1]=p2;this.inputLines[1][0]=p3;this.inputLines[1][1]=p4;this.result=this.computeIntersect(p1,p2,p3,p4);},getIntersectionNum:function getIntersectionNum(){return this.result;},computeIntLineIndex:function computeIntLineIndex(){if(arguments.length===0){if(this.intLineIndex===null){this.intLineIndex=Array(2).fill().map(function(){return Array(2);});this.computeIntLineIndex(0);this.computeIntLineIndex(1);}}else if(arguments.length===1){var segmentIndex=arguments[0];var dist0=this.getEdgeDistance(segmentIndex,0);var dist1=this.getEdgeDistance(segmentIndex,1);if(dist0>dist1){this.intLineIndex[segmentIndex][0]=0;this.intLineIndex[segmentIndex][1]=1;}else{this.intLineIndex[segmentIndex][0]=1;this.intLineIndex[segmentIndex][1]=0;}}},isProper:function isProper(){return this.hasIntersection()&&this._isProper;},setPrecisionModel:function setPrecisionModel(precisionModel){this.precisionModel=precisionModel;},isInteriorIntersection:function isInteriorIntersection(){if(arguments.length===0){if(this.isInteriorIntersection(0))return true;if(this.isInteriorIntersection(1))return true;return false;}else if(arguments.length===1){var inputLineIndex=arguments[0];for(var i=0;i<this.result;i++){if(!(this.intPt[i].equals2D(this.inputLines[inputLineIndex][0])||this.intPt[i].equals2D(this.inputLines[inputLineIndex][1]))){return true;}}return false;}},getIntersection:function getIntersection(intIndex){return this.intPt[intIndex];},isEndPoint:function isEndPoint(){return this.hasIntersection()&&!this._isProper;},hasIntersection:function hasIntersection(){return this.result!==LineIntersector.NO_INTERSECTION;},getEdgeDistance:function getEdgeDistance(segmentIndex,intIndex){var dist=LineIntersector.computeEdgeDistance(this.intPt[intIndex],this.inputLines[segmentIndex][0],this.inputLines[segmentIndex][1]);return dist;},isCollinear:function isCollinear(){return this.result===LineIntersector.COLLINEAR_INTERSECTION;},toString:function toString(){return WKTWriter.toLineString(this.inputLines[0][0],this.inputLines[0][1])+" - "+WKTWriter.toLineString(this.inputLines[1][0],this.inputLines[1][1])+this.getTopologySummary();},getEndpoint:function getEndpoint(segmentIndex,ptIndex){return this.inputLines[segmentIndex][ptIndex];},isIntersection:function isIntersection(pt){for(var i=0;i<this.result;i++){if(this.intPt[i].equals2D(pt)){return true;}}return false;},getIntersectionAlongSegment:function getIntersectionAlongSegment(segmentIndex,intIndex){this.computeIntLineIndex();return this.intPt[this.intLineIndex[segmentIndex][intIndex]];},interfaces_:function interfaces_(){return[];},getClass:function getClass(){return LineIntersector;}});LineIntersector.computeEdgeDistance=function(p,p0,p1){var dx=Math.abs(p1.x-p0.x);var dy=Math.abs(p1.y-p0.y);var dist=-1.0;if(p.equals(p0)){dist=0.0;}else if(p.equals(p1)){if(dx>dy)dist=dx;else dist=dy;}else{var pdx=Math.abs(p.x-p0.x);var pdy=Math.abs(p.y-p0.y);if(dx>dy)dist=pdx;else dist=pdy;if(dist===0.0&&!p.equals(p0)){dist=Math.max(pdx,pdy);}}Assert.isTrue(!(dist===0.0&&!p.equals(p0)),"Bad distance calculation");return dist;};LineIntersector.nonRobustComputeEdgeDistance=function(p,p1,p2){var dx=p.x-p1.x;var dy=p.y-p1.y;var dist=Math.sqrt(dx*dx+dy*dy);Assert.isTrue(!(dist===0.0&&!p.equals(p1)),"Invalid distance calculation");return dist;};LineIntersector.DONT_INTERSECT=0;LineIntersector.DO_INTERSECT=1;LineIntersector.COLLINEAR=2;LineIntersector.NO_INTERSECTION=0;LineIntersector.POINT_INTERSECTION=1;LineIntersector.COLLINEAR_INTERSECTION=2;function RobustLineIntersector(){LineIntersector.apply(this);}inherits$1(RobustLineIntersector,LineIntersector);extend$1(RobustLineIntersector.prototype,{isInSegmentEnvelopes:function isInSegmentEnvelopes(intPt){var env0=new Envelope(this.inputLines[0][0],this.inputLines[0][1]);var env1=new Envelope(this.inputLines[1][0],this.inputLines[1][1]);return env0.contains(intPt)&&env1.contains(intPt);},computeIntersection:function computeIntersection(){if(arguments.length===3){var p=arguments[0],p1=arguments[1],p2=arguments[2];this._isProper=false;if(Envelope.intersects(p1,p2,p)){if(CGAlgorithms.orientationIndex(p1,p2,p)===0&&CGAlgorithms.orientationIndex(p2,p1,p)===0){this._isProper=true;if(p.equals(p1)||p.equals(p2)){this._isProper=false;}this.result=LineIntersector.POINT_INTERSECTION;return null;}}this.result=LineIntersector.NO_INTERSECTION;}else return LineIntersector.prototype.computeIntersection.apply(this,arguments);},normalizeToMinimum:function normalizeToMinimum(n1,n2,n3,n4,normPt){normPt.x=this.smallestInAbsValue(n1.x,n2.x,n3.x,n4.x);normPt.y=this.smallestInAbsValue(n1.y,n2.y,n3.y,n4.y);n1.x-=normPt.x;n1.y-=normPt.y;n2.x-=normPt.x;n2.y-=normPt.y;n3.x-=normPt.x;n3.y-=normPt.y;n4.x-=normPt.x;n4.y-=normPt.y;},safeHCoordinateIntersection:function safeHCoordinateIntersection(p1,p2,q1,q2){var intPt=null;try{intPt=HCoordinate.intersection(p1,p2,q1,q2);}catch(e){if(e instanceof NotRepresentableException){intPt=RobustLineIntersector.nearestEndpoint(p1,p2,q1,q2);}else throw e;}finally{}return intPt;},intersection:function intersection(p1,p2,q1,q2){var intPt=this.intersectionWithNormalization(p1,p2,q1,q2);if(!this.isInSegmentEnvelopes(intPt)){intPt=new Coordinate(RobustLineIntersector.nearestEndpoint(p1,p2,q1,q2));}if(this.precisionModel!==null){this.precisionModel.makePrecise(intPt);}return intPt;},smallestInAbsValue:function smallestInAbsValue(x1,x2,x3,x4){var x=x1;var xabs=Math.abs(x);if(Math.abs(x2)<xabs){x=x2;xabs=Math.abs(x2);}if(Math.abs(x3)<xabs){x=x3;xabs=Math.abs(x3);}if(Math.abs(x4)<xabs){x=x4;}return x;},checkDD:function checkDD(p1,p2,q1,q2,intPt){var intPtDD=CGAlgorithmsDD.intersection(p1,p2,q1,q2);var isIn=this.isInSegmentEnvelopes(intPtDD);System.out.println("DD in env = "+isIn+"  --------------------- "+intPtDD);if(intPt.distance(intPtDD)>0.0001){System.out.println("Distance = "+intPt.distance(intPtDD));}},intersectionWithNormalization:function intersectionWithNormalization(p1,p2,q1,q2){var n1=new Coordinate(p1);var n2=new Coordinate(p2);var n3=new Coordinate(q1);var n4=new Coordinate(q2);var normPt=new Coordinate();this.normalizeToEnvCentre(n1,n2,n3,n4,normPt);var intPt=this.safeHCoordinateIntersection(n1,n2,n3,n4);intPt.x+=normPt.x;intPt.y+=normPt.y;return intPt;},computeCollinearIntersection:function computeCollinearIntersection(p1,p2,q1,q2){var p1q1p2=Envelope.intersects(p1,p2,q1);var p1q2p2=Envelope.intersects(p1,p2,q2);var q1p1q2=Envelope.intersects(q1,q2,p1);var q1p2q2=Envelope.intersects(q1,q2,p2);if(p1q1p2&&p1q2p2){this.intPt[0]=q1;this.intPt[1]=q2;return LineIntersector.COLLINEAR_INTERSECTION;}if(q1p1q2&&q1p2q2){this.intPt[0]=p1;this.intPt[1]=p2;return LineIntersector.COLLINEAR_INTERSECTION;}if(p1q1p2&&q1p1q2){this.intPt[0]=q1;this.intPt[1]=p1;return q1.equals(p1)&&!p1q2p2&&!q1p2q2?LineIntersector.POINT_INTERSECTION:LineIntersector.COLLINEAR_INTERSECTION;}if(p1q1p2&&q1p2q2){this.intPt[0]=q1;this.intPt[1]=p2;return q1.equals(p2)&&!p1q2p2&&!q1p1q2?LineIntersector.POINT_INTERSECTION:LineIntersector.COLLINEAR_INTERSECTION;}if(p1q2p2&&q1p1q2){this.intPt[0]=q2;this.intPt[1]=p1;return q2.equals(p1)&&!p1q1p2&&!q1p2q2?LineIntersector.POINT_INTERSECTION:LineIntersector.COLLINEAR_INTERSECTION;}if(p1q2p2&&q1p2q2){this.intPt[0]=q2;this.intPt[1]=p2;return q2.equals(p2)&&!p1q1p2&&!q1p1q2?LineIntersector.POINT_INTERSECTION:LineIntersector.COLLINEAR_INTERSECTION;}return LineIntersector.NO_INTERSECTION;},normalizeToEnvCentre:function normalizeToEnvCentre(n00,n01,n10,n11,normPt){var minX0=n00.x<n01.x?n00.x:n01.x;var minY0=n00.y<n01.y?n00.y:n01.y;var maxX0=n00.x>n01.x?n00.x:n01.x;var maxY0=n00.y>n01.y?n00.y:n01.y;var minX1=n10.x<n11.x?n10.x:n11.x;var minY1=n10.y<n11.y?n10.y:n11.y;var maxX1=n10.x>n11.x?n10.x:n11.x;var maxY1=n10.y>n11.y?n10.y:n11.y;var intMinX=minX0>minX1?minX0:minX1;var intMaxX=maxX0<maxX1?maxX0:maxX1;var intMinY=minY0>minY1?minY0:minY1;var intMaxY=maxY0<maxY1?maxY0:maxY1;var intMidX=(intMinX+intMaxX)/2.0;var intMidY=(intMinY+intMaxY)/2.0;normPt.x=intMidX;normPt.y=intMidY;n00.x-=normPt.x;n00.y-=normPt.y;n01.x-=normPt.x;n01.y-=normPt.y;n10.x-=normPt.x;n10.y-=normPt.y;n11.x-=normPt.x;n11.y-=normPt.y;},computeIntersect:function computeIntersect(p1,p2,q1,q2){this._isProper=false;if(!Envelope.intersects(p1,p2,q1,q2))return LineIntersector.NO_INTERSECTION;var Pq1=CGAlgorithms.orientationIndex(p1,p2,q1);var Pq2=CGAlgorithms.orientationIndex(p1,p2,q2);if(Pq1>0&&Pq2>0||Pq1<0&&Pq2<0){return LineIntersector.NO_INTERSECTION;}var Qp1=CGAlgorithms.orientationIndex(q1,q2,p1);var Qp2=CGAlgorithms.orientationIndex(q1,q2,p2);if(Qp1>0&&Qp2>0||Qp1<0&&Qp2<0){return LineIntersector.NO_INTERSECTION;}var collinear=Pq1===0&&Pq2===0&&Qp1===0&&Qp2===0;if(collinear){return this.computeCollinearIntersection(p1,p2,q1,q2);}if(Pq1===0||Pq2===0||Qp1===0||Qp2===0){this._isProper=false;if(p1.equals2D(q1)||p1.equals2D(q2)){this.intPt[0]=p1;}else if(p2.equals2D(q1)||p2.equals2D(q2)){this.intPt[0]=p2;}else if(Pq1===0){this.intPt[0]=new Coordinate(q1);}else if(Pq2===0){this.intPt[0]=new Coordinate(q2);}else if(Qp1===0){this.intPt[0]=new Coordinate(p1);}else if(Qp2===0){this.intPt[0]=new Coordinate(p2);}}else{this._isProper=true;this.intPt[0]=this.intersection(p1,p2,q1,q2);}return LineIntersector.POINT_INTERSECTION;},interfaces_:function interfaces_(){return[];},getClass:function getClass(){return RobustLineIntersector;}});RobustLineIntersector.nearestEndpoint=function(p1,p2,q1,q2){var nearestPt=p1;var minDist=CGAlgorithms.distancePointLine(p1,q1,q2);var dist=CGAlgorithms.distancePointLine(p2,q1,q2);if(dist<minDist){minDist=dist;nearestPt=p2;}dist=CGAlgorithms.distancePointLine(q1,p1,p2);if(dist<minDist){minDist=dist;nearestPt=q1;}dist=CGAlgorithms.distancePointLine(q2,p1,p2);if(dist<minDist){minDist=dist;nearestPt=q2;}return nearestPt;};function RobustDeterminant(){}extend$1(RobustDeterminant.prototype,{interfaces_:function interfaces_(){return[];},getClass:function getClass(){return RobustDeterminant;}});RobustDeterminant.orientationIndex=function(p1,p2,q){var dx1=p2.x-p1.x;var dy1=p2.y-p1.y;var dx2=q.x-p2.x;var dy2=q.y-p2.y;return RobustDeterminant.signOfDet2x2(dx1,dy1,dx2,dy2);};RobustDeterminant.signOfDet2x2=function(x1,y1,x2,y2){var sign=null;var swap=null;var k=null;sign=1;if(x1===0.0||y2===0.0){if(y1===0.0||x2===0.0){return 0;}else if(y1>0){if(x2>0){return-sign;}else{return sign;}}else{if(x2>0){return sign;}else{return-sign;}}}if(y1===0.0||x2===0.0){if(y2>0){if(x1>0){return sign;}else{return-sign;}}else{if(x1>0){return-sign;}else{return sign;}}}if(0.0<y1){if(0.0<y2){if(y1<=y2){}else{sign=-sign;swap=x1;x1=x2;x2=swap;swap=y1;y1=y2;y2=swap;}}else{if(y1<=-y2){sign=-sign;x2=-x2;y2=-y2;}else{swap=x1;x1=-x2;x2=swap;swap=y1;y1=-y2;y2=swap;}}}else{if(0.0<y2){if(-y1<=y2){sign=-sign;x1=-x1;y1=-y1;}else{swap=-x1;x1=x2;x2=swap;swap=-y1;y1=y2;y2=swap;}}else{if(y1>=y2){x1=-x1;y1=-y1;x2=-x2;y2=-y2;}else{sign=-sign;swap=-x1;x1=-x2;x2=swap;swap=-y1;y1=-y2;y2=swap;}}}if(0.0<x1){if(0.0<x2){if(x1<=x2){}else{return sign;}}else{return sign;}}else{if(0.0<x2){return-sign;}else{if(x1>=x2){sign=-sign;x1=-x1;x2=-x2;}else{return-sign;}}}while(true){k=Math.floor(x2/x1);x2=x2-k*x1;y2=y2-k*y1;if(y2<0.0){return-sign;}if(y2>y1){return sign;}if(x1>x2+x2){if(y1<y2+y2){return sign;}}else{if(y1>y2+y2){return-sign;}else{x2=x1-x2;y2=y1-y2;sign=-sign;}}if(y2===0.0){if(x2===0.0){return 0;}else{return-sign;}}if(x2===0.0){return sign;}k=Math.floor(x1/x2);x1=x1-k*x2;y1=y1-k*y2;if(y1<0.0){return sign;}if(y1>y2){return-sign;}if(x2>x1+x1){if(y2<y1+y1){return-sign;}}else{if(y2>y1+y1){return sign;}else{x1=x2-x1;y1=y2-y1;sign=-sign;}}if(y1===0.0){if(x1===0.0){return 0;}else{return sign;}}if(x1===0.0){return-sign;}}};function RayCrossingCounter(){this.p=null;this.crossingCount=0;this.isPointOnSegment=false;var p=arguments[0];this.p=p;}extend$1(RayCrossingCounter.prototype,{countSegment:function countSegment(p1,p2){if(p1.x<this.p.x&&p2.x<this.p.x)return null;if(this.p.x===p2.x&&this.p.y===p2.y){this.isPointOnSegment=true;return null;}if(p1.y===this.p.y&&p2.y===this.p.y){var minx=p1.x;var maxx=p2.x;if(minx>maxx){minx=p2.x;maxx=p1.x;}if(this.p.x>=minx&&this.p.x<=maxx){this.isPointOnSegment=true;}return null;}if(p1.y>this.p.y&&p2.y<=this.p.y||p2.y>this.p.y&&p1.y<=this.p.y){var x1=p1.x-this.p.x;var y1=p1.y-this.p.y;var x2=p2.x-this.p.x;var y2=p2.y-this.p.y;var xIntSign=RobustDeterminant.signOfDet2x2(x1,y1,x2,y2);if(xIntSign===0.0){this.isPointOnSegment=true;return null;}if(y2<y1)xIntSign=-xIntSign;if(xIntSign>0.0){this.crossingCount++;}}},isPointInPolygon:function isPointInPolygon(){return this.getLocation()!==Location.EXTERIOR;},getLocation:function getLocation(){if(this.isPointOnSegment)return Location.BOUNDARY;if(this.crossingCount%2===1){return Location.INTERIOR;}return Location.EXTERIOR;},isOnSegment:function isOnSegment(){return this.isPointOnSegment;},interfaces_:function interfaces_(){return[];},getClass:function getClass(){return RayCrossingCounter;}});RayCrossingCounter.locatePointInRing=function(){if(arguments[0]instanceof Coordinate&&hasInterface(arguments[1],CoordinateSequence)){var p=arguments[0],ring=arguments[1];var counter=new RayCrossingCounter(p);var p1=new Coordinate();var p2=new Coordinate();for(var i=1;i<ring.size();i++){ring.getCoordinate(i,p1);ring.getCoordinate(i-1,p2);counter.countSegment(p1,p2);if(counter.isOnSegment())return counter.getLocation();}return counter.getLocation();}else if(arguments[0]instanceof Coordinate&&arguments[1]instanceof Array){var p=arguments[0],ring=arguments[1];var counter=new RayCrossingCounter(p);for(var i=1;i<ring.length;i++){var p1=ring[i];var p2=ring[i-1];counter.countSegment(p1,p2);if(counter.isOnSegment())return counter.getLocation();}return counter.getLocation();}};function CGAlgorithms(){}extend$1(CGAlgorithms.prototype,{interfaces_:function interfaces_(){return[];},getClass:function getClass(){return CGAlgorithms;}});CGAlgorithms.orientationIndex=function(p1,p2,q){return CGAlgorithmsDD.orientationIndex(p1,p2,q);};CGAlgorithms.signedArea=function(){if(arguments[0]instanceof Array){var ring=arguments[0];if(ring.length<3)return 0.0;var sum=0.0;var x0=ring[0].x;for(var i=1;i<ring.length-1;i++){var x=ring[i].x-x0;var y1=ring[i+1].y;var y2=ring[i-1].y;sum+=x*(y2-y1);}return sum/2.0;}else if(hasInterface(arguments[0],CoordinateSequence)){var ring=arguments[0];var n=ring.size();if(n<3)return 0.0;var p0=new Coordinate();var p1=new Coordinate();var p2=new Coordinate();ring.getCoordinate(0,p1);ring.getCoordinate(1,p2);var x0=p1.x;p2.x-=x0;var sum=0.0;for(var i=1;i<n-1;i++){p0.y=p1.y;p1.x=p2.x;p1.y=p2.y;ring.getCoordinate(i+1,p2);p2.x-=x0;sum+=p1.x*(p0.y-p2.y);}return sum/2.0;}};CGAlgorithms.distanceLineLine=function(A,B,C,D){if(A.equals(B))return CGAlgorithms.distancePointLine(A,C,D);if(C.equals(D))return CGAlgorithms.distancePointLine(D,A,B);var noIntersection=false;if(!Envelope.intersects(A,B,C,D)){noIntersection=true;}else{var denom=(B.x-A.x)*(D.y-C.y)-(B.y-A.y)*(D.x-C.x);if(denom===0){noIntersection=true;}else{var r_num=(A.y-C.y)*(D.x-C.x)-(A.x-C.x)*(D.y-C.y);var s_num=(A.y-C.y)*(B.x-A.x)-(A.x-C.x)*(B.y-A.y);var s=s_num/denom;var r=r_num/denom;if(r<0||r>1||s<0||s>1){noIntersection=true;}}}if(noIntersection){return MathUtil.min(CGAlgorithms.distancePointLine(A,C,D),CGAlgorithms.distancePointLine(B,C,D),CGAlgorithms.distancePointLine(C,A,B),CGAlgorithms.distancePointLine(D,A,B));}return 0.0;};CGAlgorithms.isPointInRing=function(p,ring){return CGAlgorithms.locatePointInRing(p,ring)!==Location.EXTERIOR;};CGAlgorithms.computeLength=function(pts){var n=pts.size();if(n<=1)return 0.0;var len=0.0;var p=new Coordinate();pts.getCoordinate(0,p);var x0=p.x;var y0=p.y;for(var i=1;i<n;i++){pts.getCoordinate(i,p);var x1=p.x;var y1=p.y;var dx=x1-x0;var dy=y1-y0;len+=Math.sqrt(dx*dx+dy*dy);x0=x1;y0=y1;}return len;};CGAlgorithms.isCCW=function(ring){var nPts=ring.length-1;if(nPts<3)throw new IllegalArgumentException("Ring has fewer than 4 points, so orientation cannot be determined");var hiPt=ring[0];var hiIndex=0;for(var i=1;i<=nPts;i++){var p=ring[i];if(p.y>hiPt.y){hiPt=p;hiIndex=i;}}var iPrev=hiIndex;do{iPrev=iPrev-1;if(iPrev<0)iPrev=nPts;}while(ring[iPrev].equals2D(hiPt)&&iPrev!==hiIndex);var iNext=hiIndex;do{iNext=(iNext+1)%nPts;}while(ring[iNext].equals2D(hiPt)&&iNext!==hiIndex);var prev=ring[iPrev];var next=ring[iNext];if(prev.equals2D(hiPt)||next.equals2D(hiPt)||prev.equals2D(next))return false;var disc=CGAlgorithms.computeOrientation(prev,hiPt,next);var isCCW=false;if(disc===0){isCCW=prev.x>next.x;}else{isCCW=disc>0;}return isCCW;};CGAlgorithms.locatePointInRing=function(p,ring){return RayCrossingCounter.locatePointInRing(p,ring);};CGAlgorithms.distancePointLinePerpendicular=function(p,A,B){var len2=(B.x-A.x)*(B.x-A.x)+(B.y-A.y)*(B.y-A.y);var s=((A.y-p.y)*(B.x-A.x)-(A.x-p.x)*(B.y-A.y))/len2;return Math.abs(s)*Math.sqrt(len2);};CGAlgorithms.computeOrientation=function(p1,p2,q){return CGAlgorithms.orientationIndex(p1,p2,q);};CGAlgorithms.distancePointLine=function(){if(arguments.length===2){var p=arguments[0],line=arguments[1];if(line.length===0)throw new IllegalArgumentException("Line array must contain at least one vertex");var minDistance=p.distance(line[0]);for(var i=0;i<line.length-1;i++){var dist=CGAlgorithms.distancePointLine(p,line[i],line[i+1]);if(dist<minDistance){minDistance=dist;}}return minDistance;}else if(arguments.length===3){var p=arguments[0],A=arguments[1],B=arguments[2];if(A.x===B.x&&A.y===B.y)return p.distance(A);var len2=(B.x-A.x)*(B.x-A.x)+(B.y-A.y)*(B.y-A.y);var r=((p.x-A.x)*(B.x-A.x)+(p.y-A.y)*(B.y-A.y))/len2;if(r<=0.0)return p.distance(A);if(r>=1.0)return p.distance(B);var s=((A.y-p.y)*(B.x-A.x)-(A.x-p.x)*(B.y-A.y))/len2;return Math.abs(s)*Math.sqrt(len2);}};CGAlgorithms.isOnLine=function(p,pt){var lineIntersector=new RobustLineIntersector();for(var i=1;i<pt.length;i++){var p0=pt[i-1];var p1=pt[i];lineIntersector.computeIntersection(p,p0,p1);if(lineIntersector.hasIntersection()){return true;}}return false;};CGAlgorithms.CLOCKWISE=-1;CGAlgorithms.RIGHT=CGAlgorithms.CLOCKWISE;CGAlgorithms.COUNTERCLOCKWISE=1;CGAlgorithms.LEFT=CGAlgorithms.COUNTERCLOCKWISE;CGAlgorithms.COLLINEAR=0;CGAlgorithms.STRAIGHT=CGAlgorithms.COLLINEAR;function GeometryComponentFilter(){}extend$1(GeometryComponentFilter.prototype,{filter:function filter(geom){},interfaces_:function interfaces_(){return[];},getClass:function getClass(){return GeometryComponentFilter;}});function Geometry(){this.envelope=null;this.factory=null;this.SRID=null;this.userData=null;var factory=arguments[0];this.factory=factory;this.SRID=factory.getSRID();}extend$1(Geometry.prototype,{isGeometryCollection:function isGeometryCollection(){return this.getSortIndex()===Geometry.SORTINDEX_GEOMETRYCOLLECTION;},getFactory:function getFactory(){return this.factory;},getGeometryN:function getGeometryN(n){return this;},getArea:function getArea(){return 0.0;},isRectangle:function isRectangle(){return false;},equals:function equals(){if(arguments.length===1){if(arguments[0]instanceof Geometry){var g=arguments[0];if(g===null)return false;return this.equalsTopo(g);}else if(arguments[0]instanceof Object){var o=arguments[0];if(!(o instanceof Geometry))return false;var g=o;return this.equalsExact(g);}}},equalsExact:function equalsExact(other){return this===other||this.equalsExact(other,0);},geometryChanged:function geometryChanged(){this.apply(Geometry.geometryChangedFilter);},geometryChangedAction:function geometryChangedAction(){this.envelope=null;},equalsNorm:function equalsNorm(g){if(g===null)return false;return this.norm().equalsExact(g.norm());},getLength:function getLength(){return 0.0;},getNumGeometries:function getNumGeometries(){return 1;},compareTo:function compareTo(){if(arguments.length===1){var o=arguments[0];var other=o;if(this.getSortIndex()!==other.getSortIndex()){return this.getSortIndex()-other.getSortIndex();}if(this.isEmpty()&&other.isEmpty()){return 0;}if(this.isEmpty()){return-1;}if(other.isEmpty()){return 1;}return this.compareToSameClass(o);}else if(arguments.length===2){var o=arguments[0],comp=arguments[1];var other=o;if(this.getSortIndex()!==other.getSortIndex()){return this.getSortIndex()-other.getSortIndex();}if(this.isEmpty()&&other.isEmpty()){return 0;}if(this.isEmpty()){return-1;}if(other.isEmpty()){return 1;}return this.compareToSameClass(o,comp);}},getUserData:function getUserData(){return this.userData;},getSRID:function getSRID(){return this.SRID;},getEnvelope:function getEnvelope(){return this.getFactory().toGeometry(this.getEnvelopeInternal());},checkNotGeometryCollection:function checkNotGeometryCollection(g){if(g.getSortIndex()===Geometry.SORTINDEX_GEOMETRYCOLLECTION){throw new IllegalArgumentException("This method does not support GeometryCollection arguments");}},equal:function equal(a,b,tolerance){if(tolerance===0){return a.equals(b);}return a.distance(b)<=tolerance;},norm:function norm(){var copy=this.copy();copy.normalize();return copy;},getPrecisionModel:function getPrecisionModel(){return this.factory.getPrecisionModel();},getEnvelopeInternal:function getEnvelopeInternal(){if(this.envelope===null){this.envelope=this.computeEnvelopeInternal();}return new Envelope(this.envelope);},setSRID:function setSRID(SRID){this.SRID=SRID;},setUserData:function setUserData(userData){this.userData=userData;},compare:function compare(a,b){var i=a.iterator();var j=b.iterator();while(i.hasNext()&&j.hasNext()){var aElement=i.next();var bElement=j.next();var comparison=aElement.compareTo(bElement);if(comparison!==0){return comparison;}}if(i.hasNext()){return 1;}if(j.hasNext()){return-1;}return 0;},hashCode:function hashCode(){return this.getEnvelopeInternal().hashCode();},isGeometryCollectionOrDerived:function isGeometryCollectionOrDerived(){if(this.getSortIndex()===Geometry.SORTINDEX_GEOMETRYCOLLECTION||this.getSortIndex()===Geometry.SORTINDEX_MULTIPOINT||this.getSortIndex()===Geometry.SORTINDEX_MULTILINESTRING||this.getSortIndex()===Geometry.SORTINDEX_MULTIPOLYGON){return true;}return false;},interfaces_:function interfaces_(){return[Clonable,Comparable,Serializable];},getClass:function getClass(){return Geometry;}});Geometry.hasNonEmptyElements=function(geometries){for(var i=0;i<geometries.length;i++){if(!geometries[i].isEmpty()){return true;}}return false;};Geometry.hasNullElements=function(array){for(var i=0;i<array.length;i++){if(array[i]===null){return true;}}return false;};Geometry.serialVersionUID=8763622679187376702;Geometry.SORTINDEX_POINT=0;Geometry.SORTINDEX_MULTIPOINT=1;Geometry.SORTINDEX_LINESTRING=2;Geometry.SORTINDEX_LINEARRING=3;Geometry.SORTINDEX_MULTILINESTRING=4;Geometry.SORTINDEX_POLYGON=5;Geometry.SORTINDEX_MULTIPOLYGON=6;Geometry.SORTINDEX_GEOMETRYCOLLECTION=7;Geometry.geometryChangedFilter={interfaces_:function interfaces_(){return[GeometryComponentFilter];},filter:function filter(geom){geom.geometryChangedAction();}};function CoordinateFilter(){}extend$1(CoordinateFilter.prototype,{filter:function filter(coord){},interfaces_:function interfaces_(){return[];},getClass:function getClass(){return CoordinateFilter;}});function BoundaryNodeRule(){}extend$1(BoundaryNodeRule.prototype,{isInBoundary:function isInBoundary(boundaryCount){},interfaces_:function interfaces_(){return[];},getClass:function getClass(){return BoundaryNodeRule;}});function Mod2BoundaryNodeRule(){}extend$1(Mod2BoundaryNodeRule.prototype,{isInBoundary:function isInBoundary(boundaryCount){return boundaryCount%2===1;},interfaces_:function interfaces_(){return[BoundaryNodeRule];},getClass:function getClass(){return Mod2BoundaryNodeRule;}});function EndPointBoundaryNodeRule(){}extend$1(EndPointBoundaryNodeRule.prototype,{isInBoundary:function isInBoundary(boundaryCount){return boundaryCount>0;},interfaces_:function interfaces_(){return[BoundaryNodeRule];},getClass:function getClass(){return EndPointBoundaryNodeRule;}});function MultiValentEndPointBoundaryNodeRule(){}extend$1(MultiValentEndPointBoundaryNodeRule.prototype,{isInBoundary:function isInBoundary(boundaryCount){return boundaryCount>1;},interfaces_:function interfaces_(){return[BoundaryNodeRule];},getClass:function getClass(){return MultiValentEndPointBoundaryNodeRule;}});function MonoValentEndPointBoundaryNodeRule(){}extend$1(MonoValentEndPointBoundaryNodeRule.prototype,{isInBoundary:function isInBoundary(boundaryCount){return boundaryCount===1;},interfaces_:function interfaces_(){return[BoundaryNodeRule];},getClass:function getClass(){return MonoValentEndPointBoundaryNodeRule;}});BoundaryNodeRule.Mod2BoundaryNodeRule=Mod2BoundaryNodeRule;BoundaryNodeRule.EndPointBoundaryNodeRule=EndPointBoundaryNodeRule;BoundaryNodeRule.MultiValentEndPointBoundaryNodeRule=MultiValentEndPointBoundaryNodeRule;BoundaryNodeRule.MonoValentEndPointBoundaryNodeRule=MonoValentEndPointBoundaryNodeRule;BoundaryNodeRule.MOD2_BOUNDARY_RULE=new Mod2BoundaryNodeRule();BoundaryNodeRule.ENDPOINT_BOUNDARY_RULE=new EndPointBoundaryNodeRule();BoundaryNodeRule.MULTIVALENT_ENDPOINT_BOUNDARY_RULE=new MultiValentEndPointBoundaryNodeRule();BoundaryNodeRule.MONOVALENT_ENDPOINT_BOUNDARY_RULE=new MonoValentEndPointBoundaryNodeRule();BoundaryNodeRule.OGC_SFS_BOUNDARY_RULE=BoundaryNodeRule.MOD2_BOUNDARY_RULE;/**
 * @see http://download.oracle.com/javase/6/docs/api/java/util/Iterator.html
 * @constructor
 * @private
 */function Iterator(){}/**
 * Returns true if the iteration has more elements.
 * @return {boolean}
 */Iterator.prototype.hasNext=function(){};/**
 * Returns the next element in the iteration.
 * @return {Object}
 */Iterator.prototype.next=function(){};/**
 * Removes from the underlying collection the last element returned by the
 * iterator (optional operation).
 */Iterator.prototype.remove=function(){};/**
 * @see http://download.oracle.com/javase/6/docs/api/java/util/Collection.html
 *
 * @constructor
 * @private
 */function Collection(){}/**
 * Ensures that this collection contains the specified element (optional
 * operation).
 * @param {Object} e
 * @return {boolean}
 */Collection.prototype.add=function(){};/**
 * Appends all of the elements in the specified collection to the end of this
 * list, in the order that they are returned by the specified collection's
 * iterator (optional operation).
 * @param {javascript.util.Collection} c
 * @return {boolean}
 */Collection.prototype.addAll=function(){};/**
 * Returns true if this collection contains no elements.
 * @return {boolean}
 */Collection.prototype.isEmpty=function(){};/**
 * Returns an iterator over the elements in this collection.
 * @return {javascript.util.Iterator}
 */Collection.prototype.iterator=function(){};/**
 * Returns an iterator over the elements in this collection.
 * @return {number}
 */Collection.prototype.size=function(){};/**
 * Returns an array containing all of the elements in this collection.
 * @return {Array}
 */Collection.prototype.toArray=function(){};/**
 * Removes a single instance of the specified element from this collection if it
 * is present. (optional)
 * @param {Object} e
 * @return {boolean}
 */Collection.prototype.remove=function(){};/**
 * @param {string=} message Optional message
 * @extends {Error}
 * @constructor
 * @private
 */function IndexOutOfBoundsException$1(message){this.message=message||'';}IndexOutOfBoundsException$1.prototype=new Error();/**
 * @type {string}
 */IndexOutOfBoundsException$1.prototype.name='IndexOutOfBoundsException';/**
 * @see http://download.oracle.com/javase/6/docs/api/java/util/List.html
 *
 * @extends {javascript.util.Collection}
 * @constructor
 * @private
 */function List(){}List.prototype=Object.create(Collection.prototype);List.prototype.constructor=List;/**
 * Returns the element at the specified position in this list.
 * @param {number} index
 * @return {Object}
 */List.prototype.get=function(){};/**
 * Replaces the element at the specified position in this list with the
 * specified element (optional operation).
 * @param {number} index
 * @param {Object} e
 * @return {Object}
 */List.prototype.set=function(){};/**
 * Returns true if this collection contains no elements.
 * @return {boolean}
 */List.prototype.isEmpty=function(){};/**
 * @param {string=} message Optional message
 * @extends {Error}
 * @constructor
 * @private
 */function NoSuchElementException(message){this.message=message||'';}NoSuchElementException.prototype=new Error();/**
 * @type {string}
 */NoSuchElementException.prototype.name='NoSuchElementException';/**
 * @param {string=} message Optional message
 * @extends {Error}
 * @constructor
 * @private
 */function OperationNotSupported(message){this.message=message||'';}OperationNotSupported.prototype=new Error();/**
 * @type {string}
 */OperationNotSupported.prototype.name='OperationNotSupported';/**
 * @see http://download.oracle.com/javase/6/docs/api/java/util/ArrayList.html
 *
 * @extends List
 * @private
 */function ArrayList(){/**
   * @type {Array}
   * @private
  */this.array_=[];if(arguments[0]instanceof Collection){this.addAll(arguments[0]);}}ArrayList.prototype=Object.create(List.prototype);ArrayList.prototype.constructor=ArrayList;ArrayList.prototype.ensureCapacity=function(){};ArrayList.prototype.interfaces_=function(){return[List,Collection];};/**
 * @override
 */ArrayList.prototype.add=function(e){if(arguments.length===1){this.array_.push(e);}else{this.array_.splice(arguments[0],arguments[1]);}return true;};ArrayList.prototype.clear=function(){this.array_=[];};/**
 * @override
 */ArrayList.prototype.addAll=function(c){for(var i=c.iterator();i.hasNext();){this.add(i.next());}return true;};/**
 * @override
 */ArrayList.prototype.set=function(index,element){var oldElement=this.array_[index];this.array_[index]=element;return oldElement;};/**
 * @override
 */ArrayList.prototype.iterator=function(){return new Iterator_(this);};/**
 * @override
 */ArrayList.prototype.get=function(index){if(index<0||index>=this.size()){throw new IndexOutOfBoundsException$1();}return this.array_[index];};/**
 * @override
 */ArrayList.prototype.isEmpty=function(){return this.array_.length===0;};/**
 * @override
 */ArrayList.prototype.size=function(){return this.array_.length;};/**
 * @override
 */ArrayList.prototype.toArray=function(){var array=[];for(var i=0,len=this.array_.length;i<len;i++){array.push(this.array_[i]);}return array;};/**
 * @override
 */ArrayList.prototype.remove=function(o){var found=false;for(var i=0,len=this.array_.length;i<len;i++){if(this.array_[i]===o){this.array_.splice(i,1);found=true;break;}}return found;};/**
 * @extends {Iterator}
 * @param {ArrayList} arrayList
 * @constructor
 * @private
 */var Iterator_=function Iterator_(arrayList){/**
   * @type {ArrayList}
   * @private
  */this.arrayList_=arrayList;/**
   * @type {number}
   * @private
  */this.position_=0;};/**
 * @override
 */Iterator_.prototype.next=function(){if(this.position_===this.arrayList_.size()){throw new NoSuchElementException();}return this.arrayList_.get(this.position_++);};/**
 * @override
 */Iterator_.prototype.hasNext=function(){if(this.position_<this.arrayList_.size()){return true;}else{return false;}};/**
 * TODO: should be in ListIterator
 * @override
 */Iterator_.prototype.set=function(element){return this.arrayList_.set(this.position_-1,element);};/**
 * @override
 */Iterator_.prototype.remove=function(){this.arrayList_.remove(this.arrayList_.get(this.position_));};function CoordinateList(){ArrayList.apply(this);if(arguments.length===0){}else if(arguments.length===1){var coord=arguments[0];this.ensureCapacity(coord.length);this.add(coord,true);}else if(arguments.length===2){var coord=arguments[0],allowRepeated=arguments[1];this.ensureCapacity(coord.length);this.add(coord,allowRepeated);}}inherits$1(CoordinateList,ArrayList);extend$1(CoordinateList.prototype,{getCoordinate:function getCoordinate(i){return this.get(i);},addAll:function addAll(){if(arguments.length===2){var coll=arguments[0],allowRepeated=arguments[1];var isChanged=false;for(var i=coll.iterator();i.hasNext();){this.add(i.next(),allowRepeated);isChanged=true;}return isChanged;}else return ArrayList.prototype.addAll.apply(this,arguments);},clone:function clone(){var clone=ArrayList.prototype.clone.call(this);for(var i=0;i<this.size();i++){clone.add(i,this.get(i).copy());}return clone;},toCoordinateArray:function toCoordinateArray(){return this.toArray(CoordinateList.coordArrayType);},add:function add(){if(arguments.length===1){var coord=arguments[0];ArrayList.prototype.add.call(this,coord);}else if(arguments.length===2){if(arguments[0]instanceof Array&&typeof arguments[1]==="boolean"){var coord=arguments[0],allowRepeated=arguments[1];this.add(coord,allowRepeated,true);return true;}else if(arguments[0]instanceof Coordinate&&typeof arguments[1]==="boolean"){var coord=arguments[0],allowRepeated=arguments[1];if(!allowRepeated){if(this.size()>=1){var last=this.get(this.size()-1);if(last.equals2D(coord))return null;}}ArrayList.prototype.add.call(this,coord);}else if(arguments[0]instanceof Object&&typeof arguments[1]==="boolean"){var obj=arguments[0],allowRepeated=arguments[1];this.add(obj,allowRepeated);return true;}}else if(arguments.length===3){if(typeof arguments[2]==="boolean"&&arguments[0]instanceof Array&&typeof arguments[1]==="boolean"){var coord=arguments[0],allowRepeated=arguments[1],direction=arguments[2];if(direction){for(var i=0;i<coord.length;i++){this.add(coord[i],allowRepeated);}}else{for(var i=coord.length-1;i>=0;i--){this.add(coord[i],allowRepeated);}}return true;}else if(typeof arguments[2]==="boolean"&&Number.isInteger(arguments[0])&&arguments[1]instanceof Coordinate){var i=arguments[0],coord=arguments[1],allowRepeated=arguments[2];if(!allowRepeated){var size=this.size();if(size>0){if(i>0){var prev=this.get(i-1);if(prev.equals2D(coord))return null;}if(i<size){var next=this.get(i);if(next.equals2D(coord))return null;}}}ArrayList.prototype.add.call(this,i,coord);}}else if(arguments.length===4){var coord=arguments[0],allowRepeated=arguments[1],start=arguments[2],end=arguments[3];var inc=1;if(start>end)inc=-1;for(var i=start;i!==end;i+=inc){this.add(coord[i],allowRepeated);}return true;}},closeRing:function closeRing(){if(this.size()>0)this.add(new Coordinate(this.get(0)),false);},interfaces_:function interfaces_(){return[];},getClass:function getClass(){return CoordinateList;}});CoordinateList.coordArrayType=new Array(0).fill(null);function CoordinateArrays(){}extend$1(CoordinateArrays.prototype,{interfaces_:function interfaces_(){return[];},getClass:function getClass(){return CoordinateArrays;}});CoordinateArrays.isRing=function(pts){if(pts.length<4)return false;if(!pts[0].equals2D(pts[pts.length-1]))return false;return true;};CoordinateArrays.ptNotInList=function(testPts,pts){for(var i=0;i<testPts.length;i++){var testPt=testPts[i];if(CoordinateArrays.indexOf(testPt,pts)<0)return testPt;}return null;};CoordinateArrays.scroll=function(coordinates,firstCoordinate){var i=CoordinateArrays.indexOf(firstCoordinate,coordinates);if(i<0)return null;var newCoordinates=new Array(coordinates.length).fill(null);System.arraycopy(coordinates,i,newCoordinates,0,coordinates.length-i);System.arraycopy(coordinates,0,newCoordinates,coordinates.length-i,i);System.arraycopy(newCoordinates,0,coordinates,0,coordinates.length);};CoordinateArrays.equals=function(){if(arguments.length===2){var coord1=arguments[0],coord2=arguments[1];if(coord1===coord2)return true;if(coord1===null||coord2===null)return false;if(coord1.length!==coord2.length)return false;for(var i=0;i<coord1.length;i++){if(!coord1[i].equals(coord2[i]))return false;}return true;}else if(arguments.length===3){var coord1=arguments[0],coord2=arguments[1],coordinateComparator=arguments[2];if(coord1===coord2)return true;if(coord1===null||coord2===null)return false;if(coord1.length!==coord2.length)return false;for(var i=0;i<coord1.length;i++){if(coordinateComparator.compare(coord1[i],coord2[i])!==0)return false;}return true;}};CoordinateArrays.intersection=function(coordinates,env){var coordList=new CoordinateList();for(var i=0;i<coordinates.length;i++){if(env.intersects(coordinates[i]))coordList.add(coordinates[i],true);}return coordList.toCoordinateArray();};CoordinateArrays.hasRepeatedPoints=function(coord){for(var i=1;i<coord.length;i++){if(coord[i-1].equals(coord[i])){return true;}}return false;};CoordinateArrays.removeRepeatedPoints=function(coord){if(!CoordinateArrays.hasRepeatedPoints(coord))return coord;var coordList=new CoordinateList(coord,false);return coordList.toCoordinateArray();};CoordinateArrays.reverse=function(coord){var last=coord.length-1;var mid=Math.trunc(last/2);for(var i=0;i<=mid;i++){var tmp=coord[i];coord[i]=coord[last-i];coord[last-i]=tmp;}};CoordinateArrays.removeNull=function(coord){var nonNull=0;for(var i=0;i<coord.length;i++){if(coord[i]!==null)nonNull++;}var newCoord=new Array(nonNull).fill(null);if(nonNull===0)return newCoord;var j=0;for(var i=0;i<coord.length;i++){if(coord[i]!==null)newCoord[j++]=coord[i];}return newCoord;};CoordinateArrays.copyDeep=function(){if(arguments.length===1){var coordinates=arguments[0];var copy=new Array(coordinates.length).fill(null);for(var i=0;i<coordinates.length;i++){copy[i]=new Coordinate(coordinates[i]);}return copy;}else if(arguments.length===5){var src=arguments[0],srcStart=arguments[1],dest=arguments[2],destStart=arguments[3],length=arguments[4];for(var i=0;i<length;i++){dest[destStart+i]=new Coordinate(src[srcStart+i]);}}};CoordinateArrays.isEqualReversed=function(pts1,pts2){for(var i=0;i<pts1.length;i++){var p1=pts1[i];var p2=pts2[pts1.length-i-1];if(p1.compareTo(p2)!==0)return false;}return true;};CoordinateArrays.envelope=function(coordinates){var env=new Envelope();for(var i=0;i<coordinates.length;i++){env.expandToInclude(coordinates[i]);}return env;};CoordinateArrays.toCoordinateArray=function(coordList){return coordList.toArray(CoordinateArrays.coordArrayType);};CoordinateArrays.atLeastNCoordinatesOrNothing=function(n,c){return c.length>=n?c:[];};CoordinateArrays.indexOf=function(coordinate,coordinates){for(var i=0;i<coordinates.length;i++){if(coordinate.equals(coordinates[i])){return i;}}return-1;};CoordinateArrays.increasingDirection=function(pts){for(var i=0;i<Math.trunc(pts.length/2);i++){var j=pts.length-1-i;var comp=pts[i].compareTo(pts[j]);if(comp!==0)return comp;}return 1;};CoordinateArrays.compare=function(pts1,pts2){var i=0;while(i<pts1.length&&i<pts2.length){var compare=pts1[i].compareTo(pts2[i]);if(compare!==0)return compare;i++;}if(i<pts2.length)return-1;if(i<pts1.length)return 1;return 0;};CoordinateArrays.minCoordinate=function(coordinates){var minCoord=null;for(var i=0;i<coordinates.length;i++){if(minCoord===null||minCoord.compareTo(coordinates[i])>0){minCoord=coordinates[i];}}return minCoord;};CoordinateArrays.extract=function(pts,start,end){start=MathUtil.clamp(start,0,pts.length);end=MathUtil.clamp(end,-1,pts.length);var npts=end-start+1;if(end<0)npts=0;if(start>=pts.length)npts=0;if(end<start)npts=0;var extractPts=new Array(npts).fill(null);if(npts===0)return extractPts;var iPts=0;for(var i=start;i<=end;i++){extractPts[iPts++]=pts[i];}return extractPts;};function ForwardComparator(){}extend$1(ForwardComparator.prototype,{compare:function compare(o1,o2){var pts1=o1;var pts2=o2;return CoordinateArrays.compare(pts1,pts2);},interfaces_:function interfaces_(){return[Comparator];},getClass:function getClass(){return ForwardComparator;}});function BidirectionalComparator(){}extend$1(BidirectionalComparator.prototype,{compare:function compare(o1,o2){var pts1=o1;var pts2=o2;if(pts1.length<pts2.length)return-1;if(pts1.length>pts2.length)return 1;if(pts1.length===0)return 0;var forwardComp=CoordinateArrays.compare(pts1,pts2);var isEqualRev=CoordinateArrays.isEqualReversed(pts1,pts2);if(isEqualRev)return 0;return forwardComp;},OLDcompare:function OLDcompare(o1,o2){var pts1=o1;var pts2=o2;if(pts1.length<pts2.length)return-1;if(pts1.length>pts2.length)return 1;if(pts1.length===0)return 0;var dir1=CoordinateArrays.increasingDirection(pts1);var dir2=CoordinateArrays.increasingDirection(pts2);var i1=dir1>0?0:pts1.length-1;var i2=dir2>0?0:pts1.length-1;for(var i=0;i<pts1.length;i++){var comparePt=pts1[i1].compareTo(pts2[i2]);if(comparePt!==0)return comparePt;i1+=dir1;i2+=dir2;}return 0;},interfaces_:function interfaces_(){return[Comparator];},getClass:function getClass(){return BidirectionalComparator;}});CoordinateArrays.ForwardComparator=ForwardComparator;CoordinateArrays.BidirectionalComparator=BidirectionalComparator;CoordinateArrays.coordArrayType=new Array(0).fill(null);/**
 * @see http://download.oracle.com/javase/6/docs/api/java/util/Map.html
 *
 * @constructor
 * @private
 */function Map$1$1(){}/**
 * Returns the value to which the specified key is mapped, or null if this map
 * contains no mapping for the key.
 * @param {Object} key
 * @return {Object}
 */Map$1$1.prototype.get=function(){};/**
 * Associates the specified value with the specified key in this map (optional
 * operation).
 * @param {Object} key
 * @param {Object} value
 * @return {Object}
 */Map$1$1.prototype.put=function(){};/**
 * Returns the number of key-value mappings in this map.
 * @return {number}
 */Map$1$1.prototype.size=function(){};/**
 * Returns a Collection view of the values contained in this map.
 * @return {javascript.util.Collection}
 */Map$1$1.prototype.values=function(){};/**
 * Returns a {@link Set} view of the mappings contained in this map.
 * The set is backed by the map, so changes to the map are
 * reflected in the set, and vice-versa.  If the map is modified
 * while an iteration over the set is in progress (except through
 * the iterator's own <tt>remove</tt> operation, or through the
 * <tt>setValue</tt> operation on a map entry returned by the
 * iterator) the results of the iteration are undefined.  The set
 * supports element removal, which removes the corresponding
 * mapping from the map, via the <tt>Iterator.remove</tt>,
 * <tt>Set.remove</tt>, <tt>removeAll</tt>, <tt>retainAll</tt> and
 * <tt>clear</tt> operations.  It does not support the
 * <tt>add</tt> or <tt>addAll</tt> operations.
 *
 * @return {Set} a set view of the mappings contained in this map
 */Map$1$1.prototype.entrySet=function(){};/**
 * @see http://download.oracle.com/javase/6/docs/api/java/util/SortedMap.html
 *
 * @extends {Map}
 * @constructor
 * @private
 */function SortedMap(){}SortedMap.prototype=new Map$1$1();/**
 * @see http://download.oracle.com/javase/6/docs/api/java/util/Set.html
 *
 * @extends {Collection}
 * @constructor
 * @private
 */function Set$2(){}Set$2.prototype=new Collection();/**
 * Returns true if this set contains the specified element. More formally,
 * returns true if and only if this set contains an element e such that (o==null ?
 * e==null : o.equals(e)).
 * @param {Object} e
 * @return {boolean}
 */Set$2.prototype.contains=function(){};/**
 * @see http://docs.oracle.com/javase/6/docs/api/java/util/HashSet.html
 *
 * @extends {javascript.util.Set}
 * @constructor
 * @private
 */function HashSet(){/**
   * @type {Array}
   * @private
  */this.array_=[];if(arguments[0]instanceof Collection){this.addAll(arguments[0]);}}HashSet.prototype=new Set$2();/**
 * @override
 */HashSet.prototype.contains=function(o){for(var i=0,len=this.array_.length;i<len;i++){var e=this.array_[i];if(e===o){return true;}}return false;};/**
 * @override
 */HashSet.prototype.add=function(o){if(this.contains(o)){return false;}this.array_.push(o);return true;};/**
 * @override
 */HashSet.prototype.addAll=function(c){for(var i=c.iterator();i.hasNext();){this.add(i.next());}return true;};/**
 * @override
 */HashSet.prototype.remove=function(o){throw new javascript.util.OperationNotSupported();};/**
 * @override
 */HashSet.prototype.size=function(){return this.array_.length;};/**
 * @override
 */HashSet.prototype.isEmpty=function(){return this.array_.length===0;};/**
 * @override
 */HashSet.prototype.toArray=function(){var array=[];for(var i=0,len=this.array_.length;i<len;i++){array.push(this.array_[i]);}return array;};/**
 * @override
 */HashSet.prototype.iterator=function(){return new Iterator_$1(this);};/**
 * @extends {Iterator}
 * @param {HashSet} hashSet
 * @constructor
 * @private
 */var Iterator_$1=function Iterator_$1(hashSet){/**
   * @type {HashSet}
   * @private
   */this.hashSet_=hashSet;/**
   * @type {number}
   * @private
   */this.position_=0;};/**
 * @override
 */Iterator_$1.prototype.next=function(){if(this.position_===this.hashSet_.size()){throw new NoSuchElementException();}return this.hashSet_.array_[this.position_++];};/**
 * @override
 */Iterator_$1.prototype.hasNext=function(){if(this.position_<this.hashSet_.size()){return true;}else{return false;}};/**
 * @override
 */Iterator_$1.prototype.remove=function(){throw new OperationNotSupported();};var BLACK=0;var RED=1;function colorOf(p){return p==null?BLACK:p.color;}function parentOf(p){return p==null?null:p.parent;}function setColor(p,c){if(p!==null)p.color=c;}function leftOf(p){return p==null?null:p.left;}function rightOf(p){return p==null?null:p.right;}/**
 * @see http://download.oracle.com/javase/6/docs/api/java/util/TreeMap.html
 *
 * @extends {SortedMap}
 * @constructor
 * @private
 */function TreeMap(){/**
   * @type {Object}
   * @private
   */this.root_=null;/**
   * @type {number}
   * @private
  */this.size_=0;}TreeMap.prototype=new SortedMap();/**
 * @override
 */TreeMap.prototype.get=function(key){var p=this.root_;while(p!==null){var cmp=key['compareTo'](p.key);if(cmp<0){p=p.left;}else if(cmp>0){p=p.right;}else{return p.value;}}return null;};/**
 * @override
 */TreeMap.prototype.put=function(key,value){if(this.root_===null){this.root_={key:key,value:value,left:null,right:null,parent:null,color:BLACK,getValue:function getValue(){return this.value;},getKey:function getKey(){return this.key;}};this.size_=1;return null;}var t=this.root_,parent,cmp;do{parent=t;cmp=key['compareTo'](t.key);if(cmp<0){t=t.left;}else if(cmp>0){t=t.right;}else{var oldValue=t.value;t.value=value;return oldValue;}}while(t!==null);var e={key:key,left:null,right:null,value:value,parent:parent,color:BLACK,getValue:function getValue(){return this.value;},getKey:function getKey(){return this.key;}};if(cmp<0){parent.left=e;}else{parent.right=e;}this.fixAfterInsertion(e);this.size_++;return null;};/**
 * @param {Object} x
 */TreeMap.prototype.fixAfterInsertion=function(x){x.color=RED;while(x!=null&&x!=this.root_&&x.parent.color==RED){if(parentOf(x)==leftOf(parentOf(parentOf(x)))){var y=rightOf(parentOf(parentOf(x)));if(colorOf(y)==RED){setColor(parentOf(x),BLACK);setColor(y,BLACK);setColor(parentOf(parentOf(x)),RED);x=parentOf(parentOf(x));}else{if(x==rightOf(parentOf(x))){x=parentOf(x);this.rotateLeft(x);}setColor(parentOf(x),BLACK);setColor(parentOf(parentOf(x)),RED);this.rotateRight(parentOf(parentOf(x)));}}else{var y=leftOf(parentOf(parentOf(x)));if(colorOf(y)==RED){setColor(parentOf(x),BLACK);setColor(y,BLACK);setColor(parentOf(parentOf(x)),RED);x=parentOf(parentOf(x));}else{if(x==leftOf(parentOf(x))){x=parentOf(x);this.rotateRight(x);}setColor(parentOf(x),BLACK);setColor(parentOf(parentOf(x)),RED);this.rotateLeft(parentOf(parentOf(x)));}}}this.root_.color=BLACK;};/**
 * @override
 */TreeMap.prototype.values=function(){var arrayList=new ArrayList();var p=this.getFirstEntry();if(p!==null){arrayList.add(p.value);while((p=TreeMap.successor(p))!==null){arrayList.add(p.value);}}return arrayList;};/**
 * @override
 */TreeMap.prototype.entrySet=function(){var hashSet=new HashSet();var p=this.getFirstEntry();if(p!==null){hashSet.add(p);while((p=TreeMap.successor(p))!==null){hashSet.add(p);}}return hashSet;};/**
 * @param {Object} p
 */TreeMap.prototype.rotateLeft=function(p){if(p!=null){var r=p.right;p.right=r.left;if(r.left!=null)r.left.parent=p;r.parent=p.parent;if(p.parent==null)this.root_=r;else if(p.parent.left==p)p.parent.left=r;else p.parent.right=r;r.left=p;p.parent=r;}};/**
 * @param {Object} p
 */TreeMap.prototype.rotateRight=function(p){if(p!=null){var l=p.left;p.left=l.right;if(l.right!=null)l.right.parent=p;l.parent=p.parent;if(p.parent==null)this.root_=l;else if(p.parent.right==p)p.parent.right=l;else p.parent.left=l;l.right=p;p.parent=l;}};/**
 * @return {Object}
 */TreeMap.prototype.getFirstEntry=function(){var p=this.root_;if(p!=null){while(p.left!=null){p=p.left;}}return p;};/**
 * @param {Object} t
 * @return {Object}
 * @private
 */TreeMap.successor=function(t){if(t===null)return null;else if(t.right!==null){var p=t.right;while(p.left!==null){p=p.left;}return p;}else{var p=t.parent;var ch=t;while(p!==null&&ch===p.right){ch=p;p=p.parent;}return p;}};/**
 * @override
 */TreeMap.prototype.size=function(){return this.size_;};function Lineal(){}extend$1(Lineal.prototype,{interfaces_:function interfaces_(){return[];},getClass:function getClass(){return Lineal;}});/**
 * @see http://download.oracle.com/javase/6/docs/api/java/util/SortedSet.html
 *
 * @extends {Set}
 * @constructor
 * @private
 */function SortedSet(){}SortedSet.prototype=new Set$2();/**
 * @see http://download.oracle.com/javase/6/docs/api/java/util/TreeSet.html
 *
 * @extends {SortedSet}
 * @constructor
 * @private
 */function TreeSet(){/**
   * @type {Array}
   * @private
  */this.array_=[];if(arguments[0]instanceof Collection){this.addAll(arguments[0]);}}TreeSet.prototype=new SortedSet();/**
 * @override
 */TreeSet.prototype.contains=function(o){for(var i=0,len=this.array_.length;i<len;i++){var e=this.array_[i];if(e['compareTo'](o)===0){return true;}}return false;};/**
 * @override
 */TreeSet.prototype.add=function(o){if(this.contains(o)){return false;}for(var i=0,len=this.array_.length;i<len;i++){var e=this.array_[i];if(e['compareTo'](o)===1){this.array_.splice(i,0,o);return true;}}this.array_.push(o);return true;};/**
 * @override
 */TreeSet.prototype.addAll=function(c){for(var i=c.iterator();i.hasNext();){this.add(i.next());}return true;};/**
 * @override
 */TreeSet.prototype.remove=function(e){throw new OperationNotSupported();};/**
 * @override
 */TreeSet.prototype.size=function(){return this.array_.length;};/**
 * @override
 */TreeSet.prototype.isEmpty=function(){return this.array_.length===0;};/**
 * @override
 */TreeSet.prototype.toArray=function(){var array=[];for(var i=0,len=this.array_.length;i<len;i++){array.push(this.array_[i]);}return array;};/**
 * @override
 */TreeSet.prototype.iterator=function(){return new Iterator_$2(this);};/**
 * @extends {javascript.util.Iterator}
 * @param {javascript.util.TreeSet} treeSet
 * @constructor
 * @private
 */var Iterator_$2=function Iterator_$2(treeSet){/**
   * @type {javascript.util.TreeSet}
   * @private
   */this.treeSet_=treeSet;/**
   * @type {number}
   * @private
   */this.position_=0;};/**
 * @override
 */Iterator_$2.prototype.next=function(){if(this.position_===this.treeSet_.size()){throw new NoSuchElementException();}return this.treeSet_.array_[this.position_++];};/**
 * @override
 */Iterator_$2.prototype.hasNext=function(){if(this.position_<this.treeSet_.size()){return true;}else{return false;}};/**
 * @override
 */Iterator_$2.prototype.remove=function(){throw new OperationNotSupported();};/**
 * @see http://download.oracle.com/javase/6/docs/api/java/util/Arrays.html
 *
 * @constructor
 * @private
 */function Arrays(){}/**
 */Arrays.sort=function(){var a=arguments[0],i,t,comparator,compare;if(arguments.length===1){compare=function compare(a,b){return a.compareTo(b);};a.sort(compare);return;}else if(arguments.length===2){comparator=arguments[1];compare=function compare(a,b){return comparator['compare'](a,b);};a.sort(compare);}else if(arguments.length===3){t=a.slice(arguments[1],arguments[2]);t.sort();var r=a.slice(0,arguments[1]).concat(t,a.slice(arguments[2],a.length));a.splice(0,a.length);for(i=0;i<r.length;i++){a.push(r[i]);}return;}else if(arguments.length===4){t=a.slice(arguments[1],arguments[2]);comparator=arguments[3];compare=function compare(a,b){return comparator['compare'](a,b);};t.sort(compare);r=a.slice(0,arguments[1]).concat(t,a.slice(arguments[2],a.length));a.splice(0,a.length);for(i=0;i<r.length;i++){a.push(r[i]);}return;}};/**
 * @param {Array} array
 * @return {ArrayList}
 */Arrays.asList=function(array){var arrayList=new ArrayList();for(var i=0,len=array.length;i<len;i++){arrayList.add(array[i]);}return arrayList;};function Dimension(){}extend$1(Dimension.prototype,{interfaces_:function interfaces_(){return[];},getClass:function getClass(){return Dimension;}});Dimension.toDimensionSymbol=function(dimensionValue){switch(dimensionValue){case Dimension.FALSE:return Dimension.SYM_FALSE;case Dimension.TRUE:return Dimension.SYM_TRUE;case Dimension.DONTCARE:return Dimension.SYM_DONTCARE;case Dimension.P:return Dimension.SYM_P;case Dimension.L:return Dimension.SYM_L;case Dimension.A:return Dimension.SYM_A;}throw new IllegalArgumentException("Unknown dimension value: "+dimensionValue);};Dimension.toDimensionValue=function(dimensionSymbol){switch(Character.toUpperCase(dimensionSymbol)){case Dimension.SYM_FALSE:return Dimension.FALSE;case Dimension.SYM_TRUE:return Dimension.TRUE;case Dimension.SYM_DONTCARE:return Dimension.DONTCARE;case Dimension.SYM_P:return Dimension.P;case Dimension.SYM_L:return Dimension.L;case Dimension.SYM_A:return Dimension.A;}throw new IllegalArgumentException("Unknown dimension symbol: "+dimensionSymbol);};Dimension.P=0;Dimension.L=1;Dimension.A=2;Dimension.FALSE=-1;Dimension.TRUE=-2;Dimension.DONTCARE=-3;Dimension.SYM_FALSE='F';Dimension.SYM_TRUE='T';Dimension.SYM_DONTCARE='*';Dimension.SYM_P='0';Dimension.SYM_L='1';Dimension.SYM_A='2';function GeometryFilter(){}extend$1(GeometryFilter.prototype,{filter:function filter(geom){},interfaces_:function interfaces_(){return[];},getClass:function getClass(){return GeometryFilter;}});function CoordinateSequenceFilter(){}extend$1(CoordinateSequenceFilter.prototype,{filter:function filter(seq,i){},isDone:function isDone(){},isGeometryChanged:function isGeometryChanged(){},interfaces_:function interfaces_(){return[];},getClass:function getClass(){return CoordinateSequenceFilter;}});function GeometryCollection(){this.geometries=null;var geometries=arguments[0],factory=arguments[1];Geometry.call(this,factory);if(geometries===null){geometries=[];}if(Geometry.hasNullElements(geometries)){throw new IllegalArgumentException("geometries must not contain null elements");}this.geometries=geometries;}inherits$1(GeometryCollection,Geometry);extend$1(GeometryCollection.prototype,{computeEnvelopeInternal:function computeEnvelopeInternal(){var envelope=new Envelope();for(var i=0;i<this.geometries.length;i++){envelope.expandToInclude(this.geometries[i].getEnvelopeInternal());}return envelope;},getGeometryN:function getGeometryN(n){return this.geometries[n];},getSortIndex:function getSortIndex(){return Geometry.SORTINDEX_GEOMETRYCOLLECTION;},getCoordinates:function getCoordinates(){var coordinates=new Array(this.getNumPoints()).fill(null);var k=-1;for(var i=0;i<this.geometries.length;i++){var childCoordinates=this.geometries[i].getCoordinates();for(var j=0;j<childCoordinates.length;j++){k++;coordinates[k]=childCoordinates[j];}}return coordinates;},getArea:function getArea(){var area=0.0;for(var i=0;i<this.geometries.length;i++){area+=this.geometries[i].getArea();}return area;},equalsExact:function equalsExact(){if(arguments.length===2){var other=arguments[0],tolerance=arguments[1];if(!this.isEquivalentClass(other)){return false;}var otherCollection=other;if(this.geometries.length!==otherCollection.geometries.length){return false;}for(var i=0;i<this.geometries.length;i++){if(!this.geometries[i].equalsExact(otherCollection.geometries[i],tolerance)){return false;}}return true;}else return Geometry.prototype.equalsExact.apply(this,arguments);},normalize:function normalize(){for(var i=0;i<this.geometries.length;i++){this.geometries[i].normalize();}Arrays.sort(this.geometries);},getCoordinate:function getCoordinate(){if(this.isEmpty())return null;return this.geometries[0].getCoordinate();},getBoundaryDimension:function getBoundaryDimension(){var dimension=Dimension.FALSE;for(var i=0;i<this.geometries.length;i++){dimension=Math.max(dimension,this.geometries[i].getBoundaryDimension());}return dimension;},getDimension:function getDimension(){var dimension=Dimension.FALSE;for(var i=0;i<this.geometries.length;i++){dimension=Math.max(dimension,this.geometries[i].getDimension());}return dimension;},getLength:function getLength(){var sum=0.0;for(var i=0;i<this.geometries.length;i++){sum+=this.geometries[i].getLength();}return sum;},getNumPoints:function getNumPoints(){var numPoints=0;for(var i=0;i<this.geometries.length;i++){numPoints+=this.geometries[i].getNumPoints();}return numPoints;},getNumGeometries:function getNumGeometries(){return this.geometries.length;},reverse:function reverse(){var n=this.geometries.length;var revGeoms=new Array(n).fill(null);for(var i=0;i<this.geometries.length;i++){revGeoms[i]=this.geometries[i].reverse();}return this.getFactory().createGeometryCollection(revGeoms);},compareToSameClass:function compareToSameClass(){if(arguments.length===1){var o=arguments[0];var theseElements=new TreeSet(Arrays.asList(this.geometries));var otherElements=new TreeSet(Arrays.asList(o.geometries));return this.compare(theseElements,otherElements);}else if(arguments.length===2){var o=arguments[0],comp=arguments[1];var gc=o;var n1=this.getNumGeometries();var n2=gc.getNumGeometries();var i=0;while(i<n1&&i<n2){var thisGeom=this.getGeometryN(i);var otherGeom=gc.getGeometryN(i);var holeComp=thisGeom.compareToSameClass(otherGeom,comp);if(holeComp!==0)return holeComp;i++;}if(i<n1)return 1;if(i<n2)return-1;return 0;}},apply:function apply(){if(hasInterface(arguments[0],CoordinateFilter)){var filter=arguments[0];for(var i=0;i<this.geometries.length;i++){this.geometries[i].apply(filter);}}else if(hasInterface(arguments[0],CoordinateSequenceFilter)){var filter=arguments[0];if(this.geometries.length===0)return null;for(var i=0;i<this.geometries.length;i++){this.geometries[i].apply(filter);if(filter.isDone()){break;}}if(filter.isGeometryChanged())this.geometryChanged();}else if(hasInterface(arguments[0],GeometryFilter)){var filter=arguments[0];filter.filter(this);for(var i=0;i<this.geometries.length;i++){this.geometries[i].apply(filter);}}else if(hasInterface(arguments[0],GeometryComponentFilter)){var filter=arguments[0];filter.filter(this);for(var i=0;i<this.geometries.length;i++){this.geometries[i].apply(filter);}}},getBoundary:function getBoundary(){this.checkNotGeometryCollection(this);Assert.shouldNeverReachHere();return null;},clone:function clone(){var gc=Geometry.prototype.clone.call(this);gc.geometries=new Array(this.geometries.length).fill(null);for(var i=0;i<this.geometries.length;i++){gc.geometries[i]=this.geometries[i].clone();}return gc;},getGeometryType:function getGeometryType(){return"GeometryCollection";},copy:function copy(){var geometries=new Array(this.geometries.length).fill(null);for(var i=0;i<geometries.length;i++){geometries[i]=this.geometries[i].copy();}return new GeometryCollection(geometries,this.factory);},isEmpty:function isEmpty(){for(var i=0;i<this.geometries.length;i++){if(!this.geometries[i].isEmpty()){return false;}}return true;},interfaces_:function interfaces_(){return[];},getClass:function getClass(){return GeometryCollection;}});GeometryCollection.serialVersionUID=-5694727726395021467;function MultiLineString(){var lineStrings=arguments[0],factory=arguments[1];GeometryCollection.call(this,lineStrings,factory);}inherits$1(MultiLineString,GeometryCollection);extend$1(MultiLineString.prototype,{getSortIndex:function getSortIndex(){return Geometry.SORTINDEX_MULTILINESTRING;},equalsExact:function equalsExact(){if(arguments.length===2){var other=arguments[0],tolerance=arguments[1];if(!this.isEquivalentClass(other)){return false;}return GeometryCollection.prototype.equalsExact.call(this,other,tolerance);}else return GeometryCollection.prototype.equalsExact.apply(this,arguments);},getBoundaryDimension:function getBoundaryDimension(){if(this.isClosed()){return Dimension.FALSE;}return 0;},isClosed:function isClosed(){if(this.isEmpty()){return false;}for(var i=0;i<this.geometries.length;i++){if(!this.geometries[i].isClosed()){return false;}}return true;},getDimension:function getDimension(){return 1;},reverse:function reverse(){var nLines=this.geometries.length;var revLines=new Array(nLines).fill(null);for(var i=0;i<this.geometries.length;i++){revLines[nLines-1-i]=this.geometries[i].reverse();}return this.getFactory().createMultiLineString(revLines);},getBoundary:function getBoundary(){return new BoundaryOp(this).getBoundary();},getGeometryType:function getGeometryType(){return"MultiLineString";},copy:function copy(){var lineStrings=new Array(this.geometries.length).fill(null);for(var i=0;i<lineStrings.length;i++){lineStrings[i]=this.geometries[i].copy();}return new MultiLineString(lineStrings,this.factory);},interfaces_:function interfaces_(){return[Lineal];},getClass:function getClass(){return MultiLineString;}});MultiLineString.serialVersionUID=8166665132445433741;function BoundaryOp(){this.geom=null;this.geomFact=null;this.bnRule=null;this.endpointMap=null;if(arguments.length===1){var geom=arguments[0];BoundaryOp.call(this,geom,BoundaryNodeRule.MOD2_BOUNDARY_RULE);}else if(arguments.length===2){var geom=arguments[0],bnRule=arguments[1];this.geom=geom;this.geomFact=geom.getFactory();this.bnRule=bnRule;}}extend$1(BoundaryOp.prototype,{boundaryMultiLineString:function boundaryMultiLineString(mLine){if(this.geom.isEmpty()){return this.getEmptyMultiPoint();}var bdyPts=this.computeBoundaryCoordinates(mLine);if(bdyPts.length===1){return this.geomFact.createPoint(bdyPts[0]);}return this.geomFact.createMultiPointFromCoords(bdyPts);},getBoundary:function getBoundary(){if(this.geom instanceof LineString)return this.boundaryLineString(this.geom);if(this.geom instanceof MultiLineString)return this.boundaryMultiLineString(this.geom);return this.geom.getBoundary();},boundaryLineString:function boundaryLineString(line){if(this.geom.isEmpty()){return this.getEmptyMultiPoint();}if(line.isClosed()){var closedEndpointOnBoundary=this.bnRule.isInBoundary(2);if(closedEndpointOnBoundary){return line.getStartPoint();}else{return this.geomFact.createMultiPoint();}}return this.geomFact.createMultiPoint([line.getStartPoint(),line.getEndPoint()]);},getEmptyMultiPoint:function getEmptyMultiPoint(){return this.geomFact.createMultiPoint();},computeBoundaryCoordinates:function computeBoundaryCoordinates(mLine){var bdyPts=new ArrayList();this.endpointMap=new TreeMap();for(var i=0;i<mLine.getNumGeometries();i++){var line=mLine.getGeometryN(i);if(line.getNumPoints()===0)continue;this.addEndpoint(line.getCoordinateN(0));this.addEndpoint(line.getCoordinateN(line.getNumPoints()-1));}for(var it=this.endpointMap.entrySet().iterator();it.hasNext();){var entry=it.next();var counter=entry.getValue();var valence=counter.count;if(this.bnRule.isInBoundary(valence)){bdyPts.add(entry.getKey());}}return CoordinateArrays.toCoordinateArray(bdyPts);},addEndpoint:function addEndpoint(pt){var counter=this.endpointMap.get(pt);if(counter===null){counter=new Counter();this.endpointMap.put(pt,counter);}counter.count++;},interfaces_:function interfaces_(){return[];},getClass:function getClass(){return BoundaryOp;}});BoundaryOp.getBoundary=function(){if(arguments.length===1){var g=arguments[0];var bop=new BoundaryOp(g);return bop.getBoundary();}else if(arguments.length===2){var g=arguments[0],bnRule=arguments[1];var bop=new BoundaryOp(g,bnRule);return bop.getBoundary();}};function Counter(){this.count=null;}extend$1(Counter.prototype,{interfaces_:function interfaces_(){return[];},getClass:function getClass(){return Counter;}});function PrintStream(){}function StringReader(){}function DecimalFormat(){}function ByteArrayOutputStream(){}function IOException(){}function LineNumberReader(){}function StringUtil(){}extend$1(StringUtil.prototype,{interfaces_:function interfaces_(){return[];},getClass:function getClass(){return StringUtil;}});StringUtil.chars=function(c,n){var ch=new Array(n).fill(null);for(var i=0;i<n;i++){ch[i]=c;}return new String(ch);};StringUtil.getStackTrace=function(){if(arguments.length===1){var t=arguments[0];var os=new ByteArrayOutputStream();var ps=new PrintStream(os);t.printStackTrace(ps);return os.toString();}else if(arguments.length===2){var t=arguments[0],depth=arguments[1];var stackTrace="";var stringReader=new StringReader(StringUtil.getStackTrace(t));var lineNumberReader=new LineNumberReader(stringReader);for(var i=0;i<depth;i++){try{stackTrace+=lineNumberReader.readLine()+StringUtil.NEWLINE;}catch(e){if(e instanceof IOException){Assert.shouldNeverReachHere();}else throw e;}finally{}}return stackTrace;}};StringUtil.split=function(s,separator){var separatorlen=separator.length;var tokenList=new ArrayList();var tmpString=""+s;var pos=tmpString.indexOf(separator);while(pos>=0){var token=tmpString.substring(0,pos);tokenList.add(token);tmpString=tmpString.substring(pos+separatorlen);pos=tmpString.indexOf(separator);}if(tmpString.length>0)tokenList.add(tmpString);var res=new Array(tokenList.size()).fill(null);for(var i=0;i<res.length;i++){res[i]=tokenList.get(i);}return res;};StringUtil.toString=function(){if(arguments.length===1){var d=arguments[0];return StringUtil.SIMPLE_ORDINATE_FORMAT.format(d);}};StringUtil.spaces=function(n){return StringUtil.chars(' ',n);};StringUtil.NEWLINE=System.getProperty("line.separator");StringUtil.SIMPLE_ORDINATE_FORMAT=new DecimalFormat("0.#");function CoordinateSequences(){}extend$1(CoordinateSequences.prototype,{interfaces_:function interfaces_(){return[];},getClass:function getClass(){return CoordinateSequences;}});CoordinateSequences.copyCoord=function(src,srcPos,dest,destPos){var minDim=Math.min(src.getDimension(),dest.getDimension());for(var dim=0;dim<minDim;dim++){dest.setOrdinate(destPos,dim,src.getOrdinate(srcPos,dim));}};CoordinateSequences.isRing=function(seq){var n=seq.size();if(n===0)return true;if(n<=3)return false;return seq.getOrdinate(0,CoordinateSequence.X)===seq.getOrdinate(n-1,CoordinateSequence.X)&&seq.getOrdinate(0,CoordinateSequence.Y)===seq.getOrdinate(n-1,CoordinateSequence.Y);};CoordinateSequences.isEqual=function(cs1,cs2){var cs1Size=cs1.size();var cs2Size=cs2.size();if(cs1Size!==cs2Size)return false;var dim=Math.min(cs1.getDimension(),cs2.getDimension());for(var i=0;i<cs1Size;i++){for(var d=0;d<dim;d++){var v1=cs1.getOrdinate(i,d);var v2=cs2.getOrdinate(i,d);if(cs1.getOrdinate(i,d)===cs2.getOrdinate(i,d))continue;if(Double.isNaN(v1)&&Double.isNaN(v2))continue;return false;}}return true;};CoordinateSequences.extend=function(fact,seq,size){var newseq=fact.create(size,seq.getDimension());var n=seq.size();CoordinateSequences.copy(seq,0,newseq,0,n);if(n>0){for(var i=n;i<size;i++){CoordinateSequences.copy(seq,n-1,newseq,i,1);}}return newseq;};CoordinateSequences.reverse=function(seq){var last=seq.size()-1;var mid=Math.trunc(last/2);for(var i=0;i<=mid;i++){CoordinateSequences.swap(seq,i,last-i);}};CoordinateSequences.swap=function(seq,i,j){if(i===j)return null;for(var dim=0;dim<seq.getDimension();dim++){var tmp=seq.getOrdinate(i,dim);seq.setOrdinate(i,dim,seq.getOrdinate(j,dim));seq.setOrdinate(j,dim,tmp);}};CoordinateSequences.copy=function(src,srcPos,dest,destPos,length){for(var i=0;i<length;i++){CoordinateSequences.copyCoord(src,srcPos+i,dest,destPos+i);}};CoordinateSequences.toString=function(){if(arguments.length===1){var cs=arguments[0];var size=cs.size();if(size===0)return"()";var dim=cs.getDimension();var buf=new StringBuffer();buf.append('(');for(var i=0;i<size;i++){if(i>0)buf.append(" ");for(var d=0;d<dim;d++){if(d>0)buf.append(",");buf.append(StringUtil.toString(cs.getOrdinate(i,d)));}}buf.append(')');return buf.toString();}};CoordinateSequences.ensureValidRing=function(fact,seq){var n=seq.size();if(n===0)return seq;if(n<=3)return CoordinateSequences.createClosedRing(fact,seq,4);var isClosed=seq.getOrdinate(0,CoordinateSequence.X)===seq.getOrdinate(n-1,CoordinateSequence.X)&&seq.getOrdinate(0,CoordinateSequence.Y)===seq.getOrdinate(n-1,CoordinateSequence.Y);if(isClosed)return seq;return CoordinateSequences.createClosedRing(fact,seq,n+1);};CoordinateSequences.createClosedRing=function(fact,seq,size){var newseq=fact.create(size,seq.getDimension());var n=seq.size();CoordinateSequences.copy(seq,0,newseq,0,n);for(var i=n;i<size;i++){CoordinateSequences.copy(seq,0,newseq,i,1);}return newseq;};function LineString(){this.points=null;var points=arguments[0],factory=arguments[1];Geometry.call(this,factory);this.init(points);}inherits$1(LineString,Geometry);extend$1(LineString.prototype,{computeEnvelopeInternal:function computeEnvelopeInternal(){if(this.isEmpty()){return new Envelope();}return this.points.expandEnvelope(new Envelope());},isRing:function isRing(){return this.isClosed()&&this.isSimple();},getSortIndex:function getSortIndex(){return Geometry.SORTINDEX_LINESTRING;},getCoordinates:function getCoordinates(){return this.points.toCoordinateArray();},equalsExact:function equalsExact(){if(arguments.length===2){var other=arguments[0],tolerance=arguments[1];if(!this.isEquivalentClass(other)){return false;}var otherLineString=other;if(this.points.size()!==otherLineString.points.size()){return false;}for(var i=0;i<this.points.size();i++){if(!this.equal(this.points.getCoordinate(i),otherLineString.points.getCoordinate(i),tolerance)){return false;}}return true;}else return Geometry.prototype.equalsExact.apply(this,arguments);},normalize:function normalize(){for(var i=0;i<Math.trunc(this.points.size()/2);i++){var j=this.points.size()-1-i;if(!this.points.getCoordinate(i).equals(this.points.getCoordinate(j))){if(this.points.getCoordinate(i).compareTo(this.points.getCoordinate(j))>0){CoordinateSequences.reverse(this.points);}return null;}}},getCoordinate:function getCoordinate(){if(this.isEmpty())return null;return this.points.getCoordinate(0);},getBoundaryDimension:function getBoundaryDimension(){if(this.isClosed()){return Dimension.FALSE;}return 0;},isClosed:function isClosed(){if(this.isEmpty()){return false;}return this.getCoordinateN(0).equals2D(this.getCoordinateN(this.getNumPoints()-1));},getEndPoint:function getEndPoint(){if(this.isEmpty()){return null;}return this.getPointN(this.getNumPoints()-1);},getDimension:function getDimension(){return 1;},getLength:function getLength(){return CGAlgorithms.computeLength(this.points);},getNumPoints:function getNumPoints(){return this.points.size();},reverse:function reverse(){var seq=this.points.copy();CoordinateSequences.reverse(seq);var revLine=this.getFactory().createLineString(seq);return revLine;},compareToSameClass:function compareToSameClass(){if(arguments.length===1){var o=arguments[0];var line=o;var i=0;var j=0;while(i<this.points.size()&&j<line.points.size()){var comparison=this.points.getCoordinate(i).compareTo(line.points.getCoordinate(j));if(comparison!==0){return comparison;}i++;j++;}if(i<this.points.size()){return 1;}if(j<line.points.size()){return-1;}return 0;}else if(arguments.length===2){var o=arguments[0],comp=arguments[1];var line=o;return comp.compare(this.points,line.points);}},apply:function apply(){if(hasInterface(arguments[0],CoordinateFilter)){var filter=arguments[0];for(var i=0;i<this.points.size();i++){filter.filter(this.points.getCoordinate(i));}}else if(hasInterface(arguments[0],CoordinateSequenceFilter)){var filter=arguments[0];if(this.points.size()===0)return null;for(var i=0;i<this.points.size();i++){filter.filter(this.points,i);if(filter.isDone())break;}if(filter.isGeometryChanged())this.geometryChanged();}else if(hasInterface(arguments[0],GeometryFilter)){var filter=arguments[0];filter.filter(this);}else if(hasInterface(arguments[0],GeometryComponentFilter)){var filter=arguments[0];filter.filter(this);}},getBoundary:function getBoundary(){return new BoundaryOp(this).getBoundary();},isEquivalentClass:function isEquivalentClass(other){return other instanceof LineString;},clone:function clone(){var ls=Geometry.prototype.clone.call(this);ls.points=this.points.clone();return ls;},getCoordinateN:function getCoordinateN(n){return this.points.getCoordinate(n);},getGeometryType:function getGeometryType(){return"LineString";},copy:function copy(){return new LineString(this.points.copy(),this.factory);},getCoordinateSequence:function getCoordinateSequence(){return this.points;},isEmpty:function isEmpty(){return this.points.size()===0;},init:function init(points){if(points===null){points=this.getFactory().getCoordinateSequenceFactory().create([]);}if(points.size()===1){throw new IllegalArgumentException("Invalid number of points in LineString (found "+points.size()+" - must be 0 or >= 2)");}this.points=points;},isCoordinate:function isCoordinate(pt){for(var i=0;i<this.points.size();i++){if(this.points.getCoordinate(i).equals(pt)){return true;}}return false;},getStartPoint:function getStartPoint(){if(this.isEmpty()){return null;}return this.getPointN(0);},getPointN:function getPointN(n){return this.getFactory().createPoint(this.points.getCoordinate(n));},interfaces_:function interfaces_(){return[Lineal];},getClass:function getClass(){return LineString;}});LineString.serialVersionUID=3110669828065365560;function Puntal(){}extend$1(Puntal.prototype,{interfaces_:function interfaces_(){return[];},getClass:function getClass(){return Puntal;}});function Point(){this.coordinates=null;var coordinates=arguments[0],factory=arguments[1];Geometry.call(this,factory);this.init(coordinates);}inherits$1(Point,Geometry);extend$1(Point.prototype,{computeEnvelopeInternal:function computeEnvelopeInternal(){if(this.isEmpty()){return new Envelope();}var env=new Envelope();env.expandToInclude(this.coordinates.getX(0),this.coordinates.getY(0));return env;},getSortIndex:function getSortIndex(){return Geometry.SORTINDEX_POINT;},getCoordinates:function getCoordinates(){return this.isEmpty()?[]:[this.getCoordinate()];},equalsExact:function equalsExact(){if(arguments.length===2){var other=arguments[0],tolerance=arguments[1];if(!this.isEquivalentClass(other)){return false;}if(this.isEmpty()&&other.isEmpty()){return true;}if(this.isEmpty()!==other.isEmpty()){return false;}return this.equal(other.getCoordinate(),this.getCoordinate(),tolerance);}else return Geometry.prototype.equalsExact.apply(this,arguments);},normalize:function normalize(){},getCoordinate:function getCoordinate(){return this.coordinates.size()!==0?this.coordinates.getCoordinate(0):null;},getBoundaryDimension:function getBoundaryDimension(){return Dimension.FALSE;},getDimension:function getDimension(){return 0;},getNumPoints:function getNumPoints(){return this.isEmpty()?0:1;},reverse:function reverse(){return this.copy();},getX:function getX(){if(this.getCoordinate()===null){throw new IllegalStateException("getX called on empty Point");}return this.getCoordinate().x;},compareToSameClass:function compareToSameClass(){if(arguments.length===1){var other=arguments[0];var point=other;return this.getCoordinate().compareTo(point.getCoordinate());}else if(arguments.length===2){var other=arguments[0],comp=arguments[1];var point=other;return comp.compare(this.coordinates,point.coordinates);}},apply:function apply(){if(hasInterface(arguments[0],CoordinateFilter)){var filter=arguments[0];if(this.isEmpty()){return null;}filter.filter(this.getCoordinate());}else if(hasInterface(arguments[0],CoordinateSequenceFilter)){var filter=arguments[0];if(this.isEmpty())return null;filter.filter(this.coordinates,0);if(filter.isGeometryChanged())this.geometryChanged();}else if(hasInterface(arguments[0],GeometryFilter)){var filter=arguments[0];filter.filter(this);}else if(hasInterface(arguments[0],GeometryComponentFilter)){var filter=arguments[0];filter.filter(this);}},getBoundary:function getBoundary(){return this.getFactory().createGeometryCollection(null);},clone:function clone(){var p=Geometry.prototype.clone.call(this);p.coordinates=this.coordinates.clone();return p;},getGeometryType:function getGeometryType(){return"Point";},copy:function copy(){return new Point(this.coordinates.copy(),this.factory);},getCoordinateSequence:function getCoordinateSequence(){return this.coordinates;},getY:function getY(){if(this.getCoordinate()===null){throw new IllegalStateException("getY called on empty Point");}return this.getCoordinate().y;},isEmpty:function isEmpty(){return this.coordinates.size()===0;},init:function init(coordinates){if(coordinates===null){coordinates=this.getFactory().getCoordinateSequenceFactory().create([]);}Assert.isTrue(coordinates.size()<=1);this.coordinates=coordinates;},isSimple:function isSimple(){return true;},interfaces_:function interfaces_(){return[Puntal];},getClass:function getClass(){return Point;}});Point.serialVersionUID=4902022702746614570;function Polygonal(){}extend$1(Polygonal.prototype,{interfaces_:function interfaces_(){return[];},getClass:function getClass(){return Polygonal;}});function Polygon(){this.shell=null;this.holes=null;var shell=arguments[0],holes=arguments[1],factory=arguments[2];Geometry.call(this,factory);if(shell===null){shell=this.getFactory().createLinearRing();}if(holes===null){holes=[];}if(Geometry.hasNullElements(holes)){throw new IllegalArgumentException("holes must not contain null elements");}if(shell.isEmpty()&&Geometry.hasNonEmptyElements(holes)){throw new IllegalArgumentException("shell is empty but holes are not");}this.shell=shell;this.holes=holes;}inherits$1(Polygon,Geometry);extend$1(Polygon.prototype,{computeEnvelopeInternal:function computeEnvelopeInternal(){return this.shell.getEnvelopeInternal();},getSortIndex:function getSortIndex(){return Geometry.SORTINDEX_POLYGON;},getCoordinates:function getCoordinates(){if(this.isEmpty()){return[];}var coordinates=new Array(this.getNumPoints()).fill(null);var k=-1;var shellCoordinates=this.shell.getCoordinates();for(var x=0;x<shellCoordinates.length;x++){k++;coordinates[k]=shellCoordinates[x];}for(var i=0;i<this.holes.length;i++){var childCoordinates=this.holes[i].getCoordinates();for(var j=0;j<childCoordinates.length;j++){k++;coordinates[k]=childCoordinates[j];}}return coordinates;},getArea:function getArea(){var area=0.0;area+=Math.abs(CGAlgorithms.signedArea(this.shell.getCoordinateSequence()));for(var i=0;i<this.holes.length;i++){area-=Math.abs(CGAlgorithms.signedArea(this.holes[i].getCoordinateSequence()));}return area;},isRectangle:function isRectangle(){if(this.getNumInteriorRing()!==0)return false;if(this.shell===null)return false;if(this.shell.getNumPoints()!==5)return false;var seq=this.shell.getCoordinateSequence();var env=this.getEnvelopeInternal();for(var i=0;i<5;i++){var x=seq.getX(i);if(!(x===env.getMinX()||x===env.getMaxX()))return false;var y=seq.getY(i);if(!(y===env.getMinY()||y===env.getMaxY()))return false;}var prevX=seq.getX(0);var prevY=seq.getY(0);for(var i=1;i<=4;i++){var x=seq.getX(i);var y=seq.getY(i);var xChanged=x!==prevX;var yChanged=y!==prevY;if(xChanged===yChanged)return false;prevX=x;prevY=y;}return true;},equalsExact:function equalsExact(){if(arguments.length===2){var other=arguments[0],tolerance=arguments[1];if(!this.isEquivalentClass(other)){return false;}var otherPolygon=other;var thisShell=this.shell;var otherPolygonShell=otherPolygon.shell;if(!thisShell.equalsExact(otherPolygonShell,tolerance)){return false;}if(this.holes.length!==otherPolygon.holes.length){return false;}for(var i=0;i<this.holes.length;i++){if(!this.holes[i].equalsExact(otherPolygon.holes[i],tolerance)){return false;}}return true;}else return Geometry.prototype.equalsExact.apply(this,arguments);},normalize:function normalize(){if(arguments.length===0){this.normalize(this.shell,true);for(var i=0;i<this.holes.length;i++){this.normalize(this.holes[i],false);}Arrays.sort(this.holes);}else if(arguments.length===2){var ring=arguments[0],clockwise=arguments[1];if(ring.isEmpty()){return null;}var uniqueCoordinates=new Array(ring.getCoordinates().length-1).fill(null);System.arraycopy(ring.getCoordinates(),0,uniqueCoordinates,0,uniqueCoordinates.length);var minCoordinate=CoordinateArrays.minCoordinate(ring.getCoordinates());CoordinateArrays.scroll(uniqueCoordinates,minCoordinate);System.arraycopy(uniqueCoordinates,0,ring.getCoordinates(),0,uniqueCoordinates.length);ring.getCoordinates()[uniqueCoordinates.length]=uniqueCoordinates[0];if(CGAlgorithms.isCCW(ring.getCoordinates())===clockwise){CoordinateArrays.reverse(ring.getCoordinates());}}},getCoordinate:function getCoordinate(){return this.shell.getCoordinate();},getNumInteriorRing:function getNumInteriorRing(){return this.holes.length;},getBoundaryDimension:function getBoundaryDimension(){return 1;},getDimension:function getDimension(){return 2;},getLength:function getLength(){var len=0.0;len+=this.shell.getLength();for(var i=0;i<this.holes.length;i++){len+=this.holes[i].getLength();}return len;},getNumPoints:function getNumPoints(){var numPoints=this.shell.getNumPoints();for(var i=0;i<this.holes.length;i++){numPoints+=this.holes[i].getNumPoints();}return numPoints;},reverse:function reverse(){var poly=this.copy();poly.shell=this.shell.copy().reverse();poly.holes=new Array(this.holes.length).fill(null);for(var i=0;i<this.holes.length;i++){poly.holes[i]=this.holes[i].copy().reverse();}return poly;},convexHull:function convexHull(){return this.getExteriorRing().convexHull();},compareToSameClass:function compareToSameClass(){if(arguments.length===1){var o=arguments[0];var thisShell=this.shell;var otherShell=o.shell;return thisShell.compareToSameClass(otherShell);}else if(arguments.length===2){var o=arguments[0],comp=arguments[1];var poly=o;var thisShell=this.shell;var otherShell=poly.shell;var shellComp=thisShell.compareToSameClass(otherShell,comp);if(shellComp!==0)return shellComp;var nHole1=this.getNumInteriorRing();var nHole2=poly.getNumInteriorRing();var i=0;while(i<nHole1&&i<nHole2){var thisHole=this.getInteriorRingN(i);var otherHole=poly.getInteriorRingN(i);var holeComp=thisHole.compareToSameClass(otherHole,comp);if(holeComp!==0)return holeComp;i++;}if(i<nHole1)return 1;if(i<nHole2)return-1;return 0;}},apply:function apply(){if(hasInterface(arguments[0],CoordinateFilter)){var filter=arguments[0];this.shell.apply(filter);for(var i=0;i<this.holes.length;i++){this.holes[i].apply(filter);}}else if(hasInterface(arguments[0],CoordinateSequenceFilter)){var filter=arguments[0];this.shell.apply(filter);if(!filter.isDone()){for(var i=0;i<this.holes.length;i++){this.holes[i].apply(filter);if(filter.isDone())break;}}if(filter.isGeometryChanged())this.geometryChanged();}else if(hasInterface(arguments[0],GeometryFilter)){var filter=arguments[0];filter.filter(this);}else if(hasInterface(arguments[0],GeometryComponentFilter)){var filter=arguments[0];filter.filter(this);this.shell.apply(filter);for(var i=0;i<this.holes.length;i++){this.holes[i].apply(filter);}}},getBoundary:function getBoundary(){if(this.isEmpty()){return this.getFactory().createMultiLineString();}var rings=new Array(this.holes.length+1).fill(null);rings[0]=this.shell;for(var i=0;i<this.holes.length;i++){rings[i+1]=this.holes[i];}if(rings.length<=1)return this.getFactory().createLinearRing(rings[0].getCoordinateSequence());return this.getFactory().createMultiLineString(rings);},clone:function clone(){var poly=Geometry.prototype.clone.call(this);poly.shell=this.shell.clone();poly.holes=new Array(this.holes.length).fill(null);for(var i=0;i<this.holes.length;i++){poly.holes[i]=this.holes[i].clone();}return poly;},getGeometryType:function getGeometryType(){return"Polygon";},copy:function copy(){var shell=this.shell.copy();var holes=new Array(this.holes.length).fill(null);for(var i=0;i<holes.length;i++){holes[i]=this.holes[i].copy();}return new Polygon(shell,holes,this.factory);},getExteriorRing:function getExteriorRing(){return this.shell;},isEmpty:function isEmpty(){return this.shell.isEmpty();},getInteriorRingN:function getInteriorRingN(n){return this.holes[n];},interfaces_:function interfaces_(){return[Polygonal];},getClass:function getClass(){return Polygon;}});Polygon.serialVersionUID=-3494792200821764533;function MultiPoint(){var points=arguments[0],factory=arguments[1];GeometryCollection.call(this,points,factory);}inherits$1(MultiPoint,GeometryCollection);extend$1(MultiPoint.prototype,{getSortIndex:function getSortIndex(){return Geometry.SORTINDEX_MULTIPOINT;},isValid:function isValid(){return true;},equalsExact:function equalsExact(){if(arguments.length===2){var other=arguments[0],tolerance=arguments[1];if(!this.isEquivalentClass(other)){return false;}return GeometryCollection.prototype.equalsExact.call(this,other,tolerance);}else return GeometryCollection.prototype.equalsExact.apply(this,arguments);},getCoordinate:function getCoordinate(){if(arguments.length===1){var n=arguments[0];return this.geometries[n].getCoordinate();}else return GeometryCollection.prototype.getCoordinate.apply(this,arguments);},getBoundaryDimension:function getBoundaryDimension(){return Dimension.FALSE;},getDimension:function getDimension(){return 0;},getBoundary:function getBoundary(){return this.getFactory().createGeometryCollection(null);},getGeometryType:function getGeometryType(){return"MultiPoint";},copy:function copy(){var points=new Array(this.geometries.length).fill(null);for(var i=0;i<points.length;i++){points[i]=this.geometries[i].copy();}return new MultiPoint(points,this.factory);},interfaces_:function interfaces_(){return[Puntal];},getClass:function getClass(){return MultiPoint;}});MultiPoint.serialVersionUID=-8048474874175355449;function LinearRing(){if(arguments[0]instanceof Coordinate&&arguments[1]instanceof GeometryFactory){var points=arguments[0],factory=arguments[1];LinearRing.call(this,factory.getCoordinateSequenceFactory().create(points),factory);}else if(hasInterface(arguments[0],CoordinateSequence)&&arguments[1]instanceof GeometryFactory){var points=arguments[0],factory=arguments[1];LineString.call(this,points,factory);this.validateConstruction();}}inherits$1(LinearRing,LineString);extend$1(LinearRing.prototype,{getSortIndex:function getSortIndex(){return Geometry.SORTINDEX_LINEARRING;},getBoundaryDimension:function getBoundaryDimension(){return Dimension.FALSE;},isClosed:function isClosed(){if(this.isEmpty()){return true;}return LineString.prototype.isClosed.call(this);},reverse:function reverse(){var seq=this.points.copy();CoordinateSequences.reverse(seq);var rev=this.getFactory().createLinearRing(seq);return rev;},validateConstruction:function validateConstruction(){if(!this.isEmpty()&&!LineString.prototype.isClosed.call(this)){throw new IllegalArgumentException("Points of LinearRing do not form a closed linestring");}if(this.getCoordinateSequence().size()>=1&&this.getCoordinateSequence().size()<LinearRing.MINIMUM_VALID_SIZE){throw new IllegalArgumentException("Invalid number of points in LinearRing (found "+this.getCoordinateSequence().size()+" - must be 0 or >= 4)");}},getGeometryType:function getGeometryType(){return"LinearRing";},copy:function copy(){return new LinearRing(this.points.copy(),this.factory);},interfaces_:function interfaces_(){return[];},getClass:function getClass(){return LinearRing;}});LinearRing.MINIMUM_VALID_SIZE=4;LinearRing.serialVersionUID=-4261142084085851829;function MultiPolygon(){var polygons=arguments[0],factory=arguments[1];GeometryCollection.call(this,polygons,factory);}inherits$1(MultiPolygon,GeometryCollection);extend$1(MultiPolygon.prototype,{getSortIndex:function getSortIndex(){return Geometry.SORTINDEX_MULTIPOLYGON;},equalsExact:function equalsExact(){if(arguments.length===2){var other=arguments[0],tolerance=arguments[1];if(!this.isEquivalentClass(other)){return false;}return GeometryCollection.prototype.equalsExact.call(this,other,tolerance);}else return GeometryCollection.prototype.equalsExact.apply(this,arguments);},getBoundaryDimension:function getBoundaryDimension(){return 1;},getDimension:function getDimension(){return 2;},reverse:function reverse(){var n=this.geometries.length;var revGeoms=new Array(n).fill(null);for(var i=0;i<this.geometries.length;i++){revGeoms[i]=this.geometries[i].reverse();}return this.getFactory().createMultiPolygon(revGeoms);},getBoundary:function getBoundary(){if(this.isEmpty()){return this.getFactory().createMultiLineString();}var allRings=new ArrayList();for(var i=0;i<this.geometries.length;i++){var polygon=this.geometries[i];var rings=polygon.getBoundary();for(var j=0;j<rings.getNumGeometries();j++){allRings.add(rings.getGeometryN(j));}}var allRingsArray=new Array(allRings.size()).fill(null);return this.getFactory().createMultiLineString(allRings.toArray(allRingsArray));},getGeometryType:function getGeometryType(){return"MultiPolygon";},copy:function copy(){var polygons=new Array(this.geometries.length).fill(null);for(var i=0;i<polygons.length;i++){polygons[i]=this.geometries[i].copy();}return new MultiPolygon(polygons,this.factory);},interfaces_:function interfaces_(){return[Polygonal];},getClass:function getClass(){return MultiPolygon;}});MultiPolygon.serialVersionUID=-551033529766975875;function GeometryEditor(){this.factory=null;this.isUserDataCopied=false;if(arguments.length===0){}else if(arguments.length===1){var factory=arguments[0];this.factory=factory;}}extend$1(GeometryEditor.prototype,{setCopyUserData:function setCopyUserData(isUserDataCopied){this.isUserDataCopied=isUserDataCopied;},edit:function edit(geometry,operation){if(geometry===null)return null;var result=this.editInternal(geometry,operation);if(this.isUserDataCopied){result.setUserData(geometry.getUserData());}return result;},editInternal:function editInternal(geometry,operation){if(this.factory===null)this.factory=geometry.getFactory();if(geometry instanceof GeometryCollection){return this.editGeometryCollection(geometry,operation);}if(geometry instanceof Polygon){return this.editPolygon(geometry,operation);}if(geometry instanceof Point){return operation.edit(geometry,this.factory);}if(geometry instanceof LineString){return operation.edit(geometry,this.factory);}Assert.shouldNeverReachHere("Unsupported Geometry class: "+geometry.getClass().getName());return null;},editGeometryCollection:function editGeometryCollection(collection,operation){var collectionForType=operation.edit(collection,this.factory);var geometries=new ArrayList();for(var i=0;i<collectionForType.getNumGeometries();i++){var geometry=this.edit(collectionForType.getGeometryN(i),operation);if(geometry===null||geometry.isEmpty()){continue;}geometries.add(geometry);}if(collectionForType.getClass()===MultiPoint){return this.factory.createMultiPoint(geometries.toArray([]));}if(collectionForType.getClass()===MultiLineString){return this.factory.createMultiLineString(geometries.toArray([]));}if(collectionForType.getClass()===MultiPolygon){return this.factory.createMultiPolygon(geometries.toArray([]));}return this.factory.createGeometryCollection(geometries.toArray([]));},editPolygon:function editPolygon(polygon,operation){var newPolygon=operation.edit(polygon,this.factory);if(newPolygon===null)newPolygon=this.factory.createPolygon(null);if(newPolygon.isEmpty()){return newPolygon;}var shell=this.edit(newPolygon.getExteriorRing(),operation);if(shell===null||shell.isEmpty()){return this.factory.createPolygon();}var holes=new ArrayList();for(var i=0;i<newPolygon.getNumInteriorRing();i++){var hole=this.edit(newPolygon.getInteriorRingN(i),operation);if(hole===null||hole.isEmpty()){continue;}holes.add(hole);}return this.factory.createPolygon(shell,holes.toArray([]));},interfaces_:function interfaces_(){return[];},getClass:function getClass(){return GeometryEditor;}});function GeometryEditorOperation(){}GeometryEditor.GeometryEditorOperation=GeometryEditorOperation;function NoOpGeometryOperation(){}extend$1(NoOpGeometryOperation.prototype,{edit:function edit(geometry,factory){return geometry;},interfaces_:function interfaces_(){return[GeometryEditorOperation];},getClass:function getClass(){return NoOpGeometryOperation;}});function CoordinateOperation(){}extend$1(CoordinateOperation.prototype,{edit:function edit(geometry,factory){var coords=this.editCoordinates(geometry.getCoordinates(),geometry);if(coords===null)return geometry;if(geometry instanceof LinearRing){return factory.createLinearRing(coords);}if(geometry instanceof LineString){return factory.createLineString(coords);}if(geometry instanceof Point){if(coords.length>0){return factory.createPoint(coords[0]);}else{return factory.createPoint();}}return geometry;},interfaces_:function interfaces_(){return[GeometryEditorOperation];},getClass:function getClass(){return CoordinateOperation;}});function CoordinateSequenceOperation(){}extend$1(CoordinateSequenceOperation.prototype,{edit:function edit(geometry,factory){if(geometry instanceof LinearRing){return factory.createLinearRing(this.edit(geometry.getCoordinateSequence(),geometry));}if(geometry instanceof LineString){return factory.createLineString(this.edit(geometry.getCoordinateSequence(),geometry));}if(geometry instanceof Point){return factory.createPoint(this.edit(geometry.getCoordinateSequence(),geometry));}return geometry;},interfaces_:function interfaces_(){return[GeometryEditorOperation];},getClass:function getClass(){return CoordinateSequenceOperation;}});GeometryEditor.NoOpGeometryOperation=NoOpGeometryOperation;GeometryEditor.CoordinateOperation=CoordinateOperation;GeometryEditor.CoordinateSequenceOperation=CoordinateSequenceOperation;function CoordinateArraySequence(){this.dimension=3;this.coordinates=null;if(arguments.length===1){if(arguments[0]instanceof Array){var coordinates=arguments[0];CoordinateArraySequence.call(this,coordinates,3);}else if(Number.isInteger(arguments[0])){var size=arguments[0];this.coordinates=new Array(size).fill(null);for(var i=0;i<size;i++){this.coordinates[i]=new Coordinate();}}else if(hasInterface(arguments[0],CoordinateSequence)){var coordSeq=arguments[0];if(coordSeq===null){this.coordinates=new Array(0).fill(null);return null;}this.dimension=coordSeq.getDimension();this.coordinates=new Array(coordSeq.size()).fill(null);for(var i=0;i<this.coordinates.length;i++){this.coordinates[i]=coordSeq.getCoordinateCopy(i);}}}else if(arguments.length===2){if(arguments[0]instanceof Array&&Number.isInteger(arguments[1])){var coordinates=arguments[0],dimension=arguments[1];this.coordinates=coordinates;this.dimension=dimension;if(coordinates===null)this.coordinates=new Array(0).fill(null);}else if(Number.isInteger(arguments[0])&&Number.isInteger(arguments[1])){var size=arguments[0],dimension=arguments[1];this.coordinates=new Array(size).fill(null);this.dimension=dimension;for(var i=0;i<size;i++){this.coordinates[i]=new Coordinate();}}}}extend$1(CoordinateArraySequence.prototype,{setOrdinate:function setOrdinate(index,ordinateIndex,value){switch(ordinateIndex){case CoordinateSequence.X:this.coordinates[index].x=value;break;case CoordinateSequence.Y:this.coordinates[index].y=value;break;case CoordinateSequence.Z:this.coordinates[index].z=value;break;default:throw new IllegalArgumentException("invalid ordinateIndex");}},size:function size(){return this.coordinates.length;},getOrdinate:function getOrdinate(index,ordinateIndex){switch(ordinateIndex){case CoordinateSequence.X:return this.coordinates[index].x;case CoordinateSequence.Y:return this.coordinates[index].y;case CoordinateSequence.Z:return this.coordinates[index].z;}return Double.NaN;},getCoordinate:function getCoordinate(){if(arguments.length===1){var i=arguments[0];return this.coordinates[i];}else if(arguments.length===2){var index=arguments[0],coord=arguments[1];coord.x=this.coordinates[index].x;coord.y=this.coordinates[index].y;coord.z=this.coordinates[index].z;}},getCoordinateCopy:function getCoordinateCopy(i){return new Coordinate(this.coordinates[i]);},getDimension:function getDimension(){return this.dimension;},getX:function getX(index){return this.coordinates[index].x;},clone:function clone(){var cloneCoordinates=new Array(this.size()).fill(null);for(var i=0;i<this.coordinates.length;i++){cloneCoordinates[i]=this.coordinates[i].clone();}return new CoordinateArraySequence(cloneCoordinates,this.dimension);},expandEnvelope:function expandEnvelope(env){for(var i=0;i<this.coordinates.length;i++){env.expandToInclude(this.coordinates[i]);}return env;},copy:function copy(){var cloneCoordinates=new Array(this.size()).fill(null);for(var i=0;i<this.coordinates.length;i++){cloneCoordinates[i]=this.coordinates[i].copy();}return new CoordinateArraySequence(cloneCoordinates,this.dimension);},toString:function toString(){if(this.coordinates.length>0){var strBuf=new StringBuffer(17*this.coordinates.length);strBuf.append('(');strBuf.append(this.coordinates[0]);for(var i=1;i<this.coordinates.length;i++){strBuf.append(", ");strBuf.append(this.coordinates[i]);}strBuf.append(')');return strBuf.toString();}else{return"()";}},getY:function getY(index){return this.coordinates[index].y;},toCoordinateArray:function toCoordinateArray(){return this.coordinates;},interfaces_:function interfaces_(){return[CoordinateSequence,Serializable];},getClass:function getClass(){return CoordinateArraySequence;}});CoordinateArraySequence.serialVersionUID=-915438501601840650;function CoordinateArraySequenceFactory(){}extend$1(CoordinateArraySequenceFactory.prototype,{readResolve:function readResolve(){return CoordinateArraySequenceFactory.instance();},create:function create(){if(arguments.length===1){if(arguments[0]instanceof Array){var coordinates=arguments[0];return new CoordinateArraySequence(coordinates);}else if(hasInterface(arguments[0],CoordinateSequence)){var coordSeq=arguments[0];return new CoordinateArraySequence(coordSeq);}}else if(arguments.length===2){var size=arguments[0],dimension=arguments[1];if(dimension>3)dimension=3;if(dimension<2)return new CoordinateArraySequence(size);return new CoordinateArraySequence(size,dimension);}},interfaces_:function interfaces_(){return[CoordinateSequenceFactory,Serializable];},getClass:function getClass(){return CoordinateArraySequenceFactory;}});CoordinateArraySequenceFactory.instance=function(){return CoordinateArraySequenceFactory.instanceObject;};CoordinateArraySequenceFactory.serialVersionUID=-4099577099607551657;CoordinateArraySequenceFactory.instanceObject=new CoordinateArraySequenceFactory();// shared pointer
var i;// shortcuts
var defineProperty$1=Object.defineProperty;function is(a,b){return a===b||a!==a&&b!==b;}// eslint-disable-line
var MapPolyfill=createCollection({// WeakMap#delete(key:void*):boolean
'delete':sharedDelete,// :was Map#get(key:void*[, d3fault:void*]):void*
// Map#has(key:void*):boolean
has:mapHas,// Map#get(key:void*):boolean
get:sharedGet,// Map#set(key:void*, value:void*):void
set:sharedSet,// Map#keys(void):Iterator
keys:sharedKeys,// Map#values(void):Iterator
values:sharedValues,// Map#entries(void):Iterator
entries:mapEntries,// Map#forEach(callback:Function, context:void*):void ==> callback.call(context, key, value, mapObject) === not in specs`
forEach:sharedForEach,// Map#clear():
clear:sharedClear});/**
 * ES6 collection constructor
 * @return {Function} a collection class
 */function createCollection(proto,objectOnly){function Collection(a){if(!this||this.constructor!==Collection)return new Collection(a);this._keys=[];this._values=[];this._itp=[];// iteration pointers
this.objectOnly=objectOnly;// parse initial iterable argument passed
if(a)init.call(this,a);}// define size for non object-only collections
if(!objectOnly){defineProperty$1(proto,'size',{get:sharedSize});}// set prototype
proto.constructor=Collection;Collection.prototype=proto;return Collection;}/** parse initial iterable argument passed */function init(a){// init Set argument, like `[1,2,3,{}]`
if(this.add)a.forEach(this.add,this);// init Map argument like `[[1,2], [{}, 4]]`
else a.forEach(function(a){this.set(a[0],a[1]);},this);}/** delete */function sharedDelete(key){if(this.has(key)){this._keys.splice(i,1);this._values.splice(i,1);// update iteration pointers
this._itp.forEach(function(p){if(i<p[0])p[0]--;});}// Aurora here does it while Canary doesn't
return i>-1;}function sharedGet(key){return this.has(key)?this._values[i]:undefined;}function has(list,key){if(this.objectOnly&&key!==Object(key))throw new TypeError('Invalid value used as weak collection key');// NaN or 0 passed
if(key!==key||key===0)for(i=list.length;i--&&!is(list[i],key);){}// eslint-disable-line
else i=list.indexOf(key);return i>-1;}function mapHas(value){return has.call(this,this._keys,value);}/** @chainable */function sharedSet(key,value){this.has(key)?this._values[i]=value:this._values[this._keys.push(key)-1]=value;return this;}function sharedClear(){(this._keys||0).length=this._values.length=0;}/** keys, values, and iterate related methods */function sharedKeys(){return sharedIterator(this._itp,this._keys);}function sharedValues(){return sharedIterator(this._itp,this._values);}function mapEntries(){return sharedIterator(this._itp,this._keys,this._values);}function sharedIterator(itp,array,array2){var p=[0];var done=false;itp.push(p);return{next:function next(){var v;var k=p[0];if(!done&&k<array.length){v=array2?[array[k],array2[k]]:array[k];p[0]++;}else{done=true;itp.splice(itp.indexOf(p),1);}return{done:done,value:v};}};}function sharedSize(){return this._values.length;}function sharedForEach(callback,context){var it=this.entries();for(;;){var r=it.next();if(r.done)break;callback.call(context,r.value[1],r.value[0],this);}}var MapImpl=typeof Map==='undefined'||!Map.prototype.values?MapPolyfill:Map;/**
 * @see http://download.oracle.com/javase/6/docs/api/java/util/HashMap.html
 *
 * @extends {javascript.util.Map}
 * @constructor
 * @private
 */function HashMap(){/**
   * @type {Object}
   * @private
  */this.map_=new MapImpl();}HashMap.prototype=new Map$1$1();/**
 * @override
 */HashMap.prototype.get=function(key){return this.map_.get(key)||null;};/**
 * @override
 */HashMap.prototype.put=function(key,value){this.map_.set(key,value);return value;};/**
 * @override
 */HashMap.prototype.values=function(){var arrayList=new ArrayList();var it=this.map_.values();var o=it.next();while(!o.done){arrayList.add(o.value);o=it.next();}return arrayList;};/**
 * @override
 */HashMap.prototype.entrySet=function(){var hashSet=new HashSet();this.map_.entries().forEach(function(entry){return hashSet.add(entry);});return hashSet;};/**
 * @override
 */HashMap.prototype.size=function(){return this.map_.size();};function PrecisionModel(){this.modelType=null;this.scale=null;if(arguments.length===0){this.modelType=PrecisionModel.FLOATING;}else if(arguments.length===1){if(arguments[0]instanceof Type){var modelType=arguments[0];this.modelType=modelType;if(modelType===PrecisionModel.FIXED){this.setScale(1.0);}}else if(typeof arguments[0]==="number"){var scale=arguments[0];this.modelType=PrecisionModel.FIXED;this.setScale(scale);}else if(arguments[0]instanceof PrecisionModel){var pm=arguments[0];this.modelType=pm.modelType;this.scale=pm.scale;}}}extend$1(PrecisionModel.prototype,{equals:function equals(other){if(!(other instanceof PrecisionModel)){return false;}var otherPrecisionModel=other;return this.modelType===otherPrecisionModel.modelType&&this.scale===otherPrecisionModel.scale;},compareTo:function compareTo(o){var other=o;var sigDigits=this.getMaximumSignificantDigits();var otherSigDigits=other.getMaximumSignificantDigits();return new Integer(sigDigits).compareTo(new Integer(otherSigDigits));},getScale:function getScale(){return this.scale;},isFloating:function isFloating(){return this.modelType===PrecisionModel.FLOATING||this.modelType===PrecisionModel.FLOATING_SINGLE;},getType:function getType(){return this.modelType;},toString:function toString(){var description="UNKNOWN";if(this.modelType===PrecisionModel.FLOATING){description="Floating";}else if(this.modelType===PrecisionModel.FLOATING_SINGLE){description="Floating-Single";}else if(this.modelType===PrecisionModel.FIXED){description="Fixed (Scale="+this.getScale()+")";}return description;},makePrecise:function makePrecise(){if(typeof arguments[0]==="number"){var val=arguments[0];if(Double.isNaN(val))return val;if(this.modelType===PrecisionModel.FLOATING_SINGLE){var floatSingleVal=val;return floatSingleVal;}if(this.modelType===PrecisionModel.FIXED){return Math.round(val*this.scale)/this.scale;}return val;}else if(arguments[0]instanceof Coordinate){var coord=arguments[0];if(this.modelType===PrecisionModel.FLOATING)return null;coord.x=this.makePrecise(coord.x);coord.y=this.makePrecise(coord.y);}},getMaximumSignificantDigits:function getMaximumSignificantDigits(){var maxSigDigits=16;if(this.modelType===PrecisionModel.FLOATING){maxSigDigits=16;}else if(this.modelType===PrecisionModel.FLOATING_SINGLE){maxSigDigits=6;}else if(this.modelType===PrecisionModel.FIXED){maxSigDigits=1+Math.trunc(Math.ceil(Math.log(this.getScale())/Math.log(10)));}return maxSigDigits;},setScale:function setScale(scale){this.scale=Math.abs(scale);},interfaces_:function interfaces_(){return[Serializable,Comparable];},getClass:function getClass(){return PrecisionModel;}});PrecisionModel.mostPrecise=function(pm1,pm2){if(pm1.compareTo(pm2)>=0)return pm1;return pm2;};function Type(){this.name=null;var name=arguments[0];this.name=name;Type.nameToTypeMap.put(name,this);}extend$1(Type.prototype,{readResolve:function readResolve(){return Type.nameToTypeMap.get(this.name);},toString:function toString(){return this.name;},interfaces_:function interfaces_(){return[Serializable];},getClass:function getClass(){return Type;}});Type.serialVersionUID=-5528602631731589822;Type.nameToTypeMap=new HashMap();PrecisionModel.Type=Type;PrecisionModel.serialVersionUID=7777263578777803835;PrecisionModel.FIXED=new Type("FIXED");PrecisionModel.FLOATING=new Type("FLOATING");PrecisionModel.FLOATING_SINGLE=new Type("FLOATING SINGLE");PrecisionModel.maximumPreciseValue=9007199254740992.0;function GeometryFactory(){this.precisionModel=null;this.coordinateSequenceFactory=null;this.SRID=null;if(arguments.length===0){GeometryFactory.call(this,new PrecisionModel(),0);}else if(arguments.length===1){if(hasInterface(arguments[0],CoordinateSequenceFactory)){var coordinateSequenceFactory=arguments[0];GeometryFactory.call(this,new PrecisionModel(),0,coordinateSequenceFactory);}else if(arguments[0]instanceof PrecisionModel){var precisionModel=arguments[0];GeometryFactory.call(this,precisionModel,0,GeometryFactory.getDefaultCoordinateSequenceFactory());}}else if(arguments.length===2){var precisionModel=arguments[0],SRID=arguments[1];GeometryFactory.call(this,precisionModel,SRID,GeometryFactory.getDefaultCoordinateSequenceFactory());}else if(arguments.length===3){var precisionModel=arguments[0],SRID=arguments[1],coordinateSequenceFactory=arguments[2];this.precisionModel=precisionModel;this.coordinateSequenceFactory=coordinateSequenceFactory;this.SRID=SRID;}}extend$1(GeometryFactory.prototype,{toGeometry:function toGeometry(envelope){if(envelope.isNull()){return this.createPoint(null);}if(envelope.getMinX()===envelope.getMaxX()&&envelope.getMinY()===envelope.getMaxY()){return this.createPoint(new Coordinate(envelope.getMinX(),envelope.getMinY()));}if(envelope.getMinX()===envelope.getMaxX()||envelope.getMinY()===envelope.getMaxY()){return this.createLineString([new Coordinate(envelope.getMinX(),envelope.getMinY()),new Coordinate(envelope.getMaxX(),envelope.getMaxY())]);}return this.createPolygon(this.createLinearRing([new Coordinate(envelope.getMinX(),envelope.getMinY()),new Coordinate(envelope.getMinX(),envelope.getMaxY()),new Coordinate(envelope.getMaxX(),envelope.getMaxY()),new Coordinate(envelope.getMaxX(),envelope.getMinY()),new Coordinate(envelope.getMinX(),envelope.getMinY())]),null);},createLineString:function createLineString(){if(arguments.length===0){return this.createLineString(this.getCoordinateSequenceFactory().create([]));}else if(arguments.length===1){if(arguments[0]instanceof Array){var coordinates=arguments[0];return this.createLineString(coordinates!==null?this.getCoordinateSequenceFactory().create(coordinates):null);}else if(hasInterface(arguments[0],CoordinateSequence)){var coordinates=arguments[0];return new LineString(coordinates,this);}}},createMultiLineString:function createMultiLineString(){if(arguments.length===0){return new MultiLineString(null,this);}else if(arguments.length===1){var lineStrings=arguments[0];return new MultiLineString(lineStrings,this);}},buildGeometry:function buildGeometry(geomList){var geomClass=null;var isHeterogeneous=false;var hasGeometryCollection=false;for(var i=geomList.iterator();i.hasNext();){var geom=i.next();var partClass=geom.getClass();if(geomClass===null){geomClass=partClass;}if(partClass!==geomClass){isHeterogeneous=true;}if(geom.isGeometryCollectionOrDerived())hasGeometryCollection=true;}if(geomClass===null){return this.createGeometryCollection();}if(isHeterogeneous||hasGeometryCollection){return this.createGeometryCollection(GeometryFactory.toGeometryArray(geomList));}var geom0=geomList.iterator().next();var isCollection=geomList.size()>1;if(isCollection){if(geom0 instanceof Polygon){return this.createMultiPolygon(GeometryFactory.toPolygonArray(geomList));}else if(geom0 instanceof LineString){return this.createMultiLineString(GeometryFactory.toLineStringArray(geomList));}else if(geom0 instanceof Point){return this.createMultiPoint(GeometryFactory.toPointArray(geomList));}Assert.shouldNeverReachHere("Unhandled class: "+geom0.getClass().getName());}return geom0;},createMultiPointFromCoords:function createMultiPointFromCoords(coordinates){return this.createMultiPoint(coordinates!==null?this.getCoordinateSequenceFactory().create(coordinates):null);},createPoint:function createPoint(){if(arguments.length===0){return this.createPoint(this.getCoordinateSequenceFactory().create([]));}else if(arguments.length===1){if(arguments[0]instanceof Coordinate){var coordinate=arguments[0];return this.createPoint(coordinate!==null?this.getCoordinateSequenceFactory().create([coordinate]):null);}else if(hasInterface(arguments[0],CoordinateSequence)){var coordinates=arguments[0];return new Point(coordinates,this);}}},getCoordinateSequenceFactory:function getCoordinateSequenceFactory(){return this.coordinateSequenceFactory;},createPolygon:function createPolygon(){if(arguments.length===0){return new Polygon(null,null,this);}else if(arguments.length===1){if(hasInterface(arguments[0],CoordinateSequence)){var coordinates=arguments[0];return this.createPolygon(this.createLinearRing(coordinates));}else if(arguments[0]instanceof Array){var coordinates=arguments[0];return this.createPolygon(this.createLinearRing(coordinates));}else if(arguments[0]instanceof LinearRing){var shell=arguments[0];return this.createPolygon(shell,null);}}else if(arguments.length===2){var shell=arguments[0],holes=arguments[1];return new Polygon(shell,holes,this);}},getSRID:function getSRID(){return this.SRID;},createGeometryCollection:function createGeometryCollection(){if(arguments.length===0){return new GeometryCollection(null,this);}else if(arguments.length===1){var geometries=arguments[0];return new GeometryCollection(geometries,this);}},createGeometry:function createGeometry(g){var editor=new GeometryEditor(this);return editor.edit(g,{edit:function edit(){if(arguments.length===2){var coordSeq=arguments[0];return this.coordinateSequenceFactory.create(coordSeq);}}});},getPrecisionModel:function getPrecisionModel(){return this.precisionModel;},createLinearRing:function createLinearRing(){if(arguments.length===0){return this.createLinearRing(this.getCoordinateSequenceFactory().create([]));}else if(arguments.length===1){if(arguments[0]instanceof Array){var coordinates=arguments[0];return this.createLinearRing(coordinates!==null?this.getCoordinateSequenceFactory().create(coordinates):null);}else if(hasInterface(arguments[0],CoordinateSequence)){var coordinates=arguments[0];return new LinearRing(coordinates,this);}}},createMultiPolygon:function createMultiPolygon(){if(arguments.length===0){return new MultiPolygon(null,this);}else if(arguments.length===1){var polygons=arguments[0];return new MultiPolygon(polygons,this);}},createMultiPoint:function createMultiPoint(){if(arguments.length===0){return new MultiPoint(null,this);}else if(arguments.length===1){if(arguments[0]instanceof Array){var point=arguments[0];return new MultiPoint(point,this);}else if(arguments[0]instanceof Array){var coordinates=arguments[0];return this.createMultiPoint(coordinates!==null?this.getCoordinateSequenceFactory().create(coordinates):null);}else if(hasInterface(arguments[0],CoordinateSequence)){var coordinates=arguments[0];if(coordinates===null){return this.createMultiPoint(new Array(0).fill(null));}var points=new Array(coordinates.size()).fill(null);for(var i=0;i<coordinates.size();i++){var ptSeq=this.getCoordinateSequenceFactory().create(1,coordinates.getDimension());CoordinateSequences.copy(coordinates,i,ptSeq,0,1);points[i]=this.createPoint(ptSeq);}return this.createMultiPoint(points);}}},interfaces_:function interfaces_(){return[Serializable];},getClass:function getClass(){return GeometryFactory;}});GeometryFactory.toMultiPolygonArray=function(multiPolygons){var multiPolygonArray=new Array(multiPolygons.size()).fill(null);return multiPolygons.toArray(multiPolygonArray);};GeometryFactory.toGeometryArray=function(geometries){if(geometries===null)return null;var geometryArray=new Array(geometries.size()).fill(null);return geometries.toArray(geometryArray);};GeometryFactory.getDefaultCoordinateSequenceFactory=function(){return CoordinateArraySequenceFactory.instance();};GeometryFactory.toMultiLineStringArray=function(multiLineStrings){var multiLineStringArray=new Array(multiLineStrings.size()).fill(null);return multiLineStrings.toArray(multiLineStringArray);};GeometryFactory.toLineStringArray=function(lineStrings){var lineStringArray=new Array(lineStrings.size()).fill(null);return lineStrings.toArray(lineStringArray);};GeometryFactory.toMultiPointArray=function(multiPoints){var multiPointArray=new Array(multiPoints.size()).fill(null);return multiPoints.toArray(multiPointArray);};GeometryFactory.toLinearRingArray=function(linearRings){var linearRingArray=new Array(linearRings.size()).fill(null);return linearRings.toArray(linearRingArray);};GeometryFactory.toPointArray=function(points){var pointArray=new Array(points.size()).fill(null);return points.toArray(pointArray);};GeometryFactory.toPolygonArray=function(polygons){var polygonArray=new Array(polygons.size()).fill(null);return polygons.toArray(polygonArray);};GeometryFactory.createPointFromInternalCoord=function(coord,exemplar){exemplar.getPrecisionModel().makePrecise(coord);return exemplar.getFactory().createPoint(coord);};GeometryFactory.serialVersionUID=-6820524753094095635;var geometryTypes=['Point','MultiPoint','LineString','MultiLineString','Polygon','MultiPolygon'];/**
 * Class for reading and writing Well-Known Text.Create a new parser for GeoJSON
 * NOTE: Adapted from OpenLayers 2.11 implementation.
 *//**
 * Create a new parser for GeoJSON
 *
 * @param {GeometryFactory} geometryFactory
 * @return An instance of GeoJsonParser.
 * @constructor
 * @private
 */function GeoJSONParser(geometryFactory){this.geometryFactory=geometryFactory||new GeometryFactory();}extend$1(GeoJSONParser.prototype,{/**
   * Deserialize a GeoJSON object and return the Geometry or Feature(Collection) with JSTS Geometries
   *
   * @param {}
   *          A GeoJSON object.
   * @return {} A Geometry instance or object representing a Feature(Collection) with Geometry instances.
   * @private
   */read:function read(json){var obj;if(typeof json==='string'){obj=JSON.parse(json);}else{obj=json;}var type=obj.type;if(!parse$1[type]){throw new Error('Unknown GeoJSON type: '+obj.type);}if(geometryTypes.indexOf(type)!==-1){return parse$1[type].apply(this,[obj.coordinates]);}else if(type==='GeometryCollection'){return parse$1[type].apply(this,[obj.geometries]);}// feature or feature collection
return parse$1[type].apply(this,[obj]);},/**
   * Serialize a Geometry object into GeoJSON
   *
   * @param {Geometry}
   *          geometry A Geometry or array of Geometries.
   * @return {Object} A GeoJSON object represting the input Geometry/Geometries.
   * @private
   */write:function write(geometry){var type=geometry.getGeometryType();if(!extract$1[type]){throw new Error('Geometry is not supported');}return extract$1[type].apply(this,[geometry]);}});var parse$1={/**
   * Parse a GeoJSON Feature object
   *
   * @param {Object}
   *          obj Object to parse.
   *
   * @return {Object} Feature with geometry/bbox converted to JSTS Geometries.
   */Feature:function Feature(obj){var feature={};// copy features
for(var key in obj){feature[key]=obj[key];}// parse geometry
if(obj.geometry){var type=obj.geometry.type;if(!parse$1[type]){throw new Error('Unknown GeoJSON type: '+obj.type);}feature.geometry=this.read(obj.geometry);}// bbox
if(obj.bbox){feature.bbox=parse$1.bbox.apply(this,[obj.bbox]);}return feature;},/**
   * Parse a GeoJSON FeatureCollection object
   *
   * @param {Object}
   *          obj Object to parse.
   *
   * @return {Object} FeatureCollection with geometry/bbox converted to JSTS Geometries.
   */FeatureCollection:function FeatureCollection(obj){var featureCollection={};if(obj.features){featureCollection.features=[];for(var i=0;i<obj.features.length;++i){featureCollection.features.push(this.read(obj.features[i]));}}if(obj.bbox){featureCollection.bbox=this.parse.bbox.apply(this,[obj.bbox]);}return featureCollection;},/**
   * Convert the ordinates in an array to an array of Coordinates
   *
   * @param {Array}
   *          array Array with {Number}s.
   *
   * @return {Array} Array with Coordinates.
   */coordinates:function coordinates(array){var coordinates=[];for(var i=0;i<array.length;++i){var sub=array[i];coordinates.push(new Coordinate(sub[0],sub[1]));}return coordinates;},/**
   * Convert the bbox to a LinearRing
   *
   * @param {Array}
   *          array Array with [xMin, yMin, xMax, yMax].
   *
   * @return {Array} Array with Coordinates.
   */bbox:function bbox(array){return this.geometryFactory.createLinearRing([new Coordinate(array[0],array[1]),new Coordinate(array[2],array[1]),new Coordinate(array[2],array[3]),new Coordinate(array[0],array[3]),new Coordinate(array[0],array[1])]);},/**
   * Convert an Array with ordinates to a Point
   *
   * @param {Array}
   *          array Array with ordinates.
   *
   * @return {Point} Point.
   */Point:function Point(array){var coordinate=new Coordinate(array[0],array[1]);return this.geometryFactory.createPoint(coordinate);},/**
   * Convert an Array with coordinates to a MultiPoint
   *
   * @param {Array}
   *          array Array with coordinates.
   *
   * @return {MultiPoint} MultiPoint.
   */MultiPoint:function MultiPoint(array){var points=[];for(var i=0;i<array.length;++i){points.push(parse$1.Point.apply(this,[array[i]]));}return this.geometryFactory.createMultiPoint(points);},/**
   * Convert an Array with coordinates to a LineString
   *
   * @param {Array}
   *          array Array with coordinates.
   *
   * @return {LineString} LineString.
   */LineString:function LineString(array){var coordinates=parse$1.coordinates.apply(this,[array]);return this.geometryFactory.createLineString(coordinates);},/**
   * Convert an Array with coordinates to a MultiLineString
   *
   * @param {Array}
   *          array Array with coordinates.
   *
   * @return {MultiLineString} MultiLineString.
   */MultiLineString:function MultiLineString(array){var lineStrings=[];for(var i=0;i<array.length;++i){lineStrings.push(parse$1.LineString.apply(this,[array[i]]));}return this.geometryFactory.createMultiLineString(lineStrings);},/**
   * Convert an Array to a Polygon
   *
   * @param {Array}
   *          array Array with shell and holes.
   *
   * @return {Polygon} Polygon.
   */Polygon:function Polygon(array){var shellCoordinates=parse$1.coordinates.apply(this,[array[0]]);var shell=this.geometryFactory.createLinearRing(shellCoordinates);var holes=[];for(var i=1;i<array.length;++i){var hole=array[i];var coordinates=parse$1.coordinates.apply(this,[hole]);var linearRing=this.geometryFactory.createLinearRing(coordinates);holes.push(linearRing);}return this.geometryFactory.createPolygon(shell,holes);},/**
   * Convert an Array to a MultiPolygon
   *
   * @param {Array}
   *          array Array of arrays with shell and rings.
   *
   * @return {MultiPolygon} MultiPolygon.
   */MultiPolygon:function MultiPolygon(array){var polygons=[];for(var i=0;i<array.length;++i){var polygon=array[i];polygons.push(parse$1.Polygon.apply(this,[polygon]));}return this.geometryFactory.createMultiPolygon(polygons);},/**
   * Convert an Array to a GeometryCollection
   *
   * @param {Array}
   *          array Array of GeoJSON geometries.
   *
   * @return {GeometryCollection} GeometryCollection.
   */GeometryCollection:function GeometryCollection(array){var geometries=[];for(var i=0;i<array.length;++i){var geometry=array[i];geometries.push(this.read(geometry));}return this.geometryFactory.createGeometryCollection(geometries);}};var extract$1={/**
   * Convert a Coordinate to an Array
   *
   * @param {Coordinate}
   *          coordinate Coordinate to convert.
   *
   * @return {Array} Array of ordinates.
   */coordinate:function coordinate(_coordinate2){return[_coordinate2.x,_coordinate2.y];},/**
   * Convert a Point to a GeoJSON object
   *
   * @param {Point}
   *          point Point to convert.
   *
   * @return {Array} Array of 2 ordinates (paired to a coordinate).
   */Point:function Point(point){var array=extract$1.coordinate.apply(this,[point.getCoordinate()]);return{type:'Point',coordinates:array};},/**
   * Convert a MultiPoint to a GeoJSON object
   *
   * @param {MultiPoint}
   *          multipoint MultiPoint to convert.
   *
   * @return {Array} Array of coordinates.
   */MultiPoint:function MultiPoint(multipoint){var array=[];for(var i=0;i<multipoint.geometries.length;++i){var point=multipoint.geometries[i];var geoJson=extract$1.Point.apply(this,[point]);array.push(geoJson.coordinates);}return{type:'MultiPoint',coordinates:array};},/**
   * Convert a LineString to a GeoJSON object
   *
   * @param {LineString}
   *          linestring LineString to convert.
   *
   * @return {Array} Array of coordinates.
   */LineString:function LineString(linestring){var array=[];var coordinates=linestring.getCoordinates();for(var i=0;i<coordinates.length;++i){var coordinate=coordinates[i];array.push(extract$1.coordinate.apply(this,[coordinate]));}return{type:'LineString',coordinates:array};},/**
   * Convert a MultiLineString to a GeoJSON object
   *
   * @param {MultiLineString}
   *          multilinestring MultiLineString to convert.
   *
   * @return {Array} Array of Array of coordinates.
   */MultiLineString:function MultiLineString(multilinestring){var array=[];for(var i=0;i<multilinestring.geometries.length;++i){var linestring=multilinestring.geometries[i];var geoJson=extract$1.LineString.apply(this,[linestring]);array.push(geoJson.coordinates);}return{type:'MultiLineString',coordinates:array};},/**
   * Convert a Polygon to a GeoJSON object
   *
   * @param {Polygon}
   *          polygon Polygon to convert.
   *
   * @return {Array} Array with shell, holes.
   */Polygon:function Polygon(polygon){var array=[];var shellGeoJson=extract$1.LineString.apply(this,[polygon.shell]);array.push(shellGeoJson.coordinates);for(var i=0;i<polygon.holes.length;++i){var hole=polygon.holes[i];var holeGeoJson=extract$1.LineString.apply(this,[hole]);array.push(holeGeoJson.coordinates);}return{type:'Polygon',coordinates:array};},/**
   * Convert a MultiPolygon to a GeoJSON object
   *
   * @param {MultiPolygon}
   *          multipolygon MultiPolygon to convert.
   *
   * @return {Array} Array of polygons.
   */MultiPolygon:function MultiPolygon(multipolygon){var array=[];for(var i=0;i<multipolygon.geometries.length;++i){var polygon=multipolygon.geometries[i];var geoJson=extract$1.Polygon.apply(this,[polygon]);array.push(geoJson.coordinates);}return{type:'MultiPolygon',coordinates:array};},/**
   * Convert a GeometryCollection to a GeoJSON object
   *
   * @param {GeometryCollection}
   *          collection GeometryCollection to convert.
   *
   * @return {Array} Array of geometries.
   */GeometryCollection:function GeometryCollection(collection){var array=[];for(var i=0;i<collection.geometries.length;++i){var geometry=collection.geometries[i];var type=geometry.getGeometryType();array.push(extract$1[type].apply(this,[geometry]));}return{type:'GeometryCollection',geometries:array};}};/**
 * Converts a geometry in GeoJSON to a {@link Geometry}.
 *//**
 * A <code>GeoJSONReader</code> is parameterized by a <code>GeometryFactory</code>,
 * to allow it to create <code>Geometry</code> objects of the appropriate
 * implementation. In particular, the <code>GeometryFactory</code> determines
 * the <code>PrecisionModel</code> and <code>SRID</code> that is used.
 *
 * @param {GeometryFactory} geometryFactory
 * @constructor
 */function GeoJSONReader(geometryFactory){this.geometryFactory=geometryFactory||new GeometryFactory();this.precisionModel=this.geometryFactory.getPrecisionModel();this.parser=new GeoJSONParser(this.geometryFactory);}extend$1(GeoJSONReader.prototype,{/**
   * Reads a GeoJSON representation of a {@link Geometry}
   *
   * Will also parse GeoJSON Features/FeatureCollections as custom objects.
   *
   * @param {Object|String} geoJson a GeoJSON Object or String.
   * @return {Geometry|Object} a <code>Geometry or Feature/FeatureCollection representation.</code>
   * @memberof GeoJSONReader
   */read:function read(geoJson){var geometry=this.parser.read(geoJson);if(this.precisionModel.getType()===PrecisionModel.FIXED){this.reducePrecision(geometry);}return geometry;},// NOTE: this is a hack
reducePrecision:function reducePrecision(geometry){var i,len;if(geometry.coordinate){this.precisionModel.makePrecise(geometry.coordinate);}else if(geometry.points){for(i=0,len=geometry.points.length;i<len;i++){this.precisionModel.makePrecise(geometry.points[i]);}}else if(geometry.geometries){for(i=0,len=geometry.geometries.length;i<len;i++){this.reducePrecision(geometry.geometries[i]);}}}});/**
 * @module GeoJSONWriter
 *//**
 * Writes the GeoJSON representation of a {@link Geometry}. The
 * The GeoJSON format is defined <A
 * HREF="http://geojson.org/geojson-spec.html">here</A>.
 *//**
 * The <code>GeoJSONWriter</code> outputs coordinates rounded to the precision
 * model. Only the maximum number of decimal places necessary to represent the
 * ordinates to the required precision will be output.
 *
 * @param {GeometryFactory} geometryFactory
 * @constructor
 */function GeoJSONWriter(){this.parser=new GeoJSONParser(this.geometryFactory);}extend$1(GeoJSONWriter.prototype,{/**
   * Converts a <code>Geometry</code> to its GeoJSON representation.
   *
   * @param {Geometry}
   *          geometry a <code>Geometry</code> to process.
   * @return {Object} The GeoJSON representation of the Geometry.
   * @memberof GeoJSONWriter
   */write:function write(geometry){return this.parser.write(geometry);}});/**
 * Converts a geometry in Well-Known Text format to a {@link Geometry}.
 * <p>
 * <code>WKTReader</code> supports extracting <code>Geometry</code> objects
 * from either {@link Reader}s or {@link String}s. This allows it to function
 * as a parser to read <code>Geometry</code> objects from text blocks embedded
 * in other data formats (e.g. XML).
 *//**
 * A <code>WKTReader</code> is parameterized by a <code>GeometryFactory</code>,
 * to allow it to create <code>Geometry</code> objects of the appropriate
 * implementation. In particular, the <code>GeometryFactory</code> determines
 * the <code>PrecisionModel</code> and <code>SRID</code> that is used.
 * @param {GeometryFactory} geometryFactory
 * @constructor
 */function WKTReader(geometryFactory){this.geometryFactory=geometryFactory||new GeometryFactory();this.precisionModel=this.geometryFactory.getPrecisionModel();this.parser=new WKTParser(this.geometryFactory);}extend$1(WKTReader.prototype,{/**
   * Reads a Well-Known Text representation of a {@link Geometry}
   *
   * @param {string}
   *          wkt a <Geometry Tagged Text> string (see the OpenGIS Simple Features
   *          Specification).
   * @return {Geometry} a <code>Geometry</code> read from
   *         <code>string.</code>
   * @memberof WKTReader
   */read:function read(wkt){var geometry=this.parser.read(wkt);// TODO: port and use GeometryPrecisionReducer, this is a hack
if(this.precisionModel.getType()===PrecisionModel.FIXED){this.reducePrecision(geometry);}return geometry;},reducePrecision:function reducePrecision(geometry){if(geometry.coordinate){this.precisionModel.makePrecise(geometry.coordinate);}else if(geometry.points){for(var i=0,len=geometry.points.coordinates.length;i<len;i++){this.precisionModel.makePrecise(geometry.points.coordinates[i]);}}else if(geometry.geometries){for(var i=0,len=geometry.geometries.length;i<len;i++){this.reducePrecision(geometry.geometries[i]);}}}});/*eslint-disable no-undef */function p2c(p){return[p.x,p.y];}/**
 * OpenLayers 3 Geometry parser and writer
 * @param {GeometryFactory} geometryFactory
 * @param {ol} olReference
 * @constructor
 */function OL3Parser(geometryFactory,olReference){this.geometryFactory=geometryFactory||new GeometryFactory();this.ol=olReference||typeof ol!=='undefined'&&ol;}extend$1(OL3Parser.prototype,{/**
   * @param geometry {ol.geom.Geometry}
   * @return {Geometry}
   * @memberof OL3Parser
   */read:function read(geometry){var ol=this.ol;if(geometry instanceof ol.geom.Point){return this.convertFromPoint(geometry);}else if(geometry instanceof ol.geom.LineString){return this.convertFromLineString(geometry);}else if(geometry instanceof ol.geom.LinearRing){return this.convertFromLinearRing(geometry);}else if(geometry instanceof ol.geom.Polygon){return this.convertFromPolygon(geometry);}else if(geometry instanceof ol.geom.MultiPoint){return this.convertFromMultiPoint(geometry);}else if(geometry instanceof ol.geom.MultiLineString){return this.convertFromMultiLineString(geometry);}else if(geometry instanceof ol.geom.MultiPolygon){return this.convertFromMultiPolygon(geometry);}else if(geometry instanceof ol.geom.GeometryCollection){return this.convertFromCollection(geometry);}},convertFromPoint:function convertFromPoint(point){var coordinates=point.getCoordinates();return this.geometryFactory.createPoint(new Coordinate(coordinates[0],coordinates[1]));},convertFromLineString:function convertFromLineString(lineString){return this.geometryFactory.createLineString(lineString.getCoordinates().map(function(coordinates){return new Coordinate(coordinates[0],coordinates[1]);}));},convertFromLinearRing:function convertFromLinearRing(linearRing){return this.geometryFactory.createLinearRing(linearRing.getCoordinates().map(function(coordinates){return new Coordinate(coordinates[0],coordinates[1]);}));},convertFromPolygon:function convertFromPolygon(polygon){var linearRings=polygon.getLinearRings();var shell=null;var holes=[];for(var i=0;i<linearRings.length;i++){var linearRing=this.convertFromLinearRing(linearRings[i]);if(i===0){shell=linearRing;}else{holes.push(linearRing);}}return this.geometryFactory.createPolygon(shell,holes);},convertFromMultiPoint:function convertFromMultiPoint(multiPoint){var points=multiPoint.getPoints().map(function(point){return this.convertFromPoint(point);},this);return this.geometryFactory.createMultiPoint(points);},convertFromMultiLineString:function convertFromMultiLineString(multiLineString){var lineStrings=multiLineString.getLineStrings().map(function(lineString){return this.convertFromLineString(lineString);},this);return this.geometryFactory.createMultiLineString(lineStrings);},convertFromMultiPolygon:function convertFromMultiPolygon(multiPolygon){var polygons=multiPolygon.getPolygons().map(function(polygon){return this.convertFromPolygon(polygon);},this);return this.geometryFactory.createMultiPolygon(polygons);},convertFromCollection:function convertFromCollection(collection){var geometries=collection.getGeometries().map(function(geometry){return this.read(geometry);},this);return this.geometryFactory.createGeometryCollection(geometries);},/**
   * @param geometry
   *          {Geometry}
   * @return {ol.geom.Geometry}
   * @memberof! OL3Parser
   */write:function write(geometry){if(geometry.getGeometryType()==='Point'){return this.convertToPoint(geometry.getCoordinate());}else if(geometry.getGeometryType()==='LineString'){return this.convertToLineString(geometry);}else if(geometry.getGeometryType()==='LinearRing'){return this.convertToLinearRing(geometry);}else if(geometry.getGeometryType()==='Polygon'){return this.convertToPolygon(geometry);}else if(geometry.getGeometryType()==='MultiPoint'){return this.convertToMultiPoint(geometry);}else if(geometry.getGeometryType()==='MultiLineString'){return this.convertToMultiLineString(geometry);}else if(geometry.getGeometryType()==='MultiPolygon'){return this.convertToMultiPolygon(geometry);}else if(geometry.getGeometryType()==='GeometryCollection'){return this.convertToCollection(geometry);}},convertToPoint:function convertToPoint(coordinate){return new this.ol.geom.Point([coordinate.x,coordinate.y]);},convertToLineString:function convertToLineString(lineString){var points=lineString.points.coordinates.map(p2c);return new this.ol.geom.LineString(points);},convertToLinearRing:function convertToLinearRing(linearRing){var points=linearRing.points.coordinates.map(p2c);return new this.ol.geom.LinearRing(points);},convertToPolygon:function convertToPolygon(polygon){var rings=[polygon.shell.points.coordinates.map(p2c)];for(var i=0;i<polygon.holes.length;i++){rings.push(polygon.holes[i].points.coordinates.map(p2c));}return new this.ol.geom.Polygon(rings);},convertToMultiPoint:function convertToMultiPoint(multiPoint){return new this.ol.geom.MultiPoint(multiPoint.getCoordinates().map(p2c));},convertToMultiLineString:function convertToMultiLineString(multiLineString){var lineStrings=[];for(var i=0;i<multiLineString.geometries.length;i++){lineStrings.push(this.convertToLineString(multiLineString.geometries[i]).getCoordinates());}return new this.ol.geom.MultiLineString(lineStrings);},convertToMultiPolygon:function convertToMultiPolygon(multiPolygon){var polygons=[];for(var i=0;i<multiPolygon.geometries.length;i++){polygons.push(this.convertToPolygon(multiPolygon.geometries[i]).getCoordinates());}return new this.ol.geom.MultiPolygon(polygons);},convertToCollection:function convertToCollection(geometryCollection){var geometries=[];for(var i=0;i<geometryCollection.geometries.length;i++){var geometry=geometryCollection.geometries[i];geometries.push(this.write(geometry));}return new this.ol.geom.GeometryCollection(geometries);}});function GeometryCollectionMapper(){this.mapOp=null;var mapOp=arguments[0];this.mapOp=mapOp;}extend$1(GeometryCollectionMapper.prototype,{map:function map(gc){var mapped=new ArrayList();for(var i=0;i<gc.getNumGeometries();i++){var g=this.mapOp.map(gc.getGeometryN(i));if(!g.isEmpty())mapped.add(g);}return gc.getFactory().createGeometryCollection(GeometryFactory.toGeometryArray(mapped));},interfaces_:function interfaces_(){return[];},getClass:function getClass(){return GeometryCollectionMapper;}});GeometryCollectionMapper.map=function(gc,op){var mapper=new GeometryCollectionMapper(op);return mapper.map(gc);};function Position(){}extend$1(Position.prototype,{interfaces_:function interfaces_(){return[];},getClass:function getClass(){return Position;}});Position.opposite=function(position){if(position===Position.LEFT)return Position.RIGHT;if(position===Position.RIGHT)return Position.LEFT;return position;};Position.ON=0;Position.LEFT=1;Position.RIGHT=2;function TopologyException(){this.pt=null;if(arguments.length===1){var msg=arguments[0];RuntimeException.call(this,msg);}else if(arguments.length===2){var msg=arguments[0],pt=arguments[1];RuntimeException.call(this,TopologyException.msgWithCoord(msg,pt));this.name='TopologyException';this.pt=new Coordinate(pt);}}inherits$1(TopologyException,RuntimeException);extend$1(TopologyException.prototype,{getCoordinate:function getCoordinate(){return this.pt;},interfaces_:function interfaces_(){return[];},getClass:function getClass(){return TopologyException;}});TopologyException.msgWithCoord=function(msg,pt){if(pt!==null)return msg+" [ "+pt+" ]";return msg;};function TopologyLocation(){this.location=null;if(arguments.length===1){if(arguments[0]instanceof Array){var location=arguments[0];this.init(location.length);}else if(Number.isInteger(arguments[0])){var on=arguments[0];this.init(1);this.location[Position.ON]=on;}else if(arguments[0]instanceof TopologyLocation){var gl=arguments[0];this.init(gl.location.length);if(gl!==null){for(var i=0;i<this.location.length;i++){this.location[i]=gl.location[i];}}}}else if(arguments.length===3){var on=arguments[0],left=arguments[1],right=arguments[2];this.init(3);this.location[Position.ON]=on;this.location[Position.LEFT]=left;this.location[Position.RIGHT]=right;}}extend$1(TopologyLocation.prototype,{setAllLocations:function setAllLocations(locValue){for(var i=0;i<this.location.length;i++){this.location[i]=locValue;}},isNull:function isNull(){for(var i=0;i<this.location.length;i++){if(this.location[i]!==Location.NONE)return false;}return true;},setAllLocationsIfNull:function setAllLocationsIfNull(locValue){for(var i=0;i<this.location.length;i++){if(this.location[i]===Location.NONE)this.location[i]=locValue;}},isLine:function isLine(){return this.location.length===1;},merge:function merge(gl){if(gl.location.length>this.location.length){var newLoc=new Array(3).fill(null);newLoc[Position.ON]=this.location[Position.ON];newLoc[Position.LEFT]=Location.NONE;newLoc[Position.RIGHT]=Location.NONE;this.location=newLoc;}for(var i=0;i<this.location.length;i++){if(this.location[i]===Location.NONE&&i<gl.location.length)this.location[i]=gl.location[i];}},getLocations:function getLocations(){return this.location;},flip:function flip(){if(this.location.length<=1)return null;var temp=this.location[Position.LEFT];this.location[Position.LEFT]=this.location[Position.RIGHT];this.location[Position.RIGHT]=temp;},toString:function toString(){var buf=new StringBuffer();if(this.location.length>1)buf.append(Location.toLocationSymbol(this.location[Position.LEFT]));buf.append(Location.toLocationSymbol(this.location[Position.ON]));if(this.location.length>1)buf.append(Location.toLocationSymbol(this.location[Position.RIGHT]));return buf.toString();},setLocations:function setLocations(on,left,right){this.location[Position.ON]=on;this.location[Position.LEFT]=left;this.location[Position.RIGHT]=right;},get:function get$$1(posIndex){if(posIndex<this.location.length)return this.location[posIndex];return Location.NONE;},isArea:function isArea(){return this.location.length>1;},isAnyNull:function isAnyNull(){for(var i=0;i<this.location.length;i++){if(this.location[i]===Location.NONE)return true;}return false;},setLocation:function setLocation(){if(arguments.length===1){var locValue=arguments[0];this.setLocation(Position.ON,locValue);}else if(arguments.length===2){var locIndex=arguments[0],locValue=arguments[1];this.location[locIndex]=locValue;}},init:function init(size){this.location=new Array(size).fill(null);this.setAllLocations(Location.NONE);},isEqualOnSide:function isEqualOnSide(le,locIndex){return this.location[locIndex]===le.location[locIndex];},allPositionsEqual:function allPositionsEqual(loc){for(var i=0;i<this.location.length;i++){if(this.location[i]!==loc)return false;}return true;},interfaces_:function interfaces_(){return[];},getClass:function getClass(){return TopologyLocation;}});function Label(){this.elt=new Array(2).fill(null);if(arguments.length===1){if(Number.isInteger(arguments[0])){var onLoc=arguments[0];this.elt[0]=new TopologyLocation(onLoc);this.elt[1]=new TopologyLocation(onLoc);}else if(arguments[0]instanceof Label){var lbl=arguments[0];this.elt[0]=new TopologyLocation(lbl.elt[0]);this.elt[1]=new TopologyLocation(lbl.elt[1]);}}else if(arguments.length===2){var geomIndex=arguments[0],onLoc=arguments[1];this.elt[0]=new TopologyLocation(Location.NONE);this.elt[1]=new TopologyLocation(Location.NONE);this.elt[geomIndex].setLocation(onLoc);}else if(arguments.length===3){var onLoc=arguments[0],leftLoc=arguments[1],rightLoc=arguments[2];this.elt[0]=new TopologyLocation(onLoc,leftLoc,rightLoc);this.elt[1]=new TopologyLocation(onLoc,leftLoc,rightLoc);}else if(arguments.length===4){var geomIndex=arguments[0],onLoc=arguments[1],leftLoc=arguments[2],rightLoc=arguments[3];this.elt[0]=new TopologyLocation(Location.NONE,Location.NONE,Location.NONE);this.elt[1]=new TopologyLocation(Location.NONE,Location.NONE,Location.NONE);this.elt[geomIndex].setLocations(onLoc,leftLoc,rightLoc);}}extend$1(Label.prototype,{getGeometryCount:function getGeometryCount(){var count=0;if(!this.elt[0].isNull())count++;if(!this.elt[1].isNull())count++;return count;},setAllLocations:function setAllLocations(geomIndex,location){this.elt[geomIndex].setAllLocations(location);},isNull:function isNull(geomIndex){return this.elt[geomIndex].isNull();},setAllLocationsIfNull:function setAllLocationsIfNull(){if(arguments.length===1){var location=arguments[0];this.setAllLocationsIfNull(0,location);this.setAllLocationsIfNull(1,location);}else if(arguments.length===2){var geomIndex=arguments[0],location=arguments[1];this.elt[geomIndex].setAllLocationsIfNull(location);}},isLine:function isLine(geomIndex){return this.elt[geomIndex].isLine();},merge:function merge(lbl){for(var i=0;i<2;i++){if(this.elt[i]===null&&lbl.elt[i]!==null){this.elt[i]=new TopologyLocation(lbl.elt[i]);}else{this.elt[i].merge(lbl.elt[i]);}}},flip:function flip(){this.elt[0].flip();this.elt[1].flip();},getLocation:function getLocation(){if(arguments.length===1){var geomIndex=arguments[0];return this.elt[geomIndex].get(Position.ON);}else if(arguments.length===2){var geomIndex=arguments[0],posIndex=arguments[1];return this.elt[geomIndex].get(posIndex);}},toString:function toString(){var buf=new StringBuffer();if(this.elt[0]!==null){buf.append("A:");buf.append(this.elt[0].toString());}if(this.elt[1]!==null){buf.append(" B:");buf.append(this.elt[1].toString());}return buf.toString();},isArea:function isArea(){if(arguments.length===0){return this.elt[0].isArea()||this.elt[1].isArea();}else if(arguments.length===1){var geomIndex=arguments[0];return this.elt[geomIndex].isArea();}},isAnyNull:function isAnyNull(geomIndex){return this.elt[geomIndex].isAnyNull();},setLocation:function setLocation(){if(arguments.length===2){var geomIndex=arguments[0],location=arguments[1];this.elt[geomIndex].setLocation(Position.ON,location);}else if(arguments.length===3){var geomIndex=arguments[0],posIndex=arguments[1],location=arguments[2];this.elt[geomIndex].setLocation(posIndex,location);}},isEqualOnSide:function isEqualOnSide(lbl,side){return this.elt[0].isEqualOnSide(lbl.elt[0],side)&&this.elt[1].isEqualOnSide(lbl.elt[1],side);},allPositionsEqual:function allPositionsEqual(geomIndex,loc){return this.elt[geomIndex].allPositionsEqual(loc);},toLine:function toLine(geomIndex){if(this.elt[geomIndex].isArea())this.elt[geomIndex]=new TopologyLocation(this.elt[geomIndex].location[0]);},interfaces_:function interfaces_(){return[];},getClass:function getClass(){return Label;}});Label.toLineLabel=function(label){var lineLabel=new Label(Location.NONE);for(var i=0;i<2;i++){lineLabel.setLocation(i,label.getLocation(i));}return lineLabel;};function EdgeRing(){this.startDe=null;this.maxNodeDegree=-1;this.edges=new ArrayList();this.pts=new ArrayList();this.label=new Label(Location.NONE);this.ring=null;this._isHole=null;this.shell=null;this.holes=new ArrayList();this.geometryFactory=null;var start=arguments[0],geometryFactory=arguments[1];this.geometryFactory=geometryFactory;this.computePoints(start);this.computeRing();}extend$1(EdgeRing.prototype,{computeRing:function computeRing(){if(this.ring!==null)return null;var coord=new Array(this.pts.size()).fill(null);for(var i=0;i<this.pts.size();i++){coord[i]=this.pts.get(i);}this.ring=this.geometryFactory.createLinearRing(coord);this._isHole=CGAlgorithms.isCCW(this.ring.getCoordinates());},isIsolated:function isIsolated(){return this.label.getGeometryCount()===1;},computePoints:function computePoints(start){this.startDe=start;var de=start;var isFirstEdge=true;do{if(de===null)throw new TopologyException("Found null DirectedEdge");if(de.getEdgeRing()===this)throw new TopologyException("Directed Edge visited twice during ring-building at "+de.getCoordinate());this.edges.add(de);var label=de.getLabel();Assert.isTrue(label.isArea());this.mergeLabel(label);this.addPoints(de.getEdge(),de.isForward(),isFirstEdge);isFirstEdge=false;this.setEdgeRing(de,this);de=this.getNext(de);}while(de!==this.startDe);},getLinearRing:function getLinearRing(){return this.ring;},getCoordinate:function getCoordinate(i){return this.pts.get(i);},computeMaxNodeDegree:function computeMaxNodeDegree(){this.maxNodeDegree=0;var de=this.startDe;do{var node=de.getNode();var degree=node.getEdges().getOutgoingDegree(this);if(degree>this.maxNodeDegree)this.maxNodeDegree=degree;de=this.getNext(de);}while(de!==this.startDe);this.maxNodeDegree*=2;},addPoints:function addPoints(edge,isForward,isFirstEdge){var edgePts=edge.getCoordinates();if(isForward){var startIndex=1;if(isFirstEdge)startIndex=0;for(var i=startIndex;i<edgePts.length;i++){this.pts.add(edgePts[i]);}}else{var startIndex=edgePts.length-2;if(isFirstEdge)startIndex=edgePts.length-1;for(var i=startIndex;i>=0;i--){this.pts.add(edgePts[i]);}}},isHole:function isHole(){return this._isHole;},setInResult:function setInResult(){var de=this.startDe;do{de.getEdge().setInResult(true);de=de.getNext();}while(de!==this.startDe);},containsPoint:function containsPoint(p){var shell=this.getLinearRing();var env=shell.getEnvelopeInternal();if(!env.contains(p))return false;if(!CGAlgorithms.isPointInRing(p,shell.getCoordinates()))return false;for(var i=this.holes.iterator();i.hasNext();){var hole=i.next();if(hole.containsPoint(p))return false;}return true;},addHole:function addHole(ring){this.holes.add(ring);},isShell:function isShell(){return this.shell===null;},getLabel:function getLabel(){return this.label;},getEdges:function getEdges(){return this.edges;},getMaxNodeDegree:function getMaxNodeDegree(){if(this.maxNodeDegree<0)this.computeMaxNodeDegree();return this.maxNodeDegree;},getShell:function getShell(){return this.shell;},mergeLabel:function mergeLabel(){if(arguments.length===1){var deLabel=arguments[0];this.mergeLabel(deLabel,0);this.mergeLabel(deLabel,1);}else if(arguments.length===2){var deLabel=arguments[0],geomIndex=arguments[1];var loc=deLabel.getLocation(geomIndex,Position.RIGHT);if(loc===Location.NONE)return null;if(this.label.getLocation(geomIndex)===Location.NONE){this.label.setLocation(geomIndex,loc);return null;}}},setShell:function setShell(shell){this.shell=shell;if(shell!==null)shell.addHole(this);},toPolygon:function toPolygon(geometryFactory){var holeLR=new Array(this.holes.size()).fill(null);for(var i=0;i<this.holes.size();i++){holeLR[i]=this.holes.get(i).getLinearRing();}var poly=geometryFactory.createPolygon(this.getLinearRing(),holeLR);return poly;},interfaces_:function interfaces_(){return[];},getClass:function getClass(){return EdgeRing;}});function MinimalEdgeRing(){var start=arguments[0],geometryFactory=arguments[1];EdgeRing.call(this,start,geometryFactory);}inherits$1(MinimalEdgeRing,EdgeRing);extend$1(MinimalEdgeRing.prototype,{setEdgeRing:function setEdgeRing(de,er){de.setMinEdgeRing(er);},getNext:function getNext(de){return de.getNextMin();},interfaces_:function interfaces_(){return[];},getClass:function getClass(){return MinimalEdgeRing;}});function MaximalEdgeRing(){var start=arguments[0],geometryFactory=arguments[1];EdgeRing.call(this,start,geometryFactory);}inherits$1(MaximalEdgeRing,EdgeRing);extend$1(MaximalEdgeRing.prototype,{buildMinimalRings:function buildMinimalRings(){var minEdgeRings=new ArrayList();var de=this.startDe;do{if(de.getMinEdgeRing()===null){var minEr=new MinimalEdgeRing(de,this.geometryFactory);minEdgeRings.add(minEr);}de=de.getNext();}while(de!==this.startDe);return minEdgeRings;},setEdgeRing:function setEdgeRing(de,er){de.setEdgeRing(er);},linkDirectedEdgesForMinimalEdgeRings:function linkDirectedEdgesForMinimalEdgeRings(){var de=this.startDe;do{var node=de.getNode();node.getEdges().linkMinimalDirectedEdges(this);de=de.getNext();}while(de!==this.startDe);},getNext:function getNext(de){return de.getNext();},interfaces_:function interfaces_(){return[];},getClass:function getClass(){return MaximalEdgeRing;}});function PointOnGeometryLocator(){}extend$1(PointOnGeometryLocator.prototype,{locate:function locate(p){},interfaces_:function interfaces_(){return[];},getClass:function getClass(){return PointOnGeometryLocator;}});function GeometryCollectionIterator(){this.parent=null;this.atStart=null;this.max=null;this.index=null;this.subcollectionIterator=null;var parent=arguments[0];this.parent=parent;this.atStart=true;this.index=0;this.max=parent.getNumGeometries();}extend$1(GeometryCollectionIterator.prototype,{next:function next(){if(this.atStart){this.atStart=false;if(GeometryCollectionIterator.isAtomic(this.parent))this.index++;return this.parent;}if(this.subcollectionIterator!==null){if(this.subcollectionIterator.hasNext()){return this.subcollectionIterator.next();}else{this.subcollectionIterator=null;}}if(this.index>=this.max){throw new NoSuchElementException();}var obj=this.parent.getGeometryN(this.index++);if(obj instanceof GeometryCollection){this.subcollectionIterator=new GeometryCollectionIterator(obj);return this.subcollectionIterator.next();}return obj;},remove:function remove(){throw new UnsupportedOperationException(this.getClass().getName());},hasNext:function hasNext(){if(this.atStart){return true;}if(this.subcollectionIterator!==null){if(this.subcollectionIterator.hasNext()){return true;}this.subcollectionIterator=null;}if(this.index>=this.max){return false;}return true;},interfaces_:function interfaces_(){return[Iterator];},getClass:function getClass(){return GeometryCollectionIterator;}});GeometryCollectionIterator.isAtomic=function(geom){return!(geom instanceof GeometryCollection);};function SimplePointInAreaLocator(){this.geom=null;var geom=arguments[0];this.geom=geom;}extend$1(SimplePointInAreaLocator.prototype,{locate:function locate(p){return SimplePointInAreaLocator.locate(p,this.geom);},interfaces_:function interfaces_(){return[PointOnGeometryLocator];},getClass:function getClass(){return SimplePointInAreaLocator;}});SimplePointInAreaLocator.isPointInRing=function(p,ring){if(!ring.getEnvelopeInternal().intersects(p))return false;return CGAlgorithms.isPointInRing(p,ring.getCoordinates());};SimplePointInAreaLocator.containsPointInPolygon=function(p,poly){if(poly.isEmpty())return false;var shell=poly.getExteriorRing();if(!SimplePointInAreaLocator.isPointInRing(p,shell))return false;for(var i=0;i<poly.getNumInteriorRing();i++){var hole=poly.getInteriorRingN(i);if(SimplePointInAreaLocator.isPointInRing(p,hole))return false;}return true;};SimplePointInAreaLocator.containsPoint=function(p,geom){if(geom instanceof Polygon){return SimplePointInAreaLocator.containsPointInPolygon(p,geom);}else if(geom instanceof GeometryCollection){var geomi=new GeometryCollectionIterator(geom);while(geomi.hasNext()){var g2=geomi.next();if(g2!==geom)if(SimplePointInAreaLocator.containsPoint(p,g2))return true;}}return false;};SimplePointInAreaLocator.locate=function(p,geom){if(geom.isEmpty())return Location.EXTERIOR;if(SimplePointInAreaLocator.containsPoint(p,geom))return Location.INTERIOR;return Location.EXTERIOR;};function EdgeEndStar(){this.edgeMap=new TreeMap();this.edgeList=null;this.ptInAreaLocation=[Location.NONE,Location.NONE];}extend$1(EdgeEndStar.prototype,{getNextCW:function getNextCW(ee){this.getEdges();var i=this.edgeList.indexOf(ee);var iNextCW=i-1;if(i===0)iNextCW=this.edgeList.size()-1;return this.edgeList.get(iNextCW);},propagateSideLabels:function propagateSideLabels(geomIndex){var startLoc=Location.NONE;for(var it=this.iterator();it.hasNext();){var e=it.next();var label=e.getLabel();if(label.isArea(geomIndex)&&label.getLocation(geomIndex,Position.LEFT)!==Location.NONE)startLoc=label.getLocation(geomIndex,Position.LEFT);}if(startLoc===Location.NONE)return null;var currLoc=startLoc;for(var it=this.iterator();it.hasNext();){var e=it.next();var label=e.getLabel();if(label.getLocation(geomIndex,Position.ON)===Location.NONE)label.setLocation(geomIndex,Position.ON,currLoc);if(label.isArea(geomIndex)){var leftLoc=label.getLocation(geomIndex,Position.LEFT);var rightLoc=label.getLocation(geomIndex,Position.RIGHT);if(rightLoc!==Location.NONE){if(rightLoc!==currLoc)throw new TopologyException("side location conflict",e.getCoordinate());if(leftLoc===Location.NONE){Assert.shouldNeverReachHere("found single null side (at "+e.getCoordinate()+")");}currLoc=leftLoc;}else{Assert.isTrue(label.getLocation(geomIndex,Position.LEFT)===Location.NONE,"found single null side");label.setLocation(geomIndex,Position.RIGHT,currLoc);label.setLocation(geomIndex,Position.LEFT,currLoc);}}}},getCoordinate:function getCoordinate(){var it=this.iterator();if(!it.hasNext())return null;var e=it.next();return e.getCoordinate();},print:function print(out){System.out.println("EdgeEndStar:   "+this.getCoordinate());for(var it=this.iterator();it.hasNext();){var e=it.next();e.print(out);}},isAreaLabelsConsistent:function isAreaLabelsConsistent(geomGraph){this.computeEdgeEndLabels(geomGraph.getBoundaryNodeRule());return this.checkAreaLabelsConsistent(0);},checkAreaLabelsConsistent:function checkAreaLabelsConsistent(geomIndex){var edges=this.getEdges();if(edges.size()<=0)return true;var lastEdgeIndex=edges.size()-1;var startLabel=edges.get(lastEdgeIndex).getLabel();var startLoc=startLabel.getLocation(geomIndex,Position.LEFT);Assert.isTrue(startLoc!==Location.NONE,"Found unlabelled area edge");var currLoc=startLoc;for(var it=this.iterator();it.hasNext();){var e=it.next();var label=e.getLabel();Assert.isTrue(label.isArea(geomIndex),"Found non-area edge");var leftLoc=label.getLocation(geomIndex,Position.LEFT);var rightLoc=label.getLocation(geomIndex,Position.RIGHT);if(leftLoc===rightLoc){return false;}if(rightLoc!==currLoc){return false;}currLoc=leftLoc;}return true;},findIndex:function findIndex(eSearch){this.iterator();for(var i=0;i<this.edgeList.size();i++){var e=this.edgeList.get(i);if(e===eSearch)return i;}return-1;},iterator:function iterator(){return this.getEdges().iterator();},getEdges:function getEdges(){if(this.edgeList===null){this.edgeList=new ArrayList(this.edgeMap.values());}return this.edgeList;},getLocation:function getLocation(geomIndex,p,geom){if(this.ptInAreaLocation[geomIndex]===Location.NONE){this.ptInAreaLocation[geomIndex]=SimplePointInAreaLocator.locate(p,geom[geomIndex].getGeometry());}return this.ptInAreaLocation[geomIndex];},toString:function toString(){var buf=new StringBuffer();buf.append("EdgeEndStar:   "+this.getCoordinate());buf.append("\n");for(var it=this.iterator();it.hasNext();){var e=it.next();buf.append(e);buf.append("\n");}return buf.toString();},computeEdgeEndLabels:function computeEdgeEndLabels(boundaryNodeRule){for(var it=this.iterator();it.hasNext();){var ee=it.next();ee.computeLabel(boundaryNodeRule);}},computeLabelling:function computeLabelling(geomGraph){this.computeEdgeEndLabels(geomGraph[0].getBoundaryNodeRule());this.propagateSideLabels(0);this.propagateSideLabels(1);var hasDimensionalCollapseEdge=[false,false];for(var it=this.iterator();it.hasNext();){var e=it.next();var label=e.getLabel();for(var geomi=0;geomi<2;geomi++){if(label.isLine(geomi)&&label.getLocation(geomi)===Location.BOUNDARY)hasDimensionalCollapseEdge[geomi]=true;}}for(var it=this.iterator();it.hasNext();){var e=it.next();var label=e.getLabel();for(var geomi=0;geomi<2;geomi++){if(label.isAnyNull(geomi)){var loc=Location.NONE;if(hasDimensionalCollapseEdge[geomi]){loc=Location.EXTERIOR;}else{var p=e.getCoordinate();loc=this.getLocation(geomi,p,geomGraph);}label.setAllLocationsIfNull(geomi,loc);}}}},getDegree:function getDegree(){return this.edgeMap.size();},insertEdgeEnd:function insertEdgeEnd(e,obj){this.edgeMap.put(e,obj);this.edgeList=null;},interfaces_:function interfaces_(){return[];},getClass:function getClass(){return EdgeEndStar;}});function Quadrant(){}extend$1(Quadrant.prototype,{interfaces_:function interfaces_(){return[];},getClass:function getClass(){return Quadrant;}});Quadrant.isNorthern=function(quad){return quad===Quadrant.NE||quad===Quadrant.NW;};Quadrant.isOpposite=function(quad1,quad2){if(quad1===quad2)return false;var diff=(quad1-quad2+4)%4;if(diff===2)return true;return false;};Quadrant.commonHalfPlane=function(quad1,quad2){if(quad1===quad2)return quad1;var diff=(quad1-quad2+4)%4;if(diff===2)return-1;var min=quad1<quad2?quad1:quad2;var max=quad1>quad2?quad1:quad2;if(min===0&&max===3)return 3;return min;};Quadrant.isInHalfPlane=function(quad,halfPlane){if(halfPlane===Quadrant.SE){return quad===Quadrant.SE||quad===Quadrant.SW;}return quad===halfPlane||quad===halfPlane+1;};Quadrant.quadrant=function(){if(typeof arguments[0]==="number"&&typeof arguments[1]==="number"){var dx=arguments[0],dy=arguments[1];if(dx===0.0&&dy===0.0)throw new IllegalArgumentException("Cannot compute the quadrant for point ( "+dx+", "+dy+" )");if(dx>=0.0){if(dy>=0.0)return Quadrant.NE;else return Quadrant.SE;}else{if(dy>=0.0)return Quadrant.NW;else return Quadrant.SW;}}else if(arguments[0]instanceof Coordinate&&arguments[1]instanceof Coordinate){var p0=arguments[0],p1=arguments[1];if(p1.x===p0.x&&p1.y===p0.y)throw new IllegalArgumentException("Cannot compute the quadrant for two identical points "+p0);if(p1.x>=p0.x){if(p1.y>=p0.y)return Quadrant.NE;else return Quadrant.SE;}else{if(p1.y>=p0.y)return Quadrant.NW;else return Quadrant.SW;}}};Quadrant.NE=0;Quadrant.NW=1;Quadrant.SW=2;Quadrant.SE=3;function DirectedEdgeStar(){EdgeEndStar.apply(this);this.resultAreaEdgeList=null;this.label=null;this.SCANNING_FOR_INCOMING=1;this.LINKING_TO_OUTGOING=2;}inherits$1(DirectedEdgeStar,EdgeEndStar);extend$1(DirectedEdgeStar.prototype,{linkResultDirectedEdges:function linkResultDirectedEdges(){this.getResultAreaEdges();var firstOut=null;var incoming=null;var state=this.SCANNING_FOR_INCOMING;for(var i=0;i<this.resultAreaEdgeList.size();i++){var nextOut=this.resultAreaEdgeList.get(i);var nextIn=nextOut.getSym();if(!nextOut.getLabel().isArea())continue;if(firstOut===null&&nextOut.isInResult())firstOut=nextOut;switch(state){case this.SCANNING_FOR_INCOMING:if(!nextIn.isInResult())continue;incoming=nextIn;state=this.LINKING_TO_OUTGOING;break;case this.LINKING_TO_OUTGOING:if(!nextOut.isInResult())continue;incoming.setNext(nextOut);state=this.SCANNING_FOR_INCOMING;break;}}if(state===this.LINKING_TO_OUTGOING){if(firstOut===null)throw new TopologyException("no outgoing dirEdge found",this.getCoordinate());Assert.isTrue(firstOut.isInResult(),"unable to link last incoming dirEdge");incoming.setNext(firstOut);}},insert:function insert(ee){var de=ee;this.insertEdgeEnd(de,de);},getRightmostEdge:function getRightmostEdge(){var edges=this.getEdges();var size=edges.size();if(size<1)return null;var de0=edges.get(0);if(size===1)return de0;var deLast=edges.get(size-1);var quad0=de0.getQuadrant();var quad1=deLast.getQuadrant();if(Quadrant.isNorthern(quad0)&&Quadrant.isNorthern(quad1))return de0;else if(!Quadrant.isNorthern(quad0)&&!Quadrant.isNorthern(quad1))return deLast;else{if(de0.getDy()!==0)return de0;else if(deLast.getDy()!==0)return deLast;}Assert.shouldNeverReachHere("found two horizontal edges incident on node");return null;},print:function print(out){System.out.println("DirectedEdgeStar: "+this.getCoordinate());for(var it=this.iterator();it.hasNext();){var de=it.next();out.print("out ");de.print(out);out.println();out.print("in ");de.getSym().print(out);out.println();}},getResultAreaEdges:function getResultAreaEdges(){if(this.resultAreaEdgeList!==null)return this.resultAreaEdgeList;this.resultAreaEdgeList=new ArrayList();for(var it=this.iterator();it.hasNext();){var de=it.next();if(de.isInResult()||de.getSym().isInResult())this.resultAreaEdgeList.add(de);}return this.resultAreaEdgeList;},updateLabelling:function updateLabelling(nodeLabel){for(var it=this.iterator();it.hasNext();){var de=it.next();var label=de.getLabel();label.setAllLocationsIfNull(0,nodeLabel.getLocation(0));label.setAllLocationsIfNull(1,nodeLabel.getLocation(1));}},linkAllDirectedEdges:function linkAllDirectedEdges(){this.getEdges();var prevOut=null;var firstIn=null;for(var i=this.edgeList.size()-1;i>=0;i--){var nextOut=this.edgeList.get(i);var nextIn=nextOut.getSym();if(firstIn===null)firstIn=nextIn;if(prevOut!==null)nextIn.setNext(prevOut);prevOut=nextOut;}firstIn.setNext(prevOut);},computeDepths:function computeDepths(){if(arguments.length===1){var de=arguments[0];var edgeIndex=this.findIndex(de);var label=de.getLabel();var startDepth=de.getDepth(Position.LEFT);var targetLastDepth=de.getDepth(Position.RIGHT);var nextDepth=this.computeDepths(edgeIndex+1,this.edgeList.size(),startDepth);var lastDepth=this.computeDepths(0,edgeIndex,nextDepth);if(lastDepth!==targetLastDepth)throw new TopologyException("depth mismatch at "+de.getCoordinate());}else if(arguments.length===3){var startIndex=arguments[0],endIndex=arguments[1],startDepth=arguments[2];var currDepth=startDepth;for(var i=startIndex;i<endIndex;i++){var nextDe=this.edgeList.get(i);var label=nextDe.getLabel();nextDe.setEdgeDepths(Position.RIGHT,currDepth);currDepth=nextDe.getDepth(Position.LEFT);}return currDepth;}},mergeSymLabels:function mergeSymLabels(){for(var it=this.iterator();it.hasNext();){var de=it.next();var label=de.getLabel();label.merge(de.getSym().getLabel());}},linkMinimalDirectedEdges:function linkMinimalDirectedEdges(er){var firstOut=null;var incoming=null;var state=this.SCANNING_FOR_INCOMING;for(var i=this.resultAreaEdgeList.size()-1;i>=0;i--){var nextOut=this.resultAreaEdgeList.get(i);var nextIn=nextOut.getSym();if(firstOut===null&&nextOut.getEdgeRing()===er)firstOut=nextOut;switch(state){case this.SCANNING_FOR_INCOMING:if(nextIn.getEdgeRing()!==er)continue;incoming=nextIn;state=this.LINKING_TO_OUTGOING;break;case this.LINKING_TO_OUTGOING:if(nextOut.getEdgeRing()!==er)continue;incoming.setNextMin(nextOut);state=this.SCANNING_FOR_INCOMING;break;}}if(state===this.LINKING_TO_OUTGOING){Assert.isTrue(firstOut!==null,"found null for first outgoing dirEdge");Assert.isTrue(firstOut.getEdgeRing()===er,"unable to link last incoming dirEdge");incoming.setNextMin(firstOut);}},getOutgoingDegree:function getOutgoingDegree(){if(arguments.length===0){var degree=0;for(var it=this.iterator();it.hasNext();){var de=it.next();if(de.isInResult())degree++;}return degree;}else if(arguments.length===1){var er=arguments[0];var degree=0;for(var it=this.iterator();it.hasNext();){var de=it.next();if(de.getEdgeRing()===er)degree++;}return degree;}},getLabel:function getLabel(){return this.label;},findCoveredLineEdges:function findCoveredLineEdges(){var startLoc=Location.NONE;for(var it=this.iterator();it.hasNext();){var nextOut=it.next();var nextIn=nextOut.getSym();if(!nextOut.isLineEdge()){if(nextOut.isInResult()){startLoc=Location.INTERIOR;break;}if(nextIn.isInResult()){startLoc=Location.EXTERIOR;break;}}}if(startLoc===Location.NONE)return null;var currLoc=startLoc;for(var it=this.iterator();it.hasNext();){var nextOut=it.next();var nextIn=nextOut.getSym();if(nextOut.isLineEdge()){nextOut.getEdge().setCovered(currLoc===Location.INTERIOR);}else{if(nextOut.isInResult())currLoc=Location.EXTERIOR;if(nextIn.isInResult())currLoc=Location.INTERIOR;}}},computeLabelling:function computeLabelling(geom){EdgeEndStar.prototype.computeLabelling.call(this,geom);this.label=new Label(Location.NONE);for(var it=this.iterator();it.hasNext();){var ee=it.next();var e=ee.getEdge();var eLabel=e.getLabel();for(var i=0;i<2;i++){var eLoc=eLabel.getLocation(i);if(eLoc===Location.INTERIOR||eLoc===Location.BOUNDARY)this.label.setLocation(i,Location.INTERIOR);}}},interfaces_:function interfaces_(){return[];},getClass:function getClass(){return DirectedEdgeStar;}});function GraphComponent(){this.label=null;this._isInResult=false;this._isCovered=false;this._isCoveredSet=false;this._isVisited=false;if(arguments.length===0){}else if(arguments.length===1){var label=arguments[0];this.label=label;}}extend$1(GraphComponent.prototype,{setVisited:function setVisited(isVisited){this._isVisited=isVisited;},setInResult:function setInResult(isInResult){this._isInResult=isInResult;},isCovered:function isCovered(){return this._isCovered;},isCoveredSet:function isCoveredSet(){return this._isCoveredSet;},setLabel:function setLabel(label){this.label=label;},getLabel:function getLabel(){return this.label;},setCovered:function setCovered(isCovered){this._isCovered=isCovered;this._isCoveredSet=true;},updateIM:function updateIM(im){Assert.isTrue(this.label.getGeometryCount()>=2,"found partial label");this.computeIM(im);},isInResult:function isInResult(){return this._isInResult;},isVisited:function isVisited(){return this._isVisited;},interfaces_:function interfaces_(){return[];},getClass:function getClass(){return GraphComponent;}});function Node(){GraphComponent.apply(this);this.coord=null;this.edges=null;var coord=arguments[0],edges=arguments[1];this.coord=coord;this.edges=edges;this.label=new Label(0,Location.NONE);}inherits$1(Node,GraphComponent);extend$1(Node.prototype,{isIncidentEdgeInResult:function isIncidentEdgeInResult(){for(var it=this.getEdges().getEdges().iterator();it.hasNext();){var de=it.next();if(de.getEdge().isInResult())return true;}return false;},isIsolated:function isIsolated(){return this.label.getGeometryCount()===1;},getCoordinate:function getCoordinate(){return this.coord;},print:function print(out){out.println("node "+this.coord+" lbl: "+this.label);},computeIM:function computeIM(im){},computeMergedLocation:function computeMergedLocation(label2,eltIndex){var loc=Location.NONE;loc=this.label.getLocation(eltIndex);if(!label2.isNull(eltIndex)){var nLoc=label2.getLocation(eltIndex);if(loc!==Location.BOUNDARY)loc=nLoc;}return loc;},setLabel:function setLabel(){if(arguments.length===2){var argIndex=arguments[0],onLocation=arguments[1];if(this.label===null){this.label=new Label(argIndex,onLocation);}else this.label.setLocation(argIndex,onLocation);}else return GraphComponent.prototype.setLabel.apply(this,arguments);},getEdges:function getEdges(){return this.edges;},mergeLabel:function mergeLabel(){if(arguments[0]instanceof Node){var n=arguments[0];this.mergeLabel(n.label);}else if(arguments[0]instanceof Label){var label2=arguments[0];for(var i=0;i<2;i++){var loc=this.computeMergedLocation(label2,i);var thisLoc=this.label.getLocation(i);if(thisLoc===Location.NONE)this.label.setLocation(i,loc);}}},add:function add(e){this.edges.insert(e);e.setNode(this);},setLabelBoundary:function setLabelBoundary(argIndex){if(this.label===null)return null;var loc=Location.NONE;if(this.label!==null)loc=this.label.getLocation(argIndex);var newLoc=null;switch(loc){case Location.BOUNDARY:newLoc=Location.INTERIOR;break;case Location.INTERIOR:newLoc=Location.BOUNDARY;break;default:newLoc=Location.BOUNDARY;break;}this.label.setLocation(argIndex,newLoc);},interfaces_:function interfaces_(){return[];},getClass:function getClass(){return Node;}});function NodeFactory(){}extend$1(NodeFactory.prototype,{createNode:function createNode(coord){return new Node(coord,null);},interfaces_:function interfaces_(){return[];},getClass:function getClass(){return NodeFactory;}});function OverlayNodeFactory(){NodeFactory.apply(this);}inherits$1(OverlayNodeFactory,NodeFactory);extend$1(OverlayNodeFactory.prototype,{createNode:function createNode(coord){return new Node(coord,new DirectedEdgeStar());},interfaces_:function interfaces_(){return[];},getClass:function getClass(){return OverlayNodeFactory;}});function NodeMap(){this.nodeMap=new TreeMap();this.nodeFact=null;var nodeFact=arguments[0];this.nodeFact=nodeFact;}extend$1(NodeMap.prototype,{find:function find(coord){return this.nodeMap.get(coord);},addNode:function addNode(){if(arguments[0]instanceof Coordinate){var coord=arguments[0];var node=this.nodeMap.get(coord);if(node===null){node=this.nodeFact.createNode(coord);this.nodeMap.put(coord,node);}return node;}else if(arguments[0]instanceof Node){var n=arguments[0];var node=this.nodeMap.get(n.getCoordinate());if(node===null){this.nodeMap.put(n.getCoordinate(),n);return n;}node.mergeLabel(n);return node;}},print:function print(out){for(var it=this.iterator();it.hasNext();){var n=it.next();n.print(out);}},iterator:function iterator(){return this.nodeMap.values().iterator();},values:function values(){return this.nodeMap.values();},getBoundaryNodes:function getBoundaryNodes(geomIndex){var bdyNodes=new ArrayList();for(var i=this.iterator();i.hasNext();){var node=i.next();if(node.getLabel().getLocation(geomIndex)===Location.BOUNDARY)bdyNodes.add(node);}return bdyNodes;},add:function add(e){var p=e.getCoordinate();var n=this.addNode(p);n.add(e);},interfaces_:function interfaces_(){return[];},getClass:function getClass(){return NodeMap;}});function EdgeEnd(){this.edge=null;this.label=null;this.node=null;this.p0=null;this.p1=null;this.dx=null;this.dy=null;this.quadrant=null;if(arguments.length===1){var edge=arguments[0];this.edge=edge;}else if(arguments.length===3){var edge=arguments[0],p0=arguments[1],p1=arguments[2];EdgeEnd.call(this,edge,p0,p1,null);}else if(arguments.length===4){var edge=arguments[0],p0=arguments[1],p1=arguments[2],label=arguments[3];EdgeEnd.call(this,edge);this.init(p0,p1);this.label=label;}}extend$1(EdgeEnd.prototype,{compareDirection:function compareDirection(e){if(this.dx===e.dx&&this.dy===e.dy)return 0;if(this.quadrant>e.quadrant)return 1;if(this.quadrant<e.quadrant)return-1;return CGAlgorithms.computeOrientation(e.p0,e.p1,this.p1);},getDy:function getDy(){return this.dy;},getCoordinate:function getCoordinate(){return this.p0;},setNode:function setNode(node){this.node=node;},print:function print(out){var angle=Math.atan2(this.dy,this.dx);var className=this.getClass().getName();var lastDotPos=className.lastIndexOf('.');var name=className.substring(lastDotPos+1);out.print("  "+name+": "+this.p0+" - "+this.p1+" "+this.quadrant+":"+angle+"   "+this.label);},compareTo:function compareTo(obj){var e=obj;return this.compareDirection(e);},getDirectedCoordinate:function getDirectedCoordinate(){return this.p1;},getDx:function getDx(){return this.dx;},getLabel:function getLabel(){return this.label;},getEdge:function getEdge(){return this.edge;},getQuadrant:function getQuadrant(){return this.quadrant;},getNode:function getNode(){return this.node;},toString:function toString(){var angle=Math.atan2(this.dy,this.dx);var className=this.getClass().getName();var lastDotPos=className.lastIndexOf('.');var name=className.substring(lastDotPos+1);return"  "+name+": "+this.p0+" - "+this.p1+" "+this.quadrant+":"+angle+"   "+this.label;},computeLabel:function computeLabel(boundaryNodeRule){},init:function init(p0,p1){this.p0=p0;this.p1=p1;this.dx=p1.x-p0.x;this.dy=p1.y-p0.y;this.quadrant=Quadrant.quadrant(this.dx,this.dy);Assert.isTrue(!(this.dx===0&&this.dy===0),"EdgeEnd with identical endpoints found");},interfaces_:function interfaces_(){return[Comparable];},getClass:function getClass(){return EdgeEnd;}});function DirectedEdge(){this._isForward=null;this._isInResult=false;this._isVisited=false;this.sym=null;this.next=null;this.nextMin=null;this.edgeRing=null;this.minEdgeRing=null;this.depth=[0,-999,-999];var edge=arguments[0],isForward=arguments[1];EdgeEnd.call(this,edge);this._isForward=isForward;if(isForward){this.init(edge.getCoordinate(0),edge.getCoordinate(1));}else{var n=edge.getNumPoints()-1;this.init(edge.getCoordinate(n),edge.getCoordinate(n-1));}this.computeDirectedLabel();}inherits$1(DirectedEdge,EdgeEnd);extend$1(DirectedEdge.prototype,{getNextMin:function getNextMin(){return this.nextMin;},getDepth:function getDepth(position){return this.depth[position];},setVisited:function setVisited(isVisited){this._isVisited=isVisited;},computeDirectedLabel:function computeDirectedLabel(){this.label=new Label(this.edge.getLabel());if(!this._isForward)this.label.flip();},getNext:function getNext(){return this.next;},setDepth:function setDepth(position,depthVal){if(this.depth[position]!==-999){if(this.depth[position]!==depthVal)throw new TopologyException("assigned depths do not match",this.getCoordinate());}this.depth[position]=depthVal;},isInteriorAreaEdge:function isInteriorAreaEdge(){var isInteriorAreaEdge=true;for(var i=0;i<2;i++){if(!(this.label.isArea(i)&&this.label.getLocation(i,Position.LEFT)===Location.INTERIOR&&this.label.getLocation(i,Position.RIGHT)===Location.INTERIOR)){isInteriorAreaEdge=false;}}return isInteriorAreaEdge;},setNextMin:function setNextMin(nextMin){this.nextMin=nextMin;},print:function print(out){EdgeEnd.prototype.print.call(this,out);out.print(" "+this.depth[Position.LEFT]+"/"+this.depth[Position.RIGHT]);out.print(" ("+this.getDepthDelta()+")");if(this._isInResult)out.print(" inResult");},setMinEdgeRing:function setMinEdgeRing(minEdgeRing){this.minEdgeRing=minEdgeRing;},isLineEdge:function isLineEdge(){var isLine=this.label.isLine(0)||this.label.isLine(1);var isExteriorIfArea0=!this.label.isArea(0)||this.label.allPositionsEqual(0,Location.EXTERIOR);var isExteriorIfArea1=!this.label.isArea(1)||this.label.allPositionsEqual(1,Location.EXTERIOR);return isLine&&isExteriorIfArea0&&isExteriorIfArea1;},setEdgeRing:function setEdgeRing(edgeRing){this.edgeRing=edgeRing;},getMinEdgeRing:function getMinEdgeRing(){return this.minEdgeRing;},getDepthDelta:function getDepthDelta(){var depthDelta=this.edge.getDepthDelta();if(!this._isForward)depthDelta=-depthDelta;return depthDelta;},setInResult:function setInResult(isInResult){this._isInResult=isInResult;},getSym:function getSym(){return this.sym;},isForward:function isForward(){return this._isForward;},getEdge:function getEdge(){return this.edge;},printEdge:function printEdge(out){this.print(out);out.print(" ");if(this._isForward)this.edge.print(out);else this.edge.printReverse(out);},setSym:function setSym(de){this.sym=de;},setVisitedEdge:function setVisitedEdge(isVisited){this.setVisited(isVisited);this.sym.setVisited(isVisited);},setEdgeDepths:function setEdgeDepths(position,depth){var depthDelta=this.getEdge().getDepthDelta();if(!this._isForward)depthDelta=-depthDelta;var directionFactor=1;if(position===Position.LEFT)directionFactor=-1;var oppositePos=Position.opposite(position);var delta=depthDelta*directionFactor;var oppositeDepth=depth+delta;this.setDepth(position,depth);this.setDepth(oppositePos,oppositeDepth);},getEdgeRing:function getEdgeRing(){return this.edgeRing;},isInResult:function isInResult(){return this._isInResult;},setNext:function setNext(next){this.next=next;},isVisited:function isVisited(){return this._isVisited;},interfaces_:function interfaces_(){return[];},getClass:function getClass(){return DirectedEdge;}});DirectedEdge.depthFactor=function(currLocation,nextLocation){if(currLocation===Location.EXTERIOR&&nextLocation===Location.INTERIOR)return 1;else if(currLocation===Location.INTERIOR&&nextLocation===Location.EXTERIOR)return-1;return 0;};function PlanarGraph(){this.edges=new ArrayList();this.nodes=null;this.edgeEndList=new ArrayList();if(arguments.length===0){this.nodes=new NodeMap(new NodeFactory());}else if(arguments.length===1){var nodeFact=arguments[0];this.nodes=new NodeMap(nodeFact);}}extend$1(PlanarGraph.prototype,{printEdges:function printEdges(out){out.println("Edges:");for(var i=0;i<this.edges.size();i++){out.println("edge "+i+":");var e=this.edges.get(i);e.print(out);e.eiList.print(out);}},find:function find(coord){return this.nodes.find(coord);},addNode:function addNode(){if(arguments[0]instanceof Node){var node=arguments[0];return this.nodes.addNode(node);}else if(arguments[0]instanceof Coordinate){var coord=arguments[0];return this.nodes.addNode(coord);}},getNodeIterator:function getNodeIterator(){return this.nodes.iterator();},linkResultDirectedEdges:function linkResultDirectedEdges(){for(var nodeit=this.nodes.iterator();nodeit.hasNext();){var node=nodeit.next();node.getEdges().linkResultDirectedEdges();}},debugPrintln:function debugPrintln(o){System.out.println(o);},isBoundaryNode:function isBoundaryNode(geomIndex,coord){var node=this.nodes.find(coord);if(node===null)return false;var label=node.getLabel();if(label!==null&&label.getLocation(geomIndex)===Location.BOUNDARY)return true;return false;},linkAllDirectedEdges:function linkAllDirectedEdges(){for(var nodeit=this.nodes.iterator();nodeit.hasNext();){var node=nodeit.next();node.getEdges().linkAllDirectedEdges();}},matchInSameDirection:function matchInSameDirection(p0,p1,ep0,ep1){if(!p0.equals(ep0))return false;if(CGAlgorithms.computeOrientation(p0,p1,ep1)===CGAlgorithms.COLLINEAR&&Quadrant.quadrant(p0,p1)===Quadrant.quadrant(ep0,ep1))return true;return false;},getEdgeEnds:function getEdgeEnds(){return this.edgeEndList;},debugPrint:function debugPrint(o){System.out.print(o);},getEdgeIterator:function getEdgeIterator(){return this.edges.iterator();},findEdgeInSameDirection:function findEdgeInSameDirection(p0,p1){for(var i=0;i<this.edges.size();i++){var e=this.edges.get(i);var eCoord=e.getCoordinates();if(this.matchInSameDirection(p0,p1,eCoord[0],eCoord[1]))return e;if(this.matchInSameDirection(p0,p1,eCoord[eCoord.length-1],eCoord[eCoord.length-2]))return e;}return null;},insertEdge:function insertEdge(e){this.edges.add(e);},findEdgeEnd:function findEdgeEnd(e){for(var i=this.getEdgeEnds().iterator();i.hasNext();){var ee=i.next();if(ee.getEdge()===e)return ee;}return null;},addEdges:function addEdges(edgesToAdd){for(var it=edgesToAdd.iterator();it.hasNext();){var e=it.next();this.edges.add(e);var de1=new DirectedEdge(e,true);var de2=new DirectedEdge(e,false);de1.setSym(de2);de2.setSym(de1);this.add(de1);this.add(de2);}},add:function add(e){this.nodes.add(e);this.edgeEndList.add(e);},getNodes:function getNodes(){return this.nodes.values();},findEdge:function findEdge(p0,p1){for(var i=0;i<this.edges.size();i++){var e=this.edges.get(i);var eCoord=e.getCoordinates();if(p0.equals(eCoord[0])&&p1.equals(eCoord[1]))return e;}return null;},interfaces_:function interfaces_(){return[];},getClass:function getClass(){return PlanarGraph;}});PlanarGraph.linkResultDirectedEdges=function(nodes){for(var nodeit=nodes.iterator();nodeit.hasNext();){var node=nodeit.next();node.getEdges().linkResultDirectedEdges();}};function ConnectedInteriorTester(){this.geometryFactory=new GeometryFactory();this.geomGraph=null;this.disconnectedRingcoord=null;var geomGraph=arguments[0];this.geomGraph=geomGraph;}extend$1(ConnectedInteriorTester.prototype,{visitInteriorRing:function visitInteriorRing(ring,graph){var pts=ring.getCoordinates();var pt0=pts[0];var pt1=ConnectedInteriorTester.findDifferentPoint(pts,pt0);var e=graph.findEdgeInSameDirection(pt0,pt1);var de=graph.findEdgeEnd(e);var intDe=null;if(de.getLabel().getLocation(0,Position.RIGHT)===Location.INTERIOR){intDe=de;}else if(de.getSym().getLabel().getLocation(0,Position.RIGHT)===Location.INTERIOR){intDe=de.getSym();}Assert.isTrue(intDe!==null,"unable to find dirEdge with Interior on RHS");this.visitLinkedDirectedEdges(intDe);},visitShellInteriors:function visitShellInteriors(g,graph){if(g instanceof Polygon){var p=g;this.visitInteriorRing(p.getExteriorRing(),graph);}if(g instanceof MultiPolygon){var mp=g;for(var i=0;i<mp.getNumGeometries();i++){var p=mp.getGeometryN(i);this.visitInteriorRing(p.getExteriorRing(),graph);}}},getCoordinate:function getCoordinate(){return this.disconnectedRingcoord;},setInteriorEdgesInResult:function setInteriorEdgesInResult(graph){for(var it=graph.getEdgeEnds().iterator();it.hasNext();){var de=it.next();if(de.getLabel().getLocation(0,Position.RIGHT)===Location.INTERIOR){de.setInResult(true);}}},visitLinkedDirectedEdges:function visitLinkedDirectedEdges(start){var startDe=start;var de=start;do{Assert.isTrue(de!==null,"found null Directed Edge");de.setVisited(true);de=de.getNext();}while(de!==startDe);},buildEdgeRings:function buildEdgeRings(dirEdges){var edgeRings=new ArrayList();for(var it=dirEdges.iterator();it.hasNext();){var de=it.next();if(de.isInResult()&&de.getEdgeRing()===null){var er=new MaximalEdgeRing(de,this.geometryFactory);er.linkDirectedEdgesForMinimalEdgeRings();var minEdgeRings=er.buildMinimalRings();edgeRings.addAll(minEdgeRings);}}return edgeRings;},hasUnvisitedShellEdge:function hasUnvisitedShellEdge(edgeRings){for(var i=0;i<edgeRings.size();i++){var er=edgeRings.get(i);if(er.isHole())continue;var edges=er.getEdges();var de=edges.get(0);if(de.getLabel().getLocation(0,Position.RIGHT)!==Location.INTERIOR)continue;for(var j=0;j<edges.size();j++){de=edges.get(j);if(!de.isVisited()){this.disconnectedRingcoord=de.getCoordinate();return true;}}}return false;},isInteriorsConnected:function isInteriorsConnected(){var splitEdges=new ArrayList();this.geomGraph.computeSplitEdges(splitEdges);var graph=new PlanarGraph(new OverlayNodeFactory());graph.addEdges(splitEdges);this.setInteriorEdgesInResult(graph);graph.linkResultDirectedEdges();var edgeRings=this.buildEdgeRings(graph.getEdgeEnds());this.visitShellInteriors(this.geomGraph.getGeometry(),graph);return!this.hasUnvisitedShellEdge(edgeRings);},interfaces_:function interfaces_(){return[];},getClass:function getClass(){return ConnectedInteriorTester;}});ConnectedInteriorTester.findDifferentPoint=function(coord,pt){for(var i=0;i<coord.length;i++){if(!coord[i].equals(pt))return coord[i];}return null;};function LineSegment(){this.p0=null;this.p1=null;if(arguments.length===0){LineSegment.call(this,new Coordinate(),new Coordinate());}else if(arguments.length===1){var ls=arguments[0];LineSegment.call(this,ls.p0,ls.p1);}else if(arguments.length===2){var p0=arguments[0],p1=arguments[1];this.p0=p0;this.p1=p1;}else if(arguments.length===4){var x0=arguments[0],y0=arguments[1],x1=arguments[2],y1=arguments[3];LineSegment.call(this,new Coordinate(x0,y0),new Coordinate(x1,y1));}}extend$1(LineSegment.prototype,{minX:function minX(){return Math.min(this.p0.x,this.p1.x);},orientationIndex:function orientationIndex(){if(arguments[0]instanceof LineSegment){var seg=arguments[0];var orient0=CGAlgorithms.orientationIndex(this.p0,this.p1,seg.p0);var orient1=CGAlgorithms.orientationIndex(this.p0,this.p1,seg.p1);if(orient0>=0&&orient1>=0)return Math.max(orient0,orient1);if(orient0<=0&&orient1<=0)return Math.max(orient0,orient1);return 0;}else if(arguments[0]instanceof Coordinate){var p=arguments[0];return CGAlgorithms.orientationIndex(this.p0,this.p1,p);}},toGeometry:function toGeometry(geomFactory){return geomFactory.createLineString([this.p0,this.p1]);},isVertical:function isVertical(){return this.p0.x===this.p1.x;},equals:function equals(o){if(!(o instanceof LineSegment)){return false;}var other=o;return this.p0.equals(other.p0)&&this.p1.equals(other.p1);},intersection:function intersection(line){var li=new RobustLineIntersector();li.computeIntersection(this.p0,this.p1,line.p0,line.p1);if(li.hasIntersection())return li.getIntersection(0);return null;},project:function project(){if(arguments[0]instanceof Coordinate){var p=arguments[0];if(p.equals(this.p0)||p.equals(this.p1))return new Coordinate(p);var r=this.projectionFactor(p);var coord=new Coordinate();coord.x=this.p0.x+r*(this.p1.x-this.p0.x);coord.y=this.p0.y+r*(this.p1.y-this.p0.y);return coord;}else if(arguments[0]instanceof LineSegment){var seg=arguments[0];var pf0=this.projectionFactor(seg.p0);var pf1=this.projectionFactor(seg.p1);if(pf0>=1.0&&pf1>=1.0)return null;if(pf0<=0.0&&pf1<=0.0)return null;var newp0=this.project(seg.p0);if(pf0<0.0)newp0=this.p0;if(pf0>1.0)newp0=this.p1;var newp1=this.project(seg.p1);if(pf1<0.0)newp1=this.p0;if(pf1>1.0)newp1=this.p1;return new LineSegment(newp0,newp1);}},normalize:function normalize(){if(this.p1.compareTo(this.p0)<0)this.reverse();},angle:function angle(){return Math.atan2(this.p1.y-this.p0.y,this.p1.x-this.p0.x);},getCoordinate:function getCoordinate(i){if(i===0)return this.p0;return this.p1;},distancePerpendicular:function distancePerpendicular(p){return CGAlgorithms.distancePointLinePerpendicular(p,this.p0,this.p1);},minY:function minY(){return Math.min(this.p0.y,this.p1.y);},midPoint:function midPoint(){return LineSegment.midPoint(this.p0,this.p1);},projectionFactor:function projectionFactor(p){if(p.equals(this.p0))return 0.0;if(p.equals(this.p1))return 1.0;var dx=this.p1.x-this.p0.x;var dy=this.p1.y-this.p0.y;var len=dx*dx+dy*dy;if(len<=0.0)return Double.NaN;var r=((p.x-this.p0.x)*dx+(p.y-this.p0.y)*dy)/len;return r;},closestPoints:function closestPoints(line){var intPt=this.intersection(line);if(intPt!==null){return[intPt,intPt];}var closestPt=new Array(2).fill(null);var minDistance=Double.MAX_VALUE;var dist=null;var close00=this.closestPoint(line.p0);minDistance=close00.distance(line.p0);closestPt[0]=close00;closestPt[1]=line.p0;var close01=this.closestPoint(line.p1);dist=close01.distance(line.p1);if(dist<minDistance){minDistance=dist;closestPt[0]=close01;closestPt[1]=line.p1;}var close10=line.closestPoint(this.p0);dist=close10.distance(this.p0);if(dist<minDistance){minDistance=dist;closestPt[0]=this.p0;closestPt[1]=close10;}var close11=line.closestPoint(this.p1);dist=close11.distance(this.p1);if(dist<minDistance){minDistance=dist;closestPt[0]=this.p1;closestPt[1]=close11;}return closestPt;},closestPoint:function closestPoint(p){var factor=this.projectionFactor(p);if(factor>0&&factor<1){return this.project(p);}var dist0=this.p0.distance(p);var dist1=this.p1.distance(p);if(dist0<dist1)return this.p0;return this.p1;},maxX:function maxX(){return Math.max(this.p0.x,this.p1.x);},getLength:function getLength(){return this.p0.distance(this.p1);},compareTo:function compareTo(o){var other=o;var comp0=this.p0.compareTo(other.p0);if(comp0!==0)return comp0;return this.p1.compareTo(other.p1);},reverse:function reverse(){var temp=this.p0;this.p0=this.p1;this.p1=temp;},equalsTopo:function equalsTopo(other){return this.p0.equals(other.p0)&&this.p1.equals(other.p1)||this.p0.equals(other.p1)&&this.p1.equals(other.p0);},lineIntersection:function lineIntersection(line){try{var intPt=HCoordinate.intersection(this.p0,this.p1,line.p0,line.p1);return intPt;}catch(ex){if(ex instanceof NotRepresentableException){}else throw ex;}finally{}return null;},maxY:function maxY(){return Math.max(this.p0.y,this.p1.y);},pointAlongOffset:function pointAlongOffset(segmentLengthFraction,offsetDistance){var segx=this.p0.x+segmentLengthFraction*(this.p1.x-this.p0.x);var segy=this.p0.y+segmentLengthFraction*(this.p1.y-this.p0.y);var dx=this.p1.x-this.p0.x;var dy=this.p1.y-this.p0.y;var len=Math.sqrt(dx*dx+dy*dy);var ux=0.0;var uy=0.0;if(offsetDistance!==0.0){if(len<=0.0)throw new IllegalStateException("Cannot compute offset from zero-length line segment");ux=offsetDistance*dx/len;uy=offsetDistance*dy/len;}var offsetx=segx-uy;var offsety=segy+ux;var coord=new Coordinate(offsetx,offsety);return coord;},setCoordinates:function setCoordinates(){if(arguments.length===1){var ls=arguments[0];this.setCoordinates(ls.p0,ls.p1);}else if(arguments.length===2){var p0=arguments[0],p1=arguments[1];this.p0.x=p0.x;this.p0.y=p0.y;this.p1.x=p1.x;this.p1.y=p1.y;}},segmentFraction:function segmentFraction(inputPt){var segFrac=this.projectionFactor(inputPt);if(segFrac<0.0)segFrac=0.0;else if(segFrac>1.0||Double.isNaN(segFrac))segFrac=1.0;return segFrac;},toString:function toString(){return"LINESTRING( "+this.p0.x+" "+this.p0.y+", "+this.p1.x+" "+this.p1.y+")";},isHorizontal:function isHorizontal(){return this.p0.y===this.p1.y;},distance:function distance(){if(arguments[0]instanceof LineSegment){var ls=arguments[0];return CGAlgorithms.distanceLineLine(this.p0,this.p1,ls.p0,ls.p1);}else if(arguments[0]instanceof Coordinate){var p=arguments[0];return CGAlgorithms.distancePointLine(p,this.p0,this.p1);}},pointAlong:function pointAlong(segmentLengthFraction){var coord=new Coordinate();coord.x=this.p0.x+segmentLengthFraction*(this.p1.x-this.p0.x);coord.y=this.p0.y+segmentLengthFraction*(this.p1.y-this.p0.y);return coord;},hashCode:function hashCode(){var bits0=java.lang.Double.doubleToLongBits(this.p0.x);bits0^=java.lang.Double.doubleToLongBits(this.p0.y)*31;var hash0=Math.trunc(bits0)^Math.trunc(bits0>>32);var bits1=java.lang.Double.doubleToLongBits(this.p1.x);bits1^=java.lang.Double.doubleToLongBits(this.p1.y)*31;var hash1=Math.trunc(bits1)^Math.trunc(bits1>>32);return hash0^hash1;},interfaces_:function interfaces_(){return[Comparable,Serializable];},getClass:function getClass(){return LineSegment;}});LineSegment.midPoint=function(p0,p1){return new Coordinate((p0.x+p1.x)/2,(p0.y+p1.y)/2);};LineSegment.serialVersionUID=3252005833466256227;function MonotoneChainSelectAction(){this.tempEnv1=new Envelope();this.selectedSegment=new LineSegment();}extend$1(MonotoneChainSelectAction.prototype,{select:function select(){if(arguments.length===1){}else if(arguments.length===2){var mc=arguments[0],startIndex=arguments[1];mc.getLineSegment(startIndex,this.selectedSegment);this.select(this.selectedSegment);}},interfaces_:function interfaces_(){return[];},getClass:function getClass(){return MonotoneChainSelectAction;}});function NodeBase(){this.items=new ArrayList();this.subnode=[null,null];}extend$1(NodeBase.prototype,{hasChildren:function hasChildren(){for(var i=0;i<2;i++){if(this.subnode[i]!==null)return true;}return false;},isPrunable:function isPrunable(){return!(this.hasChildren()||this.hasItems());},addAllItems:function addAllItems(items){items.addAll(this.items);for(var i=0;i<2;i++){if(this.subnode[i]!==null){this.subnode[i].addAllItems(items);}}return items;},size:function size(){var subSize=0;for(var i=0;i<2;i++){if(this.subnode[i]!==null){subSize+=this.subnode[i].size();}}return subSize+this.items.size();},addAllItemsFromOverlapping:function addAllItemsFromOverlapping(interval,resultItems){if(interval!==null&&!this.isSearchMatch(interval))return null;resultItems.addAll(this.items);if(this.subnode[0]!==null)this.subnode[0].addAllItemsFromOverlapping(interval,resultItems);if(this.subnode[1]!==null)this.subnode[1].addAllItemsFromOverlapping(interval,resultItems);},hasItems:function hasItems(){return!this.items.isEmpty();},remove:function remove(itemInterval,item){if(!this.isSearchMatch(itemInterval))return false;var found=false;for(var i=0;i<2;i++){if(this.subnode[i]!==null){found=this.subnode[i].remove(itemInterval,item);if(found){if(this.subnode[i].isPrunable())this.subnode[i]=null;break;}}}if(found)return found;found=this.items.remove(item);return found;},getItems:function getItems(){return this.items;},depth:function depth(){var maxSubDepth=0;for(var i=0;i<2;i++){if(this.subnode[i]!==null){var sqd=this.subnode[i].depth();if(sqd>maxSubDepth)maxSubDepth=sqd;}}return maxSubDepth+1;},nodeSize:function nodeSize(){var subSize=0;for(var i=0;i<2;i++){if(this.subnode[i]!==null){subSize+=this.subnode[i].nodeSize();}}return subSize+1;},add:function add(item){this.items.add(item);},interfaces_:function interfaces_(){return[];},getClass:function getClass(){return NodeBase;}});NodeBase.getSubnodeIndex=function(interval,centre){var subnodeIndex=-1;if(interval.min>=centre)subnodeIndex=1;if(interval.max<=centre)subnodeIndex=0;return subnodeIndex;};function Interval(){this.min=null;this.max=null;if(arguments.length===0){this.min=0.0;this.max=0.0;}else if(arguments.length===1){var interval=arguments[0];this.init(interval.min,interval.max);}else if(arguments.length===2){var min=arguments[0],max=arguments[1];this.init(min,max);}}extend$1(Interval.prototype,{expandToInclude:function expandToInclude(interval){if(interval.max>this.max)this.max=interval.max;if(interval.min<this.min)this.min=interval.min;},getWidth:function getWidth(){return this.max-this.min;},overlaps:function overlaps(){if(arguments.length===1){var interval=arguments[0];return this.overlaps(interval.min,interval.max);}else if(arguments.length===2){var min=arguments[0],max=arguments[1];if(this.min>max||this.max<min)return false;return true;}},getMin:function getMin(){return this.min;},toString:function toString(){return"["+this.min+", "+this.max+"]";},contains:function contains(){if(arguments.length===1){if(arguments[0]instanceof Interval){var interval=arguments[0];return this.contains(interval.min,interval.max);}else if(typeof arguments[0]==="number"){var p=arguments[0];return p>=this.min&&p<=this.max;}}else if(arguments.length===2){var min=arguments[0],max=arguments[1];return min>=this.min&&max<=this.max;}},init:function init(min,max){this.min=min;this.max=max;if(min>max){this.min=max;this.max=min;}},getMax:function getMax(){return this.max;},interfaces_:function interfaces_(){return[];},getClass:function getClass(){return Interval;}});function DoubleBits(){}DoubleBits.exponent=function(d){return CVTFWD(64,d)-1023;};DoubleBits.powerOf2=function(exp){return Math.pow(2,exp);};/**
 * Calculates the exponent of the bit-pattern for a number. Uses code from:
 * http://www.merlyn.demon.co.uk/js-exact.htm
 *
 * @param {Number}
 *          NumW 32 or 64 to denote the number of bits.
 * @param {Number}
 *          Qty the number to calculate the bit pattern for.
 * @return {Number} The integer value of the exponent.
 */function CVTFWD(NumW,Qty){var Sign;var Expo;var Mant;var Bin;var Inf={32:{d:0x7F,c:0x80,b:0,a:0},64:{d:0x7FF0,c:0,b:0,a:0}};var ExW={32:8,64:11}[NumW];if(!Bin){Sign=Qty<0||1/Qty<0;// OK for +-0
if(!isFinite(Qty)){Bin=Inf[NumW];if(Sign){Bin.d+=1<<NumW/4-1;}Expo=Math.pow(2,ExW)-1;Mant=0;}}if(!Bin){Expo={32:127,64:1023}[NumW];Mant=Math.abs(Qty);while(Mant>=2){Expo++;Mant/=2;}while(Mant<1&&Expo>0){Expo--;Mant*=2;}if(Expo<=0){Mant/=2;}if(NumW===32&&Expo>254){Bin={d:Sign?0xFF:0x7F,c:0x80,b:0,a:0};Expo=Math.pow(2,ExW)-1;Mant=0;}}return Expo;}function Key(){this.pt=0.0;this.level=0;this.interval=null;var interval=arguments[0];this.computeKey(interval);}extend$1(Key.prototype,{getInterval:function getInterval(){return this.interval;},getLevel:function getLevel(){return this.level;},computeKey:function computeKey(itemInterval){this.level=Key.computeLevel(itemInterval);this.interval=new Interval();this.computeInterval(this.level,itemInterval);while(!this.interval.contains(itemInterval)){this.level+=1;this.computeInterval(this.level,itemInterval);}},computeInterval:function computeInterval(level,itemInterval){var size=DoubleBits.powerOf2(level);this.pt=Math.floor(itemInterval.getMin()/size)*size;this.interval.init(this.pt,this.pt+size);},getPoint:function getPoint(){return this.pt;},interfaces_:function interfaces_(){return[];},getClass:function getClass(){return Key;}});Key.computeLevel=function(interval){var dx=interval.getWidth();var level=DoubleBits.exponent(dx)+1;return level;};function Node$1(){NodeBase.apply(this);this.interval=null;this.centre=null;this.level=null;var interval=arguments[0],level=arguments[1];this.interval=interval;this.level=level;this.centre=(interval.getMin()+interval.getMax())/2;}inherits$1(Node$1,NodeBase);extend$1(Node$1.prototype,{getInterval:function getInterval(){return this.interval;},find:function find(searchInterval){var subnodeIndex=NodeBase.getSubnodeIndex(searchInterval,this.centre);if(subnodeIndex===-1)return this;if(this.subnode[subnodeIndex]!==null){var node=this.subnode[subnodeIndex];return node.find(searchInterval);}return this;},insert:function insert(node){Assert.isTrue(this.interval===null||this.interval.contains(node.interval));var index=NodeBase.getSubnodeIndex(node.interval,this.centre);if(node.level===this.level-1){this.subnode[index]=node;}else{var childNode=this.createSubnode(index);childNode.insert(node);this.subnode[index]=childNode;}},isSearchMatch:function isSearchMatch(itemInterval){return itemInterval.overlaps(this.interval);},getSubnode:function getSubnode(index){if(this.subnode[index]===null){this.subnode[index]=this.createSubnode(index);}return this.subnode[index];},getNode:function getNode(searchInterval){var subnodeIndex=NodeBase.getSubnodeIndex(searchInterval,this.centre);if(subnodeIndex!==-1){var node=this.getSubnode(subnodeIndex);return node.getNode(searchInterval);}else{return this;}},createSubnode:function createSubnode(index){var min=0.0;var max=0.0;switch(index){case 0:min=this.interval.getMin();max=this.centre;break;case 1:min=this.centre;max=this.interval.getMax();break;}var subInt=new Interval(min,max);var node=new Node$1(subInt,this.level-1);return node;},interfaces_:function interfaces_(){return[];},getClass:function getClass(){return Node$1;}});Node$1.createNode=function(itemInterval){var key=new Key(itemInterval);var node=new Node$1(key.getInterval(),key.getLevel());return node;};Node$1.createExpanded=function(node,addInterval){var expandInt=new Interval(addInterval);if(node!==null)expandInt.expandToInclude(node.interval);var largerNode=Node$1.createNode(expandInt);if(node!==null)largerNode.insert(node);return largerNode;};function IntervalSize(){}extend$1(IntervalSize.prototype,{interfaces_:function interfaces_(){return[];},getClass:function getClass(){return IntervalSize;}});IntervalSize.isZeroWidth=function(min,max){var width=max-min;if(width===0.0)return true;var maxAbs=Math.max(Math.abs(min),Math.abs(max));var scaledInterval=width/maxAbs;var level=DoubleBits.exponent(scaledInterval);return level<=IntervalSize.MIN_BINARY_EXPONENT;};IntervalSize.MIN_BINARY_EXPONENT=-50;function Root(){NodeBase.apply(this);}inherits$1(Root,NodeBase);extend$1(Root.prototype,{insert:function insert(itemInterval,item){var index=NodeBase.getSubnodeIndex(itemInterval,Root.origin);if(index===-1){this.add(item);return null;}var node=this.subnode[index];if(node===null||!node.getInterval().contains(itemInterval)){var largerNode=Node$1.createExpanded(node,itemInterval);this.subnode[index]=largerNode;}this.insertContained(this.subnode[index],itemInterval,item);},isSearchMatch:function isSearchMatch(interval){return true;},insertContained:function insertContained(tree,itemInterval,item){Assert.isTrue(tree.getInterval().contains(itemInterval));var isZeroArea=IntervalSize.isZeroWidth(itemInterval.getMin(),itemInterval.getMax());var node=null;if(isZeroArea)node=tree.find(itemInterval);else node=tree.getNode(itemInterval);node.add(item);},interfaces_:function interfaces_(){return[];},getClass:function getClass(){return Root;}});Root.origin=0.0;function Bintree(){this.root=null;this.minExtent=1.0;this.root=new Root();}extend$1(Bintree.prototype,{size:function size(){if(this.root!==null)return this.root.size();return 0;},insert:function insert(itemInterval,item){this.collectStats(itemInterval);var insertInterval=Bintree.ensureExtent(itemInterval,this.minExtent);this.root.insert(insertInterval,item);},query:function query(){if(arguments.length===1){if(typeof arguments[0]==="number"){var x=arguments[0];return this.query(new Interval(x,x));}else if(arguments[0]instanceof Interval){var interval=arguments[0];var foundItems=new ArrayList();this.query(interval,foundItems);return foundItems;}}else if(arguments.length===2){var interval=arguments[0],foundItems=arguments[1];this.root.addAllItemsFromOverlapping(interval,foundItems);}},iterator:function iterator(){var foundItems=new ArrayList();this.root.addAllItems(foundItems);return foundItems.iterator();},remove:function remove(itemInterval,item){var insertInterval=Bintree.ensureExtent(itemInterval,this.minExtent);return this.root.remove(insertInterval,item);},collectStats:function collectStats(interval){var del=interval.getWidth();if(del<this.minExtent&&del>0.0)this.minExtent=del;},depth:function depth(){if(this.root!==null)return this.root.depth();return 0;},nodeSize:function nodeSize(){if(this.root!==null)return this.root.nodeSize();return 0;},interfaces_:function interfaces_(){return[];},getClass:function getClass(){return Bintree;}});Bintree.ensureExtent=function(itemInterval,minExtent){var min=itemInterval.getMin();var max=itemInterval.getMax();if(min!==max)return itemInterval;if(min===max){min=min-minExtent/2.0;max=min+minExtent/2.0;}return new Interval(min,max);};function MonotoneChain(){this.pts=null;this.start=null;this.end=null;this.env=null;this.context=null;this.id=null;var pts=arguments[0],start=arguments[1],end=arguments[2],context=arguments[3];this.pts=pts;this.start=start;this.end=end;this.context=context;}extend$1(MonotoneChain.prototype,{getLineSegment:function getLineSegment(index,ls){ls.p0=this.pts[index];ls.p1=this.pts[index+1];},computeSelect:function computeSelect(searchEnv,start0,end0,mcs){var p0=this.pts[start0];var p1=this.pts[end0];mcs.tempEnv1.init(p0,p1);if(end0-start0===1){mcs.select(this,start0);return null;}if(!searchEnv.intersects(mcs.tempEnv1))return null;var mid=Math.trunc((start0+end0)/2);if(start0<mid){this.computeSelect(searchEnv,start0,mid,mcs);}if(mid<end0){this.computeSelect(searchEnv,mid,end0,mcs);}},getCoordinates:function getCoordinates(){var coord=new Array(this.end-this.start+1).fill(null);var index=0;for(var i=this.start;i<=this.end;i++){coord[index++]=this.pts[i];}return coord;},computeOverlaps:function computeOverlaps(mc,mco){this.computeOverlapsInternal(this.start,this.end,mc,mc.start,mc.end,mco);},setId:function setId(id){this.id=id;},select:function select(searchEnv,mcs){this.computeSelect(searchEnv,this.start,this.end,mcs);},getEnvelope:function getEnvelope(){if(this.env===null){var p0=this.pts[this.start];var p1=this.pts[this.end];this.env=new Envelope(p0,p1);}return this.env;},getEndIndex:function getEndIndex(){return this.end;},getStartIndex:function getStartIndex(){return this.start;},getContext:function getContext(){return this.context;},getId:function getId(){return this.id;},computeOverlapsInternal:function computeOverlapsInternal(start0,end0,mc,start1,end1,mco){var p00=this.pts[start0];var p01=this.pts[end0];var p10=mc.pts[start1];var p11=mc.pts[end1];if(end0-start0===1&&end1-start1===1){mco.overlap(this,start0,mc,start1);return null;}mco.tempEnv1.init(p00,p01);mco.tempEnv2.init(p10,p11);if(!mco.tempEnv1.intersects(mco.tempEnv2))return null;var mid0=Math.trunc((start0+end0)/2);var mid1=Math.trunc((start1+end1)/2);if(start0<mid0){if(start1<mid1)this.computeOverlapsInternal(start0,mid0,mc,start1,mid1,mco);if(mid1<end1)this.computeOverlapsInternal(start0,mid0,mc,mid1,end1,mco);}if(mid0<end0){if(start1<mid1)this.computeOverlapsInternal(mid0,end0,mc,start1,mid1,mco);if(mid1<end1)this.computeOverlapsInternal(mid0,end0,mc,mid1,end1,mco);}},interfaces_:function interfaces_(){return[];},getClass:function getClass(){return MonotoneChain;}});function MonotoneChainBuilder(){}extend$1(MonotoneChainBuilder.prototype,{interfaces_:function interfaces_(){return[];},getClass:function getClass(){return MonotoneChainBuilder;}});MonotoneChainBuilder.getChainStartIndices=function(pts){var start=0;var startIndexList=new ArrayList();startIndexList.add(new Integer(start));do{var last=MonotoneChainBuilder.findChainEnd(pts,start);startIndexList.add(new Integer(last));start=last;}while(start<pts.length-1);var startIndex=MonotoneChainBuilder.toIntArray(startIndexList);return startIndex;};MonotoneChainBuilder.findChainEnd=function(pts,start){var safeStart=start;while(safeStart<pts.length-1&&pts[safeStart].equals2D(pts[safeStart+1])){safeStart++;}if(safeStart>=pts.length-1){return pts.length-1;}var chainQuad=Quadrant.quadrant(pts[safeStart],pts[safeStart+1]);var last=start+1;while(last<pts.length){if(!pts[last-1].equals2D(pts[last])){var quad=Quadrant.quadrant(pts[last-1],pts[last]);if(quad!==chainQuad)break;}last++;}return last-1;};MonotoneChainBuilder.getChains=function(){if(arguments.length===1){var pts=arguments[0];return MonotoneChainBuilder.getChains(pts,null);}else if(arguments.length===2){var pts=arguments[0],context=arguments[1];var mcList=new ArrayList();var startIndex=MonotoneChainBuilder.getChainStartIndices(pts);for(var i=0;i<startIndex.length-1;i++){var mc=new MonotoneChain(pts,startIndex[i],startIndex[i+1],context);mcList.add(mc);}return mcList;}};MonotoneChainBuilder.toIntArray=function(list){var array=new Array(list.size()).fill(null);for(var i=0;i<array.length;i++){array[i]=list.get(i).intValue();}return array;};function PointInRing(){}extend$1(PointInRing.prototype,{isInside:function isInside(pt){},interfaces_:function interfaces_(){return[];},getClass:function getClass(){return PointInRing;}});function MCPointInRing(){this.ring=null;this.tree=null;this.crossings=0;this.interval=new Interval();var ring=arguments[0];this.ring=ring;this.buildIndex();}extend$1(MCPointInRing.prototype,{testLineSegment:function testLineSegment(p,seg){var xInt=null;var x1=null;var y1=null;var x2=null;var y2=null;var p1=seg.p0;var p2=seg.p1;x1=p1.x-p.x;y1=p1.y-p.y;x2=p2.x-p.x;y2=p2.y-p.y;if(y1>0&&y2<=0||y2>0&&y1<=0){xInt=RobustDeterminant.signOfDet2x2(x1,y1,x2,y2)/(y2-y1);if(0.0<xInt){this.crossings++;}}},buildIndex:function buildIndex(){this.tree=new Bintree();var pts=CoordinateArrays.removeRepeatedPoints(this.ring.getCoordinates());var mcList=MonotoneChainBuilder.getChains(pts);for(var i=0;i<mcList.size();i++){var mc=mcList.get(i);var mcEnv=mc.getEnvelope();this.interval.min=mcEnv.getMinY();this.interval.max=mcEnv.getMaxY();this.tree.insert(this.interval,mc);}},testMonotoneChain:function testMonotoneChain(rayEnv,mcSelecter,mc){mc.select(rayEnv,mcSelecter);},isInside:function isInside(pt){this.crossings=0;var rayEnv=new Envelope(Double.NEGATIVE_INFINITY,Double.POSITIVE_INFINITY,pt.y,pt.y);this.interval.min=pt.y;this.interval.max=pt.y;var segs=this.tree.query(this.interval);var mcSelecter=new MCSelecter(this,pt);for(var i=segs.iterator();i.hasNext();){var mc=i.next();this.testMonotoneChain(rayEnv,mcSelecter,mc);}if(this.crossings%2===1){return true;}return false;},interfaces_:function interfaces_(){return[PointInRing];},getClass:function getClass(){return MCPointInRing;}});function MCSelecter(){MonotoneChainSelectAction.apply(this);this.mcp=null;this.p=null;var mcp=arguments[0],p=arguments[1];this.mcp=mcp;this.p=p;}inherits$1(MCSelecter,MonotoneChainSelectAction);extend$1(MCSelecter.prototype,{select:function select(){if(arguments.length===1){var ls=arguments[0];this.mcp.testLineSegment(this.p,ls);}else return MonotoneChainSelectAction.prototype.select.apply(this,arguments);},interfaces_:function interfaces_(){return[];},getClass:function getClass(){return MCSelecter;}});MCPointInRing.MCSelecter=MCSelecter;function PointLocator(){this.boundaryRule=BoundaryNodeRule.OGC_SFS_BOUNDARY_RULE;this.isIn=null;this.numBoundaries=null;if(arguments.length===0){}else if(arguments.length===1){var boundaryRule=arguments[0];if(boundaryRule===null)throw new IllegalArgumentException("Rule must be non-null");this.boundaryRule=boundaryRule;}}extend$1(PointLocator.prototype,{locateInternal:function locateInternal(){if(arguments[0]instanceof Coordinate&&arguments[1]instanceof Polygon){var p=arguments[0],poly=arguments[1];if(poly.isEmpty())return Location.EXTERIOR;var shell=poly.getExteriorRing();var shellLoc=this.locateInPolygonRing(p,shell);if(shellLoc===Location.EXTERIOR)return Location.EXTERIOR;if(shellLoc===Location.BOUNDARY)return Location.BOUNDARY;for(var i=0;i<poly.getNumInteriorRing();i++){var hole=poly.getInteriorRingN(i);var holeLoc=this.locateInPolygonRing(p,hole);if(holeLoc===Location.INTERIOR)return Location.EXTERIOR;if(holeLoc===Location.BOUNDARY)return Location.BOUNDARY;}return Location.INTERIOR;}else if(arguments[0]instanceof Coordinate&&arguments[1]instanceof LineString){var p=arguments[0],l=arguments[1];if(!l.getEnvelopeInternal().intersects(p))return Location.EXTERIOR;var pt=l.getCoordinates();if(!l.isClosed()){if(p.equals(pt[0])||p.equals(pt[pt.length-1])){return Location.BOUNDARY;}}if(CGAlgorithms.isOnLine(p,pt))return Location.INTERIOR;return Location.EXTERIOR;}else if(arguments[0]instanceof Coordinate&&arguments[1]instanceof Point){var p=arguments[0],pt=arguments[1];var ptCoord=pt.getCoordinate();if(ptCoord.equals2D(p))return Location.INTERIOR;return Location.EXTERIOR;}},locateInPolygonRing:function locateInPolygonRing(p,ring){if(!ring.getEnvelopeInternal().intersects(p))return Location.EXTERIOR;return CGAlgorithms.locatePointInRing(p,ring.getCoordinates());},intersects:function intersects(p,geom){return this.locate(p,geom)!==Location.EXTERIOR;},updateLocationInfo:function updateLocationInfo(loc){if(loc===Location.INTERIOR)this.isIn=true;if(loc===Location.BOUNDARY)this.numBoundaries++;},computeLocation:function computeLocation(p,geom){if(geom instanceof Point){this.updateLocationInfo(this.locateInternal(p,geom));}if(geom instanceof LineString){this.updateLocationInfo(this.locateInternal(p,geom));}else if(geom instanceof Polygon){this.updateLocationInfo(this.locateInternal(p,geom));}else if(geom instanceof MultiLineString){var ml=geom;for(var i=0;i<ml.getNumGeometries();i++){var l=ml.getGeometryN(i);this.updateLocationInfo(this.locateInternal(p,l));}}else if(geom instanceof MultiPolygon){var mpoly=geom;for(var i=0;i<mpoly.getNumGeometries();i++){var poly=mpoly.getGeometryN(i);this.updateLocationInfo(this.locateInternal(p,poly));}}else if(geom instanceof GeometryCollection){var geomi=new GeometryCollectionIterator(geom);while(geomi.hasNext()){var g2=geomi.next();if(g2!==geom)this.computeLocation(p,g2);}}},locate:function locate(p,geom){if(geom.isEmpty())return Location.EXTERIOR;if(geom instanceof LineString){return this.locateInternal(p,geom);}else if(geom instanceof Polygon){return this.locateInternal(p,geom);}this.isIn=false;this.numBoundaries=0;this.computeLocation(p,geom);if(this.boundaryRule.isInBoundary(this.numBoundaries))return Location.BOUNDARY;if(this.numBoundaries>0||this.isIn)return Location.INTERIOR;return Location.EXTERIOR;},interfaces_:function interfaces_(){return[];},getClass:function getClass(){return PointLocator;}});function MonotoneChain$1(){this.mce=null;this.chainIndex=null;var mce=arguments[0],chainIndex=arguments[1];this.mce=mce;this.chainIndex=chainIndex;}extend$1(MonotoneChain$1.prototype,{computeIntersections:function computeIntersections(mc,si){this.mce.computeIntersectsForChain(this.chainIndex,mc.mce,mc.chainIndex,si);},interfaces_:function interfaces_(){return[];},getClass:function getClass(){return MonotoneChain$1;}});function SweepLineEvent(){this.label=null;this.xValue=null;this.eventType=null;this.insertEvent=null;this.deleteEventIndex=null;this.obj=null;if(arguments.length===2){var x=arguments[0],insertEvent=arguments[1];this.eventType=SweepLineEvent.DELETE;this.xValue=x;this.insertEvent=insertEvent;}else if(arguments.length===3){var label=arguments[0],x=arguments[1],obj=arguments[2];this.eventType=SweepLineEvent.INSERT;this.label=label;this.xValue=x;this.obj=obj;}}extend$1(SweepLineEvent.prototype,{isDelete:function isDelete(){return this.eventType===SweepLineEvent.DELETE;},setDeleteEventIndex:function setDeleteEventIndex(deleteEventIndex){this.deleteEventIndex=deleteEventIndex;},getObject:function getObject(){return this.obj;},compareTo:function compareTo(o){var pe=o;if(this.xValue<pe.xValue)return-1;if(this.xValue>pe.xValue)return 1;if(this.eventType<pe.eventType)return-1;if(this.eventType>pe.eventType)return 1;return 0;},getInsertEvent:function getInsertEvent(){return this.insertEvent;},isInsert:function isInsert(){return this.eventType===SweepLineEvent.INSERT;},isSameLabel:function isSameLabel(ev){if(this.label===null)return false;return this.label===ev.label;},getDeleteEventIndex:function getDeleteEventIndex(){return this.deleteEventIndex;},interfaces_:function interfaces_(){return[Comparable];},getClass:function getClass(){return SweepLineEvent;}});SweepLineEvent.INSERT=1;SweepLineEvent.DELETE=2;function EdgeSetIntersector(){}extend$1(EdgeSetIntersector.prototype,{interfaces_:function interfaces_(){return[];},getClass:function getClass(){return EdgeSetIntersector;}});var Collections={reverseOrder:function reverseOrder(){return{compare:function compare(a,b){return b.compareTo(a);}};},min:function min(l){Collections.sort(l);return l.get(0);},sort:function sort(l,c){var a=l.toArray();if(c){Arrays.sort(a,c);}else{Arrays.sort(a);}var i=l.iterator();for(var pos=0,alen=a.length;pos<alen;pos++){i.next();i.set(a[pos]);}},singletonList:function singletonList(o){var arrayList=new ArrayList();arrayList.add(o);return arrayList;}};function SegmentIntersector(){this._hasIntersection=false;this.hasProper=false;this.hasProperInterior=false;this.properIntersectionPoint=null;this.li=null;this.includeProper=null;this.recordIsolated=null;this.isSelfIntersection=null;this.numIntersections=0;this.numTests=0;this.bdyNodes=null;this._isDone=false;this.isDoneWhenProperInt=false;var li=arguments[0],includeProper=arguments[1],recordIsolated=arguments[2];this.li=li;this.includeProper=includeProper;this.recordIsolated=recordIsolated;}extend$1(SegmentIntersector.prototype,{isTrivialIntersection:function isTrivialIntersection(e0,segIndex0,e1,segIndex1){if(e0===e1){if(this.li.getIntersectionNum()===1){if(SegmentIntersector.isAdjacentSegments(segIndex0,segIndex1))return true;if(e0.isClosed()){var maxSegIndex=e0.getNumPoints()-1;if(segIndex0===0&&segIndex1===maxSegIndex||segIndex1===0&&segIndex0===maxSegIndex){return true;}}}}return false;},getProperIntersectionPoint:function getProperIntersectionPoint(){return this.properIntersectionPoint;},setIsDoneIfProperInt:function setIsDoneIfProperInt(isDoneWhenProperInt){this.isDoneWhenProperInt=isDoneWhenProperInt;},hasProperInteriorIntersection:function hasProperInteriorIntersection(){return this.hasProperInterior;},isBoundaryPointInternal:function isBoundaryPointInternal(li,bdyNodes){for(var i=bdyNodes.iterator();i.hasNext();){var node=i.next();var pt=node.getCoordinate();if(li.isIntersection(pt))return true;}return false;},hasProperIntersection:function hasProperIntersection(){return this.hasProper;},hasIntersection:function hasIntersection(){return this._hasIntersection;},isDone:function isDone(){return this._isDone;},isBoundaryPoint:function isBoundaryPoint(li,bdyNodes){if(bdyNodes===null)return false;if(this.isBoundaryPointInternal(li,bdyNodes[0]))return true;if(this.isBoundaryPointInternal(li,bdyNodes[1]))return true;return false;},setBoundaryNodes:function setBoundaryNodes(bdyNodes0,bdyNodes1){this.bdyNodes=new Array(2).fill(null);this.bdyNodes[0]=bdyNodes0;this.bdyNodes[1]=bdyNodes1;},addIntersections:function addIntersections(e0,segIndex0,e1,segIndex1){if(e0===e1&&segIndex0===segIndex1)return null;this.numTests++;var p00=e0.getCoordinates()[segIndex0];var p01=e0.getCoordinates()[segIndex0+1];var p10=e1.getCoordinates()[segIndex1];var p11=e1.getCoordinates()[segIndex1+1];this.li.computeIntersection(p00,p01,p10,p11);if(this.li.hasIntersection()){if(this.recordIsolated){e0.setIsolated(false);e1.setIsolated(false);}this.numIntersections++;if(!this.isTrivialIntersection(e0,segIndex0,e1,segIndex1)){this._hasIntersection=true;if(this.includeProper||!this.li.isProper()){e0.addIntersections(this.li,segIndex0,0);e1.addIntersections(this.li,segIndex1,1);}if(this.li.isProper()){this.properIntersectionPoint=this.li.getIntersection(0).copy();this.hasProper=true;if(this.isDoneWhenProperInt){this._isDone=true;}if(!this.isBoundaryPoint(this.li,this.bdyNodes))this.hasProperInterior=true;}}}},interfaces_:function interfaces_(){return[];},getClass:function getClass(){return SegmentIntersector;}});SegmentIntersector.isAdjacentSegments=function(i1,i2){return Math.abs(i1-i2)===1;};function SimpleMCSweepLineIntersector(){EdgeSetIntersector.apply(this);this.events=new ArrayList();this.nOverlaps=null;}inherits$1(SimpleMCSweepLineIntersector,EdgeSetIntersector);extend$1(SimpleMCSweepLineIntersector.prototype,{prepareEvents:function prepareEvents(){Collections.sort(this.events);for(var i=0;i<this.events.size();i++){var ev=this.events.get(i);if(ev.isDelete()){ev.getInsertEvent().setDeleteEventIndex(i);}}},computeIntersections:function computeIntersections(){if(arguments.length===1){var si=arguments[0];this.nOverlaps=0;this.prepareEvents();for(var i=0;i<this.events.size();i++){var ev=this.events.get(i);if(ev.isInsert()){this.processOverlaps(i,ev.getDeleteEventIndex(),ev,si);}if(si.isDone()){break;}}}else if(arguments.length===3){if(arguments[2]instanceof SegmentIntersector&&hasInterface(arguments[0],List)&&hasInterface(arguments[1],List)){var edges0=arguments[0],edges1=arguments[1],si=arguments[2];this.addEdges(edges0,edges0);this.addEdges(edges1,edges1);this.computeIntersections(si);}else if(typeof arguments[2]==="boolean"&&hasInterface(arguments[0],List)&&arguments[1]instanceof SegmentIntersector){var edges=arguments[0],si=arguments[1],testAllSegments=arguments[2];if(testAllSegments)this.addEdges(edges,null);else this.addEdges(edges);this.computeIntersections(si);}}},addEdge:function addEdge(edge,edgeSet){var mce=edge.getMonotoneChainEdge();var startIndex=mce.getStartIndexes();for(var i=0;i<startIndex.length-1;i++){var mc=new MonotoneChain$1(mce,i);var insertEvent=new SweepLineEvent(edgeSet,mce.getMinX(i),mc);this.events.add(insertEvent);this.events.add(new SweepLineEvent(mce.getMaxX(i),insertEvent));}},processOverlaps:function processOverlaps(start,end,ev0,si){var mc0=ev0.getObject();for(var i=start;i<end;i++){var ev1=this.events.get(i);if(ev1.isInsert()){var mc1=ev1.getObject();if(!ev0.isSameLabel(ev1)){mc0.computeIntersections(mc1,si);this.nOverlaps++;}}}},addEdges:function addEdges(){if(arguments.length===1){var edges=arguments[0];for(var i=edges.iterator();i.hasNext();){var edge=i.next();this.addEdge(edge,edge);}}else if(arguments.length===2){var edges=arguments[0],edgeSet=arguments[1];for(var i=edges.iterator();i.hasNext();){var edge=i.next();this.addEdge(edge,edgeSet);}}},interfaces_:function interfaces_(){return[];},getClass:function getClass(){return SimpleMCSweepLineIntersector;}});function ItemVisitor(){}extend$1(ItemVisitor.prototype,{visitItem:function visitItem(item){},interfaces_:function interfaces_(){return[];},getClass:function getClass(){return ItemVisitor;}});function IntervalRTreeNode$1(){this.min=Double.POSITIVE_INFINITY;this.max=Double.NEGATIVE_INFINITY;}extend$1(IntervalRTreeNode$1.prototype,{getMin:function getMin(){return this.min;},intersects:function intersects(queryMin,queryMax){if(this.min>queryMax||this.max<queryMin)return false;return true;},getMax:function getMax(){return this.max;},toString:function toString(){return WKTWriter.toLineString(new Coordinate(this.min,0),new Coordinate(this.max,0));},interfaces_:function interfaces_(){return[];},getClass:function getClass(){return IntervalRTreeNode$1;}});function NodeComparator(){}extend$1(NodeComparator.prototype,{compare:function compare(o1,o2){var n1=o1;var n2=o2;var mid1=(n1.min+n1.max)/2;var mid2=(n2.min+n2.max)/2;if(mid1<mid2)return-1;if(mid1>mid2)return 1;return 0;},interfaces_:function interfaces_(){return[Comparator];},getClass:function getClass(){return NodeComparator;}});IntervalRTreeNode$1.NodeComparator=NodeComparator;function IntervalRTreeLeafNode(){IntervalRTreeNode$1.apply(this);this.item=null;var min=arguments[0],max=arguments[1],item=arguments[2];this.min=min;this.max=max;this.item=item;}inherits$1(IntervalRTreeLeafNode,IntervalRTreeNode$1);extend$1(IntervalRTreeLeafNode.prototype,{query:function query(queryMin,queryMax,visitor){if(!this.intersects(queryMin,queryMax))return null;visitor.visitItem(this.item);},interfaces_:function interfaces_(){return[];},getClass:function getClass(){return IntervalRTreeLeafNode;}});function IntervalRTreeBranchNode(){IntervalRTreeNode$1.apply(this);this.node1=null;this.node2=null;var n1=arguments[0],n2=arguments[1];this.node1=n1;this.node2=n2;this.buildExtent(this.node1,this.node2);}inherits$1(IntervalRTreeBranchNode,IntervalRTreeNode$1);extend$1(IntervalRTreeBranchNode.prototype,{buildExtent:function buildExtent(n1,n2){this.min=Math.min(n1.min,n2.min);this.max=Math.max(n1.max,n2.max);},query:function query(queryMin,queryMax,visitor){if(!this.intersects(queryMin,queryMax)){return null;}if(this.node1!==null)this.node1.query(queryMin,queryMax,visitor);if(this.node2!==null)this.node2.query(queryMin,queryMax,visitor);},interfaces_:function interfaces_(){return[];},getClass:function getClass(){return IntervalRTreeBranchNode;}});function SortedPackedIntervalRTree(){this.leaves=new ArrayList();this.root=null;this.level=0;}extend$1(SortedPackedIntervalRTree.prototype,{buildTree:function buildTree(){Collections.sort(this.leaves,new IntervalRTreeNode.NodeComparator());var src=this.leaves;var temp=null;var dest=new ArrayList();while(true){this.buildLevel(src,dest);if(dest.size()===1)return dest.get(0);temp=src;src=dest;dest=temp;}},insert:function insert(min,max,item){if(this.root!==null)throw new IllegalStateException("Index cannot be added to once it has been queried");this.leaves.add(new IntervalRTreeLeafNode(min,max,item));},query:function query(min,max,visitor){this.init();this.root.query(min,max,visitor);},buildRoot:function buildRoot(){if(this.root!==null)return null;this.root=this.buildTree();},printNode:function printNode(node){System.out.println(WKTWriter.toLineString(new Coordinate(node.min,this.level),new Coordinate(node.max,this.level)));},init:function init(){if(this.root!==null)return null;this.buildRoot();},buildLevel:function buildLevel(src,dest){this.level++;dest.clear();for(var i=0;i<src.size();i+=2){var n1=src.get(i);var n2=i+1<src.size()?src.get(i):null;if(n2===null){dest.add(n1);}else{var node=new IntervalRTreeBranchNode(src.get(i),src.get(i+1));dest.add(node);}}},interfaces_:function interfaces_(){return[];},getClass:function getClass(){return SortedPackedIntervalRTree;}});function LinearComponentExtracter(){this.lines=null;this.isForcedToLineString=false;if(arguments.length===1){var lines=arguments[0];this.lines=lines;}else if(arguments.length===2){var lines=arguments[0],isForcedToLineString=arguments[1];this.lines=lines;this.isForcedToLineString=isForcedToLineString;}}extend$1(LinearComponentExtracter.prototype,{filter:function filter(geom){if(this.isForcedToLineString&&geom instanceof LinearRing){var line=geom.getFactory().createLineString(geom.getCoordinateSequence());this.lines.add(line);return null;}if(geom instanceof LineString)this.lines.add(geom);},setForceToLineString:function setForceToLineString(isForcedToLineString){this.isForcedToLineString=isForcedToLineString;},interfaces_:function interfaces_(){return[GeometryComponentFilter];},getClass:function getClass(){return LinearComponentExtracter;}});LinearComponentExtracter.getGeometry=function(){if(arguments.length===1){var geom=arguments[0];return geom.getFactory().buildGeometry(LinearComponentExtracter.getLines(geom));}else if(arguments.length===2){var geom=arguments[0],forceToLineString=arguments[1];return geom.getFactory().buildGeometry(LinearComponentExtracter.getLines(geom,forceToLineString));}};LinearComponentExtracter.getLines=function(){if(arguments.length===1){var geom=arguments[0];return LinearComponentExtracter.getLines(geom,false);}else if(arguments.length===2){if(hasInterface(arguments[0],Collection)&&hasInterface(arguments[1],Collection)){var geoms=arguments[0],lines=arguments[1];for(var i=geoms.iterator();i.hasNext();){var g=i.next();LinearComponentExtracter.getLines(g,lines);}return lines;}else if(arguments[0]instanceof Geometry&&typeof arguments[1]==="boolean"){var geom=arguments[0],forceToLineString=arguments[1];var lines=new ArrayList();geom.apply(new LinearComponentExtracter(lines,forceToLineString));return lines;}else if(arguments[0]instanceof Geometry&&hasInterface(arguments[1],Collection)){var geom=arguments[0],lines=arguments[1];if(geom instanceof LineString){lines.add(geom);}else{geom.apply(new LinearComponentExtracter(lines));}return lines;}}else if(arguments.length===3){if(typeof arguments[2]==="boolean"&&hasInterface(arguments[0],Collection)&&hasInterface(arguments[1],Collection)){var geoms=arguments[0],lines=arguments[1],forceToLineString=arguments[2];for(var i=geoms.iterator();i.hasNext();){var g=i.next();LinearComponentExtracter.getLines(g,lines,forceToLineString);}return lines;}else if(typeof arguments[2]==="boolean"&&arguments[0]instanceof Geometry&&hasInterface(arguments[1],Collection)){var geom=arguments[0],lines=arguments[1],forceToLineString=arguments[2];geom.apply(new LinearComponentExtracter(lines,forceToLineString));return lines;}}};function ArrayListVisitor(){this.items=new ArrayList();}extend$1(ArrayListVisitor.prototype,{visitItem:function visitItem(item){this.items.add(item);},getItems:function getItems(){return this.items;},interfaces_:function interfaces_(){return[ItemVisitor];},getClass:function getClass(){return ArrayListVisitor;}});function IndexedPointInAreaLocator(){this.index=null;var g=arguments[0];if(!hasInterface(g,Polygonal))throw new IllegalArgumentException("Argument must be Polygonal");this.index=new IntervalIndexedGeometry(g);}extend$1(IndexedPointInAreaLocator.prototype,{locate:function locate(p){var rcc=new RayCrossingCounter(p);var visitor=new SegmentVisitor(rcc);this.index.query(p.y,p.y,visitor);return rcc.getLocation();},interfaces_:function interfaces_(){return[PointOnGeometryLocator];},getClass:function getClass(){return IndexedPointInAreaLocator;}});function SegmentVisitor(){this.counter=null;var counter=arguments[0];this.counter=counter;}extend$1(SegmentVisitor.prototype,{visitItem:function visitItem(item){var seg=item;this.counter.countSegment(seg.getCoordinate(0),seg.getCoordinate(1));},interfaces_:function interfaces_(){return[ItemVisitor];},getClass:function getClass(){return SegmentVisitor;}});function IntervalIndexedGeometry(){this.index=new SortedPackedIntervalRTree();var geom=arguments[0];this.init(geom);}extend$1(IntervalIndexedGeometry.prototype,{init:function init(geom){var lines=LinearComponentExtracter.getLines(geom);for(var i=lines.iterator();i.hasNext();){var line=i.next();var pts=line.getCoordinates();this.addLine(pts);}},addLine:function addLine(pts){for(var i=1;i<pts.length;i++){var seg=new LineSegment(pts[i-1],pts[i]);var min=Math.min(seg.p0.y,seg.p1.y);var max=Math.max(seg.p0.y,seg.p1.y);this.index.insert(min,max,seg);}},query:function query(){if(arguments.length===2){var min=arguments[0],max=arguments[1];var visitor=new ArrayListVisitor();this.index.query(min,max,visitor);return visitor.getItems();}else if(arguments.length===3){var min=arguments[0],max=arguments[1],visitor=arguments[2];this.index.query(min,max,visitor);}},interfaces_:function interfaces_(){return[];},getClass:function getClass(){return IntervalIndexedGeometry;}});IndexedPointInAreaLocator.SegmentVisitor=SegmentVisitor;IndexedPointInAreaLocator.IntervalIndexedGeometry=IntervalIndexedGeometry;function EdgeIntersection(){this.coord=null;this.segmentIndex=null;this.dist=null;var coord=arguments[0],segmentIndex=arguments[1],dist=arguments[2];this.coord=new Coordinate(coord);this.segmentIndex=segmentIndex;this.dist=dist;}extend$1(EdgeIntersection.prototype,{getSegmentIndex:function getSegmentIndex(){return this.segmentIndex;},getCoordinate:function getCoordinate(){return this.coord;},print:function print(out){out.print(this.coord);out.print(" seg # = "+this.segmentIndex);out.println(" dist = "+this.dist);},compareTo:function compareTo(obj){var other=obj;return this.compare(other.segmentIndex,other.dist);},isEndPoint:function isEndPoint(maxSegmentIndex){if(this.segmentIndex===0&&this.dist===0.0)return true;if(this.segmentIndex===maxSegmentIndex)return true;return false;},toString:function toString(){return this.coord+" seg # = "+this.segmentIndex+" dist = "+this.dist;},getDistance:function getDistance(){return this.dist;},compare:function compare(segmentIndex,dist){if(this.segmentIndex<segmentIndex)return-1;if(this.segmentIndex>segmentIndex)return 1;if(this.dist<dist)return-1;if(this.dist>dist)return 1;return 0;},interfaces_:function interfaces_(){return[Comparable];},getClass:function getClass(){return EdgeIntersection;}});function EdgeIntersectionList(){this.nodeMap=new TreeMap();this.edge=null;var edge=arguments[0];this.edge=edge;}extend$1(EdgeIntersectionList.prototype,{print:function print(out){out.println("Intersections:");for(var it=this.iterator();it.hasNext();){var ei=it.next();ei.print(out);}},iterator:function iterator(){return this.nodeMap.values().iterator();},addSplitEdges:function addSplitEdges(edgeList){this.addEndpoints();var it=this.iterator();var eiPrev=it.next();while(it.hasNext()){var ei=it.next();var newEdge=this.createSplitEdge(eiPrev,ei);edgeList.add(newEdge);eiPrev=ei;}},addEndpoints:function addEndpoints(){var maxSegIndex=this.edge.pts.length-1;this.add(this.edge.pts[0],0,0.0);this.add(this.edge.pts[maxSegIndex],maxSegIndex,0.0);},createSplitEdge:function createSplitEdge(ei0,ei1){var npts=ei1.segmentIndex-ei0.segmentIndex+2;var lastSegStartPt=this.edge.pts[ei1.segmentIndex];var useIntPt1=ei1.dist>0.0||!ei1.coord.equals2D(lastSegStartPt);if(!useIntPt1){npts--;}var pts=new Array(npts).fill(null);var ipt=0;pts[ipt++]=new Coordinate(ei0.coord);for(var i=ei0.segmentIndex+1;i<=ei1.segmentIndex;i++){pts[ipt++]=this.edge.pts[i];}if(useIntPt1)pts[ipt]=ei1.coord;return new Edge(pts,new Label(this.edge.label));},add:function add(intPt,segmentIndex,dist){var eiNew=new EdgeIntersection(intPt,segmentIndex,dist);var ei=this.nodeMap.get(eiNew);if(ei!==null){return ei;}this.nodeMap.put(eiNew,eiNew);return eiNew;},isIntersection:function isIntersection(pt){for(var it=this.iterator();it.hasNext();){var ei=it.next();if(ei.coord.equals(pt))return true;}return false;},interfaces_:function interfaces_(){return[];},getClass:function getClass(){return EdgeIntersectionList;}});function MonotoneChainIndexer(){}extend$1(MonotoneChainIndexer.prototype,{getChainStartIndices:function getChainStartIndices(pts){var start=0;var startIndexList=new ArrayList();startIndexList.add(new Integer(start));do{var last=this.findChainEnd(pts,start);startIndexList.add(new Integer(last));start=last;}while(start<pts.length-1);var startIndex=MonotoneChainIndexer.toIntArray(startIndexList);return startIndex;},findChainEnd:function findChainEnd(pts,start){var chainQuad=Quadrant.quadrant(pts[start],pts[start+1]);var last=start+1;while(last<pts.length){var quad=Quadrant.quadrant(pts[last-1],pts[last]);if(quad!==chainQuad)break;last++;}return last-1;},interfaces_:function interfaces_(){return[];},getClass:function getClass(){return MonotoneChainIndexer;}});MonotoneChainIndexer.toIntArray=function(list){var array=new Array(list.size()).fill(null);for(var i=0;i<array.length;i++){array[i]=list.get(i).intValue();}return array;};function MonotoneChainEdge(){this.e=null;this.pts=null;this.startIndex=null;this.env1=new Envelope();this.env2=new Envelope();var e=arguments[0];this.e=e;this.pts=e.getCoordinates();var mcb=new MonotoneChainIndexer();this.startIndex=mcb.getChainStartIndices(this.pts);}extend$1(MonotoneChainEdge.prototype,{getCoordinates:function getCoordinates(){return this.pts;},getMaxX:function getMaxX(chainIndex){var x1=this.pts[this.startIndex[chainIndex]].x;var x2=this.pts[this.startIndex[chainIndex+1]].x;return x1>x2?x1:x2;},getMinX:function getMinX(chainIndex){var x1=this.pts[this.startIndex[chainIndex]].x;var x2=this.pts[this.startIndex[chainIndex+1]].x;return x1<x2?x1:x2;},computeIntersectsForChain:function computeIntersectsForChain(){if(arguments.length===4){var chainIndex0=arguments[0],mce=arguments[1],chainIndex1=arguments[2],si=arguments[3];this.computeIntersectsForChain(this.startIndex[chainIndex0],this.startIndex[chainIndex0+1],mce,mce.startIndex[chainIndex1],mce.startIndex[chainIndex1+1],si);}else if(arguments.length===6){var start0=arguments[0],end0=arguments[1],mce=arguments[2],start1=arguments[3],end1=arguments[4],ei=arguments[5];var p00=this.pts[start0];var p01=this.pts[end0];var p10=mce.pts[start1];var p11=mce.pts[end1];if(end0-start0===1&&end1-start1===1){ei.addIntersections(this.e,start0,mce.e,start1);return null;}this.env1.init(p00,p01);this.env2.init(p10,p11);if(!this.env1.intersects(this.env2))return null;var mid0=Math.trunc((start0+end0)/2);var mid1=Math.trunc((start1+end1)/2);if(start0<mid0){if(start1<mid1)this.computeIntersectsForChain(start0,mid0,mce,start1,mid1,ei);if(mid1<end1)this.computeIntersectsForChain(start0,mid0,mce,mid1,end1,ei);}if(mid0<end0){if(start1<mid1)this.computeIntersectsForChain(mid0,end0,mce,start1,mid1,ei);if(mid1<end1)this.computeIntersectsForChain(mid0,end0,mce,mid1,end1,ei);}}},getStartIndexes:function getStartIndexes(){return this.startIndex;},computeIntersects:function computeIntersects(mce,si){for(var i=0;i<this.startIndex.length-1;i++){for(var j=0;j<mce.startIndex.length-1;j++){this.computeIntersectsForChain(i,mce,j,si);}}},interfaces_:function interfaces_(){return[];},getClass:function getClass(){return MonotoneChainEdge;}});function Depth(){this.depth=Array(2).fill().map(function(){return Array(3);});for(var i=0;i<2;i++){for(var j=0;j<3;j++){this.depth[i][j]=Depth.NULL_VALUE;}}}extend$1(Depth.prototype,{getDepth:function getDepth(geomIndex,posIndex){return this.depth[geomIndex][posIndex];},setDepth:function setDepth(geomIndex,posIndex,depthValue){this.depth[geomIndex][posIndex]=depthValue;},isNull:function isNull(){if(arguments.length===0){for(var i=0;i<2;i++){for(var j=0;j<3;j++){if(this.depth[i][j]!==Depth.NULL_VALUE)return false;}}return true;}else if(arguments.length===1){var geomIndex=arguments[0];return this.depth[geomIndex][1]===Depth.NULL_VALUE;}else if(arguments.length===2){var geomIndex=arguments[0],posIndex=arguments[1];return this.depth[geomIndex][posIndex]===Depth.NULL_VALUE;}},normalize:function normalize(){for(var i=0;i<2;i++){if(!this.isNull(i)){var minDepth=this.depth[i][1];if(this.depth[i][2]<minDepth)minDepth=this.depth[i][2];if(minDepth<0)minDepth=0;for(var j=1;j<3;j++){var newValue=0;if(this.depth[i][j]>minDepth)newValue=1;this.depth[i][j]=newValue;}}}},getDelta:function getDelta(geomIndex){return this.depth[geomIndex][Position.RIGHT]-this.depth[geomIndex][Position.LEFT];},getLocation:function getLocation(geomIndex,posIndex){if(this.depth[geomIndex][posIndex]<=0)return Location.EXTERIOR;return Location.INTERIOR;},toString:function toString(){return"A: "+this.depth[0][1]+","+this.depth[0][2]+" B: "+this.depth[1][1]+","+this.depth[1][2];},add:function add(){if(arguments.length===1){var lbl=arguments[0];for(var i=0;i<2;i++){for(var j=1;j<3;j++){var loc=lbl.getLocation(i,j);if(loc===Location.EXTERIOR||loc===Location.INTERIOR){if(this.isNull(i,j)){this.depth[i][j]=Depth.depthAtLocation(loc);}else this.depth[i][j]+=Depth.depthAtLocation(loc);}}}}else if(arguments.length===3){var geomIndex=arguments[0],posIndex=arguments[1],location=arguments[2];if(location===Location.INTERIOR)this.depth[geomIndex][posIndex]++;}},interfaces_:function interfaces_(){return[];},getClass:function getClass(){return Depth;}});Depth.depthAtLocation=function(location){if(location===Location.EXTERIOR)return 0;if(location===Location.INTERIOR)return 1;return Depth.NULL_VALUE;};Depth.NULL_VALUE=-1;function Edge(){GraphComponent.apply(this);this.pts=null;this.env=null;this.eiList=new EdgeIntersectionList(this);this.name=null;this.mce=null;this._isIsolated=true;this.depth=new Depth();this.depthDelta=0;if(arguments.length===1){var pts=arguments[0];Edge.call(this,pts,null);}else if(arguments.length===2){var pts=arguments[0],label=arguments[1];this.pts=pts;this.label=label;}}inherits$1(Edge,GraphComponent);extend$1(Edge.prototype,{getDepth:function getDepth(){return this.depth;},getCollapsedEdge:function getCollapsedEdge(){var newPts=new Array(2).fill(null);newPts[0]=this.pts[0];newPts[1]=this.pts[1];var newe=new Edge(newPts,Label.toLineLabel(this.label));return newe;},isIsolated:function isIsolated(){return this._isIsolated;},getCoordinates:function getCoordinates(){return this.pts;},setIsolated:function setIsolated(isIsolated){this._isIsolated=isIsolated;},setName:function setName(name){this.name=name;},equals:function equals(o){if(!(o instanceof Edge))return false;var e=o;if(this.pts.length!==e.pts.length)return false;var isEqualForward=true;var isEqualReverse=true;var iRev=this.pts.length;for(var i=0;i<this.pts.length;i++){if(!this.pts[i].equals2D(e.pts[i])){isEqualForward=false;}if(!this.pts[i].equals2D(e.pts[--iRev])){isEqualReverse=false;}if(!isEqualForward&&!isEqualReverse)return false;}return true;},getCoordinate:function getCoordinate(){if(arguments.length===0){if(this.pts.length>0)return this.pts[0];return null;}else if(arguments.length===1){var i=arguments[0];return this.pts[i];}},print:function print(out){out.print("edge "+this.name+": ");out.print("LINESTRING (");for(var i=0;i<this.pts.length;i++){if(i>0)out.print(",");out.print(this.pts[i].x+" "+this.pts[i].y);}out.print(")  "+this.label+" "+this.depthDelta);},computeIM:function computeIM(im){Edge.updateIM(this.label,im);},isCollapsed:function isCollapsed(){if(!this.label.isArea())return false;if(this.pts.length!==3)return false;if(this.pts[0].equals(this.pts[2]))return true;return false;},isClosed:function isClosed(){return this.pts[0].equals(this.pts[this.pts.length-1]);},getMaximumSegmentIndex:function getMaximumSegmentIndex(){return this.pts.length-1;},getDepthDelta:function getDepthDelta(){return this.depthDelta;},getNumPoints:function getNumPoints(){return this.pts.length;},printReverse:function printReverse(out){out.print("edge "+this.name+": ");for(var i=this.pts.length-1;i>=0;i--){out.print(this.pts[i]+" ");}out.println("");},getMonotoneChainEdge:function getMonotoneChainEdge(){if(this.mce===null)this.mce=new MonotoneChainEdge(this);return this.mce;},getEnvelope:function getEnvelope(){if(this.env===null){this.env=new Envelope();for(var i=0;i<this.pts.length;i++){this.env.expandToInclude(this.pts[i]);}}return this.env;},addIntersection:function addIntersection(li,segmentIndex,geomIndex,intIndex){var intPt=new Coordinate(li.getIntersection(intIndex));var normalizedSegmentIndex=segmentIndex;var dist=li.getEdgeDistance(geomIndex,intIndex);var nextSegIndex=normalizedSegmentIndex+1;if(nextSegIndex<this.pts.length){var nextPt=this.pts[nextSegIndex];if(intPt.equals2D(nextPt)){normalizedSegmentIndex=nextSegIndex;dist=0.0;}}var ei=this.eiList.add(intPt,normalizedSegmentIndex,dist);},toString:function toString(){var buf=new StringBuffer();buf.append("edge "+this.name+": ");buf.append("LINESTRING (");for(var i=0;i<this.pts.length;i++){if(i>0)buf.append(",");buf.append(this.pts[i].x+" "+this.pts[i].y);}buf.append(")  "+this.label+" "+this.depthDelta);return buf.toString();},isPointwiseEqual:function isPointwiseEqual(e){if(this.pts.length!==e.pts.length)return false;for(var i=0;i<this.pts.length;i++){if(!this.pts[i].equals2D(e.pts[i])){return false;}}return true;},setDepthDelta:function setDepthDelta(depthDelta){this.depthDelta=depthDelta;},getEdgeIntersectionList:function getEdgeIntersectionList(){return this.eiList;},addIntersections:function addIntersections(li,segmentIndex,geomIndex){for(var i=0;i<li.getIntersectionNum();i++){this.addIntersection(li,segmentIndex,geomIndex,i);}},interfaces_:function interfaces_(){return[];},getClass:function getClass(){return Edge;}});Edge.updateIM=function(){if(arguments.length===2){var label=arguments[0],im=arguments[1];im.setAtLeastIfValid(label.getLocation(0,Position.ON),label.getLocation(1,Position.ON),1);if(label.isArea()){im.setAtLeastIfValid(label.getLocation(0,Position.LEFT),label.getLocation(1,Position.LEFT),2);im.setAtLeastIfValid(label.getLocation(0,Position.RIGHT),label.getLocation(1,Position.RIGHT),2);}}else return GraphComponent.prototype.updateIM.apply(this,arguments);};function GeometryGraph(){PlanarGraph.apply(this);this.parentGeom=null;this.lineEdgeMap=new HashMap();this.boundaryNodeRule=null;this.useBoundaryDeterminationRule=true;this.argIndex=null;this.boundaryNodes=null;this._hasTooFewPoints=false;this.invalidPoint=null;this.areaPtLocator=null;this.ptLocator=new PointLocator();if(arguments.length===2){var argIndex=arguments[0],parentGeom=arguments[1];GeometryGraph.call(this,argIndex,parentGeom,BoundaryNodeRule.OGC_SFS_BOUNDARY_RULE);}else if(arguments.length===3){var argIndex=arguments[0],parentGeom=arguments[1],boundaryNodeRule=arguments[2];this.argIndex=argIndex;this.parentGeom=parentGeom;this.boundaryNodeRule=boundaryNodeRule;if(parentGeom!==null){this.add(parentGeom);}}}inherits$1(GeometryGraph,PlanarGraph);extend$1(GeometryGraph.prototype,{insertBoundaryPoint:function insertBoundaryPoint(argIndex,coord){var n=this.nodes.addNode(coord);var lbl=n.getLabel();var boundaryCount=1;var loc=Location.NONE;loc=lbl.getLocation(argIndex,Position.ON);if(loc===Location.BOUNDARY)boundaryCount++;var newLoc=GeometryGraph.determineBoundary(this.boundaryNodeRule,boundaryCount);lbl.setLocation(argIndex,newLoc);},computeSelfNodes:function computeSelfNodes(){if(arguments.length===2){var li=arguments[0],computeRingSelfNodes=arguments[1];return this.computeSelfNodes(li,computeRingSelfNodes,false);}else if(arguments.length===3){var li=arguments[0],computeRingSelfNodes=arguments[1],isDoneIfProperInt=arguments[2];var si=new SegmentIntersector(li,true,false);si.setIsDoneIfProperInt(isDoneIfProperInt);var esi=this.createEdgeSetIntersector();var isRings=this.parentGeom instanceof LinearRing||this.parentGeom instanceof Polygon||this.parentGeom instanceof MultiPolygon;var computeAllSegments=computeRingSelfNodes||!isRings;esi.computeIntersections(this.edges,si,computeAllSegments);this.addSelfIntersectionNodes(this.argIndex);return si;}},computeSplitEdges:function computeSplitEdges(edgelist){for(var i=this.edges.iterator();i.hasNext();){var e=i.next();e.eiList.addSplitEdges(edgelist);}},computeEdgeIntersections:function computeEdgeIntersections(g,li,includeProper){var si=new SegmentIntersector(li,includeProper,true);si.setBoundaryNodes(this.getBoundaryNodes(),g.getBoundaryNodes());var esi=this.createEdgeSetIntersector();esi.computeIntersections(this.edges,g.edges,si);return si;},getGeometry:function getGeometry(){return this.parentGeom;},getBoundaryNodeRule:function getBoundaryNodeRule(){return this.boundaryNodeRule;},hasTooFewPoints:function hasTooFewPoints(){return this._hasTooFewPoints;},addPoint:function addPoint(){if(arguments[0]instanceof Point){var p=arguments[0];var coord=p.getCoordinate();this.insertPoint(this.argIndex,coord,Location.INTERIOR);}else if(arguments[0]instanceof Coordinate){var pt=arguments[0];this.insertPoint(this.argIndex,pt,Location.INTERIOR);}},addPolygon:function addPolygon(p){this.addPolygonRing(p.getExteriorRing(),Location.EXTERIOR,Location.INTERIOR);for(var i=0;i<p.getNumInteriorRing();i++){var hole=p.getInteriorRingN(i);this.addPolygonRing(hole,Location.INTERIOR,Location.EXTERIOR);}},addEdge:function addEdge(e){this.insertEdge(e);var coord=e.getCoordinates();this.insertPoint(this.argIndex,coord[0],Location.BOUNDARY);this.insertPoint(this.argIndex,coord[coord.length-1],Location.BOUNDARY);},addLineString:function addLineString(line){var coord=CoordinateArrays.removeRepeatedPoints(line.getCoordinates());if(coord.length<2){this._hasTooFewPoints=true;this.invalidPoint=coord[0];return null;}var e=new Edge(coord,new Label(this.argIndex,Location.INTERIOR));this.lineEdgeMap.put(line,e);this.insertEdge(e);Assert.isTrue(coord.length>=2,"found LineString with single point");this.insertBoundaryPoint(this.argIndex,coord[0]);this.insertBoundaryPoint(this.argIndex,coord[coord.length-1]);},getInvalidPoint:function getInvalidPoint(){return this.invalidPoint;},getBoundaryPoints:function getBoundaryPoints(){var coll=this.getBoundaryNodes();var pts=new Array(coll.size()).fill(null);var i=0;for(var it=coll.iterator();it.hasNext();){var node=it.next();pts[i++]=node.getCoordinate().copy();}return pts;},getBoundaryNodes:function getBoundaryNodes(){if(this.boundaryNodes===null)this.boundaryNodes=this.nodes.getBoundaryNodes(this.argIndex);return this.boundaryNodes;},addSelfIntersectionNode:function addSelfIntersectionNode(argIndex,coord,loc){if(this.isBoundaryNode(argIndex,coord))return null;if(loc===Location.BOUNDARY&&this.useBoundaryDeterminationRule)this.insertBoundaryPoint(argIndex,coord);else this.insertPoint(argIndex,coord,loc);},addPolygonRing:function addPolygonRing(lr,cwLeft,cwRight){if(lr.isEmpty())return null;var coord=CoordinateArrays.removeRepeatedPoints(lr.getCoordinates());if(coord.length<4){this._hasTooFewPoints=true;this.invalidPoint=coord[0];return null;}var left=cwLeft;var right=cwRight;if(CGAlgorithms.isCCW(coord)){left=cwRight;right=cwLeft;}var e=new Edge(coord,new Label(this.argIndex,Location.BOUNDARY,left,right));this.lineEdgeMap.put(lr,e);this.insertEdge(e);this.insertPoint(this.argIndex,coord[0],Location.BOUNDARY);},insertPoint:function insertPoint(argIndex,coord,onLocation){var n=this.nodes.addNode(coord);var lbl=n.getLabel();if(lbl===null){n.label=new Label(argIndex,onLocation);}else lbl.setLocation(argIndex,onLocation);},createEdgeSetIntersector:function createEdgeSetIntersector(){return new SimpleMCSweepLineIntersector();},addSelfIntersectionNodes:function addSelfIntersectionNodes(argIndex){for(var i=this.edges.iterator();i.hasNext();){var e=i.next();var eLoc=e.getLabel().getLocation(argIndex);for(var eiIt=e.eiList.iterator();eiIt.hasNext();){var ei=eiIt.next();this.addSelfIntersectionNode(argIndex,ei.coord,eLoc);}}},add:function add(){if(arguments.length===1){var g=arguments[0];if(g.isEmpty())return null;if(g instanceof MultiPolygon)this.useBoundaryDeterminationRule=false;if(g instanceof Polygon)this.addPolygon(g);else if(g instanceof LineString)this.addLineString(g);else if(g instanceof Point)this.addPoint(g);else if(g instanceof MultiPoint)this.addCollection(g);else if(g instanceof MultiLineString)this.addCollection(g);else if(g instanceof MultiPolygon)this.addCollection(g);else if(g instanceof GeometryCollection)this.addCollection(g);else throw new UnsupportedOperationException(g.getClass().getName());}else return PlanarGraph.prototype.add.apply(this,arguments);},addCollection:function addCollection(gc){for(var i=0;i<gc.getNumGeometries();i++){var g=gc.getGeometryN(i);this.add(g);}},locate:function locate(pt){if(hasInterface(this.parentGeom,Polygonal)&&this.parentGeom.getNumGeometries()>50){if(this.areaPtLocator===null){this.areaPtLocator=new IndexedPointInAreaLocator(this.parentGeom);}return this.areaPtLocator.locate(pt);}return this.ptLocator.locate(pt,this.parentGeom);},findEdge:function findEdge(){if(arguments.length===1){var line=arguments[0];return this.lineEdgeMap.get(line);}else return PlanarGraph.prototype.findEdge.apply(this,arguments);},interfaces_:function interfaces_(){return[];},getClass:function getClass(){return GeometryGraph;}});GeometryGraph.determineBoundary=function(boundaryNodeRule,boundaryCount){return boundaryNodeRule.isInBoundary(boundaryCount)?Location.BOUNDARY:Location.INTERIOR;};function EdgeEndBuilder(){}extend$1(EdgeEndBuilder.prototype,{createEdgeEndForNext:function createEdgeEndForNext(edge,l,eiCurr,eiNext){var iNext=eiCurr.segmentIndex+1;if(iNext>=edge.getNumPoints()&&eiNext===null)return null;var pNext=edge.getCoordinate(iNext);if(eiNext!==null&&eiNext.segmentIndex===eiCurr.segmentIndex)pNext=eiNext.coord;var e=new EdgeEnd(edge,eiCurr.coord,pNext,new Label(edge.getLabel()));l.add(e);},createEdgeEndForPrev:function createEdgeEndForPrev(edge,l,eiCurr,eiPrev){var iPrev=eiCurr.segmentIndex;if(eiCurr.dist===0.0){if(iPrev===0)return null;iPrev--;}var pPrev=edge.getCoordinate(iPrev);if(eiPrev!==null&&eiPrev.segmentIndex>=iPrev)pPrev=eiPrev.coord;var label=new Label(edge.getLabel());label.flip();var e=new EdgeEnd(edge,eiCurr.coord,pPrev,label);l.add(e);},computeEdgeEnds:function computeEdgeEnds(){if(arguments.length===1){var edges=arguments[0];var l=new ArrayList();for(var i=edges;i.hasNext();){var e=i.next();this.computeEdgeEnds(e,l);}return l;}else if(arguments.length===2){var edge=arguments[0],l=arguments[1];var eiList=edge.getEdgeIntersectionList();eiList.addEndpoints();var it=eiList.iterator();var eiPrev=null;var eiCurr=null;if(!it.hasNext())return null;var eiNext=it.next();do{eiPrev=eiCurr;eiCurr=eiNext;eiNext=null;if(it.hasNext())eiNext=it.next();if(eiCurr!==null){this.createEdgeEndForPrev(edge,l,eiCurr,eiPrev);this.createEdgeEndForNext(edge,l,eiCurr,eiNext);}}while(eiCurr!==null);}},interfaces_:function interfaces_(){return[];},getClass:function getClass(){return EdgeEndBuilder;}});function EdgeEndBundle(){this.edgeEnds=new ArrayList();if(arguments.length===1){var e=arguments[0];EdgeEndBundle.call(this,null,e);}else if(arguments.length===2){var boundaryNodeRule=arguments[0],e=arguments[1];EdgeEnd.call(this,e.getEdge(),e.getCoordinate(),e.getDirectedCoordinate(),new Label(e.getLabel()));this.insert(e);}}inherits$1(EdgeEndBundle,EdgeEnd);extend$1(EdgeEndBundle.prototype,{insert:function insert(e){this.edgeEnds.add(e);},print:function print(out){out.println("EdgeEndBundle--> Label: "+this.label);for(var it=this.iterator();it.hasNext();){var ee=it.next();ee.print(out);out.println();}},iterator:function iterator(){return this.edgeEnds.iterator();},getEdgeEnds:function getEdgeEnds(){return this.edgeEnds;},computeLabelOn:function computeLabelOn(geomIndex,boundaryNodeRule){var boundaryCount=0;var foundInterior=false;for(var it=this.iterator();it.hasNext();){var e=it.next();var loc=e.getLabel().getLocation(geomIndex);if(loc===Location.BOUNDARY)boundaryCount++;if(loc===Location.INTERIOR)foundInterior=true;}var loc=Location.NONE;if(foundInterior)loc=Location.INTERIOR;if(boundaryCount>0){loc=GeometryGraph.determineBoundary(boundaryNodeRule,boundaryCount);}this.label.setLocation(geomIndex,loc);},computeLabelSide:function computeLabelSide(geomIndex,side){for(var it=this.iterator();it.hasNext();){var e=it.next();if(e.getLabel().isArea()){var loc=e.getLabel().getLocation(geomIndex,side);if(loc===Location.INTERIOR){this.label.setLocation(geomIndex,side,Location.INTERIOR);return null;}else if(loc===Location.EXTERIOR)this.label.setLocation(geomIndex,side,Location.EXTERIOR);}}},getLabel:function getLabel(){return this.label;},computeLabelSides:function computeLabelSides(geomIndex){this.computeLabelSide(geomIndex,Position.LEFT);this.computeLabelSide(geomIndex,Position.RIGHT);},updateIM:function updateIM(im){Edge.updateIM(this.label,im);},computeLabel:function computeLabel(boundaryNodeRule){var isArea=false;for(var it=this.iterator();it.hasNext();){var e=it.next();if(e.getLabel().isArea())isArea=true;}if(isArea)this.label=new Label(Location.NONE,Location.NONE,Location.NONE);else this.label=new Label(Location.NONE);for(var i=0;i<2;i++){this.computeLabelOn(i,boundaryNodeRule);if(isArea)this.computeLabelSides(i);}},interfaces_:function interfaces_(){return[];},getClass:function getClass(){return EdgeEndBundle;}});function EdgeEndBundleStar(){EdgeEndStar.apply(this);}inherits$1(EdgeEndBundleStar,EdgeEndStar);extend$1(EdgeEndBundleStar.prototype,{updateIM:function updateIM(im){for(var it=this.iterator();it.hasNext();){var esb=it.next();esb.updateIM(im);}},insert:function insert(e){var eb=this.edgeMap.get(e);if(eb===null){eb=new EdgeEndBundle(e);this.insertEdgeEnd(e,eb);}else{eb.insert(e);}},interfaces_:function interfaces_(){return[];},getClass:function getClass(){return EdgeEndBundleStar;}});function RelateNode(){var coord=arguments[0],edges=arguments[1];Node.call(this,coord,edges);}inherits$1(RelateNode,Node);extend$1(RelateNode.prototype,{updateIMFromEdges:function updateIMFromEdges(im){this.edges.updateIM(im);},computeIM:function computeIM(im){im.setAtLeastIfValid(this.label.getLocation(0),this.label.getLocation(1),0);},interfaces_:function interfaces_(){return[];},getClass:function getClass(){return RelateNode;}});function RelateNodeFactory(){NodeFactory.apply(this);}inherits$1(RelateNodeFactory,NodeFactory);extend$1(RelateNodeFactory.prototype,{createNode:function createNode(coord){return new RelateNode(coord,new EdgeEndBundleStar());},interfaces_:function interfaces_(){return[];},getClass:function getClass(){return RelateNodeFactory;}});function RelateNodeGraph(){this.nodes=new NodeMap(new RelateNodeFactory());}extend$1(RelateNodeGraph.prototype,{insertEdgeEnds:function insertEdgeEnds(ee){for(var i=ee.iterator();i.hasNext();){var e=i.next();this.nodes.add(e);}},getNodeIterator:function getNodeIterator(){return this.nodes.iterator();},copyNodesAndLabels:function copyNodesAndLabels(geomGraph,argIndex){for(var nodeIt=geomGraph.getNodeIterator();nodeIt.hasNext();){var graphNode=nodeIt.next();var newNode=this.nodes.addNode(graphNode.getCoordinate());newNode.setLabel(argIndex,graphNode.getLabel().getLocation(argIndex));}},build:function build(geomGraph){this.computeIntersectionNodes(geomGraph,0);this.copyNodesAndLabels(geomGraph,0);var eeBuilder=new EdgeEndBuilder();var eeList=eeBuilder.computeEdgeEnds(geomGraph.getEdgeIterator());this.insertEdgeEnds(eeList);},computeIntersectionNodes:function computeIntersectionNodes(geomGraph,argIndex){for(var edgeIt=geomGraph.getEdgeIterator();edgeIt.hasNext();){var e=edgeIt.next();var eLoc=e.getLabel().getLocation(argIndex);for(var eiIt=e.getEdgeIntersectionList().iterator();eiIt.hasNext();){var ei=eiIt.next();var n=this.nodes.addNode(ei.coord);if(eLoc===Location.BOUNDARY)n.setLabelBoundary(argIndex);else{if(n.getLabel().isNull(argIndex))n.setLabel(argIndex,Location.INTERIOR);}}}},interfaces_:function interfaces_(){return[];},getClass:function getClass(){return RelateNodeGraph;}});function ConsistentAreaTester(){this.li=new RobustLineIntersector();this.geomGraph=null;this.nodeGraph=new RelateNodeGraph();this.invalidPoint=null;var geomGraph=arguments[0];this.geomGraph=geomGraph;}extend$1(ConsistentAreaTester.prototype,{isNodeEdgeAreaLabelsConsistent:function isNodeEdgeAreaLabelsConsistent(){for(var nodeIt=this.nodeGraph.getNodeIterator();nodeIt.hasNext();){var node=nodeIt.next();if(!node.getEdges().isAreaLabelsConsistent(this.geomGraph)){this.invalidPoint=node.getCoordinate().copy();return false;}}return true;},getInvalidPoint:function getInvalidPoint(){return this.invalidPoint;},hasDuplicateRings:function hasDuplicateRings(){for(var nodeIt=this.nodeGraph.getNodeIterator();nodeIt.hasNext();){var node=nodeIt.next();for(var i=node.getEdges().iterator();i.hasNext();){var eeb=i.next();if(eeb.getEdgeEnds().size()>1){this.invalidPoint=eeb.getEdge().getCoordinate(0);return true;}}}return false;},isNodeConsistentArea:function isNodeConsistentArea(){var intersector=this.geomGraph.computeSelfNodes(this.li,true,true);if(intersector.hasProperIntersection()){this.invalidPoint=intersector.getProperIntersectionPoint();return false;}this.nodeGraph.build(this.geomGraph);return this.isNodeEdgeAreaLabelsConsistent();},interfaces_:function interfaces_(){return[];},getClass:function getClass(){return ConsistentAreaTester;}});function Boundable(){}extend$1(Boundable.prototype,{getBounds:function getBounds(){},interfaces_:function interfaces_(){return[];},getClass:function getClass(){return Boundable;}});function ItemBoundable(){this.bounds=null;this.item=null;var bounds=arguments[0],item=arguments[1];this.bounds=bounds;this.item=item;}extend$1(ItemBoundable.prototype,{getItem:function getItem(){return this.item;},getBounds:function getBounds(){return this.bounds;},interfaces_:function interfaces_(){return[Boundable,Serializable];},getClass:function getClass(){return ItemBoundable;}});function PriorityQueue(){this._size=null;this.items=null;this._size=0;this.items=new ArrayList();this.items.add(null);}extend$1(PriorityQueue.prototype,{poll:function poll(){if(this.isEmpty())return null;var minItem=this.items.get(1);this.items.set(1,this.items.get(this._size));this._size-=1;this.reorder(1);return minItem;},size:function size(){return this._size;},reorder:function reorder(hole){var child=null;var tmp=this.items.get(hole);for(;hole*2<=this._size;hole=child){child=hole*2;if(child!==this._size&&this.items.get(child+1).compareTo(this.items.get(child))<0)child++;if(this.items.get(child).compareTo(tmp)<0)this.items.set(hole,this.items.get(child));else break;}this.items.set(hole,tmp);},clear:function clear(){this._size=0;this.items.clear();},isEmpty:function isEmpty(){return this._size===0;},add:function add(x){this.items.add(null);this._size+=1;var hole=this._size;this.items.set(0,x);for(;x.compareTo(this.items.get(Math.trunc(hole/2)))<0;hole/=2){this.items.set(hole,this.items.get(Math.trunc(hole/2)));}this.items.set(hole,x);},interfaces_:function interfaces_(){return[];},getClass:function getClass(){return PriorityQueue;}});function SpatialIndex(){}extend$1(SpatialIndex.prototype,{insert:function insert(itemEnv,item){},remove:function remove(itemEnv,item){},query:function query(){},interfaces_:function interfaces_(){return[];},getClass:function getClass(){return SpatialIndex;}});function AbstractNode(){this.childBoundables=new ArrayList();this.bounds=null;this.level=null;if(arguments.length===0){}else if(arguments.length===1){var level=arguments[0];this.level=level;}}extend$1(AbstractNode.prototype,{getLevel:function getLevel(){return this.level;},size:function size(){return this.childBoundables.size();},getChildBoundables:function getChildBoundables(){return this.childBoundables;},addChildBoundable:function addChildBoundable(childBoundable){Assert.isTrue(this.bounds===null);this.childBoundables.add(childBoundable);},isEmpty:function isEmpty(){return this.childBoundables.isEmpty();},getBounds:function getBounds(){if(this.bounds===null){this.bounds=this.computeBounds();}return this.bounds;},interfaces_:function interfaces_(){return[Boundable,Serializable];},getClass:function getClass(){return AbstractNode;}});AbstractNode.serialVersionUID=6493722185909573708;function BoundablePair(){this.boundable1=null;this.boundable2=null;this._distance=null;this.itemDistance=null;var boundable1=arguments[0],boundable2=arguments[1],itemDistance=arguments[2];this.boundable1=boundable1;this.boundable2=boundable2;this.itemDistance=itemDistance;this._distance=this.distance();}extend$1(BoundablePair.prototype,{expandToQueue:function expandToQueue(priQ,minDistance){var isComp1=BoundablePair.isComposite(this.boundable1);var isComp2=BoundablePair.isComposite(this.boundable2);if(isComp1&&isComp2){if(BoundablePair.area(this.boundable1)>BoundablePair.area(this.boundable2)){this.expand(this.boundable1,this.boundable2,priQ,minDistance);return null;}else{this.expand(this.boundable2,this.boundable1,priQ,minDistance);return null;}}else if(isComp1){this.expand(this.boundable1,this.boundable2,priQ,minDistance);return null;}else if(isComp2){this.expand(this.boundable2,this.boundable1,priQ,minDistance);return null;}throw new IllegalArgumentException("neither boundable is composite");},isLeaves:function isLeaves(){return!(BoundablePair.isComposite(this.boundable1)||BoundablePair.isComposite(this.boundable2));},compareTo:function compareTo(o){var nd=o;if(this._distance<nd._distance)return-1;if(this._distance>nd._distance)return 1;return 0;},expand:function expand(bndComposite,bndOther,priQ,minDistance){var children=bndComposite.getChildBoundables();for(var i=children.iterator();i.hasNext();){var child=i.next();var bp=new BoundablePair(child,bndOther,this.itemDistance);if(bp.getDistance()<minDistance){priQ.add(bp);}}},getBoundable:function getBoundable(i){if(i===0)return this.boundable1;return this.boundable2;},getDistance:function getDistance(){return this._distance;},distance:function distance(){if(this.isLeaves()){return this.itemDistance.distance(this.boundable1,this.boundable2);}return this.boundable1.getBounds().distance(this.boundable2.getBounds());},interfaces_:function interfaces_(){return[Comparable];},getClass:function getClass(){return BoundablePair;}});BoundablePair.area=function(b){return b.getBounds().getArea();};BoundablePair.isComposite=function(item){return item instanceof AbstractNode;};function AbstractSTRtree(){this.root=null;this.built=false;this.itemBoundables=new ArrayList();this.nodeCapacity=null;if(arguments.length===0){AbstractSTRtree.call(this,AbstractSTRtree.DEFAULT_NODE_CAPACITY);}else if(arguments.length===1){var nodeCapacity=arguments[0];Assert.isTrue(nodeCapacity>1,"Node capacity must be greater than 1");this.nodeCapacity=nodeCapacity;}}extend$1(AbstractSTRtree.prototype,{getNodeCapacity:function getNodeCapacity(){return this.nodeCapacity;},lastNode:function lastNode(nodes){return nodes.get(nodes.size()-1);},size:function size(){if(arguments.length===0){if(this.isEmpty()){return 0;}this.build();return this.size(this.root);}else if(arguments.length===1){var node=arguments[0];var size=0;for(var i=node.getChildBoundables().iterator();i.hasNext();){var childBoundable=i.next();if(childBoundable instanceof AbstractNode){size+=this.size(childBoundable);}else if(childBoundable instanceof ItemBoundable){size+=1;}}return size;}},removeItem:function removeItem(node,item){var childToRemove=null;for(var i=node.getChildBoundables().iterator();i.hasNext();){var childBoundable=i.next();if(childBoundable instanceof ItemBoundable){if(childBoundable.getItem()===item)childToRemove=childBoundable;}}if(childToRemove!==null){node.getChildBoundables().remove(childToRemove);return true;}return false;},itemsTree:function itemsTree(){if(arguments.length===0){this.build();var valuesTree=this.itemsTree(this.root);if(valuesTree===null)return new ArrayList();return valuesTree;}else if(arguments.length===1){var node=arguments[0];var valuesTreeForNode=new ArrayList();for(var i=node.getChildBoundables().iterator();i.hasNext();){var childBoundable=i.next();if(childBoundable instanceof AbstractNode){var valuesTreeForChild=this.itemsTree(childBoundable);if(valuesTreeForChild!==null)valuesTreeForNode.add(valuesTreeForChild);}else if(childBoundable instanceof ItemBoundable){valuesTreeForNode.add(childBoundable.getItem());}else{Assert.shouldNeverReachHere();}}if(valuesTreeForNode.size()<=0)return null;return valuesTreeForNode;}},insert:function insert(bounds,item){Assert.isTrue(!this.built,"Cannot insert items into an STR packed R-tree after it has been built.");this.itemBoundables.add(new ItemBoundable(bounds,item));},boundablesAtLevel:function boundablesAtLevel(){if(arguments.length===1){var level=arguments[0];var boundables=new ArrayList();this.boundablesAtLevel(level,this.root,boundables);return boundables;}else if(arguments.length===3){var level=arguments[0],top=arguments[1],boundables=arguments[2];Assert.isTrue(level>-2);if(top.getLevel()===level){boundables.add(top);return null;}for(var i=top.getChildBoundables().iterator();i.hasNext();){var boundable=i.next();if(boundable instanceof AbstractNode){this.boundablesAtLevel(level,boundable,boundables);}else{Assert.isTrue(boundable instanceof ItemBoundable);if(level===-1){boundables.add(boundable);}}}return null;}},query:function query(){if(arguments.length===1){var searchBounds=arguments[0];this.build();var matches=new ArrayList();if(this.isEmpty()){return matches;}if(this.getIntersectsOp().intersects(this.root.getBounds(),searchBounds)){this.query(searchBounds,this.root,matches);}return matches;}else if(arguments.length===2){var searchBounds=arguments[0],visitor=arguments[1];this.build();if(this.isEmpty()){return null;}if(this.getIntersectsOp().intersects(this.root.getBounds(),searchBounds)){this.query(searchBounds,this.root,visitor);}}else if(arguments.length===3){if(hasInterface(arguments[2],ItemVisitor)&&arguments[0]instanceof Object&&arguments[1]instanceof AbstractNode){var searchBounds=arguments[0],node=arguments[1],visitor=arguments[2];var childBoundables=node.getChildBoundables();for(var i=0;i<childBoundables.size();i++){var childBoundable=childBoundables.get(i);if(!this.getIntersectsOp().intersects(childBoundable.getBounds(),searchBounds)){continue;}if(childBoundable instanceof AbstractNode){this.query(searchBounds,childBoundable,visitor);}else if(childBoundable instanceof ItemBoundable){visitor.visitItem(childBoundable.getItem());}else{Assert.shouldNeverReachHere();}}}else if(hasInterface(arguments[2],List)&&arguments[0]instanceof Object&&arguments[1]instanceof AbstractNode){var searchBounds=arguments[0],node=arguments[1],matches=arguments[2];var childBoundables=node.getChildBoundables();for(var i=0;i<childBoundables.size();i++){var childBoundable=childBoundables.get(i);if(!this.getIntersectsOp().intersects(childBoundable.getBounds(),searchBounds)){continue;}if(childBoundable instanceof AbstractNode){this.query(searchBounds,childBoundable,matches);}else if(childBoundable instanceof ItemBoundable){matches.add(childBoundable.getItem());}else{Assert.shouldNeverReachHere();}}}}},build:function build(){if(this.built)return null;this.root=this.itemBoundables.isEmpty()?this.createNode(0):this.createHigherLevels(this.itemBoundables,-1);this.itemBoundables=null;this.built=true;},getRoot:function getRoot(){this.build();return this.root;},remove:function remove(){if(arguments.length===2){var searchBounds=arguments[0],item=arguments[1];this.build();if(this.getIntersectsOp().intersects(this.root.getBounds(),searchBounds)){return this.remove(searchBounds,this.root,item);}return false;}else if(arguments.length===3){var searchBounds=arguments[0],node=arguments[1],item=arguments[2];var found=this.removeItem(node,item);if(found)return true;var childToPrune=null;for(var i=node.getChildBoundables().iterator();i.hasNext();){var childBoundable=i.next();if(!this.getIntersectsOp().intersects(childBoundable.getBounds(),searchBounds)){continue;}if(childBoundable instanceof AbstractNode){found=this.remove(searchBounds,childBoundable,item);if(found){childToPrune=childBoundable;break;}}}if(childToPrune!==null){if(childToPrune.getChildBoundables().isEmpty()){node.getChildBoundables().remove(childToPrune);}}return found;}},createHigherLevels:function createHigherLevels(boundablesOfALevel,level){Assert.isTrue(!boundablesOfALevel.isEmpty());var parentBoundables=this.createParentBoundables(boundablesOfALevel,level+1);if(parentBoundables.size()===1){return parentBoundables.get(0);}return this.createHigherLevels(parentBoundables,level+1);},depth:function depth(){if(arguments.length===0){if(this.isEmpty()){return 0;}this.build();return this.depth(this.root);}else if(arguments.length===1){var node=arguments[0];var maxChildDepth=0;for(var i=node.getChildBoundables().iterator();i.hasNext();){var childBoundable=i.next();if(childBoundable instanceof AbstractNode){var childDepth=this.depth(childBoundable);if(childDepth>maxChildDepth)maxChildDepth=childDepth;}}return maxChildDepth+1;}},createParentBoundables:function createParentBoundables(childBoundables,newLevel){Assert.isTrue(!childBoundables.isEmpty());var parentBoundables=new ArrayList();parentBoundables.add(this.createNode(newLevel));var sortedChildBoundables=new ArrayList(childBoundables);Collections.sort(sortedChildBoundables,this.getComparator());for(var i=sortedChildBoundables.iterator();i.hasNext();){var childBoundable=i.next();if(this.lastNode(parentBoundables).getChildBoundables().size()===this.getNodeCapacity()){parentBoundables.add(this.createNode(newLevel));}this.lastNode(parentBoundables).addChildBoundable(childBoundable);}return parentBoundables;},isEmpty:function isEmpty(){if(!this.built)return this.itemBoundables.isEmpty();return this.root.isEmpty();},interfaces_:function interfaces_(){return[Serializable];},getClass:function getClass(){return AbstractSTRtree;}});AbstractSTRtree.compareDoubles=function(a,b){return a>b?1:a<b?-1:0;};function IntersectsOp$1(){}AbstractSTRtree.IntersectsOp=IntersectsOp$1;AbstractSTRtree.serialVersionUID=-3886435814360241337;AbstractSTRtree.DEFAULT_NODE_CAPACITY=10;function ItemDistance(){}extend$1(ItemDistance.prototype,{distance:function distance(item1,item2){},interfaces_:function interfaces_(){return[];},getClass:function getClass(){return ItemDistance;}});function STRtree(){if(arguments.length===0){STRtree.call(this,STRtree.DEFAULT_NODE_CAPACITY);}else if(arguments.length===1){var nodeCapacity=arguments[0];AbstractSTRtree.call(this,nodeCapacity);}}inherits$1(STRtree,AbstractSTRtree);extend$1(STRtree.prototype,{createParentBoundablesFromVerticalSlices:function createParentBoundablesFromVerticalSlices(verticalSlices,newLevel){Assert.isTrue(verticalSlices.length>0);var parentBoundables=new ArrayList();for(var i=0;i<verticalSlices.length;i++){parentBoundables.addAll(this.createParentBoundablesFromVerticalSlice(verticalSlices[i],newLevel));}return parentBoundables;},createNode:function createNode(level){return new STRtreeNode(level);},size:function size(){if(arguments.length===0){return AbstractSTRtree.prototype.size.call(this);}else return AbstractSTRtree.prototype.size.apply(this,arguments);},insert:function insert(){if(arguments.length===2){var itemEnv=arguments[0],item=arguments[1];if(itemEnv.isNull()){return null;}AbstractSTRtree.prototype.insert.call(this,itemEnv,item);}else return AbstractSTRtree.prototype.insert.apply(this,arguments);},getIntersectsOp:function getIntersectsOp(){return STRtree.intersectsOp;},verticalSlices:function verticalSlices(childBoundables,sliceCount){var sliceCapacity=Math.trunc(Math.ceil(childBoundables.size()/sliceCount));var slices=new Array(sliceCount).fill(null);var i=childBoundables.iterator();for(var j=0;j<sliceCount;j++){slices[j]=new ArrayList();var boundablesAddedToSlice=0;while(i.hasNext()&&boundablesAddedToSlice<sliceCapacity){var childBoundable=i.next();slices[j].add(childBoundable);boundablesAddedToSlice++;}}return slices;},query:function query(){if(arguments.length===1){var searchEnv=arguments[0];return AbstractSTRtree.prototype.query.call(this,searchEnv);}else if(arguments.length===2){var searchEnv=arguments[0],visitor=arguments[1];AbstractSTRtree.prototype.query.call(this,searchEnv,visitor);}else if(arguments.length===3){if(hasInterface(arguments[2],ItemVisitor)&&arguments[0]instanceof Object&&arguments[1]instanceof AbstractNode){var searchBounds=arguments[0],node=arguments[1],visitor=arguments[2];AbstractSTRtree.prototype.query.call(this,searchBounds,node,visitor);}else if(hasInterface(arguments[2],List)&&arguments[0]instanceof Object&&arguments[1]instanceof AbstractNode){var searchBounds=arguments[0],node=arguments[1],matches=arguments[2];AbstractSTRtree.prototype.query.call(this,searchBounds,node,matches);}}},getComparator:function getComparator(){return STRtree.yComparator;},createParentBoundablesFromVerticalSlice:function createParentBoundablesFromVerticalSlice(childBoundables,newLevel){return AbstractSTRtree.prototype.createParentBoundables.call(this,childBoundables,newLevel);},remove:function remove(){if(arguments.length===2){var itemEnv=arguments[0],item=arguments[1];return AbstractSTRtree.prototype.remove.call(this,itemEnv,item);}else return AbstractSTRtree.prototype.remove.apply(this,arguments);},depth:function depth(){if(arguments.length===0){return AbstractSTRtree.prototype.depth.call(this);}else return AbstractSTRtree.prototype.depth.apply(this,arguments);},createParentBoundables:function createParentBoundables(childBoundables,newLevel){Assert.isTrue(!childBoundables.isEmpty());var minLeafCount=Math.trunc(Math.ceil(childBoundables.size()/this.getNodeCapacity()));var sortedChildBoundables=new ArrayList(childBoundables);Collections.sort(sortedChildBoundables,STRtree.xComparator);var verticalSlices=this.verticalSlices(sortedChildBoundables,Math.trunc(Math.ceil(Math.sqrt(minLeafCount))));return this.createParentBoundablesFromVerticalSlices(verticalSlices,newLevel);},nearestNeighbour:function nearestNeighbour(){if(arguments.length===1){if(hasInterface(arguments[0],ItemDistance)){var itemDist=arguments[0];var bp=new BoundablePair(this.getRoot(),this.getRoot(),itemDist);return this.nearestNeighbour(bp);}else if(arguments[0]instanceof BoundablePair){var initBndPair=arguments[0];return this.nearestNeighbour(initBndPair,Double.POSITIVE_INFINITY);}}else if(arguments.length===2){if(arguments[0]instanceof STRtree&&hasInterface(arguments[1],ItemDistance)){var tree=arguments[0],itemDist=arguments[1];var bp=new BoundablePair(this.getRoot(),tree.getRoot(),itemDist);return this.nearestNeighbour(bp);}else if(arguments[0]instanceof BoundablePair&&typeof arguments[1]==="number"){var initBndPair=arguments[0],maxDistance=arguments[1];var distanceLowerBound=maxDistance;var minPair=null;var priQ=new PriorityQueue();priQ.add(initBndPair);while(!priQ.isEmpty()&&distanceLowerBound>0.0){var bndPair=priQ.poll();var currentDistance=bndPair.getDistance();if(currentDistance>=distanceLowerBound)break;if(bndPair.isLeaves()){distanceLowerBound=currentDistance;minPair=bndPair;}else{bndPair.expandToQueue(priQ,distanceLowerBound);}}return[minPair.getBoundable(0).getItem(),minPair.getBoundable(1).getItem()];}}else if(arguments.length===3){var env=arguments[0],item=arguments[1],itemDist=arguments[2];var bnd=new ItemBoundable(env,item);var bp=new BoundablePair(this.getRoot(),bnd,itemDist);return this.nearestNeighbour(bp)[0];}},interfaces_:function interfaces_(){return[SpatialIndex,Serializable];},getClass:function getClass(){return STRtree;}});STRtree.centreX=function(e){return STRtree.avg(e.getMinX(),e.getMaxX());};STRtree.avg=function(a,b){return(a+b)/2;};STRtree.centreY=function(e){return STRtree.avg(e.getMinY(),e.getMaxY());};function STRtreeNode(){var level=arguments[0];AbstractNode.call(this,level);}inherits$1(STRtreeNode,AbstractNode);extend$1(STRtreeNode.prototype,{computeBounds:function computeBounds(){var bounds=null;for(var i=this.getChildBoundables().iterator();i.hasNext();){var childBoundable=i.next();if(bounds===null){bounds=new Envelope(childBoundable.getBounds());}else{bounds.expandToInclude(childBoundable.getBounds());}}return bounds;},interfaces_:function interfaces_(){return[];},getClass:function getClass(){return STRtreeNode;}});STRtree.STRtreeNode=STRtreeNode;STRtree.serialVersionUID=259274702368956900;STRtree.xComparator={interfaces_:function interfaces_(){return[Comparator];},compare:function compare(o1,o2){return AbstractSTRtree.compareDoubles(STRtree.centreX(o1.getBounds()),STRtree.centreX(o2.getBounds()));}};STRtree.yComparator={interfaces_:function interfaces_(){return[Comparator];},compare:function compare(o1,o2){return AbstractSTRtree.compareDoubles(STRtree.centreY(o1.getBounds()),STRtree.centreY(o2.getBounds()));}};STRtree.intersectsOp={interfaces_:function interfaces_(){return[IntersectsOp];},intersects:function intersects(aBounds,bBounds){return aBounds.intersects(bBounds);}};STRtree.DEFAULT_NODE_CAPACITY=10;function IndexedNestedRingTester(){this.graph=null;this.rings=new ArrayList();this.totalEnv=new Envelope();this.index=null;this.nestedPt=null;var graph=arguments[0];this.graph=graph;}extend$1(IndexedNestedRingTester.prototype,{buildIndex:function buildIndex(){this.index=new STRtree();for(var i=0;i<this.rings.size();i++){var ring=this.rings.get(i);var env=ring.getEnvelopeInternal();this.index.insert(env,ring);}},getNestedPoint:function getNestedPoint(){return this.nestedPt;},isNonNested:function isNonNested(){this.buildIndex();for(var i=0;i<this.rings.size();i++){var innerRing=this.rings.get(i);var innerRingPts=innerRing.getCoordinates();var results=this.index.query(innerRing.getEnvelopeInternal());for(var j=0;j<results.size();j++){var searchRing=results.get(j);var searchRingPts=searchRing.getCoordinates();if(innerRing===searchRing)continue;if(!innerRing.getEnvelopeInternal().intersects(searchRing.getEnvelopeInternal()))continue;var innerRingPt=IsValidOp.findPtNotNode(innerRingPts,searchRing,this.graph);if(innerRingPt===null)continue;var isInside=CGAlgorithms.isPointInRing(innerRingPt,searchRingPts);if(isInside){this.nestedPt=innerRingPt;return false;}}}return true;},add:function add(ring){this.rings.add(ring);this.totalEnv.expandToInclude(ring.getEnvelopeInternal());},interfaces_:function interfaces_(){return[];},getClass:function getClass(){return IndexedNestedRingTester;}});function TopologyValidationError(){this.errorType=null;this.pt=null;if(arguments.length===1){var errorType=arguments[0];TopologyValidationError.call(this,errorType,null);}else if(arguments.length===2){var errorType=arguments[0],pt=arguments[1];this.errorType=errorType;if(pt!==null)this.pt=pt.copy();}}extend$1(TopologyValidationError.prototype,{getErrorType:function getErrorType(){return this.errorType;},getMessage:function getMessage(){return TopologyValidationError.errMsg[this.errorType];},getCoordinate:function getCoordinate(){return this.pt;},toString:function toString(){var locStr="";if(this.pt!==null)locStr=" at or near point "+this.pt;return this.getMessage()+locStr;},interfaces_:function interfaces_(){return[];},getClass:function getClass(){return TopologyValidationError;}});TopologyValidationError.ERROR=0;TopologyValidationError.REPEATED_POINT=1;TopologyValidationError.HOLE_OUTSIDE_SHELL=2;TopologyValidationError.NESTED_HOLES=3;TopologyValidationError.DISCONNECTED_INTERIOR=4;TopologyValidationError.SELF_INTERSECTION=5;TopologyValidationError.RING_SELF_INTERSECTION=6;TopologyValidationError.NESTED_SHELLS=7;TopologyValidationError.DUPLICATE_RINGS=8;TopologyValidationError.TOO_FEW_POINTS=9;TopologyValidationError.INVALID_COORDINATE=10;TopologyValidationError.RING_NOT_CLOSED=11;TopologyValidationError.errMsg=["Topology Validation Error","Repeated Point","Hole lies outside shell","Holes are nested","Interior is disconnected","Self-intersection","Ring Self-intersection","Nested shells","Duplicate Rings","Too few distinct points in geometry component","Invalid Coordinate","Ring is not closed"];function IsValidOp(){this.parentGeometry=null;this.isSelfTouchingRingFormingHoleValid=false;this.validErr=null;var parentGeometry=arguments[0];this.parentGeometry=parentGeometry;}extend$1(IsValidOp.prototype,{checkInvalidCoordinates:function checkInvalidCoordinates(){if(arguments[0]instanceof Array){var coords=arguments[0];for(var i=0;i<coords.length;i++){if(!IsValidOp.isValid(coords[i])){this.validErr=new TopologyValidationError(TopologyValidationError.INVALID_COORDINATE,coords[i]);return null;}}}else if(arguments[0]instanceof Polygon){var poly=arguments[0];this.checkInvalidCoordinates(poly.getExteriorRing().getCoordinates());if(this.validErr!==null)return null;for(var i=0;i<poly.getNumInteriorRing();i++){this.checkInvalidCoordinates(poly.getInteriorRingN(i).getCoordinates());if(this.validErr!==null)return null;}}},checkHolesNotNested:function checkHolesNotNested(p,graph){var nestedTester=new IndexedNestedRingTester(graph);for(var i=0;i<p.getNumInteriorRing();i++){var innerHole=p.getInteriorRingN(i);nestedTester.add(innerHole);}var isNonNested=nestedTester.isNonNested();if(!isNonNested){this.validErr=new TopologyValidationError(TopologyValidationError.NESTED_HOLES,nestedTester.getNestedPoint());}},checkConsistentArea:function checkConsistentArea(graph){var cat=new ConsistentAreaTester(graph);var isValidArea=cat.isNodeConsistentArea();if(!isValidArea){this.validErr=new TopologyValidationError(TopologyValidationError.SELF_INTERSECTION,cat.getInvalidPoint());return null;}if(cat.hasDuplicateRings()){this.validErr=new TopologyValidationError(TopologyValidationError.DUPLICATE_RINGS,cat.getInvalidPoint());}},isValid:function isValid(){this.checkValid(this.parentGeometry);return this.validErr===null;},checkShellInsideHole:function checkShellInsideHole(shell,hole,graph){var shellPts=shell.getCoordinates();var holePts=hole.getCoordinates();var shellPt=IsValidOp.findPtNotNode(shellPts,hole,graph);if(shellPt!==null){var insideHole=CGAlgorithms.isPointInRing(shellPt,holePts);if(!insideHole){return shellPt;}}var holePt=IsValidOp.findPtNotNode(holePts,shell,graph);if(holePt!==null){var insideShell=CGAlgorithms.isPointInRing(holePt,shellPts);if(insideShell){return holePt;}return null;}Assert.shouldNeverReachHere("points in shell and hole appear to be equal");return null;},checkNoSelfIntersectingRings:function checkNoSelfIntersectingRings(graph){for(var i=graph.getEdgeIterator();i.hasNext();){var e=i.next();this.checkNoSelfIntersectingRing(e.getEdgeIntersectionList());if(this.validErr!==null)return null;}},checkConnectedInteriors:function checkConnectedInteriors(graph){var cit=new ConnectedInteriorTester(graph);if(!cit.isInteriorsConnected())this.validErr=new TopologyValidationError(TopologyValidationError.DISCONNECTED_INTERIOR,cit.getCoordinate());},checkNoSelfIntersectingRing:function checkNoSelfIntersectingRing(eiList){var nodeSet=new TreeSet();var isFirst=true;for(var i=eiList.iterator();i.hasNext();){var ei=i.next();if(isFirst){isFirst=false;continue;}if(nodeSet.contains(ei.coord)){this.validErr=new TopologyValidationError(TopologyValidationError.RING_SELF_INTERSECTION,ei.coord);return null;}else{nodeSet.add(ei.coord);}}},checkHolesInShell:function checkHolesInShell(p,graph){var shell=p.getExteriorRing();var pir=new MCPointInRing(shell);for(var i=0;i<p.getNumInteriorRing();i++){var hole=p.getInteriorRingN(i);var holePt=IsValidOp.findPtNotNode(hole.getCoordinates(),shell,graph);if(holePt===null)return null;var outside=!pir.isInside(holePt);if(outside){this.validErr=new TopologyValidationError(TopologyValidationError.HOLE_OUTSIDE_SHELL,holePt);return null;}}},checkTooFewPoints:function checkTooFewPoints(graph){if(graph.hasTooFewPoints()){this.validErr=new TopologyValidationError(TopologyValidationError.TOO_FEW_POINTS,graph.getInvalidPoint());return null;}},getValidationError:function getValidationError(){this.checkValid(this.parentGeometry);return this.validErr;},checkValid:function checkValid(){if(arguments[0]instanceof Point){var g=arguments[0];this.checkInvalidCoordinates(g.getCoordinates());}else if(arguments[0]instanceof MultiPoint){var g=arguments[0];this.checkInvalidCoordinates(g.getCoordinates());}else if(arguments[0]instanceof LinearRing){var g=arguments[0];this.checkInvalidCoordinates(g.getCoordinates());if(this.validErr!==null)return null;this.checkClosedRing(g);if(this.validErr!==null)return null;var graph=new GeometryGraph(0,g);this.checkTooFewPoints(graph);if(this.validErr!==null)return null;var li=new RobustLineIntersector();graph.computeSelfNodes(li,true,true);this.checkNoSelfIntersectingRings(graph);}else if(arguments[0]instanceof LineString){var g=arguments[0];this.checkInvalidCoordinates(g.getCoordinates());if(this.validErr!==null)return null;var graph=new GeometryGraph(0,g);this.checkTooFewPoints(graph);}else if(arguments[0]instanceof Polygon){var g=arguments[0];this.checkInvalidCoordinates(g);if(this.validErr!==null)return null;this.checkClosedRings(g);if(this.validErr!==null)return null;var graph=new GeometryGraph(0,g);this.checkTooFewPoints(graph);if(this.validErr!==null)return null;this.checkConsistentArea(graph);if(this.validErr!==null)return null;if(!this.isSelfTouchingRingFormingHoleValid){this.checkNoSelfIntersectingRings(graph);if(this.validErr!==null)return null;}this.checkHolesInShell(g,graph);if(this.validErr!==null)return null;this.checkHolesNotNested(g,graph);if(this.validErr!==null)return null;this.checkConnectedInteriors(graph);}else if(arguments[0]instanceof MultiPolygon){var g=arguments[0];for(var i=0;i<g.getNumGeometries();i++){var p=g.getGeometryN(i);this.checkInvalidCoordinates(p);if(this.validErr!==null)return null;this.checkClosedRings(p);if(this.validErr!==null)return null;}var graph=new GeometryGraph(0,g);this.checkTooFewPoints(graph);if(this.validErr!==null)return null;this.checkConsistentArea(graph);if(this.validErr!==null)return null;if(!this.isSelfTouchingRingFormingHoleValid){this.checkNoSelfIntersectingRings(graph);if(this.validErr!==null)return null;}for(var i=0;i<g.getNumGeometries();i++){var p=g.getGeometryN(i);this.checkHolesInShell(p,graph);if(this.validErr!==null)return null;}for(var i=0;i<g.getNumGeometries();i++){var p=g.getGeometryN(i);this.checkHolesNotNested(p,graph);if(this.validErr!==null)return null;}this.checkShellsNotNested(g,graph);if(this.validErr!==null)return null;this.checkConnectedInteriors(graph);}else if(arguments[0]instanceof GeometryCollection){var gc=arguments[0];for(var i=0;i<gc.getNumGeometries();i++){var g=gc.getGeometryN(i);this.checkValid(g);if(this.validErr!==null)return null;}}else if(arguments[0]instanceof Geometry){var g=arguments[0];this.validErr=null;if(g.isEmpty())return null;if(g instanceof Point)this.checkValid(g);else if(g instanceof MultiPoint)this.checkValid(g);else if(g instanceof LinearRing)this.checkValid(g);else if(g instanceof LineString)this.checkValid(g);else if(g instanceof Polygon)this.checkValid(g);else if(g instanceof MultiPolygon)this.checkValid(g);else if(g instanceof GeometryCollection)this.checkValid(g);else throw new UnsupportedOperationException(g.getClass().getName());}},setSelfTouchingRingFormingHoleValid:function setSelfTouchingRingFormingHoleValid(isValid){this.isSelfTouchingRingFormingHoleValid=isValid;},checkShellNotNested:function checkShellNotNested(shell,p,graph){var shellPts=shell.getCoordinates();var polyShell=p.getExteriorRing();var polyPts=polyShell.getCoordinates();var shellPt=IsValidOp.findPtNotNode(shellPts,polyShell,graph);if(shellPt===null)return null;var insidePolyShell=CGAlgorithms.isPointInRing(shellPt,polyPts);if(!insidePolyShell)return null;if(p.getNumInteriorRing()<=0){this.validErr=new TopologyValidationError(TopologyValidationError.NESTED_SHELLS,shellPt);return null;}var badNestedPt=null;for(var i=0;i<p.getNumInteriorRing();i++){var hole=p.getInteriorRingN(i);badNestedPt=this.checkShellInsideHole(shell,hole,graph);if(badNestedPt===null)return null;}this.validErr=new TopologyValidationError(TopologyValidationError.NESTED_SHELLS,badNestedPt);},checkClosedRings:function checkClosedRings(poly){this.checkClosedRing(poly.getExteriorRing());if(this.validErr!==null)return null;for(var i=0;i<poly.getNumInteriorRing();i++){this.checkClosedRing(poly.getInteriorRingN(i));if(this.validErr!==null)return null;}},checkClosedRing:function checkClosedRing(ring){if(!ring.isClosed()){var pt=null;if(ring.getNumPoints()>=1)pt=ring.getCoordinateN(0);this.validErr=new TopologyValidationError(TopologyValidationError.RING_NOT_CLOSED,pt);}},checkShellsNotNested:function checkShellsNotNested(mp,graph){for(var i=0;i<mp.getNumGeometries();i++){var p=mp.getGeometryN(i);var shell=p.getExteriorRing();for(var j=0;j<mp.getNumGeometries();j++){if(i===j)continue;var p2=mp.getGeometryN(j);this.checkShellNotNested(shell,p2,graph);if(this.validErr!==null)return null;}}},interfaces_:function interfaces_(){return[];},getClass:function getClass(){return IsValidOp;}});IsValidOp.findPtNotNode=function(testCoords,searchRing,graph){var searchEdge=graph.findEdge(searchRing);var eiList=searchEdge.getEdgeIntersectionList();for(var i=0;i<testCoords.length;i++){var pt=testCoords[i];if(!eiList.isIntersection(pt))return pt;}return null;};IsValidOp.isValid=function(){if(arguments[0]instanceof Geometry){var geom=arguments[0];var isValidOp=new IsValidOp(geom);return isValidOp.isValid();}else if(arguments[0]instanceof Coordinate){var coord=arguments[0];if(Double.isNaN(coord.x))return false;if(Double.isInfinite(coord.x))return false;if(Double.isNaN(coord.y))return false;if(Double.isInfinite(coord.y))return false;return true;}};function GeometryTransformer(){this.inputGeom=null;this.factory=null;this.pruneEmptyGeometry=true;this.preserveGeometryCollectionType=true;this.preserveCollections=false;this.preserveType=false;}extend$1(GeometryTransformer.prototype,{transformPoint:function transformPoint(geom,parent){return this.factory.createPoint(this.transformCoordinates(geom.getCoordinateSequence(),geom));},transformPolygon:function transformPolygon(geom,parent){var isAllValidLinearRings=true;var shell=this.transformLinearRing(geom.getExteriorRing(),geom);if(shell===null||!(shell instanceof LinearRing)||shell.isEmpty())isAllValidLinearRings=false;var holes=new ArrayList();for(var i=0;i<geom.getNumInteriorRing();i++){var hole=this.transformLinearRing(geom.getInteriorRingN(i),geom);if(hole===null||hole.isEmpty()){continue;}if(!(hole instanceof LinearRing))isAllValidLinearRings=false;holes.add(hole);}if(isAllValidLinearRings)return this.factory.createPolygon(shell,holes.toArray([]));else{var components=new ArrayList();if(shell!==null)components.add(shell);components.addAll(holes);return this.factory.buildGeometry(components);}},createCoordinateSequence:function createCoordinateSequence(coords){return this.factory.getCoordinateSequenceFactory().create(coords);},getInputGeometry:function getInputGeometry(){return this.inputGeom;},transformMultiLineString:function transformMultiLineString(geom,parent){var transGeomList=new ArrayList();for(var i=0;i<geom.getNumGeometries();i++){var transformGeom=this.transformLineString(geom.getGeometryN(i),geom);if(transformGeom===null)continue;if(transformGeom.isEmpty())continue;transGeomList.add(transformGeom);}return this.factory.buildGeometry(transGeomList);},transformCoordinates:function transformCoordinates(coords,parent){return this.copy(coords);},transformLineString:function transformLineString(geom,parent){return this.factory.createLineString(this.transformCoordinates(geom.getCoordinateSequence(),geom));},transformMultiPoint:function transformMultiPoint(geom,parent){var transGeomList=new ArrayList();for(var i=0;i<geom.getNumGeometries();i++){var transformGeom=this.transformPoint(geom.getGeometryN(i),geom);if(transformGeom===null)continue;if(transformGeom.isEmpty())continue;transGeomList.add(transformGeom);}return this.factory.buildGeometry(transGeomList);},transformMultiPolygon:function transformMultiPolygon(geom,parent){var transGeomList=new ArrayList();for(var i=0;i<geom.getNumGeometries();i++){var transformGeom=this.transformPolygon(geom.getGeometryN(i),geom);if(transformGeom===null)continue;if(transformGeom.isEmpty())continue;transGeomList.add(transformGeom);}return this.factory.buildGeometry(transGeomList);},copy:function copy(seq){return seq.copy();},transformGeometryCollection:function transformGeometryCollection(geom,parent){var transGeomList=new ArrayList();for(var i=0;i<geom.getNumGeometries();i++){var transformGeom=this.transform(geom.getGeometryN(i));if(transformGeom===null)continue;if(this.pruneEmptyGeometry&&transformGeom.isEmpty())continue;transGeomList.add(transformGeom);}if(this.preserveGeometryCollectionType)return this.factory.createGeometryCollection(GeometryFactory.toGeometryArray(transGeomList));return this.factory.buildGeometry(transGeomList);},transform:function transform(inputGeom){this.inputGeom=inputGeom;this.factory=inputGeom.getFactory();if(inputGeom instanceof Point)return this.transformPoint(inputGeom,null);if(inputGeom instanceof MultiPoint)return this.transformMultiPoint(inputGeom,null);if(inputGeom instanceof LinearRing)return this.transformLinearRing(inputGeom,null);if(inputGeom instanceof LineString)return this.transformLineString(inputGeom,null);if(inputGeom instanceof MultiLineString)return this.transformMultiLineString(inputGeom,null);if(inputGeom instanceof Polygon)return this.transformPolygon(inputGeom,null);if(inputGeom instanceof MultiPolygon)return this.transformMultiPolygon(inputGeom,null);if(inputGeom instanceof GeometryCollection)return this.transformGeometryCollection(inputGeom,null);throw new IllegalArgumentException("Unknown Geometry subtype: "+inputGeom.getClass().getName());},transformLinearRing:function transformLinearRing(geom,parent){var seq=this.transformCoordinates(geom.getCoordinateSequence(),geom);if(seq===null)return this.factory.createLinearRing(null);var seqSize=seq.size();if(seqSize>0&&seqSize<4&&!this.preserveType)return this.factory.createLineString(seq);return this.factory.createLinearRing(seq);},interfaces_:function interfaces_(){return[];},getClass:function getClass(){return GeometryTransformer;}});function LineStringSnapper(){this.snapTolerance=0.0;this.srcPts=null;this.seg=new LineSegment();this.allowSnappingToSourceVertices=false;this._isClosed=false;if(arguments[0]instanceof LineString&&typeof arguments[1]==="number"){var srcLine=arguments[0],snapTolerance=arguments[1];LineStringSnapper.call(this,srcLine.getCoordinates(),snapTolerance);}else if(arguments[0]instanceof Array&&typeof arguments[1]==="number"){var srcPts=arguments[0],snapTolerance=arguments[1];this.srcPts=srcPts;this._isClosed=LineStringSnapper.isClosed(srcPts);this.snapTolerance=snapTolerance;}}extend$1(LineStringSnapper.prototype,{snapVertices:function snapVertices(srcCoords,snapPts){var end=this._isClosed?srcCoords.size()-1:srcCoords.size();for(var i=0;i<end;i++){var srcPt=srcCoords.get(i);var snapVert=this.findSnapForVertex(srcPt,snapPts);if(snapVert!==null){srcCoords.set(i,new Coordinate(snapVert));if(i===0&&this._isClosed)srcCoords.set(srcCoords.size()-1,new Coordinate(snapVert));}}},findSnapForVertex:function findSnapForVertex(pt,snapPts){for(var i=0;i<snapPts.length;i++){if(pt.equals2D(snapPts[i]))return null;if(pt.distance(snapPts[i])<this.snapTolerance)return snapPts[i];}return null;},snapTo:function snapTo(snapPts){var coordList=new CoordinateList(this.srcPts);this.snapVertices(coordList,snapPts);this.snapSegments(coordList,snapPts);var newPts=coordList.toCoordinateArray();return newPts;},snapSegments:function snapSegments(srcCoords,snapPts){if(snapPts.length===0)return null;var distinctPtCount=snapPts.length;if(snapPts[0].equals2D(snapPts[snapPts.length-1]))distinctPtCount=snapPts.length-1;for(var i=0;i<distinctPtCount;i++){var snapPt=snapPts[i];var index=this.findSegmentIndexToSnap(snapPt,srcCoords);if(index>=0){srcCoords.add(index+1,new Coordinate(snapPt),false);}}},findSegmentIndexToSnap:function findSegmentIndexToSnap(snapPt,srcCoords){var minDist=Double.MAX_VALUE;var snapIndex=-1;for(var i=0;i<srcCoords.size()-1;i++){this.seg.p0=srcCoords.get(i);this.seg.p1=srcCoords.get(i+1);if(this.seg.p0.equals2D(snapPt)||this.seg.p1.equals2D(snapPt)){if(this.allowSnappingToSourceVertices)continue;else return-1;}var dist=this.seg.distance(snapPt);if(dist<this.snapTolerance&&dist<minDist){minDist=dist;snapIndex=i;}}return snapIndex;},setAllowSnappingToSourceVertices:function setAllowSnappingToSourceVertices(allowSnappingToSourceVertices){this.allowSnappingToSourceVertices=allowSnappingToSourceVertices;},interfaces_:function interfaces_(){return[];},getClass:function getClass(){return LineStringSnapper;}});LineStringSnapper.isClosed=function(pts){if(pts.length<=1)return false;return pts[0].equals2D(pts[pts.length-1]);};function GeometrySnapper(){this.srcGeom=null;var srcGeom=arguments[0];this.srcGeom=srcGeom;}extend$1(GeometrySnapper.prototype,{snapTo:function snapTo(snapGeom,snapTolerance){var snapPts=this.extractTargetCoordinates(snapGeom);var snapTrans=new SnapTransformer(snapTolerance,snapPts);return snapTrans.transform(this.srcGeom);},snapToSelf:function snapToSelf(snapTolerance,cleanResult){var snapPts=this.extractTargetCoordinates(this.srcGeom);var snapTrans=new SnapTransformer(snapTolerance,snapPts,true);var snappedGeom=snapTrans.transform(this.srcGeom);var result=snappedGeom;if(cleanResult&&hasInterface(result,Polygonal)){result=snappedGeom.buffer(0);}return result;},computeSnapTolerance:function computeSnapTolerance(ringPts){var minSegLen=this.computeMinimumSegmentLength(ringPts);var snapTol=minSegLen/10;return snapTol;},extractTargetCoordinates:function extractTargetCoordinates(g){var ptSet=new TreeSet();var pts=g.getCoordinates();for(var i=0;i<pts.length;i++){ptSet.add(pts[i]);}return ptSet.toArray(new Array(0).fill(null));},computeMinimumSegmentLength:function computeMinimumSegmentLength(pts){var minSegLen=Double.MAX_VALUE;for(var i=0;i<pts.length-1;i++){var segLen=pts[i].distance(pts[i+1]);if(segLen<minSegLen)minSegLen=segLen;}return minSegLen;},interfaces_:function interfaces_(){return[];},getClass:function getClass(){return GeometrySnapper;}});GeometrySnapper.snap=function(g0,g1,snapTolerance){var snapGeom=new Array(2).fill(null);var snapper0=new GeometrySnapper(g0);snapGeom[0]=snapper0.snapTo(g1,snapTolerance);var snapper1=new GeometrySnapper(g1);snapGeom[1]=snapper1.snapTo(snapGeom[0],snapTolerance);return snapGeom;};GeometrySnapper.computeOverlaySnapTolerance=function(){if(arguments.length===1){var g=arguments[0];var snapTolerance=GeometrySnapper.computeSizeBasedSnapTolerance(g);var pm=g.getPrecisionModel();if(pm.getType()===PrecisionModel.FIXED){var fixedSnapTol=1/pm.getScale()*2/1.415;if(fixedSnapTol>snapTolerance)snapTolerance=fixedSnapTol;}return snapTolerance;}else if(arguments.length===2){var g0=arguments[0],g1=arguments[1];return Math.min(GeometrySnapper.computeOverlaySnapTolerance(g0),GeometrySnapper.computeOverlaySnapTolerance(g1));}};GeometrySnapper.computeSizeBasedSnapTolerance=function(g){var env=g.getEnvelopeInternal();var minDimension=Math.min(env.getHeight(),env.getWidth());var snapTol=minDimension*GeometrySnapper.SNAP_PRECISION_FACTOR;return snapTol;};GeometrySnapper.snapToSelf=function(geom,snapTolerance,cleanResult){var snapper0=new GeometrySnapper(geom);return snapper0.snapToSelf(snapTolerance,cleanResult);};GeometrySnapper.SNAP_PRECISION_FACTOR=1e-9;function SnapTransformer(){GeometryTransformer.apply(this);this.snapTolerance=null;this.snapPts=null;this.isSelfSnap=false;if(arguments.length===2){var snapTolerance=arguments[0],snapPts=arguments[1];this.snapTolerance=snapTolerance;this.snapPts=snapPts;}else if(arguments.length===3){var snapTolerance=arguments[0],snapPts=arguments[1],isSelfSnap=arguments[2];this.snapTolerance=snapTolerance;this.snapPts=snapPts;this.isSelfSnap=isSelfSnap;}}inherits$1(SnapTransformer,GeometryTransformer);extend$1(SnapTransformer.prototype,{snapLine:function snapLine(srcPts,snapPts){var snapper=new LineStringSnapper(srcPts,this.snapTolerance);snapper.setAllowSnappingToSourceVertices(this.isSelfSnap);return snapper.snapTo(snapPts);},transformCoordinates:function transformCoordinates(coords,parent){var srcPts=coords.toCoordinateArray();var newPts=this.snapLine(srcPts,this.snapPts);return this.factory.getCoordinateSequenceFactory().create(newPts);},interfaces_:function interfaces_(){return[];},getClass:function getClass(){return SnapTransformer;}});function CommonBits(){this.isFirst=true;this.commonMantissaBitsCount=53;this.commonBits=0;this.commonSignExp=null;}extend$1(CommonBits.prototype,{getCommon:function getCommon(){return Double.longBitsToDouble(this.commonBits);},add:function add(num){var numBits=Double.doubleToLongBits(num);if(this.isFirst){this.commonBits=numBits;this.commonSignExp=CommonBits.signExpBits(this.commonBits);this.isFirst=false;return null;}var numSignExp=CommonBits.signExpBits(numBits);if(numSignExp!==this.commonSignExp){this.commonBits=0;return null;}this.commonMantissaBitsCount=CommonBits.numCommonMostSigMantissaBits(this.commonBits,numBits);this.commonBits=CommonBits.zeroLowerBits(this.commonBits,64-(12+this.commonMantissaBitsCount));},toString:function toString(){if(arguments.length===1){var bits=arguments[0];var x=Double.longBitsToDouble(bits);var numStr=Long.toBinaryString(bits);var padStr="0000000000000000000000000000000000000000000000000000000000000000"+numStr;var bitStr=padStr.substring(padStr.length-64);var str=bitStr.substring(0,1)+"  "+bitStr.substring(1,12)+"(exp) "+bitStr.substring(12)+" [ "+x+" ]";return str;}},interfaces_:function interfaces_(){return[];},getClass:function getClass(){return CommonBits;}});CommonBits.getBit=function(bits,i){var mask=1<<i;return(bits&mask)!==0?1:0;};CommonBits.signExpBits=function(num){return num>>52;};CommonBits.zeroLowerBits=function(bits,nBits){var invMask=(1<<nBits)-1;var mask=~invMask;var zeroed=bits&mask;return zeroed;};CommonBits.numCommonMostSigMantissaBits=function(num1,num2){var count=0;for(var i=52;i>=0;i--){if(CommonBits.getBit(num1,i)!==CommonBits.getBit(num2,i))return count;count++;}return 52;};function CommonBitsRemover(){this.commonCoord=null;this.ccFilter=new CommonCoordinateFilter();}extend$1(CommonBitsRemover.prototype,{addCommonBits:function addCommonBits(geom){var trans=new Translater(this.commonCoord);geom.apply(trans);geom.geometryChanged();},removeCommonBits:function removeCommonBits(geom){if(this.commonCoord.x===0.0&&this.commonCoord.y===0.0)return geom;var invCoord=new Coordinate(this.commonCoord);invCoord.x=-invCoord.x;invCoord.y=-invCoord.y;var trans=new Translater(invCoord);geom.apply(trans);geom.geometryChanged();return geom;},getCommonCoordinate:function getCommonCoordinate(){return this.commonCoord;},add:function add(geom){geom.apply(this.ccFilter);this.commonCoord=this.ccFilter.getCommonCoordinate();},interfaces_:function interfaces_(){return[];},getClass:function getClass(){return CommonBitsRemover;}});function CommonCoordinateFilter(){this.commonBitsX=new CommonBits();this.commonBitsY=new CommonBits();}extend$1(CommonCoordinateFilter.prototype,{filter:function filter(coord){this.commonBitsX.add(coord.x);this.commonBitsY.add(coord.y);},getCommonCoordinate:function getCommonCoordinate(){return new Coordinate(this.commonBitsX.getCommon(),this.commonBitsY.getCommon());},interfaces_:function interfaces_(){return[CoordinateFilter];},getClass:function getClass(){return CommonCoordinateFilter;}});function Translater(){this.trans=null;var trans=arguments[0];this.trans=trans;}extend$1(Translater.prototype,{filter:function filter(seq,i){var xp=seq.getOrdinate(i,0)+this.trans.x;var yp=seq.getOrdinate(i,1)+this.trans.y;seq.setOrdinate(i,0,xp);seq.setOrdinate(i,1,yp);},isDone:function isDone(){return false;},isGeometryChanged:function isGeometryChanged(){return true;},interfaces_:function interfaces_(){return[CoordinateSequenceFilter];},getClass:function getClass(){return Translater;}});CommonBitsRemover.CommonCoordinateFilter=CommonCoordinateFilter;CommonBitsRemover.Translater=Translater;function Octant(){}extend$1(Octant.prototype,{interfaces_:function interfaces_(){return[];},getClass:function getClass(){return Octant;}});Octant.octant=function(){if(typeof arguments[0]==="number"&&typeof arguments[1]==="number"){var dx=arguments[0],dy=arguments[1];if(dx===0.0&&dy===0.0)throw new IllegalArgumentException("Cannot compute the octant for point ( "+dx+", "+dy+" )");var adx=Math.abs(dx);var ady=Math.abs(dy);if(dx>=0){if(dy>=0){if(adx>=ady)return 0;else return 1;}else{if(adx>=ady)return 7;else return 6;}}else{if(dy>=0){if(adx>=ady)return 3;else return 2;}else{if(adx>=ady)return 4;else return 5;}}}else if(arguments[0]instanceof Coordinate&&arguments[1]instanceof Coordinate){var p0=arguments[0],p1=arguments[1];var dx=p1.x-p0.x;var dy=p1.y-p0.y;if(dx===0.0&&dy===0.0)throw new IllegalArgumentException("Cannot compute the octant for two identical points "+p0);return Octant.octant(dx,dy);}};function SegmentString(){}extend$1(SegmentString.prototype,{getCoordinates:function getCoordinates(){},size:function size(){},getCoordinate:function getCoordinate(i){},isClosed:function isClosed(){},setData:function setData(data){},getData:function getData(){},interfaces_:function interfaces_(){return[];},getClass:function getClass(){return SegmentString;}});function BasicSegmentString(){this.pts=null;this.data=null;var pts=arguments[0],data=arguments[1];this.pts=pts;this.data=data;}extend$1(BasicSegmentString.prototype,{getCoordinates:function getCoordinates(){return this.pts;},size:function size(){return this.pts.length;},getCoordinate:function getCoordinate(i){return this.pts[i];},isClosed:function isClosed(){return this.pts[0].equals(this.pts[this.pts.length-1]);},getSegmentOctant:function getSegmentOctant(index){if(index===this.pts.length-1)return-1;return Octant.octant(this.getCoordinate(index),this.getCoordinate(index+1));},setData:function setData(data){this.data=data;},getData:function getData(){return this.data;},toString:function toString(){return WKTWriter.toLineString(new CoordinateArraySequence(this.pts));},interfaces_:function interfaces_(){return[SegmentString];},getClass:function getClass(){return BasicSegmentString;}});function SegmentPointComparator(){}extend$1(SegmentPointComparator.prototype,{interfaces_:function interfaces_(){return[];},getClass:function getClass(){return SegmentPointComparator;}});SegmentPointComparator.relativeSign=function(x0,x1){if(x0<x1)return-1;if(x0>x1)return 1;return 0;};SegmentPointComparator.compare=function(octant,p0,p1){if(p0.equals2D(p1))return 0;var xSign=SegmentPointComparator.relativeSign(p0.x,p1.x);var ySign=SegmentPointComparator.relativeSign(p0.y,p1.y);switch(octant){case 0:return SegmentPointComparator.compareValue(xSign,ySign);case 1:return SegmentPointComparator.compareValue(ySign,xSign);case 2:return SegmentPointComparator.compareValue(ySign,-xSign);case 3:return SegmentPointComparator.compareValue(-xSign,ySign);case 4:return SegmentPointComparator.compareValue(-xSign,-ySign);case 5:return SegmentPointComparator.compareValue(-ySign,-xSign);case 6:return SegmentPointComparator.compareValue(-ySign,xSign);case 7:return SegmentPointComparator.compareValue(xSign,-ySign);}Assert.shouldNeverReachHere("invalid octant value");return 0;};SegmentPointComparator.compareValue=function(compareSign0,compareSign1){if(compareSign0<0)return-1;if(compareSign0>0)return 1;if(compareSign1<0)return-1;if(compareSign1>0)return 1;return 0;};function SegmentNode(){this.segString=null;this.coord=null;this.segmentIndex=null;this.segmentOctant=null;this._isInterior=null;var segString=arguments[0],coord=arguments[1],segmentIndex=arguments[2],segmentOctant=arguments[3];this.segString=segString;this.coord=new Coordinate(coord);this.segmentIndex=segmentIndex;this.segmentOctant=segmentOctant;this._isInterior=!coord.equals2D(segString.getCoordinate(segmentIndex));}extend$1(SegmentNode.prototype,{getCoordinate:function getCoordinate(){return this.coord;},print:function print(out){out.print(this.coord);out.print(" seg # = "+this.segmentIndex);},compareTo:function compareTo(obj){var other=obj;if(this.segmentIndex<other.segmentIndex)return-1;if(this.segmentIndex>other.segmentIndex)return 1;if(this.coord.equals2D(other.coord))return 0;return SegmentPointComparator.compare(this.segmentOctant,this.coord,other.coord);},isEndPoint:function isEndPoint(maxSegmentIndex){if(this.segmentIndex===0&&!this._isInterior)return true;if(this.segmentIndex===maxSegmentIndex)return true;return false;},isInterior:function isInterior(){return this._isInterior;},interfaces_:function interfaces_(){return[Comparable];},getClass:function getClass(){return SegmentNode;}});function SegmentNodeList(){this.nodeMap=new TreeMap();this.edge=null;var edge=arguments[0];this.edge=edge;}extend$1(SegmentNodeList.prototype,{getSplitCoordinates:function getSplitCoordinates(){var coordList=new CoordinateList();this.addEndpoints();var it=this.iterator();var eiPrev=it.next();while(it.hasNext()){var ei=it.next();this.addEdgeCoordinates(eiPrev,ei,coordList);eiPrev=ei;}return coordList.toCoordinateArray();},addCollapsedNodes:function addCollapsedNodes(){var collapsedVertexIndexes=new ArrayList();this.findCollapsesFromInsertedNodes(collapsedVertexIndexes);this.findCollapsesFromExistingVertices(collapsedVertexIndexes);for(var it=collapsedVertexIndexes.iterator();it.hasNext();){var vertexIndex=it.next().intValue();this.add(this.edge.getCoordinate(vertexIndex),vertexIndex);}},print:function print(out){out.println("Intersections:");for(var it=this.iterator();it.hasNext();){var ei=it.next();ei.print(out);}},findCollapsesFromExistingVertices:function findCollapsesFromExistingVertices(collapsedVertexIndexes){for(var i=0;i<this.edge.size()-2;i++){var p0=this.edge.getCoordinate(i);var p1=this.edge.getCoordinate(i+1);var p2=this.edge.getCoordinate(i+2);if(p0.equals2D(p2)){collapsedVertexIndexes.add(new Integer(i+1));}}},addEdgeCoordinates:function addEdgeCoordinates(ei0,ei1,coordList){var lastSegStartPt=this.edge.getCoordinate(ei1.segmentIndex);var useIntPt1=ei1.isInterior()||!ei1.coord.equals2D(lastSegStartPt);coordList.add(new Coordinate(ei0.coord),false);for(var i=ei0.segmentIndex+1;i<=ei1.segmentIndex;i++){coordList.add(this.edge.getCoordinate(i));}if(useIntPt1){coordList.add(new Coordinate(ei1.coord));}},iterator:function iterator(){return this.nodeMap.values().iterator();},addSplitEdges:function addSplitEdges(edgeList){this.addEndpoints();this.addCollapsedNodes();var it=this.iterator();var eiPrev=it.next();while(it.hasNext()){var ei=it.next();var newEdge=this.createSplitEdge(eiPrev,ei);edgeList.add(newEdge);eiPrev=ei;}},findCollapseIndex:function findCollapseIndex(ei0,ei1,collapsedVertexIndex){if(!ei0.coord.equals2D(ei1.coord))return false;var numVerticesBetween=ei1.segmentIndex-ei0.segmentIndex;if(!ei1.isInterior()){numVerticesBetween--;}if(numVerticesBetween===1){collapsedVertexIndex[0]=ei0.segmentIndex+1;return true;}return false;},findCollapsesFromInsertedNodes:function findCollapsesFromInsertedNodes(collapsedVertexIndexes){var collapsedVertexIndex=new Array(1).fill(null);var it=this.iterator();var eiPrev=it.next();while(it.hasNext()){var ei=it.next();var isCollapsed=this.findCollapseIndex(eiPrev,ei,collapsedVertexIndex);if(isCollapsed)collapsedVertexIndexes.add(new Integer(collapsedVertexIndex[0]));eiPrev=ei;}},getEdge:function getEdge(){return this.edge;},addEndpoints:function addEndpoints(){var maxSegIndex=this.edge.size()-1;this.add(this.edge.getCoordinate(0),0);this.add(this.edge.getCoordinate(maxSegIndex),maxSegIndex);},createSplitEdge:function createSplitEdge(ei0,ei1){var npts=ei1.segmentIndex-ei0.segmentIndex+2;var lastSegStartPt=this.edge.getCoordinate(ei1.segmentIndex);var useIntPt1=ei1.isInterior()||!ei1.coord.equals2D(lastSegStartPt);if(!useIntPt1){npts--;}var pts=new Array(npts).fill(null);var ipt=0;pts[ipt++]=new Coordinate(ei0.coord);for(var i=ei0.segmentIndex+1;i<=ei1.segmentIndex;i++){pts[ipt++]=this.edge.getCoordinate(i);}if(useIntPt1)pts[ipt]=new Coordinate(ei1.coord);return new NodedSegmentString(pts,this.edge.getData());},add:function add(intPt,segmentIndex){var eiNew=new SegmentNode(this.edge,intPt,segmentIndex,this.edge.getSegmentOctant(segmentIndex));var ei=this.nodeMap.get(eiNew);if(ei!==null){Assert.isTrue(ei.coord.equals2D(intPt),"Found equal nodes with different coordinates");return ei;}this.nodeMap.put(eiNew,eiNew);return eiNew;},checkSplitEdgesCorrectness:function checkSplitEdgesCorrectness(splitEdges){var edgePts=this.edge.getCoordinates();var split0=splitEdges.get(0);var pt0=split0.getCoordinate(0);if(!pt0.equals2D(edgePts[0]))throw new RuntimeException("bad split edge start point at "+pt0);var splitn=splitEdges.get(splitEdges.size()-1);var splitnPts=splitn.getCoordinates();var ptn=splitnPts[splitnPts.length-1];if(!ptn.equals2D(edgePts[edgePts.length-1]))throw new RuntimeException("bad split edge end point at "+ptn);},interfaces_:function interfaces_(){return[];},getClass:function getClass(){return SegmentNodeList;}});function NodeVertexIterator(){this.nodeList=null;this.edge=null;this.nodeIt=null;this.currNode=null;this.nextNode=null;this.currSegIndex=0;var nodeList=arguments[0];this.nodeList=nodeList;this.edge=nodeList.getEdge();this.nodeIt=nodeList.iterator();this.readNextNode();}extend$1(NodeVertexIterator.prototype,{next:function next(){if(this.currNode===null){this.currNode=this.nextNode;this.currSegIndex=this.currNode.segmentIndex;this.readNextNode();return this.currNode;}if(this.nextNode===null)return null;if(this.nextNode.segmentIndex===this.currNode.segmentIndex){this.currNode=this.nextNode;this.currSegIndex=this.currNode.segmentIndex;this.readNextNode();return this.currNode;}return null;},remove:function remove(){throw new UnsupportedOperationException(this.getClass().getName());},hasNext:function hasNext(){if(this.nextNode===null)return false;return true;},readNextNode:function readNextNode(){if(this.nodeIt.hasNext())this.nextNode=this.nodeIt.next();else this.nextNode=null;},interfaces_:function interfaces_(){return[Iterator];},getClass:function getClass(){return NodeVertexIterator;}});function NodableSegmentString(){}extend$1(NodableSegmentString.prototype,{addIntersection:function addIntersection(intPt,segmentIndex){},interfaces_:function interfaces_(){return[SegmentString];},getClass:function getClass(){return NodableSegmentString;}});function NodedSegmentString(){this.nodeList=new SegmentNodeList(this);this.pts=null;this.data=null;var pts=arguments[0],data=arguments[1];this.pts=pts;this.data=data;}extend$1(NodedSegmentString.prototype,{getCoordinates:function getCoordinates(){return this.pts;},size:function size(){return this.pts.length;},getCoordinate:function getCoordinate(i){return this.pts[i];},isClosed:function isClosed(){return this.pts[0].equals(this.pts[this.pts.length-1]);},getSegmentOctant:function getSegmentOctant(index){if(index===this.pts.length-1)return-1;return this.safeOctant(this.getCoordinate(index),this.getCoordinate(index+1));},setData:function setData(data){this.data=data;},safeOctant:function safeOctant(p0,p1){if(p0.equals2D(p1))return 0;return Octant.octant(p0,p1);},getData:function getData(){return this.data;},addIntersection:function addIntersection(){if(arguments.length===2){var intPt=arguments[0],segmentIndex=arguments[1];this.addIntersectionNode(intPt,segmentIndex);}else if(arguments.length===4){var li=arguments[0],segmentIndex=arguments[1],geomIndex=arguments[2],intIndex=arguments[3];var intPt=new Coordinate(li.getIntersection(intIndex));this.addIntersection(intPt,segmentIndex);}},toString:function toString(){return WKTWriter.toLineString(new CoordinateArraySequence(this.pts));},getNodeList:function getNodeList(){return this.nodeList;},addIntersectionNode:function addIntersectionNode(intPt,segmentIndex){var normalizedSegmentIndex=segmentIndex;var nextSegIndex=normalizedSegmentIndex+1;if(nextSegIndex<this.pts.length){var nextPt=this.pts[nextSegIndex];if(intPt.equals2D(nextPt)){normalizedSegmentIndex=nextSegIndex;}}var ei=this.nodeList.add(intPt,normalizedSegmentIndex);return ei;},addIntersections:function addIntersections(li,segmentIndex,geomIndex){for(var i=0;i<li.getIntersectionNum();i++){this.addIntersection(li,segmentIndex,geomIndex,i);}},interfaces_:function interfaces_(){return[NodableSegmentString];},getClass:function getClass(){return NodedSegmentString;}});NodedSegmentString.getNodedSubstrings=function(){if(arguments.length===1){var segStrings=arguments[0];var resultEdgelist=new ArrayList();NodedSegmentString.getNodedSubstrings(segStrings,resultEdgelist);return resultEdgelist;}else if(arguments.length===2){var segStrings=arguments[0],resultEdgelist=arguments[1];for(var i=segStrings.iterator();i.hasNext();){var ss=i.next();ss.getNodeList().addSplitEdges(resultEdgelist);}}};function MonotoneChainOverlapAction(){this.tempEnv1=new Envelope();this.tempEnv2=new Envelope();this.overlapSeg1=new LineSegment();this.overlapSeg2=new LineSegment();}extend$1(MonotoneChainOverlapAction.prototype,{overlap:function overlap(){if(arguments.length===2){}else if(arguments.length===4){var mc1=arguments[0],start1=arguments[1],mc2=arguments[2],start2=arguments[3];mc1.getLineSegment(start1,this.overlapSeg1);mc2.getLineSegment(start2,this.overlapSeg2);this.overlap(this.overlapSeg1,this.overlapSeg2);}},interfaces_:function interfaces_(){return[];},getClass:function getClass(){return MonotoneChainOverlapAction;}});function Noder(){}extend$1(Noder.prototype,{computeNodes:function computeNodes(segStrings){},getNodedSubstrings:function getNodedSubstrings(){},interfaces_:function interfaces_(){return[];},getClass:function getClass(){return Noder;}});function SinglePassNoder(){this.segInt=null;if(arguments.length===0){}else if(arguments.length===1){var segInt=arguments[0];this.setSegmentIntersector(segInt);}}extend$1(SinglePassNoder.prototype,{setSegmentIntersector:function setSegmentIntersector(segInt){this.segInt=segInt;},interfaces_:function interfaces_(){return[Noder];},getClass:function getClass(){return SinglePassNoder;}});function MCIndexNoder(){this.monoChains=new ArrayList();this.index=new STRtree();this.idCounter=0;this.nodedSegStrings=null;this.nOverlaps=0;if(arguments.length===0){}else if(arguments.length===1){var si=arguments[0];SinglePassNoder.call(this,si);}}inherits$1(MCIndexNoder,SinglePassNoder);extend$1(MCIndexNoder.prototype,{getMonotoneChains:function getMonotoneChains(){return this.monoChains;},getNodedSubstrings:function getNodedSubstrings(){return NodedSegmentString.getNodedSubstrings(this.nodedSegStrings);},getIndex:function getIndex(){return this.index;},add:function add(segStr){var segChains=MonotoneChainBuilder.getChains(segStr.getCoordinates(),segStr);for(var i=segChains.iterator();i.hasNext();){var mc=i.next();mc.setId(this.idCounter++);this.index.insert(mc.getEnvelope(),mc);this.monoChains.add(mc);}},computeNodes:function computeNodes(inputSegStrings){this.nodedSegStrings=inputSegStrings;for(var i=inputSegStrings.iterator();i.hasNext();){this.add(i.next());}this.intersectChains();},intersectChains:function intersectChains(){var overlapAction=new SegmentOverlapAction(this.segInt);for(var i=this.monoChains.iterator();i.hasNext();){var queryChain=i.next();var overlapChains=this.index.query(queryChain.getEnvelope());for(var j=overlapChains.iterator();j.hasNext();){var testChain=j.next();if(testChain.getId()>queryChain.getId()){queryChain.computeOverlaps(testChain,overlapAction);this.nOverlaps++;}if(this.segInt.isDone())return null;}}},interfaces_:function interfaces_(){return[];},getClass:function getClass(){return MCIndexNoder;}});function SegmentOverlapAction(){MonotoneChainOverlapAction.apply(this);this.si=null;var si=arguments[0];this.si=si;}inherits$1(SegmentOverlapAction,MonotoneChainOverlapAction);extend$1(SegmentOverlapAction.prototype,{overlap:function overlap(){if(arguments.length===4){var mc1=arguments[0],start1=arguments[1],mc2=arguments[2],start2=arguments[3];var ss1=mc1.getContext();var ss2=mc2.getContext();this.si.processIntersections(ss1,start1,ss2,start2);}else return MonotoneChainOverlapAction.prototype.overlap.apply(this,arguments);},interfaces_:function interfaces_(){return[];},getClass:function getClass(){return SegmentOverlapAction;}});MCIndexNoder.SegmentOverlapAction=SegmentOverlapAction;function SegmentIntersector$1(){}extend$1(SegmentIntersector$1.prototype,{processIntersections:function processIntersections(e0,segIndex0,e1,segIndex1){},isDone:function isDone(){},interfaces_:function interfaces_(){return[];},getClass:function getClass(){return SegmentIntersector$1;}});function InteriorIntersectionFinder(){this.findAllIntersections=false;this.isCheckEndSegmentsOnly=false;this.li=null;this.interiorIntersection=null;this.intSegments=null;this.intersections=new ArrayList();this.intersectionCount=0;this.keepIntersections=true;var li=arguments[0];this.li=li;this.interiorIntersection=null;}extend$1(InteriorIntersectionFinder.prototype,{getInteriorIntersection:function getInteriorIntersection(){return this.interiorIntersection;},setCheckEndSegmentsOnly:function setCheckEndSegmentsOnly(isCheckEndSegmentsOnly){this.isCheckEndSegmentsOnly=isCheckEndSegmentsOnly;},getIntersectionSegments:function getIntersectionSegments(){return this.intSegments;},count:function count(){return this.intersectionCount;},getIntersections:function getIntersections(){return this.intersections;},setFindAllIntersections:function setFindAllIntersections(findAllIntersections){this.findAllIntersections=findAllIntersections;},setKeepIntersections:function setKeepIntersections(keepIntersections){this.keepIntersections=keepIntersections;},processIntersections:function processIntersections(e0,segIndex0,e1,segIndex1){if(!this.findAllIntersections&&this.hasIntersection())return null;if(e0===e1&&segIndex0===segIndex1)return null;if(this.isCheckEndSegmentsOnly){var isEndSegPresent=this.isEndSegment(e0,segIndex0)||this.isEndSegment(e1,segIndex1);if(!isEndSegPresent)return null;}var p00=e0.getCoordinates()[segIndex0];var p01=e0.getCoordinates()[segIndex0+1];var p10=e1.getCoordinates()[segIndex1];var p11=e1.getCoordinates()[segIndex1+1];this.li.computeIntersection(p00,p01,p10,p11);if(this.li.hasIntersection()){if(this.li.isInteriorIntersection()){this.intSegments=new Array(4).fill(null);this.intSegments[0]=p00;this.intSegments[1]=p01;this.intSegments[2]=p10;this.intSegments[3]=p11;this.interiorIntersection=this.li.getIntersection(0);if(this.keepIntersections)this.intersections.add(this.interiorIntersection);this.intersectionCount++;}}},isEndSegment:function isEndSegment(segStr,index){if(index===0)return true;if(index>=segStr.size()-2)return true;return false;},hasIntersection:function hasIntersection(){return this.interiorIntersection!==null;},isDone:function isDone(){if(this.findAllIntersections)return false;return this.interiorIntersection!==null;},interfaces_:function interfaces_(){return[SegmentIntersector$1];},getClass:function getClass(){return InteriorIntersectionFinder;}});InteriorIntersectionFinder.createAllIntersectionsFinder=function(li){var finder=new InteriorIntersectionFinder(li);finder.setFindAllIntersections(true);return finder;};InteriorIntersectionFinder.createAnyIntersectionFinder=function(li){return new InteriorIntersectionFinder(li);};InteriorIntersectionFinder.createIntersectionCounter=function(li){var finder=new InteriorIntersectionFinder(li);finder.setFindAllIntersections(true);finder.setKeepIntersections(false);return finder;};function FastNodingValidator(){this.li=new RobustLineIntersector();this.segStrings=null;this.findAllIntersections=false;this.segInt=null;this._isValid=true;var segStrings=arguments[0];this.segStrings=segStrings;}extend$1(FastNodingValidator.prototype,{execute:function execute(){if(this.segInt!==null)return null;this.checkInteriorIntersections();},getIntersections:function getIntersections(){return this.segInt.getIntersections();},isValid:function isValid(){this.execute();return this._isValid;},setFindAllIntersections:function setFindAllIntersections(findAllIntersections){this.findAllIntersections=findAllIntersections;},checkInteriorIntersections:function checkInteriorIntersections(){this._isValid=true;this.segInt=new InteriorIntersectionFinder(this.li);this.segInt.setFindAllIntersections(this.findAllIntersections);var noder=new MCIndexNoder();noder.setSegmentIntersector(this.segInt);noder.computeNodes(this.segStrings);if(this.segInt.hasIntersection()){this._isValid=false;return null;}},checkValid:function checkValid(){this.execute();if(!this._isValid)throw new TopologyException(this.getErrorMessage(),this.segInt.getInteriorIntersection());},getErrorMessage:function getErrorMessage(){if(this._isValid)return"no intersections found";var intSegs=this.segInt.getIntersectionSegments();return"found non-noded intersection between "+WKTWriter.toLineString(intSegs[0],intSegs[1])+" and "+WKTWriter.toLineString(intSegs[2],intSegs[3]);},interfaces_:function interfaces_(){return[];},getClass:function getClass(){return FastNodingValidator;}});FastNodingValidator.computeIntersections=function(segStrings){var nv=new FastNodingValidator(segStrings);nv.setFindAllIntersections(true);nv.isValid();return nv.getIntersections();};function EdgeNodingValidator(){this.nv=null;var edges=arguments[0];this.nv=new FastNodingValidator(EdgeNodingValidator.toSegmentStrings(edges));}extend$1(EdgeNodingValidator.prototype,{checkValid:function checkValid(){this.nv.checkValid();},interfaces_:function interfaces_(){return[];},getClass:function getClass(){return EdgeNodingValidator;}});EdgeNodingValidator.toSegmentStrings=function(edges){var segStrings=new ArrayList();for(var i=edges.iterator();i.hasNext();){var e=i.next();segStrings.add(new BasicSegmentString(e.getCoordinates(),e));}return segStrings;};EdgeNodingValidator.checkValid=function(edges){var validator=new EdgeNodingValidator(edges);validator.checkValid();};function PolygonBuilder(){this.geometryFactory=null;this.shellList=new ArrayList();var geometryFactory=arguments[0];this.geometryFactory=geometryFactory;}extend$1(PolygonBuilder.prototype,{sortShellsAndHoles:function sortShellsAndHoles(edgeRings,shellList,freeHoleList){for(var it=edgeRings.iterator();it.hasNext();){var er=it.next();if(er.isHole()){freeHoleList.add(er);}else{shellList.add(er);}}},computePolygons:function computePolygons(shellList){var resultPolyList=new ArrayList();for(var it=shellList.iterator();it.hasNext();){var er=it.next();var poly=er.toPolygon(this.geometryFactory);resultPolyList.add(poly);}return resultPolyList;},placeFreeHoles:function placeFreeHoles(shellList,freeHoleList){for(var it=freeHoleList.iterator();it.hasNext();){var hole=it.next();if(hole.getShell()===null){var shell=this.findEdgeRingContaining(hole,shellList);if(shell===null)throw new TopologyException("unable to assign hole to a shell",hole.getCoordinate(0));hole.setShell(shell);}}},buildMinimalEdgeRings:function buildMinimalEdgeRings(maxEdgeRings,shellList,freeHoleList){var edgeRings=new ArrayList();for(var it=maxEdgeRings.iterator();it.hasNext();){var er=it.next();if(er.getMaxNodeDegree()>2){er.linkDirectedEdgesForMinimalEdgeRings();var minEdgeRings=er.buildMinimalRings();var shell=this.findShell(minEdgeRings);if(shell!==null){this.placePolygonHoles(shell,minEdgeRings);shellList.add(shell);}else{freeHoleList.addAll(minEdgeRings);}}else{edgeRings.add(er);}}return edgeRings;},containsPoint:function containsPoint(p){for(var it=this.shellList.iterator();it.hasNext();){var er=it.next();if(er.containsPoint(p))return true;}return false;},buildMaximalEdgeRings:function buildMaximalEdgeRings(dirEdges){var maxEdgeRings=new ArrayList();for(var it=dirEdges.iterator();it.hasNext();){var de=it.next();if(de.isInResult()&&de.getLabel().isArea()){if(de.getEdgeRing()===null){var er=new MaximalEdgeRing(de,this.geometryFactory);maxEdgeRings.add(er);er.setInResult();}}}return maxEdgeRings;},placePolygonHoles:function placePolygonHoles(shell,minEdgeRings){for(var it=minEdgeRings.iterator();it.hasNext();){var er=it.next();if(er.isHole()){er.setShell(shell);}}},getPolygons:function getPolygons(){var resultPolyList=this.computePolygons(this.shellList);return resultPolyList;},findEdgeRingContaining:function findEdgeRingContaining(testEr,shellList){var testRing=testEr.getLinearRing();var testEnv=testRing.getEnvelopeInternal();var testPt=testRing.getCoordinateN(0);var minShell=null;var minEnv=null;for(var it=shellList.iterator();it.hasNext();){var tryShell=it.next();var tryRing=tryShell.getLinearRing();var tryEnv=tryRing.getEnvelopeInternal();if(minShell!==null)minEnv=minShell.getLinearRing().getEnvelopeInternal();var isContained=false;if(tryEnv.contains(testEnv)&&CGAlgorithms.isPointInRing(testPt,tryRing.getCoordinates()))isContained=true;if(isContained){if(minShell===null||minEnv.contains(tryEnv)){minShell=tryShell;}}}return minShell;},findShell:function findShell(minEdgeRings){var shellCount=0;var shell=null;for(var it=minEdgeRings.iterator();it.hasNext();){var er=it.next();if(!er.isHole()){shell=er;shellCount++;}}Assert.isTrue(shellCount<=1,"found two shells in MinimalEdgeRing list");return shell;},add:function add(){if(arguments.length===1){var graph=arguments[0];this.add(graph.getEdgeEnds(),graph.getNodes());}else if(arguments.length===2){var dirEdges=arguments[0],nodes=arguments[1];PlanarGraph.linkResultDirectedEdges(nodes);var maxEdgeRings=this.buildMaximalEdgeRings(dirEdges);var freeHoleList=new ArrayList();var edgeRings=this.buildMinimalEdgeRings(maxEdgeRings,this.shellList,freeHoleList);this.sortShellsAndHoles(edgeRings,this.shellList,freeHoleList);this.placeFreeHoles(this.shellList,freeHoleList);}},interfaces_:function interfaces_(){return[];},getClass:function getClass(){return PolygonBuilder;}});function LineBuilder(){this.op=null;this.geometryFactory=null;this.ptLocator=null;this.lineEdgesList=new ArrayList();this.resultLineList=new ArrayList();var op=arguments[0],geometryFactory=arguments[1],ptLocator=arguments[2];this.op=op;this.geometryFactory=geometryFactory;this.ptLocator=ptLocator;}extend$1(LineBuilder.prototype,{collectLines:function collectLines(opCode){for(var it=this.op.getGraph().getEdgeEnds().iterator();it.hasNext();){var de=it.next();this.collectLineEdge(de,opCode,this.lineEdgesList);this.collectBoundaryTouchEdge(de,opCode,this.lineEdgesList);}},labelIsolatedLine:function labelIsolatedLine(e,targetIndex){var loc=this.ptLocator.locate(e.getCoordinate(),this.op.getArgGeometry(targetIndex));e.getLabel().setLocation(targetIndex,loc);},build:function build(opCode){this.findCoveredLineEdges();this.collectLines(opCode);this.buildLines(opCode);return this.resultLineList;},collectLineEdge:function collectLineEdge(de,opCode,edges){var label=de.getLabel();var e=de.getEdge();if(de.isLineEdge()){if(!de.isVisited()&&OverlayOp.isResultOfOp(label,opCode)&&!e.isCovered()){edges.add(e);de.setVisitedEdge(true);}}},findCoveredLineEdges:function findCoveredLineEdges(){for(var nodeit=this.op.getGraph().getNodes().iterator();nodeit.hasNext();){var node=nodeit.next();node.getEdges().findCoveredLineEdges();}for(var it=this.op.getGraph().getEdgeEnds().iterator();it.hasNext();){var de=it.next();var e=de.getEdge();if(de.isLineEdge()&&!e.isCoveredSet()){var isCovered=this.op.isCoveredByA(de.getCoordinate());e.setCovered(isCovered);}}},labelIsolatedLines:function labelIsolatedLines(edgesList){for(var it=edgesList.iterator();it.hasNext();){var e=it.next();var label=e.getLabel();if(e.isIsolated()){if(label.isNull(0))this.labelIsolatedLine(e,0);else this.labelIsolatedLine(e,1);}}},buildLines:function buildLines(opCode){for(var it=this.lineEdgesList.iterator();it.hasNext();){var e=it.next();var label=e.getLabel();var line=this.geometryFactory.createLineString(e.getCoordinates());this.resultLineList.add(line);e.setInResult(true);}},collectBoundaryTouchEdge:function collectBoundaryTouchEdge(de,opCode,edges){var label=de.getLabel();if(de.isLineEdge())return null;if(de.isVisited())return null;if(de.isInteriorAreaEdge())return null;if(de.getEdge().isInResult())return null;Assert.isTrue(!(de.isInResult()||de.getSym().isInResult())||!de.getEdge().isInResult());if(OverlayOp.isResultOfOp(label,opCode)&&opCode===OverlayOp.INTERSECTION){edges.add(de.getEdge());de.setVisitedEdge(true);}},interfaces_:function interfaces_(){return[];},getClass:function getClass(){return LineBuilder;}});function PointBuilder(){this.op=null;this.geometryFactory=null;this.resultPointList=new ArrayList();var op=arguments[0],geometryFactory=arguments[1];this.op=op;this.geometryFactory=geometryFactory;}extend$1(PointBuilder.prototype,{filterCoveredNodeToPoint:function filterCoveredNodeToPoint(n){var coord=n.getCoordinate();if(!this.op.isCoveredByLA(coord)){var pt=this.geometryFactory.createPoint(coord);this.resultPointList.add(pt);}},extractNonCoveredResultNodes:function extractNonCoveredResultNodes(opCode){for(var nodeit=this.op.getGraph().getNodes().iterator();nodeit.hasNext();){var n=nodeit.next();if(n.isInResult())continue;if(n.isIncidentEdgeInResult())continue;if(n.getEdges().getDegree()===0||opCode===OverlayOp.INTERSECTION){var label=n.getLabel();if(OverlayOp.isResultOfOp(label,opCode)){this.filterCoveredNodeToPoint(n);}}}},build:function build(opCode){this.extractNonCoveredResultNodes(opCode);return this.resultPointList;},interfaces_:function interfaces_(){return[];},getClass:function getClass(){return PointBuilder;}});function GeometryGraphOperation(){this.li=new RobustLineIntersector();this.resultPrecisionModel=null;this.arg=null;if(arguments.length===1){var g0=arguments[0];this.setComputationPrecision(g0.getPrecisionModel());this.arg=new Array(1).fill(null);this.arg[0]=new GeometryGraph(0,g0);}else if(arguments.length===2){var g0=arguments[0],g1=arguments[1];GeometryGraphOperation.call(this,g0,g1,BoundaryNodeRule.OGC_SFS_BOUNDARY_RULE);}else if(arguments.length===3){var g0=arguments[0],g1=arguments[1],boundaryNodeRule=arguments[2];if(g0.getPrecisionModel().compareTo(g1.getPrecisionModel())>=0)this.setComputationPrecision(g0.getPrecisionModel());else this.setComputationPrecision(g1.getPrecisionModel());this.arg=new Array(2).fill(null);this.arg[0]=new GeometryGraph(0,g0,boundaryNodeRule);this.arg[1]=new GeometryGraph(1,g1,boundaryNodeRule);}}extend$1(GeometryGraphOperation.prototype,{getArgGeometry:function getArgGeometry(i){return this.arg[i].getGeometry();},setComputationPrecision:function setComputationPrecision(pm){this.resultPrecisionModel=pm;this.li.setPrecisionModel(this.resultPrecisionModel);},interfaces_:function interfaces_(){return[];},getClass:function getClass(){return GeometryGraphOperation;}});function OrientedCoordinateArray(){this.pts=null;this._orientation=null;var pts=arguments[0];this.pts=pts;this._orientation=OrientedCoordinateArray.orientation(pts);}extend$1(OrientedCoordinateArray.prototype,{compareTo:function compareTo(o1){var oca=o1;var comp=OrientedCoordinateArray.compareOriented(this.pts,this._orientation,oca.pts,oca._orientation);return comp;},interfaces_:function interfaces_(){return[Comparable];},getClass:function getClass(){return OrientedCoordinateArray;}});OrientedCoordinateArray.orientation=function(pts){return CoordinateArrays.increasingDirection(pts)===1;};OrientedCoordinateArray.compareOriented=function(pts1,orientation1,pts2,orientation2){var dir1=orientation1?1:-1;var dir2=orientation2?1:-1;var limit1=orientation1?pts1.length:-1;var limit2=orientation2?pts2.length:-1;var i1=orientation1?0:pts1.length-1;var i2=orientation2?0:pts2.length-1;while(true){var compPt=pts1[i1].compareTo(pts2[i2]);if(compPt!==0)return compPt;i1+=dir1;i2+=dir2;var done1=i1===limit1;var done2=i2===limit2;if(done1&&!done2)return-1;if(!done1&&done2)return 1;if(done1&&done2)return 0;}};function EdgeList(){this.edges=new ArrayList();this.ocaMap=new TreeMap();}extend$1(EdgeList.prototype,{print:function print(out){out.print("MULTILINESTRING ( ");for(var j=0;j<this.edges.size();j++){var e=this.edges.get(j);if(j>0)out.print(",");out.print("(");var pts=e.getCoordinates();for(var i=0;i<pts.length;i++){if(i>0)out.print(",");out.print(pts[i].x+" "+pts[i].y);}out.println(")");}out.print(")  ");},addAll:function addAll(edgeColl){for(var i=edgeColl.iterator();i.hasNext();){this.add(i.next());}},findEdgeIndex:function findEdgeIndex(e){for(var i=0;i<this.edges.size();i++){if(this.edges.get(i).equals(e))return i;}return-1;},iterator:function iterator(){return this.edges.iterator();},getEdges:function getEdges(){return this.edges;},get:function get$$1(i){return this.edges.get(i);},findEqualEdge:function findEqualEdge(e){var oca=new OrientedCoordinateArray(e.getCoordinates());var matchEdge=this.ocaMap.get(oca);return matchEdge;},add:function add(e){this.edges.add(e);var oca=new OrientedCoordinateArray(e.getCoordinates());this.ocaMap.put(oca,e);},interfaces_:function interfaces_(){return[];},getClass:function getClass(){return EdgeList;}});function OverlayOp(){this.ptLocator=new PointLocator();this.geomFact=null;this.resultGeom=null;this.graph=null;this.edgeList=new EdgeList();this.resultPolyList=new ArrayList();this.resultLineList=new ArrayList();this.resultPointList=new ArrayList();var g0=arguments[0],g1=arguments[1];GeometryGraphOperation.call(this,g0,g1);this.graph=new PlanarGraph(new OverlayNodeFactory());this.geomFact=g0.getFactory();}inherits$1(OverlayOp,GeometryGraphOperation);extend$1(OverlayOp.prototype,{insertUniqueEdge:function insertUniqueEdge(e){var existingEdge=this.edgeList.findEqualEdge(e);if(existingEdge!==null){var existingLabel=existingEdge.getLabel();var labelToMerge=e.getLabel();if(!existingEdge.isPointwiseEqual(e)){labelToMerge=new Label(e.getLabel());labelToMerge.flip();}var depth=existingEdge.getDepth();if(depth.isNull()){depth.add(existingLabel);}depth.add(labelToMerge);existingLabel.merge(labelToMerge);}else{this.edgeList.add(e);}},getGraph:function getGraph(){return this.graph;},cancelDuplicateResultEdges:function cancelDuplicateResultEdges(){for(var it=this.graph.getEdgeEnds().iterator();it.hasNext();){var de=it.next();var sym=de.getSym();if(de.isInResult()&&sym.isInResult()){de.setInResult(false);sym.setInResult(false);}}},isCoveredByLA:function isCoveredByLA(coord){if(this.isCovered(coord,this.resultLineList))return true;if(this.isCovered(coord,this.resultPolyList))return true;return false;},computeGeometry:function computeGeometry(resultPointList,resultLineList,resultPolyList,opcode){var geomList=new ArrayList();geomList.addAll(resultPointList);geomList.addAll(resultLineList);geomList.addAll(resultPolyList);if(geomList.isEmpty())return OverlayOp.createEmptyResult(opcode,this.arg[0].getGeometry(),this.arg[1].getGeometry(),this.geomFact);return this.geomFact.buildGeometry(geomList);},mergeSymLabels:function mergeSymLabels(){for(var nodeit=this.graph.getNodes().iterator();nodeit.hasNext();){var node=nodeit.next();node.getEdges().mergeSymLabels();}},isCovered:function isCovered(coord,geomList){for(var it=geomList.iterator();it.hasNext();){var geom=it.next();var loc=this.ptLocator.locate(coord,geom);if(loc!==Location.EXTERIOR)return true;}return false;},replaceCollapsedEdges:function replaceCollapsedEdges(){var newEdges=new ArrayList();for(var it=this.edgeList.iterator();it.hasNext();){var e=it.next();if(e.isCollapsed()){it.remove();newEdges.add(e.getCollapsedEdge());}}this.edgeList.addAll(newEdges);},updateNodeLabelling:function updateNodeLabelling(){for(var nodeit=this.graph.getNodes().iterator();nodeit.hasNext();){var node=nodeit.next();var lbl=node.getEdges().getLabel();node.getLabel().merge(lbl);}},getResultGeometry:function getResultGeometry(overlayOpCode){this.computeOverlay(overlayOpCode);return this.resultGeom;},insertUniqueEdges:function insertUniqueEdges(edges){for(var i=edges.iterator();i.hasNext();){var e=i.next();this.insertUniqueEdge(e);}},computeOverlay:function computeOverlay(opCode){this.copyPoints(0);this.copyPoints(1);this.arg[0].computeSelfNodes(this.li,false);this.arg[1].computeSelfNodes(this.li,false);this.arg[0].computeEdgeIntersections(this.arg[1],this.li,true);var baseSplitEdges=new ArrayList();this.arg[0].computeSplitEdges(baseSplitEdges);this.arg[1].computeSplitEdges(baseSplitEdges);this.insertUniqueEdges(baseSplitEdges);this.computeLabelsFromDepths();this.replaceCollapsedEdges();EdgeNodingValidator.checkValid(this.edgeList.getEdges());this.graph.addEdges(this.edgeList.getEdges());this.computeLabelling();this.labelIncompleteNodes();this.findResultAreaEdges(opCode);this.cancelDuplicateResultEdges();var polyBuilder=new PolygonBuilder(this.geomFact);polyBuilder.add(this.graph);this.resultPolyList=polyBuilder.getPolygons();var lineBuilder=new LineBuilder(this,this.geomFact,this.ptLocator);this.resultLineList=lineBuilder.build(opCode);var pointBuilder=new PointBuilder(this,this.geomFact,this.ptLocator);this.resultPointList=pointBuilder.build(opCode);this.resultGeom=this.computeGeometry(this.resultPointList,this.resultLineList,this.resultPolyList,opCode);},labelIncompleteNode:function labelIncompleteNode(n,targetIndex){var loc=this.ptLocator.locate(n.getCoordinate(),this.arg[targetIndex].getGeometry());n.getLabel().setLocation(targetIndex,loc);},copyPoints:function copyPoints(argIndex){for(var i=this.arg[argIndex].getNodeIterator();i.hasNext();){var graphNode=i.next();var newNode=this.graph.addNode(graphNode.getCoordinate());newNode.setLabel(argIndex,graphNode.getLabel().getLocation(argIndex));}},findResultAreaEdges:function findResultAreaEdges(opCode){for(var it=this.graph.getEdgeEnds().iterator();it.hasNext();){var de=it.next();var label=de.getLabel();if(label.isArea()&&!de.isInteriorAreaEdge()&&OverlayOp.isResultOfOp(label.getLocation(0,Position.RIGHT),label.getLocation(1,Position.RIGHT),opCode)){de.setInResult(true);}}},computeLabelsFromDepths:function computeLabelsFromDepths(){for(var it=this.edgeList.iterator();it.hasNext();){var e=it.next();var lbl=e.getLabel();var depth=e.getDepth();if(!depth.isNull()){depth.normalize();for(var i=0;i<2;i++){if(!lbl.isNull(i)&&lbl.isArea()&&!depth.isNull(i)){if(depth.getDelta(i)===0){lbl.toLine(i);}else{Assert.isTrue(!depth.isNull(i,Position.LEFT),"depth of LEFT side has not been initialized");lbl.setLocation(i,Position.LEFT,depth.getLocation(i,Position.LEFT));Assert.isTrue(!depth.isNull(i,Position.RIGHT),"depth of RIGHT side has not been initialized");lbl.setLocation(i,Position.RIGHT,depth.getLocation(i,Position.RIGHT));}}}}}},computeLabelling:function computeLabelling(){for(var nodeit=this.graph.getNodes().iterator();nodeit.hasNext();){var node=nodeit.next();node.getEdges().computeLabelling(this.arg);}this.mergeSymLabels();this.updateNodeLabelling();},labelIncompleteNodes:function labelIncompleteNodes(){for(var ni=this.graph.getNodes().iterator();ni.hasNext();){var n=ni.next();var label=n.getLabel();if(n.isIsolated()){if(label.isNull(0))this.labelIncompleteNode(n,0);else this.labelIncompleteNode(n,1);}n.getEdges().updateLabelling(label);}},isCoveredByA:function isCoveredByA(coord){if(this.isCovered(coord,this.resultPolyList))return true;return false;},interfaces_:function interfaces_(){return[];},getClass:function getClass(){return OverlayOp;}});OverlayOp.overlayOp=function(geom0,geom1,opCode){var gov=new OverlayOp(geom0,geom1);var geomOv=gov.getResultGeometry(opCode);return geomOv;};OverlayOp.intersection=function(g,other){if(g.isEmpty()||other.isEmpty())return OverlayOp.createEmptyResult(OverlayOp.INTERSECTION,g,other,g.getFactory());if(g.isGeometryCollection()){var g2=other;return GeometryCollectionMapper.map(g,{interfaces_:function interfaces_(){return[MapOp];},map:function map(g){return g.intersection(g2);}});}g.checkNotGeometryCollection(g);g.checkNotGeometryCollection(other);return SnapIfNeededOverlayOp.overlayOp(g,other,OverlayOp.INTERSECTION);};OverlayOp.symDifference=function(g,other){if(g.isEmpty()||other.isEmpty()){if(g.isEmpty()&&other.isEmpty())return OverlayOp.createEmptyResult(OverlayOp.SYMDIFFERENCE,g,other,g.getFactory());if(g.isEmpty())return other.copy();if(other.isEmpty())return g.copy();}g.checkNotGeometryCollection(g);g.checkNotGeometryCollection(other);return SnapIfNeededOverlayOp.overlayOp(g,other,OverlayOp.SYMDIFFERENCE);};OverlayOp.resultDimension=function(opCode,g0,g1){var dim0=g0.getDimension();var dim1=g1.getDimension();var resultDimension=-1;switch(opCode){case OverlayOp.INTERSECTION:resultDimension=Math.min(dim0,dim1);break;case OverlayOp.UNION:resultDimension=Math.max(dim0,dim1);break;case OverlayOp.DIFFERENCE:resultDimension=dim0;break;case OverlayOp.SYMDIFFERENCE:resultDimension=Math.max(dim0,dim1);break;}return resultDimension;};OverlayOp.createEmptyResult=function(overlayOpCode,a,b,geomFact){var result=null;switch(OverlayOp.resultDimension(overlayOpCode,a,b)){case-1:result=geomFact.createGeometryCollection(new Array(0).fill(null));break;case 0:result=geomFact.createPoint();break;case 1:result=geomFact.createLineString();break;case 2:result=geomFact.createPolygon();break;}return result;};OverlayOp.difference=function(g,other){if(g.isEmpty())return OverlayOp.createEmptyResult(OverlayOp.DIFFERENCE,g,other,g.getFactory());if(other.isEmpty())return g.copy();g.checkNotGeometryCollection(g);g.checkNotGeometryCollection(other);return SnapIfNeededOverlayOp.overlayOp(g,other,OverlayOp.DIFFERENCE);};OverlayOp.isResultOfOp=function(){if(arguments.length===2){var label=arguments[0],opCode=arguments[1];var loc0=label.getLocation(0);var loc1=label.getLocation(1);return OverlayOp.isResultOfOp(loc0,loc1,opCode);}else if(arguments.length===3){var loc0=arguments[0],loc1=arguments[1],overlayOpCode=arguments[2];if(loc0===Location.BOUNDARY)loc0=Location.INTERIOR;if(loc1===Location.BOUNDARY)loc1=Location.INTERIOR;switch(overlayOpCode){case OverlayOp.INTERSECTION:return loc0===Location.INTERIOR&&loc1===Location.INTERIOR;case OverlayOp.UNION:return loc0===Location.INTERIOR||loc1===Location.INTERIOR;case OverlayOp.DIFFERENCE:return loc0===Location.INTERIOR&&loc1!==Location.INTERIOR;case OverlayOp.SYMDIFFERENCE:return loc0===Location.INTERIOR&&loc1!==Location.INTERIOR||loc0!==Location.INTERIOR&&loc1===Location.INTERIOR;}return false;}};OverlayOp.INTERSECTION=1;OverlayOp.UNION=2;OverlayOp.DIFFERENCE=3;OverlayOp.SYMDIFFERENCE=4;function SnapOverlayOp(){this.geom=new Array(2).fill(null);this.snapTolerance=null;this.cbr=null;var g1=arguments[0],g2=arguments[1];this.geom[0]=g1;this.geom[1]=g2;this.computeSnapTolerance();}extend$1(SnapOverlayOp.prototype,{selfSnap:function selfSnap(geom){var snapper0=new GeometrySnapper(geom);var snapGeom=snapper0.snapTo(geom,this.snapTolerance);return snapGeom;},removeCommonBits:function removeCommonBits(geom){this.cbr=new CommonBitsRemover();this.cbr.add(geom[0]);this.cbr.add(geom[1]);var remGeom=new Array(2).fill(null);remGeom[0]=this.cbr.removeCommonBits(geom[0].copy());remGeom[1]=this.cbr.removeCommonBits(geom[1].copy());return remGeom;},prepareResult:function prepareResult(geom){this.cbr.addCommonBits(geom);return geom;},getResultGeometry:function getResultGeometry(opCode){var prepGeom=this.snap(this.geom);var result=OverlayOp.overlayOp(prepGeom[0],prepGeom[1],opCode);return this.prepareResult(result);},checkValid:function checkValid(g){if(!g.isValid()){System.out.println("Snapped geometry is invalid");}},computeSnapTolerance:function computeSnapTolerance(){this.snapTolerance=GeometrySnapper.computeOverlaySnapTolerance(this.geom[0],this.geom[1]);},snap:function snap(geom){var remGeom=this.removeCommonBits(geom);var snapGeom=GeometrySnapper.snap(remGeom[0],remGeom[1],this.snapTolerance);return snapGeom;},interfaces_:function interfaces_(){return[];},getClass:function getClass(){return SnapOverlayOp;}});SnapOverlayOp.overlayOp=function(g0,g1,opCode){var op=new SnapOverlayOp(g0,g1);return op.getResultGeometry(opCode);};SnapOverlayOp.union=function(g0,g1){return SnapOverlayOp.overlayOp(g0,g1,OverlayOp.UNION);};SnapOverlayOp.intersection=function(g0,g1){return SnapOverlayOp.overlayOp(g0,g1,OverlayOp.INTERSECTION);};SnapOverlayOp.symDifference=function(g0,g1){return SnapOverlayOp.overlayOp(g0,g1,OverlayOp.SYMDIFFERENCE);};SnapOverlayOp.difference=function(g0,g1){return SnapOverlayOp.overlayOp(g0,g1,OverlayOp.DIFFERENCE);};function SnapIfNeededOverlayOp(){this.geom=new Array(2).fill(null);var g1=arguments[0],g2=arguments[1];this.geom[0]=g1;this.geom[1]=g2;}extend$1(SnapIfNeededOverlayOp.prototype,{getResultGeometry:function getResultGeometry(opCode){var result=null;var isSuccess=false;var savedException=null;try{result=OverlayOp.overlayOp(this.geom[0],this.geom[1],opCode);var isValid=true;if(isValid)isSuccess=true;}catch(ex){if(ex instanceof RuntimeException){savedException=ex;}else throw ex;}finally{}if(!isSuccess){try{result=SnapOverlayOp.overlayOp(this.geom[0],this.geom[1],opCode);}catch(ex){if(ex instanceof RuntimeException){throw savedException;}else throw ex;}finally{}}return result;},interfaces_:function interfaces_(){return[];},getClass:function getClass(){return SnapIfNeededOverlayOp;}});SnapIfNeededOverlayOp.overlayOp=function(g0,g1,opCode){var op=new SnapIfNeededOverlayOp(g0,g1);return op.getResultGeometry(opCode);};SnapIfNeededOverlayOp.union=function(g0,g1){return SnapIfNeededOverlayOp.overlayOp(g0,g1,OverlayOp.UNION);};SnapIfNeededOverlayOp.intersection=function(g0,g1){return SnapIfNeededOverlayOp.overlayOp(g0,g1,OverlayOp.INTERSECTION);};SnapIfNeededOverlayOp.symDifference=function(g0,g1){return SnapIfNeededOverlayOp.overlayOp(g0,g1,OverlayOp.SYMDIFFERENCE);};SnapIfNeededOverlayOp.difference=function(g0,g1){return SnapIfNeededOverlayOp.overlayOp(g0,g1,OverlayOp.DIFFERENCE);};function InteriorPointArea(){this.factory=null;this.interiorPoint=null;this.maxWidth=0.0;var g=arguments[0];this.factory=g.getFactory();this.add(g);}extend$1(InteriorPointArea.prototype,{addPolygon:function addPolygon(geometry){if(geometry.isEmpty())return null;var intPt=null;var width=0;var bisector=this.horizontalBisector(geometry);if(bisector.getLength()===0.0){width=0;intPt=bisector.getCoordinate();}else{var intersections=SnapIfNeededOverlayOp.overlayOp(bisector,geometry,OverlayOp.INTERSECTION);var widestIntersection=this.widestGeometry(intersections);width=widestIntersection.getEnvelopeInternal().getWidth();intPt=InteriorPointArea.centre(widestIntersection.getEnvelopeInternal());}if(this.interiorPoint===null||width>this.maxWidth){this.interiorPoint=intPt;this.maxWidth=width;}},getInteriorPoint:function getInteriorPoint(){return this.interiorPoint;},widestGeometry:function widestGeometry(){if(arguments[0]instanceof GeometryCollection){var gc=arguments[0];if(gc.isEmpty()){return gc;}var widestGeometry=gc.getGeometryN(0);for(var i=1;i<gc.getNumGeometries();i++){if(gc.getGeometryN(i).getEnvelopeInternal().getWidth()>widestGeometry.getEnvelopeInternal().getWidth()){widestGeometry=gc.getGeometryN(i);}}return widestGeometry;}else if(arguments[0]instanceof Geometry){var geometry=arguments[0];if(!(geometry instanceof GeometryCollection)){return geometry;}return this.widestGeometry(geometry);}},horizontalBisector:function horizontalBisector(geometry){var envelope=geometry.getEnvelopeInternal();var bisectY=SafeBisectorFinder.getBisectorY(geometry);return this.factory.createLineString([new Coordinate(envelope.getMinX(),bisectY),new Coordinate(envelope.getMaxX(),bisectY)]);},add:function add(geom){if(geom instanceof Polygon){this.addPolygon(geom);}else if(geom instanceof GeometryCollection){var gc=geom;for(var i=0;i<gc.getNumGeometries();i++){this.add(gc.getGeometryN(i));}}},interfaces_:function interfaces_(){return[];},getClass:function getClass(){return InteriorPointArea;}});InteriorPointArea.centre=function(envelope){return new Coordinate(InteriorPointArea.avg(envelope.getMinX(),envelope.getMaxX()),InteriorPointArea.avg(envelope.getMinY(),envelope.getMaxY()));};InteriorPointArea.avg=function(a,b){return(a+b)/2.0;};function SafeBisectorFinder(){this.poly=null;this.centreY=null;this.hiY=Double.MAX_VALUE;this.loY=-Double.MAX_VALUE;var poly=arguments[0];this.poly=poly;this.hiY=poly.getEnvelopeInternal().getMaxY();this.loY=poly.getEnvelopeInternal().getMinY();this.centreY=InteriorPointArea.avg(this.loY,this.hiY);}extend$1(SafeBisectorFinder.prototype,{updateInterval:function updateInterval(y){if(y<=this.centreY){if(y>this.loY)this.loY=y;}else if(y>this.centreY){if(y<this.hiY){this.hiY=y;}}},getBisectorY:function getBisectorY(){this.process(this.poly.getExteriorRing());for(var i=0;i<this.poly.getNumInteriorRing();i++){this.process(this.poly.getInteriorRingN(i));}var bisectY=InteriorPointArea.avg(this.hiY,this.loY);return bisectY;},process:function process(line){var seq=line.getCoordinateSequence();for(var i=0;i<seq.size();i++){var y=seq.getY(i);this.updateInterval(y);}},interfaces_:function interfaces_(){return[];},getClass:function getClass(){return SafeBisectorFinder;}});SafeBisectorFinder.getBisectorY=function(poly){var finder=new SafeBisectorFinder(poly);return finder.getBisectorY();};InteriorPointArea.SafeBisectorFinder=SafeBisectorFinder;function GeometryCombiner(){this.geomFactory=null;this.skipEmpty=false;this.inputGeoms=null;var geoms=arguments[0];this.geomFactory=GeometryCombiner.extractFactory(geoms);this.inputGeoms=geoms;}extend$1(GeometryCombiner.prototype,{extractElements:function extractElements(geom,elems){if(geom===null)return null;for(var i=0;i<geom.getNumGeometries();i++){var elemGeom=geom.getGeometryN(i);if(this.skipEmpty&&elemGeom.isEmpty())continue;elems.add(elemGeom);}},combine:function combine(){var elems=new ArrayList();for(var i=this.inputGeoms.iterator();i.hasNext();){var g=i.next();this.extractElements(g,elems);}if(elems.size()===0){if(this.geomFactory!==null){return this.geomFactory.createGeometryCollection(null);}return null;}return this.geomFactory.buildGeometry(elems);},interfaces_:function interfaces_(){return[];},getClass:function getClass(){return GeometryCombiner;}});GeometryCombiner.combine=function(){if(arguments.length===1){var geoms=arguments[0];var combiner=new GeometryCombiner(geoms);return combiner.combine();}else if(arguments.length===2){var g0=arguments[0],g1=arguments[1];var combiner=new GeometryCombiner(GeometryCombiner.createList(g0,g1));return combiner.combine();}else if(arguments.length===3){var g0=arguments[0],g1=arguments[1],g2=arguments[2];var combiner=new GeometryCombiner(GeometryCombiner.createList(g0,g1,g2));return combiner.combine();}};GeometryCombiner.extractFactory=function(geoms){if(geoms.isEmpty())return null;return geoms.iterator().next().getFactory();};GeometryCombiner.createList=function(){if(arguments.length===2){var obj0=arguments[0],obj1=arguments[1];var list=new ArrayList();list.add(obj0);list.add(obj1);return list;}else if(arguments.length===3){var obj0=arguments[0],obj1=arguments[1],obj2=arguments[2];var list=new ArrayList();list.add(obj0);list.add(obj1);list.add(obj2);return list;}};function PointGeometryUnion(){this.pointGeom=null;this.otherGeom=null;this.geomFact=null;var pointGeom=arguments[0],otherGeom=arguments[1];this.pointGeom=pointGeom;this.otherGeom=otherGeom;this.geomFact=otherGeom.getFactory();}extend$1(PointGeometryUnion.prototype,{union:function union(){var locater=new PointLocator();var exteriorCoords=new TreeSet();for(var i=0;i<this.pointGeom.getNumGeometries();i++){var point=this.pointGeom.getGeometryN(i);var coord=point.getCoordinate();var loc=locater.locate(coord,this.otherGeom);if(loc===Location.EXTERIOR)exteriorCoords.add(coord);}if(exteriorCoords.size()===0)return this.otherGeom;var ptComp=null;var coords=CoordinateArrays.toCoordinateArray(exteriorCoords);if(coords.length===1){ptComp=this.geomFact.createPoint(coords[0]);}else{ptComp=this.geomFact.createMultiPointFromCoords(coords);}return GeometryCombiner.combine(ptComp,this.otherGeom);},interfaces_:function interfaces_(){return[];},getClass:function getClass(){return PointGeometryUnion;}});PointGeometryUnion.union=function(pointGeom,otherGeom){var unioner=new PointGeometryUnion(pointGeom,otherGeom);return unioner.union();};function GeometryExtracter(){this.sortIndex=-1;this.comps=null;var sortIndex=arguments[0],comps=arguments[1];this.sortIndex=sortIndex;this.comps=comps;}extend$1(GeometryExtracter.prototype,{filter:function filter(geom){if(this.sortIndex===-1||geom.getSortIndex()===this.sortIndex)this.comps.add(geom);},interfaces_:function interfaces_(){return[GeometryFilter];},getClass:function getClass(){return GeometryExtracter;}});GeometryExtracter.extract=function(){if(arguments.length===2){var geom=arguments[0],sortIndex=arguments[1];return GeometryExtracter.extract(geom,sortIndex,new ArrayList());}else if(arguments.length===3){var geom=arguments[0],sortIndex=arguments[1],list=arguments[2];if(geom.getSortIndex()===sortIndex){list.add(geom);}else if(geom instanceof GeometryCollection){geom.apply(new GeometryExtracter(sortIndex,list));}return list;}};function PolygonExtracter(){this.comps=null;var comps=arguments[0];this.comps=comps;}extend$1(PolygonExtracter.prototype,{filter:function filter(geom){if(geom instanceof Polygon)this.comps.add(geom);},interfaces_:function interfaces_(){return[GeometryFilter];},getClass:function getClass(){return PolygonExtracter;}});PolygonExtracter.getPolygons=function(){if(arguments.length===1){var geom=arguments[0];return PolygonExtracter.getPolygons(geom,new ArrayList());}else if(arguments.length===2){var geom=arguments[0],list=arguments[1];if(geom instanceof Polygon){list.add(geom);}else if(geom instanceof GeometryCollection){geom.apply(new PolygonExtracter(list));}return list;}};function CascadedPolygonUnion(){this.inputPolys=null;this.geomFactory=null;var polys=arguments[0];this.inputPolys=polys;if(this.inputPolys===null)this.inputPolys=new ArrayList();}extend$1(CascadedPolygonUnion.prototype,{reduceToGeometries:function reduceToGeometries(geomTree){var geoms=new ArrayList();for(var i=geomTree.iterator();i.hasNext();){var o=i.next();var geom=null;if(hasInterface(o,List)){geom=this.unionTree(o);}else if(o instanceof Geometry){geom=o;}geoms.add(geom);}return geoms;},extractByEnvelope:function extractByEnvelope(env,geom,disjointGeoms){var intersectingGeoms=new ArrayList();for(var i=0;i<geom.getNumGeometries();i++){var elem=geom.getGeometryN(i);if(elem.getEnvelopeInternal().intersects(env))intersectingGeoms.add(elem);else disjointGeoms.add(elem);}return this.geomFactory.buildGeometry(intersectingGeoms);},unionOptimized:function unionOptimized(g0,g1){var g0Env=g0.getEnvelopeInternal();var g1Env=g1.getEnvelopeInternal();if(!g0Env.intersects(g1Env)){var combo=GeometryCombiner.combine(g0,g1);return combo;}if(g0.getNumGeometries()<=1&&g1.getNumGeometries()<=1)return this.unionActual(g0,g1);var commonEnv=g0Env.intersection(g1Env);return this.unionUsingEnvelopeIntersection(g0,g1,commonEnv);},union:function union(){if(this.inputPolys===null)throw new IllegalStateException("union() method cannot be called twice");if(this.inputPolys.isEmpty())return null;this.geomFactory=this.inputPolys.iterator().next().getFactory();var index=new STRtree(CascadedPolygonUnion.STRTREE_NODE_CAPACITY);for(var i=this.inputPolys.iterator();i.hasNext();){var item=i.next();index.insert(item.getEnvelopeInternal(),item);}this.inputPolys=null;var itemTree=index.itemsTree();var unionAll=this.unionTree(itemTree);return unionAll;},binaryUnion:function binaryUnion(){if(arguments.length===1){var geoms=arguments[0];return this.binaryUnion(geoms,0,geoms.size());}else if(arguments.length===3){var geoms=arguments[0],start=arguments[1],end=arguments[2];if(end-start<=1){var g0=CascadedPolygonUnion.getGeometry(geoms,start);return this.unionSafe(g0,null);}else if(end-start===2){return this.unionSafe(CascadedPolygonUnion.getGeometry(geoms,start),CascadedPolygonUnion.getGeometry(geoms,start+1));}else{var mid=Math.trunc((end+start)/2);var g0=this.binaryUnion(geoms,start,mid);var g1=this.binaryUnion(geoms,mid,end);return this.unionSafe(g0,g1);}}},repeatedUnion:function repeatedUnion(geoms){var union=null;for(var i=geoms.iterator();i.hasNext();){var g=i.next();if(union===null)union=g.copy();else union=union.union(g);}return union;},unionSafe:function unionSafe(g0,g1){if(g0===null&&g1===null)return null;if(g0===null)return g1.copy();if(g1===null)return g0.copy();return this.unionOptimized(g0,g1);},unionActual:function unionActual(g0,g1){return CascadedPolygonUnion.restrictToPolygons(g0.union(g1));},unionTree:function unionTree(geomTree){var geoms=this.reduceToGeometries(geomTree);var union=this.binaryUnion(geoms);return union;},unionUsingEnvelopeIntersection:function unionUsingEnvelopeIntersection(g0,g1,common){var disjointPolys=new ArrayList();var g0Int=this.extractByEnvelope(common,g0,disjointPolys);var g1Int=this.extractByEnvelope(common,g1,disjointPolys);var union=this.unionActual(g0Int,g1Int);disjointPolys.add(union);var overallUnion=GeometryCombiner.combine(disjointPolys);return overallUnion;},bufferUnion:function bufferUnion(){if(arguments.length===1){var geoms=arguments[0];var factory=geoms.get(0).getFactory();var gColl=factory.buildGeometry(geoms);var unionAll=gColl.buffer(0.0);return unionAll;}else if(arguments.length===2){var g0=arguments[0],g1=arguments[1];var factory=g0.getFactory();var gColl=factory.createGeometryCollection([g0,g1]);var unionAll=gColl.buffer(0.0);return unionAll;}},interfaces_:function interfaces_(){return[];},getClass:function getClass(){return CascadedPolygonUnion;}});CascadedPolygonUnion.restrictToPolygons=function(g){if(hasInterface(g,Polygonal)){return g;}var polygons=PolygonExtracter.getPolygons(g);if(polygons.size()===1)return polygons.get(0);return g.getFactory().createMultiPolygon(GeometryFactory.toPolygonArray(polygons));};CascadedPolygonUnion.getGeometry=function(list,index){if(index>=list.size())return null;return list.get(index);};CascadedPolygonUnion.union=function(polys){var op=new CascadedPolygonUnion(polys);return op.union();};CascadedPolygonUnion.STRTREE_NODE_CAPACITY=4;function UnaryUnionOp(){this.polygons=new ArrayList();this.lines=new ArrayList();this.points=new ArrayList();this.geomFact=null;if(arguments.length===1){if(hasInterface(arguments[0],Collection)){var geoms=arguments[0];this.extract(geoms);}else if(arguments[0]instanceof Geometry){var geom=arguments[0];this.extract(geom);}}else if(arguments.length===2){var geoms=arguments[0],geomFact=arguments[1];this.geomFact=geomFact;this.extract(geoms);}}extend$1(UnaryUnionOp.prototype,{unionNoOpt:function unionNoOpt(g0){var empty=this.geomFact.createPoint();return SnapIfNeededOverlayOp.overlayOp(g0,empty,OverlayOp.UNION);},unionWithNull:function unionWithNull(g0,g1){if(g0===null&&g1===null)return null;if(g1===null)return g0;if(g0===null)return g1;return g0.union(g1);},extract:function extract(){if(hasInterface(arguments[0],Collection)){var geoms=arguments[0];for(var i=geoms.iterator();i.hasNext();){var geom=i.next();this.extract(geom);}}else if(arguments[0]instanceof Geometry){var geom=arguments[0];if(this.geomFact===null)this.geomFact=geom.getFactory();GeometryExtracter.extract(geom,Geometry.SORTINDEX_POLYGON,this.polygons);GeometryExtracter.extract(geom,Geometry.SORTINDEX_LINESTRING,this.lines);GeometryExtracter.extract(geom,Geometry.SORTINDEX_POINT,this.points);}},union:function union(){if(this.geomFact===null){return null;}var unionPoints=null;if(this.points.size()>0){var ptGeom=this.geomFact.buildGeometry(this.points);unionPoints=this.unionNoOpt(ptGeom);}var unionLines=null;if(this.lines.size()>0){var lineGeom=this.geomFact.buildGeometry(this.lines);unionLines=this.unionNoOpt(lineGeom);}var unionPolygons=null;if(this.polygons.size()>0){unionPolygons=CascadedPolygonUnion.union(this.polygons);}var unionLA=this.unionWithNull(unionLines,unionPolygons);var union=null;if(unionPoints===null)union=unionLA;else if(unionLA===null)union=unionPoints;else union=PointGeometryUnion.union(unionPoints,unionLA);if(union===null)return this.geomFact.createGeometryCollection();return union;},interfaces_:function interfaces_(){return[];},getClass:function getClass(){return UnaryUnionOp;}});UnaryUnionOp.union=function(){if(arguments.length===1){if(hasInterface(arguments[0],Collection)){var geoms=arguments[0];var op=new UnaryUnionOp(geoms);return op.union();}else if(arguments[0]instanceof Geometry){var geom=arguments[0];var op=new UnaryUnionOp(geom);return op.union();}}else if(arguments.length===2){var geoms=arguments[0],geomFact=arguments[1];var op=new UnaryUnionOp(geoms,geomFact);return op.union();}};function UnionOp(){}extend$1(UnionOp.prototype,{interfaces_:function interfaces_(){return[];},getClass:function getClass(){return UnionOp;}});UnionOp.union=function(g,other){if(g.isEmpty()||other.isEmpty()){if(g.isEmpty()&&other.isEmpty())return OverlayOp.createEmptyResult(OverlayOp.UNION,g,other,g.getFactory());if(g.isEmpty())return other.copy();if(other.isEmpty())return g.copy();}g.checkNotGeometryCollection(g);g.checkNotGeometryCollection(other);return SnapIfNeededOverlayOp.overlayOp(g,other,OverlayOp.UNION);};function InteriorPointLine(){this.centroid=null;this.minDistance=Double.MAX_VALUE;this.interiorPoint=null;var g=arguments[0];this.centroid=g.getCentroid().getCoordinate();this.addInterior(g);if(this.interiorPoint===null)this.addEndpoints(g);}extend$1(InteriorPointLine.prototype,{addEndpoints:function addEndpoints(){if(arguments[0]instanceof Geometry){var geom=arguments[0];if(geom instanceof LineString){this.addEndpoints(geom.getCoordinates());}else if(geom instanceof GeometryCollection){var gc=geom;for(var i=0;i<gc.getNumGeometries();i++){this.addEndpoints(gc.getGeometryN(i));}}}else if(arguments[0]instanceof Array){var pts=arguments[0];this.add(pts[0]);this.add(pts[pts.length-1]);}},getInteriorPoint:function getInteriorPoint(){return this.interiorPoint;},addInterior:function addInterior(){if(arguments[0]instanceof Geometry){var geom=arguments[0];if(geom instanceof LineString){this.addInterior(geom.getCoordinates());}else if(geom instanceof GeometryCollection){var gc=geom;for(var i=0;i<gc.getNumGeometries();i++){this.addInterior(gc.getGeometryN(i));}}}else if(arguments[0]instanceof Array){var pts=arguments[0];for(var i=1;i<pts.length-1;i++){this.add(pts[i]);}}},add:function add(point){var dist=point.distance(this.centroid);if(dist<this.minDistance){this.interiorPoint=new Coordinate(point);this.minDistance=dist;}},interfaces_:function interfaces_(){return[];},getClass:function getClass(){return InteriorPointLine;}});function IsSimpleOp(){this.inputGeom=null;this.isClosedEndpointsInInterior=true;this.nonSimpleLocation=null;if(arguments.length===1){var geom=arguments[0];this.inputGeom=geom;}else if(arguments.length===2){var geom=arguments[0],boundaryNodeRule=arguments[1];this.inputGeom=geom;this.isClosedEndpointsInInterior=!boundaryNodeRule.isInBoundary(2);}}extend$1(IsSimpleOp.prototype,{isSimpleMultiPoint:function isSimpleMultiPoint(mp){if(mp.isEmpty())return true;var points=new TreeSet();for(var i=0;i<mp.getNumGeometries();i++){var pt=mp.getGeometryN(i);var p=pt.getCoordinate();if(points.contains(p)){this.nonSimpleLocation=p;return false;}points.add(p);}return true;},isSimplePolygonal:function isSimplePolygonal(geom){var rings=LinearComponentExtracter.getLines(geom);for(var i=rings.iterator();i.hasNext();){var ring=i.next();if(!this.isSimpleLinearGeometry(ring))return false;}return true;},hasClosedEndpointIntersection:function hasClosedEndpointIntersection(graph){var endPoints=new TreeMap();for(var i=graph.getEdgeIterator();i.hasNext();){var e=i.next();var maxSegmentIndex=e.getMaximumSegmentIndex();var isClosed=e.isClosed();var p0=e.getCoordinate(0);this.addEndpoint(endPoints,p0,isClosed);var p1=e.getCoordinate(e.getNumPoints()-1);this.addEndpoint(endPoints,p1,isClosed);}for(var i=endPoints.values().iterator();i.hasNext();){var eiInfo=i.next();if(eiInfo.isClosed&&eiInfo.degree!==2){this.nonSimpleLocation=eiInfo.getCoordinate();return true;}}return false;},getNonSimpleLocation:function getNonSimpleLocation(){return this.nonSimpleLocation;},isSimpleLinearGeometry:function isSimpleLinearGeometry(geom){if(geom.isEmpty())return true;var graph=new GeometryGraph(0,geom);var li=new RobustLineIntersector();var si=graph.computeSelfNodes(li,true);if(!si.hasIntersection())return true;if(si.hasProperIntersection()){this.nonSimpleLocation=si.getProperIntersectionPoint();return false;}if(this.hasNonEndpointIntersection(graph))return false;if(this.isClosedEndpointsInInterior){if(this.hasClosedEndpointIntersection(graph))return false;}return true;},hasNonEndpointIntersection:function hasNonEndpointIntersection(graph){for(var i=graph.getEdgeIterator();i.hasNext();){var e=i.next();var maxSegmentIndex=e.getMaximumSegmentIndex();for(var eiIt=e.getEdgeIntersectionList().iterator();eiIt.hasNext();){var ei=eiIt.next();if(!ei.isEndPoint(maxSegmentIndex)){this.nonSimpleLocation=ei.getCoordinate();return true;}}}return false;},addEndpoint:function addEndpoint(endPoints,p,isClosed){var eiInfo=endPoints.get(p);if(eiInfo===null){eiInfo=new EndpointInfo(p);endPoints.put(p,eiInfo);}eiInfo.addEndpoint(isClosed);},computeSimple:function computeSimple(geom){this.nonSimpleLocation=null;if(geom.isEmpty())return true;if(geom instanceof LineString)return this.isSimpleLinearGeometry(geom);if(geom instanceof MultiLineString)return this.isSimpleLinearGeometry(geom);if(geom instanceof MultiPoint)return this.isSimpleMultiPoint(geom);if(hasInterface(geom,Polygonal))return this.isSimplePolygonal(geom);if(geom instanceof GeometryCollection)return this.isSimpleGeometryCollection(geom);return true;},isSimple:function isSimple(){this.nonSimpleLocation=null;return this.computeSimple(this.inputGeom);},isSimpleGeometryCollection:function isSimpleGeometryCollection(geom){for(var i=0;i<geom.getNumGeometries();i++){var comp=geom.getGeometryN(i);if(!this.computeSimple(comp))return false;}return true;},interfaces_:function interfaces_(){return[];},getClass:function getClass(){return IsSimpleOp;}});function EndpointInfo(){this.pt=null;this.isClosed=null;this.degree=null;var pt=arguments[0];this.pt=pt;this.isClosed=false;this.degree=0;}extend$1(EndpointInfo.prototype,{addEndpoint:function addEndpoint(isClosed){this.degree++;this.isClosed|=isClosed;},getCoordinate:function getCoordinate(){return this.pt;},interfaces_:function interfaces_(){return[];},getClass:function getClass(){return EndpointInfo;}});IsSimpleOp.EndpointInfo=EndpointInfo;function BufferParameters(){this.quadrantSegments=BufferParameters.DEFAULT_QUADRANT_SEGMENTS;this.endCapStyle=BufferParameters.CAP_ROUND;this.joinStyle=BufferParameters.JOIN_ROUND;this.mitreLimit=BufferParameters.DEFAULT_MITRE_LIMIT;this._isSingleSided=false;this.simplifyFactor=BufferParameters.DEFAULT_SIMPLIFY_FACTOR;if(arguments.length===0){}else if(arguments.length===1){var quadrantSegments=arguments[0];this.setQuadrantSegments(quadrantSegments);}else if(arguments.length===2){var quadrantSegments=arguments[0],endCapStyle=arguments[1];this.setQuadrantSegments(quadrantSegments);this.setEndCapStyle(endCapStyle);}else if(arguments.length===4){var quadrantSegments=arguments[0],endCapStyle=arguments[1],joinStyle=arguments[2],mitreLimit=arguments[3];this.setQuadrantSegments(quadrantSegments);this.setEndCapStyle(endCapStyle);this.setJoinStyle(joinStyle);this.setMitreLimit(mitreLimit);}}extend$1(BufferParameters.prototype,{getEndCapStyle:function getEndCapStyle(){return this.endCapStyle;},isSingleSided:function isSingleSided(){return this._isSingleSided;},setQuadrantSegments:function setQuadrantSegments(quadSegs){this.quadrantSegments=quadSegs;if(this.quadrantSegments===0)this.joinStyle=BufferParameters.JOIN_BEVEL;if(this.quadrantSegments<0){this.joinStyle=BufferParameters.JOIN_MITRE;this.mitreLimit=Math.abs(this.quadrantSegments);}if(quadSegs<=0){this.quadrantSegments=1;}if(this.joinStyle!==BufferParameters.JOIN_ROUND){this.quadrantSegments=BufferParameters.DEFAULT_QUADRANT_SEGMENTS;}},getJoinStyle:function getJoinStyle(){return this.joinStyle;},setJoinStyle:function setJoinStyle(joinStyle){this.joinStyle=joinStyle;},setSimplifyFactor:function setSimplifyFactor(simplifyFactor){this.simplifyFactor=simplifyFactor<0?0:simplifyFactor;},getSimplifyFactor:function getSimplifyFactor(){return this.simplifyFactor;},getQuadrantSegments:function getQuadrantSegments(){return this.quadrantSegments;},setEndCapStyle:function setEndCapStyle(endCapStyle){this.endCapStyle=endCapStyle;},getMitreLimit:function getMitreLimit(){return this.mitreLimit;},setMitreLimit:function setMitreLimit(mitreLimit){this.mitreLimit=mitreLimit;},setSingleSided:function setSingleSided(isSingleSided){this._isSingleSided=isSingleSided;},interfaces_:function interfaces_(){return[];},getClass:function getClass(){return BufferParameters;}});BufferParameters.bufferDistanceError=function(quadSegs){var alpha=Math.PI/2.0/quadSegs;return 1-Math.cos(alpha/2.0);};BufferParameters.CAP_ROUND=1;BufferParameters.CAP_FLAT=2;BufferParameters.CAP_SQUARE=3;BufferParameters.JOIN_ROUND=1;BufferParameters.JOIN_MITRE=2;BufferParameters.JOIN_BEVEL=3;BufferParameters.DEFAULT_QUADRANT_SEGMENTS=8;BufferParameters.DEFAULT_MITRE_LIMIT=5.0;BufferParameters.DEFAULT_SIMPLIFY_FACTOR=0.01;/**
 * @param {string=} message Optional message
 * @extends {Error}
 * @constructor
 * @private
 */function EmptyStackException(message){this.message=message||'';}EmptyStackException.prototype=new Error();/**
 * @type {string}
 */EmptyStackException.prototype.name='EmptyStackException';/**
 * @see http://download.oracle.com/javase/6/docs/api/java/util/Stack.html
 *
 * @extends {List}
 * @constructor
 * @private
 */function Stack$2(){/**
   * @type {Array}
   * @private
   */this.array_=[];}Stack$2.prototype=new List();/**
 * @override
 */Stack$2.prototype.add=function(e){this.array_.push(e);return true;};/**
 * @override
 */Stack$2.prototype.get=function(index){if(index<0||index>=this.size()){throw new IndexOutOfBoundsException();}return this.array_[index];};/**
 * Pushes an item onto the top of this stack.
 * @param {Object} e
 * @return {Object}
 */Stack$2.prototype.push=function(e){this.array_.push(e);return e;};/**
 * Pushes an item onto the top of this stack.
 * @param {Object} e
 * @return {Object}
 */Stack$2.prototype.pop=function(e){if(this.array_.length===0){throw new EmptyStackException();}return this.array_.pop();};/**
 * Looks at the object at the top of this stack without removing it from the
 * stack.
 * @return {Object}
 */Stack$2.prototype.peek=function(){if(this.array_.length===0){throw new EmptyStackException();}return this.array_[this.array_.length-1];};/**
 * Tests if this stack is empty.
 * @return {boolean} true if and only if this stack contains no items; false
 *         otherwise.
 */Stack$2.prototype.empty=function(){if(this.array_.length===0){return true;}else{return false;}};/**
 * @return {boolean}
 */Stack$2.prototype.isEmpty=function(){return this.empty();};/**
 * Returns the 1-based position where an object is on this stack. If the object
 * o occurs as an item in this stack, this method returns the distance from the
 * top of the stack of the occurrence nearest the top of the stack; the topmost
 * item on the stack is considered to be at distance 1. The equals method is
 * used to compare o to the items in this stack.
 *
 * NOTE: does not currently actually use equals. (=== is used)
 *
 * @param {Object} o
 * @return {number} the 1-based position from the top of the stack where the
 *         object is located; the return value -1 indicates that the object is
 *         not on the stack.
 */Stack$2.prototype.search=function(o){return this.array_.indexOf(o);};/**
 * @return {number}
 * @export
 */Stack$2.prototype.size=function(){return this.array_.length;};/**
 * @return {Array}
 */Stack$2.prototype.toArray=function(){var array=[];for(var i=0,len=this.array_.length;i<len;i++){array.push(this.array_[i]);}return array;};function RightmostEdgeFinder(){this.minIndex=-1;this.minCoord=null;this.minDe=null;this.orientedDe=null;}extend$1(RightmostEdgeFinder.prototype,{getCoordinate:function getCoordinate(){return this.minCoord;},getRightmostSide:function getRightmostSide(de,index){var side=this.getRightmostSideOfSegment(de,index);if(side<0)side=this.getRightmostSideOfSegment(de,index-1);if(side<0){this.minCoord=null;this.checkForRightmostCoordinate(de);}return side;},findRightmostEdgeAtVertex:function findRightmostEdgeAtVertex(){var pts=this.minDe.getEdge().getCoordinates();Assert.isTrue(this.minIndex>0&&this.minIndex<pts.length,"rightmost point expected to be interior vertex of edge");var pPrev=pts[this.minIndex-1];var pNext=pts[this.minIndex+1];var orientation=CGAlgorithms.computeOrientation(this.minCoord,pNext,pPrev);var usePrev=false;if(pPrev.y<this.minCoord.y&&pNext.y<this.minCoord.y&&orientation===CGAlgorithms.COUNTERCLOCKWISE){usePrev=true;}else if(pPrev.y>this.minCoord.y&&pNext.y>this.minCoord.y&&orientation===CGAlgorithms.CLOCKWISE){usePrev=true;}if(usePrev){this.minIndex=this.minIndex-1;}},getRightmostSideOfSegment:function getRightmostSideOfSegment(de,i){var e=de.getEdge();var coord=e.getCoordinates();if(i<0||i+1>=coord.length)return-1;if(coord[i].y===coord[i+1].y)return-1;var pos=Position.LEFT;if(coord[i].y<coord[i+1].y)pos=Position.RIGHT;return pos;},getEdge:function getEdge(){return this.orientedDe;},checkForRightmostCoordinate:function checkForRightmostCoordinate(de){var coord=de.getEdge().getCoordinates();for(var i=0;i<coord.length-1;i++){if(this.minCoord===null||coord[i].x>this.minCoord.x){this.minDe=de;this.minIndex=i;this.minCoord=coord[i];}}},findRightmostEdgeAtNode:function findRightmostEdgeAtNode(){var node=this.minDe.getNode();var star=node.getEdges();this.minDe=star.getRightmostEdge();if(!this.minDe.isForward()){this.minDe=this.minDe.getSym();this.minIndex=this.minDe.getEdge().getCoordinates().length-1;}},findEdge:function findEdge(dirEdgeList){for(var i=dirEdgeList.iterator();i.hasNext();){var de=i.next();if(!de.isForward())continue;this.checkForRightmostCoordinate(de);}Assert.isTrue(this.minIndex!==0||this.minCoord.equals(this.minDe.getCoordinate()),"inconsistency in rightmost processing");if(this.minIndex===0){this.findRightmostEdgeAtNode();}else{this.findRightmostEdgeAtVertex();}this.orientedDe=this.minDe;var rightmostSide=this.getRightmostSide(this.minDe,this.minIndex);if(rightmostSide===Position.LEFT){this.orientedDe=this.minDe.getSym();}},interfaces_:function interfaces_(){return[];},getClass:function getClass(){return RightmostEdgeFinder;}});function LinkedList(){this.array_=[];}LinkedList.prototype.addLast=function(e){this.array_.push(e);};LinkedList.prototype.removeFirst=function(){return this.array_.shift();};LinkedList.prototype.isEmpty=function(){return this.array_.length===0;};function BufferSubgraph(){this.finder=null;this.dirEdgeList=new ArrayList();this.nodes=new ArrayList();this.rightMostCoord=null;this.env=null;this.finder=new RightmostEdgeFinder();}extend$1(BufferSubgraph.prototype,{clearVisitedEdges:function clearVisitedEdges(){for(var it=this.dirEdgeList.iterator();it.hasNext();){var de=it.next();de.setVisited(false);}},getRightmostCoordinate:function getRightmostCoordinate(){return this.rightMostCoord;},computeNodeDepth:function computeNodeDepth(n){var startEdge=null;for(var i=n.getEdges().iterator();i.hasNext();){var de=i.next();if(de.isVisited()||de.getSym().isVisited()){startEdge=de;break;}}if(startEdge===null)throw new TopologyException("unable to find edge to compute depths at "+n.getCoordinate());n.getEdges().computeDepths(startEdge);for(var i=n.getEdges().iterator();i.hasNext();){var de=i.next();de.setVisited(true);this.copySymDepths(de);}},computeDepth:function computeDepth(outsideDepth){this.clearVisitedEdges();var de=this.finder.getEdge();var n=de.getNode();var label=de.getLabel();de.setEdgeDepths(Position.RIGHT,outsideDepth);this.copySymDepths(de);this.computeDepths(de);},create:function create(node){this.addReachable(node);this.finder.findEdge(this.dirEdgeList);this.rightMostCoord=this.finder.getCoordinate();},findResultEdges:function findResultEdges(){for(var it=this.dirEdgeList.iterator();it.hasNext();){var de=it.next();if(de.getDepth(Position.RIGHT)>=1&&de.getDepth(Position.LEFT)<=0&&!de.isInteriorAreaEdge()){de.setInResult(true);}}},computeDepths:function computeDepths(startEdge){var nodesVisited=new HashSet();var nodeQueue=new LinkedList();var startNode=startEdge.getNode();nodeQueue.addLast(startNode);nodesVisited.add(startNode);startEdge.setVisited(true);while(!nodeQueue.isEmpty()){var n=nodeQueue.removeFirst();nodesVisited.add(n);this.computeNodeDepth(n);for(var i=n.getEdges().iterator();i.hasNext();){var de=i.next();var sym=de.getSym();if(sym.isVisited())continue;var adjNode=sym.getNode();if(!nodesVisited.contains(adjNode)){nodeQueue.addLast(adjNode);nodesVisited.add(adjNode);}}}},compareTo:function compareTo(o){var graph=o;if(this.rightMostCoord.x<graph.rightMostCoord.x){return-1;}if(this.rightMostCoord.x>graph.rightMostCoord.x){return 1;}return 0;},getEnvelope:function getEnvelope(){if(this.env===null){var edgeEnv=new Envelope();for(var it=this.dirEdgeList.iterator();it.hasNext();){var dirEdge=it.next();var pts=dirEdge.getEdge().getCoordinates();for(var i=0;i<pts.length-1;i++){edgeEnv.expandToInclude(pts[i]);}}this.env=edgeEnv;}return this.env;},addReachable:function addReachable(startNode){var nodeStack=new Stack$2();nodeStack.add(startNode);while(!nodeStack.empty()){var node=nodeStack.pop();this.add(node,nodeStack);}},copySymDepths:function copySymDepths(de){var sym=de.getSym();sym.setDepth(Position.LEFT,de.getDepth(Position.RIGHT));sym.setDepth(Position.RIGHT,de.getDepth(Position.LEFT));},add:function add(node,nodeStack){node.setVisited(true);this.nodes.add(node);for(var i=node.getEdges().iterator();i.hasNext();){var de=i.next();this.dirEdgeList.add(de);var sym=de.getSym();var symNode=sym.getNode();if(!symNode.isVisited())nodeStack.push(symNode);}},getNodes:function getNodes(){return this.nodes;},getDirectedEdges:function getDirectedEdges(){return this.dirEdgeList;},interfaces_:function interfaces_(){return[Comparable];},getClass:function getClass(){return BufferSubgraph;}});function BufferInputLineSimplifier(){this.inputLine=null;this.distanceTol=null;this.isDeleted=null;this.angleOrientation=CGAlgorithms.COUNTERCLOCKWISE;var inputLine=arguments[0];this.inputLine=inputLine;}extend$1(BufferInputLineSimplifier.prototype,{isDeletable:function isDeletable(i0,i1,i2,distanceTol){var p0=this.inputLine[i0];var p1=this.inputLine[i1];var p2=this.inputLine[i2];if(!this.isConcave(p0,p1,p2))return false;if(!this.isShallow(p0,p1,p2,distanceTol))return false;return this.isShallowSampled(p0,p1,i0,i2,distanceTol);},deleteShallowConcavities:function deleteShallowConcavities(){var index=1;var midIndex=this.findNextNonDeletedIndex(index);var lastIndex=this.findNextNonDeletedIndex(midIndex);var isChanged=false;while(lastIndex<this.inputLine.length){var isMiddleVertexDeleted=false;if(this.isDeletable(index,midIndex,lastIndex,this.distanceTol)){this.isDeleted[midIndex]=BufferInputLineSimplifier.DELETE;isMiddleVertexDeleted=true;isChanged=true;}if(isMiddleVertexDeleted)index=lastIndex;else index=midIndex;midIndex=this.findNextNonDeletedIndex(index);lastIndex=this.findNextNonDeletedIndex(midIndex);}return isChanged;},isShallowConcavity:function isShallowConcavity(p0,p1,p2,distanceTol){var orientation=CGAlgorithms.computeOrientation(p0,p1,p2);var isAngleToSimplify=orientation===this.angleOrientation;if(!isAngleToSimplify)return false;var dist=CGAlgorithms.distancePointLine(p1,p0,p2);return dist<distanceTol;},isShallowSampled:function isShallowSampled(p0,p2,i0,i2,distanceTol){var inc=Math.trunc((i2-i0)/BufferInputLineSimplifier.NUM_PTS_TO_CHECK);if(inc<=0)inc=1;for(var i=i0;i<i2;i+=inc){if(!this.isShallow(p0,p2,this.inputLine[i],distanceTol))return false;}return true;},isConcave:function isConcave(p0,p1,p2){var orientation=CGAlgorithms.computeOrientation(p0,p1,p2);var isConcave=orientation===this.angleOrientation;return isConcave;},simplify:function simplify(distanceTol){this.distanceTol=Math.abs(distanceTol);if(distanceTol<0)this.angleOrientation=CGAlgorithms.CLOCKWISE;this.isDeleted=new Array(this.inputLine.length).fill(null);var isChanged=false;do{isChanged=this.deleteShallowConcavities();}while(isChanged);return this.collapseLine();},findNextNonDeletedIndex:function findNextNonDeletedIndex(index){var next=index+1;while(next<this.inputLine.length&&this.isDeleted[next]===BufferInputLineSimplifier.DELETE){next++;}return next;},isShallow:function isShallow(p0,p1,p2,distanceTol){var dist=CGAlgorithms.distancePointLine(p1,p0,p2);return dist<distanceTol;},collapseLine:function collapseLine(){var coordList=new CoordinateList();for(var i=0;i<this.inputLine.length;i++){if(this.isDeleted[i]!==BufferInputLineSimplifier.DELETE)coordList.add(this.inputLine[i]);}return coordList.toCoordinateArray();},interfaces_:function interfaces_(){return[];},getClass:function getClass(){return BufferInputLineSimplifier;}});BufferInputLineSimplifier.simplify=function(inputLine,distanceTol){var simp=new BufferInputLineSimplifier(inputLine);return simp.simplify(distanceTol);};BufferInputLineSimplifier.INIT=0;BufferInputLineSimplifier.DELETE=1;BufferInputLineSimplifier.KEEP=1;BufferInputLineSimplifier.NUM_PTS_TO_CHECK=10;function OffsetSegmentString(){this.ptList=null;this.precisionModel=null;this.minimimVertexDistance=0.0;this.ptList=new ArrayList();}extend$1(OffsetSegmentString.prototype,{getCoordinates:function getCoordinates(){var coord=this.ptList.toArray(OffsetSegmentString.COORDINATE_ARRAY_TYPE);return coord;},setPrecisionModel:function setPrecisionModel(precisionModel){this.precisionModel=precisionModel;},addPt:function addPt(pt){var bufPt=new Coordinate(pt);this.precisionModel.makePrecise(bufPt);if(this.isRedundant(bufPt))return null;this.ptList.add(bufPt);},reverse:function reverse(){},addPts:function addPts(pt,isForward){if(isForward){for(var i=0;i<pt.length;i++){this.addPt(pt[i]);}}else{for(var i=pt.length-1;i>=0;i--){this.addPt(pt[i]);}}},isRedundant:function isRedundant(pt){if(this.ptList.size()<1)return false;var lastPt=this.ptList.get(this.ptList.size()-1);var ptDist=pt.distance(lastPt);if(ptDist<this.minimimVertexDistance)return true;return false;},toString:function toString(){var fact=new GeometryFactory();var line=fact.createLineString(this.getCoordinates());return line.toString();},closeRing:function closeRing(){if(this.ptList.size()<1)return null;var startPt=new Coordinate(this.ptList.get(0));var lastPt=this.ptList.get(this.ptList.size()-1);var last2Pt=null;if(this.ptList.size()>=2)last2Pt=this.ptList.get(this.ptList.size()-2);if(startPt.equals(lastPt))return null;this.ptList.add(startPt);},setMinimumVertexDistance:function setMinimumVertexDistance(minimimVertexDistance){this.minimimVertexDistance=minimimVertexDistance;},interfaces_:function interfaces_(){return[];},getClass:function getClass(){return OffsetSegmentString;}});OffsetSegmentString.COORDINATE_ARRAY_TYPE=new Array(0).fill(null);function Angle(){}extend$1(Angle.prototype,{interfaces_:function interfaces_(){return[];},getClass:function getClass(){return Angle;}});Angle.toDegrees=function(radians){return radians*180/Math.PI;};Angle.normalize=function(angle){while(angle>Math.PI){angle-=Angle.PI_TIMES_2;}while(angle<=-Math.PI){angle+=Angle.PI_TIMES_2;}return angle;};Angle.angle=function(){if(arguments.length===1){var p=arguments[0];return Math.atan2(p.y,p.x);}else if(arguments.length===2){var p0=arguments[0],p1=arguments[1];var dx=p1.x-p0.x;var dy=p1.y-p0.y;return Math.atan2(dy,dx);}};Angle.isAcute=function(p0,p1,p2){var dx0=p0.x-p1.x;var dy0=p0.y-p1.y;var dx1=p2.x-p1.x;var dy1=p2.y-p1.y;var dotprod=dx0*dx1+dy0*dy1;return dotprod>0;};Angle.isObtuse=function(p0,p1,p2){var dx0=p0.x-p1.x;var dy0=p0.y-p1.y;var dx1=p2.x-p1.x;var dy1=p2.y-p1.y;var dotprod=dx0*dx1+dy0*dy1;return dotprod<0;};Angle.interiorAngle=function(p0,p1,p2){var anglePrev=Angle.angle(p1,p0);var angleNext=Angle.angle(p1,p2);return Math.abs(angleNext-anglePrev);};Angle.normalizePositive=function(angle){if(angle<0.0){while(angle<0.0){angle+=Angle.PI_TIMES_2;}if(angle>=Angle.PI_TIMES_2)angle=0.0;}else{while(angle>=Angle.PI_TIMES_2){angle-=Angle.PI_TIMES_2;}if(angle<0.0)angle=0.0;}return angle;};Angle.angleBetween=function(tip1,tail,tip2){var a1=Angle.angle(tail,tip1);var a2=Angle.angle(tail,tip2);return Angle.diff(a1,a2);};Angle.diff=function(ang1,ang2){var delAngle=null;if(ang1<ang2){delAngle=ang2-ang1;}else{delAngle=ang1-ang2;}if(delAngle>Math.PI){delAngle=2*Math.PI-delAngle;}return delAngle;};Angle.toRadians=function(angleDegrees){return angleDegrees*Math.PI/180.0;};Angle.getTurn=function(ang1,ang2){var crossproduct=Math.sin(ang2-ang1);if(crossproduct>0){return Angle.COUNTERCLOCKWISE;}if(crossproduct<0){return Angle.CLOCKWISE;}return Angle.NONE;};Angle.angleBetweenOriented=function(tip1,tail,tip2){var a1=Angle.angle(tail,tip1);var a2=Angle.angle(tail,tip2);var angDel=a2-a1;if(angDel<=-Math.PI)return angDel+Angle.PI_TIMES_2;if(angDel>Math.PI)return angDel-Angle.PI_TIMES_2;return angDel;};Angle.PI_TIMES_2=2.0*Math.PI;Angle.PI_OVER_2=Math.PI/2.0;Angle.PI_OVER_4=Math.PI/4.0;Angle.COUNTERCLOCKWISE=CGAlgorithms.COUNTERCLOCKWISE;Angle.CLOCKWISE=CGAlgorithms.CLOCKWISE;Angle.NONE=CGAlgorithms.COLLINEAR;function OffsetSegmentGenerator(){this.maxCurveSegmentError=0.0;this.filletAngleQuantum=null;this.closingSegLengthFactor=1;this.segList=null;this.distance=0.0;this.precisionModel=null;this.bufParams=null;this.li=null;this.s0=null;this.s1=null;this.s2=null;this.seg0=new LineSegment();this.seg1=new LineSegment();this.offset0=new LineSegment();this.offset1=new LineSegment();this.side=0;this._hasNarrowConcaveAngle=false;var precisionModel=arguments[0],bufParams=arguments[1],distance=arguments[2];this.precisionModel=precisionModel;this.bufParams=bufParams;this.li=new RobustLineIntersector();this.filletAngleQuantum=Math.PI/2.0/bufParams.getQuadrantSegments();if(bufParams.getQuadrantSegments()>=8&&bufParams.getJoinStyle()===BufferParameters.JOIN_ROUND)this.closingSegLengthFactor=OffsetSegmentGenerator.MAX_CLOSING_SEG_LEN_FACTOR;this.init(distance);}extend$1(OffsetSegmentGenerator.prototype,{addNextSegment:function addNextSegment(p,addStartPoint){this.s0=this.s1;this.s1=this.s2;this.s2=p;this.seg0.setCoordinates(this.s0,this.s1);this.computeOffsetSegment(this.seg0,this.side,this.distance,this.offset0);this.seg1.setCoordinates(this.s1,this.s2);this.computeOffsetSegment(this.seg1,this.side,this.distance,this.offset1);if(this.s1.equals(this.s2))return null;var orientation=CGAlgorithms.computeOrientation(this.s0,this.s1,this.s2);var outsideTurn=orientation===CGAlgorithms.CLOCKWISE&&this.side===Position.LEFT||orientation===CGAlgorithms.COUNTERCLOCKWISE&&this.side===Position.RIGHT;if(orientation===0){this.addCollinear(addStartPoint);}else if(outsideTurn){this.addOutsideTurn(orientation,addStartPoint);}else{this.addInsideTurn(orientation,addStartPoint);}},addLineEndCap:function addLineEndCap(p0,p1){var seg=new LineSegment(p0,p1);var offsetL=new LineSegment();this.computeOffsetSegment(seg,Position.LEFT,this.distance,offsetL);var offsetR=new LineSegment();this.computeOffsetSegment(seg,Position.RIGHT,this.distance,offsetR);var dx=p1.x-p0.x;var dy=p1.y-p0.y;var angle=Math.atan2(dy,dx);switch(this.bufParams.getEndCapStyle()){case BufferParameters.CAP_ROUND:this.segList.addPt(offsetL.p1);this.addFilletArc(p1,angle+Math.PI/2,angle-Math.PI/2,CGAlgorithms.CLOCKWISE,this.distance);this.segList.addPt(offsetR.p1);break;case BufferParameters.CAP_FLAT:this.segList.addPt(offsetL.p1);this.segList.addPt(offsetR.p1);break;case BufferParameters.CAP_SQUARE:var squareCapSideOffset=new Coordinate();squareCapSideOffset.x=Math.abs(this.distance)*Math.cos(angle);squareCapSideOffset.y=Math.abs(this.distance)*Math.sin(angle);var squareCapLOffset=new Coordinate(offsetL.p1.x+squareCapSideOffset.x,offsetL.p1.y+squareCapSideOffset.y);var squareCapROffset=new Coordinate(offsetR.p1.x+squareCapSideOffset.x,offsetR.p1.y+squareCapSideOffset.y);this.segList.addPt(squareCapLOffset);this.segList.addPt(squareCapROffset);break;}},getCoordinates:function getCoordinates(){var pts=this.segList.getCoordinates();return pts;},addMitreJoin:function addMitreJoin(p,offset0,offset1,distance){var isMitreWithinLimit=true;var intPt=null;try{intPt=HCoordinate.intersection(offset0.p0,offset0.p1,offset1.p0,offset1.p1);var mitreRatio=distance<=0.0?1.0:intPt.distance(p)/Math.abs(distance);if(mitreRatio>this.bufParams.getMitreLimit())isMitreWithinLimit=false;}catch(ex){if(ex instanceof NotRepresentableException){intPt=new Coordinate(0,0);isMitreWithinLimit=false;}else throw ex;}finally{}if(isMitreWithinLimit){this.segList.addPt(intPt);}else{this.addLimitedMitreJoin(offset0,offset1,distance,this.bufParams.getMitreLimit());}},addFilletCorner:function addFilletCorner(p,p0,p1,direction,radius){var dx0=p0.x-p.x;var dy0=p0.y-p.y;var startAngle=Math.atan2(dy0,dx0);var dx1=p1.x-p.x;var dy1=p1.y-p.y;var endAngle=Math.atan2(dy1,dx1);if(direction===CGAlgorithms.CLOCKWISE){if(startAngle<=endAngle)startAngle+=2.0*Math.PI;}else{if(startAngle>=endAngle)startAngle-=2.0*Math.PI;}this.segList.addPt(p0);this.addFilletArc(p,startAngle,endAngle,direction,radius);this.segList.addPt(p1);},addOutsideTurn:function addOutsideTurn(orientation,addStartPoint){if(this.offset0.p1.distance(this.offset1.p0)<this.distance*OffsetSegmentGenerator.OFFSET_SEGMENT_SEPARATION_FACTOR){this.segList.addPt(this.offset0.p1);return null;}if(this.bufParams.getJoinStyle()===BufferParameters.JOIN_MITRE){this.addMitreJoin(this.s1,this.offset0,this.offset1,this.distance);}else if(this.bufParams.getJoinStyle()===BufferParameters.JOIN_BEVEL){this.addBevelJoin(this.offset0,this.offset1);}else{if(addStartPoint)this.segList.addPt(this.offset0.p1);this.addFilletCorner(this.s1,this.offset0.p1,this.offset1.p0,orientation,this.distance);this.segList.addPt(this.offset1.p0);}},createSquare:function createSquare(p){this.segList.addPt(new Coordinate(p.x+this.distance,p.y+this.distance));this.segList.addPt(new Coordinate(p.x+this.distance,p.y-this.distance));this.segList.addPt(new Coordinate(p.x-this.distance,p.y-this.distance));this.segList.addPt(new Coordinate(p.x-this.distance,p.y+this.distance));this.segList.closeRing();},addSegments:function addSegments(pt,isForward){this.segList.addPts(pt,isForward);},addFirstSegment:function addFirstSegment(){this.segList.addPt(this.offset1.p0);},addLastSegment:function addLastSegment(){this.segList.addPt(this.offset1.p1);},initSideSegments:function initSideSegments(s1,s2,side){this.s1=s1;this.s2=s2;this.side=side;this.seg1.setCoordinates(s1,s2);this.computeOffsetSegment(this.seg1,side,this.distance,this.offset1);},addLimitedMitreJoin:function addLimitedMitreJoin(offset0,offset1,distance,mitreLimit){var basePt=this.seg0.p1;var ang0=Angle.angle(basePt,this.seg0.p0);var ang1=Angle.angle(basePt,this.seg1.p1);var angDiff=Angle.angleBetweenOriented(this.seg0.p0,basePt,this.seg1.p1);var angDiffHalf=angDiff/2;var midAng=Angle.normalize(ang0+angDiffHalf);var mitreMidAng=Angle.normalize(midAng+Math.PI);var mitreDist=mitreLimit*distance;var bevelDelta=mitreDist*Math.abs(Math.sin(angDiffHalf));var bevelHalfLen=distance-bevelDelta;var bevelMidX=basePt.x+mitreDist*Math.cos(mitreMidAng);var bevelMidY=basePt.y+mitreDist*Math.sin(mitreMidAng);var bevelMidPt=new Coordinate(bevelMidX,bevelMidY);var mitreMidLine=new LineSegment(basePt,bevelMidPt);var bevelEndLeft=mitreMidLine.pointAlongOffset(1.0,bevelHalfLen);var bevelEndRight=mitreMidLine.pointAlongOffset(1.0,-bevelHalfLen);if(this.side===Position.LEFT){this.segList.addPt(bevelEndLeft);this.segList.addPt(bevelEndRight);}else{this.segList.addPt(bevelEndRight);this.segList.addPt(bevelEndLeft);}},computeOffsetSegment:function computeOffsetSegment(seg,side,distance,offset){var sideSign=side===Position.LEFT?1:-1;var dx=seg.p1.x-seg.p0.x;var dy=seg.p1.y-seg.p0.y;var len=Math.sqrt(dx*dx+dy*dy);var ux=sideSign*distance*dx/len;var uy=sideSign*distance*dy/len;offset.p0.x=seg.p0.x-uy;offset.p0.y=seg.p0.y+ux;offset.p1.x=seg.p1.x-uy;offset.p1.y=seg.p1.y+ux;},addFilletArc:function addFilletArc(p,startAngle,endAngle,direction,radius){var directionFactor=direction===CGAlgorithms.CLOCKWISE?-1:1;var totalAngle=Math.abs(startAngle-endAngle);var nSegs=Math.trunc(totalAngle/this.filletAngleQuantum+0.5);if(nSegs<1)return null;var initAngle=null,currAngleInc=null;initAngle=0.0;currAngleInc=totalAngle/nSegs;var currAngle=initAngle;var pt=new Coordinate();while(currAngle<totalAngle){var angle=startAngle+directionFactor*currAngle;pt.x=p.x+radius*Math.cos(angle);pt.y=p.y+radius*Math.sin(angle);this.segList.addPt(pt);currAngle+=currAngleInc;}},addInsideTurn:function addInsideTurn(orientation,addStartPoint){this.li.computeIntersection(this.offset0.p0,this.offset0.p1,this.offset1.p0,this.offset1.p1);if(this.li.hasIntersection()){this.segList.addPt(this.li.getIntersection(0));}else{this._hasNarrowConcaveAngle=true;if(this.offset0.p1.distance(this.offset1.p0)<this.distance*OffsetSegmentGenerator.INSIDE_TURN_VERTEX_SNAP_DISTANCE_FACTOR){this.segList.addPt(this.offset0.p1);}else{this.segList.addPt(this.offset0.p1);if(this.closingSegLengthFactor>0){var mid0=new Coordinate((this.closingSegLengthFactor*this.offset0.p1.x+this.s1.x)/(this.closingSegLengthFactor+1),(this.closingSegLengthFactor*this.offset0.p1.y+this.s1.y)/(this.closingSegLengthFactor+1));this.segList.addPt(mid0);var mid1=new Coordinate((this.closingSegLengthFactor*this.offset1.p0.x+this.s1.x)/(this.closingSegLengthFactor+1),(this.closingSegLengthFactor*this.offset1.p0.y+this.s1.y)/(this.closingSegLengthFactor+1));this.segList.addPt(mid1);}else{this.segList.addPt(this.s1);}this.segList.addPt(this.offset1.p0);}}},createCircle:function createCircle(p){var pt=new Coordinate(p.x+this.distance,p.y);this.segList.addPt(pt);this.addFilletArc(p,0.0,2.0*Math.PI,-1,this.distance);this.segList.closeRing();},addBevelJoin:function addBevelJoin(offset0,offset1){this.segList.addPt(offset0.p1);this.segList.addPt(offset1.p0);},init:function init(distance){this.distance=distance;this.maxCurveSegmentError=distance*(1-Math.cos(this.filletAngleQuantum/2.0));this.segList=new OffsetSegmentString();this.segList.setPrecisionModel(this.precisionModel);this.segList.setMinimumVertexDistance(distance*OffsetSegmentGenerator.CURVE_VERTEX_SNAP_DISTANCE_FACTOR);},addCollinear:function addCollinear(addStartPoint){this.li.computeIntersection(this.s0,this.s1,this.s1,this.s2);var numInt=this.li.getIntersectionNum();if(numInt>=2){if(this.bufParams.getJoinStyle()===BufferParameters.JOIN_BEVEL||this.bufParams.getJoinStyle()===BufferParameters.JOIN_MITRE){if(addStartPoint)this.segList.addPt(this.offset0.p1);this.segList.addPt(this.offset1.p0);}else{this.addFilletCorner(this.s1,this.offset0.p1,this.offset1.p0,CGAlgorithms.CLOCKWISE,this.distance);}}},closeRing:function closeRing(){this.segList.closeRing();},hasNarrowConcaveAngle:function hasNarrowConcaveAngle(){return this._hasNarrowConcaveAngle;},interfaces_:function interfaces_(){return[];},getClass:function getClass(){return OffsetSegmentGenerator;}});OffsetSegmentGenerator.OFFSET_SEGMENT_SEPARATION_FACTOR=1.0E-3;OffsetSegmentGenerator.INSIDE_TURN_VERTEX_SNAP_DISTANCE_FACTOR=1.0E-3;OffsetSegmentGenerator.CURVE_VERTEX_SNAP_DISTANCE_FACTOR=1.0E-6;OffsetSegmentGenerator.MAX_CLOSING_SEG_LEN_FACTOR=80;function OffsetCurveBuilder(){this.distance=0.0;this.precisionModel=null;this.bufParams=null;var precisionModel=arguments[0],bufParams=arguments[1];this.precisionModel=precisionModel;this.bufParams=bufParams;}extend$1(OffsetCurveBuilder.prototype,{getOffsetCurve:function getOffsetCurve(inputPts,distance){this.distance=distance;if(distance===0.0)return null;var isRightSide=distance<0.0;var posDistance=Math.abs(distance);var segGen=this.getSegGen(posDistance);if(inputPts.length<=1){this.computePointCurve(inputPts[0],segGen);}else{this.computeOffsetCurve(inputPts,isRightSide,segGen);}var curvePts=segGen.getCoordinates();if(isRightSide)CoordinateArrays.reverse(curvePts);return curvePts;},computeSingleSidedBufferCurve:function computeSingleSidedBufferCurve(inputPts,isRightSide,segGen){var distTol=this.simplifyTolerance(this.distance);if(isRightSide){segGen.addSegments(inputPts,true);var simp2=BufferInputLineSimplifier.simplify(inputPts,-distTol);var n2=simp2.length-1;segGen.initSideSegments(simp2[n2],simp2[n2-1],Position.LEFT);segGen.addFirstSegment();for(var i=n2-2;i>=0;i--){segGen.addNextSegment(simp2[i],true);}}else{segGen.addSegments(inputPts,false);var simp1=BufferInputLineSimplifier.simplify(inputPts,distTol);var n1=simp1.length-1;segGen.initSideSegments(simp1[0],simp1[1],Position.LEFT);segGen.addFirstSegment();for(var i=2;i<=n1;i++){segGen.addNextSegment(simp1[i],true);}}segGen.addLastSegment();segGen.closeRing();},computeRingBufferCurve:function computeRingBufferCurve(inputPts,side,segGen){var distTol=this.simplifyTolerance(this.distance);if(side===Position.RIGHT)distTol=-distTol;var simp=BufferInputLineSimplifier.simplify(inputPts,distTol);var n=simp.length-1;segGen.initSideSegments(simp[n-1],simp[0],side);for(var i=1;i<=n;i++){var addStartPoint=i!==1;segGen.addNextSegment(simp[i],addStartPoint);}segGen.closeRing();},computeLineBufferCurve:function computeLineBufferCurve(inputPts,segGen){var distTol=this.simplifyTolerance(this.distance);var simp1=BufferInputLineSimplifier.simplify(inputPts,distTol);var n1=simp1.length-1;segGen.initSideSegments(simp1[0],simp1[1],Position.LEFT);for(var i=2;i<=n1;i++){segGen.addNextSegment(simp1[i],true);}segGen.addLastSegment();segGen.addLineEndCap(simp1[n1-1],simp1[n1]);var simp2=BufferInputLineSimplifier.simplify(inputPts,-distTol);var n2=simp2.length-1;segGen.initSideSegments(simp2[n2],simp2[n2-1],Position.LEFT);for(var i=n2-2;i>=0;i--){segGen.addNextSegment(simp2[i],true);}segGen.addLastSegment();segGen.addLineEndCap(simp2[1],simp2[0]);segGen.closeRing();},computePointCurve:function computePointCurve(pt,segGen){switch(this.bufParams.getEndCapStyle()){case BufferParameters.CAP_ROUND:segGen.createCircle(pt);break;case BufferParameters.CAP_SQUARE:segGen.createSquare(pt);break;}},getLineCurve:function getLineCurve(inputPts,distance){this.distance=distance;if(distance<0.0&&!this.bufParams.isSingleSided())return null;if(distance===0.0)return null;var posDistance=Math.abs(distance);var segGen=this.getSegGen(posDistance);if(inputPts.length<=1){this.computePointCurve(inputPts[0],segGen);}else{if(this.bufParams.isSingleSided()){var isRightSide=distance<0.0;this.computeSingleSidedBufferCurve(inputPts,isRightSide,segGen);}else this.computeLineBufferCurve(inputPts,segGen);}var lineCoord=segGen.getCoordinates();return lineCoord;},getBufferParameters:function getBufferParameters(){return this.bufParams;},simplifyTolerance:function simplifyTolerance(bufDistance){return bufDistance*this.bufParams.getSimplifyFactor();},getRingCurve:function getRingCurve(inputPts,side,distance){this.distance=distance;if(inputPts.length<=2)return this.getLineCurve(inputPts,distance);if(distance===0.0){return OffsetCurveBuilder.copyCoordinates(inputPts);}var segGen=this.getSegGen(distance);this.computeRingBufferCurve(inputPts,side,segGen);return segGen.getCoordinates();},computeOffsetCurve:function computeOffsetCurve(inputPts,isRightSide,segGen){var distTol=this.simplifyTolerance(this.distance);if(isRightSide){var simp2=BufferInputLineSimplifier.simplify(inputPts,-distTol);var n2=simp2.length-1;segGen.initSideSegments(simp2[n2],simp2[n2-1],Position.LEFT);segGen.addFirstSegment();for(var i=n2-2;i>=0;i--){segGen.addNextSegment(simp2[i],true);}}else{var simp1=BufferInputLineSimplifier.simplify(inputPts,distTol);var n1=simp1.length-1;segGen.initSideSegments(simp1[0],simp1[1],Position.LEFT);segGen.addFirstSegment();for(var i=2;i<=n1;i++){segGen.addNextSegment(simp1[i],true);}}segGen.addLastSegment();},getSegGen:function getSegGen(distance){return new OffsetSegmentGenerator(this.precisionModel,this.bufParams,distance);},interfaces_:function interfaces_(){return[];},getClass:function getClass(){return OffsetCurveBuilder;}});OffsetCurveBuilder.copyCoordinates=function(pts){var copy=new Array(pts.length).fill(null);for(var i=0;i<copy.length;i++){copy[i]=new Coordinate(pts[i]);}return copy;};function SubgraphDepthLocater(){this.subgraphs=null;this.seg=new LineSegment();this.cga=new CGAlgorithms();var subgraphs=arguments[0];this.subgraphs=subgraphs;}extend$1(SubgraphDepthLocater.prototype,{findStabbedSegments:function findStabbedSegments(){if(arguments.length===1){var stabbingRayLeftPt=arguments[0];var stabbedSegments=new ArrayList();for(var i=this.subgraphs.iterator();i.hasNext();){var bsg=i.next();var env=bsg.getEnvelope();if(stabbingRayLeftPt.y<env.getMinY()||stabbingRayLeftPt.y>env.getMaxY())continue;this.findStabbedSegments(stabbingRayLeftPt,bsg.getDirectedEdges(),stabbedSegments);}return stabbedSegments;}else if(arguments.length===3){if(hasInterface(arguments[2],List)&&arguments[0]instanceof Coordinate&&arguments[1]instanceof DirectedEdge){var stabbingRayLeftPt=arguments[0],dirEdge=arguments[1],stabbedSegments=arguments[2];var pts=dirEdge.getEdge().getCoordinates();for(var i=0;i<pts.length-1;i++){this.seg.p0=pts[i];this.seg.p1=pts[i+1];if(this.seg.p0.y>this.seg.p1.y)this.seg.reverse();var maxx=Math.max(this.seg.p0.x,this.seg.p1.x);if(maxx<stabbingRayLeftPt.x)continue;if(this.seg.isHorizontal())continue;if(stabbingRayLeftPt.y<this.seg.p0.y||stabbingRayLeftPt.y>this.seg.p1.y)continue;if(CGAlgorithms.computeOrientation(this.seg.p0,this.seg.p1,stabbingRayLeftPt)===CGAlgorithms.RIGHT)continue;var depth=dirEdge.getDepth(Position.LEFT);if(!this.seg.p0.equals(pts[i]))depth=dirEdge.getDepth(Position.RIGHT);var ds=new DepthSegment(this.seg,depth);stabbedSegments.add(ds);}}else if(hasInterface(arguments[2],List)&&arguments[0]instanceof Coordinate&&hasInterface(arguments[1],List)){var stabbingRayLeftPt=arguments[0],dirEdges=arguments[1],stabbedSegments=arguments[2];for(var i=dirEdges.iterator();i.hasNext();){var de=i.next();if(!de.isForward())continue;this.findStabbedSegments(stabbingRayLeftPt,de,stabbedSegments);}}}},getDepth:function getDepth(p){var stabbedSegments=this.findStabbedSegments(p);if(stabbedSegments.size()===0)return 0;var ds=Collections.min(stabbedSegments);return ds.leftDepth;},interfaces_:function interfaces_(){return[];},getClass:function getClass(){return SubgraphDepthLocater;}});function DepthSegment(){this.upwardSeg=null;this.leftDepth=null;var seg=arguments[0],depth=arguments[1];this.upwardSeg=new LineSegment(seg);this.leftDepth=depth;}extend$1(DepthSegment.prototype,{compareTo:function compareTo(obj){var other=obj;if(this.upwardSeg.minX()>=other.upwardSeg.maxX())return 1;if(this.upwardSeg.maxX()<=other.upwardSeg.minX())return-1;var orientIndex=this.upwardSeg.orientationIndex(other.upwardSeg);if(orientIndex!==0)return orientIndex;orientIndex=-1*other.upwardSeg.orientationIndex(this.upwardSeg);if(orientIndex!==0)return orientIndex;return this.upwardSeg.compareTo(other.upwardSeg);},compareX:function compareX(seg0,seg1){var compare0=seg0.p0.compareTo(seg1.p0);if(compare0!==0)return compare0;return seg0.p1.compareTo(seg1.p1);},toString:function toString(){return this.upwardSeg.toString();},interfaces_:function interfaces_(){return[Comparable];},getClass:function getClass(){return DepthSegment;}});SubgraphDepthLocater.DepthSegment=DepthSegment;function Triangle(){this.p0=null;this.p1=null;this.p2=null;var p0=arguments[0],p1=arguments[1],p2=arguments[2];this.p0=p0;this.p1=p1;this.p2=p2;}extend$1(Triangle.prototype,{area:function area(){return Triangle.area(this.p0,this.p1,this.p2);},signedArea:function signedArea(){return Triangle.signedArea(this.p0,this.p1,this.p2);},interpolateZ:function interpolateZ(p){if(p===null)throw new IllegalArgumentException("Supplied point is null.");return Triangle.interpolateZ(p,this.p0,this.p1,this.p2);},longestSideLength:function longestSideLength(){return Triangle.longestSideLength(this.p0,this.p1,this.p2);},isAcute:function isAcute(){return Triangle.isAcute(this.p0,this.p1,this.p2);},circumcentre:function circumcentre(){return Triangle.circumcentre(this.p0,this.p1,this.p2);},area3D:function area3D(){return Triangle.area3D(this.p0,this.p1,this.p2);},centroid:function centroid(){return Triangle.centroid(this.p0,this.p1,this.p2);},inCentre:function inCentre(){return Triangle.inCentre(this.p0,this.p1,this.p2);},interfaces_:function interfaces_(){return[];},getClass:function getClass(){return Triangle;}});Triangle.area=function(a,b,c){return Math.abs(((c.x-a.x)*(b.y-a.y)-(b.x-a.x)*(c.y-a.y))/2);};Triangle.signedArea=function(a,b,c){return((c.x-a.x)*(b.y-a.y)-(b.x-a.x)*(c.y-a.y))/2;};Triangle.det=function(m00,m01,m10,m11){return m00*m11-m01*m10;};Triangle.interpolateZ=function(p,v0,v1,v2){var x0=v0.x;var y0=v0.y;var a=v1.x-x0;var b=v2.x-x0;var c=v1.y-y0;var d=v2.y-y0;var det=a*d-b*c;var dx=p.x-x0;var dy=p.y-y0;var t=(d*dx-b*dy)/det;var u=(-c*dx+a*dy)/det;var z=v0.z+t*(v1.z-v0.z)+u*(v2.z-v0.z);return z;};Triangle.longestSideLength=function(a,b,c){var lenAB=a.distance(b);var lenBC=b.distance(c);var lenCA=c.distance(a);var maxLen=lenAB;if(lenBC>maxLen)maxLen=lenBC;if(lenCA>maxLen)maxLen=lenCA;return maxLen;};Triangle.isAcute=function(a,b,c){if(!Angle.isAcute(a,b,c))return false;if(!Angle.isAcute(b,c,a))return false;if(!Angle.isAcute(c,a,b))return false;return true;};Triangle.circumcentre=function(a,b,c){var cx=c.x;var cy=c.y;var ax=a.x-cx;var ay=a.y-cy;var bx=b.x-cx;var by=b.y-cy;var denom=2*Triangle.det(ax,ay,bx,by);var numx=Triangle.det(ay,ax*ax+ay*ay,by,bx*bx+by*by);var numy=Triangle.det(ax,ax*ax+ay*ay,bx,bx*bx+by*by);var ccx=cx-numx/denom;var ccy=cy+numy/denom;return new Coordinate(ccx,ccy);};Triangle.perpendicularBisector=function(a,b){var dx=b.x-a.x;var dy=b.y-a.y;var l1=new HCoordinate(a.x+dx/2.0,a.y+dy/2.0,1.0);var l2=new HCoordinate(a.x-dy+dx/2.0,a.y+dx+dy/2.0,1.0);return new HCoordinate(l1,l2);};Triangle.angleBisector=function(a,b,c){var len0=b.distance(a);var len2=b.distance(c);var frac=len0/(len0+len2);var dx=c.x-a.x;var dy=c.y-a.y;var splitPt=new Coordinate(a.x+frac*dx,a.y+frac*dy);return splitPt;};Triangle.area3D=function(a,b,c){var ux=b.x-a.x;var uy=b.y-a.y;var uz=b.z-a.z;var vx=c.x-a.x;var vy=c.y-a.y;var vz=c.z-a.z;var crossx=uy*vz-uz*vy;var crossy=uz*vx-ux*vz;var crossz=ux*vy-uy*vx;var absSq=crossx*crossx+crossy*crossy+crossz*crossz;var area3D=Math.sqrt(absSq)/2;return area3D;};Triangle.centroid=function(a,b,c){var x=(a.x+b.x+c.x)/3;var y=(a.y+b.y+c.y)/3;return new Coordinate(x,y);};Triangle.inCentre=function(a,b,c){var len0=b.distance(c);var len1=a.distance(c);var len2=a.distance(b);var circum=len0+len1+len2;var inCentreX=(len0*a.x+len1*b.x+len2*c.x)/circum;var inCentreY=(len0*a.y+len1*b.y+len2*c.y)/circum;return new Coordinate(inCentreX,inCentreY);};function OffsetCurveSetBuilder(){this.inputGeom=null;this.distance=null;this.curveBuilder=null;this.curveList=new ArrayList();var inputGeom=arguments[0],distance=arguments[1],curveBuilder=arguments[2];this.inputGeom=inputGeom;this.distance=distance;this.curveBuilder=curveBuilder;}extend$1(OffsetCurveSetBuilder.prototype,{addPoint:function addPoint(p){if(this.distance<=0.0)return null;var coord=p.getCoordinates();var curve=this.curveBuilder.getLineCurve(coord,this.distance);this.addCurve(curve,Location.EXTERIOR,Location.INTERIOR);},addPolygon:function addPolygon(p){var offsetDistance=this.distance;var offsetSide=Position.LEFT;if(this.distance<0.0){offsetDistance=-this.distance;offsetSide=Position.RIGHT;}var shell=p.getExteriorRing();var shellCoord=CoordinateArrays.removeRepeatedPoints(shell.getCoordinates());if(this.distance<0.0&&this.isErodedCompletely(shell,this.distance))return null;if(this.distance<=0.0&&shellCoord.length<3)return null;this.addPolygonRing(shellCoord,offsetDistance,offsetSide,Location.EXTERIOR,Location.INTERIOR);for(var i=0;i<p.getNumInteriorRing();i++){var hole=p.getInteriorRingN(i);var holeCoord=CoordinateArrays.removeRepeatedPoints(hole.getCoordinates());if(this.distance>0.0&&this.isErodedCompletely(hole,-this.distance))continue;this.addPolygonRing(holeCoord,offsetDistance,Position.opposite(offsetSide),Location.INTERIOR,Location.EXTERIOR);}},isTriangleErodedCompletely:function isTriangleErodedCompletely(triangleCoord,bufferDistance){var tri=new Triangle(triangleCoord[0],triangleCoord[1],triangleCoord[2]);var inCentre=tri.inCentre();var distToCentre=CGAlgorithms.distancePointLine(inCentre,tri.p0,tri.p1);return distToCentre<Math.abs(bufferDistance);},addLineString:function addLineString(line){if(this.distance<=0.0&&!this.curveBuilder.getBufferParameters().isSingleSided())return null;var coord=CoordinateArrays.removeRepeatedPoints(line.getCoordinates());var curve=this.curveBuilder.getLineCurve(coord,this.distance);this.addCurve(curve,Location.EXTERIOR,Location.INTERIOR);},addCurve:function addCurve(coord,leftLoc,rightLoc){if(coord===null||coord.length<2)return null;var e=new NodedSegmentString(coord,new Label(0,Location.BOUNDARY,leftLoc,rightLoc));this.curveList.add(e);},getCurves:function getCurves(){this.add(this.inputGeom);return this.curveList;},addPolygonRing:function addPolygonRing(coord,offsetDistance,side,cwLeftLoc,cwRightLoc){if(offsetDistance===0.0&&coord.length<LinearRing.MINIMUM_VALID_SIZE)return null;var leftLoc=cwLeftLoc;var rightLoc=cwRightLoc;if(coord.length>=LinearRing.MINIMUM_VALID_SIZE&&CGAlgorithms.isCCW(coord)){leftLoc=cwRightLoc;rightLoc=cwLeftLoc;side=Position.opposite(side);}var curve=this.curveBuilder.getRingCurve(coord,side,offsetDistance);this.addCurve(curve,leftLoc,rightLoc);},add:function add(g){if(g.isEmpty())return null;if(g instanceof Polygon)this.addPolygon(g);else if(g instanceof LineString)this.addLineString(g);else if(g instanceof Point)this.addPoint(g);else if(g instanceof MultiPoint)this.addCollection(g);else if(g instanceof MultiLineString)this.addCollection(g);else if(g instanceof MultiPolygon)this.addCollection(g);else if(g instanceof GeometryCollection)this.addCollection(g);else throw new UnsupportedOperationException(g.getClass().getName());},isErodedCompletely:function isErodedCompletely(ring,bufferDistance){var ringCoord=ring.getCoordinates();if(ringCoord.length<4)return bufferDistance<0;if(ringCoord.length===4)return this.isTriangleErodedCompletely(ringCoord,bufferDistance);var env=ring.getEnvelopeInternal();var envMinDimension=Math.min(env.getHeight(),env.getWidth());if(bufferDistance<0.0&&2*Math.abs(bufferDistance)>envMinDimension)return true;return false;},addCollection:function addCollection(gc){for(var i=0;i<gc.getNumGeometries();i++){var g=gc.getGeometryN(i);this.add(g);}},interfaces_:function interfaces_(){return[];},getClass:function getClass(){return OffsetCurveSetBuilder;}});function IntersectionAdder(){this._hasIntersection=false;this.hasProper=false;this.hasProperInterior=false;this.hasInterior=false;this.properIntersectionPoint=null;this.li=null;this.isSelfIntersection=null;this.numIntersections=0;this.numInteriorIntersections=0;this.numProperIntersections=0;this.numTests=0;var li=arguments[0];this.li=li;}extend$1(IntersectionAdder.prototype,{isTrivialIntersection:function isTrivialIntersection(e0,segIndex0,e1,segIndex1){if(e0===e1){if(this.li.getIntersectionNum()===1){if(IntersectionAdder.isAdjacentSegments(segIndex0,segIndex1))return true;if(e0.isClosed()){var maxSegIndex=e0.size()-1;if(segIndex0===0&&segIndex1===maxSegIndex||segIndex1===0&&segIndex0===maxSegIndex){return true;}}}}return false;},getProperIntersectionPoint:function getProperIntersectionPoint(){return this.properIntersectionPoint;},hasProperInteriorIntersection:function hasProperInteriorIntersection(){return this.hasProperInterior;},getLineIntersector:function getLineIntersector(){return this.li;},hasProperIntersection:function hasProperIntersection(){return this.hasProper;},processIntersections:function processIntersections(e0,segIndex0,e1,segIndex1){if(e0===e1&&segIndex0===segIndex1)return null;this.numTests++;var p00=e0.getCoordinates()[segIndex0];var p01=e0.getCoordinates()[segIndex0+1];var p10=e1.getCoordinates()[segIndex1];var p11=e1.getCoordinates()[segIndex1+1];this.li.computeIntersection(p00,p01,p10,p11);if(this.li.hasIntersection()){this.numIntersections++;if(this.li.isInteriorIntersection()){this.numInteriorIntersections++;this.hasInterior=true;}if(!this.isTrivialIntersection(e0,segIndex0,e1,segIndex1)){this._hasIntersection=true;e0.addIntersections(this.li,segIndex0,0);e1.addIntersections(this.li,segIndex1,1);if(this.li.isProper()){this.numProperIntersections++;this.hasProper=true;this.hasProperInterior=true;}}}},hasIntersection:function hasIntersection(){return this._hasIntersection;},isDone:function isDone(){return false;},hasInteriorIntersection:function hasInteriorIntersection(){return this.hasInterior;},interfaces_:function interfaces_(){return[SegmentIntersector$1];},getClass:function getClass(){return IntersectionAdder;}});IntersectionAdder.isAdjacentSegments=function(i1,i2){return Math.abs(i1-i2)===1;};function BufferBuilder(){this.bufParams=null;this.workingPrecisionModel=null;this.workingNoder=null;this.geomFact=null;this.graph=null;this.edgeList=new EdgeList();var bufParams=arguments[0];this.bufParams=bufParams;}extend$1(BufferBuilder.prototype,{setWorkingPrecisionModel:function setWorkingPrecisionModel(pm){this.workingPrecisionModel=pm;},insertUniqueEdge:function insertUniqueEdge(e){var existingEdge=this.edgeList.findEqualEdge(e);if(existingEdge!==null){var existingLabel=existingEdge.getLabel();var labelToMerge=e.getLabel();if(!existingEdge.isPointwiseEqual(e)){labelToMerge=new Label(e.getLabel());labelToMerge.flip();}existingLabel.merge(labelToMerge);var mergeDelta=BufferBuilder.depthDelta(labelToMerge);var existingDelta=existingEdge.getDepthDelta();var newDelta=existingDelta+mergeDelta;existingEdge.setDepthDelta(newDelta);}else{this.edgeList.add(e);e.setDepthDelta(BufferBuilder.depthDelta(e.getLabel()));}},buildSubgraphs:function buildSubgraphs(subgraphList,polyBuilder){var processedGraphs=new ArrayList();for(var i=subgraphList.iterator();i.hasNext();){var subgraph=i.next();var p=subgraph.getRightmostCoordinate();var locater=new SubgraphDepthLocater(processedGraphs);var outsideDepth=locater.getDepth(p);subgraph.computeDepth(outsideDepth);subgraph.findResultEdges();processedGraphs.add(subgraph);polyBuilder.add(subgraph.getDirectedEdges(),subgraph.getNodes());}},createSubgraphs:function createSubgraphs(graph){var subgraphList=new ArrayList();for(var i=graph.getNodes().iterator();i.hasNext();){var node=i.next();if(!node.isVisited()){var subgraph=new BufferSubgraph();subgraph.create(node);subgraphList.add(subgraph);}}Collections.sort(subgraphList,Collections.reverseOrder());return subgraphList;},createEmptyResultGeometry:function createEmptyResultGeometry(){var emptyGeom=this.geomFact.createPolygon();return emptyGeom;},getNoder:function getNoder(precisionModel){if(this.workingNoder!==null)return this.workingNoder;var noder=new MCIndexNoder();var li=new RobustLineIntersector();li.setPrecisionModel(precisionModel);noder.setSegmentIntersector(new IntersectionAdder(li));return noder;},buffer:function buffer(g,distance){var precisionModel=this.workingPrecisionModel;if(precisionModel===null)precisionModel=g.getPrecisionModel();this.geomFact=g.getFactory();var curveBuilder=new OffsetCurveBuilder(precisionModel,this.bufParams);var curveSetBuilder=new OffsetCurveSetBuilder(g,distance,curveBuilder);var bufferSegStrList=curveSetBuilder.getCurves();if(bufferSegStrList.size()<=0){return this.createEmptyResultGeometry();}this.computeNodedEdges(bufferSegStrList,precisionModel);this.graph=new PlanarGraph(new OverlayNodeFactory());this.graph.addEdges(this.edgeList.getEdges());var subgraphList=this.createSubgraphs(this.graph);var polyBuilder=new PolygonBuilder(this.geomFact);this.buildSubgraphs(subgraphList,polyBuilder);var resultPolyList=polyBuilder.getPolygons();if(resultPolyList.size()<=0){return this.createEmptyResultGeometry();}var resultGeom=this.geomFact.buildGeometry(resultPolyList);return resultGeom;},computeNodedEdges:function computeNodedEdges(bufferSegStrList,precisionModel){var noder=this.getNoder(precisionModel);noder.computeNodes(bufferSegStrList);var nodedSegStrings=noder.getNodedSubstrings();for(var i=nodedSegStrings.iterator();i.hasNext();){var segStr=i.next();var pts=segStr.getCoordinates();if(pts.length===2&&pts[0].equals2D(pts[1]))continue;var oldLabel=segStr.getData();var edge=new Edge(segStr.getCoordinates(),new Label(oldLabel));this.insertUniqueEdge(edge);}},setNoder:function setNoder(noder){this.workingNoder=noder;},interfaces_:function interfaces_(){return[];},getClass:function getClass(){return BufferBuilder;}});BufferBuilder.depthDelta=function(label){var lLoc=label.getLocation(0,Position.LEFT);var rLoc=label.getLocation(0,Position.RIGHT);if(lLoc===Location.INTERIOR&&rLoc===Location.EXTERIOR)return 1;else if(lLoc===Location.EXTERIOR&&rLoc===Location.INTERIOR)return-1;return 0;};BufferBuilder.convertSegStrings=function(it){var fact=new GeometryFactory();var lines=new ArrayList();while(it.hasNext()){var ss=it.next();var line=fact.createLineString(ss.getCoordinates());lines.add(line);}return fact.buildGeometry(lines);};function ScaledNoder(){this.noder=null;this.scaleFactor=null;this.offsetX=null;this.offsetY=null;this.isScaled=false;if(arguments.length===2){var noder=arguments[0],scaleFactor=arguments[1];ScaledNoder.call(this,noder,scaleFactor,0,0);}else if(arguments.length===4){var noder=arguments[0],scaleFactor=arguments[1];this.noder=noder;this.scaleFactor=scaleFactor;this.isScaled=!this.isIntegerPrecision();}}extend$1(ScaledNoder.prototype,{rescale:function rescale(){if(hasInterface(arguments[0],Collection)){var segStrings=arguments[0];for(var i=segStrings.iterator();i.hasNext();){var ss=i.next();this.rescale(ss.getCoordinates());}}else if(arguments[0]instanceof Array){var pts=arguments[0];var p0=null;var p1=null;if(pts.length===2){p0=new Coordinate(pts[0]);p1=new Coordinate(pts[1]);}for(var i=0;i<pts.length;i++){pts[i].x=pts[i].x/this.scaleFactor+this.offsetX;pts[i].y=pts[i].y/this.scaleFactor+this.offsetY;}if(pts.length===2&&pts[0].equals2D(pts[1])){System.out.println(pts);}}},scale:function scale(){if(hasInterface(arguments[0],Collection)){var segStrings=arguments[0];var nodedSegmentStrings=new ArrayList();for(var i=segStrings.iterator();i.hasNext();){var ss=i.next();nodedSegmentStrings.add(new NodedSegmentString(this.scale(ss.getCoordinates()),ss.getData()));}return nodedSegmentStrings;}else if(arguments[0]instanceof Array){var pts=arguments[0];var roundPts=new Array(pts.length).fill(null);for(var i=0;i<pts.length;i++){roundPts[i]=new Coordinate(Math.round((pts[i].x-this.offsetX)*this.scaleFactor),Math.round((pts[i].y-this.offsetY)*this.scaleFactor),pts[i].z);}var roundPtsNoDup=CoordinateArrays.removeRepeatedPoints(roundPts);return roundPtsNoDup;}},isIntegerPrecision:function isIntegerPrecision(){return this.scaleFactor===1.0;},getNodedSubstrings:function getNodedSubstrings(){var splitSS=this.noder.getNodedSubstrings();if(this.isScaled)this.rescale(splitSS);return splitSS;},computeNodes:function computeNodes(inputSegStrings){var intSegStrings=inputSegStrings;if(this.isScaled)intSegStrings=this.scale(inputSegStrings);this.noder.computeNodes(intSegStrings);},interfaces_:function interfaces_(){return[Noder];},getClass:function getClass(){return ScaledNoder;}});function NodingValidator(){this.li=new RobustLineIntersector();this.segStrings=null;var segStrings=arguments[0];this.segStrings=segStrings;}extend$1(NodingValidator.prototype,{checkEndPtVertexIntersections:function checkEndPtVertexIntersections(){if(arguments.length===0){for(var i=this.segStrings.iterator();i.hasNext();){var ss=i.next();var pts=ss.getCoordinates();this.checkEndPtVertexIntersections(pts[0],this.segStrings);this.checkEndPtVertexIntersections(pts[pts.length-1],this.segStrings);}}else if(arguments.length===2){var testPt=arguments[0],segStrings=arguments[1];for(var i=segStrings.iterator();i.hasNext();){var ss=i.next();var pts=ss.getCoordinates();for(var j=1;j<pts.length-1;j++){if(pts[j].equals(testPt))throw new RuntimeException("found endpt/interior pt intersection at index "+j+" :pt "+testPt);}}}},checkInteriorIntersections:function checkInteriorIntersections(){if(arguments.length===0){for(var i=this.segStrings.iterator();i.hasNext();){var ss0=i.next();for(var j=this.segStrings.iterator();j.hasNext();){var ss1=j.next();this.checkInteriorIntersections(ss0,ss1);}}}else if(arguments.length===2){var ss0=arguments[0],ss1=arguments[1];var pts0=ss0.getCoordinates();var pts1=ss1.getCoordinates();for(var i0=0;i0<pts0.length-1;i0++){for(var i1=0;i1<pts1.length-1;i1++){this.checkInteriorIntersections(ss0,i0,ss1,i1);}}}else if(arguments.length===4){var e0=arguments[0],segIndex0=arguments[1],e1=arguments[2],segIndex1=arguments[3];if(e0===e1&&segIndex0===segIndex1)return null;var p00=e0.getCoordinates()[segIndex0];var p01=e0.getCoordinates()[segIndex0+1];var p10=e1.getCoordinates()[segIndex1];var p11=e1.getCoordinates()[segIndex1+1];this.li.computeIntersection(p00,p01,p10,p11);if(this.li.hasIntersection()){if(this.li.isProper()||this.hasInteriorIntersection(this.li,p00,p01)||this.hasInteriorIntersection(this.li,p10,p11)){throw new RuntimeException("found non-noded intersection at "+p00+"-"+p01+" and "+p10+"-"+p11);}}}},checkValid:function checkValid(){this.checkEndPtVertexIntersections();this.checkInteriorIntersections();this.checkCollapses();},checkCollapses:function checkCollapses(){if(arguments.length===0){for(var i=this.segStrings.iterator();i.hasNext();){var ss=i.next();this.checkCollapses(ss);}}else if(arguments.length===1){var ss=arguments[0];var pts=ss.getCoordinates();for(var i=0;i<pts.length-2;i++){this.checkCollapse(pts[i],pts[i+1],pts[i+2]);}}},hasInteriorIntersection:function hasInteriorIntersection(li,p0,p1){for(var i=0;i<li.getIntersectionNum();i++){var intPt=li.getIntersection(i);if(!(intPt.equals(p0)||intPt.equals(p1)))return true;}return false;},checkCollapse:function checkCollapse(p0,p1,p2){if(p0.equals(p2))throw new RuntimeException("found non-noded collapse at "+NodingValidator.fact.createLineString([p0,p1,p2]));},interfaces_:function interfaces_(){return[];},getClass:function getClass(){return NodingValidator;}});NodingValidator.fact=new GeometryFactory();function HotPixel(){this.li=null;this.pt=null;this.originalPt=null;this.ptScaled=null;this.p0Scaled=null;this.p1Scaled=null;this.scaleFactor=null;this.minx=null;this.maxx=null;this.miny=null;this.maxy=null;this.corner=new Array(4).fill(null);this.safeEnv=null;var pt=arguments[0],scaleFactor=arguments[1],li=arguments[2];this.originalPt=pt;this.pt=pt;this.scaleFactor=scaleFactor;this.li=li;if(scaleFactor<=0)throw new IllegalArgumentException("Scale factor must be non-zero");if(scaleFactor!==1.0){this.pt=new Coordinate(this.scale(pt.x),this.scale(pt.y));this.p0Scaled=new Coordinate();this.p1Scaled=new Coordinate();}this.initCorners(this.pt);}extend$1(HotPixel.prototype,{intersectsScaled:function intersectsScaled(p0,p1){var segMinx=Math.min(p0.x,p1.x);var segMaxx=Math.max(p0.x,p1.x);var segMiny=Math.min(p0.y,p1.y);var segMaxy=Math.max(p0.y,p1.y);var isOutsidePixelEnv=this.maxx<segMinx||this.minx>segMaxx||this.maxy<segMiny||this.miny>segMaxy;if(isOutsidePixelEnv)return false;var intersects=this.intersectsToleranceSquare(p0,p1);Assert.isTrue(!(isOutsidePixelEnv&&intersects),"Found bad envelope test");return intersects;},initCorners:function initCorners(pt){var tolerance=0.5;this.minx=pt.x-tolerance;this.maxx=pt.x+tolerance;this.miny=pt.y-tolerance;this.maxy=pt.y+tolerance;this.corner[0]=new Coordinate(this.maxx,this.maxy);this.corner[1]=new Coordinate(this.minx,this.maxy);this.corner[2]=new Coordinate(this.minx,this.miny);this.corner[3]=new Coordinate(this.maxx,this.miny);},intersects:function intersects(p0,p1){if(this.scaleFactor===1.0)return this.intersectsScaled(p0,p1);this.copyScaled(p0,this.p0Scaled);this.copyScaled(p1,this.p1Scaled);return this.intersectsScaled(this.p0Scaled,this.p1Scaled);},scale:function scale(val){return Math.round(val*this.scaleFactor);},getCoordinate:function getCoordinate(){return this.originalPt;},copyScaled:function copyScaled(p,pScaled){pScaled.x=this.scale(p.x);pScaled.y=this.scale(p.y);},getSafeEnvelope:function getSafeEnvelope(){if(this.safeEnv===null){var safeTolerance=HotPixel.SAFE_ENV_EXPANSION_FACTOR/this.scaleFactor;this.safeEnv=new Envelope(this.originalPt.x-safeTolerance,this.originalPt.x+safeTolerance,this.originalPt.y-safeTolerance,this.originalPt.y+safeTolerance);}return this.safeEnv;},intersectsPixelClosure:function intersectsPixelClosure(p0,p1){this.li.computeIntersection(p0,p1,this.corner[0],this.corner[1]);if(this.li.hasIntersection())return true;this.li.computeIntersection(p0,p1,this.corner[1],this.corner[2]);if(this.li.hasIntersection())return true;this.li.computeIntersection(p0,p1,this.corner[2],this.corner[3]);if(this.li.hasIntersection())return true;this.li.computeIntersection(p0,p1,this.corner[3],this.corner[0]);if(this.li.hasIntersection())return true;return false;},intersectsToleranceSquare:function intersectsToleranceSquare(p0,p1){var intersectsLeft=false;var intersectsBottom=false;this.li.computeIntersection(p0,p1,this.corner[0],this.corner[1]);if(this.li.isProper())return true;this.li.computeIntersection(p0,p1,this.corner[1],this.corner[2]);if(this.li.isProper())return true;if(this.li.hasIntersection())intersectsLeft=true;this.li.computeIntersection(p0,p1,this.corner[2],this.corner[3]);if(this.li.isProper())return true;if(this.li.hasIntersection())intersectsBottom=true;this.li.computeIntersection(p0,p1,this.corner[3],this.corner[0]);if(this.li.isProper())return true;if(intersectsLeft&&intersectsBottom)return true;if(p0.equals(this.pt))return true;if(p1.equals(this.pt))return true;return false;},addSnappedNode:function addSnappedNode(segStr,segIndex){var p0=segStr.getCoordinate(segIndex);var p1=segStr.getCoordinate(segIndex+1);if(this.intersects(p0,p1)){segStr.addIntersection(this.getCoordinate(),segIndex);return true;}return false;},interfaces_:function interfaces_(){return[];},getClass:function getClass(){return HotPixel;}});HotPixel.SAFE_ENV_EXPANSION_FACTOR=0.75;function MCIndexPointSnapper(){this.index=null;var index=arguments[0];this.index=index;}extend$1(MCIndexPointSnapper.prototype,{snap:function snap(){if(arguments.length===1){var hotPixel=arguments[0];return this.snap(hotPixel,null,-1);}else if(arguments.length===3){var hotPixel=arguments[0],parentEdge=arguments[1],hotPixelVertexIndex=arguments[2];var pixelEnv=hotPixel.getSafeEnvelope();var hotPixelSnapAction=new HotPixelSnapAction(hotPixel,parentEdge,hotPixelVertexIndex);this.index.query(pixelEnv,{interfaces_:function interfaces_(){return[ItemVisitor];},visitItem:function visitItem(item){var testChain=item;testChain.select(pixelEnv,hotPixelSnapAction);}});return hotPixelSnapAction.isNodeAdded();}},interfaces_:function interfaces_(){return[];},getClass:function getClass(){return MCIndexPointSnapper;}});function HotPixelSnapAction(){MonotoneChainSelectAction.apply(this);this.hotPixel=null;this.parentEdge=null;this.hotPixelVertexIndex=null;this._isNodeAdded=false;var hotPixel=arguments[0],parentEdge=arguments[1],hotPixelVertexIndex=arguments[2];this.hotPixel=hotPixel;this.parentEdge=parentEdge;this.hotPixelVertexIndex=hotPixelVertexIndex;}inherits$1(HotPixelSnapAction,MonotoneChainSelectAction);extend$1(HotPixelSnapAction.prototype,{isNodeAdded:function isNodeAdded(){return this._isNodeAdded;},select:function select(){if(arguments.length===2){var mc=arguments[0],startIndex=arguments[1];var ss=mc.getContext();if(this.parentEdge!==null){if(ss===this.parentEdge&&startIndex===this.hotPixelVertexIndex)return null;}this._isNodeAdded=this.hotPixel.addSnappedNode(ss,startIndex);}else return MonotoneChainSelectAction.prototype.select.apply(this,arguments);},interfaces_:function interfaces_(){return[];},getClass:function getClass(){return HotPixelSnapAction;}});MCIndexPointSnapper.HotPixelSnapAction=HotPixelSnapAction;function InteriorIntersectionFinderAdder(){this.li=null;this.interiorIntersections=null;var li=arguments[0];this.li=li;this.interiorIntersections=new ArrayList();}extend$1(InteriorIntersectionFinderAdder.prototype,{processIntersections:function processIntersections(e0,segIndex0,e1,segIndex1){if(e0===e1&&segIndex0===segIndex1)return null;var p00=e0.getCoordinates()[segIndex0];var p01=e0.getCoordinates()[segIndex0+1];var p10=e1.getCoordinates()[segIndex1];var p11=e1.getCoordinates()[segIndex1+1];this.li.computeIntersection(p00,p01,p10,p11);if(this.li.hasIntersection()){if(this.li.isInteriorIntersection()){for(var intIndex=0;intIndex<this.li.getIntersectionNum();intIndex++){this.interiorIntersections.add(this.li.getIntersection(intIndex));}e0.addIntersections(this.li,segIndex0,0);e1.addIntersections(this.li,segIndex1,1);}}},isDone:function isDone(){return false;},getInteriorIntersections:function getInteriorIntersections(){return this.interiorIntersections;},interfaces_:function interfaces_(){return[SegmentIntersector$1];},getClass:function getClass(){return InteriorIntersectionFinderAdder;}});function MCIndexSnapRounder(){this.pm=null;this.li=null;this.scaleFactor=null;this.noder=null;this.pointSnapper=null;this.nodedSegStrings=null;var pm=arguments[0];this.pm=pm;this.li=new RobustLineIntersector();this.li.setPrecisionModel(pm);this.scaleFactor=pm.getScale();}extend$1(MCIndexSnapRounder.prototype,{checkCorrectness:function checkCorrectness(inputSegmentStrings){var resultSegStrings=NodedSegmentString.getNodedSubstrings(inputSegmentStrings);var nv=new NodingValidator(resultSegStrings);try{nv.checkValid();}catch(ex){if(ex instanceof Exception){ex.printStackTrace();}else throw ex;}finally{}},getNodedSubstrings:function getNodedSubstrings(){return NodedSegmentString.getNodedSubstrings(this.nodedSegStrings);},snapRound:function snapRound(segStrings,li){var intersections=this.findInteriorIntersections(segStrings,li);this.computeIntersectionSnaps(intersections);this.computeVertexSnaps(segStrings);},findInteriorIntersections:function findInteriorIntersections(segStrings,li){var intFinderAdder=new InteriorIntersectionFinderAdder(li);this.noder.setSegmentIntersector(intFinderAdder);this.noder.computeNodes(segStrings);return intFinderAdder.getInteriorIntersections();},computeVertexSnaps:function computeVertexSnaps(){if(hasInterface(arguments[0],Collection)){var edges=arguments[0];for(var i0=edges.iterator();i0.hasNext();){var edge0=i0.next();this.computeVertexSnaps(edge0);}}else if(arguments[0]instanceof NodedSegmentString){var e=arguments[0];var pts0=e.getCoordinates();for(var i=0;i<pts0.length;i++){var hotPixel=new HotPixel(pts0[i],this.scaleFactor,this.li);var isNodeAdded=this.pointSnapper.snap(hotPixel,e,i);if(isNodeAdded){e.addIntersection(pts0[i],i);}}}},computeNodes:function computeNodes(inputSegmentStrings){this.nodedSegStrings=inputSegmentStrings;this.noder=new MCIndexNoder();this.pointSnapper=new MCIndexPointSnapper(this.noder.getIndex());this.snapRound(inputSegmentStrings,this.li);},computeIntersectionSnaps:function computeIntersectionSnaps(snapPts){for(var it=snapPts.iterator();it.hasNext();){var snapPt=it.next();var hotPixel=new HotPixel(snapPt,this.scaleFactor,this.li);this.pointSnapper.snap(hotPixel);}},interfaces_:function interfaces_(){return[Noder];},getClass:function getClass(){return MCIndexSnapRounder;}});function BufferOp(){this.argGeom=null;this.distance=null;this.bufParams=new BufferParameters();this.resultGeometry=null;this.saveException=null;if(arguments.length===1){var g=arguments[0];this.argGeom=g;}else if(arguments.length===2){var g=arguments[0],bufParams=arguments[1];this.argGeom=g;this.bufParams=bufParams;}}extend$1(BufferOp.prototype,{bufferFixedPrecision:function bufferFixedPrecision(fixedPM){var noder=new ScaledNoder(new MCIndexSnapRounder(new PrecisionModel(1.0)),fixedPM.getScale());var bufBuilder=new BufferBuilder(this.bufParams);bufBuilder.setWorkingPrecisionModel(fixedPM);bufBuilder.setNoder(noder);this.resultGeometry=bufBuilder.buffer(this.argGeom,this.distance);},bufferReducedPrecision:function bufferReducedPrecision(){if(arguments.length===0){for(var precDigits=BufferOp.MAX_PRECISION_DIGITS;precDigits>=0;precDigits--){try{this.bufferReducedPrecision(precDigits);}catch(ex){if(ex instanceof TopologyException){this.saveException=ex;}else throw ex;}finally{}if(this.resultGeometry!==null)return null;}throw this.saveException;}else if(arguments.length===1){var precisionDigits=arguments[0];var sizeBasedScaleFactor=BufferOp.precisionScaleFactor(this.argGeom,this.distance,precisionDigits);var fixedPM=new PrecisionModel(sizeBasedScaleFactor);this.bufferFixedPrecision(fixedPM);}},computeGeometry:function computeGeometry(){this.bufferOriginalPrecision();if(this.resultGeometry!==null)return null;var argPM=this.argGeom.getFactory().getPrecisionModel();if(argPM.getType()===PrecisionModel.FIXED)this.bufferFixedPrecision(argPM);else this.bufferReducedPrecision();},setQuadrantSegments:function setQuadrantSegments(quadrantSegments){this.bufParams.setQuadrantSegments(quadrantSegments);},bufferOriginalPrecision:function bufferOriginalPrecision(){try{var bufBuilder=new BufferBuilder(this.bufParams);this.resultGeometry=bufBuilder.buffer(this.argGeom,this.distance);}catch(ex){if(ex instanceof RuntimeException){this.saveException=ex;}else throw ex;}finally{}},getResultGeometry:function getResultGeometry(distance){this.distance=distance;this.computeGeometry();return this.resultGeometry;},setEndCapStyle:function setEndCapStyle(endCapStyle){this.bufParams.setEndCapStyle(endCapStyle);},interfaces_:function interfaces_(){return[];},getClass:function getClass(){return BufferOp;}});BufferOp.bufferOp=function(){if(arguments.length===2){var g=arguments[0],distance=arguments[1];var gBuf=new BufferOp(g);var geomBuf=gBuf.getResultGeometry(distance);return geomBuf;}else if(arguments.length===3){if(Number.isInteger(arguments[2])&&arguments[0]instanceof Geometry&&typeof arguments[1]==="number"){var g=arguments[0],distance=arguments[1],quadrantSegments=arguments[2];var bufOp=new BufferOp(g);bufOp.setQuadrantSegments(quadrantSegments);var geomBuf=bufOp.getResultGeometry(distance);return geomBuf;}else if(arguments[2]instanceof BufferParameters&&arguments[0]instanceof Geometry&&typeof arguments[1]==="number"){var g=arguments[0],distance=arguments[1],params=arguments[2];var bufOp=new BufferOp(g,params);var geomBuf=bufOp.getResultGeometry(distance);return geomBuf;}}else if(arguments.length===4){var g=arguments[0],distance=arguments[1],quadrantSegments=arguments[2],endCapStyle=arguments[3];var bufOp=new BufferOp(g);bufOp.setQuadrantSegments(quadrantSegments);bufOp.setEndCapStyle(endCapStyle);var geomBuf=bufOp.getResultGeometry(distance);return geomBuf;}};BufferOp.precisionScaleFactor=function(g,distance,maxPrecisionDigits){var env=g.getEnvelopeInternal();var envMax=MathUtil.max(Math.abs(env.getMaxX()),Math.abs(env.getMaxY()),Math.abs(env.getMinX()),Math.abs(env.getMinY()));var expandByDistance=distance>0.0?distance:0.0;var bufEnvMax=envMax+2*expandByDistance;var bufEnvPrecisionDigits=Math.trunc(Math.log(bufEnvMax)/Math.log(10)+1.0);var minUnitLog10=maxPrecisionDigits-bufEnvPrecisionDigits;var scaleFactor=Math.pow(10.0,minUnitLog10);return scaleFactor;};BufferOp.CAP_ROUND=BufferParameters.CAP_ROUND;BufferOp.CAP_BUTT=BufferParameters.CAP_FLAT;BufferOp.CAP_FLAT=BufferParameters.CAP_FLAT;BufferOp.CAP_SQUARE=BufferParameters.CAP_SQUARE;BufferOp.MAX_PRECISION_DIGITS=12;function UniqueCoordinateArrayFilter(){this.treeSet=new TreeSet();this.list=new ArrayList();}extend$1(UniqueCoordinateArrayFilter.prototype,{filter:function filter(coord){if(!this.treeSet.contains(coord)){this.list.add(coord);this.treeSet.add(coord);}},getCoordinates:function getCoordinates(){var coordinates=new Array(this.list.size()).fill(null);return this.list.toArray(coordinates);},interfaces_:function interfaces_(){return[CoordinateFilter];},getClass:function getClass(){return UniqueCoordinateArrayFilter;}});UniqueCoordinateArrayFilter.filterCoordinates=function(coords){var filter=new UniqueCoordinateArrayFilter();for(var i=0;i<coords.length;i++){filter.filter(coords[i]);}return filter.getCoordinates();};function ConvexHull(){this.geomFactory=null;this.inputPts=null;if(arguments.length===1){var geometry=arguments[0];ConvexHull.call(this,ConvexHull.extractCoordinates(geometry),geometry.getFactory());}else if(arguments.length===2){var pts=arguments[0],geomFactory=arguments[1];this.inputPts=UniqueCoordinateArrayFilter.filterCoordinates(pts);this.geomFactory=geomFactory;}}extend$1(ConvexHull.prototype,{preSort:function preSort(pts){var t=null;for(var i=1;i<pts.length;i++){if(pts[i].y<pts[0].y||pts[i].y===pts[0].y&&pts[i].x<pts[0].x){t=pts[0];pts[0]=pts[i];pts[i]=t;}}Arrays.sort(pts,1,pts.length,new RadialComparator(pts[0]));return pts;},computeOctRing:function computeOctRing(inputPts){var octPts=this.computeOctPts(inputPts);var coordList=new CoordinateList();coordList.add(octPts,false);if(coordList.size()<3){return null;}coordList.closeRing();return coordList.toCoordinateArray();},lineOrPolygon:function lineOrPolygon(coordinates){coordinates=this.cleanRing(coordinates);if(coordinates.length===3){return this.geomFactory.createLineString([coordinates[0],coordinates[1]]);}var linearRing=this.geomFactory.createLinearRing(coordinates);return this.geomFactory.createPolygon(linearRing,null);},cleanRing:function cleanRing(original){Assert.equals(original[0],original[original.length-1]);var cleanedRing=new ArrayList();var previousDistinctCoordinate=null;for(var i=0;i<=original.length-2;i++){var currentCoordinate=original[i];var nextCoordinate=original[i+1];if(currentCoordinate.equals(nextCoordinate)){continue;}if(previousDistinctCoordinate!==null&&this.isBetween(previousDistinctCoordinate,currentCoordinate,nextCoordinate)){continue;}cleanedRing.add(currentCoordinate);previousDistinctCoordinate=currentCoordinate;}cleanedRing.add(original[original.length-1]);var cleanedRingCoordinates=new Array(cleanedRing.size()).fill(null);return cleanedRing.toArray(cleanedRingCoordinates);},isBetween:function isBetween(c1,c2,c3){if(CGAlgorithms.computeOrientation(c1,c2,c3)!==0){return false;}if(c1.x!==c3.x){if(c1.x<=c2.x&&c2.x<=c3.x){return true;}if(c3.x<=c2.x&&c2.x<=c1.x){return true;}}if(c1.y!==c3.y){if(c1.y<=c2.y&&c2.y<=c3.y){return true;}if(c3.y<=c2.y&&c2.y<=c1.y){return true;}}return false;},reduce:function reduce(inputPts){var polyPts=this.computeOctRing(inputPts);if(polyPts===null)return inputPts;var reducedSet=new TreeSet();for(var i=0;i<polyPts.length;i++){reducedSet.add(polyPts[i]);}for(var i=0;i<inputPts.length;i++){if(!CGAlgorithms.isPointInRing(inputPts[i],polyPts)){reducedSet.add(inputPts[i]);}}var reducedPts=CoordinateArrays.toCoordinateArray(reducedSet);if(reducedPts.length<3)return this.padArray3(reducedPts);return reducedPts;},getConvexHull:function getConvexHull(){if(this.inputPts.length===0){return this.geomFactory.createGeometryCollection(null);}if(this.inputPts.length===1){return this.geomFactory.createPoint(this.inputPts[0]);}if(this.inputPts.length===2){return this.geomFactory.createLineString(this.inputPts);}var reducedPts=this.inputPts;if(this.inputPts.length>50){reducedPts=this.reduce(this.inputPts);}var sortedPts=this.preSort(reducedPts);var cHS=this.grahamScan(sortedPts);var cH=this.toCoordinateArray(cHS);return this.lineOrPolygon(cH);},padArray3:function padArray3(pts){var pad=new Array(3).fill(null);for(var i=0;i<pad.length;i++){if(i<pts.length){pad[i]=pts[i];}else pad[i]=pts[0];}return pad;},computeOctPts:function computeOctPts(inputPts){var pts=new Array(8).fill(null);for(var j=0;j<pts.length;j++){pts[j]=inputPts[0];}for(var i=1;i<inputPts.length;i++){if(inputPts[i].x<pts[0].x){pts[0]=inputPts[i];}if(inputPts[i].x-inputPts[i].y<pts[1].x-pts[1].y){pts[1]=inputPts[i];}if(inputPts[i].y>pts[2].y){pts[2]=inputPts[i];}if(inputPts[i].x+inputPts[i].y>pts[3].x+pts[3].y){pts[3]=inputPts[i];}if(inputPts[i].x>pts[4].x){pts[4]=inputPts[i];}if(inputPts[i].x-inputPts[i].y>pts[5].x-pts[5].y){pts[5]=inputPts[i];}if(inputPts[i].y<pts[6].y){pts[6]=inputPts[i];}if(inputPts[i].x+inputPts[i].y<pts[7].x+pts[7].y){pts[7]=inputPts[i];}}return pts;},toCoordinateArray:function toCoordinateArray(stack){var coordinates=new Array(stack.size()).fill(null);for(var i=0;i<stack.size();i++){var coordinate=stack.get(i);coordinates[i]=coordinate;}return coordinates;},grahamScan:function grahamScan(c){var p=null;var ps=new Stack$2();p=ps.push(c[0]);p=ps.push(c[1]);p=ps.push(c[2]);for(var i=3;i<c.length;i++){p=ps.pop();while(!ps.empty()&&CGAlgorithms.computeOrientation(ps.peek(),p,c[i])>0){p=ps.pop();}p=ps.push(p);p=ps.push(c[i]);}p=ps.push(c[0]);return ps;},interfaces_:function interfaces_(){return[];},getClass:function getClass(){return ConvexHull;}});ConvexHull.extractCoordinates=function(geom){var filter=new UniqueCoordinateArrayFilter();geom.apply(filter);return filter.getCoordinates();};function RadialComparator(){this.origin=null;var origin=arguments[0];this.origin=origin;}extend$1(RadialComparator.prototype,{compare:function compare(o1,o2){var p1=o1;var p2=o2;return RadialComparator.polarCompare(this.origin,p1,p2);},interfaces_:function interfaces_(){return[Comparator];},getClass:function getClass(){return RadialComparator;}});RadialComparator.polarCompare=function(o,p,q){var dxp=p.x-o.x;var dyp=p.y-o.y;var dxq=q.x-o.x;var dyq=q.y-o.y;var orient=CGAlgorithms.computeOrientation(o,p,q);if(orient===CGAlgorithms.COUNTERCLOCKWISE)return 1;if(orient===CGAlgorithms.CLOCKWISE)return-1;var op=dxp*dxp+dyp*dyp;var oq=dxq*dxq+dyq*dyq;if(op<oq){return-1;}if(op>oq){return 1;}return 0;};ConvexHull.RadialComparator=RadialComparator;function Centroid(){this.areaBasePt=null;this.triangleCent3=new Coordinate();this.areasum2=0;this.cg3=new Coordinate();this.lineCentSum=new Coordinate();this.totalLength=0.0;this.ptCount=0;this.ptCentSum=new Coordinate();var geom=arguments[0];this.areaBasePt=null;this.add(geom);}extend$1(Centroid.prototype,{addPoint:function addPoint(pt){this.ptCount+=1;this.ptCentSum.x+=pt.x;this.ptCentSum.y+=pt.y;},setBasePoint:function setBasePoint(basePt){if(this.areaBasePt===null)this.areaBasePt=basePt;},addLineSegments:function addLineSegments(pts){var lineLen=0.0;for(var i=0;i<pts.length-1;i++){var segmentLen=pts[i].distance(pts[i+1]);if(segmentLen===0.0)continue;lineLen+=segmentLen;var midx=(pts[i].x+pts[i+1].x)/2;this.lineCentSum.x+=segmentLen*midx;var midy=(pts[i].y+pts[i+1].y)/2;this.lineCentSum.y+=segmentLen*midy;}this.totalLength+=lineLen;if(lineLen===0.0&&pts.length>0)this.addPoint(pts[0]);},addHole:function addHole(pts){var isPositiveArea=CGAlgorithms.isCCW(pts);for(var i=0;i<pts.length-1;i++){this.addTriangle(this.areaBasePt,pts[i],pts[i+1],isPositiveArea);}this.addLineSegments(pts);},getCentroid:function getCentroid(){var cent=new Coordinate();if(Math.abs(this.areasum2)>0.0){cent.x=this.cg3.x/3/this.areasum2;cent.y=this.cg3.y/3/this.areasum2;}else if(this.totalLength>0.0){cent.x=this.lineCentSum.x/this.totalLength;cent.y=this.lineCentSum.y/this.totalLength;}else if(this.ptCount>0){cent.x=this.ptCentSum.x/this.ptCount;cent.y=this.ptCentSum.y/this.ptCount;}else{return null;}return cent;},addShell:function addShell(pts){if(pts.length>0)this.setBasePoint(pts[0]);var isPositiveArea=!CGAlgorithms.isCCW(pts);for(var i=0;i<pts.length-1;i++){this.addTriangle(this.areaBasePt,pts[i],pts[i+1],isPositiveArea);}this.addLineSegments(pts);},addTriangle:function addTriangle(p0,p1,p2,isPositiveArea){var sign=isPositiveArea?1.0:-1.0;Centroid.centroid3(p0,p1,p2,this.triangleCent3);var area2=Centroid.area2(p0,p1,p2);this.cg3.x+=sign*area2*this.triangleCent3.x;this.cg3.y+=sign*area2*this.triangleCent3.y;this.areasum2+=sign*area2;},add:function add(){if(arguments[0]instanceof Polygon){var poly=arguments[0];this.addShell(poly.getExteriorRing().getCoordinates());for(var i=0;i<poly.getNumInteriorRing();i++){this.addHole(poly.getInteriorRingN(i).getCoordinates());}}else if(arguments[0]instanceof Geometry){var geom=arguments[0];if(geom.isEmpty())return null;if(geom instanceof Point){this.addPoint(geom.getCoordinate());}else if(geom instanceof LineString){this.addLineSegments(geom.getCoordinates());}else if(geom instanceof Polygon){var poly=geom;this.add(poly);}else if(geom instanceof GeometryCollection){var gc=geom;for(var i=0;i<gc.getNumGeometries();i++){this.add(gc.getGeometryN(i));}}}},interfaces_:function interfaces_(){return[];},getClass:function getClass(){return Centroid;}});Centroid.area2=function(p1,p2,p3){return(p2.x-p1.x)*(p3.y-p1.y)-(p3.x-p1.x)*(p2.y-p1.y);};Centroid.centroid3=function(p1,p2,p3,c){c.x=p1.x+p2.x+p3.x;c.y=p1.y+p2.y+p3.y;return null;};Centroid.getCentroid=function(geom){var cent=new Centroid(geom);return cent.getCentroid();};function IntersectionMatrix(){this.matrix=null;if(arguments.length===0){this.matrix=Array(3).fill().map(function(){return Array(3);});this.setAll(Dimension.FALSE);}else if(arguments.length===1){if(typeof arguments[0]==="string"){var elements=arguments[0];IntersectionMatrix.call(this);this.set(elements);}else if(arguments[0]instanceof IntersectionMatrix){var other=arguments[0];IntersectionMatrix.call(this);this.matrix[Location.INTERIOR][Location.INTERIOR]=other.matrix[Location.INTERIOR][Location.INTERIOR];this.matrix[Location.INTERIOR][Location.BOUNDARY]=other.matrix[Location.INTERIOR][Location.BOUNDARY];this.matrix[Location.INTERIOR][Location.EXTERIOR]=other.matrix[Location.INTERIOR][Location.EXTERIOR];this.matrix[Location.BOUNDARY][Location.INTERIOR]=other.matrix[Location.BOUNDARY][Location.INTERIOR];this.matrix[Location.BOUNDARY][Location.BOUNDARY]=other.matrix[Location.BOUNDARY][Location.BOUNDARY];this.matrix[Location.BOUNDARY][Location.EXTERIOR]=other.matrix[Location.BOUNDARY][Location.EXTERIOR];this.matrix[Location.EXTERIOR][Location.INTERIOR]=other.matrix[Location.EXTERIOR][Location.INTERIOR];this.matrix[Location.EXTERIOR][Location.BOUNDARY]=other.matrix[Location.EXTERIOR][Location.BOUNDARY];this.matrix[Location.EXTERIOR][Location.EXTERIOR]=other.matrix[Location.EXTERIOR][Location.EXTERIOR];}}}extend$1(IntersectionMatrix.prototype,{isIntersects:function isIntersects(){return!this.isDisjoint();},isCovers:function isCovers(){var hasPointInCommon=IntersectionMatrix.isTrue(this.matrix[Location.INTERIOR][Location.INTERIOR])||IntersectionMatrix.isTrue(this.matrix[Location.INTERIOR][Location.BOUNDARY])||IntersectionMatrix.isTrue(this.matrix[Location.BOUNDARY][Location.INTERIOR])||IntersectionMatrix.isTrue(this.matrix[Location.BOUNDARY][Location.BOUNDARY]);return hasPointInCommon&&this.matrix[Location.EXTERIOR][Location.INTERIOR]===Dimension.FALSE&&this.matrix[Location.EXTERIOR][Location.BOUNDARY]===Dimension.FALSE;},isCoveredBy:function isCoveredBy(){var hasPointInCommon=IntersectionMatrix.isTrue(this.matrix[Location.INTERIOR][Location.INTERIOR])||IntersectionMatrix.isTrue(this.matrix[Location.INTERIOR][Location.BOUNDARY])||IntersectionMatrix.isTrue(this.matrix[Location.BOUNDARY][Location.INTERIOR])||IntersectionMatrix.isTrue(this.matrix[Location.BOUNDARY][Location.BOUNDARY]);return hasPointInCommon&&this.matrix[Location.INTERIOR][Location.EXTERIOR]===Dimension.FALSE&&this.matrix[Location.BOUNDARY][Location.EXTERIOR]===Dimension.FALSE;},set:function set$$1(){if(arguments.length===1){var dimensionSymbols=arguments[0];for(var i=0;i<dimensionSymbols.length;i++){var row=Math.trunc(i/3);var col=i%3;this.matrix[row][col]=Dimension.toDimensionValue(dimensionSymbols.charAt(i));}}else if(arguments.length===3){var row=arguments[0],column=arguments[1],dimensionValue=arguments[2];this.matrix[row][column]=dimensionValue;}},isContains:function isContains(){return IntersectionMatrix.isTrue(this.matrix[Location.INTERIOR][Location.INTERIOR])&&this.matrix[Location.EXTERIOR][Location.INTERIOR]===Dimension.FALSE&&this.matrix[Location.EXTERIOR][Location.BOUNDARY]===Dimension.FALSE;},setAtLeast:function setAtLeast(){if(arguments.length===1){var minimumDimensionSymbols=arguments[0];for(var i=0;i<minimumDimensionSymbols.length;i++){var row=Math.trunc(i/3);var col=i%3;this.setAtLeast(row,col,Dimension.toDimensionValue(minimumDimensionSymbols.charAt(i)));}}else if(arguments.length===3){var row=arguments[0],column=arguments[1],minimumDimensionValue=arguments[2];if(this.matrix[row][column]<minimumDimensionValue){this.matrix[row][column]=minimumDimensionValue;}}},setAtLeastIfValid:function setAtLeastIfValid(row,column,minimumDimensionValue){if(row>=0&&column>=0){this.setAtLeast(row,column,minimumDimensionValue);}},isWithin:function isWithin(){return IntersectionMatrix.isTrue(this.matrix[Location.INTERIOR][Location.INTERIOR])&&this.matrix[Location.INTERIOR][Location.EXTERIOR]===Dimension.FALSE&&this.matrix[Location.BOUNDARY][Location.EXTERIOR]===Dimension.FALSE;},isTouches:function isTouches(dimensionOfGeometryA,dimensionOfGeometryB){if(dimensionOfGeometryA>dimensionOfGeometryB){return this.isTouches(dimensionOfGeometryB,dimensionOfGeometryA);}if(dimensionOfGeometryA===Dimension.A&&dimensionOfGeometryB===Dimension.A||dimensionOfGeometryA===Dimension.L&&dimensionOfGeometryB===Dimension.L||dimensionOfGeometryA===Dimension.L&&dimensionOfGeometryB===Dimension.A||dimensionOfGeometryA===Dimension.P&&dimensionOfGeometryB===Dimension.A||dimensionOfGeometryA===Dimension.P&&dimensionOfGeometryB===Dimension.L){return this.matrix[Location.INTERIOR][Location.INTERIOR]===Dimension.FALSE&&(IntersectionMatrix.isTrue(this.matrix[Location.INTERIOR][Location.BOUNDARY])||IntersectionMatrix.isTrue(this.matrix[Location.BOUNDARY][Location.INTERIOR])||IntersectionMatrix.isTrue(this.matrix[Location.BOUNDARY][Location.BOUNDARY]));}return false;},isOverlaps:function isOverlaps(dimensionOfGeometryA,dimensionOfGeometryB){if(dimensionOfGeometryA===Dimension.P&&dimensionOfGeometryB===Dimension.P||dimensionOfGeometryA===Dimension.A&&dimensionOfGeometryB===Dimension.A){return IntersectionMatrix.isTrue(this.matrix[Location.INTERIOR][Location.INTERIOR])&&IntersectionMatrix.isTrue(this.matrix[Location.INTERIOR][Location.EXTERIOR])&&IntersectionMatrix.isTrue(this.matrix[Location.EXTERIOR][Location.INTERIOR]);}if(dimensionOfGeometryA===Dimension.L&&dimensionOfGeometryB===Dimension.L){return this.matrix[Location.INTERIOR][Location.INTERIOR]===1&&IntersectionMatrix.isTrue(this.matrix[Location.INTERIOR][Location.EXTERIOR])&&IntersectionMatrix.isTrue(this.matrix[Location.EXTERIOR][Location.INTERIOR]);}return false;},isEquals:function isEquals(dimensionOfGeometryA,dimensionOfGeometryB){if(dimensionOfGeometryA!==dimensionOfGeometryB){return false;}return IntersectionMatrix.isTrue(this.matrix[Location.INTERIOR][Location.INTERIOR])&&this.matrix[Location.INTERIOR][Location.EXTERIOR]===Dimension.FALSE&&this.matrix[Location.BOUNDARY][Location.EXTERIOR]===Dimension.FALSE&&this.matrix[Location.EXTERIOR][Location.INTERIOR]===Dimension.FALSE&&this.matrix[Location.EXTERIOR][Location.BOUNDARY]===Dimension.FALSE;},toString:function toString(){var buf=new StringBuffer("123456789");for(var ai=0;ai<3;ai++){for(var bi=0;bi<3;bi++){buf.setCharAt(3*ai+bi,Dimension.toDimensionSymbol(this.matrix[ai][bi]));}}return buf.toString();},setAll:function setAll(dimensionValue){for(var ai=0;ai<3;ai++){for(var bi=0;bi<3;bi++){this.matrix[ai][bi]=dimensionValue;}}},get:function get$$1(row,column){return this.matrix[row][column];},transpose:function transpose(){var temp=this.matrix[1][0];this.matrix[1][0]=this.matrix[0][1];this.matrix[0][1]=temp;temp=this.matrix[2][0];this.matrix[2][0]=this.matrix[0][2];this.matrix[0][2]=temp;temp=this.matrix[2][1];this.matrix[2][1]=this.matrix[1][2];this.matrix[1][2]=temp;return this;},matches:function matches(requiredDimensionSymbols){if(requiredDimensionSymbols.length!==9){throw new IllegalArgumentException("Should be length 9: "+requiredDimensionSymbols);}for(var ai=0;ai<3;ai++){for(var bi=0;bi<3;bi++){if(!IntersectionMatrix.matches(this.matrix[ai][bi],requiredDimensionSymbols.charAt(3*ai+bi))){return false;}}}return true;},add:function add(im){for(var i=0;i<3;i++){for(var j=0;j<3;j++){this.setAtLeast(i,j,im.get(i,j));}}},isDisjoint:function isDisjoint(){return this.matrix[Location.INTERIOR][Location.INTERIOR]===Dimension.FALSE&&this.matrix[Location.INTERIOR][Location.BOUNDARY]===Dimension.FALSE&&this.matrix[Location.BOUNDARY][Location.INTERIOR]===Dimension.FALSE&&this.matrix[Location.BOUNDARY][Location.BOUNDARY]===Dimension.FALSE;},isCrosses:function isCrosses(dimensionOfGeometryA,dimensionOfGeometryB){if(dimensionOfGeometryA===Dimension.P&&dimensionOfGeometryB===Dimension.L||dimensionOfGeometryA===Dimension.P&&dimensionOfGeometryB===Dimension.A||dimensionOfGeometryA===Dimension.L&&dimensionOfGeometryB===Dimension.A){return IntersectionMatrix.isTrue(this.matrix[Location.INTERIOR][Location.INTERIOR])&&IntersectionMatrix.isTrue(this.matrix[Location.INTERIOR][Location.EXTERIOR]);}if(dimensionOfGeometryA===Dimension.L&&dimensionOfGeometryB===Dimension.P||dimensionOfGeometryA===Dimension.A&&dimensionOfGeometryB===Dimension.P||dimensionOfGeometryA===Dimension.A&&dimensionOfGeometryB===Dimension.L){return IntersectionMatrix.isTrue(this.matrix[Location.INTERIOR][Location.INTERIOR])&&IntersectionMatrix.isTrue(this.matrix[Location.EXTERIOR][Location.INTERIOR]);}if(dimensionOfGeometryA===Dimension.L&&dimensionOfGeometryB===Dimension.L){return this.matrix[Location.INTERIOR][Location.INTERIOR]===0;}return false;},interfaces_:function interfaces_(){return[Clonable];},getClass:function getClass(){return IntersectionMatrix;}});IntersectionMatrix.matches=function(){if(Number.isInteger(arguments[0])&&typeof arguments[1]==="string"){var actualDimensionValue=arguments[0],requiredDimensionSymbol=arguments[1];if(requiredDimensionSymbol===Dimension.SYM_DONTCARE){return true;}if(requiredDimensionSymbol===Dimension.SYM_TRUE&&(actualDimensionValue>=0||actualDimensionValue===Dimension.TRUE)){return true;}if(requiredDimensionSymbol===Dimension.SYM_FALSE&&actualDimensionValue===Dimension.FALSE){return true;}if(requiredDimensionSymbol===Dimension.SYM_P&&actualDimensionValue===Dimension.P){return true;}if(requiredDimensionSymbol===Dimension.SYM_L&&actualDimensionValue===Dimension.L){return true;}if(requiredDimensionSymbol===Dimension.SYM_A&&actualDimensionValue===Dimension.A){return true;}return false;}else if(typeof arguments[0]==="string"&&typeof arguments[1]==="string"){var actualDimensionSymbols=arguments[0],requiredDimensionSymbols=arguments[1];var m=new IntersectionMatrix(actualDimensionSymbols);return m.matches(requiredDimensionSymbols);}};IntersectionMatrix.isTrue=function(actualDimensionValue){if(actualDimensionValue>=0||actualDimensionValue===Dimension.TRUE){return true;}return false;};function RelateComputer(){this.li=new RobustLineIntersector();this.ptLocator=new PointLocator();this.arg=null;this.nodes=new NodeMap(new RelateNodeFactory());this.im=null;this.isolatedEdges=new ArrayList();this.invalidPoint=null;var arg=arguments[0];this.arg=arg;}extend$1(RelateComputer.prototype,{insertEdgeEnds:function insertEdgeEnds(ee){for(var i=ee.iterator();i.hasNext();){var e=i.next();this.nodes.add(e);}},computeProperIntersectionIM:function computeProperIntersectionIM(intersector,im){var dimA=this.arg[0].getGeometry().getDimension();var dimB=this.arg[1].getGeometry().getDimension();var hasProper=intersector.hasProperIntersection();var hasProperInterior=intersector.hasProperInteriorIntersection();if(dimA===2&&dimB===2){if(hasProper)im.setAtLeast("212101212");}else if(dimA===2&&dimB===1){if(hasProper)im.setAtLeast("FFF0FFFF2");if(hasProperInterior)im.setAtLeast("1FFFFF1FF");}else if(dimA===1&&dimB===2){if(hasProper)im.setAtLeast("F0FFFFFF2");if(hasProperInterior)im.setAtLeast("1F1FFFFFF");}else if(dimA===1&&dimB===1){if(hasProperInterior)im.setAtLeast("0FFFFFFFF");}},labelIsolatedEdges:function labelIsolatedEdges(thisIndex,targetIndex){for(var ei=this.arg[thisIndex].getEdgeIterator();ei.hasNext();){var e=ei.next();if(e.isIsolated()){this.labelIsolatedEdge(e,targetIndex,this.arg[targetIndex].getGeometry());this.isolatedEdges.add(e);}}},labelIsolatedEdge:function labelIsolatedEdge(e,targetIndex,target){if(target.getDimension()>0){var loc=this.ptLocator.locate(e.getCoordinate(),target);e.getLabel().setAllLocations(targetIndex,loc);}else{e.getLabel().setAllLocations(targetIndex,Location.EXTERIOR);}},computeIM:function computeIM(){var im=new IntersectionMatrix();im.set(Location.EXTERIOR,Location.EXTERIOR,2);if(!this.arg[0].getGeometry().getEnvelopeInternal().intersects(this.arg[1].getGeometry().getEnvelopeInternal())){this.computeDisjointIM(im);return im;}this.arg[0].computeSelfNodes(this.li,false);this.arg[1].computeSelfNodes(this.li,false);var intersector=this.arg[0].computeEdgeIntersections(this.arg[1],this.li,false);this.computeIntersectionNodes(0);this.computeIntersectionNodes(1);this.copyNodesAndLabels(0);this.copyNodesAndLabels(1);this.labelIsolatedNodes();this.computeProperIntersectionIM(intersector,im);var eeBuilder=new EdgeEndBuilder();var ee0=eeBuilder.computeEdgeEnds(this.arg[0].getEdgeIterator());this.insertEdgeEnds(ee0);var ee1=eeBuilder.computeEdgeEnds(this.arg[1].getEdgeIterator());this.insertEdgeEnds(ee1);this.labelNodeEdges();this.labelIsolatedEdges(0,1);this.labelIsolatedEdges(1,0);this.updateIM(im);return im;},labelNodeEdges:function labelNodeEdges(){for(var ni=this.nodes.iterator();ni.hasNext();){var node=ni.next();node.getEdges().computeLabelling(this.arg);}},copyNodesAndLabels:function copyNodesAndLabels(argIndex){for(var i=this.arg[argIndex].getNodeIterator();i.hasNext();){var graphNode=i.next();var newNode=this.nodes.addNode(graphNode.getCoordinate());newNode.setLabel(argIndex,graphNode.getLabel().getLocation(argIndex));}},labelIntersectionNodes:function labelIntersectionNodes(argIndex){for(var i=this.arg[argIndex].getEdgeIterator();i.hasNext();){var e=i.next();var eLoc=e.getLabel().getLocation(argIndex);for(var eiIt=e.getEdgeIntersectionList().iterator();eiIt.hasNext();){var ei=eiIt.next();var n=this.nodes.find(ei.coord);if(n.getLabel().isNull(argIndex)){if(eLoc===Location.BOUNDARY)n.setLabelBoundary(argIndex);else n.setLabel(argIndex,Location.INTERIOR);}}}},labelIsolatedNode:function labelIsolatedNode(n,targetIndex){var loc=this.ptLocator.locate(n.getCoordinate(),this.arg[targetIndex].getGeometry());n.getLabel().setAllLocations(targetIndex,loc);},computeIntersectionNodes:function computeIntersectionNodes(argIndex){for(var i=this.arg[argIndex].getEdgeIterator();i.hasNext();){var e=i.next();var eLoc=e.getLabel().getLocation(argIndex);for(var eiIt=e.getEdgeIntersectionList().iterator();eiIt.hasNext();){var ei=eiIt.next();var n=this.nodes.addNode(ei.coord);if(eLoc===Location.BOUNDARY)n.setLabelBoundary(argIndex);else{if(n.getLabel().isNull(argIndex))n.setLabel(argIndex,Location.INTERIOR);}}}},labelIsolatedNodes:function labelIsolatedNodes(){for(var ni=this.nodes.iterator();ni.hasNext();){var n=ni.next();var label=n.getLabel();Assert.isTrue(label.getGeometryCount()>0,"node with empty label found");if(n.isIsolated()){if(label.isNull(0))this.labelIsolatedNode(n,0);else this.labelIsolatedNode(n,1);}}},updateIM:function updateIM(im){for(var ei=this.isolatedEdges.iterator();ei.hasNext();){var e=ei.next();e.updateIM(im);}for(var ni=this.nodes.iterator();ni.hasNext();){var node=ni.next();node.updateIM(im);node.updateIMFromEdges(im);}},computeDisjointIM:function computeDisjointIM(im){var ga=this.arg[0].getGeometry();if(!ga.isEmpty()){im.set(Location.INTERIOR,Location.EXTERIOR,ga.getDimension());im.set(Location.BOUNDARY,Location.EXTERIOR,ga.getBoundaryDimension());}var gb=this.arg[1].getGeometry();if(!gb.isEmpty()){im.set(Location.EXTERIOR,Location.INTERIOR,gb.getDimension());im.set(Location.EXTERIOR,Location.BOUNDARY,gb.getBoundaryDimension());}},interfaces_:function interfaces_(){return[];},getClass:function getClass(){return RelateComputer;}});function RectangleContains(){this.rectEnv=null;var rectangle=arguments[0];this.rectEnv=rectangle.getEnvelopeInternal();}extend$1(RectangleContains.prototype,{isContainedInBoundary:function isContainedInBoundary(geom){if(geom instanceof Polygon)return false;if(geom instanceof Point)return this.isPointContainedInBoundary(geom);if(geom instanceof LineString)return this.isLineStringContainedInBoundary(geom);for(var i=0;i<geom.getNumGeometries();i++){var comp=geom.getGeometryN(i);if(!this.isContainedInBoundary(comp))return false;}return true;},isLineSegmentContainedInBoundary:function isLineSegmentContainedInBoundary(p0,p1){if(p0.equals(p1))return this.isPointContainedInBoundary(p0);if(p0.x===p1.x){if(p0.x===this.rectEnv.getMinX()||p0.x===this.rectEnv.getMaxX())return true;}else if(p0.y===p1.y){if(p0.y===this.rectEnv.getMinY()||p0.y===this.rectEnv.getMaxY())return true;}return false;},isLineStringContainedInBoundary:function isLineStringContainedInBoundary(line){var seq=line.getCoordinateSequence();var p0=new Coordinate();var p1=new Coordinate();for(var i=0;i<seq.size()-1;i++){seq.getCoordinate(i,p0);seq.getCoordinate(i+1,p1);if(!this.isLineSegmentContainedInBoundary(p0,p1))return false;}return true;},isPointContainedInBoundary:function isPointContainedInBoundary(){if(arguments[0]instanceof Point){var point=arguments[0];return this.isPointContainedInBoundary(point.getCoordinate());}else if(arguments[0]instanceof Coordinate){var pt=arguments[0];return pt.x===this.rectEnv.getMinX()||pt.x===this.rectEnv.getMaxX()||pt.y===this.rectEnv.getMinY()||pt.y===this.rectEnv.getMaxY();}},contains:function contains(geom){if(!this.rectEnv.contains(geom.getEnvelopeInternal()))return false;if(this.isContainedInBoundary(geom))return false;return true;},interfaces_:function interfaces_(){return[];},getClass:function getClass(){return RectangleContains;}});RectangleContains.contains=function(rectangle,b){var rc=new RectangleContains(rectangle);return rc.contains(b);};function RectangleLineIntersector(){this.li=new RobustLineIntersector();this.rectEnv=null;this.diagUp0=null;this.diagUp1=null;this.diagDown0=null;this.diagDown1=null;var rectEnv=arguments[0];this.rectEnv=rectEnv;this.diagUp0=new Coordinate(rectEnv.getMinX(),rectEnv.getMinY());this.diagUp1=new Coordinate(rectEnv.getMaxX(),rectEnv.getMaxY());this.diagDown0=new Coordinate(rectEnv.getMinX(),rectEnv.getMaxY());this.diagDown1=new Coordinate(rectEnv.getMaxX(),rectEnv.getMinY());}extend$1(RectangleLineIntersector.prototype,{intersects:function intersects(p0,p1){var segEnv=new Envelope(p0,p1);if(!this.rectEnv.intersects(segEnv))return false;if(this.rectEnv.intersects(p0))return true;if(this.rectEnv.intersects(p1))return true;if(p0.compareTo(p1)>0){var tmp=p0;p0=p1;p1=tmp;}var isSegUpwards=false;if(p1.y>p0.y)isSegUpwards=true;if(isSegUpwards){this.li.computeIntersection(p0,p1,this.diagDown0,this.diagDown1);}else{this.li.computeIntersection(p0,p1,this.diagUp0,this.diagUp1);}if(this.li.hasIntersection())return true;return false;},interfaces_:function interfaces_(){return[];},getClass:function getClass(){return RectangleLineIntersector;}});function ShortCircuitedGeometryVisitor(){this._isDone=false;}extend$1(ShortCircuitedGeometryVisitor.prototype,{applyTo:function applyTo(geom){for(var i=0;i<geom.getNumGeometries()&&!this._isDone;i++){var element=geom.getGeometryN(i);if(!(element instanceof GeometryCollection)){this.visit(element);if(this.isDone()){this._isDone=true;return null;}}else this.applyTo(element);}},interfaces_:function interfaces_(){return[];},getClass:function getClass(){return ShortCircuitedGeometryVisitor;}});function RectangleIntersects(){this.rectangle=null;this.rectEnv=null;var rectangle=arguments[0];this.rectangle=rectangle;this.rectEnv=rectangle.getEnvelopeInternal();}extend$1(RectangleIntersects.prototype,{intersects:function intersects(geom){if(!this.rectEnv.intersects(geom.getEnvelopeInternal()))return false;var visitor=new EnvelopeIntersectsVisitor(this.rectEnv);visitor.applyTo(geom);if(visitor.intersects())return true;var ecpVisitor=new GeometryContainsPointVisitor(this.rectangle);ecpVisitor.applyTo(geom);if(ecpVisitor.containsPoint())return true;var riVisitor=new RectangleIntersectsSegmentVisitor(this.rectangle);riVisitor.applyTo(geom);if(riVisitor.intersects())return true;return false;},interfaces_:function interfaces_(){return[];},getClass:function getClass(){return RectangleIntersects;}});RectangleIntersects.intersects=function(rectangle,b){var rp=new RectangleIntersects(rectangle);return rp.intersects(b);};function EnvelopeIntersectsVisitor(){ShortCircuitedGeometryVisitor.apply(this);this.rectEnv=null;this._intersects=false;var rectEnv=arguments[0];this.rectEnv=rectEnv;}inherits$1(EnvelopeIntersectsVisitor,ShortCircuitedGeometryVisitor);extend$1(EnvelopeIntersectsVisitor.prototype,{isDone:function isDone(){return this._intersects===true;},visit:function visit(element){var elementEnv=element.getEnvelopeInternal();if(!this.rectEnv.intersects(elementEnv)){return null;}if(this.rectEnv.contains(elementEnv)){this._intersects=true;return null;}if(elementEnv.getMinX()>=this.rectEnv.getMinX()&&elementEnv.getMaxX()<=this.rectEnv.getMaxX()){this._intersects=true;return null;}if(elementEnv.getMinY()>=this.rectEnv.getMinY()&&elementEnv.getMaxY()<=this.rectEnv.getMaxY()){this._intersects=true;return null;}},intersects:function intersects(){return this._intersects;},interfaces_:function interfaces_(){return[];},getClass:function getClass(){return EnvelopeIntersectsVisitor;}});function GeometryContainsPointVisitor(){ShortCircuitedGeometryVisitor.apply(this);this.rectSeq=null;this.rectEnv=null;this._containsPoint=false;var rectangle=arguments[0];this.rectSeq=rectangle.getExteriorRing().getCoordinateSequence();this.rectEnv=rectangle.getEnvelopeInternal();}inherits$1(GeometryContainsPointVisitor,ShortCircuitedGeometryVisitor);extend$1(GeometryContainsPointVisitor.prototype,{isDone:function isDone(){return this._containsPoint===true;},visit:function visit(geom){if(!(geom instanceof Polygon))return null;var elementEnv=geom.getEnvelopeInternal();if(!this.rectEnv.intersects(elementEnv))return null;var rectPt=new Coordinate();for(var i=0;i<4;i++){this.rectSeq.getCoordinate(i,rectPt);if(!elementEnv.contains(rectPt))continue;if(SimplePointInAreaLocator.containsPointInPolygon(rectPt,geom)){this._containsPoint=true;return null;}}},containsPoint:function containsPoint(){return this._containsPoint;},interfaces_:function interfaces_(){return[];},getClass:function getClass(){return GeometryContainsPointVisitor;}});function RectangleIntersectsSegmentVisitor(){ShortCircuitedGeometryVisitor.apply(this);this.rectEnv=null;this.rectIntersector=null;this.hasIntersection=false;this.p0=new Coordinate();this.p1=new Coordinate();var rectangle=arguments[0];this.rectEnv=rectangle.getEnvelopeInternal();this.rectIntersector=new RectangleLineIntersector(this.rectEnv);}inherits$1(RectangleIntersectsSegmentVisitor,ShortCircuitedGeometryVisitor);extend$1(RectangleIntersectsSegmentVisitor.prototype,{intersects:function intersects(){return this.hasIntersection;},isDone:function isDone(){return this.hasIntersection===true;},visit:function visit(geom){var elementEnv=geom.getEnvelopeInternal();if(!this.rectEnv.intersects(elementEnv))return null;var lines=LinearComponentExtracter.getLines(geom);this.checkIntersectionWithLineStrings(lines);},checkIntersectionWithLineStrings:function checkIntersectionWithLineStrings(lines){for(var i=lines.iterator();i.hasNext();){var testLine=i.next();this.checkIntersectionWithSegments(testLine);if(this.hasIntersection)return null;}},checkIntersectionWithSegments:function checkIntersectionWithSegments(testLine){var seq1=testLine.getCoordinateSequence();for(var j=1;j<seq1.size();j++){seq1.getCoordinate(j-1,this.p0);seq1.getCoordinate(j,this.p1);if(this.rectIntersector.intersects(this.p0,this.p1)){this.hasIntersection=true;return null;}}},interfaces_:function interfaces_(){return[];},getClass:function getClass(){return RectangleIntersectsSegmentVisitor;}});function RelateOp(){this._relate=null;if(arguments.length===2){var g0=arguments[0],g1=arguments[1];GeometryGraphOperation.call(this,g0,g1);this._relate=new RelateComputer(this.arg);}else if(arguments.length===3){var g0=arguments[0],g1=arguments[1],boundaryNodeRule=arguments[2];GeometryGraphOperation.call(this,g0,g1,boundaryNodeRule);this._relate=new RelateComputer(this.arg);}}inherits$1(RelateOp,GeometryGraphOperation);extend$1(RelateOp.prototype,{getIntersectionMatrix:function getIntersectionMatrix(){return this._relate.computeIM();},interfaces_:function interfaces_(){return[];},getClass:function getClass(){return RelateOp;}});RelateOp.covers=function(g1,g2){if(!g1.getEnvelopeInternal().covers(g2.getEnvelopeInternal()))return false;if(g1.isRectangle()){return true;}return RelateOp.relate(g1,g2).isCovers();};RelateOp.intersects=function(g1,g2){if(!g1.getEnvelopeInternal().intersects(g2.getEnvelopeInternal()))return false;if(g1.isRectangle()){return RectangleIntersects.intersects(g1,g2);}if(g2.isRectangle()){return RectangleIntersects.intersects(g2,g1);}return RelateOp.relate(g1,g2).isIntersects();};RelateOp.touches=function(g1,g2){if(!g1.getEnvelopeInternal().intersects(g2.getEnvelopeInternal()))return false;return RelateOp.relate(g1,g2).isTouches(g1.getDimension(),g2.getDimension());};RelateOp.within=function(g1,g2){return g2.contains(g1);};RelateOp.coveredBy=function(g1,g2){return RelateOp.covers(g2,g1);};RelateOp.relate=function(){if(arguments.length===2){var a=arguments[0],b=arguments[1];var relOp=new RelateOp(a,b);var im=relOp.getIntersectionMatrix();return im;}else if(arguments.length===3){if(typeof arguments[2]==="string"&&arguments[0]instanceof Geometry&&arguments[1]instanceof Geometry){var g1=arguments[0],g2=arguments[1],intersectionPattern=arguments[2];return RelateOp.relateWithCheck(g1,g2).matches(intersectionPattern);}else if(hasInterface(arguments[2],BoundaryNodeRule)&&arguments[0]instanceof Geometry&&arguments[1]instanceof Geometry){var a=arguments[0],b=arguments[1],boundaryNodeRule=arguments[2];var relOp=new RelateOp(a,b,boundaryNodeRule);var im=relOp.getIntersectionMatrix();return im;}}};RelateOp.overlaps=function(g1,g2){if(!g1.getEnvelopeInternal().intersects(g2.getEnvelopeInternal()))return false;return RelateOp.relate(g1,g2).isOverlaps(g1.getDimension(),g2.getDimension());};RelateOp.disjoint=function(g1,g2){return!g1.intersects(g2);};RelateOp.relateWithCheck=function(g1,g2){g1.checkNotGeometryCollection(g1);g1.checkNotGeometryCollection(g2);return RelateOp.relate(g1,g2);};RelateOp.crosses=function(g1,g2){if(!g1.getEnvelopeInternal().intersects(g2.getEnvelopeInternal()))return false;return RelateOp.relate(g1,g2).isCrosses(g1.getDimension(),g2.getDimension());};RelateOp.contains=function(g1,g2){if(!g1.getEnvelopeInternal().contains(g2.getEnvelopeInternal()))return false;if(g1.isRectangle()){return RectangleContains.contains(g1,g2);}return RelateOp.relate(g1,g2).isContains();};function InteriorPointPoint(){this.centroid=null;this.minDistance=Double.MAX_VALUE;this.interiorPoint=null;var g=arguments[0];this.centroid=g.getCentroid().getCoordinate();this.add(g);}extend$1(InteriorPointPoint.prototype,{getInteriorPoint:function getInteriorPoint(){return this.interiorPoint;},add:function add(){if(arguments[0]instanceof Geometry){var geom=arguments[0];if(geom instanceof Point){this.add(geom.getCoordinate());}else if(geom instanceof GeometryCollection){var gc=geom;for(var i=0;i<gc.getNumGeometries();i++){this.add(gc.getGeometryN(i));}}}else if(arguments[0]instanceof Coordinate){var point=arguments[0];var dist=point.distance(this.centroid);if(dist<this.minDistance){this.interiorPoint=new Coordinate(point);this.minDistance=dist;}}},interfaces_:function interfaces_(){return[];},getClass:function getClass(){return InteriorPointPoint;}});function GeometryLocation(){this.component=null;this.segIndex=null;this.pt=null;if(arguments.length===2){var component=arguments[0],pt=arguments[1];GeometryLocation.call(this,component,GeometryLocation.INSIDE_AREA,pt);}else if(arguments.length===3){var component=arguments[0],segIndex=arguments[1],pt=arguments[2];this.component=component;this.segIndex=segIndex;this.pt=pt;}}extend$1(GeometryLocation.prototype,{isInsideArea:function isInsideArea(){return this.segIndex===GeometryLocation.INSIDE_AREA;},getCoordinate:function getCoordinate(){return this.pt;},getGeometryComponent:function getGeometryComponent(){return this.component;},getSegmentIndex:function getSegmentIndex(){return this.segIndex;},interfaces_:function interfaces_(){return[];},getClass:function getClass(){return GeometryLocation;}});GeometryLocation.INSIDE_AREA=-1;function PointExtracter(){this.pts=null;var pts=arguments[0];this.pts=pts;}extend$1(PointExtracter.prototype,{filter:function filter(geom){if(geom instanceof Point)this.pts.add(geom);},interfaces_:function interfaces_(){return[GeometryFilter];},getClass:function getClass(){return PointExtracter;}});PointExtracter.getPoints=function(){if(arguments.length===1){var geom=arguments[0];if(geom instanceof Point){return Collections.singletonList(geom);}return PointExtracter.getPoints(geom,new ArrayList());}else if(arguments.length===2){var geom=arguments[0],list=arguments[1];if(geom instanceof Point){list.add(geom);}else if(geom instanceof GeometryCollection){geom.apply(new PointExtracter(list));}return list;}};function ConnectedElementLocationFilter(){this.locations=null;var locations=arguments[0];this.locations=locations;}extend$1(ConnectedElementLocationFilter.prototype,{filter:function filter(geom){if(geom instanceof Point||geom instanceof LineString||geom instanceof Polygon)this.locations.add(new GeometryLocation(geom,0,geom.getCoordinate()));},interfaces_:function interfaces_(){return[GeometryFilter];},getClass:function getClass(){return ConnectedElementLocationFilter;}});ConnectedElementLocationFilter.getLocations=function(geom){var locations=new ArrayList();geom.apply(new ConnectedElementLocationFilter(locations));return locations;};function DistanceOp(){this.geom=null;this.terminateDistance=0.0;this.ptLocator=new PointLocator();this.minDistanceLocation=null;this.minDistance=Double.MAX_VALUE;if(arguments.length===2){var g0=arguments[0],g1=arguments[1];DistanceOp.call(this,g0,g1,0.0);}else if(arguments.length===3){var g0=arguments[0],g1=arguments[1],terminateDistance=arguments[2];this.geom=new Array(2).fill(null);this.geom[0]=g0;this.geom[1]=g1;this.terminateDistance=terminateDistance;}}extend$1(DistanceOp.prototype,{computeContainmentDistance:function computeContainmentDistance(){if(arguments.length===0){var locPtPoly=new Array(2).fill(null);this.computeContainmentDistance(0,locPtPoly);if(this.minDistance<=this.terminateDistance)return null;this.computeContainmentDistance(1,locPtPoly);}else if(arguments.length===2){var polyGeomIndex=arguments[0],locPtPoly=arguments[1];var locationsIndex=1-polyGeomIndex;var polys=PolygonExtracter.getPolygons(this.geom[polyGeomIndex]);if(polys.size()>0){var insideLocs=ConnectedElementLocationFilter.getLocations(this.geom[locationsIndex]);this.computeContainmentDistance(insideLocs,polys,locPtPoly);if(this.minDistance<=this.terminateDistance){this.minDistanceLocation[locationsIndex]=locPtPoly[0];this.minDistanceLocation[polyGeomIndex]=locPtPoly[1];return null;}}}else if(arguments.length===3){if(arguments[2]instanceof Array&&hasInterface(arguments[0],List)&&hasInterface(arguments[1],List)){var locs=arguments[0],polys=arguments[1],locPtPoly=arguments[2];for(var i=0;i<locs.size();i++){var loc=locs.get(i);for(var j=0;j<polys.size();j++){this.computeContainmentDistance(loc,polys.get(j),locPtPoly);if(this.minDistance<=this.terminateDistance)return null;}}}else if(arguments[2]instanceof Array&&arguments[0]instanceof GeometryLocation&&arguments[1]instanceof Polygon){var ptLoc=arguments[0],poly=arguments[1],locPtPoly=arguments[2];var pt=ptLoc.getCoordinate();if(Location.EXTERIOR!==this.ptLocator.locate(pt,poly)){this.minDistance=0.0;locPtPoly[0]=ptLoc;locPtPoly[1]=new GeometryLocation(poly,pt);return null;}}}},computeMinDistanceLinesPoints:function computeMinDistanceLinesPoints(lines,points,locGeom){for(var i=0;i<lines.size();i++){var line=lines.get(i);for(var j=0;j<points.size();j++){var pt=points.get(j);this.computeMinDistance(line,pt,locGeom);if(this.minDistance<=this.terminateDistance)return null;}}},computeFacetDistance:function computeFacetDistance(){var locGeom=new Array(2).fill(null);var lines0=LinearComponentExtracter.getLines(this.geom[0]);var lines1=LinearComponentExtracter.getLines(this.geom[1]);var pts0=PointExtracter.getPoints(this.geom[0]);var pts1=PointExtracter.getPoints(this.geom[1]);this.computeMinDistanceLines(lines0,lines1,locGeom);this.updateMinDistance(locGeom,false);if(this.minDistance<=this.terminateDistance)return null;locGeom[0]=null;locGeom[1]=null;this.computeMinDistanceLinesPoints(lines0,pts1,locGeom);this.updateMinDistance(locGeom,false);if(this.minDistance<=this.terminateDistance)return null;locGeom[0]=null;locGeom[1]=null;this.computeMinDistanceLinesPoints(lines1,pts0,locGeom);this.updateMinDistance(locGeom,true);if(this.minDistance<=this.terminateDistance)return null;locGeom[0]=null;locGeom[1]=null;this.computeMinDistancePoints(pts0,pts1,locGeom);this.updateMinDistance(locGeom,false);},nearestLocations:function nearestLocations(){this.computeMinDistance();return this.minDistanceLocation;},updateMinDistance:function updateMinDistance(locGeom,flip){if(locGeom[0]===null)return null;if(flip){this.minDistanceLocation[0]=locGeom[1];this.minDistanceLocation[1]=locGeom[0];}else{this.minDistanceLocation[0]=locGeom[0];this.minDistanceLocation[1]=locGeom[1];}},nearestPoints:function nearestPoints(){this.computeMinDistance();var nearestPts=[this.minDistanceLocation[0].getCoordinate(),this.minDistanceLocation[1].getCoordinate()];return nearestPts;},computeMinDistance:function computeMinDistance(){if(arguments.length===0){if(this.minDistanceLocation!==null)return null;this.minDistanceLocation=new Array(2).fill(null);this.computeContainmentDistance();if(this.minDistance<=this.terminateDistance)return null;this.computeFacetDistance();}else if(arguments.length===3){if(arguments[2]instanceof Array&&arguments[0]instanceof LineString&&arguments[1]instanceof Point){var line=arguments[0],pt=arguments[1],locGeom=arguments[2];if(line.getEnvelopeInternal().distance(pt.getEnvelopeInternal())>this.minDistance)return null;var coord0=line.getCoordinates();var coord=pt.getCoordinate();for(var i=0;i<coord0.length-1;i++){var dist=CGAlgorithms.distancePointLine(coord,coord0[i],coord0[i+1]);if(dist<this.minDistance){this.minDistance=dist;var seg=new LineSegment(coord0[i],coord0[i+1]);var segClosestPoint=seg.closestPoint(coord);locGeom[0]=new GeometryLocation(line,i,segClosestPoint);locGeom[1]=new GeometryLocation(pt,0,coord);}if(this.minDistance<=this.terminateDistance)return null;}}else if(arguments[2]instanceof Array&&arguments[0]instanceof LineString&&arguments[1]instanceof LineString){var line0=arguments[0],line1=arguments[1],locGeom=arguments[2];if(line0.getEnvelopeInternal().distance(line1.getEnvelopeInternal())>this.minDistance)return null;var coord0=line0.getCoordinates();var coord1=line1.getCoordinates();for(var i=0;i<coord0.length-1;i++){for(var j=0;j<coord1.length-1;j++){var dist=CGAlgorithms.distanceLineLine(coord0[i],coord0[i+1],coord1[j],coord1[j+1]);if(dist<this.minDistance){this.minDistance=dist;var seg0=new LineSegment(coord0[i],coord0[i+1]);var seg1=new LineSegment(coord1[j],coord1[j+1]);var closestPt=seg0.closestPoints(seg1);locGeom[0]=new GeometryLocation(line0,i,closestPt[0]);locGeom[1]=new GeometryLocation(line1,j,closestPt[1]);}if(this.minDistance<=this.terminateDistance)return null;}}}}},computeMinDistancePoints:function computeMinDistancePoints(points0,points1,locGeom){for(var i=0;i<points0.size();i++){var pt0=points0.get(i);for(var j=0;j<points1.size();j++){var pt1=points1.get(j);var dist=pt0.getCoordinate().distance(pt1.getCoordinate());if(dist<this.minDistance){this.minDistance=dist;locGeom[0]=new GeometryLocation(pt0,0,pt0.getCoordinate());locGeom[1]=new GeometryLocation(pt1,0,pt1.getCoordinate());}if(this.minDistance<=this.terminateDistance)return null;}}},distance:function distance(){if(this.geom[0]===null||this.geom[1]===null)throw new IllegalArgumentException("null geometries are not supported");if(this.geom[0].isEmpty()||this.geom[1].isEmpty())return 0.0;this.computeMinDistance();return this.minDistance;},computeMinDistanceLines:function computeMinDistanceLines(lines0,lines1,locGeom){for(var i=0;i<lines0.size();i++){var line0=lines0.get(i);for(var j=0;j<lines1.size();j++){var line1=lines1.get(j);this.computeMinDistance(line0,line1,locGeom);if(this.minDistance<=this.terminateDistance)return null;}}},interfaces_:function interfaces_(){return[];},getClass:function getClass(){return DistanceOp;}});DistanceOp.distance=function(g0,g1){var distOp=new DistanceOp(g0,g1);return distOp.distance();};DistanceOp.isWithinDistance=function(g0,g1,distance){var distOp=new DistanceOp(g0,g1,distance);return distOp.distance()<=distance;};DistanceOp.nearestPoints=function(g0,g1){var distOp=new DistanceOp(g0,g1);return distOp.nearestPoints();};extend$1(Geometry.prototype,{equalsTopo:function equalsTopo(g){if(!this.getEnvelopeInternal().equals(g.getEnvelopeInternal()))return false;return RelateOp.relate(this,g).isEquals(this.getDimension(),g.getDimension());},union:function union(){if(arguments.length===0){return UnaryUnionOp.union(this);}else if(arguments.length===1){var other=arguments[0];return UnionOp.union(this,other);}},isValid:function isValid(){return IsValidOp.isValid(this);},intersection:function intersection(other){if(this.isEmpty()||other.isEmpty())return OverlayOp.createEmptyResult(OverlayOp.INTERSECTION,this,other,this.factory);if(this.isGeometryCollection()){var g2=other;return GeometryCollectionMapper.map(this,{interfaces_:function interfaces_(){return[MapOp];},map:function map(g){return g.intersection(g2);}});}this.checkNotGeometryCollection(this);this.checkNotGeometryCollection(other);return SnapIfNeededOverlayOp.overlayOp(this,other,OverlayOp.INTERSECTION);},covers:function covers(g){return RelateOp.covers(this,g);},coveredBy:function coveredBy(g){return RelateOp.coveredBy(this,g);},touches:function touches(g){return RelateOp.touches(this,g);},intersects:function intersects(g){return RelateOp.intersects(this,g);},within:function within(g){return RelateOp.within(this,g);},overlaps:function overlaps(g){return RelateOp.overlaps(this,g);},disjoint:function disjoint(g){return RelateOp.disjoint(this,g);},crosses:function crosses(g){return RelateOp.crosses(this,g);},buffer:function buffer(){if(arguments.length===1){var distance=arguments[0];return BufferOp.bufferOp(this,distance);}else if(arguments.length===2){var distance=arguments[0],quadrantSegments=arguments[1];return BufferOp.bufferOp(this,distance,quadrantSegments);}else if(arguments.length===3){var distance=arguments[0],quadrantSegments=arguments[1],endCapStyle=arguments[2];return BufferOp.bufferOp(this,distance,quadrantSegments,endCapStyle);}},convexHull:function convexHull(){return new ConvexHull(this).getConvexHull();},relate:function relate(){for(var _len=arguments.length,args=Array(_len),_key=0;_key<_len;_key++){args[_key]=arguments[_key];}return RelateOp.relate.apply(RelateOp,[this].concat(args));},getCentroid:function getCentroid(){if(this.isEmpty())return this.factory.createPoint();var centPt=Centroid.getCentroid(this);return this.createPointFromInternalCoord(centPt,this);},getInteriorPoint:function getInteriorPoint(){if(this.isEmpty())return this.factory.createPoint();var interiorPt=null;var dim=this.getDimension();if(dim===0){var intPt=new InteriorPointPoint(this);interiorPt=intPt.getInteriorPoint();}else if(dim===1){var intPt=new InteriorPointLine(this);interiorPt=intPt.getInteriorPoint();}else{var intPt=new InteriorPointArea(this);interiorPt=intPt.getInteriorPoint();}return this.createPointFromInternalCoord(interiorPt,this);},symDifference:function symDifference(other){if(this.isEmpty()||other.isEmpty()){if(this.isEmpty()&&other.isEmpty())return OverlayOp.createEmptyResult(OverlayOp.SYMDIFFERENCE,this,other,this.factory);if(this.isEmpty())return other.copy();if(other.isEmpty())return this.copy();}this.checkNotGeometryCollection(this);this.checkNotGeometryCollection(other);return SnapIfNeededOverlayOp.overlayOp(this,other,OverlayOp.SYMDIFFERENCE);},createPointFromInternalCoord:function createPointFromInternalCoord(coord,exemplar){exemplar.getPrecisionModel().makePrecise(coord);return exemplar.getFactory().createPoint(coord);},toText:function toText(){var writer=new WKTWriter();return writer.write(this);},toString:function toString(){this.toText();},contains:function contains(g){return RelateOp.contains(this,g);},difference:function difference(other){if(this.isEmpty())return OverlayOp.createEmptyResult(OverlayOp.DIFFERENCE,this,other,this.factory);if(other.isEmpty())return this.copy();this.checkNotGeometryCollection(this);this.checkNotGeometryCollection(other);return SnapIfNeededOverlayOp.overlayOp(this,other,OverlayOp.DIFFERENCE);},isSimple:function isSimple(){var op=new IsSimpleOp(this);return op.isSimple();},isWithinDistance:function isWithinDistance(geom,distance){var envDist=this.getEnvelopeInternal().distance(geom.getEnvelopeInternal());if(envDist>distance)return false;return DistanceOp.isWithinDistance(this,geom,distance);},distance:function distance(g){return DistanceOp.distance(this,g);},isEquivalentClass:function isEquivalentClass(other){return this.getClass()===other.getClass();}});/**
 * Takes two or more {@link Polygon|polygons} and returns a combined polygon. If the input polygons are not contiguous, this function returns a {@link MultiPolygon} feature.
 *
 * @name union
 * @param {...Feature<Polygon>} A polygon to combine
 * @returns {Feature<(Polygon|MultiPolygon)>} a combined {@link Polygon} or {@link MultiPolygon} feature
 * @example
 * var poly1 = turf.polygon([[
 *     [-82.574787, 35.594087],
 *     [-82.574787, 35.615581],
 *     [-82.545261, 35.615581],
 *     [-82.545261, 35.594087],
 *     [-82.574787, 35.594087]
 * ]], {"fill": "#0f0"});
 * var poly2 = turf.polygon([[
 *     [-82.560024, 35.585153],
 *     [-82.560024, 35.602602],
 *     [-82.52964, 35.602602],
 *     [-82.52964, 35.585153],
 *     [-82.560024, 35.585153]
 * ]], {"fill": "#00f"});
 *
 * var union = turf.union(poly1, poly2);
 *
 * //addToMap
 * var addToMap = [poly1, poly2, union];
 */function union(){var reader=new GeoJSONReader();var result=reader.read(JSON.stringify(arguments[0].geometry));for(var i=1;i<arguments.length;i++){result=result.union(reader.read(JSON.stringify(arguments[i].geometry)));}var writer=new GeoJSONWriter();result=writer.write(result);return{type:'Feature',geometry:result,properties:arguments[0].properties};}// Find self-intersections in geojson polygon (possibly with interior rings)
var isects=function isects(feature,filterFn,useSpatialIndex){if(feature.geometry.type!=='Polygon')throw new Error('The input feature must be a Polygon');if(useSpatialIndex===undefined)useSpatialIndex=1;var coord=feature.geometry.coordinates;var output=[];var seen={};if(useSpatialIndex){var allEdgesAsRbushTreeItems=[];for(var ring0=0;ring0<coord.length;ring0++){for(var edge0=0;edge0<coord[ring0].length-1;edge0++){allEdgesAsRbushTreeItems.push(rbushTreeItem(ring0,edge0));}}var tree=rbush_1();tree.load(allEdgesAsRbushTreeItems);}for(var ringA=0;ringA<coord.length;ringA++){for(var edgeA=0;edgeA<coord[ringA].length-1;edgeA++){if(useSpatialIndex){var bboxOverlaps=tree.search(rbushTreeItem(ringA,edgeA));bboxOverlaps.forEach(function(bboxIsect){var ring1=bboxIsect.ring;var edge1=bboxIsect.edge;ifIsectAddToOutput(ringA,edgeA,ring1,edge1);});}else{for(var ring1=0;ring1<coord.length;ring1++){for(var edge1=0;edge1<coord[ring1].length-1;edge1++){// TODO: speedup possible if only interested in unique: start last two loops at ringA and edgeA+1
ifIsectAddToOutput(ringA,edgeA,ring1,edge1);}}}}}if(!filterFn)output={type:'Feature',geometry:{type:'MultiPoint',coordinates:output}};return output;// Function to check if two edges intersect and add the intersection to the output
function ifIsectAddToOutput(ring0,edge0,ring1,edge1){var start0=coord[ring0][edge0];var end0=coord[ring0][edge0+1];var start1=coord[ring1][edge1];var end1=coord[ring1][edge1+1];var isect=intersect(start0,end0,start1,end1);if(isect===null)return;// discard parallels and coincidence
var frac0;var frac1;if(end0[0]!==start0[0]){frac0=(isect[0]-start0[0])/(end0[0]-start0[0]);}else{frac0=(isect[1]-start0[1])/(end0[1]-start0[1]);}if(end1[0]!==start1[0]){frac1=(isect[0]-start1[0])/(end1[0]-start1[0]);}else{frac1=(isect[1]-start1[1])/(end1[1]-start1[1]);}if(frac0>=1||frac0<=0||frac1>=1||frac1<=0)return;// require segment intersection
var key=isect;var unique=!seen[key];if(unique){seen[key]=true;}if(filterFn){output.push(filterFn(isect,ring0,edge0,start0,end0,frac0,ring1,edge1,start1,end1,frac1,unique));}else{output.push(isect);}}// Function to return a rbush tree item given an ring and edge number
function rbushTreeItem(ring,edge){var start=coord[ring][edge];var end=coord[ring][edge+1];var minX;var maxX;var minY;var maxY;if(start[0]<end[0]){minX=start[0];maxX=end[0];}else{minX=end[0];maxX=start[0];}if(start[1]<end[1]){minY=start[1];maxY=end[1];}else{minY=end[1];maxY=start[1];}return{minX:minX,minY:minY,maxX:maxX,maxY:maxY,ring:ring,edge:edge};}};// Function to compute where two lines (not segments) intersect. From https://en.wikipedia.org/wiki/Line%E2%80%93line_intersection
function intersect(start0,end0,start1,end1){if(equalArrays$1$1(start0,start1)||equalArrays$1$1(start0,end1)||equalArrays$1$1(end0,start1)||equalArrays$1$1(end1,start1))return null;var x0=start0[0],y0=start0[1],x1=end0[0],y1=end0[1],x2=start1[0],y2=start1[1],x3=end1[0],y3=end1[1];var denom=(x0-x1)*(y2-y3)-(y0-y1)*(x2-x3);if(denom===0)return null;var x4=((x0*y1-y0*x1)*(x2-x3)-(x0-x1)*(x2*y3-y2*x3))/denom;var y4=((x0*y1-y0*x1)*(y2-y3)-(y0-y1)*(x2*y3-y2*x3))/denom;return[x4,y4];}// Function to compare Arrays of numbers. From http://stackoverflow.com/questions/7837456/how-to-compare-arrays-in-javascript
function equalArrays$1$1(array1,array2){// if the other array is a falsy value, return
if(!array1||!array2)return false;// compare lengths - can save a lot of time
if(array1.length!==array2.length)return false;for(var i=0,l=array1.length;i<l;i++){// Check if we have nested arrays
if(array1[i]instanceof Array&&array2[i]instanceof Array){// recurse into the nested arrays
if(!equalArrays$1$1(array1[i],array2[i]))return false;}else if(array1[i]!==array2[i]){// Warning - two different object instances will never be equal: {x:20} !== {x:20}
return false;}}return true;}/**
 * Takes one or more features and returns their area in square meters.
 *
 * @name area
 * @param {GeoJSON} geojson input GeoJSON feature(s)
 * @returns {number} area in square meters
 * @example
 * var polygon = turf.polygon([[[125, -15], [113, -22], [154, -27], [144, -15], [125, -15]]]);
 *
 * var area = turf.area(polygon);
 *
 * //addToMap
 * var addToMap = [polygon]
 * polygon.properties.area = area
 */function area(geojson){return geomReduce(geojson,function(value,geom){return value+calculateArea(geom);},0);}var RADIUS=6378137;// var FLATTENING_DENOM = 298.257223563;
// var FLATTENING = 1 / FLATTENING_DENOM;
// var POLAR_RADIUS = RADIUS * (1 - FLATTENING);
/**
 * Calculate Area
 *
 * @private
 * @param {GeoJSON} geojson GeoJSON
 * @returns {number} area
 */function calculateArea(geojson){var area=0,i;switch(geojson.type){case'Polygon':return polygonArea(geojson.coordinates);case'MultiPolygon':for(i=0;i<geojson.coordinates.length;i++){area+=polygonArea(geojson.coordinates[i]);}return area;case'Point':case'MultiPoint':case'LineString':case'MultiLineString':return 0;case'GeometryCollection':for(i=0;i<geojson.geometries.length;i++){area+=calculateArea(geojson.geometries[i]);}return area;}}function polygonArea(coords){var area=0;if(coords&&coords.length>0){area+=Math.abs(ringArea(coords[0]));for(var i=1;i<coords.length;i++){area-=Math.abs(ringArea(coords[i]));}}return area;}/**
 * @private
 * Calculate the approximate area of the polygon were it projected onto the earth.
 * Note that this area will be positive if ring is oriented clockwise, otherwise it will be negative.
 *
 * Reference:
 * Robert. G. Chamberlain and William H. Duquette, "Some Algorithms for Polygons on a Sphere", JPL Publication 07-03, Jet Propulsion
 * Laboratory, Pasadena, CA, June 2007 http://trs-new.jpl.nasa.gov/dspace/handle/2014/40409
 *
 * @param {Array<Array<number>>} coords Ring Coordinates
 * @returns {number} The approximate signed geodesic area of the polygon in square meters.
 */function ringArea(coords){var p1;var p2;var p3;var lowerIndex;var middleIndex;var upperIndex;var i;var area=0;var coordsLength=coords.length;if(coordsLength>2){for(i=0;i<coordsLength;i++){if(i===coordsLength-2){// i = N-2
lowerIndex=coordsLength-2;middleIndex=coordsLength-1;upperIndex=0;}else if(i===coordsLength-1){// i = N-1
lowerIndex=coordsLength-1;middleIndex=0;upperIndex=1;}else{// i = 0 to N-3
lowerIndex=i;middleIndex=i+1;upperIndex=i+2;}p1=coords[lowerIndex];p2=coords[middleIndex];p3=coords[upperIndex];area+=(rad(p3[0])-rad(p1[0]))*Math.sin(rad(p2[1]));}area=area*RADIUS*RADIUS/2;}return area;}function rad(_){return _*Math.PI/180;}/**
 * Takes a complex (i.e. self-intersecting) geojson polygon, and breaks it down into its composite simple, non-self-intersecting one-ring polygons.
 *
 * @module simplepolygon
 * @param {Feature} feature Input polygon. This polygon may be unconform the {@link https://en.wikipedia.org/wiki/Simple_Features|Simple Features standard} in the sense that it's inner and outer rings may cross-intersect or self-intersect, that the outer ring must not contain the optional inner rings and that the winding number must not be positive for the outer and negative for the inner rings.
 * @return {FeatureCollection} Feature collection containing the simple, non-self-intersecting one-ring polygon features that the complex polygon is composed of. These simple polygons have properties such as their parent polygon, winding number and net winding number.
 *
 * @example
 * var poly = {
 *   "type": "Feature",
 *   "geometry": {
 *     "type": "Polygon",
 *     "coordinates": [[[0,0],[2,0],[0,2],[2,2],[0,0]]]
 *   }
 * };
 *
 * var result = simplepolygon(poly);
 *
 * // =result
 * // which will be a featureCollection of two polygons, one with coordinates [[[0,0],[2,0],[1,1],[0,0]]], parent -1, winding 1 and net winding 1, and one with coordinates [[[1,1],[0,2],[2,2],[1,1]]], parent -1, winding -1 and net winding -1
 */var simplepolygon=function simplepolygon(feature$$1){// Check input
if(feature$$1.type!='Feature')throw new Error('The input must a geojson object of type Feature');if(feature$$1.geometry===undefined||feature$$1.geometry==null)throw new Error('The input must a geojson object with a non-empty geometry');if(feature$$1.geometry.type!='Polygon')throw new Error('The input must be a geojson Polygon');// Process input
var numRings=feature$$1.geometry.coordinates.length;var vertices=[];for(var i=0;i<numRings;i++){var ring=feature$$1.geometry.coordinates[i];if(!equalArrays$2(ring[0],ring[ring.length-1])){ring.push(ring[0]);// Close input ring if it is not
}vertices.push.apply(vertices,ring.slice(0,ring.length-1));}if(!isUnique(vertices))throw new Error('The input polygon may not have duplicate vertices (except for the first and last vertex of each ring)');var numvertices=vertices.length;// number of input ring vertices, with the last closing vertices not counted
// Compute self-intersections
var selfIsectsData=isects(feature$$1,function filterFn(isect,ring0,edge0,start0,end0,frac0,ring1,edge1,start1,end1,frac1,unique){return[isect,ring0,edge0,start0,end0,frac0,ring1,edge1,start1,end1,frac1,unique];});var numSelfIsect=selfIsectsData.length;// If no self-intersections are found, the input rings are the output rings. Hence, we must only compute their winding numbers, net winding numbers and (since ohers rings could lie outside the first ring) parents.
if(numSelfIsect==0){var outputFeatureArray=[];for(var i=0;i<numRings;i++){outputFeatureArray.push(polygon([feature$$1.geometry.coordinates[i]],{parent:-1,winding:windingOfRing(feature$$1.geometry.coordinates[i])}));}var output=featureCollection(outputFeatureArray);determineParents();setNetWinding();return output;}// If self-intersections are found, we will compute the output rings with the help of two intermediate variables
// First, we build the pseudo vertex list and intersection list
// The Pseudo vertex list is an array with for each ring an array with for each edge an array containing the pseudo-vertices (as made by their constructor) that have this ring and edge as ringAndEdgeIn, sorted for each edge by their fractional distance on this edge. It's length hence equals numRings.
var pseudoVtxListByRingAndEdge=[];// The intersection list is an array containing intersections (as made by their constructor). First all numvertices ring-vertex-intersections, then all self-intersections (intra- and inter-ring). The order of the latter is not important but is permanent once given.
var isectList=[];// Adding ring-pseudo-vertices to pseudoVtxListByRingAndEdge and ring-vertex-intersections to isectList
for(var i=0;i<numRings;i++){pseudoVtxListByRingAndEdge.push([]);for(var j=0;j<feature$$1.geometry.coordinates[i].length-1;j++){// Each edge will feature one ring-pseudo-vertex in its array, on the last position. i.e. edge j features the ring-pseudo-vertex of the ring vertex j+1, which has ringAndEdgeIn = [i,j], on the last position.
pseudoVtxListByRingAndEdge[i].push([new PseudoVtx(feature$$1.geometry.coordinates[i][(j+1).modulo(feature$$1.geometry.coordinates[i].length-1)],1,[i,j],[i,(j+1).modulo(feature$$1.geometry.coordinates[i].length-1)],undefined)]);// The first numvertices elements in isectList correspond to the ring-vertex-intersections
isectList.push(new Isect(feature$$1.geometry.coordinates[i][j],[i,(j-1).modulo(feature$$1.geometry.coordinates[i].length-1)],[i,j],undefined,undefined,false,true));}}// Adding intersection-pseudo-vertices to pseudoVtxListByRingAndEdge and self-intersections to isectList
for(var i=0;i<numSelfIsect;i++){// Adding intersection-pseudo-vertices made using selfIsectsData to pseudoVtxListByRingAndEdge's array corresponding to the incomming ring and edge
pseudoVtxListByRingAndEdge[selfIsectsData[i][1]][selfIsectsData[i][2]].push(new PseudoVtx(selfIsectsData[i][0],selfIsectsData[i][5],[selfIsectsData[i][1],selfIsectsData[i][2]],[selfIsectsData[i][6],selfIsectsData[i][7]],undefined));// selfIsectsData contains double mentions of each intersection, but we only want to add them once to isectList
if(selfIsectsData[i][11])isectList.push(new Isect(selfIsectsData[i][0],[selfIsectsData[i][1],selfIsectsData[i][2]],[selfIsectsData[i][6],selfIsectsData[i][7]],undefined,undefined,true,true));}var numIsect=isectList.length;// Sort edge arrays of pseudoVtxListByRingAndEdge by the fractional distance 'param'
for(var i=0;i<pseudoVtxListByRingAndEdge.length;i++){for(var j=0;j<pseudoVtxListByRingAndEdge[i].length;j++){pseudoVtxListByRingAndEdge[i][j].sort(function(a,b){return a.param<b.param?-1:1;});}}// Make a spatial index of intersections, in preperation for the following two steps
var allIsectsAsIsectRbushTreeItem=[];for(var i=0;i<numIsect;i++){allIsectsAsIsectRbushTreeItem.push({minX:isectList[i].coord[0],minY:isectList[i].coord[1],maxX:isectList[i].coord[0],maxY:isectList[i].coord[1],index:i});// could pass isect: isectList[i], but not necessary
}var isectRbushTree=rbush_1();isectRbushTree.load(allIsectsAsIsectRbushTreeItem);// Now we will teach each intersection in isectList which is the next intersection along both it's [ring, edge]'s, in two steps.
// First, we find the next intersection for each pseudo-vertex in pseudoVtxListByRingAndEdge:
// For each pseudovertex in pseudoVtxListByRingAndEdge (3 loops) look at the next pseudovertex on that edge and find the corresponding intersection by comparing coordinates
for(var i=0;i<pseudoVtxListByRingAndEdge.length;i++){for(var j=0;j<pseudoVtxListByRingAndEdge[i].length;j++){for(var k=0;k<pseudoVtxListByRingAndEdge[i][j].length;k++){var coordToFind;if(k==pseudoVtxListByRingAndEdge[i][j].length-1){// If it's the last pseudoVertex on that edge, then the next pseudoVertex is the first one on the next edge of that ring.
coordToFind=pseudoVtxListByRingAndEdge[i][(j+1).modulo(feature$$1.geometry.coordinates[i].length-1)][0].coord;}else{coordToFind=pseudoVtxListByRingAndEdge[i][j][k+1].coord;}var IsectRbushTreeItemFound=isectRbushTree.search({minX:coordToFind[0],minY:coordToFind[1],maxX:coordToFind[0],maxY:coordToFind[1]})[0];// We can take [0] of the result, because there is only one isect correponding to a pseudo-vertex
pseudoVtxListByRingAndEdge[i][j][k].nxtIsectAlongEdgeIn=IsectRbushTreeItemFound.index;}}}// Second, we port this knowledge of the next intersection over to the intersections in isectList, by finding the intersection corresponding to each pseudo-vertex and copying the pseudo-vertex' knownledge of the next-intersection over to the intersection
for(var i=0;i<pseudoVtxListByRingAndEdge.length;i++){for(var j=0;j<pseudoVtxListByRingAndEdge[i].length;j++){for(var k=0;k<pseudoVtxListByRingAndEdge[i][j].length;k++){var coordToFind=pseudoVtxListByRingAndEdge[i][j][k].coord;var IsectRbushTreeItemFound=isectRbushTree.search({minX:coordToFind[0],minY:coordToFind[1],maxX:coordToFind[0],maxY:coordToFind[1]})[0];// We can take [0] of the result, because there is only one isect correponding to a pseudo-vertex
var l=IsectRbushTreeItemFound.index;if(l<numvertices){// Special treatment at ring-vertices: we correct the misnaming that happened in the previous block, since ringAndEdgeOut = ringAndEdge2 for ring vertices.
isectList[l].nxtIsectAlongRingAndEdge2=pseudoVtxListByRingAndEdge[i][j][k].nxtIsectAlongEdgeIn;}else{// Port the knowledge of the next intersection from the pseudo-vertices to the intersections, depending on how the edges are labeled in the pseudo-vertex and intersection.
if(equalArrays$2(isectList[l].ringAndEdge1,pseudoVtxListByRingAndEdge[i][j][k].ringAndEdgeIn)){isectList[l].nxtIsectAlongRingAndEdge1=pseudoVtxListByRingAndEdge[i][j][k].nxtIsectAlongEdgeIn;}else{isectList[l].nxtIsectAlongRingAndEdge2=pseudoVtxListByRingAndEdge[i][j][k].nxtIsectAlongEdgeIn;}}}}}// This explains why, eventhough when we will walk away from an intersection, we will walk way from the corresponding pseudo-vertex along edgeOut, pseudo-vertices have the property 'nxtIsectAlongEdgeIn' in stead of some propery 'nxtPseudoVtxAlongEdgeOut'. This is because this property (which is easy to find out) is used in the above for nxtIsectAlongRingAndEdge1 and nxtIsectAlongRingAndEdge2!
// Before we start walking over the intersections to build the output rings, we prepare a queue that stores information on intersections we still have to deal with, and put at least one intersection in it.
// This queue will contain information on intersections where we can start walking from once the current walk is finished, and its parent output ring (the smallest output ring it lies within, -1 if no parent or parent unknown yet) and its winding number (which we can already determine).
var queue=[];// For each output ring, add the ring-vertex-intersection with the smalles x-value (i.e. the left-most) as a start intersection. By choosing such an extremal intersections, we are sure to start at an intersection that is a convex vertex of its output ring. By adding them all to the queue, we are sure that no rings will be forgotten. If due to ring-intersections such an intersection will be encountered while walking, it will be removed from the queue.
var i=0;for(var j=0;j<numRings;j++){var leftIsect=i;for(var k=0;k<feature$$1.geometry.coordinates[j].length-1;k++){if(isectList[i].coord[0]<isectList[leftIsect].coord[0]){leftIsect=i;}i++;}// Compute winding at this left-most ring-vertex-intersection. We thus this by using our knowledge that this extremal vertex must be a convex vertex.
// We first find the intersection before and after it, and then use them to determine the winding number of the corresponding output ring, since we know that an extremal vertex of a simple, non-self-intersecting ring is always convex, so the only reason it would not be is because the winding number we use to compute it is wrong
var isectAfterLeftIsect=isectList[leftIsect].nxtIsectAlongRingAndEdge2;for(var k=0;k<isectList.length;k++){if(isectList[k].nxtIsectAlongRingAndEdge1==leftIsect||isectList[k].nxtIsectAlongRingAndEdge2==leftIsect){var isectBeforeLeftIsect=k;break;}}var windingAtIsect=isConvex([isectList[isectBeforeLeftIsect].coord,isectList[leftIsect].coord,isectList[isectAfterLeftIsect].coord],true)?1:-1;queue.push({isect:leftIsect,parent:-1,winding:windingAtIsect});}// Sort the queue by the same criterion used to find the leftIsect: the left-most leftIsect must be last in the queue, such that it will be popped first, such that we will work from out to in regarding input rings. This assumtion is used when predicting the winding number and parent of a new queue member.
queue.sort(function(a,b){return isectList[a.isect].coord>isectList[b.isect].coord?-1:1;});// Initialise output
var outputFeatureArray=[];// While the queue is not empty, take the last object (i.e. its intersection) out and start making an output ring by walking in the direction that has not been walked away over yet.
while(queue.length>0){// Get the last object out of the queue
var popped=queue.pop();var startIsect=popped.isect;var currentOutputRingParent=popped.parent;var currentOutputRingWinding=popped.winding;// Make new output ring and add vertex from starting intersection
var currentOutputRing=outputFeatureArray.length;var currentOutputRingCoords=[isectList[startIsect].coord];// Set up the variables used while walking over intersections: 'currentIsect', 'nxtIsect' and 'walkingRingAndEdge'
var currentIsect=startIsect;if(isectList[startIsect].ringAndEdge1Walkable){var walkingRingAndEdge=isectList[startIsect].ringAndEdge1;var nxtIsect=isectList[startIsect].nxtIsectAlongRingAndEdge1;}else{var walkingRingAndEdge=isectList[startIsect].ringAndEdge2;var nxtIsect=isectList[startIsect].nxtIsectAlongRingAndEdge2;}// While we have not arrived back at the same intersection, keep walking
while(!equalArrays$2(isectList[startIsect].coord,isectList[nxtIsect].coord)){currentOutputRingCoords.push(isectList[nxtIsect].coord);// If the next intersection is queued, we can remove it, because we will go there now.
var nxtIsectInQueue=undefined;for(var i=0;i<queue.length;i++){if(queue[i].isect==nxtIsect){nxtIsectInQueue=i;break;}}if(nxtIsectInQueue!=undefined){queue.splice(nxtIsectInQueue,1);}// Arriving at this new intersection, we know which will be our next walking ring and edge (if we came from 1 we will walk away from 2 and vice versa),
// So we can set it as our new walking ring and intersection and remember that we (will) have walked over it
// If we have never walked away from this new intersection along the other ring and edge then we will soon do, add the intersection (and the parent wand winding number) to the queue
// (We can predict the winding number and parent as follows: if the edge is convex, the other output ring started from there will have the alternate winding and lie outside of the current one, and thus have the same parent ring as the current ring. Otherwise, it will have the same winding number and lie inside of the current ring. We are, however, only sure of this of an output ring started from there does not enclose the current ring. This is why the initial queue's intersections must be sorted such that outer ones come out first.)
// We then update the other two walking variables.
if(equalArrays$2(walkingRingAndEdge,isectList[nxtIsect].ringAndEdge1)){walkingRingAndEdge=isectList[nxtIsect].ringAndEdge2;isectList[nxtIsect].ringAndEdge2Walkable=false;if(isectList[nxtIsect].ringAndEdge1Walkable){var pushing={isect:nxtIsect};if(isConvex([isectList[currentIsect].coord,isectList[nxtIsect].coord,isectList[isectList[nxtIsect].nxtIsectAlongRingAndEdge2].coord],currentOutputRingWinding==1)){pushing.parent=currentOutputRingParent;pushing.winding=-currentOutputRingWinding;}else{pushing.parent=currentOutputRing;pushing.winding=currentOutputRingWinding;}queue.push(pushing);}currentIsect=nxtIsect;nxtIsect=isectList[nxtIsect].nxtIsectAlongRingAndEdge2;}else{walkingRingAndEdge=isectList[nxtIsect].ringAndEdge1;isectList[nxtIsect].ringAndEdge1Walkable=false;if(isectList[nxtIsect].ringAndEdge2Walkable){var pushing={isect:nxtIsect};if(isConvex([isectList[currentIsect].coord,isectList[nxtIsect].coord,isectList[isectList[nxtIsect].nxtIsectAlongRingAndEdge1].coord],currentOutputRingWinding==1)){pushing.parent=currentOutputRingParent;pushing.winding=-currentOutputRingWinding;}else{pushing.parent=currentOutputRing;pushing.winding=currentOutputRingWinding;}queue.push(pushing);}currentIsect=nxtIsect;nxtIsect=isectList[nxtIsect].nxtIsectAlongRingAndEdge1;}}// Close output ring
currentOutputRingCoords.push(isectList[nxtIsect].coord);// Push output ring to output
outputFeatureArray.push(polygon([currentOutputRingCoords],{index:currentOutputRing,parent:currentOutputRingParent,winding:currentOutputRingWinding,netWinding:undefined}));}var output=featureCollection(outputFeatureArray);determineParents();setNetWinding();// These functions are also used if no intersections are found
function determineParents(){var featuresWithoutParent=[];for(var i=0;i<output.features.length;i++){if(output.features[i].properties.parent==-1)featuresWithoutParent.push(i);}if(featuresWithoutParent.length>1){for(var i=0;i<featuresWithoutParent.length;i++){var parent=-1;var parentArea=Infinity;for(var j=0;j<output.features.length;j++){if(featuresWithoutParent[i]==j)continue;if(inside(point(output.features[featuresWithoutParent[i]].geometry.coordinates[0][0]),output.features[j],{ignoreBoundary:true})){if(area(output.features[j])<parentArea){parent=j;}}}output.features[featuresWithoutParent[i]].properties.parent=parent;}}}function setNetWinding(){for(var i=0;i<output.features.length;i++){if(output.features[i].properties.parent==-1){var netWinding=output.features[i].properties.winding;output.features[i].properties.netWinding=netWinding;setNetWindingOfChildren(i,netWinding);}}}function setNetWindingOfChildren(parent,ParentNetWinding){for(var i=0;i<output.features.length;i++){if(output.features[i].properties.parent==parent){var netWinding=ParentNetWinding+output.features[i].properties.winding;output.features[i].properties.netWinding=netWinding;setNetWindingOfChildren(i,netWinding);}}}return output;};// Constructor for (ring- or intersection-) pseudo-vertices.
var PseudoVtx=function PseudoVtx(coord,param,ringAndEdgeIn,ringAndEdgeOut,nxtIsectAlongEdgeIn){this.coord=coord;// [x,y] of this pseudo-vertex
this.param=param;// fractional distance of this intersection on incomming edge
this.ringAndEdgeIn=ringAndEdgeIn;// [ring index, edge index] of incomming edge
this.ringAndEdgeOut=ringAndEdgeOut;// [ring index, edge index] of outgoing edge
this.nxtIsectAlongEdgeIn=nxtIsectAlongEdgeIn;// The next intersection when following the incomming edge (so not when following ringAndEdgeOut!)
};// Constructor for an intersection. There are two intersection-pseudo-vertices per self-intersection and one ring-pseudo-vertex per ring-vertex-intersection. Their labels 1 and 2 are not assigned a particular meaning but are permanent once given.
var Isect=function Isect(coord,ringAndEdge1,ringAndEdge2,nxtIsectAlongRingAndEdge1,nxtIsectAlongRingAndEdge2,ringAndEdge1Walkable,ringAndEdge2Walkable){this.coord=coord;// [x,y] of this intersection
this.ringAndEdge1=ringAndEdge1;// first edge of this intersection
this.ringAndEdge2=ringAndEdge2;// second edge of this intersection
this.nxtIsectAlongRingAndEdge1=nxtIsectAlongRingAndEdge1;// the next intersection when following ringAndEdge1
this.nxtIsectAlongRingAndEdge2=nxtIsectAlongRingAndEdge2;// the next intersection when following ringAndEdge2
this.ringAndEdge1Walkable=ringAndEdge1Walkable;// May we (still) walk away from this intersection over ringAndEdge1?
this.ringAndEdge2Walkable=ringAndEdge2Walkable;// May we (still) walk away from this intersection over ringAndEdge2?
};// Function to determine if three consecutive points of a simple, non-self-intersecting ring make up a convex vertex, assuming the ring is right- or lefthanded
function isConvex(pts,righthanded){// 'pts' is an [x,y] pair
// 'righthanded' is a boolean
if(typeof righthanded==='undefined')righthanded=true;if(pts.length!=3)throw new Error('This function requires an array of three points [x,y]');var d=(pts[1][0]-pts[0][0])*(pts[2][1]-pts[0][1])-(pts[1][1]-pts[0][1])*(pts[2][0]-pts[0][0]);return d>=0==righthanded;}// Function to compute winding of simple, non-self-intersecting ring
function windingOfRing(ring){// 'ring' is an array of [x,y] pairs with the last equal to the first
// Compute the winding number based on the vertex with the smallest x-value, it precessor and successor. An extremal vertex of a simple, non-self-intersecting ring is always convex, so the only reason it is not is because the winding number we use to compute it is wrong
var leftVtx=0;for(var i=0;i<ring.length-1;i++){if(ring[i][0]<ring[leftVtx][0])leftVtx=i;}if(isConvex([ring[(leftVtx-1).modulo(ring.length-1)],ring[leftVtx],ring[(leftVtx+1).modulo(ring.length-1)]],true)){var winding=1;}else{var winding=-1;}return winding;}// Function to compare Arrays of numbers. From http://stackoverflow.com/questions/7837456/how-to-compare-arrays-in-javascript
function equalArrays$2(array1,array2){// if the other array is a falsy value, return
if(!array1||!array2)return false;// compare lengths - can save a lot of time
if(array1.length!=array2.length)return false;for(var i=0,l=array1.length;i<l;i++){// Check if we have nested arrays
if(array1[i]instanceof Array&&array2[i]instanceof Array){// recurse into the nested arrays
if(!equalArrays$2(array1[i],array2[i]))return false;}else if(array1[i]!=array2[i]){// Warning - two different object instances will never be equal: {x:20} != {x:20}
return false;}}return true;}// Fix Javascript modulo for negative number. From http://stackoverflow.com/questions/4467539/javascript-modulo-not-behaving
Number.prototype.modulo=function(n){return(this%n+n)%n;};// Function to check if array is unique (i.e. all unique elements, i.e. no duplicate elements)
function isUnique(array){var u={};var isUnique=1;for(var i=0,l=array.length;i<l;++i){if(u.hasOwnProperty(array[i])){isUnique=0;break;}u[array[i]]=1;}return isUnique;}/**
 * Takes a kinked polygon and returns a feature collection of polygons that have no kinks.
 * Uses [simplepolygon](https://github.com/mclaeysb/simplepolygon) internally.
 *
 * @name unkinkPolygon
 * @param {FeatureCollection|Feature<Polygon|MultiPolygon>} geojson GeoJSON Polygon or MultiPolygon
 * @returns {FeatureCollection<Polygon>} Unkinked polygons
 * @example
 * var poly = turf.polygon([[[0, 0], [2, 0], [0, 2], [2, 2], [0, 0]]]);
 *
 * var result = turf.unkinkPolygon(poly);
 *
 * //addToMap
 * var addToMap = [poly, result]
 */function unkinkPolygon(geojson){var features=[];flattenEach(geojson,function(feature$$1){if(feature$$1.geometry.type!=='Polygon')return;featureEach(simplepolygon(feature$$1),function(poly){features.push(polygon(poly.geometry.coordinates,feature$$1.properties));});});return featureCollection(features);}//http://en.wikipedia.org/wiki/Delaunay_triangulation
//https://github.com/ironwallaby/delaunay
/**
 * Takes a set of {@link Point|points} and creates a
 * [Triangulated Irregular Network](http://en.wikipedia.org/wiki/Triangulated_irregular_network),
 * or a TIN for short, returned as a collection of Polygons. These are often used
 * for developing elevation contour maps or stepped heat visualizations.
 *
 * If an optional z-value property is provided then it is added as properties called `a`, `b`,
 * and `c` representing its value at each of the points that represent the corners of the
 * triangle.
 *
 * @name tin
 * @param {FeatureCollection<Point>} points input points
 * @param {String} [z] name of the property from which to pull z values
 * This is optional: if not given, then there will be no extra data added to the derived triangles.
 * @returns {FeatureCollection<Polygon>} TIN output
 * @example
 * // generate some random point data
 * var points = turf.randomPoint(30, {bbox: [50, 30, 70, 50]});
 *
 * // add a random property to each point between 0 and 9
 * for (var i = 0; i < points.features.length; i++) {
 *   points.features[i].properties.z = ~~(Math.random() * 9);
 * }
 * var tin = turf.tin(points, 'z');
 *
 * //addToMap
 * var addToMap = [tin, points]
 * for (var i = 0; i < tin.features.length; i++) {
 *   var properties  = tin.features[i].properties;
 *   properties.fill = '#' + properties.a + properties.b + properties.c;
 * }
 */function tin(points,z){if(points.type!=='FeatureCollection')throw new Error('points must be a FeatureCollection');//break down points
var isPointZ=false;return featureCollection(triangulate(points.features.map(function(p){var point$$1={x:p.geometry.coordinates[0],y:p.geometry.coordinates[1]};if(z){point$$1.z=p.properties[z];}else if(p.geometry.coordinates.length===3){isPointZ=true;point$$1.z=p.geometry.coordinates[2];}return point$$1;})).map(function(triangle){var a=[triangle.a.x,triangle.a.y];var b=[triangle.b.x,triangle.b.y];var c=[triangle.c.x,triangle.c.y];var properties={};// Add z coordinates to triangle points if user passed
// them in that way otherwise add it as a property.
if(isPointZ){a.push(triangle.a.z);b.push(triangle.b.z);c.push(triangle.c.z);}else{properties={a:triangle.a.z,b:triangle.b.z,c:triangle.c.z};}return polygon([[a,b,c,a]],properties);}));}function Triangle$1(a,b,c){this.a=a;this.b=b;this.c=c;var A=b.x-a.x,B=b.y-a.y,C=c.x-a.x,D=c.y-a.y,E=A*(a.x+b.x)+B*(a.y+b.y),F=C*(a.x+c.x)+D*(a.y+c.y),G=2*(A*(c.y-b.y)-B*(c.x-b.x)),dx,dy;// If the points of the triangle are collinear, then just find the
// extremes and use the midpoint as the center of the circumcircle.
this.x=(D*E-B*F)/G;this.y=(A*F-C*E)/G;dx=this.x-a.x;dy=this.y-a.y;this.r=dx*dx+dy*dy;}function byX(a,b){return b.x-a.x;}function dedup(edges){var j=edges.length,a,b,i,m,n;outer:while(j){b=edges[--j];a=edges[--j];i=j;while(i){n=edges[--i];m=edges[--i];if(a===m&&b===n||a===n&&b===m){edges.splice(j,2);edges.splice(i,2);j-=2;continue outer;}}}}function triangulate(vertices){// Bail if there aren't enough vertices to form any triangles.
if(vertices.length<3)return[];// Ensure the vertex array is in order of descending X coordinate
// (which is needed to ensure a subquadratic runtime), and then find
// the bounding box around the points.
vertices.sort(byX);var i=vertices.length-1,xmin=vertices[i].x,xmax=vertices[0].x,ymin=vertices[i].y,ymax=ymin,epsilon=1e-12;var a,b,c,A,B,G;while(i--){if(vertices[i].y<ymin)ymin=vertices[i].y;if(vertices[i].y>ymax)ymax=vertices[i].y;}//Find a supertriangle, which is a triangle that surrounds all the
//vertices. This is used like something of a sentinel value to remove
//cases in the main algorithm, and is removed before we return any
// results.
// Once found, put it in the "open" list. (The "open" list is for
// triangles who may still need to be considered; the "closed" list is
// for triangles which do not.)
var dx=xmax-xmin,dy=ymax-ymin,dmax=dx>dy?dx:dy,xmid=(xmax+xmin)*0.5,ymid=(ymax+ymin)*0.5,open=[new Triangle$1({x:xmid-20*dmax,y:ymid-dmax,__sentinel:true},{x:xmid,y:ymid+20*dmax,__sentinel:true},{x:xmid+20*dmax,y:ymid-dmax,__sentinel:true})],closed=[],edges=[],j;// Incrementally add each vertex to the mesh.
i=vertices.length;while(i--){// For each open triangle, check to see if the current point is
// inside it's circumcircle. If it is, remove the triangle and add
// it's edges to an edge list.
edges.length=0;j=open.length;while(j--){// If this point is to the right of this triangle's circumcircle,
// then this triangle should never get checked again. Remove it
// from the open list, add it to the closed list, and skip.
dx=vertices[i].x-open[j].x;if(dx>0&&dx*dx>open[j].r){closed.push(open[j]);open.splice(j,1);continue;}// If not, skip this triangle.
dy=vertices[i].y-open[j].y;if(dx*dx+dy*dy>open[j].r)continue;// Remove the triangle and add it's edges to the edge list.
edges.push(open[j].a,open[j].b,open[j].b,open[j].c,open[j].c,open[j].a);open.splice(j,1);}// Remove any doubled edges.
dedup(edges);// Add a new triangle for each edge.
j=edges.length;while(j){b=edges[--j];a=edges[--j];c=vertices[i];// Avoid adding colinear triangles (which have error-prone
// circumcircles)
A=b.x-a.x;B=b.y-a.y;G=2*(A*(c.y-b.y)-B*(c.x-b.x));if(Math.abs(G)>epsilon){open.push(new Triangle$1(a,b,c));}}}// Copy any remaining open triangles to the closed list, and then
// remove any triangles that share a vertex with the supertriangle.
Array.prototype.push.apply(closed,open);i=closed.length;while(i--){if(closed[i].a.__sentinel||closed[i].b.__sentinel||closed[i].c.__sentinel)closed.splice(i,1);}return closed;}var commonjsGlobal=typeof window!=='undefined'?window:typeof global!=='undefined'?global:typeof self!=='undefined'?self:{};function createCommonjsModule(fn,module){return module={exports:{}},fn(module,module.exports),module.exports;}var topojsonServer=createCommonjsModule(function(module,exports){// https://github.com/topojson/topojson-server Version 3.0.0. Copyright 2017 Mike Bostock.
(function(global,factory){factory(exports);})(commonjsGlobal,function(exports){'use strict';// Computes the bounding box of the specified hash of GeoJSON objects.
var bounds=function bounds(objects){var x0=Infinity,y0=Infinity,x1=-Infinity,y1=-Infinity;function boundGeometry(geometry){if(geometry!=null&&boundGeometryType.hasOwnProperty(geometry.type))boundGeometryType[geometry.type](geometry);}var boundGeometryType={GeometryCollection:function GeometryCollection(o){o.geometries.forEach(boundGeometry);},Point:function Point(o){boundPoint(o.coordinates);},MultiPoint:function MultiPoint(o){o.coordinates.forEach(boundPoint);},LineString:function LineString(o){boundLine(o.arcs);},MultiLineString:function MultiLineString(o){o.arcs.forEach(boundLine);},Polygon:function Polygon(o){o.arcs.forEach(boundLine);},MultiPolygon:function MultiPolygon(o){o.arcs.forEach(boundMultiLine);}};function boundPoint(coordinates){var x=coordinates[0],y=coordinates[1];if(x<x0)x0=x;if(x>x1)x1=x;if(y<y0)y0=y;if(y>y1)y1=y;}function boundLine(coordinates){coordinates.forEach(boundPoint);}function boundMultiLine(coordinates){coordinates.forEach(boundLine);}for(var key in objects){boundGeometry(objects[key]);}return x1>=x0&&y1>=y0?[x0,y0,x1,y1]:undefined;};var hashset=function hashset(size,hash,equal,type,empty){if(arguments.length===3){type=Array;empty=null;}var store=new type(size=1<<Math.max(4,Math.ceil(Math.log(size)/Math.LN2))),mask=size-1;for(var i=0;i<size;++i){store[i]=empty;}function add(value){var index=hash(value)&mask,match=store[index],collisions=0;while(match!=empty){if(equal(match,value))return true;if(++collisions>=size)throw new Error("full hashset");match=store[index=index+1&mask];}store[index]=value;return true;}function has(value){var index=hash(value)&mask,match=store[index],collisions=0;while(match!=empty){if(equal(match,value))return true;if(++collisions>=size)break;match=store[index=index+1&mask];}return false;}function values(){var values=[];for(var i=0,n=store.length;i<n;++i){var match=store[i];if(match!=empty)values.push(match);}return values;}return{add:add,has:has,values:values};};var hashmap=function hashmap(size,hash,equal,keyType,keyEmpty,valueType){if(arguments.length===3){keyType=valueType=Array;keyEmpty=null;}var keystore=new keyType(size=1<<Math.max(4,Math.ceil(Math.log(size)/Math.LN2))),valstore=new valueType(size),mask=size-1;for(var i=0;i<size;++i){keystore[i]=keyEmpty;}function set$$1(key,value){var index=hash(key)&mask,matchKey=keystore[index],collisions=0;while(matchKey!=keyEmpty){if(equal(matchKey,key))return valstore[index]=value;if(++collisions>=size)throw new Error("full hashmap");matchKey=keystore[index=index+1&mask];}keystore[index]=key;valstore[index]=value;return value;}function maybeSet(key,value){var index=hash(key)&mask,matchKey=keystore[index],collisions=0;while(matchKey!=keyEmpty){if(equal(matchKey,key))return valstore[index];if(++collisions>=size)throw new Error("full hashmap");matchKey=keystore[index=index+1&mask];}keystore[index]=key;valstore[index]=value;return value;}function get$$1(key,missingValue){var index=hash(key)&mask,matchKey=keystore[index],collisions=0;while(matchKey!=keyEmpty){if(equal(matchKey,key))return valstore[index];if(++collisions>=size)break;matchKey=keystore[index=index+1&mask];}return missingValue;}function keys(){var keys=[];for(var i=0,n=keystore.length;i<n;++i){var matchKey=keystore[i];if(matchKey!=keyEmpty)keys.push(matchKey);}return keys;}return{set:set$$1,maybeSet:maybeSet,// set if unset
get:get$$1,keys:keys};};var equalPoint=function equalPoint(pointA,pointB){return pointA[0]===pointB[0]&&pointA[1]===pointB[1];};// TODO if quantized, use simpler Int32 hashing?
var buffer=new ArrayBuffer(16);var floats=new Float64Array(buffer);var uints=new Uint32Array(buffer);var hashPoint=function hashPoint(point){floats[0]=point[0];floats[1]=point[1];var hash=uints[0]^uints[1];hash=hash<<5^hash>>7^uints[2]^uints[3];return hash&0x7fffffff;};// Given an extracted (pre-)topology, identifies all of the junctions. These are
// the points at which arcs (lines or rings) will need to be cut so that each
// arc is represented uniquely.
//
// A junction is a point where at least one arc deviates from another arc going
// through the same point. For example, consider the point B. If there is a arc
// through ABC and another arc through CBA, then B is not a junction because in
// both cases the adjacent point pairs are {A,C}. However, if there is an
// additional arc ABD, then {A,D} != {A,C}, and thus B becomes a junction.
//
// For a closed ring ABCA, the first point A’s adjacent points are the second
// and last point {B,C}. For a line, the first and last point are always
// considered junctions, even if the line is closed; this ensures that a closed
// line is never rotated.
var join=function join(topology){var coordinates=topology.coordinates,lines=topology.lines,rings=topology.rings,indexes=index(),visitedByIndex=new Int32Array(coordinates.length),leftByIndex=new Int32Array(coordinates.length),rightByIndex=new Int32Array(coordinates.length),junctionByIndex=new Int8Array(coordinates.length),junctionCount=0,// upper bound on number of junctions
i,n,previousIndex,currentIndex,nextIndex;for(i=0,n=coordinates.length;i<n;++i){visitedByIndex[i]=leftByIndex[i]=rightByIndex[i]=-1;}for(i=0,n=lines.length;i<n;++i){var line=lines[i],lineStart=line[0],lineEnd=line[1];currentIndex=indexes[lineStart];nextIndex=indexes[++lineStart];++junctionCount,junctionByIndex[currentIndex]=1;// start
while(++lineStart<=lineEnd){sequence(i,previousIndex=currentIndex,currentIndex=nextIndex,nextIndex=indexes[lineStart]);}++junctionCount,junctionByIndex[nextIndex]=1;// end
}for(i=0,n=coordinates.length;i<n;++i){visitedByIndex[i]=-1;}for(i=0,n=rings.length;i<n;++i){var ring=rings[i],ringStart=ring[0]+1,ringEnd=ring[1];previousIndex=indexes[ringEnd-1];currentIndex=indexes[ringStart-1];nextIndex=indexes[ringStart];sequence(i,previousIndex,currentIndex,nextIndex);while(++ringStart<=ringEnd){sequence(i,previousIndex=currentIndex,currentIndex=nextIndex,nextIndex=indexes[ringStart]);}}function sequence(i,previousIndex,currentIndex,nextIndex){if(visitedByIndex[currentIndex]===i)return;// ignore self-intersection
visitedByIndex[currentIndex]=i;var leftIndex=leftByIndex[currentIndex];if(leftIndex>=0){var rightIndex=rightByIndex[currentIndex];if((leftIndex!==previousIndex||rightIndex!==nextIndex)&&(leftIndex!==nextIndex||rightIndex!==previousIndex)){++junctionCount,junctionByIndex[currentIndex]=1;}}else{leftByIndex[currentIndex]=previousIndex;rightByIndex[currentIndex]=nextIndex;}}function index(){var indexByPoint=hashmap(coordinates.length*1.4,hashIndex,equalIndex,Int32Array,-1,Int32Array),indexes=new Int32Array(coordinates.length);for(var i=0,n=coordinates.length;i<n;++i){indexes[i]=indexByPoint.maybeSet(i,i);}return indexes;}function hashIndex(i){return hashPoint(coordinates[i]);}function equalIndex(i,j){return equalPoint(coordinates[i],coordinates[j]);}visitedByIndex=leftByIndex=rightByIndex=null;var junctionByPoint=hashset(junctionCount*1.4,hashPoint,equalPoint),j;// Convert back to a standard hashset by point for caller convenience.
for(i=0,n=coordinates.length;i<n;++i){if(junctionByIndex[j=indexes[i]]){junctionByPoint.add(coordinates[j]);}}return junctionByPoint;};// Given an extracted (pre-)topology, cuts (or rotates) arcs so that all shared
// point sequences are identified. The topology can then be subsequently deduped
// to remove exact duplicate arcs.
var cut=function cut(topology){var junctions=join(topology),coordinates=topology.coordinates,lines=topology.lines,rings=topology.rings,next,i,n;for(i=0,n=lines.length;i<n;++i){var line=lines[i],lineMid=line[0],lineEnd=line[1];while(++lineMid<lineEnd){if(junctions.has(coordinates[lineMid])){next={0:lineMid,1:line[1]};line[1]=lineMid;line=line.next=next;}}}for(i=0,n=rings.length;i<n;++i){var ring=rings[i],ringStart=ring[0],ringMid=ringStart,ringEnd=ring[1],ringFixed=junctions.has(coordinates[ringStart]);while(++ringMid<ringEnd){if(junctions.has(coordinates[ringMid])){if(ringFixed){next={0:ringMid,1:ring[1]};ring[1]=ringMid;ring=ring.next=next;}else{// For the first junction, we can rotate rather than cut.
rotateArray(coordinates,ringStart,ringEnd,ringEnd-ringMid);coordinates[ringEnd]=coordinates[ringStart];ringFixed=true;ringMid=ringStart;// restart; we may have skipped junctions
}}}}return topology;};function rotateArray(array,start,end,offset){reverse(array,start,end);reverse(array,start,start+offset);reverse(array,start+offset,end);}function reverse(array,start,end){for(var mid=start+(end-- -start>>1),t;start<mid;++start,--end){t=array[start],array[start]=array[end],array[end]=t;}}// Given a cut topology, combines duplicate arcs.
var dedup=function dedup(topology){var coordinates=topology.coordinates,lines=topology.lines,line,rings=topology.rings,ring,arcCount=lines.length+rings.length,i,n;delete topology.lines;delete topology.rings;// Count the number of (non-unique) arcs to initialize the hashmap safely.
for(i=0,n=lines.length;i<n;++i){line=lines[i];while(line=line.next){++arcCount;}}for(i=0,n=rings.length;i<n;++i){ring=rings[i];while(ring=ring.next){++arcCount;}}var arcsByEnd=hashmap(arcCount*2*1.4,hashPoint,equalPoint),arcs=topology.arcs=[];for(i=0,n=lines.length;i<n;++i){line=lines[i];do{dedupLine(line);}while(line=line.next);}for(i=0,n=rings.length;i<n;++i){ring=rings[i];if(ring.next){// arc is no longer closed
do{dedupLine(ring);}while(ring=ring.next);}else{dedupRing(ring);}}function dedupLine(arc){var startPoint,endPoint,startArcs,startArc,endArcs,endArc,i,n;// Does this arc match an existing arc in order?
if(startArcs=arcsByEnd.get(startPoint=coordinates[arc[0]])){for(i=0,n=startArcs.length;i<n;++i){startArc=startArcs[i];if(equalLine(startArc,arc)){arc[0]=startArc[0];arc[1]=startArc[1];return;}}}// Does this arc match an existing arc in reverse order?
if(endArcs=arcsByEnd.get(endPoint=coordinates[arc[1]])){for(i=0,n=endArcs.length;i<n;++i){endArc=endArcs[i];if(reverseEqualLine(endArc,arc)){arc[1]=endArc[0];arc[0]=endArc[1];return;}}}if(startArcs)startArcs.push(arc);else arcsByEnd.set(startPoint,[arc]);if(endArcs)endArcs.push(arc);else arcsByEnd.set(endPoint,[arc]);arcs.push(arc);}function dedupRing(arc){var endPoint,endArcs,endArc,i,n;// Does this arc match an existing line in order, or reverse order?
// Rings are closed, so their start point and end point is the same.
if(endArcs=arcsByEnd.get(endPoint=coordinates[arc[0]])){for(i=0,n=endArcs.length;i<n;++i){endArc=endArcs[i];if(equalRing(endArc,arc)){arc[0]=endArc[0];arc[1]=endArc[1];return;}if(reverseEqualRing(endArc,arc)){arc[0]=endArc[1];arc[1]=endArc[0];return;}}}// Otherwise, does this arc match an existing ring in order, or reverse order?
if(endArcs=arcsByEnd.get(endPoint=coordinates[arc[0]+findMinimumOffset(arc)])){for(i=0,n=endArcs.length;i<n;++i){endArc=endArcs[i];if(equalRing(endArc,arc)){arc[0]=endArc[0];arc[1]=endArc[1];return;}if(reverseEqualRing(endArc,arc)){arc[0]=endArc[1];arc[1]=endArc[0];return;}}}if(endArcs)endArcs.push(arc);else arcsByEnd.set(endPoint,[arc]);arcs.push(arc);}function equalLine(arcA,arcB){var ia=arcA[0],ib=arcB[0],ja=arcA[1],jb=arcB[1];if(ia-ja!==ib-jb)return false;for(;ia<=ja;++ia,++ib){if(!equalPoint(coordinates[ia],coordinates[ib]))return false;}return true;}function reverseEqualLine(arcA,arcB){var ia=arcA[0],ib=arcB[0],ja=arcA[1],jb=arcB[1];if(ia-ja!==ib-jb)return false;for(;ia<=ja;++ia,--jb){if(!equalPoint(coordinates[ia],coordinates[jb]))return false;}return true;}function equalRing(arcA,arcB){var ia=arcA[0],ib=arcB[0],ja=arcA[1],jb=arcB[1],n=ja-ia;if(n!==jb-ib)return false;var ka=findMinimumOffset(arcA),kb=findMinimumOffset(arcB);for(var i=0;i<n;++i){if(!equalPoint(coordinates[ia+(i+ka)%n],coordinates[ib+(i+kb)%n]))return false;}return true;}function reverseEqualRing(arcA,arcB){var ia=arcA[0],ib=arcB[0],ja=arcA[1],jb=arcB[1],n=ja-ia;if(n!==jb-ib)return false;var ka=findMinimumOffset(arcA),kb=n-findMinimumOffset(arcB);for(var i=0;i<n;++i){if(!equalPoint(coordinates[ia+(i+ka)%n],coordinates[jb-(i+kb)%n]))return false;}return true;}// Rings are rotated to a consistent, but arbitrary, start point.
// This is necessary to detect when a ring and a rotated copy are dupes.
function findMinimumOffset(arc){var start=arc[0],end=arc[1],mid=start,minimum=mid,minimumPoint=coordinates[mid];while(++mid<end){var point=coordinates[mid];if(point[0]<minimumPoint[0]||point[0]===minimumPoint[0]&&point[1]<minimumPoint[1]){minimum=mid;minimumPoint=point;}}return minimum-start;}return topology;};// Given an array of arcs in absolute (but already quantized!) coordinates,
// converts to fixed-point delta encoding.
// This is a destructive operation that modifies the given arcs!
var delta=function delta(arcs){var i=-1,n=arcs.length;while(++i<n){var arc=arcs[i],j=0,k=1,m=arc.length,point=arc[0],x0=point[0],y0=point[1],x1,y1;while(++j<m){point=arc[j],x1=point[0],y1=point[1];if(x1!==x0||y1!==y0)arc[k++]=[x1-x0,y1-y0],x0=x1,y0=y1;}if(k===1)arc[k++]=[0,0];// Each arc must be an array of two or more positions.
arc.length=k;}return arcs;};// Extracts the lines and rings from the specified hash of geometry objects.
//
// Returns an object with three properties:
//
// * coordinates - shared buffer of [x, y] coordinates
// * lines - lines extracted from the hash, of the form [start, end]
// * rings - rings extracted from the hash, of the form [start, end]
//
// For each ring or line, start and end represent inclusive indexes into the
// coordinates buffer. For rings (and closed lines), coordinates[start] equals
// coordinates[end].
//
// For each line or polygon geometry in the input hash, including nested
// geometries as in geometry collections, the `coordinates` array is replaced
// with an equivalent `arcs` array that, for each line (for line string
// geometries) or ring (for polygon geometries), points to one of the above
// lines or rings.
var extract=function extract(objects){var index=-1,lines=[],rings=[],coordinates=[];function extractGeometry(geometry){if(geometry&&extractGeometryType.hasOwnProperty(geometry.type))extractGeometryType[geometry.type](geometry);}var extractGeometryType={GeometryCollection:function GeometryCollection(o){o.geometries.forEach(extractGeometry);},LineString:function LineString(o){o.arcs=extractLine(o.arcs);},MultiLineString:function MultiLineString(o){o.arcs=o.arcs.map(extractLine);},Polygon:function Polygon(o){o.arcs=o.arcs.map(extractRing);},MultiPolygon:function MultiPolygon(o){o.arcs=o.arcs.map(extractMultiRing);}};function extractLine(line){for(var i=0,n=line.length;i<n;++i){coordinates[++index]=line[i];}var arc={0:index-n+1,1:index};lines.push(arc);return arc;}function extractRing(ring){for(var i=0,n=ring.length;i<n;++i){coordinates[++index]=ring[i];}var arc={0:index-n+1,1:index};rings.push(arc);return arc;}function extractMultiRing(rings){return rings.map(extractRing);}for(var key in objects){extractGeometry(objects[key]);}return{type:"Topology",coordinates:coordinates,lines:lines,rings:rings,objects:objects};};// Given a hash of GeoJSON objects, returns a hash of GeoJSON geometry objects.
// Any null input geometry objects are represented as {type: null} in the output.
// Any feature.{id,properties,bbox} are transferred to the output geometry object.
// Each output geometry object is a shallow copy of the input (e.g., properties, coordinates)!
var geometry=function geometry(inputs){var outputs={},key;for(key in inputs){outputs[key]=geomifyObject(inputs[key]);}return outputs;};function geomifyObject(input){return input==null?{type:null}:(input.type==="FeatureCollection"?geomifyFeatureCollection:input.type==="Feature"?geomifyFeature:geomifyGeometry)(input);}function geomifyFeatureCollection(input){var output={type:"GeometryCollection",geometries:input.features.map(geomifyFeature)};if(input.bbox!=null)output.bbox=input.bbox;return output;}function geomifyFeature(input){var output=geomifyGeometry(input.geometry),key;// eslint-disable-line no-unused-vars
if(input.id!=null)output.id=input.id;if(input.bbox!=null)output.bbox=input.bbox;for(key in input.properties){output.properties=input.properties;break;}return output;}function geomifyGeometry(input){if(input==null)return{type:null};var output=input.type==="GeometryCollection"?{type:"GeometryCollection",geometries:input.geometries.map(geomifyGeometry)}:input.type==="Point"||input.type==="MultiPoint"?{type:input.type,coordinates:input.coordinates}:{type:input.type,arcs:input.coordinates};// TODO Check for unknown types?
if(input.bbox!=null)output.bbox=input.bbox;return output;}var prequantize=function prequantize(objects,bbox,n){var x0=bbox[0],y0=bbox[1],x1=bbox[2],y1=bbox[3],kx=x1-x0?(n-1)/(x1-x0):1,ky=y1-y0?(n-1)/(y1-y0):1;function quantizePoint(input){return[Math.round((input[0]-x0)*kx),Math.round((input[1]-y0)*ky)];}function quantizePoints(input,m){var i=-1,j=0,n=input.length,output=new Array(n),// pessimistic
pi,px,py,x,y;while(++i<n){pi=input[i];x=Math.round((pi[0]-x0)*kx);y=Math.round((pi[1]-y0)*ky);if(x!==px||y!==py)output[j++]=[px=x,py=y];// non-coincident points
}output.length=j;while(j<m){j=output.push([output[0][0],output[0][1]]);}return output;}function quantizeLine(input){return quantizePoints(input,2);}function quantizeRing(input){return quantizePoints(input,4);}function quantizePolygon(input){return input.map(quantizeRing);}function quantizeGeometry(o){if(o!=null&&quantizeGeometryType.hasOwnProperty(o.type))quantizeGeometryType[o.type](o);}var quantizeGeometryType={GeometryCollection:function GeometryCollection(o){o.geometries.forEach(quantizeGeometry);},Point:function Point(o){o.coordinates=quantizePoint(o.coordinates);},MultiPoint:function MultiPoint(o){o.coordinates=o.coordinates.map(quantizePoint);},LineString:function LineString(o){o.arcs=quantizeLine(o.arcs);},MultiLineString:function MultiLineString(o){o.arcs=o.arcs.map(quantizeLine);},Polygon:function Polygon(o){o.arcs=quantizePolygon(o.arcs);},MultiPolygon:function MultiPolygon(o){o.arcs=o.arcs.map(quantizePolygon);}};for(var key in objects){quantizeGeometry(objects[key]);}return{scale:[1/kx,1/ky],translate:[x0,y0]};};// Constructs the TopoJSON Topology for the specified hash of features.
// Each object in the specified hash must be a GeoJSON object,
// meaning FeatureCollection, a Feature or a geometry object.
var topology=function topology(objects,quantization){var bbox=bounds(objects=geometry(objects)),transform=quantization>0&&bbox&&prequantize(objects,bbox,quantization),topology=dedup(cut(extract(objects))),coordinates=topology.coordinates,indexByArc=hashmap(topology.arcs.length*1.4,hashArc,equalArc);objects=topology.objects;// for garbage collection
topology.bbox=bbox;topology.arcs=topology.arcs.map(function(arc,i){indexByArc.set(arc,i);return coordinates.slice(arc[0],arc[1]+1);});delete topology.coordinates;coordinates=null;function indexGeometry(geometry$$1){if(geometry$$1&&indexGeometryType.hasOwnProperty(geometry$$1.type))indexGeometryType[geometry$$1.type](geometry$$1);}var indexGeometryType={GeometryCollection:function GeometryCollection(o){o.geometries.forEach(indexGeometry);},LineString:function LineString(o){o.arcs=indexArcs(o.arcs);},MultiLineString:function MultiLineString(o){o.arcs=o.arcs.map(indexArcs);},Polygon:function Polygon(o){o.arcs=o.arcs.map(indexArcs);},MultiPolygon:function MultiPolygon(o){o.arcs=o.arcs.map(indexMultiArcs);}};function indexArcs(arc){var indexes=[];do{var index=indexByArc.get(arc);indexes.push(arc[0]<arc[1]?index:~index);}while(arc=arc.next);return indexes;}function indexMultiArcs(arcs){return arcs.map(indexArcs);}for(var key in objects){indexGeometry(objects[key]);}if(transform){topology.transform=transform;topology.arcs=delta(topology.arcs);}return topology;};function hashArc(arc){var i=arc[0],j=arc[1],t;if(j<i)t=i,i=j,j=t;return i+31*j;}function equalArc(arcA,arcB){var ia=arcA[0],ja=arcA[1],ib=arcB[0],jb=arcB[1],t;if(ja<ia)t=ia,ia=ja,ja=t;if(jb<ib)t=ib,ib=jb,jb=t;return ia===ib&&ja===jb;}exports.topology=topology;Object.defineProperty(exports,'__esModule',{value:true});});});var topojsonClient=createCommonjsModule(function(module,exports){// https://github.com/topojson/topojson-client Version 3.0.0. Copyright 2017 Mike Bostock.
(function(global,factory){factory(exports);})(commonjsGlobal,function(exports){'use strict';var identity=function identity(x){return x;};var transform=function transform(_transform){if(_transform==null)return identity;var x0,y0,kx=_transform.scale[0],ky=_transform.scale[1],dx=_transform.translate[0],dy=_transform.translate[1];return function(input,i){if(!i)x0=y0=0;var j=2,n=input.length,output=new Array(n);output[0]=(x0+=input[0])*kx+dx;output[1]=(y0+=input[1])*ky+dy;while(j<n){output[j]=input[j],++j;}return output;};};var bbox=function bbox(topology){var t=transform(topology.transform),key,x0=Infinity,y0=x0,x1=-x0,y1=-x0;function bboxPoint(p){p=t(p);if(p[0]<x0)x0=p[0];if(p[0]>x1)x1=p[0];if(p[1]<y0)y0=p[1];if(p[1]>y1)y1=p[1];}function bboxGeometry(o){switch(o.type){case"GeometryCollection":o.geometries.forEach(bboxGeometry);break;case"Point":bboxPoint(o.coordinates);break;case"MultiPoint":o.coordinates.forEach(bboxPoint);break;}}topology.arcs.forEach(function(arc){var i=-1,n=arc.length,p;while(++i<n){p=t(arc[i],i);if(p[0]<x0)x0=p[0];if(p[0]>x1)x1=p[0];if(p[1]<y0)y0=p[1];if(p[1]>y1)y1=p[1];}});for(key in topology.objects){bboxGeometry(topology.objects[key]);}return[x0,y0,x1,y1];};var reverse=function reverse(array,n){var t,j=array.length,i=j-n;while(i<--j){t=array[i],array[i++]=array[j],array[j]=t;}};var feature=function feature(topology,o){return o.type==="GeometryCollection"?{type:"FeatureCollection",features:o.geometries.map(function(o){return feature$1(topology,o);})}:feature$1(topology,o);};function feature$1(topology,o){var id=o.id,bbox=o.bbox,properties=o.properties==null?{}:o.properties,geometry=object(topology,o);return id==null&&bbox==null?{type:"Feature",properties:properties,geometry:geometry}:bbox==null?{type:"Feature",id:id,properties:properties,geometry:geometry}:{type:"Feature",id:id,bbox:bbox,properties:properties,geometry:geometry};}function object(topology,o){var transformPoint=transform(topology.transform),arcs=topology.arcs;function arc(i,points){if(points.length)points.pop();for(var a=arcs[i<0?~i:i],k=0,n=a.length;k<n;++k){points.push(transformPoint(a[k],k));}if(i<0)reverse(points,n);}function point(p){return transformPoint(p);}function line(arcs){var points=[];for(var i=0,n=arcs.length;i<n;++i){arc(arcs[i],points);}if(points.length<2)points.push(points[0]);// This should never happen per the specification.
return points;}function ring(arcs){var points=line(arcs);while(points.length<4){points.push(points[0]);}// This may happen if an arc has only two points.
return points;}function polygon(arcs){return arcs.map(ring);}function geometry(o){var type=o.type,coordinates;switch(type){case"GeometryCollection":return{type:type,geometries:o.geometries.map(geometry)};case"Point":coordinates=point(o.coordinates);break;case"MultiPoint":coordinates=o.coordinates.map(point);break;case"LineString":coordinates=line(o.arcs);break;case"MultiLineString":coordinates=o.arcs.map(line);break;case"Polygon":coordinates=polygon(o.arcs);break;case"MultiPolygon":coordinates=o.arcs.map(polygon);break;default:return null;}return{type:type,coordinates:coordinates};}return geometry(o);}var stitch=function stitch(topology,arcs){var stitchedArcs={},fragmentByStart={},fragmentByEnd={},fragments=[],emptyIndex=-1;// Stitch empty arcs first, since they may be subsumed by other arcs.
arcs.forEach(function(i,j){var arc=topology.arcs[i<0?~i:i],t;if(arc.length<3&&!arc[1][0]&&!arc[1][1]){t=arcs[++emptyIndex],arcs[emptyIndex]=i,arcs[j]=t;}});arcs.forEach(function(i){var e=ends(i),start=e[0],end=e[1],f,g;if(f=fragmentByEnd[start]){delete fragmentByEnd[f.end];f.push(i);f.end=end;if(g=fragmentByStart[end]){delete fragmentByStart[g.start];var fg=g===f?f:f.concat(g);fragmentByStart[fg.start=f.start]=fragmentByEnd[fg.end=g.end]=fg;}else{fragmentByStart[f.start]=fragmentByEnd[f.end]=f;}}else if(f=fragmentByStart[end]){delete fragmentByStart[f.start];f.unshift(i);f.start=start;if(g=fragmentByEnd[start]){delete fragmentByEnd[g.end];var gf=g===f?f:g.concat(f);fragmentByStart[gf.start=g.start]=fragmentByEnd[gf.end=f.end]=gf;}else{fragmentByStart[f.start]=fragmentByEnd[f.end]=f;}}else{f=[i];fragmentByStart[f.start=start]=fragmentByEnd[f.end=end]=f;}});function ends(i){var arc=topology.arcs[i<0?~i:i],p0=arc[0],p1;if(topology.transform)p1=[0,0],arc.forEach(function(dp){p1[0]+=dp[0],p1[1]+=dp[1];});else p1=arc[arc.length-1];return i<0?[p1,p0]:[p0,p1];}function flush(fragmentByEnd,fragmentByStart){for(var k in fragmentByEnd){var f=fragmentByEnd[k];delete fragmentByStart[f.start];delete f.start;delete f.end;f.forEach(function(i){stitchedArcs[i<0?~i:i]=1;});fragments.push(f);}}flush(fragmentByEnd,fragmentByStart);flush(fragmentByStart,fragmentByEnd);arcs.forEach(function(i){if(!stitchedArcs[i<0?~i:i])fragments.push([i]);});return fragments;};var mesh=function mesh(topology){return object(topology,meshArcs.apply(this,arguments));};function meshArcs(topology,object$$1,filter){var arcs,i,n;if(arguments.length>1)arcs=extractArcs(topology,object$$1,filter);else for(i=0,arcs=new Array(n=topology.arcs.length);i<n;++i){arcs[i]=i;}return{type:"MultiLineString",arcs:stitch(topology,arcs)};}function extractArcs(topology,object$$1,filter){var arcs=[],geomsByArc=[],geom;function extract0(i){var j=i<0?~i:i;(geomsByArc[j]||(geomsByArc[j]=[])).push({i:i,g:geom});}function extract1(arcs){arcs.forEach(extract0);}function extract2(arcs){arcs.forEach(extract1);}function extract3(arcs){arcs.forEach(extract2);}function geometry(o){switch(geom=o,o.type){case"GeometryCollection":o.geometries.forEach(geometry);break;case"LineString":extract1(o.arcs);break;case"MultiLineString":case"Polygon":extract2(o.arcs);break;case"MultiPolygon":extract3(o.arcs);break;}}geometry(object$$1);geomsByArc.forEach(filter==null?function(geoms){arcs.push(geoms[0].i);}:function(geoms){if(filter(geoms[0].g,geoms[geoms.length-1].g))arcs.push(geoms[0].i);});return arcs;}function planarRingArea(ring){var i=-1,n=ring.length,a,b=ring[n-1],area=0;while(++i<n){a=b,b=ring[i],area+=a[0]*b[1]-a[1]*b[0];}return Math.abs(area);// Note: doubled area!
}var merge=function merge(topology){return object(topology,mergeArcs.apply(this,arguments));};function mergeArcs(topology,objects){var polygonsByArc={},polygons=[],groups=[];objects.forEach(geometry);function geometry(o){switch(o.type){case"GeometryCollection":o.geometries.forEach(geometry);break;case"Polygon":extract(o.arcs);break;case"MultiPolygon":o.arcs.forEach(extract);break;}}function extract(polygon){polygon.forEach(function(ring){ring.forEach(function(arc){(polygonsByArc[arc=arc<0?~arc:arc]||(polygonsByArc[arc]=[])).push(polygon);});});polygons.push(polygon);}function area(ring){return planarRingArea(object(topology,{type:"Polygon",arcs:[ring]}).coordinates[0]);}polygons.forEach(function(polygon){if(!polygon._){var group=[],neighbors=[polygon];polygon._=1;groups.push(group);while(polygon=neighbors.pop()){group.push(polygon);polygon.forEach(function(ring){ring.forEach(function(arc){polygonsByArc[arc<0?~arc:arc].forEach(function(polygon){if(!polygon._){polygon._=1;neighbors.push(polygon);}});});});}}});polygons.forEach(function(polygon){delete polygon._;});return{type:"MultiPolygon",arcs:groups.map(function(polygons){var arcs=[],n;// Extract the exterior (unique) arcs.
polygons.forEach(function(polygon){polygon.forEach(function(ring){ring.forEach(function(arc){if(polygonsByArc[arc<0?~arc:arc].length<2){arcs.push(arc);}});});});// Stitch the arcs into one or more rings.
arcs=stitch(topology,arcs);// If more than one ring is returned,
// at most one of these rings can be the exterior;
// choose the one with the greatest absolute area.
if((n=arcs.length)>1){for(var i=1,k=area(arcs[0]),ki,t;i<n;++i){if((ki=area(arcs[i]))>k){t=arcs[0],arcs[0]=arcs[i],arcs[i]=t,k=ki;}}}return arcs;})};}var bisect=function bisect(a,x){var lo=0,hi=a.length;while(lo<hi){var mid=lo+hi>>>1;if(a[mid]<x)lo=mid+1;else hi=mid;}return lo;};var neighbors=function neighbors(objects){var indexesByArc={},// arc index -> array of object indexes
neighbors=objects.map(function(){return[];});function line(arcs,i){arcs.forEach(function(a){if(a<0)a=~a;var o=indexesByArc[a];if(o)o.push(i);else indexesByArc[a]=[i];});}function polygon(arcs,i){arcs.forEach(function(arc){line(arc,i);});}function geometry(o,i){if(o.type==="GeometryCollection")o.geometries.forEach(function(o){geometry(o,i);});else if(o.type in geometryType)geometryType[o.type](o.arcs,i);}var geometryType={LineString:line,MultiLineString:polygon,Polygon:polygon,MultiPolygon:function MultiPolygon(arcs,i){arcs.forEach(function(arc){polygon(arc,i);});}};objects.forEach(geometry);for(var i in indexesByArc){for(var indexes=indexesByArc[i],m=indexes.length,j=0;j<m;++j){for(var k=j+1;k<m;++k){var ij=indexes[j],ik=indexes[k],n;if((n=neighbors[ij])[i=bisect(n,ik)]!==ik)n.splice(i,0,ik);if((n=neighbors[ik])[i=bisect(n,ij)]!==ij)n.splice(i,0,ij);}}}return neighbors;};var untransform=function untransform(transform){if(transform==null)return identity;var x0,y0,kx=transform.scale[0],ky=transform.scale[1],dx=transform.translate[0],dy=transform.translate[1];return function(input,i){if(!i)x0=y0=0;var j=2,n=input.length,output=new Array(n),x1=Math.round((input[0]-dx)/kx),y1=Math.round((input[1]-dy)/ky);output[0]=x1-x0,x0=x1;output[1]=y1-y0,y0=y1;while(j<n){output[j]=input[j],++j;}return output;};};var quantize=function quantize(topology,transform){if(topology.transform)throw new Error("already quantized");if(!transform||!transform.scale){if(!((n=Math.floor(transform))>=2))throw new Error("n must be ≥2");box=topology.bbox||bbox(topology);var x0=box[0],y0=box[1],x1=box[2],y1=box[3],n;transform={scale:[x1-x0?(x1-x0)/(n-1):1,y1-y0?(y1-y0)/(n-1):1],translate:[x0,y0]};}else{box=topology.bbox;}var t=untransform(transform),box,key,inputs=topology.objects,outputs={};function quantizePoint(point){return t(point);}function quantizeGeometry(input){var output;switch(input.type){case"GeometryCollection":output={type:"GeometryCollection",geometries:input.geometries.map(quantizeGeometry)};break;case"Point":output={type:"Point",coordinates:quantizePoint(input.coordinates)};break;case"MultiPoint":output={type:"MultiPoint",coordinates:input.coordinates.map(quantizePoint)};break;default:return input;}if(input.id!=null)output.id=input.id;if(input.bbox!=null)output.bbox=input.bbox;if(input.properties!=null)output.properties=input.properties;return output;}function quantizeArc(input){var i=0,j=1,n=input.length,p,output=new Array(n);// pessimistic
output[0]=t(input[0],0);while(++i<n){if((p=t(input[i],i))[0]||p[1])output[j++]=p;}// non-coincident points
if(j===1)output[j++]=[0,0];// an arc must have at least two points
output.length=j;return output;}for(key in inputs){outputs[key]=quantizeGeometry(inputs[key]);}return{type:"Topology",bbox:box,transform:transform,objects:outputs,arcs:topology.arcs.map(quantizeArc)};};exports.bbox=bbox;exports.feature=feature;exports.mesh=mesh;exports.meshArcs=meshArcs;exports.merge=merge;exports.mergeArcs=mergeArcs;exports.neighbors=neighbors;exports.quantize=quantize;exports.transform=transform;exports.untransform=untransform;Object.defineProperty(exports,'__esModule',{value:true});});});var geojsonLinestringDissolve=mergeViableLineStrings;// [Number, Number] -> String
function coordId(coord){return coord[0].toString()+','+coord[1].toString();}// LineString, LineString -> LineString
function mergeLineStrings(a,b){var s1=coordId(a.coordinates[0]);var e1=coordId(a.coordinates[a.coordinates.length-1]);var s2=coordId(b.coordinates[0]);var e2=coordId(b.coordinates[b.coordinates.length-1]);// TODO: handle case where more than one of these is true!
var coords;if(s1===e2){coords=b.coordinates.concat(a.coordinates.slice(1));}else if(s2===e1){coords=a.coordinates.concat(b.coordinates.slice(1));}else if(s1===s2){coords=a.coordinates.slice(1).reverse().concat(b.coordinates);}else if(e1===e2){coords=a.coordinates.concat(b.coordinates.reverse().slice(1));}else{return null;}return{type:'LineString',coordinates:coords};}// Merges all connected (non-forking, non-junctioning) line strings into single
// line strings.
// [LineString] -> LineString|MultiLineString
function mergeViableLineStrings(geoms){// TODO: assert all are linestrings
var lineStrings=geoms.slice();var result=[];while(lineStrings.length>0){var ls=lineStrings.shift();// Attempt to merge this LineString with the other LineStrings, updating
// the reference as it is merged with others and grows.
lineStrings=lineStrings.reduce(function(accum,cur){var merged=mergeLineStrings(ls,cur);if(merged){// Accumulate the merged LineString
ls=merged;}else{// Put the unmerged LineString back into the list
accum.push(cur);}return accum;},[]);result.push(ls);}if(result.length===1){result=result[0];}else{result={type:'MultiLineString',coordinates:result.map(function(ls){return ls.coordinates;})};}return result;}/**
 * Callback for coordEach
 *
 * @private
 * @callback coordEachCallback
 * @param {[number, number]} currentCoords The current coordinates being processed.
 * @param {number} currentIndex The index of the current element being processed in the
 * array.Starts at index 0, if an initialValue is provided, and at index 1 otherwise.
 *//**
 * Iterate over coordinates in any GeoJSON object, similar to Array.forEach()
 *
 * @name coordEach
 * @param {Object} layer any GeoJSON object
 * @param {Function} callback a method that takes (currentCoords, currentIndex)
 * @param {boolean} [excludeWrapCoord=false] whether or not to include
 * the final coordinate of LinearRings that wraps the ring in its iteration.
 * @example
 * var features = {
 *   "type": "FeatureCollection",
 *   "features": [
 *     {
 *       "type": "Feature",
 *       "properties": {},
 *       "geometry": {
 *         "type": "Point",
 *         "coordinates": [26, 37]
 *       }
 *     },
 *     {
 *       "type": "Feature",
 *       "properties": {},
 *       "geometry": {
 *         "type": "Point",
 *         "coordinates": [36, 53]
 *       }
 *     }
 *   ]
 * };
 * turf.coordEach(features, function (currentCoords, currentIndex) {
 *   //=currentCoords
 *   //=currentIndex
 * });
 */function coordEach$2(layer,callback,excludeWrapCoord){var i,j,k,g,l,geometry,stopG,coords,geometryMaybeCollection,wrapShrink=0,currentIndex=0,isGeometryCollection,isFeatureCollection=layer.type==='FeatureCollection',isFeature=layer.type==='Feature',stop=isFeatureCollection?layer.features.length:1;// This logic may look a little weird. The reason why it is that way
// is because it's trying to be fast. GeoJSON supports multiple kinds
// of objects at its root: FeatureCollection, Features, Geometries.
// This function has the responsibility of handling all of them, and that
// means that some of the `for` loops you see below actually just don't apply
// to certain inputs. For instance, if you give this just a
// Point geometry, then both loops are short-circuited and all we do
// is gradually rename the input until it's called 'geometry'.
//
// This also aims to allocate as few resources as possible: just a
// few numbers and booleans, rather than any temporary arrays as would
// be required with the normalization approach.
for(i=0;i<stop;i++){geometryMaybeCollection=isFeatureCollection?layer.features[i].geometry:isFeature?layer.geometry:layer;isGeometryCollection=geometryMaybeCollection.type==='GeometryCollection';stopG=isGeometryCollection?geometryMaybeCollection.geometries.length:1;for(g=0;g<stopG;g++){geometry=isGeometryCollection?geometryMaybeCollection.geometries[g]:geometryMaybeCollection;coords=geometry.coordinates;wrapShrink=excludeWrapCoord&&(geometry.type==='Polygon'||geometry.type==='MultiPolygon')?1:0;if(geometry.type==='Point'){callback(coords,currentIndex);currentIndex++;}else if(geometry.type==='LineString'||geometry.type==='MultiPoint'){for(j=0;j<coords.length;j++){callback(coords[j],currentIndex);currentIndex++;}}else if(geometry.type==='Polygon'||geometry.type==='MultiLineString'){for(j=0;j<coords.length;j++){for(k=0;k<coords[j].length-wrapShrink;k++){callback(coords[j][k],currentIndex);currentIndex++;}}}else if(geometry.type==='MultiPolygon'){for(j=0;j<coords.length;j++){for(k=0;k<coords[j].length;k++){for(l=0;l<coords[j][k].length-wrapShrink;l++){callback(coords[j][k][l],currentIndex);currentIndex++;}}}}else if(geometry.type==='GeometryCollection'){for(j=0;j<geometry.geometries.length;j++){coordEach$2(geometry.geometries[j],callback,excludeWrapCoord);}}else{throw new Error('Unknown Geometry Type');}}}}var coordEach_1=coordEach$2;/**
 * Callback for coordReduce
 *
 * The first time the callback function is called, the values provided as arguments depend
 * on whether the reduce method has an initialValue argument.
 *
 * If an initialValue is provided to the reduce method:
 *  - The previousValue argument is initialValue.
 *  - The currentValue argument is the value of the first element present in the array.
 *
 * If an initialValue is not provided:
 *  - The previousValue argument is the value of the first element present in the array.
 *  - The currentValue argument is the value of the second element present in the array.
 *
 * @private
 * @callback coordReduceCallback
 * @param {*} previousValue The accumulated value previously returned in the last invocation
 * of the callback, or initialValue, if supplied.
 * @param {[number, number]} currentCoords The current coordinate being processed.
 * @param {number} currentIndex The index of the current element being processed in the
 * array.Starts at index 0, if an initialValue is provided, and at index 1 otherwise.
 *//**
 * Reduce coordinates in any GeoJSON object, similar to Array.reduce()
 *
 * @name coordReduce
 * @param {Object} layer any GeoJSON object
 * @param {Function} callback a method that takes (previousValue, currentCoords, currentIndex)
 * @param {*} [initialValue] Value to use as the first argument to the first call of the callback.
 * @param {boolean} [excludeWrapCoord=false] whether or not to include
 * the final coordinate of LinearRings that wraps the ring in its iteration.
 * @returns {*} The value that results from the reduction.
 * @example
 * var features = {
 *   "type": "FeatureCollection",
 *   "features": [
 *     {
 *       "type": "Feature",
 *       "properties": {},
 *       "geometry": {
 *         "type": "Point",
 *         "coordinates": [26, 37]
 *       }
 *     },
 *     {
 *       "type": "Feature",
 *       "properties": {},
 *       "geometry": {
 *         "type": "Point",
 *         "coordinates": [36, 53]
 *       }
 *     }
 *   ]
 * };
 * turf.coordReduce(features, function (previousValue, currentCoords, currentIndex) {
 *   //=previousValue
 *   //=currentCoords
 *   //=currentIndex
 *   return currentCoords;
 * });
 */function coordReduce$1(layer,callback,initialValue,excludeWrapCoord){var previousValue=initialValue;coordEach$2(layer,function(currentCoords,currentIndex){if(currentIndex===0&&initialValue===undefined){previousValue=currentCoords;}else{previousValue=callback(previousValue,currentCoords,currentIndex);}},excludeWrapCoord);return previousValue;}var coordReduce_1=coordReduce$1;/**
 * Callback for propEach
 *
 * @private
 * @callback propEachCallback
 * @param {*} currentProperties The current properties being processed.
 * @param {number} currentIndex The index of the current element being processed in the
 * array.Starts at index 0, if an initialValue is provided, and at index 1 otherwise.
 *//**
 * Iterate over properties in any GeoJSON object, similar to Array.forEach()
 *
 * @name propEach
 * @param {Object} layer any GeoJSON object
 * @param {Function} callback a method that takes (currentProperties, currentIndex)
 * @example
 * var features = {
 *   "type": "FeatureCollection",
 *   "features": [
 *     {
 *       "type": "Feature",
 *       "properties": {"foo": "bar"},
 *       "geometry": {
 *         "type": "Point",
 *         "coordinates": [26, 37]
 *       }
 *     },
 *     {
 *       "type": "Feature",
 *       "properties": {"hello": "world"},
 *       "geometry": {
 *         "type": "Point",
 *         "coordinates": [36, 53]
 *       }
 *     }
 *   ]
 * };
 * turf.propEach(features, function (currentProperties, currentIndex) {
 *   //=currentProperties
 *   //=currentIndex
 * });
 */function propEach$1(layer,callback){var i;switch(layer.type){case'FeatureCollection':for(i=0;i<layer.features.length;i++){callback(layer.features[i].properties,i);}break;case'Feature':callback(layer.properties,0);break;}}var propEach_1=propEach$1;/**
 * Callback for propReduce
 *
 * The first time the callback function is called, the values provided as arguments depend
 * on whether the reduce method has an initialValue argument.
 *
 * If an initialValue is provided to the reduce method:
 *  - The previousValue argument is initialValue.
 *  - The currentValue argument is the value of the first element present in the array.
 *
 * If an initialValue is not provided:
 *  - The previousValue argument is the value of the first element present in the array.
 *  - The currentValue argument is the value of the second element present in the array.
 *
 * @private
 * @callback propReduceCallback
 * @param {*} previousValue The accumulated value previously returned in the last invocation
 * of the callback, or initialValue, if supplied.
 * @param {*} currentProperties The current properties being processed.
 * @param {number} currentIndex The index of the current element being processed in the
 * array.Starts at index 0, if an initialValue is provided, and at index 1 otherwise.
 *//**
 * Reduce properties in any GeoJSON object into a single value,
 * similar to how Array.reduce works. However, in this case we lazily run
 * the reduction, so an array of all properties is unnecessary.
 *
 * @name propReduce
 * @param {Object} layer any GeoJSON object
 * @param {Function} callback a method that takes (previousValue, currentProperties, currentIndex)
 * @param {*} [initialValue] Value to use as the first argument to the first call of the callback.
 * @returns {*} The value that results from the reduction.
 * @example
 * var features = {
 *   "type": "FeatureCollection",
 *   "features": [
 *     {
 *       "type": "Feature",
 *       "properties": {"foo": "bar"},
 *       "geometry": {
 *         "type": "Point",
 *         "coordinates": [26, 37]
 *       }
 *     },
 *     {
 *       "type": "Feature",
 *       "properties": {"hello": "world"},
 *       "geometry": {
 *         "type": "Point",
 *         "coordinates": [36, 53]
 *       }
 *     }
 *   ]
 * };
 * turf.propReduce(features, function (previousValue, currentProperties, currentIndex) {
 *   //=previousValue
 *   //=currentProperties
 *   //=currentIndex
 *   return currentProperties
 * });
 */function propReduce$1(layer,callback,initialValue){var previousValue=initialValue;propEach$1(layer,function(currentProperties,currentIndex){if(currentIndex===0&&initialValue===undefined){previousValue=currentProperties;}else{previousValue=callback(previousValue,currentProperties,currentIndex);}});return previousValue;}var propReduce_1=propReduce$1;/**
 * Callback for featureEach
 *
 * @private
 * @callback featureEachCallback
 * @param {Feature<any>} currentFeature The current feature being processed.
 * @param {number} currentIndex The index of the current element being processed in the
 * array.Starts at index 0, if an initialValue is provided, and at index 1 otherwise.
 *//**
 * Iterate over features in any GeoJSON object, similar to
 * Array.forEach.
 *
 * @name featureEach
 * @param {Object} layer any GeoJSON object
 * @param {Function} callback a method that takes (currentFeature, currentIndex)
 * @example
 * var features = {
 *   "type": "FeatureCollection",
 *   "features": [
 *     {
 *       "type": "Feature",
 *       "properties": {},
 *       "geometry": {
 *         "type": "Point",
 *         "coordinates": [26, 37]
 *       }
 *     },
 *     {
 *       "type": "Feature",
 *       "properties": {},
 *       "geometry": {
 *         "type": "Point",
 *         "coordinates": [36, 53]
 *       }
 *     }
 *   ]
 * };
 * turf.featureEach(features, function (currentFeature, currentIndex) {
 *   //=currentFeature
 *   //=currentIndex
 * });
 */function featureEach$2(layer,callback){if(layer.type==='Feature'){callback(layer,0);}else if(layer.type==='FeatureCollection'){for(var i=0;i<layer.features.length;i++){callback(layer.features[i],i);}}}var featureEach_1=featureEach$2;/**
 * Callback for featureReduce
 *
 * The first time the callback function is called, the values provided as arguments depend
 * on whether the reduce method has an initialValue argument.
 *
 * If an initialValue is provided to the reduce method:
 *  - The previousValue argument is initialValue.
 *  - The currentValue argument is the value of the first element present in the array.
 *
 * If an initialValue is not provided:
 *  - The previousValue argument is the value of the first element present in the array.
 *  - The currentValue argument is the value of the second element present in the array.
 *
 * @private
 * @callback featureReduceCallback
 * @param {*} previousValue The accumulated value previously returned in the last invocation
 * of the callback, or initialValue, if supplied.
 * @param {Feature<any>} currentFeature The current Feature being processed.
 * @param {number} currentIndex The index of the current element being processed in the
 * array.Starts at index 0, if an initialValue is provided, and at index 1 otherwise.
 *//**
 * Reduce features in any GeoJSON object, similar to Array.reduce().
 *
 * @name featureReduce
 * @param {Object} layer any GeoJSON object
 * @param {Function} callback a method that takes (previousValue, currentFeature, currentIndex)
 * @param {*} [initialValue] Value to use as the first argument to the first call of the callback.
 * @returns {*} The value that results from the reduction.
 * @example
 * var features = {
 *   "type": "FeatureCollection",
 *   "features": [
 *     {
 *       "type": "Feature",
 *       "properties": {"foo": "bar"},
 *       "geometry": {
 *         "type": "Point",
 *         "coordinates": [26, 37]
 *       }
 *     },
 *     {
 *       "type": "Feature",
 *       "properties": {"hello": "world"},
 *       "geometry": {
 *         "type": "Point",
 *         "coordinates": [36, 53]
 *       }
 *     }
 *   ]
 * };
 * turf.featureReduce(features, function (previousValue, currentFeature, currentIndex) {
 *   //=previousValue
 *   //=currentFeature
 *   //=currentIndex
 *   return currentFeature
 * });
 */function featureReduce$1(layer,callback,initialValue){var previousValue=initialValue;featureEach$2(layer,function(currentFeature,currentIndex){if(currentIndex===0&&initialValue===undefined){previousValue=currentFeature;}else{previousValue=callback(previousValue,currentFeature,currentIndex);}});return previousValue;}var featureReduce_1=featureReduce$1;/**
 * Get all coordinates from any GeoJSON object.
 *
 * @name coordAll
 * @param {Object} layer any GeoJSON object
 * @returns {Array<Array<number>>} coordinate position array
 * @example
 * var features = {
 *   "type": "FeatureCollection",
 *   "features": [
 *     {
 *       "type": "Feature",
 *       "properties": {},
 *       "geometry": {
 *         "type": "Point",
 *         "coordinates": [26, 37]
 *       }
 *     },
 *     {
 *       "type": "Feature",
 *       "properties": {},
 *       "geometry": {
 *         "type": "Point",
 *         "coordinates": [36, 53]
 *       }
 *     }
 *   ]
 * };
 * var coords = turf.coordAll(features);
 * //=coords
 */function coordAll$1(layer){var coords=[];coordEach$2(layer,function(coord){coords.push(coord);});return coords;}var coordAll_1=coordAll$1;/**
 * Iterate over each geometry in any GeoJSON object, similar to Array.forEach()
 *
 * @name geomEach
 * @param {Object} layer any GeoJSON object
 * @param {Function} callback a method that takes (currentGeometry, currentIndex)
 * @example
 * var features = {
 *   "type": "FeatureCollection",
 *   "features": [
 *     {
 *       "type": "Feature",
 *       "properties": {},
 *       "geometry": {
 *         "type": "Point",
 *         "coordinates": [26, 37]
 *       }
 *     },
 *     {
 *       "type": "Feature",
 *       "properties": {},
 *       "geometry": {
 *         "type": "Point",
 *         "coordinates": [36, 53]
 *       }
 *     }
 *   ]
 * };
 * turf.geomEach(features, function (currentGeometry, currentIndex) {
 *   //=currentGeometry
 *   //=currentIndex
 * });
 */function geomEach$2(layer,callback){var i,j,g,geometry,stopG,geometryMaybeCollection,isGeometryCollection,currentIndex=0,isFeatureCollection=layer.type==='FeatureCollection',isFeature=layer.type==='Feature',stop=isFeatureCollection?layer.features.length:1;// This logic may look a little weird. The reason why it is that way
// is because it's trying to be fast. GeoJSON supports multiple kinds
// of objects at its root: FeatureCollection, Features, Geometries.
// This function has the responsibility of handling all of them, and that
// means that some of the `for` loops you see below actually just don't apply
// to certain inputs. For instance, if you give this just a
// Point geometry, then both loops are short-circuited and all we do
// is gradually rename the input until it's called 'geometry'.
//
// This also aims to allocate as few resources as possible: just a
// few numbers and booleans, rather than any temporary arrays as would
// be required with the normalization approach.
for(i=0;i<stop;i++){geometryMaybeCollection=isFeatureCollection?layer.features[i].geometry:isFeature?layer.geometry:layer;isGeometryCollection=geometryMaybeCollection.type==='GeometryCollection';stopG=isGeometryCollection?geometryMaybeCollection.geometries.length:1;for(g=0;g<stopG;g++){geometry=isGeometryCollection?geometryMaybeCollection.geometries[g]:geometryMaybeCollection;if(geometry.type==='Point'||geometry.type==='LineString'||geometry.type==='MultiPoint'||geometry.type==='Polygon'||geometry.type==='MultiLineString'||geometry.type==='MultiPolygon'){callback(geometry,currentIndex);currentIndex++;}else if(geometry.type==='GeometryCollection'){for(j=0;j<geometry.geometries.length;j++){callback(geometry.geometries[j],currentIndex);currentIndex++;}}else{throw new Error('Unknown Geometry Type');}}}}var geomEach_1=geomEach$2;/**
 * Callback for geomReduce
 *
 * The first time the callback function is called, the values provided as arguments depend
 * on whether the reduce method has an initialValue argument.
 *
 * If an initialValue is provided to the reduce method:
 *  - The previousValue argument is initialValue.
 *  - The currentValue argument is the value of the first element present in the array.
 *
 * If an initialValue is not provided:
 *  - The previousValue argument is the value of the first element present in the array.
 *  - The currentValue argument is the value of the second element present in the array.
 *
 * @private
 * @callback geomReduceCallback
 * @param {*} previousValue The accumulated value previously returned in the last invocation
 * of the callback, or initialValue, if supplied.
 * @param {*} currentGeometry The current Feature being processed.
 * @param {number} currentIndex The index of the current element being processed in the
 * array.Starts at index 0, if an initialValue is provided, and at index 1 otherwise.
 *//**
 * Reduce geometry in any GeoJSON object, similar to Array.reduce().
 *
 * @name geomReduce
 * @param {Object} layer any GeoJSON object
 * @param {Function} callback a method that takes (previousValue, currentGeometry, currentIndex)
 * @param {*} [initialValue] Value to use as the first argument to the first call of the callback.
 * @returns {*} The value that results from the reduction.
 * @example
 * var features = {
 *   "type": "FeatureCollection",
 *   "features": [
 *     {
 *       "type": "Feature",
 *       "properties": {"foo": "bar"},
 *       "geometry": {
 *         "type": "Point",
 *         "coordinates": [26, 37]
 *       }
 *     },
 *     {
 *       "type": "Feature",
 *       "properties": {"hello": "world"},
 *       "geometry": {
 *         "type": "Point",
 *         "coordinates": [36, 53]
 *       }
 *     }
 *   ]
 * };
 * turf.geomReduce(features, function (previousValue, currentGeometry, currentIndex) {
 *   //=previousValue
 *   //=currentGeometry
 *   //=currentIndex
 *   return currentGeometry
 * });
 */function geomReduce$1(layer,callback,initialValue){var previousValue=initialValue;geomEach$2(layer,function(currentGeometry,currentIndex){if(currentIndex===0&&initialValue===undefined){previousValue=currentGeometry;}else{previousValue=callback(previousValue,currentGeometry,currentIndex);}});return previousValue;}var geomReduce_1=geomReduce$1;var meta$4={coordEach:coordEach_1,coordReduce:coordReduce_1,propEach:propEach_1,propReduce:propReduce_1,featureEach:featureEach_1,featureReduce:featureReduce_1,coordAll:coordAll_1,geomEach:geomEach_1,geomReduce:geomReduce_1};function flatten(gj){switch(gj&&gj.type||null){case'FeatureCollection':gj.features=gj.features.reduce(function(mem,feature){return mem.concat(flatten(feature));},[]);return gj;case'Feature':if(!gj.geometry)return gj;return flatten(gj.geometry).map(function(geom){return{type:'Feature',properties:JSON.parse(JSON.stringify(gj.properties)),geometry:geom};});case'MultiPoint':return gj.coordinates.map(function(_){return{type:'Point',coordinates:_};});case'MultiPolygon':return gj.coordinates.map(function(_){return{type:'Polygon',coordinates:_};});case'MultiLineString':return gj.coordinates.map(function(_){return{type:'LineString',coordinates:_};});case'GeometryCollection':return gj.geometries.map(flatten).reduce(function(memo,geoms){return memo.concat(geoms);},[]);case'Point':case'Polygon':case'LineString':return[gj];}}var geojsonFlatten=flatten;var createTopology=topojsonServer.topology;var mergeTopology=topojsonClient.merge;var geomEach$1=meta$4.geomEach;var geojsonDissolve=dissolve;function toArray$1(args){if(!args.length)return[];return Array.isArray(args[0])?args[0]:Array.prototype.slice.call(args);}function dissolvePolygons(geoms){// Topojson modifies in place, so we need to deep clone first
var objects={geoms:{type:'GeometryCollection',geometries:JSON.parse(JSON.stringify(geoms))}};var topo=createTopology(objects);return mergeTopology(topo,topo.objects.geoms.geometries);}// [GeoJSON] -> String|Null
function getHomogenousType(geoms){var type=null;for(var i=0;i<geoms.length;i++){if(!type){type=geoms[i].type;}else if(type!==geoms[i].type){return null;}}return type;}// Transform function: attempts to dissolve geojson objects where possible
// [GeoJSON] -> GeoJSON geometry
function dissolve(){// accept an array of geojson objects, or an argument list
var objects=toArray$1(arguments);var geoms=objects.reduce(function(acc,o){// flatten any Multi-geom into features of simple types
var flat=geojsonFlatten(o);if(!Array.isArray(flat))flat=[flat];for(var i=0;i<flat.length;i++){// get an array of all flatten geometry objects
geomEach$1(flat[i],function(geom){acc.push(geom);});}return acc;},[]);// Assert homogenity
var type=getHomogenousType(geoms);if(!type){throw new Error('List does not contain only homoegenous GeoJSON');}switch(type){case'LineString':return geojsonLinestringDissolve(geoms);case'Polygon':return dissolvePolygons(geoms);default:return geoms;}}//http://en.wikipedia.org/wiki/Haversine_formula
//http://www.movable-type.co.uk/scripts/latlong.html
/**
 * Calculates the distance between two {@link Point|points} in degrees, radians,
 * miles, or kilometers. This uses the
 * [Haversine formula](http://en.wikipedia.org/wiki/Haversine_formula)
 * to account for global curvature.
 *
 * @name distance
 * @param {Geometry|Feature<Point>|Array<number>} from origin point
 * @param {Geometry|Feature<Point>|Array<number>} to destination point
 * @param {Object} [options={}] Optional parameters
 * @param {string} [options.units='kilometers'] can be degrees, radians, miles, or kilometers
 * @returns {number} distance between the two points
 * @example
 * var from = turf.point([-75.343, 39.984]);
 * var to = turf.point([-75.534, 39.123]);
 * var options = {units: 'miles'};
 *
 * var distance = turf.distance(from, to, options);
 *
 * //addToMap
 * var addToMap = [from, to];
 * from.properties.distance = distance;
 * to.properties.distance = distance;
 */function distance(from,to,options){// Optional parameters
options=options||{};if(!isObject$2(options))throw new Error('options is invalid');var units=options.units;var degrees2radians$$1=Math.PI/180;var coordinates1=getCoord(from);var coordinates2=getCoord(to);var dLat=degrees2radians$$1*(coordinates2[1]-coordinates1[1]);var dLon=degrees2radians$$1*(coordinates2[0]-coordinates1[0]);var lat1=degrees2radians$$1*coordinates1[1];var lat2=degrees2radians$$1*coordinates2[1];var a=Math.pow(Math.sin(dLat/2),2)+Math.pow(Math.sin(dLon/2),2)*Math.cos(lat1)*Math.cos(lat2);return radiansToDistance(2*Math.atan2(Math.sqrt(a),Math.sqrt(1-a)),units);}/**
 * Takes a set of {@link Point|points} and returns a concave hull Polygon or MultiPolygon.
 * Internally, this uses [turf-tin](https://github.com/Turfjs/turf-tin) to generate geometries.
 *
 * @name concave
 * @param {FeatureCollection<Point>} points input points
 * @param {Object} [options={}] Optional parameters
 * @param {number} [options.maxEdge=Infinity] the length (in 'units') of an edge necessary for part of the hull to become concave.
 * @param {string} [options.units='kilometers'] can be degrees, radians, miles, or kilometers
 * @returns {Feature<(Polygon|MultiPolygon)>|null} a concave hull (null value is returned if unable to compute hull)
 * @example
 * var points = turf.featureCollection([
 *   turf.point([-63.601226, 44.642643]),
 *   turf.point([-63.591442, 44.651436]),
 *   turf.point([-63.580799, 44.648749]),
 *   turf.point([-63.573589, 44.641788]),
 *   turf.point([-63.587665, 44.64533]),
 *   turf.point([-63.595218, 44.64765])
 * ]);
 * var options = {units: 'miles', maxEdge: 1};
 *
 * var hull = turf.concave(points, options);
 *
 * //addToMap
 * var addToMap = [points, hull]
 */function concave(points,options){// Optional parameters
options=options||{};if(!isObject$2(options))throw new Error('options is invalid');// validation
if(!points)throw new Error('points is required');var maxEdge=options.maxEdge||Infinity;if(!isNumber(maxEdge))throw new Error('maxEdge is invalid');var cleaned=removeDuplicates(points);var tinPolys=tin(cleaned);// calculate length of all edges and area of all triangles
// and remove triangles that fail the max length test
tinPolys.features=tinPolys.features.filter(function(triangle){var pt1=triangle.geometry.coordinates[0][0];var pt2=triangle.geometry.coordinates[0][1];var pt3=triangle.geometry.coordinates[0][2];var dist1=distance(pt1,pt2,options);var dist2=distance(pt2,pt3,options);var dist3=distance(pt1,pt3,options);return dist1<=maxEdge&&dist2<=maxEdge&&dist3<=maxEdge;});if(tinPolys.features.length<1)return null;// merge the adjacent triangles
var dissolved=geojsonDissolve(tinPolys.features);// geojson-dissolve always returns a MultiPolygon
if(dissolved.coordinates.length===1){dissolved.coordinates=dissolved.coordinates[0];dissolved.type='Polygon';}return feature(dissolved);}/**
 * Removes duplicated points in a collection returning a new collection
 *
 * @private
 * @param {FeatureCollection<Point>} points to be cleaned
 * @returns {FeatureCollection<Point>} cleaned set of points
 */function removeDuplicates(points){var cleaned=[];var existing={};featureEach(points,function(pt){if(!pt.geometry)return;var key=pt.geometry.coordinates.join('-');if(!existing.hasOwnProperty(key)){cleaned.push(pt);existing[key]=true;}});return featureCollection(cleaned);}// Adds floating point numbers with twice the normal precision.
// Reference: J. R. Shewchuk, Adaptive Precision Floating-Point Arithmetic and
// Fast Robust Geometric Predicates, Discrete & Computational Geometry 18(3)
// 305–363 (1997).
// Code adapted from GeographicLib by Charles F. F. Karney,
// http://geographiclib.sourceforge.net/
var adder=function adder(){return new Adder();};function Adder(){this.reset();}Adder.prototype={constructor:Adder,reset:function reset(){this.s=// rounded value
this.t=0;// exact error
},add:function add(y){_add(temp,y,this.t);_add(this,temp.s,this.s);if(this.s)this.t+=temp.t;else this.s=temp.t;},valueOf:function valueOf(){return this.s;}};var temp=new Adder();function _add(adder,a,b){var x=adder.s=a+b,bv=x-a,av=x-bv;adder.t=a-av+(b-bv);}var epsilon=1e-6;var pi=Math.PI;var halfPi=pi/2;var quarterPi=pi/4;var tau=pi*2;var degrees=180/pi;var radians=pi/180;var abs=Math.abs;var atan=Math.atan;var atan2=Math.atan2;var cos=Math.cos;var exp=Math.exp;var log=Math.log;var sin=Math.sin;var sqrt=Math.sqrt;var tan=Math.tan;function acos(x){return x>1?0:x<-1?pi:Math.acos(x);}function asin(x){return x>1?halfPi:x<-1?-halfPi:Math.asin(x);}function noop(){}function streamGeometry(geometry,stream){if(geometry&&streamGeometryType.hasOwnProperty(geometry.type)){streamGeometryType[geometry.type](geometry,stream);}}var streamObjectType={Feature:function Feature(object,stream){streamGeometry(object.geometry,stream);},FeatureCollection:function FeatureCollection(object,stream){var features=object.features,i=-1,n=features.length;while(++i<n){streamGeometry(features[i].geometry,stream);}}};var streamGeometryType={Sphere:function Sphere(object,stream){stream.sphere();},Point:function Point(object,stream){object=object.coordinates;stream.point(object[0],object[1],object[2]);},MultiPoint:function MultiPoint(object,stream){var coordinates=object.coordinates,i=-1,n=coordinates.length;while(++i<n){object=coordinates[i],stream.point(object[0],object[1],object[2]);}},LineString:function LineString(object,stream){streamLine(object.coordinates,stream,0);},MultiLineString:function MultiLineString(object,stream){var coordinates=object.coordinates,i=-1,n=coordinates.length;while(++i<n){streamLine(coordinates[i],stream,0);}},Polygon:function Polygon(object,stream){streamPolygon(object.coordinates,stream);},MultiPolygon:function MultiPolygon(object,stream){var coordinates=object.coordinates,i=-1,n=coordinates.length;while(++i<n){streamPolygon(coordinates[i],stream);}},GeometryCollection:function GeometryCollection(object,stream){var geometries=object.geometries,i=-1,n=geometries.length;while(++i<n){streamGeometry(geometries[i],stream);}}};function streamLine(coordinates,stream,closed){var i=-1,n=coordinates.length-closed,coordinate;stream.lineStart();while(++i<n){coordinate=coordinates[i],stream.point(coordinate[0],coordinate[1],coordinate[2]);}stream.lineEnd();}function streamPolygon(coordinates,stream){var i=-1,n=coordinates.length;stream.polygonStart();while(++i<n){streamLine(coordinates[i],stream,1);}stream.polygonEnd();}var geoStream=function geoStream(object,stream){if(object&&streamObjectType.hasOwnProperty(object.type)){streamObjectType[object.type](object,stream);}else{streamGeometry(object,stream);}};var areaRingSum=adder();var areaSum=adder();function spherical(cartesian){return[atan2(cartesian[1],cartesian[0]),asin(cartesian[2])];}function cartesian(spherical){var lambda=spherical[0],phi=spherical[1],cosPhi=cos(phi);return[cosPhi*cos(lambda),cosPhi*sin(lambda),sin(phi)];}function cartesianDot(a,b){return a[0]*b[0]+a[1]*b[1]+a[2]*b[2];}function cartesianCross(a,b){return[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]];}// TODO return a
function cartesianAddInPlace(a,b){a[0]+=b[0],a[1]+=b[1],a[2]+=b[2];}function cartesianScale(vector,k){return[vector[0]*k,vector[1]*k,vector[2]*k];}// TODO return d
function cartesianNormalizeInPlace(d){var l=sqrt(d[0]*d[0]+d[1]*d[1]+d[2]*d[2]);d[0]/=l,d[1]/=l,d[2]/=l;}var deltaSum=adder();var compose=function compose(a,b){function compose(x,y){return x=a(x,y),b(x[0],x[1]);}if(a.invert&&b.invert)compose.invert=function(x,y){return x=b.invert(x,y),x&&a.invert(x[0],x[1]);};return compose;};function rotationIdentity(lambda,phi){return[lambda>pi?lambda-tau:lambda<-pi?lambda+tau:lambda,phi];}rotationIdentity.invert=rotationIdentity;function rotateRadians(deltaLambda,deltaPhi,deltaGamma){return(deltaLambda%=tau)?deltaPhi||deltaGamma?compose(rotationLambda(deltaLambda),rotationPhiGamma(deltaPhi,deltaGamma)):rotationLambda(deltaLambda):deltaPhi||deltaGamma?rotationPhiGamma(deltaPhi,deltaGamma):rotationIdentity;}function forwardRotationLambda(deltaLambda){return function(lambda,phi){return lambda+=deltaLambda,[lambda>pi?lambda-tau:lambda<-pi?lambda+tau:lambda,phi];};}function rotationLambda(deltaLambda){var rotation=forwardRotationLambda(deltaLambda);rotation.invert=forwardRotationLambda(-deltaLambda);return rotation;}function rotationPhiGamma(deltaPhi,deltaGamma){var cosDeltaPhi=cos(deltaPhi),sinDeltaPhi=sin(deltaPhi),cosDeltaGamma=cos(deltaGamma),sinDeltaGamma=sin(deltaGamma);function rotation(lambda,phi){var cosPhi=cos(phi),x=cos(lambda)*cosPhi,y=sin(lambda)*cosPhi,z=sin(phi),k=z*cosDeltaPhi+x*sinDeltaPhi;return[atan2(y*cosDeltaGamma-k*sinDeltaGamma,x*cosDeltaPhi-z*sinDeltaPhi),asin(k*cosDeltaGamma+y*sinDeltaGamma)];}rotation.invert=function(lambda,phi){var cosPhi=cos(phi),x=cos(lambda)*cosPhi,y=sin(lambda)*cosPhi,z=sin(phi),k=z*cosDeltaGamma-y*sinDeltaGamma;return[atan2(y*cosDeltaGamma+z*sinDeltaGamma,x*cosDeltaPhi+k*sinDeltaPhi),asin(k*cosDeltaPhi-x*sinDeltaPhi)];};return rotation;}var rotation=function rotation(rotate){rotate=rotateRadians(rotate[0]*radians,rotate[1]*radians,rotate.length>2?rotate[2]*radians:0);function forward(coordinates){coordinates=rotate(coordinates[0]*radians,coordinates[1]*radians);return coordinates[0]*=degrees,coordinates[1]*=degrees,coordinates;}forward.invert=function(coordinates){coordinates=rotate.invert(coordinates[0]*radians,coordinates[1]*radians);return coordinates[0]*=degrees,coordinates[1]*=degrees,coordinates;};return forward;};// Generates a circle centered at [0°, 0°], with a given radius and precision.
function circleStream(stream,radius,delta,direction,t0,t1){if(!delta)return;var cosRadius=cos(radius),sinRadius=sin(radius),step=direction*delta;if(t0==null){t0=radius+direction*tau;t1=radius-step/2;}else{t0=circleRadius(cosRadius,t0);t1=circleRadius(cosRadius,t1);if(direction>0?t0<t1:t0>t1)t0+=direction*tau;}for(var point,t=t0;direction>0?t>t1:t<t1;t-=step){point=spherical([cosRadius,-sinRadius*cos(t),-sinRadius*sin(t)]);stream.point(point[0],point[1]);}}// Returns the signed angle of a cartesian point relative to [cosRadius, 0, 0].
function circleRadius(cosRadius,point){point=cartesian(point),point[0]-=cosRadius;cartesianNormalizeInPlace(point);var radius=acos(-point[1]);return((-point[2]<0?-radius:radius)+tau-epsilon)%tau;}var clipBuffer=function clipBuffer(){var lines=[],line;return{point:function point(x,y){line.push([x,y]);},lineStart:function lineStart(){lines.push(line=[]);},lineEnd:noop,rejoin:function rejoin(){if(lines.length>1)lines.push(lines.pop().concat(lines.shift()));},result:function result(){var result=lines;lines=[];line=null;return result;}};};var pointEqual=function pointEqual(a,b){return abs(a[0]-b[0])<epsilon&&abs(a[1]-b[1])<epsilon;};function Intersection(point,points,other,entry){this.x=point;this.z=points;this.o=other;// another intersection
this.e=entry;// is an entry?
this.v=false;// visited
this.n=this.p=null;// next & previous
}// A generalized polygon clipping algorithm: given a polygon that has been cut
// into its visible line segments, and rejoins the segments by interpolating
// along the clip edge.
var clipRejoin=function clipRejoin(segments,compareIntersection,startInside,interpolate,stream){var subject=[],clip=[],i,n;segments.forEach(function(segment){if((n=segment.length-1)<=0)return;var n,p0=segment[0],p1=segment[n],x;// If the first and last points of a segment are coincident, then treat as a
// closed ring. TODO if all rings are closed, then the winding order of the
// exterior ring should be checked.
if(pointEqual(p0,p1)){stream.lineStart();for(i=0;i<n;++i){stream.point((p0=segment[i])[0],p0[1]);}stream.lineEnd();return;}subject.push(x=new Intersection(p0,segment,null,true));clip.push(x.o=new Intersection(p0,null,x,false));subject.push(x=new Intersection(p1,segment,null,false));clip.push(x.o=new Intersection(p1,null,x,true));});if(!subject.length)return;clip.sort(compareIntersection);link(subject);link(clip);for(i=0,n=clip.length;i<n;++i){clip[i].e=startInside=!startInside;}var start=subject[0],points,point;while(1){// Find first unvisited intersection.
var current=start,isSubject=true;while(current.v){if((current=current.n)===start)return;}points=current.z;stream.lineStart();do{current.v=current.o.v=true;if(current.e){if(isSubject){for(i=0,n=points.length;i<n;++i){stream.point((point=points[i])[0],point[1]);}}else{interpolate(current.x,current.n.x,1,stream);}current=current.n;}else{if(isSubject){points=current.p.z;for(i=points.length-1;i>=0;--i){stream.point((point=points[i])[0],point[1]);}}else{interpolate(current.x,current.p.x,-1,stream);}current=current.p;}current=current.o;points=current.z;isSubject=!isSubject;}while(!current.v);stream.lineEnd();}};function link(array){if(!(n=array.length))return;var n,i=0,a=array[0],b;while(++i<n){a.n=b=array[i];b.p=a;a=b;}a.n=b=array[0];b.p=a;}var sum=adder();var polygonContains=function polygonContains(polygon,point){var lambda=point[0],phi=point[1],normal=[sin(lambda),-cos(lambda),0],angle=0,winding=0;sum.reset();for(var i=0,n=polygon.length;i<n;++i){if(!(m=(ring=polygon[i]).length))continue;var ring,m,point0=ring[m-1],lambda0=point0[0],phi0=point0[1]/2+quarterPi,sinPhi0=sin(phi0),cosPhi0=cos(phi0);for(var j=0;j<m;++j,lambda0=lambda1,sinPhi0=sinPhi1,cosPhi0=cosPhi1,point0=point1){var point1=ring[j],lambda1=point1[0],phi1=point1[1]/2+quarterPi,sinPhi1=sin(phi1),cosPhi1=cos(phi1),delta=lambda1-lambda0,sign$$1=delta>=0?1:-1,absDelta=sign$$1*delta,antimeridian=absDelta>pi,k=sinPhi0*sinPhi1;sum.add(atan2(k*sign$$1*sin(absDelta),cosPhi0*cosPhi1+k*cos(absDelta)));angle+=antimeridian?delta+sign$$1*tau:delta;// Are the longitudes either side of the point’s meridian (lambda),
// and are the latitudes smaller than the parallel (phi)?
if(antimeridian^lambda0>=lambda^lambda1>=lambda){var arc=cartesianCross(cartesian(point0),cartesian(point1));cartesianNormalizeInPlace(arc);var intersection=cartesianCross(normal,arc);cartesianNormalizeInPlace(intersection);var phiArc=(antimeridian^delta>=0?-1:1)*asin(intersection[2]);if(phi>phiArc||phi===phiArc&&(arc[0]||arc[1])){winding+=antimeridian^delta>=0?1:-1;}}}}// First, determine whether the South pole is inside or outside:
//
// It is inside if:
// * the polygon winds around it in a clockwise direction.
// * the polygon does not (cumulatively) wind around it, but has a negative
//   (counter-clockwise) area.
//
// Second, count the (signed) number of times a segment crosses a lambda
// from the point to the South pole.  If it is zero, then the point is the
// same side as the South pole.
return(angle<-epsilon||angle<epsilon&&sum<-epsilon)^winding&1;};var merge=function merge(arrays){var n=arrays.length,m,i=-1,j=0,merged,array;while(++i<n){j+=arrays[i].length;}merged=new Array(j);while(--n>=0){array=arrays[n];m=array.length;while(--m>=0){merged[--j]=array[m];}}return merged;};var clip=function clip(pointVisible,clipLine,interpolate,start){return function(sink){var line=clipLine(sink),ringBuffer=clipBuffer(),ringSink=clipLine(ringBuffer),polygonStarted=false,polygon,segments,ring;var clip={point:point,lineStart:lineStart,lineEnd:lineEnd,polygonStart:function polygonStart(){clip.point=pointRing;clip.lineStart=ringStart;clip.lineEnd=ringEnd;segments=[];polygon=[];},polygonEnd:function polygonEnd(){clip.point=point;clip.lineStart=lineStart;clip.lineEnd=lineEnd;segments=merge(segments);var startInside=polygonContains(polygon,start);if(segments.length){if(!polygonStarted)sink.polygonStart(),polygonStarted=true;clipRejoin(segments,compareIntersection,startInside,interpolate,sink);}else if(startInside){if(!polygonStarted)sink.polygonStart(),polygonStarted=true;sink.lineStart();interpolate(null,null,1,sink);sink.lineEnd();}if(polygonStarted)sink.polygonEnd(),polygonStarted=false;segments=polygon=null;},sphere:function sphere(){sink.polygonStart();sink.lineStart();interpolate(null,null,1,sink);sink.lineEnd();sink.polygonEnd();}};function point(lambda,phi){if(pointVisible(lambda,phi))sink.point(lambda,phi);}function pointLine(lambda,phi){line.point(lambda,phi);}function lineStart(){clip.point=pointLine;line.lineStart();}function lineEnd(){clip.point=point;line.lineEnd();}function pointRing(lambda,phi){ring.push([lambda,phi]);ringSink.point(lambda,phi);}function ringStart(){ringSink.lineStart();ring=[];}function ringEnd(){pointRing(ring[0][0],ring[0][1]);ringSink.lineEnd();var clean=ringSink.clean(),ringSegments=ringBuffer.result(),i,n=ringSegments.length,m,segment,point;ring.pop();polygon.push(ring);ring=null;if(!n)return;// No intersections.
if(clean&1){segment=ringSegments[0];if((m=segment.length-1)>0){if(!polygonStarted)sink.polygonStart(),polygonStarted=true;sink.lineStart();for(i=0;i<m;++i){sink.point((point=segment[i])[0],point[1]);}sink.lineEnd();}return;}// Rejoin connected segments.
// TODO reuse ringBuffer.rejoin()?
if(n>1&&clean&2)ringSegments.push(ringSegments.pop().concat(ringSegments.shift()));segments.push(ringSegments.filter(validSegment));}return clip;};};function validSegment(segment){return segment.length>1;}// Intersections are sorted along the clip edge. For both antimeridian cutting
// and circle clipping, the same comparison is used.
function compareIntersection(a,b){return((a=a.x)[0]<0?a[1]-halfPi-epsilon:halfPi-a[1])-((b=b.x)[0]<0?b[1]-halfPi-epsilon:halfPi-b[1]);}var clipAntimeridian=clip(function(){return true;},clipAntimeridianLine,clipAntimeridianInterpolate,[-pi,-halfPi]);// Takes a line and cuts into visible segments. Return values: 0 - there were
// intersections or the line was empty; 1 - no intersections; 2 - there were
// intersections, and the first and last segments should be rejoined.
function clipAntimeridianLine(stream){var lambda0=NaN,phi0=NaN,sign0=NaN,_clean;// no intersections
return{lineStart:function lineStart(){stream.lineStart();_clean=1;},point:function point(lambda1,phi1){var sign1=lambda1>0?pi:-pi,delta=abs(lambda1-lambda0);if(abs(delta-pi)<epsilon){// line crosses a pole
stream.point(lambda0,phi0=(phi0+phi1)/2>0?halfPi:-halfPi);stream.point(sign0,phi0);stream.lineEnd();stream.lineStart();stream.point(sign1,phi0);stream.point(lambda1,phi0);_clean=0;}else if(sign0!==sign1&&delta>=pi){// line crosses antimeridian
if(abs(lambda0-sign0)<epsilon)lambda0-=sign0*epsilon;// handle degeneracies
if(abs(lambda1-sign1)<epsilon)lambda1-=sign1*epsilon;phi0=clipAntimeridianIntersect(lambda0,phi0,lambda1,phi1);stream.point(sign0,phi0);stream.lineEnd();stream.lineStart();stream.point(sign1,phi0);_clean=0;}stream.point(lambda0=lambda1,phi0=phi1);sign0=sign1;},lineEnd:function lineEnd(){stream.lineEnd();lambda0=phi0=NaN;},clean:function clean(){return 2-_clean;// if intersections, rejoin first and last segments
}};}function clipAntimeridianIntersect(lambda0,phi0,lambda1,phi1){var cosPhi0,cosPhi1,sinLambda0Lambda1=sin(lambda0-lambda1);return abs(sinLambda0Lambda1)>epsilon?atan((sin(phi0)*(cosPhi1=cos(phi1))*sin(lambda1)-sin(phi1)*(cosPhi0=cos(phi0))*sin(lambda0))/(cosPhi0*cosPhi1*sinLambda0Lambda1)):(phi0+phi1)/2;}function clipAntimeridianInterpolate(from,to,direction,stream){var phi;if(from==null){phi=direction*halfPi;stream.point(-pi,phi);stream.point(0,phi);stream.point(pi,phi);stream.point(pi,0);stream.point(pi,-phi);stream.point(0,-phi);stream.point(-pi,-phi);stream.point(-pi,0);stream.point(-pi,phi);}else if(abs(from[0]-to[0])>epsilon){var lambda=from[0]<to[0]?pi:-pi;phi=direction*lambda/2;stream.point(-lambda,phi);stream.point(0,phi);stream.point(lambda,phi);}else{stream.point(to[0],to[1]);}}var clipCircle=function clipCircle(radius){var cr=cos(radius),delta=6*radians,smallRadius=cr>0,notHemisphere=abs(cr)>epsilon;// TODO optimise for this common case
function interpolate(from,to,direction,stream){circleStream(stream,radius,delta,direction,from,to);}function visible(lambda,phi){return cos(lambda)*cos(phi)>cr;}// Takes a line and cuts into visible segments. Return values used for polygon
// clipping: 0 - there were intersections or the line was empty; 1 - no
// intersections 2 - there were intersections, and the first and last segments
// should be rejoined.
function clipLine(stream){var point0,// previous point
c0,// code for previous point
v0,// visibility of previous point
v00,// visibility of first point
_clean2;// no intersections
return{lineStart:function lineStart(){v00=v0=false;_clean2=1;},point:function point(lambda,phi){var point1=[lambda,phi],point2,v=visible(lambda,phi),c=smallRadius?v?0:code(lambda,phi):v?code(lambda+(lambda<0?pi:-pi),phi):0;if(!point0&&(v00=v0=v))stream.lineStart();// Handle degeneracies.
// TODO ignore if not clipping polygons.
if(v!==v0){point2=intersect(point0,point1);if(!point2||pointEqual(point0,point2)||pointEqual(point1,point2)){point1[0]+=epsilon;point1[1]+=epsilon;v=visible(point1[0],point1[1]);}}if(v!==v0){_clean2=0;if(v){// outside going in
stream.lineStart();point2=intersect(point1,point0);stream.point(point2[0],point2[1]);}else{// inside going out
point2=intersect(point0,point1);stream.point(point2[0],point2[1]);stream.lineEnd();}point0=point2;}else if(notHemisphere&&point0&&smallRadius^v){var t;// If the codes for two points are different, or are both zero,
// and there this segment intersects with the small circle.
if(!(c&c0)&&(t=intersect(point1,point0,true))){_clean2=0;if(smallRadius){stream.lineStart();stream.point(t[0][0],t[0][1]);stream.point(t[1][0],t[1][1]);stream.lineEnd();}else{stream.point(t[1][0],t[1][1]);stream.lineEnd();stream.lineStart();stream.point(t[0][0],t[0][1]);}}}if(v&&(!point0||!pointEqual(point0,point1))){stream.point(point1[0],point1[1]);}point0=point1,v0=v,c0=c;},lineEnd:function lineEnd(){if(v0)stream.lineEnd();point0=null;},// Rejoin first and last segments if there were intersections and the first
// and last points were visible.
clean:function clean(){return _clean2|(v00&&v0)<<1;}};}// Intersects the great circle between a and b with the clip circle.
function intersect(a,b,two){var pa=cartesian(a),pb=cartesian(b);// We have two planes, n1.p = d1 and n2.p = d2.
// Find intersection line p(t) = c1 n1 + c2 n2 + t (n1 ⨯ n2).
var n1=[1,0,0],// normal
n2=cartesianCross(pa,pb),n2n2=cartesianDot(n2,n2),n1n2=n2[0],// cartesianDot(n1, n2),
determinant=n2n2-n1n2*n1n2;// Two polar points.
if(!determinant)return!two&&a;var c1=cr*n2n2/determinant,c2=-cr*n1n2/determinant,n1xn2=cartesianCross(n1,n2),A=cartesianScale(n1,c1),B=cartesianScale(n2,c2);cartesianAddInPlace(A,B);// Solve |p(t)|^2 = 1.
var u=n1xn2,w=cartesianDot(A,u),uu=cartesianDot(u,u),t2=w*w-uu*(cartesianDot(A,A)-1);if(t2<0)return;var t=sqrt(t2),q=cartesianScale(u,(-w-t)/uu);cartesianAddInPlace(q,A);q=spherical(q);if(!two)return q;// Two intersection points.
var lambda0=a[0],lambda1=b[0],phi0=a[1],phi1=b[1],z;if(lambda1<lambda0)z=lambda0,lambda0=lambda1,lambda1=z;var delta=lambda1-lambda0,polar=abs(delta-pi)<epsilon,meridian=polar||delta<epsilon;if(!polar&&phi1<phi0)z=phi0,phi0=phi1,phi1=z;// Check that the first point is between a and b.
if(meridian?polar?phi0+phi1>0^q[1]<(abs(q[0]-lambda0)<epsilon?phi0:phi1):phi0<=q[1]&&q[1]<=phi1:delta>pi^(lambda0<=q[0]&&q[0]<=lambda1)){var q1=cartesianScale(u,(-w+t)/uu);cartesianAddInPlace(q1,A);return[q,spherical(q1)];}}// Generates a 4-bit vector representing the location of a point relative to
// the small circle's bounding box.
function code(lambda,phi){var r=smallRadius?radius:pi-radius,code=0;if(lambda<-r)code|=1;// left
else if(lambda>r)code|=2;// right
if(phi<-r)code|=4;// below
else if(phi>r)code|=8;// above
return code;}return clip(visible,clipLine,interpolate,smallRadius?[0,-radius]:[-pi,radius-pi]);};var clipLine=function clipLine(a,b,x0,y0,x1,y1){var ax=a[0],ay=a[1],bx=b[0],by=b[1],t0=0,t1=1,dx=bx-ax,dy=by-ay,r;r=x0-ax;if(!dx&&r>0)return;r/=dx;if(dx<0){if(r<t0)return;if(r<t1)t1=r;}else if(dx>0){if(r>t1)return;if(r>t0)t0=r;}r=x1-ax;if(!dx&&r<0)return;r/=dx;if(dx<0){if(r>t1)return;if(r>t0)t0=r;}else if(dx>0){if(r<t0)return;if(r<t1)t1=r;}r=y0-ay;if(!dy&&r>0)return;r/=dy;if(dy<0){if(r<t0)return;if(r<t1)t1=r;}else if(dy>0){if(r>t1)return;if(r>t0)t0=r;}r=y1-ay;if(!dy&&r<0)return;r/=dy;if(dy<0){if(r>t1)return;if(r>t0)t0=r;}else if(dy>0){if(r<t0)return;if(r<t1)t1=r;}if(t0>0)a[0]=ax+t0*dx,a[1]=ay+t0*dy;if(t1<1)b[0]=ax+t1*dx,b[1]=ay+t1*dy;return true;};var clipMax=1e9;var clipMin=-clipMax;// TODO Use d3-polygon’s polygonContains here for the ring check?
// TODO Eliminate duplicate buffering in clipBuffer and polygon.push?
function clipRectangle(x0,y0,x1,y1){function visible(x,y){return x0<=x&&x<=x1&&y0<=y&&y<=y1;}function interpolate(from,to,direction,stream){var a=0,a1=0;if(from==null||(a=corner(from,direction))!==(a1=corner(to,direction))||comparePoint(from,to)<0^direction>0){do{stream.point(a===0||a===3?x0:x1,a>1?y1:y0);}while((a=(a+direction+4)%4)!==a1);}else{stream.point(to[0],to[1]);}}function corner(p,direction){return abs(p[0]-x0)<epsilon?direction>0?0:3:abs(p[0]-x1)<epsilon?direction>0?2:1:abs(p[1]-y0)<epsilon?direction>0?1:0:direction>0?3:2;// abs(p[1] - y1) < epsilon
}function compareIntersection(a,b){return comparePoint(a.x,b.x);}function comparePoint(a,b){var ca=corner(a,1),cb=corner(b,1);return ca!==cb?ca-cb:ca===0?b[1]-a[1]:ca===1?a[0]-b[0]:ca===2?a[1]-b[1]:b[0]-a[0];}return function(stream){var activeStream=stream,bufferStream=clipBuffer(),segments,polygon,ring,x__,y__,v__,// first point
x_,y_,v_,// previous point
first,clean;var clipStream={point:point,lineStart:lineStart,lineEnd:lineEnd,polygonStart:polygonStart,polygonEnd:polygonEnd};function point(x,y){if(visible(x,y))activeStream.point(x,y);}function polygonInside(){var winding=0;for(var i=0,n=polygon.length;i<n;++i){for(var ring=polygon[i],j=1,m=ring.length,point=ring[0],a0,a1,b0=point[0],b1=point[1];j<m;++j){a0=b0,a1=b1,point=ring[j],b0=point[0],b1=point[1];if(a1<=y1){if(b1>y1&&(b0-a0)*(y1-a1)>(b1-a1)*(x0-a0))++winding;}else{if(b1<=y1&&(b0-a0)*(y1-a1)<(b1-a1)*(x0-a0))--winding;}}}return winding;}// Buffer geometry within a polygon and then clip it en masse.
function polygonStart(){activeStream=bufferStream,segments=[],polygon=[],clean=true;}function polygonEnd(){var startInside=polygonInside(),cleanInside=clean&&startInside,visible=(segments=merge(segments)).length;if(cleanInside||visible){stream.polygonStart();if(cleanInside){stream.lineStart();interpolate(null,null,1,stream);stream.lineEnd();}if(visible){clipRejoin(segments,compareIntersection,startInside,interpolate,stream);}stream.polygonEnd();}activeStream=stream,segments=polygon=ring=null;}function lineStart(){clipStream.point=linePoint;if(polygon)polygon.push(ring=[]);first=true;v_=false;x_=y_=NaN;}// TODO rather than special-case polygons, simply handle them separately.
// Ideally, coincident intersection points should be jittered to avoid
// clipping issues.
function lineEnd(){if(segments){linePoint(x__,y__);if(v__&&v_)bufferStream.rejoin();segments.push(bufferStream.result());}clipStream.point=point;if(v_)activeStream.lineEnd();}function linePoint(x,y){var v=visible(x,y);if(polygon)ring.push([x,y]);if(first){x__=x,y__=y,v__=v;first=false;if(v){activeStream.lineStart();activeStream.point(x,y);}}else{if(v&&v_)activeStream.point(x,y);else{var a=[x_=Math.max(clipMin,Math.min(clipMax,x_)),y_=Math.max(clipMin,Math.min(clipMax,y_))],b=[x=Math.max(clipMin,Math.min(clipMax,x)),y=Math.max(clipMin,Math.min(clipMax,y))];if(clipLine(a,b,x0,y0,x1,y1)){if(!v_){activeStream.lineStart();activeStream.point(a[0],a[1]);}activeStream.point(b[0],b[1]);if(!v)activeStream.lineEnd();clean=false;}else if(v){activeStream.lineStart();activeStream.point(x,y);clean=false;}}}x_=x,y_=y,v_=v;}return clipStream;};}var lengthSum=adder();var identity$1$1=function identity$1(x){return x;};var areaSum$1=adder();var areaRingSum$1=adder();var x0$2=Infinity;var y0$2=x0$2;var x1=-x0$2;var y1=x1;var boundsStream$1={point:boundsPoint$1,lineStart:noop,lineEnd:noop,polygonStart:noop,polygonEnd:noop,result:function result(){var bounds=[[x0$2,y0$2],[x1,y1]];x1=y1=-(y0$2=x0$2=Infinity);return bounds;}};function boundsPoint$1(x,y){if(x<x0$2)x0$2=x;if(x>x1)x1=x;if(y<y0$2)y0$2=y;if(y>y1)y1=y;}var lengthSum$1=adder();function transformer(methods){return function(stream){var s=new TransformStream();for(var key in methods){s[key]=methods[key];}s.stream=stream;return s;};}function TransformStream(){}TransformStream.prototype={constructor:TransformStream,point:function point(x,y){this.stream.point(x,y);},sphere:function sphere(){this.stream.sphere();},lineStart:function lineStart(){this.stream.lineStart();},lineEnd:function lineEnd(){this.stream.lineEnd();},polygonStart:function polygonStart(){this.stream.polygonStart();},polygonEnd:function polygonEnd(){this.stream.polygonEnd();}};function fit(projection,fitBounds,object){var clip=projection.clipExtent&&projection.clipExtent();projection.scale(150).translate([0,0]);if(clip!=null)projection.clipExtent(null);geoStream(object,projection.stream(boundsStream$1));fitBounds(boundsStream$1.result());if(clip!=null)projection.clipExtent(clip);return projection;}function fitExtent(projection,extent,object){return fit(projection,function(b){var w=extent[1][0]-extent[0][0],h=extent[1][1]-extent[0][1],k=Math.min(w/(b[1][0]-b[0][0]),h/(b[1][1]-b[0][1])),x=+extent[0][0]+(w-k*(b[1][0]+b[0][0]))/2,y=+extent[0][1]+(h-k*(b[1][1]+b[0][1]))/2;projection.scale(150*k).translate([x,y]);},object);}function fitSize(projection,size,object){return fitExtent(projection,[[0,0],size],object);}function fitWidth(projection,width,object){return fit(projection,function(b){var w=+width,k=w/(b[1][0]-b[0][0]),x=(w-k*(b[1][0]+b[0][0]))/2,y=-k*b[0][1];projection.scale(150*k).translate([x,y]);},object);}function fitHeight(projection,height,object){return fit(projection,function(b){var h=+height,k=h/(b[1][1]-b[0][1]),x=-k*b[0][0],y=(h-k*(b[1][1]+b[0][1]))/2;projection.scale(150*k).translate([x,y]);},object);}var maxDepth=16;var cosMinDistance=cos(30*radians);// cos(minimum angular distance)
var resample=function resample(project,delta2){return+delta2?resample$1(project,delta2):resampleNone(project);};function resampleNone(project){return transformer({point:function point(x,y){x=project(x,y);this.stream.point(x[0],x[1]);}});}function resample$1(project,delta2){function resampleLineTo(x0,y0,lambda0,a0,b0,c0,x1,y1,lambda1,a1,b1,c1,depth,stream){var dx=x1-x0,dy=y1-y0,d2=dx*dx+dy*dy;if(d2>4*delta2&&depth--){var a=a0+a1,b=b0+b1,c=c0+c1,m=sqrt(a*a+b*b+c*c),phi2=asin(c/=m),lambda2=abs(abs(c)-1)<epsilon||abs(lambda0-lambda1)<epsilon?(lambda0+lambda1)/2:atan2(b,a),p=project(lambda2,phi2),x2=p[0],y2=p[1],dx2=x2-x0,dy2=y2-y0,dz=dy*dx2-dx*dy2;if(dz*dz/d2>delta2// perpendicular projected distance
||abs((dx*dx2+dy*dy2)/d2-0.5)>0.3// midpoint close to an end
||a0*a1+b0*b1+c0*c1<cosMinDistance){// angular distance
resampleLineTo(x0,y0,lambda0,a0,b0,c0,x2,y2,lambda2,a/=m,b/=m,c,depth,stream);stream.point(x2,y2);resampleLineTo(x2,y2,lambda2,a,b,c,x1,y1,lambda1,a1,b1,c1,depth,stream);}}}return function(stream){var lambda00,x00,y00,a00,b00,c00,// first point
lambda0,x0,y0,a0,b0,c0;// previous point
var resampleStream={point:point,lineStart:lineStart,lineEnd:lineEnd,polygonStart:function polygonStart(){stream.polygonStart();resampleStream.lineStart=ringStart;},polygonEnd:function polygonEnd(){stream.polygonEnd();resampleStream.lineStart=lineStart;}};function point(x,y){x=project(x,y);stream.point(x[0],x[1]);}function lineStart(){x0=NaN;resampleStream.point=linePoint;stream.lineStart();}function linePoint(lambda,phi){var c=cartesian([lambda,phi]),p=project(lambda,phi);resampleLineTo(x0,y0,lambda0,a0,b0,c0,x0=p[0],y0=p[1],lambda0=lambda,a0=c[0],b0=c[1],c0=c[2],maxDepth,stream);stream.point(x0,y0);}function lineEnd(){resampleStream.point=point;stream.lineEnd();}function ringStart(){lineStart();resampleStream.point=ringPoint;resampleStream.lineEnd=ringEnd;}function ringPoint(lambda,phi){linePoint(lambda00=lambda,phi),x00=x0,y00=y0,a00=a0,b00=b0,c00=c0;resampleStream.point=linePoint;}function ringEnd(){resampleLineTo(x0,y0,lambda0,a0,b0,c0,x00,y00,lambda00,a00,b00,c00,maxDepth,stream);resampleStream.lineEnd=lineEnd;lineEnd();}return resampleStream;};}var transformRadians=transformer({point:function point(x,y){this.stream.point(x*radians,y*radians);}});function transformRotate(rotate){return transformer({point:function point(x,y){var r=rotate(x,y);return this.stream.point(r[0],r[1]);}});}function projection(project){return projectionMutator(function(){return project;})();}function projectionMutator(projectAt){var project,k=150,// scale
x=480,y=250,// translate
dx,dy,lambda=0,phi=0,// center
deltaLambda=0,deltaPhi=0,deltaGamma=0,rotate,projectRotate,// rotate
theta=null,preclip=clipAntimeridian,// clip angle
x0=null,y0,x1,y1,postclip=identity$1$1,// clip extent
delta2=0.5,projectResample=resample(projectTransform,delta2),// precision
cache,cacheStream;function projection(point){point=projectRotate(point[0]*radians,point[1]*radians);return[point[0]*k+dx,dy-point[1]*k];}function invert(point){point=projectRotate.invert((point[0]-dx)/k,(dy-point[1])/k);return point&&[point[0]*degrees,point[1]*degrees];}function projectTransform(x,y){return x=project(x,y),[x[0]*k+dx,dy-x[1]*k];}projection.stream=function(stream){return cache&&cacheStream===stream?cache:cache=transformRadians(transformRotate(rotate)(preclip(projectResample(postclip(cacheStream=stream)))));};projection.preclip=function(_){return arguments.length?(preclip=_,theta=undefined,reset()):preclip;};projection.postclip=function(_){return arguments.length?(postclip=_,x0=y0=x1=y1=null,reset()):postclip;};projection.clipAngle=function(_){return arguments.length?(preclip=+_?clipCircle(theta=_*radians):(theta=null,clipAntimeridian),reset()):theta*degrees;};projection.clipExtent=function(_){return arguments.length?(postclip=_==null?(x0=y0=x1=y1=null,identity$1$1):clipRectangle(x0=+_[0][0],y0=+_[0][1],x1=+_[1][0],y1=+_[1][1]),reset()):x0==null?null:[[x0,y0],[x1,y1]];};projection.scale=function(_){return arguments.length?(k=+_,recenter()):k;};projection.translate=function(_){return arguments.length?(x=+_[0],y=+_[1],recenter()):[x,y];};projection.center=function(_){return arguments.length?(lambda=_[0]%360*radians,phi=_[1]%360*radians,recenter()):[lambda*degrees,phi*degrees];};projection.rotate=function(_){return arguments.length?(deltaLambda=_[0]%360*radians,deltaPhi=_[1]%360*radians,deltaGamma=_.length>2?_[2]%360*radians:0,recenter()):[deltaLambda*degrees,deltaPhi*degrees,deltaGamma*degrees];};projection.precision=function(_){return arguments.length?(projectResample=resample(projectTransform,delta2=_*_),reset()):sqrt(delta2);};projection.fitExtent=function(extent,object){return fitExtent(projection,extent,object);};projection.fitSize=function(size,object){return fitSize(projection,size,object);};projection.fitWidth=function(width,object){return fitWidth(projection,width,object);};projection.fitHeight=function(height,object){return fitHeight(projection,height,object);};function recenter(){projectRotate=compose(rotate=rotateRadians(deltaLambda,deltaPhi,deltaGamma),project);var center=project(lambda,phi);dx=x-center[0]*k;dy=y+center[1]*k;return reset();}function reset(){cache=cacheStream=null;return projection;}return function(){project=projectAt.apply(this,arguments);projection.invert=project.invert&&invert;return recenter();};}function azimuthalRaw(scale){return function(x,y){var cx=cos(x),cy=cos(y),k=scale(cx*cy);return[k*cy*sin(x),k*sin(y)];};}function azimuthalInvert(angle){return function(x,y){var z=sqrt(x*x+y*y),c=angle(z),sc=sin(c),cc=cos(c);return[atan2(x*sc,z*cc),asin(z&&y*sc/z)];};}var azimuthalEqualAreaRaw=azimuthalRaw(function(cxcy){return sqrt(2/(1+cxcy));});azimuthalEqualAreaRaw.invert=azimuthalInvert(function(z){return 2*asin(z/2);});var azimuthalEquidistantRaw=azimuthalRaw(function(c){return(c=acos(c))&&c/sin(c);});azimuthalEquidistantRaw.invert=azimuthalInvert(function(z){return z;});function mercatorRaw(lambda,phi){return[lambda,log(tan((halfPi+phi)/2))];}mercatorRaw.invert=function(x,y){return[x,2*atan(exp(y))-halfPi];};function mercatorProjection(project){var m=projection(project),center=m.center,scale=m.scale,translate=m.translate,clipExtent=m.clipExtent,x0=null,y0,x1,y1;// clip extent
m.scale=function(_){return arguments.length?(scale(_),reclip()):scale();};m.translate=function(_){return arguments.length?(translate(_),reclip()):translate();};m.center=function(_){return arguments.length?(center(_),reclip()):center();};m.clipExtent=function(_){return arguments.length?(_==null?x0=y0=x1=y1=null:(x0=+_[0][0],y0=+_[0][1],x1=+_[1][0],y1=+_[1][1]),reclip()):x0==null?null:[[x0,y0],[x1,y1]];};function reclip(){var k=pi*scale(),t=m(rotation(m.rotate()).invert([0,0]));return clipExtent(x0==null?[[t[0]-k,t[1]-k],[t[0]+k,t[1]+k]]:project===mercatorRaw?[[Math.max(t[0]-k,x0),y0],[Math.min(t[0]+k,x1),y1]]:[[x0,Math.max(t[1]-k,y0)],[x1,Math.min(t[1]+k,y1)]]);}return reclip();}function gnomonicRaw(x,y){var cy=cos(y),k=cos(x)*cy;return[cy*sin(x)/k,sin(y)/k];}gnomonicRaw.invert=azimuthalInvert(atan);function orthographicRaw(x,y){return[cos(y)*sin(x),sin(y)];}orthographicRaw.invert=azimuthalInvert(asin);function stereographicRaw(x,y){var cy=cos(y),k=1+cos(x)*cy;return[cy*sin(x)/k,sin(y)/k];}stereographicRaw.invert=azimuthalInvert(function(z){return 2*atan(z);});function transverseMercatorRaw(lambda,phi){return[log(tan((halfPi+phi)/2)),-lambda];}transverseMercatorRaw.invert=function(x,y){return[-y,2*atan(exp(x))-halfPi];};var geoTransverseMercator=function geoTransverseMercator(){var m=mercatorProjection(transverseMercatorRaw),center=m.center,rotate=m.rotate;m.center=function(_){return arguments.length?center([-_[1],_[0]]):(_=center(),[_[1],-_[0]]);};m.rotate=function(_){return arguments.length?rotate([_[0],_[1],_.length>2?_[2]+90:90]):(_=rotate(),[_[0],_[1],_[2]-90]);};return rotate([0,0,90]).scale(159.155);};/**
 * Takes a set of features, calculates the bbox of all input features, and returns a bounding box.
 *
 * @name bbox
 * @param {FeatureCollection|Feature<any>} geojson input features
 * @returns {Array<number>} bbox extent in [minX, minY, maxX, maxY] order
 * @example
 * var line = turf.lineString([[-74, 40], [-78, 42], [-82, 35]]);
 * var bbox = turf.bbox(line);
 * var bboxPolygon = turf.bboxPolygon(bbox);
 *
 * //addToMap
 * var addToMap = [line, bboxPolygon]
 */function bbox$1(geojson){var BBox=[Infinity,Infinity,-Infinity,-Infinity];coordEach(geojson,function(coord){if(BBox[0]>coord[0])BBox[0]=coord[0];if(BBox[1]>coord[1])BBox[1]=coord[1];if(BBox[2]<coord[0])BBox[2]=coord[0];if(BBox[3]<coord[1])BBox[3]=coord[1];});return BBox;}/**
 * Takes a {@link Feature} or {@link FeatureCollection} and returns the absolute center point of all features.
 *
 * @name center
 * @param {GeoJSON} geojson GeoJSON to be centered
 * @param {Object} [properties={}] an Object that is used as the {@link Feature}'s properties
 * @returns {Feature<Point>} a Point feature at the absolute center point of all input features
 * @example
 * var features = turf.featureCollection([
 *   turf.point( [-97.522259, 35.4691]),
 *   turf.point( [-97.502754, 35.463455]),
 *   turf.point( [-97.508269, 35.463245])
 * ]);
 *
 * var center = turf.center(features);
 *
 * //addToMap
 * var addToMap = [features, center]
 * center.properties['marker-size'] = 'large';
 * center.properties['marker-color'] = '#000';
 */function center(geojson,properties){var ext=bbox$1(geojson);var x=(ext[0]+ext[2])/2;var y=(ext[1]+ext[3])/2;return point([x,y],properties);}/**
 * Converts a WGS84 GeoJSON object into Mercator (EPSG:900913) projection
 *
 * @name toMercator
 * @param {GeoJSON|Position} geojson WGS84 GeoJSON object
 * @param {Object} [options] Optional parameters
 * @param {boolean} [options.mutate=false] allows GeoJSON input to be mutated (significant performance increase if true)
 * @returns {GeoJSON} true/false
 * @example
 * var pt = turf.point([-71,41]);
 * var converted = turf.toMercator(pt);
 *
 * //addToMap
 * var addToMap = [pt, converted];
 */function toMercator(geojson,options){return convert(geojson,'mercator',options);}/**
 * Converts a Mercator (EPSG:900913) GeoJSON object into WGS84 projection
 *
 * @name toWgs84
 * @param {GeoJSON|Position} geojson Mercator GeoJSON object
 * @param {Object} [options] Optional parameters
 * @param {boolean} [options.mutate=false] allows GeoJSON input to be mutated (significant performance increase if true)
 * @returns {GeoJSON} true/false
 * @example
 * var pt = turf.point([-7903683.846322424, 5012341.663847514]);
 * var converted = turf.toWgs84(pt);
 *
 * //addToMap
 * var addToMap = [pt, converted];
 */function toWgs84(geojson,options){return convert(geojson,'wgs84',options);}/**
 * Converts a GeoJSON coordinates to the defined `projection`
 *
 * @private
 * @param {GeoJSON} geojson GeoJSON Feature or Geometry
 * @param {string} projection defines the projection system to convert the coordinates to
 * @param {Object} [options] Optional parameters
 * @param {boolean} [options.mutate=false] allows GeoJSON input to be mutated (significant performance increase if true)
 * @returns {GeoJSON} true/false
 */function convert(geojson,projection,options){// Optional parameters
options=options||{};if(!isObject$2(options))throw new Error('options is invalid');var mutate=options.mutate;// Validation
if(!geojson)throw new Error('geojson is required');// Handle Position
if(Array.isArray(geojson)&&isNumber(geojson[0]))geojson=projection==='mercator'?convertToMercator(geojson):convertToWgs84(geojson);// Handle GeoJSON
else{// Handle possible data mutation
if(mutate!==true)geojson=clone(geojson);coordEach(geojson,function(coord){var newCoord=projection==='mercator'?convertToMercator(coord):convertToWgs84(coord);coord[0]=newCoord[0];coord[1]=newCoord[1];});}return geojson;}/**
 * Convert lon/lat values to 900913 x/y.
 * (from https://github.com/mapbox/sphericalmercator)
 *
 * @private
 * @param {Array<number>} lonLat WGS84 point
 * @returns {Array<number>} Mercator [x, y] point
 */function convertToMercator(lonLat){var D2R=Math.PI/180,// 900913 properties
A=6378137.0,MAXEXTENT=20037508.342789244;// compensate longitudes passing the 180th meridian
// from https://github.com/proj4js/proj4js/blob/master/lib/common/adjust_lon.js
var adjusted=Math.abs(lonLat[0])<=180?lonLat[0]:lonLat[0]-sign$1(lonLat[0])*360;var xy=[A*adjusted*D2R,A*Math.log(Math.tan(Math.PI*0.25+0.5*lonLat[1]*D2R))];// if xy value is beyond maxextent (e.g. poles), return maxextent
if(xy[0]>MAXEXTENT)xy[0]=MAXEXTENT;if(xy[0]<-MAXEXTENT)xy[0]=-MAXEXTENT;if(xy[1]>MAXEXTENT)xy[1]=MAXEXTENT;if(xy[1]<-MAXEXTENT)xy[1]=-MAXEXTENT;return xy;}/**
 * Convert 900913 x/y values to lon/lat.
 * (from https://github.com/mapbox/sphericalmercator)
 *
 * @private
 * @param {Array<number>} xy Mercator [x, y] point
 * @returns {Array<number>} WGS84 [lon, lat] point
 */function convertToWgs84(xy){// 900913 properties.
var R2D=180/Math.PI;var A=6378137.0;return[xy[0]*R2D/A,(Math.PI*0.5-2.0*Math.atan(Math.exp(-xy[1]/A)))*R2D];}/**
 * Returns the sign of the input, or zero
 *
 * @private
 * @param {number} x input
 * @returns {number} -1|0|1 output
 */function sign$1(x){return x<0?-1:x>0?1:0;}/*import {
  GeoJSONReader,
  GeoJSONWriter
} from 'jsts_es6';*//**
 * Calculates a buffer for input features for a given radius. Units supported are miles, kilometers, and degrees.
 *
 * When using a negative radius, the resulting geometry may be invalid if
 * it's too small compared to the radius magnitude. If the input is a
 * FeatureCollection, only valid members will be returned in the output
 * FeatureCollection - i.e., the output collection may have fewer members than
 * the input, or even be empty.
 *
 * @name buffer
 * @param {FeatureCollection|Geometry|Feature<any>} geojson input to be buffered
 * @param {number} radius distance to draw the buffer (negative values are allowed)
 * @param {Object} [options] Optional parameters
 * @param {string} [options.units="kilometers"] any of the options supported by turf units
 * @param {number} [options.steps=64] number of steps
 * @returns {FeatureCollection|Feature<Polygon|MultiPolygon>|undefined} buffered features
 * @example
 * var point = turf.point([-90.548630, 14.616599]);
 * var buffered = turf.buffer(point, 500, {units: 'miles'});
 *
 * //addToMap
 * var addToMap = [point, buffered]
 */function buffer(geojson,radius,options){// Optional params
options=options||{};var units=options.units;var steps=options.steps||64;// validation
if(!geojson)throw new Error('geojson is required');if((typeof options==='undefined'?'undefined':_typeof(options))!=='object')throw new Error('options must be an object');if(typeof steps!=='number')throw new Error('steps must be an number');// Allow negative buffers ("erosion") or zero-sized buffers ("repair geometry")
if(radius===undefined)throw new Error('radius is required');if(steps<=0)throw new Error('steps must be greater than 0');// default params
steps=steps||64;units=units||'kilometers';var results=[];switch(geojson.type){case'GeometryCollection':geomEach(geojson,function(geometry$$1){var buffered=bufferFeature(geometry$$1,radius,units,steps);if(buffered)results.push(buffered);});return featureCollection(results);case'FeatureCollection':featureEach(geojson,function(feature$$1){var multiBuffered=bufferFeature(feature$$1,radius,units,steps);if(multiBuffered){featureEach(multiBuffered,function(buffered){if(buffered)results.push(buffered);});}});return featureCollection(results);}return bufferFeature(geojson,radius,units,steps);}/**
 * Buffer single Feature/Geometry
 *
 * @private
 * @param {Feature<any>} geojson input to be buffered
 * @param {number} radius distance to draw the buffer
 * @param {string} [units='kilometers'] any of the options supported by turf units
 * @param {number} [steps=64] number of steps
 * @returns {Feature<Polygon|MultiPolygon>} buffered feature
 */function bufferFeature(geojson,radius,units,steps){var properties=geojson.properties||{};var geometry$$1=geojson.type==='Feature'?geojson.geometry:geojson;// Geometry Types faster than jsts
if(geometry$$1.type==='GeometryCollection'){var results=[];geomEach(geojson,function(geometry$$1){var buffered=bufferFeature(geometry$$1,radius,units,steps);if(buffered)results.push(buffered);});return featureCollection(results);}// Project GeoJSON to Transverse Mercator projection (convert to Meters)
var projected;var bbox=bbox$1(geojson);var needsTransverseMercator=bbox[1]>50&&bbox[3]>50;if(needsTransverseMercator){projected={type:geometry$$1.type,coordinates:projectCoords(geometry$$1.coordinates,defineProjection(geometry$$1))};}else{projected=toMercator(geometry$$1);}// JSTS buffer operation
var reader=new GeoJSONReader();var geom=reader.read(projected);var distance=radiansToDistance(distanceToRadians(radius,units),'meters');var buffered=geom.buffer(distance);var writer=new GeoJSONWriter();buffered=writer.write(buffered);// Detect if empty geometries
if(coordsIsNaN(buffered.coordinates))return undefined;// Unproject coordinates (convert to Degrees)
var result;if(needsTransverseMercator){result={type:buffered.type,coordinates:unprojectCoords(buffered.coordinates,defineProjection(geometry$$1))};}else{result=toWgs84(buffered);}return result.geometry?result:feature(result,properties);}/**
 * Coordinates isNaN
 *
 * @private
 * @param {Array<any>} coords GeoJSON Coordinates
 * @returns {boolean} if NaN exists
 */function coordsIsNaN(coords){if(Array.isArray(coords[0]))return coordsIsNaN(coords[0]);return isNaN(coords[0]);}/**
 * Project coordinates to projection
 *
 * @private
 * @param {Array<any>} coords to project
 * @param {GeoProjection} proj D3 Geo Projection
 * @returns {Array<any>} projected coordinates
 */function projectCoords(coords,proj){if(_typeof(coords[0])!=='object')return proj(coords);return coords.map(function(coord){return projectCoords(coord,proj);});}/**
 * Un-Project coordinates to projection
 *
 * @private
 * @param {Array<any>} coords to un-project
 * @param {GeoProjection} proj D3 Geo Projection
 * @returns {Array<any>} un-projected coordinates
 */function unprojectCoords(coords,proj){if(_typeof(coords[0])!=='object')return proj.invert(coords);return coords.map(function(coord){return unprojectCoords(coord,proj);});}/**
 * Define Transverse Mercator projection
 *
 * @private
 * @param {Geometry|Feature<any>} geojson Base projection on center of GeoJSON
 * @returns {GeoProjection} D3 Geo Transverse Mercator Projection
 */function defineProjection(geojson){var coords=center(geojson).geometry.coordinates.reverse();var rotate=coords.map(function(coord){return-coord;});return geoTransverseMercator().center(coords).rotate(rotate).scale(earthRadius);}//http://en.wikipedia.org/wiki/Haversine_formula
//http://www.movable-type.co.uk/scripts/latlong.html
/**
 * Takes two {@link Point|points} and finds the geographic bearing between them,
 * i.e. the angle measured in degrees from the north line (0 degrees)
 *
 * @name bearing
 * @param {Geometry|Feature<Point>|Array<number>} start starting Point
 * @param {Geometry|Feature<Point>|Array<number>} end ending Point
 * @param {Object} [options] Optional parameters
 * @param {boolean} [options.final=false] calculates the final bearing if true
 * @returns {number} bearing in decimal degrees, between -180 and 180 degrees (positive clockwise)
 * @example
 * var point1 = turf.point([-75.343, 39.984]);
 * var point2 = turf.point([-75.534, 39.123]);
 *
 * var bearing = turf.bearing(point1, point2);
 *
 * //addToMap
 * var addToMap = [point1, point2]
 * point1.properties['marker-color'] = '#f00'
 * point2.properties['marker-color'] = '#0f0'
 * point1.properties.bearing = bearing
 */function bearing(start,end,options){// Optional parameters
options=options||{};if(!isObject$2(options))throw new Error('options is invalid');var final=options.final;// Reverse calculation
if(final===true)return calculateFinalBearing(start,end);var degrees2radians$$1=Math.PI/180;var radians2degrees$$1=180/Math.PI;var coordinates1=getCoord(start);var coordinates2=getCoord(end);var lon1=degrees2radians$$1*coordinates1[0];var lon2=degrees2radians$$1*coordinates2[0];var lat1=degrees2radians$$1*coordinates1[1];var lat2=degrees2radians$$1*coordinates2[1];var a=Math.sin(lon2-lon1)*Math.cos(lat2);var b=Math.cos(lat1)*Math.sin(lat2)-Math.sin(lat1)*Math.cos(lat2)*Math.cos(lon2-lon1);var bear=radians2degrees$$1*Math.atan2(a,b);return bear;}/**
 * Calculates Final Bearing
 * @private
 * @param {Feature<Point>} start starting Point
 * @param {Feature<Point>} end ending Point
 * @returns {number} bearing
 */function calculateFinalBearing(start,end){// Swap start & end
var bear=bearing(end,start);bear=(bear+180)%360;return bear;}//http://en.wikipedia.org/wiki/Haversine_formula
//http://www.movable-type.co.uk/scripts/latlong.html
/**
 * Takes a {@link Point} and calculates the location of a destination point given a distance in degrees, radians, miles, or kilometers; and bearing in degrees. This uses the [Haversine formula](http://en.wikipedia.org/wiki/Haversine_formula) to account for global curvature.
 *
 * @name destination
 * @param {Geometry|Feature<Point>|Array<number>} origin starting point
 * @param {number} distance distance from the origin point
 * @param {number} bearing ranging from -180 to 180
 * @param {Object} [options={}] Optional parameters
 * @param {string} [options.units='kilometers'] miles, kilometers, degrees, or radians
 * @returns {Feature<Point>} destination point
 * @example
 * var point = turf.point([-75.343, 39.984]);
 * var distance = 50;
 * var bearing = 90;
 * var options = {units: 'miles'};
 *
 * var destination = turf.destination(point, distance, bearing, options);
 *
 * //addToMap
 * var addToMap = [point, destination]
 * destination.properties['marker-color'] = '#f00';
 * point.properties['marker-color'] = '#0f0';
 */function destination(origin,distance,bearing,options){// Optional parameters
options=options||{};if(!isObject$2(options))throw new Error('options is invalid');var units=options.units;var degrees2radians$$1=Math.PI/180;var radians2degrees$$1=180/Math.PI;var coordinates1=getCoord(origin);var longitude1=degrees2radians$$1*coordinates1[0];var latitude1=degrees2radians$$1*coordinates1[1];var bearing_rad=degrees2radians$$1*bearing;var radians=distanceToRadians(distance,units);var latitude2=Math.asin(Math.sin(latitude1)*Math.cos(radians)+Math.cos(latitude1)*Math.sin(radians)*Math.cos(bearing_rad));var longitude2=longitude1+Math.atan2(Math.sin(bearing_rad)*Math.sin(radians)*Math.cos(latitude1),Math.cos(radians)-Math.sin(latitude1)*Math.sin(latitude2));return point([radians2degrees$$1*longitude2,radians2degrees$$1*latitude2]);}/**
 * Takes a {@link LineString|line} and returns a {@link Point|point} at a specified distance along the line.
 *
 * @name along
 * @param {Feature<LineString>} line input line
 * @param {number} distance distance along the line
 * @param {Object} [options] Optional parameters
 * @param {string} [options.units="kilometers"] can be degrees, radians, miles, or kilometers
 * @returns {Feature<Point>} Point `distance` `units` along the line
 * @example
 * var line = turf.lineString([[-83, 30], [-84, 36], [-78, 41]]);
 * var options = {units: 'miles'};
 *
 * var along = turf.along(line, 200, options);
 *
 * //addToMap
 * var addToMap = [along, line]
 */function along(line,distance$$1,options){// Optional parameters
options=options||{};if(!isObject$2(options))throw new Error('options is invalid');// Validation
var coords;if(line.type==='Feature')coords=line.geometry.coordinates;else if(line.type==='LineString')coords=line.coordinates;else throw new Error('input must be a LineString Feature or Geometry');if(!isNumber(distance$$1))throw new Error('distance must be a number');var travelled=0;for(var i=0;i<coords.length;i++){if(distance$$1>=travelled&&i===coords.length-1)break;else if(travelled>=distance$$1){var overshot=distance$$1-travelled;if(!overshot)return point(coords[i]);else{var direction=bearing(coords[i],coords[i-1])-180;var interpolated=destination(coords[i],overshot,direction,options);return interpolated;}}else{travelled+=distance(coords[i],coords[i+1],options);}}return point(coords[coords.length-1]);}/**
 * Takes a {@link Point} and a {@link LineString} and calculates the closest Point on the (Multi)LineString.
 *
 * @name pointOnLine
 * @param {Geometry|Feature<LineString|MultiLineString>} lines lines to snap to
 * @param {Geometry|Feature<Point>|number[]} pt point to snap from
 * @param {Object} [options={}] Optional parameters
 * @param {string} [options.units='kilometers'] can be degrees, radians, miles, or kilometers
 * @returns {Feature<Point>} closest point on the `line` to `point`. The properties object will contain three values: `index`: closest point was found on nth line part, `dist`: distance between pt and the closest point, `location`: distance along the line between start and the closest point.
 * @example
 * var line = turf.lineString([
 *     [-77.031669, 38.878605],
 *     [-77.029609, 38.881946],
 *     [-77.020339, 38.884084],
 *     [-77.025661, 38.885821],
 *     [-77.021884, 38.889563],
 *     [-77.019824, 38.892368]
 * ]);
 * var pt = turf.point([-77.037076, 38.884017]);
 *
 * var snapped = turf.pointOnLine(line, pt, {units: 'miles'});
 *
 * //addToMap
 * var addToMap = [line, pt, snapped];
 * snapped.properties['marker-color'] = '#00f';
 */function pointOnLine(lines,pt,options){// Optional parameters
options=options||{};if(!isObject$2(options))throw new Error('options is invalid');// validation
var type=lines.geometry?lines.geometry.type:lines.type;if(type!=='LineString'&&type!=='MultiLineString'){throw new Error('lines must be LineString or MultiLineString');}var closestPt=point([Infinity,Infinity],{dist:Infinity});var length=0.0;flattenEach(lines,function(line){var coords=getCoords(line);for(var i=0;i<coords.length-1;i++){//start
var start=point(coords[i]);start.properties.dist=distance(pt,start,options);//stop
var stop=point(coords[i+1]);stop.properties.dist=distance(pt,stop,options);// sectionLength
var sectionLength=distance(start,stop,options);//perpendicular
var heightDistance=Math.max(start.properties.dist,stop.properties.dist);var direction=bearing(start,stop);var perpendicularPt1=destination(pt,heightDistance,direction+90,options);var perpendicularPt2=destination(pt,heightDistance,direction-90,options);var intersect=lineIntersect(lineString([perpendicularPt1.geometry.coordinates,perpendicularPt2.geometry.coordinates]),lineString([start.geometry.coordinates,stop.geometry.coordinates]));var intersectPt=null;if(intersect.features.length>0){intersectPt=intersect.features[0];intersectPt.properties.dist=distance(pt,intersectPt,options);intersectPt.properties.location=length+distance(start,intersectPt,options);}if(start.properties.dist<closestPt.properties.dist){closestPt=start;closestPt.properties.index=i;closestPt.properties.location=length;}if(stop.properties.dist<closestPt.properties.dist){closestPt=stop;closestPt.properties.index=i+1;closestPt.properties.location=length+sectionLength;}if(intersectPt&&intersectPt.properties.dist<closestPt.properties.dist){closestPt=intersectPt;closestPt.properties.index=i;}// update length
length+=sectionLength;}});return closestPt;}/**
 * Takes a {@link LineString|line}, a start {@link Point}, and a stop point
 * and returns a subsection of the line in-between those points.
 * The start & stop points don't need to fall exactly on the line.
 *
 * This can be useful for extracting only the part of a route between waypoints.
 *
 * @name lineSlice
 * @param {Feature<Point>} startPt starting point
 * @param {Feature<Point>} stopPt stopping point
 * @param {Feature<LineString>|LineString} line line to slice
 * @returns {Feature<LineString>} sliced line
 * @example
 * var line = turf.lineString([
 *     [-77.031669, 38.878605],
 *     [-77.029609, 38.881946],
 *     [-77.020339, 38.884084],
 *     [-77.025661, 38.885821],
 *     [-77.021884, 38.889563],
 *     [-77.019824, 38.892368]
 * ]);
 * var start = turf.point([-77.029609, 38.881946]);
 * var stop = turf.point([-77.021884, 38.889563]);
 *
 * var sliced = turf.lineSlice(start, stop, line);
 *
 * //addToMap
 * var addToMap = [start, stop, line]
 */function lineSlice(startPt,stopPt,line){var coords;if(line.type==='Feature'){coords=line.geometry.coordinates;}else if(line.type==='LineString'){coords=line.coordinates;}else{throw new Error('input must be a LineString Feature or Geometry');}var startVertex=pointOnLine(line,startPt);var stopVertex=pointOnLine(line,stopPt);var ends;if(startVertex.properties.index<=stopVertex.properties.index){ends=[startVertex,stopVertex];}else{ends=[stopVertex,startVertex];}var clipCoords=[ends[0].geometry.coordinates];for(var i=ends[0].properties.index+1;i<ends[1].properties.index+1;i++){clipCoords.push(coords[i]);}clipCoords.push(ends[1].geometry.coordinates);return lineString(clipCoords,line.properties);}

var debug = console.debug.bind(console, '%c turfHelper' + ':', "color:#00CC00;font-weight:bold;");
var warn = console.debug.bind(console, '%c turfHelper' + ':', "color:orange;font-weight:bold;");

/**
 * Transforma un array de gmaps.LatLng en un Feature.Polygon
 * @param  {Array.<google.maps.LatLng>} LatLngArray [description]
 * @return {Feature.<Polygon>}             [description]
 */
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

/**
 * Transforms a {@link google.maps.Marker} to a {@link Feature<Point>}
 * @param  {google.maps.Marker} marker  - marker object to transform
 * @return {Feature<Point>}    output Feature
 */
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

/**
 * [polylineToFeatureLinestring description]
 * @param  {Array.<google.maps.LatLng>|google.maps.Polyline} objeto array of positions or a google.maps.Polyline
 * @return {Feature.<LineString>}          [description]
 */
function polylineToFeatureLinestring(objeto) {
    var vertices;
    if (objeto instanceof google.maps.Polyline) {
        vertices = toCoords(objeto.getPath().getArray());
    } else {
        vertices = toCoords(objeto);
    }

    return lineString(vertices);
}

/**
 * Receives an object and returns a GeoJson Feature of type Polygon
 * @param  {google.maps.Polygon|Array.<google.maps.LatLng>|Feature.Polygon|Geometry} object object to transform into a Feature.Polygon
 * @return {Feature.Polygon}        [description]
 */
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

/**
 * Transforma un array de gmaps.LatLng en un featurecollection geoJson
 * donde cada Feature es un punto del array de entrada
 * @param  {Array<google.maps.LatLng>|google.maps.MVCArray} latLngArray array de posiciones {@link google.maps.LatLng}
 * @return {FeatureCollection}             geojson FeatureCollection
 */
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

/**
 * Takes a set of points and returns a concave hull polygon. Internally, this uses turf-tin to generate geometries.
 * @param  {Array<google.maps.LatLng>|Array<google.maps.LatLngLiteral>|google.maps.MVCArray} latLngArray array of google positions
 * @param  {number} maxEdge the size of an edge necessary for part of the hull to become concave (in miles)
 * @param  {string} units degrees, radians, miles, or kilometers
 * @return {Feature.<Polygon>}  a concave hull
 */
function concave$1(latLngArray, options) {

  var FeatureCollection = arrayToFeaturePoints(latLngArray);
  return concave(FeatureCollection, options);
}

/**
 * Simplifies an array of coordinates
 * @param  {Array.<google.maps.LatLng>|Array.<google.maps.LatLngLiteral>} coordArray Array of coordinates
 * @param  {number} tolerance   [description]
 * @param  {boolean} highQuality [description]
 * @return {Array.<Number>}  Array de coordenadas [lng,lat]
 */
function simplifyPointArray(coordArray, options) {
	options.tolerance = options.tolerance || 0.00001;
	options.highQuality = options.highQuality || false;
	var Feature = lineString(toCoords(coordArray));

	var simplifiedgeom = simplify(Feature, options);

	//debug('simplifyPointArray', 'geometry is', Feature.geometry, 'simplifiedgeom is', simplifiedgeom);

	return simplifiedgeom.geometry.coordinates;
}

/**
 * Simplified a Feature, google.maps.Polygon or google.maps.Polyline
 * @param  {google.maps.Polygon|google.maps.Polyline|Array.<google.maps.LatLng>|Feature.<Polygon>|Feature.<LineString>} object feature to be simplified
 * @param  {string} output either 'feature', 'geometry' or 'object' (google maps). Case insensitive. Defaults to feature
 * @param  {mumber} tolerance   simplification tolerance
 * @param  {boolean} highQuality [description]
 * @return {Feature|Geometry} whether or not to spend more time to create a higher-quality simplification with a different algorithm
 */
function simplifyFeature(object, output, options) {

	output = (output || 'feature').toLowerCase();

	var Feature;
	if (object instanceof google.maps.Polyline || object instanceof google.maps.Polygon) {
		var geometry = Wicket$1().fromObject(object).toJson();
		Feature = {
			type: "Feature",
			properties: {},
			geometry: geometry
		};
	} else if (object.type && object.type === 'Feature' && object.geometry) {
		Feature = object;
	} else {
		Feature = polygonToFeaturePolygon(object);
	}

	if (Feature.geometry.type === 'MultiPolygon') {
		Feature.geometry.type = 'Polygon';
		Feature.geometry.coordinates = Feature.geometry.coordinates[0];
	}
	var simplifiedgeom = simplify(Feature, options);

	if (simplifiedgeom && simplifiedgeom.geometry) {
		//debug('Simplified Feature', Feature, 'simplifiedgeom', simplifiedgeom);
		Feature = simplifiedgeom;
	} else {
		warn('Cannot simplify  Feature', Feature);
	}
	if (output === 'geometry') {
		return Feature.geometry;
	} else if (output === 'object') {
		return Wicket$1().fromJson(Feature.geometry).toObject();
	} else {
		return Feature;
	}
}

/**
 * Takes a linestring and returns a {@link Point|point} at a specified distance along the line.
 * @param  {google.maps.Polyline|Array.<google.maps.LatLng>|Array.<google.maps.LatLngLiteral>|Feature<LineString>} object input object
 * @param  {Number} distance    [description]
 * @param  {string} units can be degrees, radians, miles, or kilometers. Defaults to kilometers
 * @return {Feature.<Point>} Point distance units along the line
 */
function along$1(object, distance, units) {
	var Feature;

	if (object instanceof google.maps.Polyline) {
		var geometry = Wicket$1().fromObject(object).toJson();
		Feature = {
			type: "Feature",
			properties: {},
			geometry: geometry
		};
	} else if (object.type && object.type === 'Feature' && object.geometry) {
		Feature = object;
	} else {
		var arrayCoords = toCoords(object);
		Feature = lineString(arrayCoords);
	}

	return along(Feature, distance, units);
}

/**
 * Superpone dos Feature.<Polygon>
 * @param  {google.maps.Polygon|Array.<google.maps.LatLng>|Feature.Polygon} poly1 object to transform into a Feature.Polygon
 * @param  {google.maps.Polygon|Array.<google.maps.LatLng>|Feature.Polygon} poly1 object to transform into a Feature.Polygon
 * @return {Feature.<Polygon>|Feature.<MultiPolygon>}  result of the union. If inputs are disjoint, returns a Feature.Multipolygon
 */
function union$1(poly1, poly2) {
	var featurePolygon1 = polygonToFeaturePolygon(poly1),
	    featurePolygon2 = polygonToFeaturePolygon(poly2),
	    FeatureUnion = union(featurePolygon1, featurePolygon2);
	return FeatureUnion;
}

/**
 * Calculates a buffer for input features for a given radius. Units supported are miles, kilometers, and degrees.
 * @param  {google.maps.Polygon|google.maps.Polyline|google.maps.Marker|google.maps.LatLng|Array.<google.maps.LatLng>|Feature.<Polygon|Linestring|Point>} object input object
 * @param  {String} output  either 'geometry','object' (google.maps) or 'feature', case insensitive, defaults to 'feature'
 * @param  {Number} distance    [description]
 * @param  {String} units       'meters' or 'miles' etc
 * @return {Feature|Feature.<Geometry>}  A GeoJson Feature or its geometry, according to output parameter
 */
function createbuffer(object, output, radius, options) {
    options.units = options.units || 'meters';
    output = (output || 'feature').toLowerCase();

    var Feature;
    if (object instanceof google.maps.Polyline || object instanceof google.maps.Polygon || object instanceof google.maps.Marker || object instanceof google.maps.LatLng) {
        var geometry = Wicket$1().fromObject(object).toJson();
        Feature = {
            type: "Feature",
            properties: {},
            geometry: geometry
        };
    } else if (object.type && object.type === 'Feature' && object.geometry) {
        Feature = object;
    } else {
        Feature = polygonToFeaturePolygon(object);
    }

    var buffered = buffer(Feature, radius, options);

    if (buffered.type === 'FeatureCollection') {
        buffered = buffered.features[0];
    }

    if (output === 'geometry') {
        return buffered.geometry;
    } else if (output === 'object') {
        return Wicket$1().fromJson(buffered.geometry).toObject();
    } else {
        return buffered;
    }
}

/**
 * Filters an array of points returning those who falls inside a given {@link Polygon}
 * @param {Array<google.maps.Marker>} sourceArray array of {@link google.maps.Marker}
 * @param {Polygon|Multipolygon} geojsonPolygon  the polygon thay may contain the points
 * @return {{pointsInside:Array<google.maps.Marker>, pointsOutside:Array<google.maps.Marker>}} an object with the points that fall inside and outside the polygon
 */
function pointInPolygon(sourceArray, geojsonPolygon) {
	var pointsInside = [];
	var pointsOutside = [];

	if (geojsonPolygon.type !== 'Feature') {
		geojsonPolygon = {
			"type": "Feature",
			"properties": {},
			"geometry": geojsonPolygon
		};
	}
	if (geojsonPolygon.geometry.type === 'Polygon' || geojsonPolygon.geometry.type === 'Multipolygon') {
		forEach(sourceArray, function (item) {

			var Point = markerToFeaturePoint(item);
			//console.zlog('Point is', Point);
			if (inside(Point, geojsonPolygon)) {
				pointsInside.push(item);
			} else {
				pointsOutside.push(item);
			}
		});
	}

	return {
		pointsInside: pointsInside,
		pointsOutside: pointsOutside
	};
}

/**
 * Takes an array of points, google.maps.Polygon or Feature<Polygon> and returns {@link Point|points} at all self-intersections.
 *
 * @name kinks
 * @param  {google.maps.Polyline|google.maps.Polygon|Array.<google.maps.LatLng>|Feature<Polygon>} object array of points, google.maps.Polygon or Feature<Polygon>
 * @returns {FeatureCollection<Point>} self-intersections
 *
 */
function kinks$1(object) {
  var Feature;
  if (object instanceof google.maps.Polyline || object instanceof google.maps.Polygon) {
    var geometry = Wicket().fromObject(object).toJson();
    Feature = {
      type: "Feature",
      properties: {},
      geometry: geometry
    };
  } else if (object.type && object.type === 'Feature' && object.geometry) {
    Feature = object;
  } else {
    Feature = polygonToFeaturePolygon(object);
  }

  return kinks(Feature);
}

/**
 * Takes a kinked polygon and returns a feature collection of polygons that have no kinks. 
 * @param  {google.maps.Polygon|Array.<google.maps.LatLng>|Feature<Polygon>} object array of points, a google.maps.Polygon or Feature<Polygon>
 * @return {FeatureCollection<Polygon>}  Unkinked polygons
 */
function unkink(object) {

  var polygonFeature = polygonToFeaturePolygon(object);

  return unkinkPolygon(polygonFeature);
}

/**
 * The base implementation of `_.filter` without support for iteratee shorthands.
 *
 * @private
 * @param {Array|Object} collection The collection to iterate over.
 * @param {Function} predicate The function invoked per iteration.
 * @returns {Array} Returns the new filtered array.
 */
function baseFilter(collection, predicate) {
  var result = [];
  baseEach(collection, function (value, index, collection) {
    if (predicate(value, index, collection)) {
      result.push(value);
    }
  });
  return result;
}

/**
 * Iterates over elements of `collection`, returning an array of all elements
 * `predicate` returns truthy for. The predicate is invoked with three
 * arguments: (value, index|key, collection).
 *
 * **Note:** Unlike `_.remove`, this method returns a new array.
 *
 * @static
 * @memberOf _
 * @since 0.1.0
 * @category Collection
 * @param {Array|Object} collection The collection to iterate over.
 * @param {Function} [predicate=_.identity] The function invoked per iteration.
 * @returns {Array} Returns the new filtered array.
 * @see _.reject
 * @example
 *
 * var users = [
 *   { 'user': 'barney', 'age': 36, 'active': true },
 *   { 'user': 'fred',   'age': 40, 'active': false }
 * ];
 *
 * _.filter(users, function(o) { return !o.active; });
 * // => objects for ['fred']
 *
 * // The `_.matches` iteratee shorthand.
 * _.filter(users, { 'age': 36, 'active': true });
 * // => objects for ['barney']
 *
 * // The `_.matchesProperty` iteratee shorthand.
 * _.filter(users, ['active', false]);
 * // => objects for ['fred']
 *
 * // The `_.property` iteratee shorthand.
 * _.filter(users, 'active');
 * // => objects for ['barney']
 */
function filter(collection, predicate) {
  var func = isArray(collection) ? arrayFilter : baseFilter;
  return func(collection, baseIteratee(predicate, 3));
}

/**
 * The base implementation of methods like `_.max` and `_.min` which accepts a
 * `comparator` to determine the extremum value.
 *
 * @private
 * @param {Array} array The array to iterate over.
 * @param {Function} iteratee The iteratee invoked per iteration.
 * @param {Function} comparator The comparator used to compare values.
 * @returns {*} Returns the extremum value.
 */
function baseExtremum(array, iteratee, comparator) {
  var index = -1,
      length = array.length;

  while (++index < length) {
    var value = array[index],
        current = iteratee(value);

    if (current != null && (computed === undefined ? current === current && !isSymbol(current) : comparator(current, computed))) {
      var computed = current,
          result = value;
    }
  }
  return result;
}

/**
 * The base implementation of `_.gt` which doesn't coerce arguments.
 *
 * @private
 * @param {*} value The value to compare.
 * @param {*} other The other value to compare.
 * @returns {boolean} Returns `true` if `value` is greater than `other`,
 *  else `false`.
 */
function baseGt(value, other) {
  return value > other;
}

/**
 * Computes the maximum value of `array`. If `array` is empty or falsey,
 * `undefined` is returned.
 *
 * @static
 * @since 0.1.0
 * @memberOf _
 * @category Math
 * @param {Array} array The array to iterate over.
 * @returns {*} Returns the maximum value.
 * @example
 *
 * _.max([4, 2, 8, 6]);
 * // => 8
 *
 * _.max([]);
 * // => undefined
 */
function max(array) {
  return array && array.length ? baseExtremum(array, identity, baseGt) : undefined;
}

/**
 * The base implementation of `_.lt` which doesn't coerce arguments.
 *
 * @private
 * @param {*} value The value to compare.
 * @param {*} other The other value to compare.
 * @returns {boolean} Returns `true` if `value` is less than `other`,
 *  else `false`.
 */
function baseLt(value, other) {
  return value < other;
}

/**
 * Computes the minimum value of `array`. If `array` is empty or falsey,
 * `undefined` is returned.
 *
 * @static
 * @since 0.1.0
 * @memberOf _
 * @category Math
 * @param {Array} array The array to iterate over.
 * @returns {*} Returns the minimum value.
 * @example
 *
 * _.min([4, 2, 8, 6]);
 * // => 2
 *
 * _.min([]);
 * // => undefined
 */
function min(array) {
  return array && array.length ? baseExtremum(array, identity, baseLt) : undefined;
}

/**
 * Performs a deep comparison between two values to determine if they are
 * equivalent.
 *
 * **Note:** This method supports comparing arrays, array buffers, booleans,
 * date objects, error objects, maps, numbers, `Object` objects, regexes,
 * sets, strings, symbols, and typed arrays. `Object` objects are compared
 * by their own, not inherited, enumerable properties. Functions and DOM
 * nodes are compared by strict equality, i.e. `===`.
 *
 * @static
 * @memberOf _
 * @since 0.1.0
 * @category Lang
 * @param {*} value The value to compare.
 * @param {*} other The other value to compare.
 * @returns {boolean} Returns `true` if the values are equivalent, else `false`.
 * @example
 *
 * var object = { 'a': 1 };
 * var other = { 'a': 1 };
 *
 * _.isEqual(object, other);
 * // => true
 *
 * object === other;
 * // => false
 */
function isEqual(value, other) {
  return baseIsEqual(value, other);
}

/**
 * Takes two coordinates and returns the distance between them, in degrees
 * @param  {Array<number>} coord1 An array indicating a coordinate [lng, lat]
 * @param  {Array<number>} coord2 An array indicating a coordinate [lng, lat]
 * @return {number}        the distance between the points, in degrees 
 */
function diffCoords(coord1, coord2) {
	var vector = [Math.abs(coord1[0] - coord2[0]), Math.abs(coord1[1] - coord2[1])];
	return Math.sqrt(Math.pow(vector[0], 2) + Math.pow(vector[1], 2));
}

/**
 * Determina si dos lineas se intersectan
 * @param  {Array.<number>} line1Start [description]
 * @param  {Array.<number>} line1End   [description]
 * @param  {Array.<number>} line2Start [description]
 * @param  {Array.<number>} line2End   [description]
 * @param {boolean} useOldMethod if true, use old method instead of turf_line_intersect 
 * @return {Array}             [description]
 */
function lineIntersects$1(line1Start, line1End, line2Start, line2End, useOldMethod) {

	if (!useOldMethod) {
		var line1 = lineString([line1Start, line1End]),
		    line2 = lineString([line2Start, line2End]),
		    intersectionFC = lineIntersect(line1, line2);

		if (intersectionFC.features.length) {
			var intersection = intersectionFC.features[0].geometry.coordinates;
			intersection[0] = Math.round(intersection[0] * 100000000) / 100000000;
			intersection[1] = Math.round(intersection[1] * 100000000) / 100000000;
			return intersection;
		} else {
			return false;
		}
	}
	var line1StartX = line1Start[0],
	    line1StartY = line1Start[1],
	    line1EndX = line1End[0],
	    line1EndY = line1End[1],
	    line2StartX = line2Start[0],
	    line2StartY = line2Start[1],
	    line2EndX = line2End[0],
	    line2EndY = line2End[1];
	// if the lines intersect, the result contains the x and y of the intersection
	// (treating the lines as infinite) and booleans for whether line segment 1 or line segment 2 contain the point
	var denominator,
	    a,
	    b,
	    numerator1,
	    numerator2,
	    result = {
		x: null,
		y: null,
		onLine1: false,
		onLine2: false
	};
	denominator = (line2EndY - line2StartY) * (line1EndX - line1StartX) - (line2EndX - line2StartX) * (line1EndY - line1StartY);
	if (denominator === 0) {
		if (result.x !== null && result.y !== null) {
			return result;
		} else {
			return false;
		}
	}
	a = line1StartY - line2StartY;
	b = line1StartX - line2StartX;
	numerator1 = (line2EndX - line2StartX) * a - (line2EndY - line2StartY) * b;
	numerator2 = (line1EndX - line1StartX) * a - (line1EndY - line1StartY) * b;
	a = numerator1 / denominator;
	b = numerator2 / denominator;

	// if we cast these lines infinitely in both directions, they intersect here:
	result.x = line1StartX + a * (line1EndX - line1StartX);
	result.y = line1StartY + a * (line1EndY - line1StartY);

	// if line1 is a segment and line2 is infinite, they intersect if:
	if (a >= 0 && a <= 1) {
		result.onLine1 = true;
	}
	// if line2 is a segment and line1 is infinite, they intersect if:
	if (b >= 0 && b <= 1) {
		result.onLine2 = true;
	}
	// if line1 and line2 are segments, they intersect if both of the above are true
	if (result.onLine1 && result.onLine2) {
		result.x = Math.round(result.x * 100000000) / 100000000;
		result.y = Math.round(result.y * 100000000) / 100000000;

		return [result.x, result.y];
	} else {
		return false;
	}
}

/**
 * Takes two rings and finds their instersection points. If the rings are the same, the second ring is iterated skipping points already checked in the first one
 * @param  {Array.Array<number>} ring1 Array of coordinates [lng, lat]
 * @param  {Array.Array<number>} ring1 Array of coordinates [lng, lat]
 * @param {boolean} useOldMethod if true, use old method instead of turf_line_intersect 
 * @return {Object}       an object containing
 */
function traverseRings(ring1, ring2, useOldMethod) {
	var intersections = featureCollection([]);

	var samering = false;
	if (isEqual(ring1, ring2)) {
		samering = true;
	}
	for (var i = 0; i < ring1.length - 1; i++) {
		var startK = samering ? i : 0;
		for (var k = startK; k < ring2.length - 1; k++) {
			// don't check adjacent sides of a given ring, since of course they intersect in a vertex.
			if (ring1 === ring2 && (Math.abs(i - k) === 1 || Math.abs(i - k) === ring1.length - 2)) {
				continue;
			}

			var intersection = lineIntersects$1(ring1[i], ring1[i + 1], ring2[k], ring2[k + 1], useOldMethod);
			if (!intersection) {
				continue;
			}

			// si son lineas consecutivas no quiero detectar el límite entre ambas
			if ((diffCoords(intersection, ring1[0]) < 0.000005 || diffCoords(intersection, ring1[ring1.length - 1]) < 0.000005) && (diffCoords(intersection, ring2[0]) < 0.000005 || diffCoords(intersection, ring2[ring2.length - 1]) < 0.000005)) {
				continue;
			}

			//debug('intersection at',
			// intersection,
			//diffCoords(intersection, ring2[0]),
			//diffCoords(intersection, ring1[ring1.length - 1]));
			var FeatureIntersection = point([intersection[0], intersection[1]]);
			FeatureIntersection.properties = {
				position1: i,
				position2: k
			};
			intersections.features.push(FeatureIntersection);
		}
	}
	return intersections;
}

/**
 * Finds the {@link Point|points} where two {@link LineString|linestrings} intersect each other
 * @param  {Array.<google.maps.LatLng>} arrayLatLng1 array de posiciones {@link google.maps.LatLng}
 * @param  {Array.<google.maps.LatLng>} arrayLatLng2 array de posiciones {@link google.maps.LatLng}
 * @param {boolean} useOldMethod if true,use old method instead of turf_line_intersect 
 * @return {Array}        an array with [line1 trimmed at intersection,line2 trimmed at intersection,intersection ] 
 */
function trimPaths(arrayLatLng1, arrayLatLng2, useOldMethod) {

	var ring1 = toCoords(arrayLatLng1); // googleGeom1.geometry.coordinates;
	var ring2 = toCoords(arrayLatLng2); // googleGeom2.geometry.coordinates;


	var intersections = traverseRings(ring1, ring2, useOldMethod);

	if (intersections.features.length > 0) {

		var line1 = lineString(ring1);
		var line2 = lineString(ring2);
		var line1Start = point(ring1[0]);
		var line2End = point(ring2.slice(-1)[0]);
		var sliced1, sliced2;

		// The first segment of the first ring with a kink
		var first_segment_with_kinks = min(intersections.features, function (kink) {
			return kink.properties.position1;
		});
		//console.log('first_segment_with_kinks', JSON.stringify(first_segment_with_kinks));

		// All the intersections which belong to the first segment with a kink of the first ring
		var kinks_in_first_segment = filter(intersections.features, function (kink) {
			return kink.properties.position1 === first_segment_with_kinks.properties.position1;
		});

		// Among the kinks in the first segment, which one happens further along the ring2
		var chosenIntersection = max(kinks_in_first_segment, function (kink) {
			return kink.properties.position2;
		});

		var intersectLatLng = toLatLngs([chosenIntersection.geometry.coordinates])[0];

		// if the first intersection happens in the first segment of line1
		// then we don't slice it
		if (chosenIntersection.properties.position1 === 0) {
			sliced1 = line1;
		} else {
			sliced1 = lineSlice(line1Start, chosenIntersection, line1);
		}

		// if the first intersection happens after the last segment of line2
		// then we don't slice it
		if (chosenIntersection.properties.position2 >= ring2.length - 1) {
			sliced2 = line2;
		} else {
			sliced2 = lineSlice(chosenIntersection, line2End, line2);
		}

		return [toLatLngs(sliced1.geometry.coordinates), toLatLngs(sliced2.geometry.coordinates), intersectLatLng];
	}
	return [];
}

/**
 * This module acts as a bridge between google.maps and Turf, 
 * By converting google maps overlays such as
 * {@link google.maps.Polygon}
 * {@link google.maps.Polyline}
 * {@link google.maps.Point}
 *
 * to their proper geojson representation.
 *
 * This in turn allows to perform Turf operations that google.maps doesn't natively support
 * 
 * @name turfHelper
 * @module turfHelper
 */
var ig_turfhelper = {
    along: along$1,
    arrayToFeaturePoints: arrayToFeaturePoints,
    createbuffer: createbuffer,
    pointInPolygon: pointInPolygon,
    polygonToFeaturePolygon: polygonToFeaturePolygon,
    polylineToFeatureLinestring: polylineToFeatureLinestring,
    simplifyFeature: simplifyFeature,
    simplifyPointArray: simplifyPointArray,
    toLatLngs: toLatLngs,
    toCoords: toCoords,
    trimPaths: trimPaths,
    union: union$1,
    kinks: kinks$1,
    unkink: unkink,
    concave: concave$1
};

export { along$1 as along, arrayToFeaturePoints, createbuffer, pointInPolygon, polygonToFeaturePolygon, polylineToFeatureLinestring, simplifyFeature, simplifyPointArray, toLatLngs, toCoords, trimPaths, kinks$1 as kinks, unkink, union$1 as union, concave$1 as concave };
export default ig_turfhelper;
