//lib for storing and editing data 

//dp 
const fs = require('fs');
const path = require('path');
const helpers = require('./helpers');

//container 
var lib ={};
//base directory of the data 
lib.baseDir = path.join(__dirname,'/../.data/');
lib.create =(dir,file,data,callback) => {
    //open file for writing 
    fs.open(lib.baseDir+dir+'/'+file+'.json','wx',(err,fileDescriptor)=>{
        if(!err && fileDescriptor){
            //convert data to string 
            var stringData = JSON.stringify(data);

            //write to file and close it 
            fs.writeFile(fileDescriptor,stringData,(err)=>{
                if(!err){
                    fs.close(fileDescriptor,(err)=>{
                        if(!err){
                            callback(false);
                        }else{
                            callback('Error Closing new File');
                        }
                    });
                }else{
                    callback('Error writing to new file: '+fileDescriptor);
                }
            });
        }else{
            callback('could not create file, it may already exist');
        }
    });
};
//read data from file
lib.read = (dir,file,callback)=>{
    fs.readFile(lib.baseDir+dir+'/'+file+'.json','utf-8',(err,data)=>{
        if(!err && data){
            var parseDate =  helpers.parseJsonToObject(data);
            callback(false,parseDate);
        }else{
            callback(err,data);
        }
    })
};

//update data from file
lib.update =(dir,file,data,callback) => {
//open file
    fs.open(lib.baseDir+dir+'/'+file+'.json','r+',(err,fileDescriptor)=>{
        if(!err && fileDescriptor){
            var stringData = JSON.stringify(data);
            //truncate the content in the file descriptor
            fs.ftruncate(fileDescriptor,0,(err)=>{
                if(!err){
                    fs.writeFile(fileDescriptor,stringData,(err)=>{
                        if(!err){
                            fs.close(fileDescriptor,(err)=>{
                                if(!err){
                                    callback(false);
                                }else{
                                    callback('error closing file ');
                                }
                            });
                        }else{
                            callback('error writing in file ');
                        }
                    });
                }else{
                    callback('error truncate file');
                }
            });
        }else{
            callback('could not open file, it may already exist');
        }
    });

};

//delete file 
lib.delete = (dir,file,callback)=>{
    //unlink file
    fs.unlink(lib.baseDir+dir+'/'+file+'.json',(err)=>{
        if(!err){
            callback(false);
        }else{
            callback('Error deleting file');
        }
    });
};
//export 
module.exports =lib;