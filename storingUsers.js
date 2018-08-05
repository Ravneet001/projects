//for starting the server
var http = require('http');
var https = require('https');
var _data = require('./lib/data');
var helpers = require('./lib/helpers');
var handlers = require('./lib/handlers');

//parsing the url path
var url = require('url');

//String decoder for accessing the payload/data entered by the user for requesting tp the server
var StringDecoder = require('string_decoder').StringDecoder;

//importing the config.js file
var config = require('./lib/config');
var fs = require('fs');

//@TODO testing the connection with api by sending message from twilio
helpers.sendTwilioSms('7888584074','hello!',function(err) {
    console.log('there is an error sending the message ' + err);
});

//@TODO for testing --create('directory name to test', 'file name to test', {data to test in json format}, callback function);

//  _data.create('users', '9988623401',{ 'foo' : 'bar'}, function(err){
//      console.log('this was an error ', err);    
//  } );

//testing for reading of data
//  _data.read('users', '9988623401', function(err, data){
//      console.log('this was an error ', err + ' and the data is ' , data);    
//  } );


//testing for updation of the file
// _data.update('users', '9988623401', {'ravneet':'gym girl'}, function(err){
//     console.log('this was an error ', err );    
// } );


//testing for deleting of a file
// _data.delete('test', 'myFile', function(err){
//     console.log('this was an error ', err );    
// } );


//Instantiate the http server
var httpServer = http.createServer(function(req, res) {
    unifiedServer(req, res);
});

//start the http server
httpServer.listen(config.httpPort, function() {
    console.log('server is listening on port '+ config.httpPort);
});

//instantiate https server
var httpsServerOptions = {
    'cert' : fs.readFileSync('./https/cert.pem'),
    'key' : fs.readFileSync('./https/key.pem')
};

//start the https server
var httpsServer = https.createServer(httpsServerOptions, function(req,res) {
    unifiedServer(req,res);
});


//start the https server
httpsServer.listen(config.httpsPort, function() {
    console.log('server is listening on port '+ config.httpsPort);
});


var unifiedServer = function(req, res) {

//parsing the url
var parsedUrl = url.parse(req.url,true);

//path of the url---untrimmed path containing all the slashes and the server's name like localhost:3000/pname/
var path = parsedUrl.pathname;

//trim the url path ie remove the slashes and just getting the path given by the user
var trimmedPath = path.replace(/^\/+|\/+$/g,'');


//get the query string if entered by the user
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
    'payload' : helpers.parseJsonToObj(payload),
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
//object router
var router = {
    'ping' : handlers.ping,
    'users' : handlers.users,
    'tokens' : handlers.tokens,
    'checks' : handlers.checks
};
};