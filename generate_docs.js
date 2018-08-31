#!/usr/bin/env node

const Promise = require('bluebird');
const fs = Promise.promisifyAll(require("fs"));

const path = require('path');
const ProgressBar = require('progress');
const documentation = require('documentation');


var folders = ['src/components'];
var fileArray = [];
var readmeLinks = {
    along: {
        label: 'along',
        description: 'Takes a google.maps.Polyline and returns a Feature of type Point at a specified distance along the line.' // eslint-disable-line max-len
    },

    concave: {
        label: 'concave',
        description: 'Takes a set of gooogle.maps.LatLng or google.maps.LatLngLiteral and returns a concave hull Feature of type Polygon or MultiPolygon' // eslint-disable-line max-len
    },
    coords_to_latlng: {
        label: 'coords_to_latlng',
        description: 'Different helper methods to transform gooogle.maps.LatLng or google.maps.LatLngLiteral to GeoJSON positions or viceversa' // eslint-disable-line max-len
    },
    kinks: {
        label: 'kinks',
        description: 'Takes a google.maps.Polygon and returns a FeatureCollection of Points representing the polygon self intersections' // eslint-disable-line max-len
    },
    point_in_polygon: {
        label: 'point_in_polygon',
        description: 'Takes an array of google.maps.Marker and a Polygon or MultiPolygon, returning an object containing with markers fall inside or outside it' // eslint-disable-line max-len
    },
    simplify_things: {
        label: 'simplify_things',
        description: 'Takes a google.maps.Polygon or google.maps.Polyline and returns a simplified version given a certain tolerance. Uses Douglas-Peucker algorithm' // eslint-disable-line max-len
    },
    trimpaths: {
        label: 'trimpaths',
        description: 'Takes two google.maps.Polyline and returns an array of coordinates [path of trimmed polyline1, path of trimmed polyline2, intersection point]' // eslint-disable-line max-len
    },
    operations: {
        label: 'operations',
        description: 'Operations to obtain the union, intersection of buffers of google.maps.Polygon objects' // eslint-disable-line max-len
    },
    unkink: {
        label: 'unkink',
        description: 'Takes a google.maps.Polygon with self intersections and returns a FeatureCollection of polygons without self intersections' // eslint-disable-line max-len
    },
    utils: {
        label: 'utils',
        description: 'Several utility functions to transform back and forth google.maps objects and Feature of their corresponding type' // eslint-disable-line max-len
    },
};

folders.forEach(function (foldername) {
    let folderpath = path.join(__dirname, foldername) + path.sep;
    fs.readdirSync(folderpath).forEach(file => {
        if (file.slice(-3) === '.js') {
            fileArray.push({
                path: folderpath + file,
                filename: file.replace('.js', ''),
                subfolder: foldername
            });
        }
    });
});

const bar = new ProgressBar('progress [:bar] :rate/bps :percent :etas :name', {
    complete: '=',
    incomplete: ' ',
    width: 20,
    total: fileArray.length
});


const paths = {
    GeoJSON: 'http://geojson.org/geojson-spec.html#geojson-objects',
    GeometryCollection: 'http://geojson.org/geojson-spec.html#geometrycollection',
    Point: 'http://geojson.org/geojson-spec.html#point',
    MultiPoint: 'http://geojson.org/geojson-spec.html#multipoint',
    LineString: 'http://geojson.org/geojson-spec.html#linestring',
    MultiLineString: 'http://geojson.org/geojson-spec.html#multilinestring',
    Polygon: 'http://geojson.org/geojson-spec.html#polygon',
    MultiPolygon: 'http://geojson.org/geojson-spec.html#multipolygon',
    Geometry: 'http://geojson.org/geojson-spec.html#geometry',
    Feature: 'http://geojson.org/geojson-spec.html#feature-objects',
    FeatureCollection: 'http://geojson.org/geojson-spec.html#feature-collection-objects',
    Position: 'http://geojson.org/geojson-spec.html#positions',
    'google.maps.LatLng': 'https://github.com/amenadiel/google-maps-documentation/blob/master/docs/LatLng.md',
    'google.maps.LatLngLiteral': 'https://github.com/amenadiel/google-maps-documentation/blob/master/docs/LatLngLiteral.md',
    'google.maps.Marker': 'https://github.com/amenadiel/google-maps-documentation/blob/master/docs/Marker.md',
    'google.maps.Polygon': 'https://github.com/amenadiel/google-maps-documentation/blob/master/docs/Polygon.md',
    'google.maps.Polyline': 'https://github.com/amenadiel/google-maps-documentation/blob/master/docs/Polyline.md',
    'google.maps.Rectangle': 'https://github.com/amenadiel/google-maps-documentation/blob/master/docs/Rectangle.md',
    'Wkt.Wkt': 'https://github.com/arthur-e/Wicket',
    'Wkt': 'https://github.com/arthur-e/Wicket',
    'Wicket': 'https://github.com/arthur-e/Wicket'
};

function generateDocs(fileObj, callback) {

    // Build Documentation
    documentation.build(fileObj.path, {
        shallow: true
    }).then(res => {
        return documentation.formats.md(res, {
            paths
        });
    }).then(output => {
        let label = `${fileObj.filename}`,
            link = `docs/${fileObj.filename}.md`;

        readmeLinks[label] = readmeLinks[label] || {
            label: label,
            description: '' // eslint-disable-line max-len
        };

        readmeLinks[label].link = link;

        return fs.writeFileAsync(`${__dirname}/docs/${fileObj.filename}.md`, output);
    }).then(function () {
        return;

    }).catch(function (err) {
        console.warn('error when parsing file ' + fileObj.filename);
        console.error(err);
        return;
    });
}

Promise.reduce(fileArray, function (total, fileObj) {
    return Promise.resolve()
        .then(function () {
            return generateDocs(fileObj);
        })
        .then(function () {
            bar.interrupt('processing ' + fileObj.filename);
            bar.tick({
                name: fileObj.filename
            });

            return;
        })
        .delay(100)
        .then(function () {
            total++;

            return total;
        });
}, 0).then(function (total) {
    console.log();
    console.log('Processed ' + total + ' files');
    return fs.readFileAsync(path.resolve(`${__dirname}/README.md`));
}).then((content) => {
    let readmeString = content.toString('UTF8').split('## API')[0].trim();
    readmeString += `

## API

`;
    Object.values(readmeLinks).forEach((linkObj) => {
        readmeString += `
### ${linkObj.label}

${linkObj.description}

See [${linkObj.label}](${linkObj.link}).
`;
    });
    return fs.writeFileAsync(path.resolve(`${__dirname}/README.md`), readmeString);
});
