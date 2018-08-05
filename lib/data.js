

var path = require('path');  // normalize the path to given directories
var fs = require('fs'); // file system
var helpers = require('./helpers');

var lib = {};

//base dir 
lib.baseDir = path.join(__dirname, '/../.data/');

//write data
lib.create = function(dir, file, data, callback) {

    //open file
fs.open(lib.baseDir + dir + '/' + file + '.json', 'wx', function(err, fileDescriptor) {

    if(!err && fileDescriptor) {
            var stringData = JSON.stringify(data);
            
            fs.write(fileDescriptor, stringData, function(err) {
                if(!err) {
                    fs.close(fileDescriptor, function(err) {
                        if(!err) {
                            callback(false);
                        }
                        else{
                            callback('error closing a new file');
                        }
                    });
                }
                else{
                  callback('Error writing to a new file');      
                }
            });
        }
    else{
        callback('new file cant be created it may already exist');
    }
} );
    //convert to string

    //write data and close
}

//read data from a file
 
lib.read = function(dir, file, callback) {

    fs.readFile(lib.baseDir+dir+'/'+file+'.json','utf-8',function(err, data) {

        if(!err && data) {
            var parsedData = helpers.parseJsonToObj(data);
            console.log(parsedData);
            callback(false, parsedData);
        }
        else{
            callback(err, data);
        }
    });

}

//updating the data in the file 

lib.update = function(dir, file, data, callback) {
    
    fs.open(lib.baseDir+dir+'/'+file+'.json','r+', function(err, fileDescriptor) {

        if(!err && fileDescriptor) {
            var stringData = JSON.stringify(data);
            
            fs.write(fileDescriptor, stringData, function(err) {
                if(!err) {
                    fs.close(fileDescriptor, function(err) {
                        if(!err) {
                            callback(false);
                        }
                        else {
                            callback('Error closing the file');
                        }

                    });
                }
                else {
                    callback('problem while writing the file');
                }
            });
        }
        else{
            callback('Error opening the file or it may not exist');
        }
    });
}


//deleting a file 

lib.delete = function(dir, file, callback) {
    
    fs.unlink(lib.baseDir+dir+'/'+file+'.json',function(err) {
        if(!err) {
            callback(false);
        }
        else{
            callback('Error deleting the file');
        }
    });
}
module.exports = lib;