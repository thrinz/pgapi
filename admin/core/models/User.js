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

const utils = require('../../Utils');
const modelName = "users";
const metadata = {
    insert : {
          sql : 'INSERT INTO USERS (id,username,first_name,last_name,password,ref_user_id,enabled_flag,created,updated) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)',
          params : function(record) {
            let uuid = "";
            
            if (!record["id"]) {
                uuid = utils.getUUID();
            } else {
                uuid = record["id"];
            }

            const passwordHash = utils.encryptPassword(record.password);
                         
            return [uuid,record.username,record.first_name,record.last_name,passwordHash,record.ref_user_id, 'Y', record.created,record.updated];
          },
          failureMessage : function(e) {
              const status = 'E';
              let message = 'Failed to create User ' + e;
           
              return {status:status,message:message};
          }
    },
    update : {
        sql : 'UPDATE USERS SET first_name = $1 , last_name = $2 , updated = $3 WHERE id = $4',
        params : function(record) {
         
          const d = new Date();
          return [record.first_name
            , record.last_name
            , d
            , record.id];
        },
        failureMessage : function(e) {
            const status = 'E';
            let message = 'Failed to update User ' + e;
         
            return {status:status,message:message};
        }
             
    },
    updatePassword : {
        sql : 'UPDATE USERS SET password = $1 , updated = $2 WHERE id = $3',
        params : function(record) {
         
          const d = new Date();
          return [record.password
            , d
            , record.id];
        },
        failureMessage : function(e) {
            const status = 'E';
            let message = 'Failed to update User PAssword ' + e;
         
            return {status:status,message:message};
        }
             
    },
    updateEnabledFlag : {
        sql : 'UPDATE USERS SET enabled_flag = $1 , updated = $2 WHERE id = $3',
        params : function(record) {
         
          const d = new Date();
          return [record.enabled_flag
            , d
            , record.id];
        },
        failureMessage : function(e) {
            const status = 'E';
            let message = 'Failed to update User PAssword ' + e;
         
            return {status:status,message:message};
        }
    },
    delete : {
        sql : 'DELETE FROM USERS WHERE id = $1',
        params : function(record) {
          return [record.id];
        },
        failureMessage : function(e) {
            const status = 'E';
            let message = 'Failed to delete function ' + e;
         
            return {status:status,message:message};
        }
    },
    fetch : {
        sql : 'SELECT a.* FROM USERS a',
        params : function(record) {
          return [];
        },
        failureMessage : function(e) {
            return {};
        }
    },
    fetchById : {
        sql : 'SELECT a.* FROM USERS a WHERE a.id = $1',
        params : function(record) {
          return [record.id];
        },
        failureMessage : function(e) {
            return {};
        }
    },
    fetchByIdUser : {
        sql : 'SELECT id , username , first_name , last_name  FROM USERS a WHERE a.id = $1',
        params : function(record) {
          return [record.id];
        },
        failureMessage : function(e) {
            return {};
        }
    },
    fetchByUsername : {
        sql : 'SELECT a.* FROM USERS a WHERE a.username = $1',
        params : function(record) {
          return [record.username];
        },
        failureMessage : function(e) {
            return {};
        }
    },
    insertArchive: {
        sql : 'INSERT INTO deleted_users (id , username , first_name , last_name , created , cwho) VALUES ($1,$2,$3,$4,$5,$6)',
        params : function(record) {
            let uuid = "";
            
            if (!record["id"]) {
                uuid = utils.getUUID();
            } else {
                uuid = record["id"];
            }

            const d = new Date();
            
            if (!record["created_by"]) {
                record["created_by"] = 0;
            }
            
            return [uuid,record.username,record.first_name,record.last_name,d,record.cwho];
          },
          failureMessage : function(e) {
              const status = 'E';
              let message = 'Failed to create User Archive ' + e;
           
              return {status:status,message:message};
          }
    },
    insertToken: {
        sql : 'INSERT INTO tokens( token , start_time , user_id , timeout_time , created , updated ) VALUES ($1, $2, $3, $4, $5, $6)',
        params : function(record) {
            const d = new Date();
            let timeoutTime = new Date();
            timeoutTime.setMinutes(timeoutTime.getMinutes() + 60);
            return [record.token,d, record.user_id, timeoutTime, d, d];
        },
        failureMessage : function(e) {
            const status = 'E';
            let message = 'Failed to create Token record ' + e;
         
            return {status:status,message:message};
        }
    },
    fetchToken : {
        sql : 'SELECT a.* FROM TOKENS a WHERE a.token = $1',
        params : function(record) {
          return [record.token];
        },
        failureMessage : function(e) {
            return {};
        }
    },
    updateToken: {
        sql : 'UPDATE tokens SET timeout_time = $1 , updated = $2 WHERE token = $3',
        params : function(record) {
            const d = new Date();
            let timeoutTime = new Date();
            timeoutTime.setMinutes(timeoutTime.getMinutes() + 60);
            return [timeoutTime,d, record.token];
        },
        failureMessage : function(e) {
            const status = 'E';
            let message = 'Failed to create Token record ' + e;
         
            return {status:status,message:message};
        } 
    },
    validateSession: {
        sql : "SELECT validate_session($1) as result",
        params : function(record) {
            return [record.token];
        },
        failureMessage : function(e) {
            const status = 'E';
            let message = 'Invalid Session Information ' + e;
         
            return {status:status,message:message};
        } 
    }
  }


