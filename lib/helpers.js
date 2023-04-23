const crypto = require('crypto'); 
const config = require('./config');

var helpers ={};



//hash passwords  SHA256
helpers.hash =(str)=>{
    if(typeof(str)=='string' &&str.length > 0){
        var hash = crypto.createHmac('sha256', config.hashingSecret)
        // updating data
        .update(str)
        // Encoding to be used
        .digest('hex');
        return hash;
    }else{
        return false;
    }
};

//parse json string to object without throwing 
helpers.parseJsonToObject = (str)=>{
    try{
        console.log('str',str);
        var obj = JSON.parse(str);
        console.log('obj',obj);
        return obj;
    }catch(e){
        console.log(e);
        return{};
    }
};




module.exports = helpers;