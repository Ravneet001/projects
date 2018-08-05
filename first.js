// console.log('Hello world');

var http = require('http');

//String decoder for accessing the payload/data entered by the user for requesting tp the server
var StringDecoder = require('string_decoder').StringDecoder;

//parsing the url path
var url = require('url');

var server = http.createServer(function(req,res) {

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

        res.end('Hi Rav');

        console.log('Payload is: ',payload);
    });
   

});

server.listen(3000, function() {
    console.log('server is listening on port 3000 nowww');
});