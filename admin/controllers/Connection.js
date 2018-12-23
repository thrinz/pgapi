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

const model = require('../models/Connection');
const coremodel = require('../core/models/Connection');
const utils = require('../Utils');

const create = async function(record) {
    let validation = await model.validate(record,'I',true);
    
    if (validation.status === 'E') {
        return {
            status: validation.status,
            message: validation.message
        };
    }    
    return await model.insert(validation.record);
   
}

const addDefaultConnection = async function() {
// Add the default Database Connection
const db = JSON.parse(process.env.pgapi);
let record = {
    name: "default-connection",
    host: db.DB_HOST,
    port: db.DB_PORT,
    database: db.DB_NAME,
    username: db.DB_USER,
    password: db.DB_PASSWORD,
    config_flag: "Y"
  };
 
  let response = await create(record);

  if (response.status === "S") {
    console.log("Default connection entry added.")
  } else {
    console.log(`Failed to create default connection ${response.message}`.yellow);
  }

}



const createAPI = async function(req, res) {
    let record = req.body;
    let response = await create(record);
    res.json(response);   
    res.end();
}

const update = async function(req, res) {
    let id = req.params.id;
    
    if (!id) {
        res.json({
            status: 'E',
            message: 'Missing id information'
        });
        return;
    }
              
    let record = req.body;
    record.id = id;
    let validation = await model.validate(record,'U',true);
    if (validation.status === 'E') {
        res.json({
            status: validation.status,
            message: validation.message
        });
        return;
    }
    const response = await model.update(validation.record); 
    res.json(response);   
}

const deleteItem = async function(req, res) {
    let id = req.params.id;
    
    if (!id) {
        res.json({
            status: 'E',
            message: 'Missing id information'
        });
        return;
    }

    let record = { id: id};
    let validation = await model.validate(record,'D',true);
    if (validation.status === 'E') {
        res.json({
            status: validation.status,
            message: validation.message
        });
        return;
    }
    const response = await model.delete(record); 
    res.json(response);   
}

const fetch = async function(req, res) {
    const response = await model.fetchAll();
    res.json(response);  
};

const fetchByName = async function(record) {
    const response = await coremodel.fetchByName(record);
    return response;
};

const testDBConnection =  async function(req, res) {

    if (!!req.query && !!req.query.host &&  !!req.query.port &&  !!req.query.database 
        &&  !!req.query.username &&  !!req.query.password ) {
        const record = req.query;    
        if (!!record.id && record.decrypt === 'Y') {
            const passwd = record["password"];
            record["password"] = utils.decrypt(passwd);
        }
        const response = await utils.validateConnection(record);
        res.json({status: response.status , message: response.message });  
        return;
    }
    else {
        res.json({status: 'E' , message: 'Missing required parameters : [host,port,database,username,password]'});  
        return;
    }
};

const testDBConnections =  async function(req, res) {
    const connections = await model.fetchAll();
    let output = {};
    for (let i in connections) {
        const record = connections[i];    
        const passwd = record["password"];
        record["password"] = utils.decrypt(passwd);
        const response = await utils.validateConnection(record);
        if (response.status === "E") {
            output[record.id] = false;
        } else {
            output[record.id] = true;
        }
        
    }
    res.json(output);
};

module.exports = {
    createAPI: createAPI,
    create: create,
    update: update,
    fetch: fetch,
    delete: deleteItem,
    testDBConnection: testDBConnection,
    testDBConnections: testDBConnections,
    addDefaultConnection: addDefaultConnection,
    fetchByName: fetchByName
}