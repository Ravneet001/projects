// var http = require('http');
// var config = require('./lib/config');


// var httpServer = http.createServer(function(req, res) {
//     res.end('Hi Rav');
// });

// //start the http server
// httpServer.listen(config.httpPort, function() {
//     console.log('server is listening on port '+ config.httpPort);
// });



var http = require('http');

function handle_requests(req,res) {
    
    var body = 'working';
    var contentLength = body.length;
    res.writeHead(200, {'Content-Length' : contentLength,
                        'Content-Type' : 'text/plain' } );
    res.end(body);


}

var server = http.createServer(handle_requests);

server.listen(81);
