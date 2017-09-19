
module.exports.processGeometry = processGeometry;
module.exports.processPoint = processPoint;

/*
 External libraries installed by npm
 */
const GJV = require("geojson-validation");
const GeoJSON = require('geojson');

/*
Given a string of coordinates, it process them in order to create a GeoJSON based on
those coordinates.
It will be automatically detected the type of the geometry element:
    Point: [x,y]
    LineString: [[x,y],[z,k]]
    Polygon: [[[x,y],[z,k],[q,w],[x,y]]]
 */
function processGeometry(value) {

    value = value.replace(" ", "");

    var data = {coordinates: JSON.parse(value)};
    var geojson;

    if (value[0] == "[" && value[value.length - 1] == "]"){
        if (value[1] == "[" && value[value.length - 2] == "]"){
            if (value[2] == "[" && value[value.length - 3] == "]"){
                geojson = GeoJSON.parse(data, {Polygon: "coordinates"});
            } else{
                geojson = GeoJSON.parse(data, {LineString: 'coordinates'});
            }
        } else{
            geojson = GeoJSON.parse(data, {Point: 'coordinates'});
        }
    } else{
        throw "Invalid geometric configuration for generating GeoJSON";
    }

    if(!GJV.valid(geojson)){
        throw "Invalid GeoJSON generated";
    }

    return geojson;
}

/*
Given two coordinates (lat, long), generates a GeoJSON based on those values
 */
function processPoint(lat, long) {

    var data = {lat: lat, long: long};
    var geojson = GeoJSON.parse(data, {Point: ['lat', 'long']});

    if(!GJV.valid(geojson)){
        throw "Invalid GeoJSON Point generated";
    }

    return geojson;
    
}