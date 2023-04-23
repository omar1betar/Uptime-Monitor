// Create and export the configuration variables

var environments = {};

//staging object default 

environments.staging = {
    'httpPort': 3000,
    'httpsPort': 3001,
    'envName': 'staging',
    'hashingSecret':'thisIsASecret'
};

environments.production = {
    'httpPort': 3002,
    'httpsPort': 3003,
    'envName': 'production',
    'hashingSecret':'thisIsASecret'

};
//determine which environment should be exported
var currentEnvironment = typeof(process.env.NODE_ENV) == 'string' ? process.env.NODE_ENV.toLowerCase() : '';

//check if the environment defined in the config, if not go for staging environment
var environmentToExport = typeof(environments[currentEnvironment]) == 'object' ? environments[currentEnvironment]: environments.staging;

//export 
module.exports = environmentToExport;
