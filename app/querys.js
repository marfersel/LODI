
module.exports.getData = getData;

const data = require('./data');
const configuration = require('./configuration');
const template = require('./template');

/*
 External library installed by npm
 */
const request = require('sync-request');

/*
Given a URI, it makes a query on the SPARQL Endpoint established in the configuration file.
If the resource exists, it gets the data and process it for obtaining a response.
The response can be a HTML page, as well as a N3 file, depends on the type set as parameter
 */
function getData (uri,type) {

    var object = {uri: uri};

    var blankNode = isBlankNode(object);

    if (blankNode){
        uri = object.uri;
    }

    // Generates the query
    var sparqlQuery = generateQuery(uri);

    console.log(sparqlQuery);

    // Get SPARQL Endpoint from configuration file
    var endpoint = configuration.getProperty("sparqlEndpoint");

    // Query to the endpoint
    var res = request('GET', endpoint+"?default-graph-uri=&query="+sparqlQuery+"&format=json");

    var status = res.statusCode;

    var response = {status: status};

    var dataJSON = JSON.parse(res.getBody());
    var results = dataJSON['results']['bindings'];

    // If there are results, the resource exists and it is processed
    if (results.length > 0) {

        if (type == "page") {
            response.html = data.processDataForPage(res.getBody(), uri, blankNode);
        }
        else if (type == "data"){
            response.data = data.processData(res.getBody(), uri);
        }
    }

    // If the resource doesn't exist, it generates a 404 HTML Page.
    else{
        response.status = 404;
        if (type == "page") {
            response.html = template.setError404(uri);
        }
        else if (type == "data"){
            response.data = "The requested resource does not exist at this server, or no information about it is available.";
        }
    }

    return response;
}

/*
Generates a SPARQL Query dynamically based on the resource's URI
and the label properties established in the configuration file
 */
function generateQuery(uri) {

    var querySelect = "SELECT ?p ?o min(?m) as ?m ?x ?y ?b ";

    var queryWhere = "WHERE{ ";

    var queryDirect = "{<"+uri+"> ?p ?o . " +
        "OPTIONAL{?o ?n ?m. } " +
        "OPTIONAL{SELECT ?o ?b ?m ";

    var queryContentBlank = "<"+uri+"> ?p ?o. " +
        "?o ?b ?m. " ;
    var queryFilterBlank = "FILTER isBlank(?o). " +
        "} " +
        "} ";

    var queryUnion = "} UNION ";
    var queryReverse = "{?x ?y <"+uri+">. ";
    var queryEnd = "}}";

    var prefixes = configuration.getProperty("labelProperty");
    var prefix;
    var prefixProcessed;

    if (prefixes.length > 0){
        queryEnd += " ORDER BY ";
    }

    for (prefix in prefixes){
        if (prefixes.hasOwnProperty(prefix)) {
            prefixProcessed = data.processPrefix(prefixes[prefix]);

            querySelect += "?" + prefixProcessed.value + " ";
            queryFilterBlank += "OPTIONAL{?o " + prefixProcessed.prefix + ":" + prefixProcessed.value + " ?" + prefixProcessed.value + ". }. ";
            queryDirect += "?" + prefixProcessed.value + " ";
            queryContentBlank += "OPTIONAL{?m " + prefixProcessed.prefix + ":" + prefixProcessed.value + " ?" + prefixProcessed.value + ". }. ";
            queryReverse += "OPTIONAL{?x " + prefixProcessed.prefix + ":" + prefixProcessed.value + " ?" + prefixProcessed.value + ". }. ";

            queryEnd += " ?" + prefixProcessed.value;
        }
    }

    return querySelect + queryWhere + queryDirect + queryWhere + queryContentBlank + queryFilterBlank + queryUnion + queryReverse + queryEnd;
}

/*
Auxiliary method to determine if a resource is a blank node or not
 */
function isBlankNode(object) {

    var blankNode = false;

    var datasetBase = configuration.getProperty("datasetBase");

    var uriAux = object.uri.substr(datasetBase[0].length);

    if (uriAux.startsWith("nodeID:/")){

        var matchesCount = uriAux.split("/").length - 1;

        if (matchesCount == 1){
            uriAux = uriAux.substr(0,7) + "/" + uriAux.substr(7);
        }

        object.uri = uriAux;

        blankNode = true;
    }

    return blankNode;
}