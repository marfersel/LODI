
const configuration = require('./configuration');
const querys = require('./querys');

/*
 External libraries installed by npm
 */
const http = require('http');
const fs = require("fs");

var port = configuration.getProperty("port");

if (port != ""){
    port = port[0].replace(new RegExp("\"", 'g'), "");
}
else{
    port = 8080; // Default port
}

/*
Server which controls the recognition of URIs and manages all the features provided by the server
If the URI has the correct structure, it calls the methods to start querying for the resource, and
will generate the HTTP responses needed.
 */
http.createServer(function(request, response) {

    // var headers = request.headers;
    // var method = request.method;
    var url = request.url;
    var body = [];

    request.on('error', function(err) {
        console.error(err);
    }).on('data', function(chunk) {
        body.push(chunk);
    }).on('end', function() {
        body = Buffer.concat(body).toString();
    });

    response.on('error', function(err) {
        console.error(err);
    });

    var resource = configuration.getProperty("webResourcePrefix");

    // Replace each " for empty char
    resource = resource[0].replace(new RegExp("\"", 'g'), "");
    resource = "/" + resource;

    var pathname = url.split("/");
    pathname = pathname[pathname.length-1];

    var script, css, favicon;

    if (pathname == "client.js") {
        response.writeHead(200, {'Content-Type': 'application/javascript; charset=utf-8'});
        script = fs.readFileSync("./client/client.js", "utf8");
        response.write(script);
    }
    else if (pathname == "style.css"){
        response.writeHead(200, {'Content-Type': 'text/css; charset=utf-8'});
        css = fs.readFileSync("./stylesheets/style.css", "utf8");
        response.write(css);
    }
    else if (pathname == "favicon.ico"){
        response.writeHead(200, {'Content-Type': 'image/x-icon'});
        favicon = fs.readFileSync("./img/lod.ico");
        response.write(favicon);
    }
    else if (pathname == "marker.png"){
        response.writeHead(200, {'Content-Type': 'image'});
        favicon = fs.readFileSync("./img/marker.png");
        response.write(favicon);
    }
    else if (url.startsWith(resource)){ // Starts with ../recurso/

        var datasetBase = configuration.getProperty("datasetBase");
        var result;

        if (url.startsWith(resource + "page/")) { // HTML page request
            url = url.replace(resource + "page/", datasetBase);

            result = querys.getData(url, "page");

            response.writeHead(result.status, {'Content-Type': 'text/html; charset=utf-8'});
            response.write(result.html);
        }
        else if (url.startsWith(resource + "data/")){ // N3 data request
            url = url.replace(resource + "data/", datasetBase);

            result = querys.getData(url, "data");

            response.writeHead(result.status, {'Content-Type': 'text/plain; charset=utf-8'});
            response.write(result.data);
        }
        else{ // Default request. It redirects to the HTML page request

            // Modify to try locally

            //  url = url.replace(resource, datasetBase[0].replace(
            //      configuration.getProperty("datasetBase")[0],
            //          configuration.getProperty("webBase")[0] +
            //          configuration.getProperty("webResourcePrefix")[0].replace(new RegExp("\"", 'g'), "")) + "page/");
            url = url.replace(resource, datasetBase[0] + "page/");

            response.writeHead(301,
                {Location: url}
            );
        }

    }

    response.end();

}).listen(port); // Activates this server, listening on port 8080.
