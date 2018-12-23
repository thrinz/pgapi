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
const coreModel = require('../core/models/Route');


const validate = async function(record,mode,custom,pool) {
    
    const response = await coreModel.validate(record,mode,custom,pool);
    
    let sql = "";
    let params = "";
    let status = "S";
    let message = "OK";

    // write your custom code here
    if (custom) {
        if (response.status === "S" && ( mode === "I" || mode === "U")) {
        if (mode === "I") {
            sql = "SELECT 1 FROM routes WHERE route_method = $1 AND route_url = $2";
            params = [record.route_method,record.route_url];
        } else if (mode === "U") {
            sql = "SELECT 1 FROM routes WHERE route_method = $1 AND route_url = $2 AND id!= $3";
            params = [record.route_method,record.route_url, record.id];  
        }
        const resCount = await utils.checkAttribute(sql,params);
        if (resCount > 0) {
            status = "E";
            message = "Unique Validation failed for the columns[route_method,route_url]";
            return {status: status, message: message};
        }
        }
    }

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

const fetchById = async function(id) {
    
    //Before Fetch:  write your custom code here

    const response = await coreModel.fetchById(id);
    
    //After Fetch: write your custom code here

    return response;
}

const getRoutes = async function() {
    const sql = "select r.id route_id , r.enabled_flag, 'json' as content_type ,  r.route_method , r.route_url , f.db_method  as route_callback, c.database , c.host , c.username , c.port , c.password , c.name as connection_name " +
   " from  routes r  " +
   "     , functions f " +
   "    , connections c " +
   " where r.function_id = f.id " +
   " and   c.id = f.connection_id ";

   let out = {};

    try {
        
       return await utils.getSQLResultswithStatus(sql,[]);
    } catch (e) {
        console.log("Error");
        return e;
    }
}

const getRoutesByUrl = async function(url) {
    const sql = "select r.id route_id , 'json' as content_type ,  r.route_method , r.route_url , f.db_method  as route_callback, c.database , c.host , c.username , c.port , c.password , c.name as connection_name " +
   " from  routes r  " +
   "     , functions f " +
   "    , connections c " +
   " where r.function_id = f.id " +
   " and   c.id = f.connection_id and r.route_url = $1";

   let out = {};

    try {
       return await utils.getSQLResultswithStatus(sql,[url]);
    } catch (e) {
        console.log("Error");
        return e;
    }
}


module.exports = {
    validate: validate,
    insert: insert,
    update: update,
    delete: deleteRecord,
    fetchAll: fetchAll,
    getRoutes: getRoutes,
    fetchById: fetchById,
    getRoutesByUrl: getRoutesByUrl
 }