const validate = async function(record, mode, custom, pool) {
    let status = "S";
    let message = "OK";
    const model = utils.getModelMetadata(modelName);
    const newRecord = utils.handleDefaults(model,record,mode);
    
    if (mode === "U" || mode === "D") {
        // check the id information first
        const existCount = await utils.checkId(modelName,record["id"]);
        if (existCount === 0) {
            status = 'E';
            message = 'No Data found for column [id]';
            return {status: status , message:message};
        }

    }
    switch(mode) {
        case 'I' :
            if (!!record) {
                const validateRequiredFields = utils.validateRequiredColumns(model,mode,newRecord);
              
                if (validateRequiredFields.status === "E") {
                    return {status: validateRequiredFields.status , message: validateRequiredFields.message};
                }
                let validateDatatypes = utils.validateDatatypes(model,mode,newRecord);

                if (validateDatatypes.status === "E") {
                    return {status: validateDatatypes.status , message: validateDatatypes.message};
                }

                const validateConstraints = await utils.validateConstraints(model,mode,newRecord,pool);
                
                if (validateConstraints.status === "E") {
                    return {status: validateConstraints.status , message: validateConstraints.message};
                }     

                const validateTableConstraints = await utils.validateTableConstraints(model,mode,newRecord,pool);
                
                if (validateTableConstraints.status === "E") {
                    return {status: validateTableConstraints.status , message: validateTableConstraints.message};
                }  

                // write your custom logic here
                if (custom) {

                }

                return {status: status , message:message, record: newRecord};


            } else {
                status = 'E';
                message = 'Missing Record Information';
                return {status: status , message:message};
            }
        case 'U':
            if (!!record) {
                const validateRequiredFields = utils.validateRequiredColumns(model,mode,newRecord);
                if (validateRequiredFields.status === "E") {
                    return {status: validateRequiredFields.status , message: validateRequiredFields.message};
                }
                
                const validateDatatypes = utils.validateDatatypes(model,mode,newRecord);

                if (validateDatatypes.status === "E") {
                    return {status: validateDatatypes.status , message: validateDatatypes.message};
                }

                const validateConstraints = await utils.validateConstraints(model,mode,newRecord);
                
                if (validateConstraints.status === "E") {
                    return {status: validateConstraints.status , message: validateConstraints.message};
                }      
                
                const validateTableConstraints = await utils.validateTableConstraints(model,mode,newRecord,pool);
                
                if (validateTableConstraints.status === "E") {
                    return {status: validateTableConstraints.status , message: validateTableConstraints.message};
                } 
    
                // write your custom logic here
                if (custom) {

                }

                return {status: status , message:message, record: newRecord};


            } else {
                status = 'E';
                message = 'Missing Record Information';
                return {status: status , message:message};
            }
        case 'D':
           // write your custom logic here
            return {status: status , message:message};
    }
   

}
 

const insert = async function(record) {
    
    const metaObj =  metadata["insert"];
    try {
        const sql = metaObj.sql;
        const params = metaObj.params(record);
 
        return await utils.callSQL(sql,params);

    } catch (e) {
        return metaObj.failureMessage(e);
    }

}

