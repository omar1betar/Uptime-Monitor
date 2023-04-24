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
        _data.read('users', phone, (err) => {
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
    console.log('data:', data);
    console.log('data.payload.phone)', data.payload.phone);
    if (phone) {

        if (firstName || lastName || password) {
            var token = typeof(data.headers.token) == 'string' ? data.headers.token: false;
        handlers._tokens.verifyToken(token,phone,(tokenIsValid)=>{
            if(tokenIsValid){
                _data.read('users', phone, (err, userData) => {
                    console.log('userData', userData);
                    if (!err && userData) {
                        if (firstName) {
                            userData.firstName = firstName;
                        }
                        if (lastName) {
                            userData.lastName = lastName;
                        }
                        if (password) {
                            userData.hashedPassword = helpers.hash(password);
                        }
    
                        _data.update('users', phone, userData, (err) => {
                            if (!err) {
                                callback(200);
                            } else {
                                console.log(err);
                                callback(500, { 'Error': 'Could not update user data' });
                            }
                        });
                    } else {
                        callback(400, { 'Error': 'User not found' });
                    }
                });
            }else{
                callback(403,{'Error':'Missing token in header'});
            }
        });
        } else {
            callback(400, { 'Error': 'Missing data to update' });
        }
    } else {
        callback(400, { 'Error': 'Missing required data' });
    }

};

handlers._users.delete = (data, callback) => {
    var phone = typeof (data.payload.phone) == 'string' && data.payload.phone.trim().length >= 10 ? data.payload.phone : false;
    if (phone) {
        var token = typeof(data.headers.token) == 'string' ? data.headers.token: false;
        handlers._tokens.verifyToken(token,phone,(tokenIsValid)=>{
            if(tokenIsValid){
                _data.read('users', phone, (err, data) => {
                    if (!err && data) {
                        _data.delete('users', phone, (err) => {
                            if (!err) {
                                callback(200);
                            } else {
                                callback(400, { 'Error': 'could Not delete this user' });
                            }
                        });
                    } else {
                        callback(400, { 'Error': 'User not found' });
                    }
                });
            }else{
                callback(403,{'Error':'Missing token in header'});
            }
        });
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

        var token = typeof(data.headers.token) == 'string' ? data.headers.token: false;
        handlers._tokens.verifyToken(token,phone,(tokenIsValid)=>{
            if(tokenIsValid){
                _data.read('users', phone, (err, data) => {
                    if (!err && data) {
                        //remove hash password from user object 
                        delete data.hashedPassword;
                        callback(200, data);
                    } else {
                        callback(404, { 'Error': 'Phone not found' });
                    }
                });
            }else{
                callback(403,{'Error':'Missing token in header'});
            }
        });
        
    } else {
        callback(400, { 'Error': 'missing require data' });
    }
};
//Tokens
handlers.tokens = (data, callback) => {
    var acceptableMethod = ['post', 'put', 'delete', 'get'];
    if (acceptableMethod.indexOf(data.method) > -1) {
        handlers._tokens[data.method](data, callback);
        console.log(data);
    } else {
        callback(405);
    }
};
handlers._tokens = {};
handlers._tokens.post = (data, callback) => {
    //phone and password required
    var phone = typeof (data.payload.phone) == 'string' && data.payload.phone.trim().length >= 10 ? data.payload.phone.trim() : false;
    var password = typeof (data.payload.password) == 'string' && data.payload.password.trim().length > 0 ? data.payload.password.trim() : false;

    if (phone && password) {
        _data.read('users', phone, (err, userData) => {
            if (!err) {
                //hash send password and compare it to the password 
                var hashedPassword = helpers.hash(password);
                if (hashedPassword == userData.hashedPassword) {
                    //if valid create new token  with random name experation time 1 hour 
                    var tokenId = helpers.createRandomString(20);
                    var expires = Date.now() + 1000 * 60 * 60;
                    var tokenObject = {
                        'phone': phone,
                        'id': tokenId,
                        'expires': expires
                    };
                    //store token 
                    _data.create('tokens', tokenId, tokenObject, (err) => {
                        if (!err) {
                            callback(200, tokenObject);
                        } else {
                            callback(400, { 'Error': 'could not store the token in the file' });
                        }
                    });
                } else {
                    callback(400, { 'Error': 'Invalid username or password' });
                }

            } else {
                callback(400, { 'Error': 'User not found' });
            }
        });
    } else {
        callback(400, { 'Error': 'missing require data' });

    }


};
handlers._tokens.get = (data, callback) => {
    var id = typeof (data.queryStringObject.id) == 'string' && data.queryStringObject.id.trim().length >= 20 ? data.queryStringObject.id : false;
    if (id) {
        _data.read('tokens', id, (err, tokenData) => {
            if (!err && tokenData) {
                callback(200, tokenData);
            } else {
                callback(404, { 'Error': 'Phone not found' });
            }
        })
    } else {
        callback(400, { 'Error': 'missing require data' });
    }
};
handlers._tokens.put = (data, callback) => {
    var id = typeof (data.payload.id) == 'string' && data.payload.id.trim().length >= 20 ? data.payload.id.trim() : false;
    var extend = typeof (data.payload.extend) == 'boolean' && data.payload.extend == true ? true : false;
    if (id && extend) {
        _data.read('tokens', id, (err, tokenData) => {
            if (!err && tokenData) {
                //check if token is still active
                if (tokenData.expires > Date.now()) {
                    tokenData.expires = Date.now() + 1000 * 60 * 60;
                    _data.update('tokens', id, tokenData, (err) => {
                        if (!err) {
                            callback(200);
                        } else {
                            callback(400, { 'Error': 'could not update token ' });
                        }
                    });
                } else {
                    callback(400, { 'Error': 'token expired' });

                }
            } else {
                callback(400, { 'Error': 'token not found' });

            }
        });
    } else {
        callback(400, { 'Error': 'Missing require data' });
    }
};
handlers._tokens.delete = (data, callback) => {
    var id = typeof (data.queryStringObject.id) == 'string' && data.queryStringObject.id.trim().length >= 10 ? data.queryStringObject.id : false;
    if (id) {
        _data.read('tokens', id, (err, data) => {
            if (!err && data) {
                _data.delete('tokens', id, (err) => {
                    if (!err) {
                        callback(200);
                    } else {
                        callback(400, { 'Error': 'could Not delete this token' });
                    }
                });
            } else {
                callback(400, { 'Error': 'token not found' });
            }
        })
    } else {
        callback(400, { 'Error': 'missing require data' });
    }
};
handlers._tokens.verifyToken = (id, phone, callback) => {
    //lookup the token 
    _data.read('tokens', id, (err,tokenData) => {
        if(!err,tokenData){
            if(tokenData.phone == phone && tokenData.expires >Date.now()){
                callback(true);
            }else{
                callback(false);
            }
        }else{
            callback(false);
        }
    });
};

//ping handler
handlers.ping = (data, callback) => {
    callback(200);
};

handlers.notFound = (data, callback) => {
    callback(404)
};

module.exports = handlers;