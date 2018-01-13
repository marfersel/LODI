
module.exports.setContentPug = setContentPug;
module.exports.setError404 = setError404;

const configuration = require('./configuration');
const geojson = require('./geojson');
const data = require('./data');

/*
 External library installed by npm
 */
const pug = require('pug');

/*
Once all the attributes and relations are processed and organized by their type, they are prepared to fill the
HTML template to be displayed
 */
function setContentPug(title, description, uri, types,
                       literals, relations, typedLiterals, reverseRelations,
                       reverseBlankNodes, blankNodes, geometries, points){

    var element;
    var literalsValues = [];
    var typedLiteralsValues = [];
    var relationsValues = [];
    var blankNodesValues = [];
    var reverseBlankNodesValues = [];
    var reverseRelationsValues = [];

    var geometriesValues = [];
    var pointsValues = [];

    var ele;

    var literalsPredicates = [];
    var typedLiteralsPredicates = [];
    var relationsPredicates = [];
    var blankNodesPredicates = [];
    var reverseBlankNodesPredicates = [];
    var reverseRelationsPredicates = [];
    var geometriesPredicates = [];
    var pointsPredicates = [];

    var prefixesUsed = [];

    var found, i;

    var geodata;
    var geoFigure = "";
    var geoPoint = "";

    /*
     List of used prefixes
     */
    var prefixes = [];

    for (element in literals) {
        if (literals.hasOwnProperty(element)) {

            var image = isImage(literals[element].value);

            ele = {relation: literals[element].relation, value: literals[element].value, image: image};

            literalsValues.push(ele);

            found = false;
            for (i = 0; i < literalsPredicates.length; i++) {
                if (literalsPredicates[i].url == literals[element].relation.url) {
                    found = true;
                    break;
                }
            }

            if (!found) {
                literalsPredicates.push(literals[element].relation);
                addPrefix(prefixes, literals[element].relation.prefix);
            }
        }
    }

    for (element in typedLiterals) {
        if (typedLiterals.hasOwnProperty(element)) {

            replaceType(typedLiterals[element].value);

            if (typedLiterals[element].value.datatype == "xsd:boolean"){
                if (typedLiterals[element].value.value == "1"){
                    typedLiterals[element].value.value = "True";
                }
                else{
                    typedLiterals[element].value.value = "False";
                }
            }

            ele = {relation: typedLiterals[element].relation, value: typedLiterals[element].value};
            typedLiteralsValues.push(ele);

            found = false;
            for (i = 0; i < typedLiteralsPredicates.length; i++) {
                if (typedLiteralsPredicates[i].url == typedLiterals[element].relation.url) {
                    found = true;
                    break;
                }
            }

            if (!found) {
                typedLiteralsPredicates.push(typedLiterals[element].relation);
                addPrefix(prefixes, typedLiterals[element].relation.prefix);
            }
        }
    }

    for (element in relations) {
        if (relations.hasOwnProperty(element)) {

            // Modify to try locally

            // relations[element].value.url = relations[element].value.value.replace(
            //     configuration.getProperty("datasetBase")[0],
            //     configuration.getProperty("webBase")[0] +
            //     configuration.getProperty("webResourcePrefix")[0].replace(new RegExp("\"", 'g'), ""));
            relations[element].value.url = relations[element].value.value;

            if (relations[element].title != "") {
                relations[element].value.value = relations[element].title;
            }

            ele = {relation: relations[element].relation, value: relations[element].value};

            relationsValues.push(ele);

            found = false;
            for (i = 0; i < relationsPredicates.length; i++) {
                if (relationsPredicates[i].url == relations[element].relation.url) {
                    found = true;
                    break;
                }
            }

            if (!found) {
                relationsPredicates.push(relations[element].relation);
                addPrefix(prefixes, relations[element].relation.prefix);
            }
        }
    }

    var blankTypes;

    var keys = Object.keys(blankNodes);

    for (var key in keys){

        blankTypes = [];

        for (element in blankNodes[keys[key]].attributes){
            if (blankNodes[keys[key]].attributes.hasOwnProperty(element)) {
                if (blankNodes[keys[key]].attributes[element].type == "type") {
                    blankTypes.push(blankNodes[keys[key]].attributes[element].value);
                }
                else{

                    if (isImage(blankNodes[keys[key]].attributes[element])){
                        blankNodes[keys[key]].attributes[element].type = "image";
                    }
                }
            }
        }

        ele = {relation: blankNodes[keys[key]].relation, nodeID: keys[key], types: blankTypes, attributes: blankNodes[keys[key]].attributes};
        blankNodesValues.push(ele);

        found = false;
        for (i = 0; i < blankNodesPredicates.length; i++) {
            if (blankNodesPredicates[i].url == blankNodes[keys[key]].relation.url) {
                found = true;
                break;
            }
        }

        if (!found) {
            blankNodesPredicates.push(blankNodes[keys[key]].relation);
            addPrefix(prefixes, blankNodes[keys[key]].relation.prefix);
        }
    }

    keys = Object.keys(reverseBlankNodes);

    for (key in keys){

        blankTypes = [];

        for (element in reverseBlankNodes[keys[key]].attributes){
            if (reverseBlankNodes[keys[key]].attributes.hasOwnProperty(element)) {
                if (reverseBlankNodes[keys[key]].attributes[element].type == "type") {
                    blankTypes.push(reverseBlankNodes[keys[key]].attributes[element].value);
                }
                else{

                    if (isImage(reverseBlankNodes[keys[key]].attributes[element])){
                        reverseBlankNodes[keys[key]].attributes[element].type = "image";
                    }
                }
            }
        }

        ele = {relation: reverseBlankNodes[keys[key]].relation, nodeID: keys[key], types: blankTypes, attributes: reverseBlankNodes[keys[key]].attributes};
        reverseBlankNodesValues.push(ele);

        found = false;
        for (i = 0; i < reverseBlankNodesPredicates.length; i++) {
            if (reverseBlankNodesPredicates[i].url == reverseBlankNodes[keys[key]].relation.url) {
                found = true;
                break;
            }
        }

        if (!found) {
            reverseBlankNodesPredicates.push(reverseBlankNodes[keys[key]].relation);
            addPrefix(prefixes, reverseBlankNodes[keys[key]].relation.prefix);
        }
    }

    for (element in reverseRelations){
        if (reverseRelations.hasOwnProperty(element)) {

            // Modify to try locally

            // reverseRelations[element].value.url = reverseRelations[element].value.value.replace(
            //     configuration.getProperty("datasetBase")[0],
            //     configuration.getProperty("webBase")[0] +
            //     configuration.getProperty("webResourcePrefix")[0].replace(new RegExp("\"", 'g'), ""));
            reverseRelations[element].value.url = reverseRelations[element].value.value;

            if (reverseRelations[element].title != "") {
                reverseRelations[element].value.value = reverseRelations[element].title;
            }

            ele = {relation: reverseRelations[element].relation, value: reverseRelations[element].value};

            reverseRelationsValues.push(ele);

            found = false;
            for (i = 0; i < reverseRelationsPredicates.length; i++) {
                if (reverseRelationsPredicates[i].url == reverseRelations[element].relation.url) {
                    found = true;
                    break;
                }
            }

            if (!found) {
                reverseRelationsPredicates.push(reverseRelations[element].relation);
                addPrefix(prefixes, reverseRelations[element].relation.prefix);
            }
        }
    }

    for (element in geometries){
        if (geometries.hasOwnProperty(element)) {

            try {
                geodata = geojson.processGeometry(geometries[element].value.value);

                geometries[element].value.value = geodata;

                ele = {relation: geometries[element].relation, value: JSON.stringify(geodata.geometry.coordinates)};
                //ele = {relation: geometries[element].relation};

                geometriesValues.push(ele);

                geometries[element].value.value = JSON.stringify(geometries[element].value.value);
                //geoFigure = JSON.stringify(geometriesValues[0].value.value);
                geoFigure = JSON.stringify(geometries[0].value.value);

                found = false;
                for (i = 0; i < geometriesPredicates.length; i++) {
                    if (geometriesPredicates[i].url == geometries[element].relation.url) {
                        found = true;
                        break;
                    }
                }

                if (!found) {
                    geometriesPredicates.push(geometries[element].relation);
                    addPrefix(prefixes, geometries[element].relation.prefix);
                }
            }
            catch (err) {
                console.error(err);

                ele = {relation: geometries[element].relation, value: geometries[element].value};
                literalsValues.push(ele);

                found = false;
                for (i = 0; i < literalsPredicates.length; i++) {
                    if (literalsPredicates[i].url == geometries[element].relation.url) {
                        found = true;
                        break;
                    }
                }

                if (!found) {
                    literalsPredicates.push(geometries[element].relation);
                    addPrefix(prefixes, geometries[element].relation.prefix);
                }
            }
        }
    }

    for (element in points){
        if (points.hasOwnProperty(element)) {

            try {
                geodata = geojson.processPoint(points[element].lat.value.value, points[element].long.value.value);

                pointsValues.push({lat: points[element].lat.value.value, long: points[element].long.value.value});

                pointsPredicates.push({lat: points[element].lat.relation, long: points[element].long.relation});
                addPrefix(prefixes, points[element].lat.relation.prefix);
                addPrefix(prefixes, points[element].long.relation.prefix);

                geoPoint = JSON.stringify(geodata)
            }
            catch (err) {
                console.error(err);

                ele = {relation: points[element].lat.relation, value: points[element].lat.value};
                literalsValues.push(ele);

                ele = {relation: points[element].long.relation, value: points[element].long.value};
                literalsValues.push(ele);

                found = false;
                for (i = 0; i < literalsPredicates.length; i++) {
                    if (literalsPredicates[i].url == points[element].lat.relation.url) {
                        found = true;
                        break;
                    }
                }
                if (!found) {
                    literalsPredicates.push(points[element].lat.relation);
                    addPrefix(prefixes, points[element].lat.relation.prefix);
                }

                found = false;
                for (i = 0; i < literalsPredicates.length; i++) {
                    if (literalsPredicates[i].url == points[element].long.relation.url) {
                        found = true;
                        break;
                    }
                }
                if (!found) {
                    literalsPredicates.push(points[element].long.relation);
                    addPrefix(prefixes, points[element].long.relation.prefix);
                }

            }

        }
    }

    for (i = 0; i < types.length; i++){
        addPrefix(prefixes, types[i].prefix);
    }

    var prefixListFromConfig = configuration.getPrefixList();
    prefixes = prefixes.sort();

    // Get list of prefixes used and their ontologies
    for (i = 0; i < prefixes.length; i++){
        prefixesUsed.push({prefix: prefixes[i], ontology: prefixListFromConfig[prefixes[i]]});
    }

    const compiledFunction = pug.compileFile('./pug/content.pug');

    // Project information loaded from configuration file
    var projectName = configuration.getProperty("projectName")[0].replace(new RegExp("\"", 'g'), "");
    var projectHomePage = configuration.getProperty("projectHomepage")[0];
    var projectLogo = configuration.getProperty("projectLogo")[0];
    var defaultView = configuration.getProperty("defaultView")[0].replace(new RegExp("\"", 'g'), "");

    var datasetBase = configuration.getProperty("datasetBase")[0];

    var dataUri = uri.slice(0,datasetBase.length) + "data/" + uri.slice(datasetBase.length);

    return compiledFunction({

        defaultView: defaultView,

        rTitle: title,
        rDescription: description,
        rUri: uri,
        rTypes: types,

        dataUri: dataUri,

        projectName: projectName,
        projectHomePage: projectHomePage,
        projectLogo: projectLogo,
        datasetBase: datasetBase,

        literals: literalsValues,
        typedLiterals: typedLiteralsValues,
        relations: relationsValues,
        blankNodes: blankNodesValues,
        reverseRelations: reverseRelationsValues,
        reverseBlankNodes: reverseBlankNodesValues,
        geometries: geometriesValues,
        points: pointsValues,

        geoFigure: geoFigure,
        geoPoint: geoPoint,

        literalsPredicates: literalsPredicates,
        typedLiteralsPredicates: typedLiteralsPredicates,
        relationsPredicates: relationsPredicates,
        blankNodesPredicates: blankNodesPredicates,
        reverseRelationsPredicates: reverseRelationsPredicates,
        reverseBlankNodesPredicates: reverseBlankNodesPredicates,
        geometriesPredicates: geometriesPredicates,
        pointsPredicates: pointsPredicates,

        prefixesUsed: prefixesUsed
    });
}

