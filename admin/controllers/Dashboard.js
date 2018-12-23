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

const utils = require('../Utils');
const fs = require('fs');
const path = require('path');
const connectionModel = require('../core/models/Connection');
const functionModel = require('../core/models/Function');
const routeModel = require('../core/models/Route');

const exportConfig = async function(req, res) {
    if (!!req.query && !!req.query.secret_key) {
        const response = await utils.exportConfig(req.query.secret_key);
        res.json({status: 'S' , message: 'OK' , results : response});  
        return;
    }
    else {
        res.json({status: 'E' , message: 'Missing input parameter : secret_key' , results : []});  
        return
    }
    
};

const deleteConfig = async function(req, res) {
    const response = await deleteConfigurations();
    res.json(response);  
    return;
    
};

const importConfig = async function(req, res) {
    if (!!req.body) {
        if (!req.body.secret_key) {
            res.json({status: 'E' , message: 'Missing input parameter : secret_key' , results : []});  
            return
        }
        if (!req.body.secret_key) {
            res.json({status: 'E' , message: 'Missing input parameter : configuration file input' , results : []});  
            return
           
        }


        const response = await importConfigContent(req.body.secret_key, req.body.content );
        res.json(response);  
        return;
    } else {
        res.json({status: 'E' , message: 'Missing input parameter : secret_key , configuration file input' , results : []});  
        return
    }
    
};


function CustomException() {}

const processApplications = async function(applications, pool) {
    let applicationErrors = []; 
    let status = 'S';
    let message = 'OK';
    

    if (!Array.isArray(applications)) {
        applicationErrors.push( 'Invalid File. The Applications must be of type = Array');      
        status = 'E';
        message = 'Invalid File';
        return {status: status, message: message, errors: applicationErrors};
    }

    for (let i in applications) {
        if (typeof applications[i] === 'object') {
            let record = applications[i];
            let response = await utils.callSQL("INSERT INTO APPLICATIONS (id,name,created,updated) VALUES ($1,$2,$3,$4) ",[record["id"],record["name"], record["created"], record["updated"]], pool); 
             
            if (response.status === 'E') {
                applicationErrors.push(response.message);
                status = 'E';
                message = 'Invalid File';
                return {status: status, message: message, errors: applicationErrors};
            }
        } else {
            applicationErrors.push('Invalid File. Record[' + i + '] -> The Applications array elements must be of type = Object');  

            if (applicationErrors.length > 0) {
                status = 'E';
                message = 'Invalid File';
                return {status: status, message: message, errors: applicationErrors};
            }    
        }  

    }
    return {status: status, message: message, errors: [] };
}

const processConnections = async function(secretKey, connections, client) {
    
    let connectionErrors = []; 
    let status = 'S';
    let message = 'OK';
    

    if (!Array.isArray(connections)) {
        connectionErrors.push( 'Invalid File. The connections must be of type = Array');      
        status = 'E';
        message = 'Invalid File';
        return {status: status, message: message, errors: connectionErrors};
    }

    for (let i in connections) {
         
        if (typeof connections[i] === 'object') {
            let record = connections[i];
            
            if (!!record.id) {
                record.ref_source_id = record.id;
                record.id = null;
            }
            if (!!record.created) {
                record.created = null;
            }
            if (!!record.updated) {
                record.updated = null;
            }

            let validation = await connectionModel.validate(record, 'I', false, client);

            if (validation.status === 'E') {
               connectionErrors.push('Invalid File. Record[' + (i + 1) + '] -> ' + validation.message); 
               status = 'E';
               message = 'Invalid File';
               return {status: status, message: message, errors: connectionErrors};
            }    

            if (connectionErrors.length == 0)
            {
                if ( record.encrypt === 'Y') {
                    let passwd = record.password;
                    let decryptPassword = utils.decryptByKey(passwd,secretKey);
                    validation.record["password"] = utils.encrypt(decryptPassword);
                } else {
                    let passwd = record.password;
                    validation.record["password"] = utils.encrypt(passwd);
                }
                
                // do the insert
                let response = await connectionModel.insert(validation.record,client);

                if (response.status === 'E') {
                    connectionErrors.push(response.message);
                    status = 'E';
                    message = 'Invalid File';
                    return {status: status, message: message, errors: connectionErrors};
                }
            } 

        } else {
            connectionErrors.push('Invalid File. Record[' + i + '] -> The connections array elements must be of type = Object');  

            if (connectionErrors.length > 0) {
                status = 'E';
                message = 'Invalid File';
                return {status: status, message: message, errors: connectionErrors};
            }    
        }    
    }

    return {status: status, message: message, errors: [] };

}

