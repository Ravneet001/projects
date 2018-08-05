var _data = require('./data');
var helpers = require('./helpers');
var config = require('./config');
//an empty object of handler
var handlers = {};

//ping handler
handlers.ping = function(data, callback) {
    callback(200);
}

//defining all the handlers
// handlers.sample = function(data, callback){
//     callback(406, {'name' : 'sample handler'});
// }

// handlers.user = function(data, callback){
//     callback(406, {'name' : 'user'});
// }

//not found handler
handlers.notFound = function(data, callback){
    callback(404);
} 

handlers.tokens = function(data, callback) {
    var acceptableMethods = ['get', 'put', 'post', 'delete'];
    if(acceptableMethods.indexOf(data.method) >-1) {
        handlers._tokens[data.method](data, callback);
    }
    else{
        callback(405);
    }
}

handlers.users = function(data, callback) {
    var acceptableMethods = ['post', 'get', 'put', 'delete'];
    if(acceptableMethods.indexOf(data.method) > -1){
        handlers._users[data.method](data, callback);
    }
    else{
        callback(405);
    }
}

handlers.checks = function(data, callback) {
    var acceptableMethods = ['get', 'post', 'put', 'delete'];
    if(acceptableMethods.indexOf(data.method) > -1 ) {
        handlers._checks[data.method](data, callback);
    }
    else{
        callback(405);
    }
}
//container for users handler
handlers._users = {};

handlers._tokens = {};

handlers._checks = {};

handlers._users.post = function(data, callback) {

    //required fields are FName, LName, PhoneNo, Password, TermsOfServiceAgreement
    var firstName = typeof(data.payload.firstName) == 'string' && data.payload.firstName.trim().length > 0 ? data.payload.firstName.trim() : false;
    var lastName = typeof(data.payload.lastName) == 'string' && data.payload.lastName.trim().length > 0 ? data.payload.lastName.trim() : false;
    var phoneNo = typeof(data.payload.phoneNo) == 'string' && data.payload.phoneNo.trim().length == 10 ? data.payload.phoneNo.trim() : false;
    var password = typeof(data.payload.password) == 'string' && data.payload.password.trim().length > 0 ? data.payload.password.trim() : false;
    var termsOfServiceAgreement = typeof(data.payload.termsOfServiceAgreement) == 'boolean' && data.payload.termsOfServiceAgreement == true? true : false;

    // console.log(firstName + lastName + phoneNo + password + termsOfServiceAgreement);
    if(firstName && lastName && phoneNo && password  && termsOfServiceAgreement) {
            
            // console.log(phoneNo);
        _data.read('users', phoneNo, function(err, data){
            // console.log(err + data);
            if(!err) {
                callback(400, {'error' : 'Phone number already  exists'});
            } 
            else {
               
                  //hashing of password
                var hashedPassword = helpers.hash(password);

                if(hashedPassword) {             
                    var userObject = {
                        "firstName" : firstName,
                        "lastName": lastName,
                        "phoneNo" : phoneNo,
                        'hashedPassword' : hashedPassword,
                        "termsOfServiceAgreement" : true
                    };
                    _data.create('users', phoneNo, userObject, function(err) {
                        if(!err) {
                                callback(200);
                        }
                        else{
                            console.log(err);
                            callback(500, {'error' : 'couldnot create the new user'});
                        }
                });
               
                }
            else{
                    
                    callback(500, {'error' : 'problem while hashing of the password'} );
               
                }
            

            }

        });
    }
    else {
        callback(400, {'error' : 'missing required fields'});
    }

};


// _data.read('users', 'myFile', function(err, data){
//     console.log('this was an error ', err + ' and the data is ' , data);    
// } );

handlers._users.get = function(data, callback) {
    var phoneNo = typeof(data.queryStringObject.phoneNo) == 'string' && data.queryStringObject.phoneNo.trim().length == 10 ? data.queryStringObject.phoneNo.trim() : false;
if(phoneNo) {
    
    var token = typeof(data.headers.token) == 'string' ? data.headers.token : false;
    
    handlers._tokens.verifyToken(token, phoneNo, function(isValidToken) {

        if(isValidToken) {

            _data.read('users', phoneNo, function(err, data){
                //  console.log(err+data);
                if(!err && data) {
                    delete data.hashedPassword;
                    callback(200,data);
                }
                else{
                    callback(404);
                }
            });
        }
        else{
            callback(403, {'error' : 'missing required fields or invalid token'});
        }
    });
  
}
else{
    callback(400, {'error' : 'missing required fields'});
}
};

