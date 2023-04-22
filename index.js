// dep
const http = require('http');
const url = require('url');

//server should responded to all requests with string
var server = http.createServer((req,res)=>{
    //get url and parse it 
    var paresUrl = url.parse(req.url,true);

    //get the path from the url 
    var path = paresUrl.pathname;
    var trimmedPath = path.replace(/^\+|\/+$/g,'');

    //send the response 
    res.end('hello world\n');

    //log the request path 
    console.log('Request received on path: '+trimmedPath);
});

//start the server
server.listen(3000,()=>{
    console.log('server listening on port 3000');
});

