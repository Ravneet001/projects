//all the environment variables are defined here and are imported

var environments = {};

environments.staging = {
    'httpsPort' : 3000,
    'httpPort' : 5000,
    'envName' : 'staging',
    'hashingSecret' : 'thisIsASecret',
    'maxChecks' : 5,
    'twilio' : {
        'accountSid' : 'ACb32d411ad7fe886aac54c665d25e5c5d',
        'authToken' : '9455e3eb3109edc12e3d8c92768f7a67',
        'fromPhone' : '+15005550006'
      }
};



environments.production = {
    'httpsPort' : 3000,
    'httpPort' : 5001,
    'envName' : 'production',
    'hashingSecret' : 'thisIsASecret',
    'maxChecks' : 10,
    'twilio' : {
        'accountSid' : '',
        'authToken' : '',
        'fromPhone' : ''
      }
};

// environments.ravu = {
//     'httpsPort' : 3002,
//     'httpPort' : 5002,
//     'envName' : 'ravu'
// };

var currentEnvironment = typeof(process.env.NODE_ENV) == 'string' ? process.env.NODE_ENV.toLowerCase() : '';

var environmentToExport = typeof(environments[currentEnvironment]) == 'object' ? environments[currentEnvironment] : environments.staging;

//export the module
module.exports = environmentToExport;