const insertArchive = async function(record) {
    
    const metaObj =  metadata["insertArchive"];
    try {
        const sql = metaObj.sql;
        const params = metaObj.params(record);
 
        return await utils.callSQL(sql,params);

    } catch (e) {
        return metaObj.failureMessage(e);
    }

}

const insertToken = async function(record) {
    
    const metaObj =  metadata["insertToken"];
    try {
        const sql = metaObj.sql;
        const params = metaObj.params(record);
 
        return await utils.callSQL(sql,params);

    } catch (e) {
        return metaObj.failureMessage(e);
    }

}

const update = async function(record) {
    
    const metaObj =  metadata["update"];
    try {
        const sql = metaObj.sql;
        const params = metaObj.params(record);
 
        return await utils.callSQL(sql,params);

    } catch (e) {
        return metaObj.failureMessage(e);
    }
}

const updatePassword = async function(record) {
    
    const metaObj =  metadata["updatePassword"];
    try {
        const sql = metaObj.sql;
        
        const params = metaObj.params(record);
    
        return await utils.callSQL(sql,params);

    } catch (e) {
        return metaObj.failureMessage(e);
    }
}


const updateEnabledFlag = async function(record) {
    
    const metaObj =  metadata["updateEnabledFlag"];
    try {
        const sql = metaObj.sql;
        
        const params = metaObj.params(record);
       
        return await utils.callSQL(sql,params);

    } catch (e) {
        return metaObj.failureMessage(e);
    }
}
const deleteRecord = async function(record) {
   
    const metaObj =  metadata["delete"];
    
    try {
        const sql = metaObj.sql;
        const params = metaObj.params(record);
 
        return await utils.callSQL(sql,params);

    } catch (e) {
        return metaObj.failureMessage(e);
    }
}

const fetchAll = async function() {
    
    const metaObj =  metadata["fetch"];
    try {
        const sql = metaObj.sql;
        const params = metaObj.params();
        return await utils.getSQLResults(sql,params);

    } catch (e) {
        return metaObj.failureMessage();
    }
}

const fetchByUsername = async function(username) {
    
    const metaObj =  metadata["fetchByUsername"];
    try {
        const sql = metaObj.sql;
        const params = metaObj.params({username: username});
        return await utils.getSQLResultswithStatus(sql,params);

    } catch (e) {
        return metaObj.failureMessage();
    }
}



const fetchById = async function(id) {
    
    const metaObj =  metadata["fetchById"];
    try {
        const sql = metaObj.sql;
        const params = metaObj.params({id: id});
        return await utils.getSQLResults(sql,params);

    } catch (e) {
        return metaObj.failureMessage();
    }
}


const fetchByIdUser = async function(id) {
    
    const metaObj =  metadata["fetchByIdUser"];
    try {
        const sql = metaObj.sql;
        const params = metaObj.params({id: id});
        return await utils.getSQLResults(sql,params);

    } catch (e) {
        return metaObj.failureMessage();
    }
}

const fetchToken = async function(id) {
    
    const metaObj =  metadata["fetchToken"];
    try {
        const sql = metaObj.sql;
        const params = metaObj.params({id: id});
        return await utils.getSQLResults(sql,params);

    } catch (e) {
        return metaObj.failureMessage();
    }
}
const validateSession = async function(record) {
    
    const metaObj =  metadata["validateSession"];
    try {
        const sql = metaObj.sql;
        const params = metaObj.params(record);
        return await utils.getSQLResults(sql,params);

    } catch (e) {
        return metaObj.failureMessage();
    }
}

const updateToken = async function(record) {
    
    const metaObj =  metadata["updateToken"];
    try {
        const sql = metaObj.sql;
        
        const params = metaObj.params(record);
       
        return await utils.callSQL(sql,params);

    } catch (e) {
        return metaObj.failureMessage(e);
    }
}


module.exports = {
    validate: validate,
    insert: insert,
    insertArchive: insertArchive,
    insertToken: insertToken,
    update: update,
    delete: deleteRecord,
    fetchAll: fetchAll,
    fetchById: fetchById,
    fetchByUsername: fetchByUsername,
    fetchToken: fetchToken,
    fetchByIdUser: fetchByIdUser,
    updatePassword: updatePassword,
    updateEnabledFlag: updateEnabledFlag,
    updateToken: updateToken,
    validateSession: validateSession
 }