/*
Inserts the given prefix in the prefixes list if it is not already included
 */
function addPrefix(prefixes, prefix) {

    var exists = false;

    for (var i = 0; i < prefixes.length; i++){
        if (prefix == prefixes[i]){
            exists = true;
            break;
        }
    }

    if (!exists && prefix != "?") {
        prefixes.push(prefix);
    }
}

/*
Detects if an URI represents an image to be displayed
 */
function isImage(attribute) {
    var image = false;

    if (attribute.type == "uri"){
        attributeValue = attribute.value.toLowerCase();
        if (attributeValue.endsWith(".jpg") ||
            attributeValue.endsWith(".jpeg") ||
            attributeValue.endsWith(".png") ||
            attributeValue.endsWith(".gif")) {
            image = true;
        }
    }
    return image;
}

/*
It replaces the resource's type for another with reduced prefix to be displayed
 */
function replaceType(literal) {

    switch (literal.datatype){
        case "http://www.w3.org/2001/XMLSchema#int":
        case "http://www.w3.org/2001/XMLSchema#integer":
            literal.datatype = "xsd:integer";
            break;
        case "http://www.w3.org/2001/XMLSchema#decimal":
            literal.datatype = "xsd:decimal";
            break;
        case "http://www.w3.org/2001/XMLSchema#double":
            literal.datatype = "xsd:double";
            break;
        case "http://www.w3.org/2001/XMLSchema#boolean":
            literal.datatype = "xsd:boolean";
            break;
        case "http://www.w3.org/2001/XMLSchema#dateTime":
            literal.datatype = "xsd:dateTime";
            break;
    }
}

/*
Generates the 404 page template
 */
function setError404(uri){
    const compiledFunction = pug.compileFile('./pug/404.pug');

    var types = [];

    var projectName = configuration.getProperty("projectName")[0].replace(new RegExp("\"", 'g'), "");
    var projectHomePage = configuration.getProperty("projectHomepage")[0];
    var projectLogo = configuration.getProperty("projectLogo")[0];

    return compiledFunction({
        rTitle: "404 Not Found",
        rUri: uri,
        rDescription: "",
        rTypes: types,

        projectName: projectName,
        projectHomePage: projectHomePage,
        projectLogo: projectLogo
    });
}