const processFunctions = async function(functions, client) {
    
    let functionErrors = []; 
    let status = 'S';
    let message = 'OK';
    

    if (!Array.isArray(functions)) {
        functionErrors.push( 'Invalid File. The Functions must be of type = Array');      
        status = 'E';
        message = 'Invalid File';
        return {status: status, message: message, errors: functionErrors};
    }

    for (let i in functions) {
         
        if (typeof functions[i] === 'object') {
            let record = functions[i];
            
            if (!!record.id) {
                record.ref_source_id = record.id;
                record.id = null;
            }
            if (!!record.created) {
                record.created = null;
            }
            if (!!record.updated) {
                record.updated = null;
            }

            // cross reference the connection ID
            const connectionArray = await utils.getSQLResults("SELECT id FROM connections WHERE ref_source_id = $1",[record.connection_id],client);
            const connectionID = connectionArray[0]["id"];

            record.connection_id = connectionID;
            let validation = await functionModel.validate(record, 'I', false, client);

            if (validation.status === 'E') {
               functionErrors.push('Invalid File. Record[' + (i + 1) + '] -> ' + validation.message); 
               status = 'E';
               message = 'Invalid File';
               return {status: status, message: message, errors: functionErrors};
            }    
            
            if (functionErrors.length == 0)
            {
                
                // do the insert
                let response = await functionModel.insert(validation.record,client);

                if (response.status === 'E') {
                    functionErrors.push(response.message);
                    status = 'E';
                    message = 'Invalid File';
                    return {status: status, message: message, errors: functionErrors};
                }
            } 

        } else {
            functionErrors.push('Invalid File. Record[' + i + '] -> The functions array elements must be of type = Object');  

            if (functionErrors.length > 0) {
                status = 'E';
                message = 'Invalid File';
                return {status: status, message: message, errors: functionErrors};
            }    
        }    
    }

    return {status: status, message: message, errors: functionErrors};
}

const processRoutes = async function(routes, client) {
    
    let routeErrors = []; 
    let status = 'S';
    let message = 'OK';
    

    if (!Array.isArray(routes)) {
        routeErrors.push( 'Invalid File. The connections must be of type = Array');      
        status = 'E';
        message = 'Invalid File';
        return {status: status, message: message, errors: routeErrors};
    }

    for (let i in routes) {
         
        if (typeof routes[i] === 'object') {
            let record = routes[i];
            
            if (!!record.id) {
                record.ref_source_id = record.id;
                record.id = null;
            }
            if (!!record.created) {
                record.created = null;
            }
            if (!!record.updated) {
                record.updated = null;
            }

            // cross reference the connection ID
            const functionArray = await utils.getSQLResults("SELECT id FROM functions WHERE ref_source_id = $1",[record.function_id],client);
            const functionID = functionArray[0]["id"];

            record.function_id = functionID;

            let validation = await routeModel.validate(record, 'I', false, client);

            if (validation.status === 'E') {
               routeErrors.push('Invalid File. Record[' + (i + 1) + '] -> ' + validation.message); 
               status = 'E';
               message = 'Invalid File';
               return {status: status, message: message, errors: routeErrors};
            }    
            
            if (routeErrors.length == 0)
            {
                // do the insert
                let response = await routeModel.insert(validation.record,client);

                if (response.status === 'E') {
                    routeErrors.push(response.message);
                    status = 'E';
                    message = 'Invalid File';
                    return {status: status, message: message, errors: routeErrors};
                }
            } 

        } else {
            routeErrors.push('Invalid File. Record[' + i + '] -> The routes array elements must be of type = Object');  

            if (routeErrors.length > 0) {
                status = 'E';
                message = 'Invalid File';
                return {status: status, message: message, errors: routeErrors};
            }    
        }    
    }

    return {status: status, message: message, errors: routeErrors};
}

const getEncryptedPassword = function(connections) {
    for (let i in connections) {
        if (connections[i].encrypt === "Y") {
            return connections[i].password;
        }
    }

    return null
}