handlers._users.put = function(data, callback) {
    var phoneNo = typeof(data.payload.phoneNo) == 'string' && data.payload.phoneNo.trim().length == 10 ? data.payload.phoneNo.trim() :false; 
   
   
   //optional for updation
    var firstName = typeof(data.payload.firstName) == 'string' && data.payload.firstName.trim().length > 0 ? data.payload.firstName.trim() :false; 
    var lastName = typeof(data.payload.lastName) == 'string' && data.payload.lastName.trim().length > 0 ? data.payload.lastName.trim() :false; 
    var password = typeof(data.payload.password) == 'string' && data.payload.password.trim().length > 0 ? data.payload.password.trim() :false; 
    if(phoneNo) {
        
        if(firstName || lastName || password) {

        var token = typeof(data.headers.token) == 'string' ? data.headers.token : false;
    
        handlers._tokens.verifyToken(token, phoneNo, function(isValidToken) {

            if(isValidToken) {
            
                _data.read('users', phoneNo, function(err, userData) {
                    if(!err && userData) {
                        if(firstName) {
                            userData.firstName = firstName;
                        }
                        if(lastName) {
                            userData.lastName = lastName;
                        }
                        if(password) {
                            userData.hashedPassword = helpers.hash(password);
                        }
                        _data.update('users', phoneNo, userData, function(err) {
    
                            if(!err){
                                callback(200);
                            }
                            else{
                                // console.log(err);
                                callback(500, {'error' : 'coudnot update'});
                            }
                        });
                    }
                    else{
                        callback(400, {'error' : 'User doesnt exists'});
                    }
    
                });

            }
            else{
                callback(403, {'error' : 'missing required fields or invalid token'});
                }
            });
            
            
        } 
        else{
            callback(400, {'error' : 'missing required fields'});
        }

    } 
    else{
        callback(400, {'error' : 'missing required fields'});
    }

    };

handlers._users.delete = function(data, callback) {
    var phoneNo = typeof(data.queryStringObject.phoneNo) == 'string' && data.queryStringObject.phoneNo.trim().length == 10 ? data.queryStringObject.phoneNo.trim() : false;

    if(phoneNo) {
        //read the data 
        var token = typeof(data.headers.token) == 'string' ? data.headers.token : false;
        console.log(token + ' ' + phoneNo);
        handlers._tokens.verifyToken(token, phoneNo, function(isValidToken) {
            // console.log(token + '  ' + phoneNo);
            console.log(isValidToken);
            if(isValidToken) {
                _data.read('users', phoneNo, function(err, data){
                    if(!err && data) {
                        _data.delete('users', phoneNo, function(err){
                            if(!err) {
                                //delete everything associated with users
                              /*  var userChecks = typeof(data.checks) == 'object' && data.checks instanceof Array ? data.checks : [];
                                var checksToDelete = userChecks.length;

                                if(checksToDelete > 0) {
                                var deletionErrors = false;
                                var checksDeleted = 0;

                                //loop for every checkid to delete
                                userChecks.forEach( function(checkId) {
                                    _data.delete('checks', checkId, function(err) {

                                        if(err) {
                                            deletionErrors = true;
                                        }
                                        checksDeleted++;
                                        if(checksDeleted == checksToDelete) {
                                            if(!deletionErrors) {
                                                callback(200);
                                            }
                                            else{
                                                callback(500, {'error' : 'couldnot delete the check due to system errors or some other problem'});
                                            }
                                        }
                                    });
                                });
                                }
                                else{
                                    callback(200);
                                }
                                */
                               callback(200);
                                }
                            else{
                                callback(500, {'error' : 'couldnot delete the user'});
                            }
                        });
                    }
                    else{
                        callback(400, {'error' : 'user doesnot exists'});
                    }
                });
            }
            else{
                callback(403, {'error' : 'missing required fields or invalid token'});
               
            }
        });

    }   
    else{
        callback(400, {'error' : 'missing required fields'});
    }
};

