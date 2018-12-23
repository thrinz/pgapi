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
const modelName = "connections";
const metadata = {
    insert : {
          sql : 'INSERT INTO CONNECTIONS (id,name,host,port,database,username,password,ref_source_id,config_flag,created,updated) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)',
          params : function(record) {
            let uuid = "";
            
            if (!record["id"]) {
                uuid = utils.getUUID();
            } else {
                uuid = record["id"];
            }

            let config = "N";

            if (!!record["config_flag"]) {
                config = record["config_flag"];
            }
                        
            return [uuid,record.name,record.host,record.port,record.database,record.username,record.password,record.ref_source_id,config,record.created,record.updated];
          },
          failureMessage : function(e) {
              const status = 'E';
              let message = 'Failed to create connection ' + e;
           
              return {status:status,message:message};
          }
    },
    update : {
        sql : 'UPDATE CONNECTIONS SET name = $1 , host = $2 , port = $3 ,database = $4,username = $5,password = $6, updated = $7 WHERE id = $8',
        params : function(record) {
         
          const d = new Date();
          return [record.name
            , record.host
            , record.port
            , record.database
            , record.username
            , record.password
            , d
            , record.id];
        },
        failureMessage : function(e) {
            const status = 'E';
            let message = 'Failed to update connection ' + e;
         
            return {status:status,message:message};
        }
             
    },
    delete : {
        sql : 'DELETE FROM CONNECTIONS WHERE id = $1',
        params : function(record) {
          return [record.id];
        },
        failureMessage : function(e) {
            const status = 'E';
            let message = 'Failed to delete connection ' + e;
         
            return {status:status,message:message};
        }
    },
    fetch : {
        sql : 'SELECT * FROM CONNECTIONS',
        params : function(record) {
          return [];
        },
        failureMessage : function(e) {
            return {};
        }
    },
    fetchByName : {
        sql : 'SELECT * FROM CONNECTIONS WHERE name = $1',
        params : function(record) {
            return [record.name];
          },
          failureMessage : function(e) {
              const status = 'E';
              let message = 'Failed to Select connection ' + e;
           
              return {status:status,message:message};
          }
    },
    fetchById : {
        sql : 'SELECT * FROM CONNECTIONS WHERE id = $1',
        params : function(record) {
            return [record.id];
          },
          failureMessage : function(e) {
              const status = 'E';
              let message = 'Failed to Select connection ' + e;
           
              return {status:status,message:message};
          }
    }
  }


const validate = async function(record, mode, custom) {
    let status = "S";
    let message = "OK";
    const model = utils.getModelMetadata(modelName);
    const newRecord = utils.handleDefaults(model,record,mode);
    let dbRecord = {};
    
    // if (mode === "U" || mode === "D") {
    //     // check the id information first
    //     const existCount = await utils.checkId(modelName,record["id"]);
    //     if (existCount === 0) {
    //         status = 'E';
    //         message = 'No Data found for column [id]';
    //         return {status: status , message:message};
    //     }
    // }

    if (mode === "U" || mode === "D") {
       const dbRecordResponse = await fetchById({id: record["id"]});
       if (!!dbRecordResponse && dbRecordResponse.length > 0 ) {
         dbRecord = dbRecordResponse[0];
       } else {
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

                const validateConstraints = await utils.validateConstraints(model,mode,newRecord);
                
                if (validateConstraints.status === "E") {
                    return {status: validateConstraints.status , message: validateConstraints.message};
                }  
                
                const validateTableConstraints = await utils.validateTableConstraints(model,mode,newRecord);
                
                if (validateTableConstraints.status === "E") {
                    return {status: validateTableConstraints.status , message: validateTableConstraints.message};
                } 
      
                // write your custom logic here
                if (custom) {
                    const checkDB = await utils.validateConnection(newRecord);
                    
                    if (checkDB.status === "E") {
                    return {status: checkDB.status , message: checkDB.message};      
                    }
                    newRecord["password"] = utils.encryptByKey(newRecord["password"],'connection');
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
                
                const validateTableConstraints = await utils.validateTableConstraints(model,mode,newRecord);
                
                if (validateTableConstraints.status === "E") {
                    return {status: validateTableConstraints.status , message: validateTableConstraints.message};
                }  
                
                // write your custom logic here
                if (custom) {
                    
                    const passwd = newRecord["password"];

                    if (dbRecord["password"] === passwd) {
                       newRecord["password"] = utils.decryptByKey(passwd,'connection');
                    } 
                       
                    const checkDB = await utils.validateConnection(newRecord);
               
                    if (checkDB.status === "E") {
                        return {status: checkDB.status , message: checkDB.message};      
                    }
                    newRecord["password"] = utils.encrypt(newRecord["password"]);
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
 

const insert = async function(record,pool) {
    
    const metaObj =  metadata["insert"];
    try {
        
        const sql = metaObj.sql;
        const params = metaObj.params(record);

        return await utils.callSQL(sql,params,pool);

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

const fetchByName = async function(record) {
    
    const metaObj =  metadata["fetchByName"];
    try {
        const sql = metaObj.sql;
        const params = metaObj.params(record);
        return await utils.getSQLResults(sql,params);

    } catch (e) {
        return metaObj.failureMessage();
    }
}

const fetchById = async function(record) {
    
    const metaObj =  metadata["fetchById"];
    try {
        const sql = metaObj.sql;
        const params = metaObj.params(record);
        return await utils.getSQLResults(sql,params);

    } catch (e) {
        return metaObj.failureMessage();
    }
}

module.exports = {
    validate: validate,
    insert: insert,
    update: update,
    delete: deleteRecord,
    fetchAll: fetchAll,
    fetchById: fetchById,
    metadata: metadata,
    modelName: modelName,
    fetchByName: fetchByName
 }