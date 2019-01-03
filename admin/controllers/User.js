/*  
    This file is part of pgAPI.
    pgAPI - Database as a service
    Copyright (C) 2018 Praveen Muralidhar

    pgAPI is a free software: you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    any later version.

    pgAPI is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.

    You should have received a copy of the GNU General Public License
    along with this program.  If not, see <https://www.gnu.org/licenses/>.
*/

const model = require('../models/User');
const utils = require('../Utils');

const resetPassword = async function(username, userPassword , confirmPassword) {

    if (!!userPassword) {
      if (!!confirmPassword) {
        if (userPassword === confirmPassword) {
           let dbRecord = await model.fetchByUsername(username);
           // Update Database
           // let response = await model.updatePassword({id: dbRecord.id , })
           if (!!dbRecord && !!dbRecord.result && dbRecord.result.length > 0) {
             let record = dbRecord.result[0];
             let encryptedPassword = utils.encryptPassword(userPassword);
             let response = await model.updatePassword({password: encryptedPassword , id: record.id });
             return response;
           } else {
             return {status: "ERROR" , message: "Unable to reset the Password"};
           }
           
        } else {
           return {status: "ERROR" , message: "The Password and Confirm Password must match"}; 
        }
      }  else {
        return { status: "ERROR" , message: "Invalid Confirm Password Information. THe password Information is blank" };
      }
    } else {
      return { status: "ERROR" , message: "Invalid Password Information. THe password Information is blank" };
    }

}

const validateLogin = async function(username, password) {
    let dbRecord = await model.fetchByUsername(username);
    
    if (!!dbRecord && !!dbRecord.status && dbRecord.status === "E") {
        return dbRecord;
    }

    if (dbRecord.result.length === 0 ) {
        return {status: "E" , message: "Unable to find user"};
    }

    let record = dbRecord.result[0];

    if (utils.isValidPassword(password,record.password)) {
        // valid login
        return {status:"S",message: "OK", record: record};
    } else {
        return {status:"E" , message: "Invalid Credentials. Unable to login"};
    }
   
}

const resetPasswordAPI = async function(req, res) {
    let record = req.body;
    
    let claims = req.claims;
    console.log(claims);

    if (!!record.password && !!record.newpassword && !!record.confirmpassword) {
        let response = await validateLogin(claims.username,record.password);
        let userPassword = record.newpassword;
        let confirmPassword = record.confirmpassword;
        if (response.status === "S") {
            if (userPassword === confirmPassword) {
                let dbRecord = await model.fetchByUsername(claims.username);
                // Update Database
                // let response = await model.updatePassword({id: dbRecord.id , })
                if (!!dbRecord && !!dbRecord.result && dbRecord.result.length > 0) {
                  let record1 = dbRecord.result[0];
                  let encryptedPassword = utils.encryptPassword(userPassword);
                  let response = await model.updatePassword({password: encryptedPassword, id: record1.id });
                  res.json( response);
                  res.end(); 
                  return;
                } else {
                    res.json({status: "E" , message: "Unable to reset the Password"});
                    res.end(); 
                    return;
                }
                
             } else {
                res.json({status: "E" , message: "The Password and Confirm Password must match"}); 
                res.end(); 
                return;
             }
        } else {
           console.log("Error") 
           res.json(response);  
           res.end(); 
           return;
        }
    } else {
        res.json({status: "E" , message: "Missing required Information [current password, new password, confirm password]"});   
        res.end(); 
        return;
    }
    

}

const login = async function(username, password) {

    try {
        let response = await validateLogin(username,password);
    
        if (response.status === "S") {
        let d = new Date(); 
        d.setMinutes(d.getMinutes() + 4880);
        let record = response.record;
        let claims = { id: record.id, username: record.username , first_name: record.first_name , last_name: record.last_name};
        let tokenObj = { claims: claims , exp_time: d };
        const token = utils.encryptObjectByKey(tokenObj, process.env.PGAPI_SECRET_KEY);
        let obj = { token: token ,  claims: claims };

        let insertTokenResponse = await model.insertToken({token: token, user_id: record.id});
       
        if (insertTokenResponse.status === "E") {
            return {status: "E" , message: insertTokenResponse.message  };
        }
        else {
            return {status: "S" , message: "OK" , data: obj};
        }
        
    
        } else {
            return {status: "E" , message: response.message  };
        }
    } catch (e) {
        return {status: "E" , message: e.message  };
    }
    
 }

 const loginAPI = async function(req, res) {
    let record = req.body;

    let response = await login(record.username, record.password);
   
     if (response.status === "E") {
        res.json(response);
        return;
     } else {
        res.json(response);   
        res.end();
     }
}

