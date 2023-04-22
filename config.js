// Create and export the configuration variables

var environments = {};

//staging object default 

environments.staging = {
    'port': 3000,
    'envName': 'staging'
};

environments.production = {
    'port': 3001,
    'envName': 'production'
};
//determine which environment should be exported
var currentEnvironment = typeof(process.env.NODE_ENV) == 'string' ? process.env.NODE_ENV.toLowerCase() : '';

//check if the environment defined in the config, if not go for staging environment
var environmentToExport = typeof(environments[currentEnvironment]) == 'object' ? environments[currentEnvironment]: environments.staging;

//export 
module.exports = environmentToExport;
