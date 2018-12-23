const utils = require('../Utils');
const coreModel = require('../core/models/Function');


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
    validate: validate,
    insert: insert,
    update: update,
    delete: deleteRecord,
    fetchAll: fetchAll
 }