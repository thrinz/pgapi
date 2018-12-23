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

const model = require('../models/Function');
const coremodel = require('../core/models/Function');
const utils = require('../Utils');

const create = async function(record) {
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

const testDBFunctions =  async function(req, res) {
    const functions = await model.fetchAll();

    let output = {};
    for (let i in functions) {
        const record = functions[i];    
        const resultsObject = await utils.validateFunction(record["connection_id"],record["db_method"]); 

        if (resultsObject.status === "E") {
            output[record.id] = { status: false, message: resultsObject.message};
            
        } else {
            output[record.id] = { status: true, message: "Function is Valid"};
        }
    }

    res.json(output);
};

module.exports = {
    create: create,
    createAPI: createAPI,
    update: update,
    fetch: fetch,
    delete: deleteItem,
    testDBFunctions: testDBFunctions,
    fetchByName: fetchByName
}