const fetchAPI = async function(req, res) {
    let record = req.query;

    let response = await model.fetchByIdUser(record.id);
   
    res.json(response);   
    res.end();
}

const sessionAPI = async function(req, res) {
    let record = req.body;

    let response = await validateSession(record.refresh_token);
   
     if (response.status === "E") {
        res.json(response);
        return;
     } else {
        res.json(response);   
        res.end();
     }
}
 
 
 const loginCommand = async function(username, password) {
     let response = await login(username, password);
    
     if (response.status === "E") {
         console.log(response.message);
     } else {
         console.log("Login Success.");
         console.log(response.data);
     }
 }

const validateSession = async function(token) {
    let decoded = utils.decryptObjectByKey(token,process.env.PGAPI_SECRET_KEY);

    if (utils.isEmpty(decoded)) {
        return {status: "E" , message: "Invalid Session Information", code: "INVALID"};
    } else {
        let expTime = new Date(decoded.exp_time);
        let currentTime = new Date();

        if (currentTime > expTime) {
            return {status: "E" , message: "Session Timeout" , code: "RELOGIN"};
        }

        let id = decoded.claims.id;

        const dbRecord = await model.validateSession({token: token});
     
        if (!!dbRecord && dbRecord.length > 0) {
           let result =  dbRecord[0].result;
           
           if (result.status === "E") {
               return {status: "E" , message: "Invalid Session Information.", code: result.message};
           } else
           {
              return {status: "S" , message: "OK" , decoded: decoded};
           }
        } else {
            return {status: "E" , message: "Invalid Session Information.", code: "INVALID_USER"};
        }

        return {status: "S" , message: "OK" , decoded: decoded};
    }
}

const validateSessionCommand = async function(token) {
    let response = await validateSession(token,process.env.PGAPI_SECRET_KEY);
    
    if (response.status === "E") {
        console.log(response.message);
    } else {
        console.log("Session is Valid.");
        console.log(response.decoded);
    }
}



const addUser = async function(record) {
    let validation = await model.validate(record,'I',true);
    
    if (validation.status === 'E') {
        return {
            status: validation.status,
            message: validation.message
        };
    }    
    let response = await model.insert(validation.record);
    
    return response;
}

const addUserCommand = async function(record) {
    console.log("Adding user");
    let response = await addUser(record);

    if (response.status === "E") {
        console.log(response.message);
    } else {
        console.log("The User has been successfully added.")
    }
}

const updateUser = async function(record) {
    let id = record.id;
    
    if (!id) {
        return {
            status: 'E',
            message: 'Missing id information'
        };
    }

    let validation = await model.validate(record,'U',true);
    if (validation.status === 'E') {
        return {
            status: validation.status,
            message: validation.message
        };
    }

    const response = await model.update(validation.record); 
    return response;   
}


const updateUserAPI = async function(req, res) {
    let record = req.body;

    let response = await updateUser(record);
   
     if (response.status === "E") {
        res.json(response);
        return;
     } else {
        res.json(response);   
        res.end();
     }
}

const deleteUser = async function(record) {
    let id = record.id;
    
    if (!id) {
        return {
            status: 'E',
            message: 'Missing id information'
        };
    }

    let validation = await model.validate(record,'D',true);
    if (validation.status === 'E') {
        return {
            status: validation.status,
            message: validation.message
        };
    }

    const dbRecord = await model.fetchById(id);

    if (dbRecord[0].username === "admin") {
        return {status: "E" , message: "You are not allowed to delete admin account"};
    }

    const response = await model.delete(record); 

    if (response.status === "S") {
       let resp = await model.insertArchive({username: dbRecord[0].username, first_name: dbRecord[0].first_name , last_name: dbRecord[0].last_name
                       , id: dbRecord[0].id});
       return resp;
    }

    return response;   
}

const deleteUserCommand = async function(record) {
   
    let dbRecord = await model.fetchByUsername(record.username);
    
    if (!!dbRecord && !!dbRecord.status && dbRecord.status === "E") {
        console.log(dbRecord.message);
        return;
    }

    if (dbRecord.result.length === 0 ) {
        console.log("Unable to find the user");
        return;
    }

    record.id = dbRecord.result[0].id;

    let response = await deleteUser(record);

    if (response.status === "E") {
        console.log(response.message);
    } else {
        console.log("The User has been successfully deleted.")
    }
}



