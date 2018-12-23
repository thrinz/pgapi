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

const model = require('../models/Route');
const utils = require('../Utils');
const colors = require('colors');

const create = async function(record) {
    
    let validation = await model.validate(record,'I',true);
    
    if (validation.status === 'E') {
        return {
            status: validation.status,
            message: validation.message
        };

    }    
    let response = await model.insert(validation.record);

    if (response.status === "S") {
       const dbRecord = await model.getRoutesByUrl(record.route_url);
       addRouteDetail(dbRecord.result[0]);
    }

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
    let deleteRouteFlag = false;
    let addRouteFlag = false;
    
    if (!id) {
        res.json({
            status: 'E',
            message: 'Missing id information'
        });
        return;
    }

    let record = req.body;
    record.id = id;
    const dbRecord = await model.fetchById(id);

    let validation = await model.validate(record,'U',true);
    if (validation.status === 'E') {
        res.json({
            status: validation.status,
            message: validation.message
        });
        return;
    }
    const response = await model.update(validation.record); 
    
    if (response.status === "S") {
        
        if (dbRecord[0].route_url !==  record.route_url ) {
            deleteRoute(dbRecord[0].route_url);
        }
        
        if (dbRecord[0].enabled_flag !==  record.enabled_flag && dbRecord[0].enabled_flag === "Y") {
            deleteRoute(dbRecord[0].route_url);
        } else {
            const dbRecord = await model.getRoutesByUrl(record.route_url);
            addRouteDetail(dbRecord.result[0]);
        }
    }

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

    const record = { id: id};
    const dbRecord = await model.fetchById(id);

    let validation = await model.validate(record,'D',true);
    if (validation.status === 'E') {
        res.json({
            status: validation.status,
            message: validation.message
        });
        return;
    }
    const response = await model.delete(record); 
    
    if (response.status === 'S') {
        deleteRoute(dbRecord[0].route_url);
    }
    

    res.json(response);   
}

const fetch = async function(req, res) {
    const response = await model.fetchAll();
    res.json(response);  
};

const fetchById = async function(record) {
    const response = await model.fetchById(record);
    res.json(response);  
};


const callDB = async function(req, res, routeCallback,contentType,pool) {

    var data = req.body, results = [],
        queryString = "";

    if (req.method === "GET") data = req.query;

    if (contentType === "file") data = { token : req.headers['authorization'] , file_name :  req.file.originalname};

    if (!utils.isEmpty(req.params)) {
       data["urlparams"] =  req.params;   
    }

    queryString = "select " + routeCallback + "( $1 ) as result";

    let response = await utils.getSQLResultswithStatus(queryString,[ JSON.stringify(data)], pool);

    return res.json(response);

}

// End of Call

const addRouteDetail = function(routeInfo) {

    var flag = 0;
    var r = global.router;
    
    for (var i = r.stack.length - 1; i >= 0; i--) {
        if (r.stack[i].path === routeInfo.route_url) {
            global.router.stack.splice(i, 1);
            addRoute(routeInfo);
            flag = 1;
        }
        else if (r.stack[i].path === undefined)
        {
            if (r.stack[i].route)
            {
                if ( r.stack[i].route.path === routeInfo.route_url)
                {
                    global.router.stack.splice(i, 1);
                    addRoute(routeInfo);
                    flag = 1;
                }
            }
            else
            {
                console.log("Route Object empty");
            }
        }
    }

    if (!flag)
    {
        addRoute(routeInfo);
    }

}

const addRoute = async function (routeObj) {
    if ( routeObj.route_method === "POST")
        {

            console.log("loading POST " + routeObj.route_url );
            global.router.post(routeObj.route_url, async function(req, res) {
                let record = {
                    host: routeObj.host
                  , port: routeObj.port
                  , username: routeObj.username
                  , password:  utils.decrypt(routeObj.password)
                  , database: routeObj.database
                  , name:  routeObj.connection_name
                };

                let pool = await utils.getPoolByName(routeObj.connection_name,record);
                callDB(req,res,routeObj.route_callback,routeObj.content_type, pool);

            });
        }
        else
        {
            console.log("loading GET " + routeObj.route_url );
            global.router.get(routeObj.route_url,  async function(req, res) {
                let record = {
                    host: routeObj.host
                  , port: routeObj.port
                  , username: routeObj.username
                  , password:  utils.decrypt(routeObj.password)
                  , database: routeObj.database
                  , name:  routeObj.connection_name
                };

                let pool = await utils.getPoolByName(routeObj.connection_name,record);
                callDB(req,res,routeObj.route_callback,routeObj.content_type,pool);

            });
        }
}

const deleteRoute = function (url) {
    console.log("Deleting route " + url);
    
    for (var i = global.router.stack.length - 1; i >= 0; i--) {
        if (global.router.stack[i].path === url) {
            global.router.stack.splice(i, 1);
        }
        else if (global.router.stack[i].path === undefined)
        {
            if (global.router.stack[i].route)
            {
                if ( global.router.stack[i].route.path === url)
                {
                    global.router.stack.splice(i, 1);
                }
            }
            else
            {
                console.log("Route Object empty");
            }
        }
    }
}

const getRoutes = async function () {

    let routesInfo = [];
    const response = await model.getRoutes();
    
    if (response.status === "E") {
        return response;
    }

    routesInfo = response.result;

    global.router.get('/', (req, res) => {  // 2
        res.send('Homepage!')
        });
        
      console.log("Generating routes... ".blue)
      routesInfo.forEach(function(routeObj){

        if (routeObj.enabled_flag === "Y") {
            addRouteDetail(routeObj);
        }
        
    });

    return {status: "S", message : "OK"};
};

const refreshRoutes = async function(req, res) {
    global.router.stack.splice(0,global.router.stack.length);
    console.log("Refreshing routes");

    const status = await getRoutes();
    res.json(status);  
};

module.exports = {
    create: create,
    createAPI: createAPI,
    update: update,
    fetch: fetch,
    fetchById: fetchById,
    delete: deleteItem,
    getRoutes: getRoutes,
    refreshRoutes: refreshRoutes,
    deleteRoute: deleteRoute
}