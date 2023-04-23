const _data = require('./data');
const helpers = require('./helpers');
//define handlers 
var handlers = {};

//users 
handlers.users = (data, callback) => {
    var acceptableMethod = ['post', 'put', 'delete', 'get'];
    if (acceptableMethod.indexOf(data.method) > -1) {
        handlers._users[data.method](data, callback);
        console.log(data);
    } else {
        callback(405);
    }
};
//block  for user sub method 
handlers._users = {};

handlers._users.post = (data, callback) => {
    var firstName = typeof (data.payload.firstName) == 'string' && data.payload.firstName.trim().length > 0 ? data.payload.firstName.trim() : false;

    var lastName = typeof (data.payload.lastName) == 'string' && data.payload.lastName.trim().length > 0 ? data.payload.lastName.trim() : false;
    var phone = typeof (data.payload.phone) == 'string' && data.payload.phone.trim().length >= 10 ? data.payload.phone.trim() : false;
    var password = typeof (data.payload.password) == 'string' && data.payload.password.trim().length > 0 ? data.payload.password.trim() : false;
    var tosAgreement = typeof (data.payload.tosAgreement) == 'boolean' && data.payload.tosAgreement == true ? true : false;

    if (firstName && lastName && phone && password && tosAgreement) {
        // make sure user does not  already exist
        _data.read('users',phone, (err) => {
            if (err) {
                //hash the password 
                var hashedPassword = helpers.hash(password);
                if (hashedPassword) {
                    //create user object 
                    var userObject = {
                        'firstName': firstName,
                        'lastName': lastName,
                        'phone': phone,
                        'hashedPassword': hashedPassword,
                        'tosAgreement': true
                    };

                    //store user 
                    _data.create('users', phone, userObject, (err) => {
                        if (!err) {
                            callback(200);
                        } else {
                            console.log(err);
                            callback(500, { 'Error': 'could not create the new user ' });
                        }
                    });
                } else {
                    callback(500, { 'Error': 'Could not hash the user`s password' });
                }

            } else {
                callback(400, { 'Error': 'this phone number already exist' });
            }
        });
    } else {
        callback(400, { 'Error': 'Missing Required Parameters' });
    }
};

handlers._users.put = (data, callback) => {
    var phone = typeof (data.payload.phone) == 'string' && data.payload.phone.trim().length >= 10 ? data.payload.phone : false;
    var firstName = typeof (data.payload.firstName) == 'string' && data.payload.firstName.trim().length > 0 ? data.payload.firstName.trim() : false;
    var lastName = typeof (data.payload.lastName) == 'string' && data.payload.lastName.trim().length > 0 ? data.payload.lastName.trim() : false;
    var password = typeof (data.payload.password) == 'string' && data.payload.password.trim().length > 0 ? data.payload.password.trim() : false;

    console.log('data:',data);
    console.log('data.payload.phone)',data.payload.phone);
    if(phone){
        if(firstName || lastName||password){
            _data.read('users',phone,(err,userData)=>{
                console.log('userData',userData);
                if(!err && userData){
                    if(firstName){
                        userData.firstName = firstName;
                    }
                    if(lastName){
                        userData.lastName = lastName;
                    }
                    if(password){
                        userData.hashedPassword = helpers.hash(password);
                    }
                    
                    _data.update('users',phone,userData,(err)=>{
                        if(!err){
                            callback(200);
                        }else{
                            console.log(err);
                            callback(500,{'Error':'Could not update user data'});
                        }
                    });

                }else{
                    callback(400,{'Error':'User not found'});
                }
            })
        }else{
            callback(400,{'Error':'Missing data to update'});
        }
    }else{
        callback(400,{'Error':'Missing required data'}); 
    }
    
};

handlers._users.delete = (data, callback) => {
    var phone = typeof (data.payload.phone) == 'string' && data.payload.phone.trim().length >= 10 ? data.payload.phone : false;
    if (phone) {
        _data.read('users', phone, (err,data) => {
            if (!err && data) {
                _data.delete('users', phone, (err) => {
                    if(!err){
                        callback(200);
                    }else{
                        callback(400,{'Error':'could Not delete this user'});
                    }
                });
            } else {
                callback(400,{ 'Error': 'User not found' });
            }
        })
    } else {
        callback(400, { 'Error': 'missing require data' });
    }
};

handlers._users.get = (data, callback) => {
    // required data phone 
    //only auth users access their object 
    //check is number is valid 
    var phone = typeof (data.queryStringObject.phone) == 'string' && data.queryStringObject.phone.trim().length >= 10 ? data.queryStringObject.phone : false;

    if (phone) {
        _data.read('users', phone, (err,data) => {
            if (!err && data) {
                //remove hash password from user object 
                delete data.hashedPassword;
                callback(200, data);
            } else {
                callback(404,{ 'Error': 'Phone not found' });
            }
        })
    } else {
        callback(400, { 'Error': 'missing require data' });
    }
};

//ping handler
handlers.ping = (data, callback) => {
    callback(200);
};

handlers.notFound = (data, callback) => {
    callback(404)
};

module.exports = handlers;