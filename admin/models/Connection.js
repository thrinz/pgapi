const utils = require('../Utils');
const coreModel = require('../core/models/Connection');


const isValidDBConnection = function(record) {
   const client = utils.getClientbyRecord(record);
   client.connect();
}

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

const validate = async function(record,mode, custom, pool) {
    
    const response = await coreModel.validate(record,mode,custom,pool);
    
    // write your custom code here

    return response;

}
 

const insert = async function(record) {
    
    // Before Insert: write your custom code here

    const response = await coreModel.insert(record);
    
    // After Insert: write your custom code here

    return response;

}

const update = async function(record) {
    
    // Before Update: write your custom code here

    const response = await coreModel.update(record);
    
    // After Update: write your custom code here

    return response;
}

const deleteRecord = async function(record) {
   
    //Before Delete:  write your custom code here

    const response = await coreModel.delete(record);
    
    //After Delete: write your custom code here

    return response;
}

const fetchAll = async function() {
    
    //Before Fetch:  write your custom code here

    const response = await coreModel.fetchAll();
    
    //After Fetch: write your custom code here

    return response;
}

module.exports = {
    isValidDBConnection: isValidDBConnection,
    validate: validate,
    insert: insert,
    update: update,
    delete: deleteRecord,
    fetchAll: fetchAll
 }