handlers._tokens.post = function(data, callback) {

    var phoneNo = typeof(data.payload.phoneNo) == 'string' && data.payload.phoneNo.trim().length == 10 ? data.payload.phoneNo.trim() : false;
    var password = typeof(data.payload.password) == 'string' && data.payload.password.trim().length > 0 ? data.payload.password.trim() : false;
    
    if(phoneNo && password) {

        _data.read('users', phoneNo, function(err, userData) {
        // console.log(err);
            if(!err && userData) {
                var hashedPassword = helpers.hash(password);
                if(hashedPassword == userData.hashedPassword) {
                    
                    var tokenId = helpers.createRandomString(20);
                    var expires = Date.now() * 1000 * 60 * 60; // will destroy the token automatically after 1 hour

                    var tokenObject = {
                        'phoneNo' : phoneNo,
                        'expires' : expires,
                        'tokenId' : tokenId
                    };
                    _data.create('tokens', tokenId, tokenObject, function(err){
                        // console.log(err);
                        if(!err) {
                            callback(200, tokenObject);
                        }
                        else{
                            callback(500, {'error' : 'couldnot create the new token' });
                        }                        
                    });
                }
                else {
                    callback(400, { 'error' : 'password donot match' });
                }
            }
            else{
                callback(400, { 'error' : 'phone no doesnot exists' });
            }
            
        });
        
    }
    else{
        callback(400, { 'error' : 'missing required fields' });
    }
    
};

handlers._tokens.get = function(data, callback) {
//optional data - none
// needed token id for getting the information with the help of the id 
    var tokenId = typeof(data.queryStringObject.tokenId) == 'string' && data.queryStringObject.tokenId.trim().length == 20 ? data.queryStringObject.tokenId.trim() : false;
    
    if(tokenId) {
        _data.read('tokens', tokenId, function(err, tokenData) {
            if(!err && tokenData) {
                callback(200, tokenData);
            }
            else{
                callback(404);
            }
        });
    }
    else{
        callback(400, {'error' : 'missing required fields'});
    }

};
// optional- none
// compulsory- tokenId

handlers._tokens.put = function(data, callback) {

    var tokenId = typeof(data.payload.tokenId) == 'string' && data.payload.tokenId.trim().length == 20 ? data.payload.tokenId.trim() : false;
    var extend = typeof(data.payload.extend) == 'boolean' && data.payload.extend ==  true ? true : false;

if(tokenId && extend) {
    _data.read('tokens', tokenId, function(err, tokenData) {
        if(!err && tokenData) {
            if(tokenData.expires > Date.now() ) {
               tokenData.expires = Date.now() + 1000 * 60 * 60;

                //updation of expires in tokenData
                _data.update('tokens', tokenId, tokenData, function(err) {
                    if(!err) {
                        callback(200);
                    }
                    else{
                        callback(500, {'error' : 'error while updation of extended time'});
                    }
                });

            }
            else{
                callback(400, {'error' : 'time cant be extended because token has already been expired'});
            }
        }
        else{
            callback(400, {'error' : 'token doesnot exists'});
        }
    });
}
else {
    callback(400, {'error' : 'missing required field(s) or invalid field(s)'});
}

};
handlers._tokens.delete = function(data, callback) {

    var tokenId = typeof(data.queryStringObject.tokenId) == 'string' && data.queryStringObject.tokenId.trim().length == 20 ? data.queryStringObject.tokenId.trim() : false;

    if(tokenId) {

        _data.read('tokens', tokenId, function(err, tokenData) {
            if(!err && tokenData) {
                _data.delete('tokens', tokenId, function(err) {
                    if(!err) {
                        callback(200);
                    }
                    else {  
                        callback(500, {'error' : 'token cangt be deleted' });
                    }
                });
            }
            else {
                callback(400, {'error' : 'token doesnot exists'});
            }
        });
        
       
    }
    else{
        callback(400, {'error' : 'missing required fields'});
    }
};

