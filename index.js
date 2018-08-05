// console.log('Hello world');

var http = require('http');

//parsing the url path
 
var url = require('url');

var server = http.createServer(function(req,res) {

    //parsing the url
    var parsedUrl = url.parse(req.url,true);

    //path of the url---untrimmed path containing all the slashes and the server's name like localhost:3000/pname/
    var path = parsedUrl.pathname;

    //trim the url path ie remove the slashes and just getting the path given by the user
    var trimmedPath = path.replace(/^\/+|\/+$/g,'');

    
    //get the query string if enetered by the user
    var querySt = parsedUrl.query;

    //getting the type of request came by user to http and the information regarding the headers
    var header = req.headers;

    //parsing the http methods that whether it is get post delete 
    var method = req.method.toLowerCase();

    res.end('Hi Rav');

    //displaying the trimmed path
   // console.log('The url request send by the user is on path: ' + trimmedPath + ' \nhttp request method is: ' + method + ' \nQuery string url is: ' ,querySt);

   console.log('header method is ',header);

});

server.listen(3000, function() {
    console.log('server is listening on port 3000 nowww');
});