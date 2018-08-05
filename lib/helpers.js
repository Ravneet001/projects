//helpers dependency

var crypto = require('crypto');
var config = require('./config');
var querystring = require('querystring');
var https = require('https');

var helpers = {};

helpers.hash = function(str) {

    if(typeof(str) == 'string' && str.length > 0) {
        var hash = crypto.createHmac('sha256', config.hashingSecret).update(str).digest('hex');
        return hash;
    }
    else{
        return false;
    }
};

helpers.sendTwilioSms = function(phone, msg, callback) {

    phone = typeof(phone) == 'string' && phone.trim().length == 10 ? phone.trim() : false;
    msg = typeof(msg) == 'string' && msg.trim().length > 0 && msg.trim().length <= 1600 ? msg.trim() : false;

    if(phone && msg) {

        var payload = {
            'From' : config.twilio.fromPhone,
            'To' :  '+91' + phone,
            'Body' : msg
        };
        var stringPayload = querystring.stringify(payload);

        var requestDetails = {
            'protocol' : 'https:',
            'method' : 'POST',
            'hostname' : 'api.twilio.com',
            'path' : '/2010-04-01/Accounts' + config.twilio.accountSid + '/Messages.json',
            'auth' : config.twilio.accountSid +':'+ config.twilio.authToken,
            'headers' : {
                'Content-Type' : 'application/x-www-form-urlencoded',
                'Content-Length': Buffer.byteLength(stringPayload)
                }
        };

        var req = https.request(requestDetails, function(res) {
        //status of the sent request
        var status = res.statusCode;
            
        if(status == 200 || status == 201) {
            callback(false);
        }
        else{
            callback('status code returned is '+ status);
        }

        });

        req.on('error', function(err) {
            callback(err);
        });

        req.write(stringPayload);

        req.end();


    }
    else{
        callback('Given prameters were invalid or missing');
    }

};

helpers.parseJsonToObj = function(str) {
     try{
        var obj = JSON.parse(str);
        return obj;
    }
    catch(e) {
        //  console.log(e);
        return {};
    }
};

helpers.createRandomString = function(strLength) {

    strLength = typeof(strLength) =='number' && strLength > 0 ? strLength : false;
    if(strLength) {
        
        var possibleCharacters = 'abcdefghijklmnopqrstuvwxyz0123456789';
        var str = '';
        for(i=0; i < strLength; i++) {
            var randomCharacters = possibleCharacters.charAt(Math.floor(Math.random() * possibleCharacters.length));
            str += randomCharacters; 
        
        }
        return str;
    
    }
    else{
        return false;
    }
   
};

module.exports = helpers;