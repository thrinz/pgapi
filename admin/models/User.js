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
const coreModel = require('../core/models/User');
 
const validate = async function(record, mode, custom, pool) {
    
    const response = await coreModel.validate(record,mode, custom, pool);
    
    // write your custom code here

    return response;

}
 
const insert = async function(record) {
    
    // Before Insert: write your custom code here

    const response = await coreModel.insert(record);
    
    // After Insert: write your custom code here

    return response;

}

const insertArchive = async function(record) {
    
    // Before Insert: write your custom code here

    const response = await coreModel.insertArchive(record);
    
    // After Insert: write your custom code here

    return response;

}

const insertToken = async function(record) {
    
    // Before Insert: write your custom code here

    const response = await coreModel.insertToken(record);
    
    // After Insert: write your custom code here

    return response;

}

const update = async function(record) {
    
    // Before Update: write your custom code here

    const response = await coreModel.update(record);
    
    // After Update: write your custom code here

    return response;
}

const updatePassword = async function(record) {

    // Before Update: write your custom code here

    const response = await coreModel.updatePassword(record);
    
    // After Update: write your custom code here

    return response;
}

const updateToken = async function(record) {

    // Before Update: write your custom code here

    const response = await coreModel.updateToken(record);
    
    // After Update: write your custom code here

    return response;
}

const updateEnabledFlag = async function(record) {

    // Before Update: write your custom code here

    const response = await coreModel.updateEnabledFlag(record);
    
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

const fetchById = async function(id) {
    
    //Before Fetch:  write your custom code here

    const response = await coreModel.fetchById(id);
    
    //After Fetch: write your custom code here

    return response;
}


const fetchByIdUser = async function(id) {
    
    //Before Fetch:  write your custom code here

    const response = await coreModel.fetchByIdUser(id);
    
    //After Fetch: write your custom code here

    return response;
}

const fetchByUsername = async function(username) {
    
    //Before Fetch:  write your custom code here

    const response = await coreModel.fetchByUsername(username);
    
    //After Fetch: write your custom code here

    return response;
}

const fetchToken = async function(token) {
    
    //Before Fetch:  write your custom code here

    const response = await coreModel.fetchToken({token:token});
    
    //After Fetch: write your custom code here

    return response;
}


const validateSession = async function(record) {
    
    //Before Fetch:  write your custom code here

    const response = await coreModel.validateSession(record);
    
    //After Fetch: write your custom code here

    return response;
}

module.exports = {
    insert: insert,
    insertArchive: insertArchive,
    insertToken: insertToken,
    update: update,
    updatePassword: updatePassword,
    updateToken: updateToken,
    delete: deleteRecord,
    fetchAll: fetchAll,
    fetchById: fetchById,
    fetchToken: fetchToken,
    fetchByUsername: fetchByUsername,
    fetchByIdUser: fetchByIdUser,
    validate: validate,
    updateEnabledFlag: updateEnabledFlag,
    validateSession: validateSession
 }