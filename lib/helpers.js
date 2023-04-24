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

//create string of random chars of given len
helpers.createRandomString =(strLength)=>{
strLength = typeof(strLength)=='number' && strLength >0 ? strLength : false;
    if(strLength){
        var possibleCharacters = 'abcdefghijklmnopqrstuvwxyz0123456789';
        var str = '';
        for(var i=0; i<=strLength; i++){
            var randomCharacter = possibleCharacters.charAt(Math.floor(Math.random() *possibleCharacters.length));
            str+= randomCharacter; 
        }
        return str;
    }else{
        return false;
    }
};



module.exports = helpers;