const updateUserCommand = async function(record) {
   
    let dbRecord = await model.fetchByUsername(record.username);
    
    if (!!dbRecord && !!dbRecord.status && dbRecord.status === "E") {
        console.log(dbRecord.message);
        return;
    }

    if (dbRecord.result.length === 0 ) {
        console.log("Unable to find the user");
        return;
    }

    record.id = dbRecord.result[0].id;

    let response = await updateUser(record);

    if (response.status === "E") {
        console.log(response.message);
    } else {
        console.log("The User has been successfully updated.")
    }
}

const resetPasswordCommand = async function(username, userPassword , confirmPassword) {
    let response = await resetPassword(username, userPassword , confirmPassword);
    
    if (response.status === "E") {
        console.log(response.message);
    } else {
        console.log("Password has been changed Successfully.")
    }
}

const enableDisableUser = async function(record) {

    let id = record.id;
    
    if (!id) {
        return {
            status: 'E',
            message: 'Missing id information'
        };
    }

    if (!!record && !!record.enabled_flag) {
    } else {
        return {status: "E" , message: "Invalid enabled_flag value. The value is either incorrect or not provided. Valid Values [Y,N]"}
    }


    const dbRecord = await model.fetchById(id);

    if (!!dbRecord && dbRecord.length > 0) {
        if (dbRecord[0].username === "admin") {
            return {status: "E" , message: "You are not allowed to modify admin account"};
        }

        let response = await model.updateEnabledFlag(record);

        return response;

    } else 
    {
        return {status:"E" , message: "Unable to find the user"};
    }

}

const enableDisableUserCommand = async function(record) {
    let dbRecord = await model.fetchByUsername(record.username);
    
    if (!!dbRecord && !!dbRecord.status && dbRecord.status === "E") {
        console.log(dbRecord.message);
        return;
    }

    if (dbRecord.result.length === 0 ) {
        console.log("Unable to find the user");
        return;
    }

    record.id = dbRecord.result[0].id;

    let response = await enableDisableUser(record);

    if (response.status === "E") {
        console.log(response.message);
    } else {
        console.log("The User status has been successfully updated.")
    }
}

// const generateToken = async function(record) {
//     if (!!record && !!record.refresh_token) {
//        let decoded = utils.decryptObjectByKey(record.refresh_token,process.env.REFRESH_SECRET_KEY);
//        if (utils.isEmpty(decoded)) {
//          return {status: "E" , message: "Invalid Refresh Token Information", code: "RELOGIN"};
//        } else {
//             let id = decoded.claims.id;

//             const dbRecord = await model.fetchById(id);
//         //    console.log(dbRecord);

//             if (!!dbRecord && dbRecord.length > 0) {

//                let d = new Date(); 
//                d.setMinutes(d.getMinutes() + 30);
//                let claims = decoded.claims;
//                let tokenObj = { claims: claims , exp_time: d };
//                const token = utils.encryptObjectByKey(tokenObj, process.env.PGAPI_SECRET_KEY);
//                let obj = { token: token , refresh_token: record.refresh_token , claims: claims };
//                return {status: "S" , message: "OK", data: obj};
//             } else {
//                 return {status: "E" , message: "Invalid Session Information.", code: "INVALID_USER"};
//             }
//        }

//     } else {
//        return {status: "E" , message: "Please provide the refresh token."};
//     }
// }

// const generateTokenCommand = async function(record) {
//     let response = await generateToken(record);

//     if (response.status === "E") {
//         console.log(response.message);
//     } else {
//         console.log("The User has been validated.")
//         console.log(response.data);
//     }
// }


module.exports = {
    validateLogin: validateLogin,
    loginCommand: loginCommand,
    loginAPI: loginAPI,
    fetchAPI: fetchAPI,
    sessionAPI: sessionAPI,
    resetPassword: resetPassword,
    resetPasswordCommand: resetPasswordCommand,
    resetPasswordAPI: resetPasswordAPI,
    addUser: addUser,
    addUserCommand: addUserCommand,
    updateUserCommand: updateUserCommand,
    updateUserAPI: updateUserAPI,
    deleteUserCommand: deleteUserCommand,
    validateSession: validateSession,
    validateSessionCommand: validateSessionCommand,
    enableDisableUserCommand: enableDisableUserCommand,
   // generateTokenCommand: generateTokenCommand
 }