handlers._checks.post = function(data, callback) {
    
    var protocol = typeof(data.payload.protocol) == 'string' && ['http', 'https'].indexOf(data.payload.protocol) > -1 ?  data.payload.protocol : false;
    var url = typeof(data.payload.url) == 'string' && data.payload.url.trim().length > 0 ? data.payload.url.trim() : false;
    var method = typeof(data.payload.method) == 'string' && ['get', 'post', 'put', 'delete'].indexOf(data.payload.method) > -1 ? data.payload.method : false;
    var successCodes = typeof(data.payload.successCodes) == 'object' && data.payload.successCodes instanceof Array && data.payload.successCodes.length > 0 ? data.payload.successCodes : false;
    var timeOutSeconds= typeof(data.payload.timeOutSeconds) == 'number' && data.payload.timeOutSeconds % 1 === 0 && data.payload.timeOutSeconds >= 1 && data.payload.timeOutSeconds <= 5 ? data.payload.timeOutSeconds : false;

    //  console.log(protocol + url + method + successCodes + timeOutSeconds);
    if(protocol && url && method && successCodes && timeOutSeconds) {

        var token = typeof(data.headers.token) ==  'string' ? data.headers.token : false;

        _data.read('tokens', token, function(err, tokenData) {
            if(!err && tokenData) {

                var userPhoneNo = tokenData.phoneNo;
                
                _data.read('users', userPhoneNo, function(err, userData) {

                    if(!err && userData) {
                        var userChecks = typeof(userData.checks) == 'object' && userData.checks instanceof Array ? userData.checks : [];
                       
                        // console.log(userChecks.length + '  ' + config.maxChecks);
                    
                        if(userChecks.length < config.maxChecks) {
                            var checkId = helpers.createRandomString(20);
                            
                            var checkObject = {
                                'checkId' : checkId,
                                'protocol' : protocol,
                                'successCodes' : successCodes,
                                'timeOutSeconds' : timeOutSeconds,
                                'method' : method,
                                'url' : url,
                                'userPhoneNo' : userPhoneNo
                            };
                        _data.create('checks', checkId, checkObject, function(err) {
                            if(!err) {
                                userData.checks = userChecks;
                                userData.checks.push(checkId);

                                _data.update('users',userPhoneNo, userData, function(err) {
                                    if(!err) {
                                        callback(200, checkObject)
                                    }
                                    else{
                                        callback(500, {'error': 'could not update the user'});
                                    }
                                });
                            }
                            else{
                                callback(400,{'error' : 'the user has already max checks ( ' + config.maxChecks + ').'});
                            }
                        });

                        }
                        else {
                            callback(403, {'error' : 'length exceeded than the max length'});
                        }
                    
                    }
                    else{
                        callback(403, {'error' : 'error while reading user data'});
                    }
                });
            }
            else{
                callback(403, {'error' : 'error while reading from token data'});
            }
        });


    }
    else{
        callback(400, {'error' : 'missing required fields'});
    }

};

handlers._checks.get = function(data, callback) {

    var checkId = typeof(data.queryStringObject.checkId) == 'string' && data.queryStringObject.checkId.trim().length == 20 ? data.queryStringObject.checkId.trim()  : false;
if(checkId) {

    _data.read('checks', checkId, function(err, checkData) {
        if(!err && checkData) {
            var token = typeof(data.headers.token) == 'string' ? data.headers.token : false;
            //check if token is valid or not then only print the check data
            console.log('This is the Check Data ' + checkData);

            handlers._tokens.verifyToken(token, checkData.userPhoneNo, function(isValidToken) {
                if(isValidToken) {
                    callback(200, checkData);
                }  

                else {
                    callback(404);
                }

    });
        }

else {
    callback(400, {'error' : 'missing required fields'});
}

});
}
else{
 callback(400, {'error ' : ' missing required fields'});
}
};

