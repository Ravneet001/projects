//for starting the server
var http = require('http');

//parsing the url path
 var url = require('url');

//String decoder for accessing the payload/data entered by the user for requesting tp the server
var StringDecoder = require('string_decoder').StringDecoder;

//importing the config.js file
var config = require('./lib/config');

var server = http.createServer(function(req,res) {

    //parsing the url
    var parsedUrl = url.parse(req.url,true);

    //path of the url---untrimmed path containing all the slashes and the server's name like localhost:3000/pname/
    var path = parsedUrl.pathname;

    //trim the url path ie remove the slashes and just getting the path given by the user
    var trimmedPath = path.replace(/^\/+|\/+$/g,'');

    
    //get the query string if enetered by the user
    var querySt = parsedUrl.query;

    
    //parsing the http methods that whether it is get post delete 
    var method = req.method.toLowerCase();
     
    //getting the type of request came by user to http and the information regarding the headers
    var header = req.headers;

    //to decode the utf-8 string given by the user
    var decoder = new StringDecoder('utf-8');
    
    //Setting the string empty to store the data/payload
    var payload = '';

    //when data is sent by the user then a function is called where the data sent by the user is appended with the empty payload string and displayed
    req.on('data', function(data) {
        payload += decoder.write(data); 
    });

    //when there is end of data i.e. data is successfully sent by the user then the payload empty string will call the end function to tell that the process is ended
    //and payload is appended with the finish of data and along with that response and anything you want to display can be displayed
    req.on('end', function() {
        payload += decoder.end();

    //define the chosenHandler and give them a path from the router object 
    var chosenHandler = typeof(router[trimmedPath]) !== 'undefined' ? router[trimmedPath] : handlers.notFound; 

    //data object by defining the type of method headers trimmedpath querystring object
    var data = {
        
        'trimmedPath' : trimmedPath,
        'method' : method,
        'queryStringObject' : querySt,
        'payload' : payload,
        'headers' : header
    };

    //function calling by defining the status code and payload
    chosenHandler(data, function(statusCode, payload) {

    statusCode = typeof(statusCode) == 'number' ? statusCode : 200;

    payload = typeof(payload) == 'object' ? payload : {};

    //convert the type of string to JSON
    var payloadString = JSON.stringify(payload);

    //define the content type as json and gives the output in json
    res.setHeader('Content-type', 'application/json');

    //status code definition
    res.writeHead(statusCode);  

    //display payloadstring
    res.end(payloadString);
    console.log('Returning the payload and status code ', payloadString, statusCode);

});


    //displaying the trimmed path
   // console.log('The url request send by the user is on path: ' + trimmedPath + ' \nhttp request method is: ' + method + ' \nQuery string url is: ' ,querySt);


});

});

server.listen(config.httpPort, function() {
    console.log('server is listening on port '+ config.httpPort +' and environment variable name is '+ config.envName);
});

//an empty object of handler
var handlers = {};

//ping handler
handlers.ping = function(data, callback) {
    callback(200);
}

//defining all the handlers
handlers.sample = function(data, callback){
    callback(406, {'name' : 'sample handler'});
}

handlers.user = function(data, callback){
    callback(406, {'name' : 'user handler'});
}

//not found handler
handlers.notFound = function(data, callback){
    callback(404);
} 
//object router
var router = {
'sample' : handlers.sample,
'user' : handlers.user,
'ping' : handlers.ping

};