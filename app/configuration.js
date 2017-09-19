
module.exports.start = start;
module.exports.getProperty = getProperty;
module.exports.getPrefixList = getPrefixesList;
module.exports.getPrefixFromConf = getPrefixFromConf;

/*
External libraries installed by npm
 */
const N3 = require('n3');
const fs = require('fs');

/*
Set of all prefixes recognized by the server, established in the configuration file
 */
var prefixList;

/*
Set of all configuration properties with their values
 */
var properties = {};

/*
Defines the ontology used in the configuration file
 */
//TODO: Cambiar a propio
const confPrefix = "http://example.org/config#";

/*
First method to be executed when the server is up
It scrolls through the configuration file and saves all the prefixes, as well as
the custom properties to be used and displayed
 */
function start(){


    var parser = N3.Parser(),
        rdfStream = fs.createReadStream('./config/config.ttl');

    // While there are triples to process, it continues saving them.
    // At the end, it saves the prefixes in a list and calls the server to be launched
    parser.parse(rdfStream, function (error, triple, prefixes) {
        if (triple) {

            var key = "";

            if (triple.predicate.includes(confPrefix)){
                key = triple.predicate.substring(confPrefix.length,triple.predicate.length);
                if (properties[key] == null) {
                    properties[key] = [triple.object];
                }
                else{
                    properties[key].push(triple.object);
                }
            }
        }
        else{
            prefixList = prefixes;
            require('./server');
        }
    });
}

/*
Given a property's name, it returns, if exists, its value in the configuration file
 */
function getProperty(propertyName){
    var value = "";

    if (properties[propertyName] != null){
        value = properties[propertyName];
    }

    return value;
}

/*
Returns the prefixes list recognize by the server
 */
function getPrefixesList() {
    return prefixList;
}

/*
Given an ontology's prefix, it returns its reduced prefix from the prefixes list
 */
function getPrefixFromConf(prefix) {

    var values = Object.keys(prefixList).map(function(key) {
        return prefixList[key];
    });

    var position = valuePosition(prefix,values);
    var newPrefix = "";
    var keys = Object.keys(prefixList);

    if (position >= 0 && position < keys.length) {
        newPrefix = keys[position];
    }

    return newPrefix;
}

/*
Auxiliary method which returns the position from a value in an array.
If the value doesn't exists, it returns -1
 */
function valuePosition(value, myArray){

    var position = -1;

    for (var i=0; i < myArray.length; i++) {
        if (myArray[i] === value) {
            position = i;
        }
    }

    return position;
}