const deleteConfigurations = async function() {
    
    let status = 'S';
    let message = 'OK';
    
    const pool = await utils.getClient();
    
    const client = await pool.connect();
     
    try {

        await client.query('BEGIN');
        
        let status = await utils.callSQL("DELETE FROM ROUTES WHERE 1 = $1",[1],client);

        if (status.status === "E") {
           status = "E";
           message = "Error Deleting Configurations (routes)";
           throw new CustomException();
        }

        status = await utils.callSQL("DELETE FROM FUNCTIONS WHERE 1 = $1",[1],client);

        if (status.status === "E") {
           status = "E";
           message = "Error Deleting Configurations (functions)";
           throw new CustomException();
        }

        status = await utils.callSQL("DELETE FROM CONNECTIONS WHERE 1 = $1",[1],client);

        if (status.status === "E") {
           status = "E";
           message = "Error Deleting Configurations (connections)";
           throw new CustomException();
        }

        status = await utils.callSQL("DELETE FROM APPLICATIONS WHERE 1 = $1",[1],client);

        if (status.status === "E") {
           status = "E";
           message = "Error Deleting Configurations (applications)";
           throw new CustomException();
        }
        
        await client.query('COMMIT');


    } catch (e) {
        console.log(e);
        console.log("Rollback Called");
        await client.query('ROLLBACK')
       // throw e
    } finally {
        client.release()
    }
     
    return {status: status , message: message };

}

const importConfigContent = async function(secretKey, content) {
    let importObj = null;
    let status = 'S';
    let message = 'OK';
    
    try {
       importObj = JSON.parse(content);
    } catch(e) {
        console.log(e);
       return {status: 'E' , message: 'Invalid File Format. The file must contain JSON Content', result: {} };  
       
    }
    
    if (!importObj) {
        return {status: 'E' , message: 'File is empty', result: {} };  
        
    }

    if (!importObj["connections"] && !importObj["functions"] && !importObj["routes"]) {
        return {status: 'S' , message: 'OK', result: {connections : {count: 0 , errors: [] } , functions : {count: 0 , errors: [] } , routes : {count: 0 , errors: [] }
        } };  
    }   

     const pool = await utils.getClient();

     const client = await pool.connect();
     let result = {connections: [] , functions: [] , routes:[] };
     
     try {

        await client.query('BEGIN');

        if (!!importObj["connections"]) {

          let encryptedPassword = getEncryptedPassword(importObj["connections"]);
          if (!!encryptedPassword && utils.decryptByKey(encryptedPassword,secretKey) === '') {
             return {status: "E" , message: "Invalid Secret Key", result: result};
          }

          const connectionStatus = await processConnections(secretKey, importObj["connections"], client);

          if (!connectionStatus) {
            const connections = {count : 0 , errors : [] }; 
            status = 'E';
            message = 'Invalid File';
            result.connections = connections;
            throw new CustomException();
         
          }
          if (connectionStatus.status === "E") {
             const connections = {count : 0 , errors :connectionStatus.errors }; 
             status = 'E';
             message = 'Invalid File';
             result.connections = connections;
             throw new CustomException();
          } else {
            const connections = {count : importObj["connections"].length , errors :connectionStatus.errors };   
            result.connections = connections;
          }
        }

        if (!!importObj["functions"]) {
            const functionStatus = await processFunctions(importObj["functions"], client);
            if (functionStatus.status === "E") {
               const functions = {count : 0 , errors : functionStatus.errors }; 
               status = 'E';
               message = 'Invalid File';
               result.functions = functions;
               throw new CustomException();
            } else {
              const functions = {count : importObj["functions"].length , errors : functionStatus.errors };   
              result.functions = functions;
            }   
        }

        if (!!importObj["routes"]) {
            const routeStatus = await processRoutes(importObj["routes"], client);
            if (routeStatus.status === "E") {
               const routes = {count : 0 , errors : routeStatus.errors }; 
               status = 'E';
               message = 'Invalid File';
               result.routes = routes;
               throw new CustomException();
            } else {
              const routes = {count : importObj["routes"].length , errors : routeStatus.errors };   
              result.routes = routes;
            }   
        }
  
        if (!!importObj["applications"]) {
            const applicationStatus = await processApplications(importObj["applications"], client);
            if (applicationStatus.status === "E") {
               const applications = {count : 0 , errors : applicationStatus.errors }; 
               status = 'E';
               message = 'Invalid File';
               result.applications = applications;
               throw new CustomException();
            } else {
              const applications = {count : importObj["applications"].length , errors : applicationStatus.errors };   
              result.applications = applications;
            }   
        }


        await client.query('COMMIT');


    } catch (e) {
        console.log(e);
        console.log("Rollback Called");
        await client.query('ROLLBACK')
       // throw e
    } finally {
        client.release()
    }
     
    return {status: status , message: message,  result: result };  
};

const importFileConfig = async function(secretKey, filename) {
    const fname = path.resolve(__dirname, filename   );
    let content = fs.readFileSync(fname, 'utf8');
    return await importConfigContent(secretKey,content);
} 

module.exports = {
    exportConfig: exportConfig,
    importConfig: importConfig,
    importConfigContent: importConfigContent,
    importFileConfig: importFileConfig,
    deleteConfigurations: deleteConfigurations,
    deleteConfig: deleteConfig
    
}