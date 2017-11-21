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

/**
 * @desc The Wkt namespace.
 * @property    {String}    delimiter   - The default delimiter for separating components of atomic geometry (coordinates)
 * @namespace
 * @global
 */
const Wkt = function (obj) {
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
beginsWith = function (str, sub) {
    return str.substring(0, sub.length) === sub;
};

/**
 * Returns true if the substring is found at the end of the string.
 * @param   str {String}    The String to search
 * @param   sub {String}    The substring of interest
 * @return      {Boolean}
 * @private
 */
endsWith = function (str, sub) {
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
    } else if (initializer && typeof initializer !== undefined) {
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
    return (a.x === b.x && a.y === b.y);
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
    if (typeof obj === 'object' && !Wkt.isArray(obj)) {
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
    if (obj.hasOwnProperty('geometry')) { //Feature
        this.fromJson(obj.geometry);
        this.properties = obj.properties;
        return this;
    }
    coords = obj.coordinates;

    if (!Wkt.isArray(coords[0])) { // Point
        this.components.push({
            x: coords[0],
            y: coords[1]
        });

    } else {

        for (i in coords) {
            if (coords.hasOwnProperty(i)) {

                if (!Wkt.isArray(coords[i][0])) { // LineString

                    if (this.type === 'multipoint') { // MultiPoint
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
        type: (function () {
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
        }.call(this)).join('')
    }

    // Wkt BOX type gets a special bbox property in GeoJSON
    if (this.type.toLowerCase() === 'box') {
        json.type = 'Polygon';
        json.bbox = [];

        for (i in cs) {
            if (cs.hasOwnProperty(i)) {
                json.bbox = json.bbox.concat([cs[i].x, cs[i].y]);
            }
        }

        json.coordinates = [
            [
                [cs[0].x, cs[0].y],
                [cs[0].x, cs[1].y],
                [cs[1].x, cs[1].y],
                [cs[1].x, cs[0].y],
                [cs[0].x, cs[0].y]
            ]
        ];

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

                        if (Wkt.isArray(cs[i][j])) { // MULTIPOLYGONS
                            ring = [];

                            for (k in cs[i][j]) {
                                if (cs[i][j].hasOwnProperty(k)) {
                                    ring.push([cs[i][j][k].x, cs[i][j][k].y]);
                                }
                            }

                            rings.push(ring);

                        } else { // POLYGONS and MULTILINESTRINGS

                            if (cs[i].length > 1) {
                                rings.push([cs[i][j].x, cs[i][j].y]);

                            } else { // MULTIPOINTS
                                rings = rings.concat([cs[i][j].x, cs[i][j].y]);
                            }
                        }
                    }
                }

                json.coordinates.push(rings);

            } else {
                if (cs.length > 1) { // For LINESTRING type
                    json.coordinates.push([cs[i].x, cs[i].y]);

                } else { // For POINT type
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
        this.components = this.components.concat((wkt.type.slice(0, 5) === 'multi') ? wkt.components : [wkt.components]);
        break;

    default:
        this.components = [
            this.components,
            wkt.components
        ];
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
            if (typeof JSON === 'object' && typeof JSON.parse === 'function') {
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
            if (i !== (components.length - 1) && this.type !== 'multipoint') {
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
    point: function (point) {
        return String(point.x) + this.delimiter + String(point.y);
    },

    /**
     * Return a WKT string representing multiple atoms (points)
     * @param   multipoint  {Array}     Multiple x-and-y objects
     * @return              {String}    The WKT representation
     * @memberof Wkt.Wkt.extract
     * @instance
     */
    multipoint: function (multipoint) {
        var i, parts = [],
            s;

        for (i = 0; i < multipoint.length; i += 1) {
            s = this.extract.point.apply(this, [multipoint[i]]);

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
    linestring: function (linestring) {
        // Extraction of linestrings is the same as for points
        return this.extract.point.apply(this, [linestring]);
    },

    /**
     * Return a WKT string representing multiple chains (multilinestring) of atoms
     * @param   multilinestring {Array}     Multiple of multiple x-and-y objects
     * @return                  {String}    The WKT representation
     * @memberof Wkt.Wkt.extract
     * @instance
     */
    multilinestring: function (multilinestring) {
        var i, parts = [];

        if (multilinestring.length) {
            for (i = 0; i < multilinestring.length; i += 1) {
                parts.push(this.extract.linestring.apply(this, [multilinestring[i]]));
            }
        } else {
            parts.push(this.extract.point.apply(this, [multilinestring]));
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
    polygon: function (polygon) {
        // Extraction of polygons is the same as for multilinestrings
        return this.extract.multilinestring.apply(this, [polygon]);
    },

    /**
     * Return a WKT string representing multiple closed series (multipolygons) of multiple atoms
     * @param   multipolygon    {Array}     Collection of ordered x-and-y objects
     * @return                  {String}    The WKT representation
     * @memberof Wkt.Wkt.extract
     * @instance
     */
    multipolygon: function (multipolygon) {
        var i, parts = [];
        for (i = 0; i < multipolygon.length; i += 1) {
            parts.push('(' + this.extract.polygon.apply(this, [multipolygon[i]]) + ')');
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
    box: function (box) {
        return this.extract.linestring.apply(this, [box]);
    },

    geometrycollection: function (str) {
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
    point: function (str) {
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
    multipoint: function (str) {
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
    linestring: function (str) {
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
    multilinestring: function (str) {
        var i, components, line, lines;
        components = [];

        lines = Wkt.trim(str).split(this.regExes.doubleParenComma);
        if (lines.length === 1) { // If that didn't work...
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
    polygon: function (str) {
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
                        return n != ""
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
    box: function (str) {
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
    multipolygon: function (str) {
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
    geometrycollection: function (str) {
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
    point: function (config, component) {
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
    multipoint: function (config) {
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
    linestring: function (config, component) {
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
    multilinestring: function (config) {
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
    box: function (config, component) {
        var c = component || this.components;

        config = config || {};

        config.bounds = new google.maps.LatLngBounds(
            new google.maps.LatLng(c[0].y, c[0].x),
            new google.maps.LatLng(c[1].y, c[1].x));

        return new google.maps.Rectangle(config);
    },

    /**
     * Creates the framework's equivalent polygon geometry object.
     * @param   config      {Object}    An optional properties hash the object should use
     * @param   component   {Object}    An optional component to build from
     * @return              {google.maps.Polygon}
     */
    polygon: function (config, component) {
        var j, k, c, rings, verts;

        c = component || this.components;

        config = config || {
            editable: false // Editable geometry off by default
        };

        config.paths = [];

        rings = [];
        for (j = 0; j < c.length; j += 1) { // For each ring...

            verts = [];
            // NOTE: We iterate to one (1) less than the Array length to skip the last vertex
            for (k = 0; k < c[j].length - 1; k += 1) { // For each vertex...
                verts.push(new google.maps.LatLng(c[j][k].y, c[j][k].x));

            } // eo for each vertex

            if (j !== 0) { // Reverse the order of coordinates in inner rings
                if (config.reverseInnerPolygons === null || config.reverseInnerPolygons) {
                    verts.reverse();
                }
            }

            rings.push(verts);
        } // eo for each ring

        config.paths = config.paths.concat(rings);

        if (this.isRectangle) {
            return (function () {
                var bounds, v;

                bounds = new google.maps.LatLngBounds();

                for (v in rings[0]) { // Ought to be only 1 ring in a Rectangle
                    if (rings[0].hasOwnProperty(v)) {
                        bounds.extend(rings[0][v]);
                    }
                }

                return new google.maps.Rectangle({
                    bounds: bounds
                });
            }());
        } else {
            return new google.maps.Polygon(config);
        }
    },

    /**
     * Creates the framework's equivalent multipolygon geometry object.
     * @param   config  {Object}    An optional properties hash the object should use
     * @return          {Array}     Array containing multiple google.maps.Polygon
     */
    multipolygon: function (config) {
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
            multiFlag = (function () {
                var areas, l;

                l = obj.getPaths().length;
                if (l <= 1) { // Trivial; this is a single polygon
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

            }());
        }

        for (i = 0; i < obj.getPaths().length; i += 1) { // For each polygon (ring)...
            tmp = obj.getPaths().getAt(i);
            verts = [];
            for (j = 0; j < obj.getPaths().getAt(i).length; j += 1) { // For each vertex...
                verts.push({
                    x: tmp.getAt(j).lng(),
                    y: tmp.getAt(j).lat()
                });

            }

            if (!tmp.getAt(tmp.length - 1).equals(tmp.getAt(0))) {
                if (i % 2 !== 0) { // In inner rings, coordinates are reversed...
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
                if (sign(obj.getPaths().getAt(i)) > 0 && sign(obj.getPaths().getAt(i - 1)) > 0 ||
                    sign(obj.getPaths().getAt(i)) < 0 && sign(obj.getPaths().getAt(i - 1)) < 0 && !multiFlag) {
                    // ...They must both be inner rings (or both be outer rings, in a multipolygon)
                    verts = [verts]; // Wrap multipolygons once more (collection)
                }

            }

            //TODO This makes mistakes when a second polygon has holes; it sees them all as individual polygons
            if (i % 2 !== 0) { // In inner rings, coordinates are reversed...
                verts.reverse();
            }
            rings.push(verts);
        }

        response = {
            type: (multiFlag) ? 'multipolygon' : 'polygon',
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
        var rlat = (radius / earthsradius) * r2d;
        var rlng = rlat / Math.cos(point.lat() * d2r);

        for (var n = 0; n <= num_seg; n++) {
            var theta = Math.PI * (n / (num_seg / 2));
            lng = point.lng() + (rlng * Math.cos(theta)); // center a + radius x * cos(theta)
            lat = point.lat() + (rlat * Math.sin(theta)); // center b + radius y * sin(theta)
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
        for (i = 0; i < obj.getLength(); i += 1) { // For each ring...
            ring = obj.getAt(i);
            verts = [];
            for (j = 0; j < ring.getLength(); j += 1) { // For each vertex...
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
        for (k = 0; k < obj.getLength(); k += 1) { // For each multipolygon
            polygon = obj.getAt(k);
            rings = [];
            for (i = 0; i < polygon.getLength(); i += 1) { // For each ring...
                ring = polygon.getAt(i);
                verts = [];
                for (j = 0; j < ring.getLength(); j += 1) { // For each vertex...
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
        for (k = 0; k < obj.getLength(); k += 1) { // For each multipolygon
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

            type: (function () {
                var k, type = obj[0].constructor;

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

            }()),
            components: (function () {
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
            }())

        };
        response.components = response.components.comps;
        return response;

    }

    console.warn('The passed object does not have any recognizable properties.');

};

export {
    Wkt
};
export function Wicket() {
    return new Wkt.Wkt();
};

export function WKT2Object(WKT) {
    var wkt = new Wkt.Wkt();
    try {
        wkt.read(WKT);
    } catch (e) {
        console.warn('Imposible leer geometría', WKT);
        return false;
    }
    try {
        var obj = wkt.toObject({
            reverseInnerPolygons: true
        }); // Make an object
        obj.wkt = wkt;
        return obj;
    } catch (e) {
        console.warn('Imposible exportar geometría', WKT);
        return false;
    }

};
