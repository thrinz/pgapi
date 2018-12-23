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
const path = require('path');
const fs = require('fs');

const executeFunction = async function(req, res) {
    let record = req.body;
    
    try {
       let response = await utils.loadDBFunctionString(record.sql);
       res.json(response);
    } catch(e) {
       res.json({status:"E" , message: e.message});
    }
    

  //  res.end();
}

const getDBFunction = async function(req, res) {
   let functionName = req.query.db_method;
   let connectionID = req.query.connection_id;
   let sql = "select pg_get_functiondef(oid) as result from pg_proc where proname = $1"
   const sqlResult = await utils.getSQLResultsByConnectionId(connectionID,sql, [functionName]);
   let result = "";
   if (!!sqlResult && !!sqlResult.data && sqlResult.data.length > 0 ) {
      result = sqlResult["data"][0]["result"];
   } 
   const response = {status: "S" , response: "OK", data: result};
   res.json(response);
}

const saveSQL = async function(req, res) {
    let record = req.body;
    
    try {
       fs.writeFileSync(path.resolve(__dirname, '../sql/main.sql'),record.sql,{encoding:'utf8',flag:'w'})
       res.json({status: "S" , message: "OK"});
    } catch(e) {
       // console.log(e);
       res.json({status:"E" , message: e.message});
    }
    

  //  res.end();
}

const getSQL = async function(req, res) {
    try {
       let contents = fs.readFileSync(path.resolve(__dirname, '../sql/main.sql'), 'utf8');
       res.json({status: "S" , message: "OK" , data: contents});
    } catch(e) {
       // console.log(e);
       res.json({status:"E" , message: e.message});
    }
    

  //  res.end();
}


module.exports = {
    executeFunction: executeFunction,
    saveSQL: saveSQL,
    getSQL: getSQL,
    getDBFunction: getDBFunction
}