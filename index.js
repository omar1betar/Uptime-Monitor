// dep
const http = require('http');
const https = require('https');
const url = require('url');
const StringDecoder = require('node:string_decoder').StringDecoder;
const config = require('./config');
const fs = require('fs');
//Http server 
var httpServer = http.createServer((req, res) => {
unifiedServer(req, res);
});

//start the http server
httpServer.listen(config.httpPort, () => {
    console.log('server listening on port:', config.httpPort);
});

//Https server 
var httpsServerOptions = {
    'key': fs.readFileSync('./https/key.pem'),
    'cert':fs.readFileSync('./https/cert.pem')
};
var httpsServer = https.createServer(httpsServerOptions,(req, res) => {
    unifiedServer(req, res);
    });

//start https server
httpsServer.listen(config.httpsPort, () => {
    console.log('server listening on port:', config.httpsPort);
});

//server logic
var unifiedServer = (req, res) => {

    //get url and parse it 
    var paresUrl = url.parse(req.url, true);

    //get the path from the url 
    var path = paresUrl.pathname;
    var trimmedPath = path.replace(/^\/+|\/+$/g, '');
    //get the query string as object
    var queryString = paresUrl.query;
    //get the http method 
    var method = req.method.toLowerCase();
    //get the headers 
    var headers = req.headers;
    //get payloads
    var decoder = new StringDecoder('UTF-8');
    var buffer = '';
    req.on('data', (data) => {
        buffer += decoder.write(data);
    });
    req.on('end', () => {
        buffer += decoder.end();

        // choose the handler this req should go to
        console.log('path', trimmedPath)
        var chooseHandler = typeof (router[trimmedPath]) !== 'undefined' ? router[trimmedPath] : handlers.notFound;
        console.log('path1', router[trimmedPath])
        var data = {
            'trimmedPath': trimmedPath,
            'queryStringObject': queryString,
            'method': method,
            'headers': headers,
            'payload': buffer
        };
        //route the req to the handler specified in the router 
        chooseHandler(data, (statusCode, payload) => {
            statusCode = typeof (statusCode) == 'number' ? statusCode : 200;
            payload = typeof (payload) == 'object' ? payload : {};

            //convert payload to string 
            var payloadString = JSON.stringify(payload);

            //return th r res 
            //send the response 
            res.setHeader('Content-Type', 'application/json');
            res.writeHead(statusCode);
            res.end(payloadString);
            console.log('Response:', statusCode, payloadString);

        });



        //log the request path 
        // console.log('Request received on path: '+trimmedPath +
        // ' with method: '+method+' and with these query string parameters: ',queryString);
        // console.log('headers:' ,headers);
        // console.log('payloads:' ,buffer);
    });
};


//define handlers 
var handlers = {};

//sample handlers
handlers.sample = (data, callback) => {
    //callback http statas code , object payload
    callback(406, { 'name': 'Sample Handler' })

};
handlers.notFound = (data, callback) => {
    callback(404)
};
//define req router 
var router = {
    'sample': handlers.sample
}
