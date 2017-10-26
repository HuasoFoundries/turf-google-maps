#!/usr/bin/env node

const Promise = require('bluebird');
const fs = Promise.promisifyAll(require("fs"));

const path = require('path');
const ProgressBar = require('progress');
const documentation = require('documentation');


var folders = ['src/components'];
var fileArray = [];

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
    'Wkt': 'https://github.com/arthur-e/Wicket'
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
});