handlers._checks.put = function(data, callback) {

    //compulsory
    var checkId = typeof(data.payload.checkId) == 'string' && data.payload.checkId.trim().length == 20 ? data.payload.checkId.trim() : false;
    
    //optional ones
    var protocol = typeof(data.payload.protocol) == 'string' && ['http', 'https'].indexOf(data.payload.protocol) > -1 ? data.payload.protocol : false;
    var method = typeof(data.payload.method) == 'string' && ['get', 'post', 'put', 'delete'].indexOf(data.payload.method) > -1 ? data.payload.method : false;
    var url = typeof(data.payload.url) == 'string' && data.payload.url.trim().length > 0 ? data.payload.url.trim() : false;  
    var successCodes = typeof(data.payload.successCodes) == 'object' && data.payload.successCodes instanceof Array ? data.payload.successCodes : [];
    var timeOutSeconds = typeof(data.payload.timeOutSeconds) == 'number' && data.payload.timeOutSeconds%1 === 0 && data.payload.timeOutSeconds >= 1 && data.payload.timeOutSeconds <= 5
if(checkId) {
    if(protocol || method || url || successCodes || timeOutSeconds) {

        _data.read('checks', checkId, function(err, checkData) {
            if(!err && checkData) {
            var token = typeof(data.headers.token) == 'string' ? data.headers.token : false;
            
            handlers._tokens.verifyToken(token, checkData.userPhoneNo, function(isValidToken) {
                if(isValidToken) {
                    if(protocol) {
                        checkData.protocol = protocol;
                    }
                    else if(method) {
                        checkData.method = method;

                    }
                    else if(url) {
                        checkData.url = url;

                    }
                    else if (successCodes) {
                        checkData.successCodes = successCodes;

                    }
                    else if(timeOutSeconds) {
                        checkData.timeOutSeconds = timeOutSeconds;

                    }
                _data.update('checks', checkId, checkData, function(err) {
                    if(!err) {
                        callback(200);
                    }
                    else{   
                        callback(500, {'error' : 'could not update the check'});
                    }
                });
                }
                else{
                    callback(403, {'error' : 'invalid token'});
                }
            });
            }
            else{
                callback(400, {'error'  : 'no check available'});
            }
        });
        
    }
    else{

        callback(400, {'error' : 'missing required fields'});

    }
}
else{
    callback(400, {'error' : 'missing required fields'});
}
};



handlers._checks.delete = function(data,callback) {

    var checkId = typeof(data.queryStringObject.checkId) == 'string' && data.queryStringObject.checkId.trim().length == 20 ? data.queryStringObject.checkId.trim() : false;
    // console.log(data.payload.checkId);
    // console.log(checkId.length);
    if(checkId) {
        _data.read('checks', checkId, function(err, checkData) {
            if(!err && checkData) {
                var token = typeof(data.headers.token) == 'string' ? data.headers.token : false;

                handlers._tokens.verifyToken(token, checkData.userPhoneNo, function(isValidToken) {
                    if(isValidToken) {

                        _data.delete('checks', checkId, function(err) {
                        if(!err) {
                            _data.read('users', checkData.userPhoneNo,function(err, userData) {

                                if(!err) {
                                    var userChecks = typeof(userData.checks) == 'object' && userData.checks instanceof Array ? userData.checks : [];
                                    
                                    var checkPosition = userChecks.indexOf(checkId);

                                    if(checkPosition > -1) {

                                        userChecks.splice(checkPosition, 1);
                                        
                                        userData.userChecks = userChecks;
                                        _data.update('users', userData.phoneNo, userData, function(err) {
                                            if(!err) {
                                                callback(200);
                                            }
                                            else{
                                                callback(500, {'error' : 'couldnot update the check in the users'});
                                            }
                                        });
                                    }
                                    else{
                                        callback(404, {'error' : 'no check found'});
                                    }

                                }
                                else{
                                    callback(500, {'error' : 'couldnot find the check in the users'});
                                }
                            });      
                        

                            }
                            else{
                                
                            callback(500, {'error' : 'couldnot delete the check'});
                            
                            
                            }
                        });
                    }
                    else{
                        // console.log(err);

                        callback(500, {'error' : 'invalid token'});
                    }
                });
            }
            else{
                callback(400, {'error' : 'no check available'});
            }
        });        
    }
    else{
        callback(400, {'error' : 'missing required fields'});
    }
};

handlers._tokens.verifyToken = function(tokenId, phoneNo, callback) {

    _data.read('tokens', tokenId, function(err, tokenData) {
        // console.log(err);
        if(!err && tokenData) {
            if(tokenData.phoneNo == phoneNo && tokenData.expires > Date.now() ) {
                callback(true);
            }
            else{
                callback(false);
            }
        }
        else{
            callback(false);
        }

    });
   
};

module.exports = handlers;
