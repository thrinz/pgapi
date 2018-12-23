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
const modelName = "functions";
const metadata = {
    insert : {
          sql : 'INSERT INTO FUNCTIONS (id,name,connection_id,db_method,ref_source_id,created,updated) VALUES ($1,$2,$3,$4,$5,$6,$7)',
          params : function(record) {
            let uuid = "";
            
            if (!record["id"]) {
                uuid = utils.getUUID();
            } else {
                uuid = record["id"];
            }
                        
            return [uuid,record.name,record.connection_id,record.db_method,record.ref_source_id,record.created,record.updated];
          },
          failureMessage : function(e) {
              const status = 'E';
              let message = 'Failed to create Function ' + e;
           
              return {status:status,message:message};
          }
    },
    update : {
        sql : 'UPDATE FUNCTIONS SET name = $1 , connection_id = $2 , db_method = $3 , updated = $4 WHERE id = $5',
        params : function(record) {
         
          const d = new Date();
          return [record.name
            , record.connection_id
            , record.db_method
            , d
            , record.id];
        },
        failureMessage : function(e) {
            const status = 'E';
            let message = 'Failed to update Function ' + e;
         
            return {status:status,message:message};
        }
             
    },
    delete : {
        sql : 'DELETE FROM FUNCTIONS WHERE id = $1',
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
        sql : 'SELECT a.*,b.name as connection_name FROM FUNCTIONS a, CONNECTIONS b WHERE a.connection_id = b.id',
        params : function(record) {
          return [];
        },
        failureMessage : function(e) {
            return {};
        }
    },
    fetchByName: {
        sql : 'SELECT a.* FROM FUNCTIONS a WHERE name = $1',
        params : function(record) {
          return [record.name];
        },
        failureMessage : function(e) {
            const status = 'E';
            let message = 'Failed to delete function ' + e;
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
        case 'I':
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
                    const checkFunction = await utils.validateFunction(record["connection_id"], record["db_method"]);
                    if (checkFunction.status === "E") { 
                        return {status: checkFunction.status , message: checkFunction.message};      
                    }
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
    
                // write your custom logic heres
                if (custom) {
                    const checkFunction = await utils.validateFunction(record["connection_id"],record["db_method"]);
                    if (checkFunction.status === "E") {
                        return {status: checkFunction.status , message: checkFunction.message};      
                    }
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
 

const insert = async function(record, pool) {
    
    const metaObj =  metadata["insert"];
    try {
        const sql = metaObj.sql;
        const params = metaObj.params(record);
 
        return await utils.callSQL(sql,params, pool);

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
    console.log("Deleting Recrod");
    
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

module.exports = {
    validate: validate,
    insert: insert,
    update: update,
    delete: deleteRecord,
    fetchAll: fetchAll,
    fetchByName: fetchByName
 }