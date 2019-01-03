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

const uuidv1 = require('uuid/v1');
const { Client } = require('pg')
const { Pool } = require('pg')
const path = require('path');
const fs = require('fs');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
let pool;

const getClient = async function() {

      if (pool) {
        return pool;
      } else {
        const db = JSON.parse(process.env.pgapi);
        pool = await new Pool({
          host: db.DB_HOST,
          port: db.DB_PORT,
          database: db.DB_NAME,
          user: db.DB_USER,
          password: db.DB_PASSWORD
        });
        
        pool.on('error', (err, client) => {
          console.error('Unexpected error on idle client', err)
          pool = null
          process.exit(-1)
        });

        return pool;
      }
}

const getPool = async function () {
  if (pool) {
    return pool;
  } else {
    const db = JSON.parse(process.env.pgapi);
    pool = await new Pool({
      host: db.DB_HOST,
      port: db.DB_PORT,
      database: db.DB_NAME,
      user: db.DB_USER,
      password: db.DB_PASSWORD
    });
  
    pool.on('error', (err, client) => {
      console.error('Unexpected error on idle client', err)
      pool = null
      process.exit(-1)
    });

    return pool;
  }

}

const getPoolByName = async function (name, record) {
  let poolname = name;
  if (!!global.pool && !!global.pool[poolname]) {
    return global.pool[poolname];
  } else {
    global.pool[poolname] = await new Pool({
      host: record.host,
      port: record.port,
      database: record.database,
      user: record.username,
      password: record.password
    });
  
    global.pool[poolname].on('error', (err, client) => {
      console.error('Unexpected error on idle client', err)
      global.pool[poolname] = null
      process.exit(-1)
    });

    return global.pool[poolname];
  }

}

const getClientByRecord = async function(record) {
  const str = {
    host: record["host"],
    port: record["port"],
    database: record["database"],
    user: record["username"],
    password: record["password"]
    };
  
  return await new Client(str);
}

const exportConfig = async function(secretKey) {
  let sql = " select row_to_json(t.*) as output from ( select (select array_to_json(array_agg(r.*)) from routes r) as routes, " +
            " (select array_to_json(array_agg(f.*)) from functions f) as functions, " +
            " (select array_to_json(array_agg(c.*)) from connections c) as connections, " +
            " (select array_to_json(array_agg(a.*)) from applications a) as applications " +
            " ) as t ";
  let results = await getSQLResults(sql,[]);

  if (!!results && !!results.length > 0) {
    let data = results[0].output;

     if (!!data && !!data["connections"]) {
       let connections = data["connections"]
       for (let i in connections) {
         let connection = connections[i];
         let passwd = connection["password"];
         let decryptPassword = decrypt(passwd);
         let encryptPassword = encryptByKey(decryptPassword,secretKey);
         connection["password"] = encryptPassword;
         connection["encrypt"] = "Y";
       }
     }

     return data;
  }

  return {};
}

const getClientByConnectionID = async function(connectionID) {

  try {
    const recordArray = await getSQLResults("SELECT * FROM CONNECTIONS WHERE id = $1",[connectionID]);
    let record = recordArray[0];

    record["password"] = decryptByKey(record["password"],'connection');

    return getClientByRecord(record);
    
    } catch (e) {
      console.log(e);
      return;
    }
}

const encrypt = function (text){
  return encryptByKey(text,process.env.PGAPI_SECRET_KEY);
}

const encryptByKey = function (text, key){
  const token = jwt.sign({ password: text }, key);
  return token;
}

const encryptObjectByKey = function (record, key){
  const token = jwt.sign(record, key);
  return token;
}

const encryptObject = function (record){
  return encryptByKey(record,process.env.PGAPI_SECRET_KEY);
}

 
const decrypt = function (text){
  return decryptByKey(text,process.env.PGAPI_SECRET_KEY);
}

const decryptByKey = function (token, key){

  try {
    var decoded = jwt.verify(token, key);

    return decoded.password;
  } catch(err) {
    // err
    return '';
  }
}

const decryptObjectByKey = function (token, key){

  try {
    var decoded = jwt.verify(token, key);
 
    return decoded;
  } catch(err) {
    // err
    return {};
  }
}

const encryptPassword = function(userPassword) {
  const saltRounds = 10;
  var salt = bcrypt.genSaltSync(saltRounds);
  var hash = bcrypt.hashSync(userPassword, salt);
  return hash;
}

const isValidPassword = function(userPassword, hash) {
  return bcrypt.compareSync(userPassword, hash);
}

const validateFunction = async function(connectionId,name) {

  let  sql = " SELECT  p.proname as name, " +
  " pg_catalog.pg_get_function_result(p.oid) as result_datatype, " +
  " pg_catalog.pg_get_function_arguments(p.oid) as arguments " +
  " FROM pg_catalog.pg_proc p " +
  " LEFT JOIN pg_catalog.pg_namespace n ON n.oid = p.pronamespace " +
  " WHERE pg_catalog.pg_function_is_visible(p.oid) " +
  " AND n.nspname <> 'pg_catalog' " +
  " AND n.nspname <> 'information_schema'  " +
  " AND  LOWER(p.proname) = LOWER($1)";
  
  const resultsObject = await getSQLResultsByConnectionId(connectionId,sql,[name]); 
  let status = "S";
  let message = "OK";
  
  if (resultsObject.status === "E") {
    return {status:resultsObject.status, message: resultsObject.message};
  }
  const results = resultsObject.data;
  
  for (let i in results) {
    status = "S";
    if (results[i]["result_datatype"] === "json") {
      let functionParameters = results[i]["arguments"];
      if (functionParameters.indexOf(",") >= 0) {
         message = "The function must contain only one input parameter with datatype=json and the return datypetype=json";
         status = "E"; 
      }
      if (status === "S") {
         paramsArray = functionParameters.split(" ");
         if (paramsArray[1].trim().toLowerCase() !== "json") {
           status = "E";
           message = "The function must contain only one input parameter with datatype=json and the return datypetype=json";
         }
      }
      if (status === "S") {
        return {status: "S" , message: "OK"};
      }
    } else {
       status = "E";
       message = "The function must contain only one input parameter with datatype=json and the return datypetype=json";
    } 
  }
  if (status === "S") {
    return {status: "E" , message: "Unable to find the function Name in the database"};
  } else {
    return {status:status,message:message};
  }
  

}

const validateConnection = async function(record) {
  try {
      let client = await new Client({
          host: record["host"],
          port: record["port"],
          database: record["database"],
          user: record["username"],
          password: record["password"]
        });
      await client.connect();
      client.end()
      return {status: "S" , message: "OK"};  
    } catch(e) {
      return {status: "E" , message: "Invalid Database Connection Information"} 
    }
    
}

function hasRequiredConstraint(constraintsArray) {
   for (var i in constraintsArray) {
     if (constraintsArray[i] === "PRIMARY" || constraintsArray[i]  === "REQUIRED" || constraintsArray[i]  === "UNIQUE") {
       return true;
     }
   }
   return false;
}

const isURL = function(url) {
  let urlwoslash = url.replace(/\//g, '');
  return !/[~`!@ #$%\^&*+=\-\[\]\\';,/{}|\\"<>\?]/g.test(urlwoslash);
}

function isDate(str) {
  let timestamp = Date.parse(str);

  if (isNaN(timestamp) == false) {
    return true;
  } else {
    return false;
  }
}

const getRequiredColumns = function(model,mode) {
   let columns = model["columns"];
   let requiredColumns = []
   for (let column in columns) {
      if (columns[column]["validate"] && columns[column]["validate"][mode] ) {
        let constaints = columns[column]["validate"][mode];
        if (hasRequiredConstraint(constaints)) {
          requiredColumns.push(column);
        }
      }
   }
   return requiredColumns;
}

const validateRequiredColumns = function(model,mode,record,message) {
  const requiredColumns = getRequiredColumns(model,mode);
  let status = 'S';
  let columns = "";
  for (let i in requiredColumns) {
    if (!record[requiredColumns[i]]) {
      status = "E";
      columns = columns + requiredColumns[i] + " ";
    }
  }
  if (status === "E") {
    message = 'Missing Required Information for fields[ ' + columns + ']';
  }
  return {status: status , message:message};
}

const getDefaultValue = function(value,datatype) {
  if ( datatype === "timestamp") {
    if (value === "NOW") {
      return new Date();
    } else {
      return value;
    }
  } else {
     if (value === "UUID") {
        return getUUID();
     }
     return value; 
  }
}

const handleDefaults = function(model,record,mode) {
  var output = {}
  let columns = model["columns"];
  for (let column in columns) {
    if (!!columns[column]["default"] && !!columns[column]["default"][mode]) {
      const defaultRecord =  columns[column]["default"][mode];
      if (defaultRecord["overwrite"]) {
        output[column] =  getDefaultValue(defaultRecord["value"],columns[column]["datatype"]);
      } else {
        if (!record[column]) {
          output[column] = getDefaultValue(defaultRecord["value"],columns[column]["datatype"]);
        } else {
          output[column] = record[column];
        }
      }
    } else {
        output[column] = record[column];
    }
  }

  return output;
}

const validateDatatypes = function(model,mode,record) {
  let output = {};
  let status = "S";
  let message = "OK"; 

  let columns = model["columns"];

  for (let column in columns) {
    if (columns[column]["validate"] && columns[column]["validate"][mode] ) {
      let constraints = columns[column]["validate"][mode];
      if(!!record[column]) {
        for(let i in constraints) {
          if (constraints[i] === "NUMBER") {
            if (!isNumber(record[column])) {
              status = 'E';
              message = 'Failed numeric validation for column[ '+ record[column] + ' ]';
              return {status: status , message:message};
            }
          }
          if (constraints[i] === "DATE") {
            if (!isDate(record[column])) {
              status = 'E';
              message = 'Failed Date validation for column[ '+ record[column] + ' ]';
              return {status: status , message:message};
            }
          }
          if (constraints[i] === "URL") {
            if (!isURL(record[column])) {
              status = 'E';
              message = 'Failed URL validation for column[ '+ record[column] + ' ]';
              return {status: status , message:message};
            }
          }
        }
      }
    }
  }

  return {status: status , message:message};
}

const validateListConstraint = async function (listString,column,record) {
  let a = listString.split("-");
  let status = "S";
  let message = "OK";
  const variables = a[1].split(";");

  for (let i in variables) {
    let listItem = variables[i];
    if (record[column] === listItem) {
      return {status: status , message:message};
    }
  }
  status = 'E';
  message = 'Failed List validation for column[ '+ record[column] + ' ]. Valid Values are - ' + a[1];
  return {status: status , message:message};
}

const validateReferenceConstraints = async function (referenceString,column,record,pool) {
   let a = referenceString.split("-");
   let status = "S";
   let message = "OK"; 
   let sqlWhere = " WHERE ";
   const refTable = a[0].replace("$REF.","");
   const variables = a[1].split(";");
   let sqlParams = [];
   
   for (let i in variables) {
     let variableMap = variables[i];
     let params = variableMap.split(",");
     let bind = parseInt(i + 1);
     sqlParams.push(record[params[1]]);
     sqlWhere = sqlWhere + params[0] + " = $" + bind; 
   }
   
   const sql = "SELECT 1 FROM " + refTable  + " " + sqlWhere;
   const nameCount = await checkAttribute(sql,sqlParams,pool);                    
   if (nameCount === 0 ) {
       status = 'E';
       message = 'Reference Key violation for column [' + column + ']. No data found in the table [' + refTable + ']';
       return {status: status , message:message};
   }
   return {status: status , message:message};

}

const checkSQLByColumns = async function (tableName,columns,record,excludeCurrentRow,pool) {
  let params = [];
  let sql = "SELECT 1 FROM "  + tableName + " WHERE 1=1 ";

  let columnsStr = columns.replace("(","");
  columnsStr = columnsStr.replace(")","");

  let columnArray = columnsStr.split(",");

  for (let i in columnArray) {
    const param = parseInt(i) + 1;
    sql = sql + " AND " + columnArray[i] + " = $" + param ;
    params.push(record[columnArray[i]]);
  }

  if (!!excludeCurrentRow) {
    sql = sql + " AND id != $" + (columnArray.length + 1);
    params.push(record["id"]);
  }
  
  const nameCount = await checkAttribute(sql,params,pool);    

  if (nameCount > 0 ) {
    return true;
  }
  else {
    return false;
  }   

}
const validateTableConstraints = async function (model,mode,record,pool) {
  let output = {}
  let status = "S";
  let message = "OK"; 
  let columns = model["columns"];

  if (!model["validate"]) {
    return {status: status , message:message};
  }
  let validateTable = model["validate"];
  let constraints = validateTable[mode];
  
  for (let i in constraints) {
    let constraint = constraints[i];
    
    if (constraint.indexOf("UNIQUE(") >=0 ) {
      const exists = await checkSQLByColumns(model["name"], constraint.replace("UNIQUE",""), record, false,pool); 

      if (!!exists) {
        status = 'E';
        message = 'Duplicate Value for columns ' + constraint.replace("UNIQUE","") + '. This value combination already exist';
        return {status: status , message:message};
      }
       
    } else if (constraint.indexOf("UNIQUE_EXCLUDE(") >=0 ) {
      const exists = await checkSQLByColumns(model["name"], constraint.replace("UNIQUE_EXCLUDE",""), record, true, pool);

      if (!!exists) {
        status = 'E';
        message = 'Duplicate Value for columns ' + constraint.replace("UNIQUE_EXCLUDE","") + '. This value combination already exist';
        return {status: status , message:message};
      }

    }
  }

  return {status: status , message:message};
}


const validateConstraints = async function (model,mode,record,pool) {
  let output = {}
  let status = "S";
  let message = "OK"; 
  let columns = model["columns"];
  for (let column in columns) {
    if (columns[column]["validate"] && columns[column]["validate"][mode] ) {
      let constraints = columns[column]["validate"][mode];
      if(!!record[column]) {
        for(let i in constraints) {
          if (constraints[i] === "UNIQUE") {
            let sql = "";
            let params = "";
            let nameCount = 0;

            sql = "SELECT 1 FROM " + model["name"] + " WHERE " + column + " = $1";
            params = [record[column]];
            nameCount = await checkAttribute(sql,params,pool);                    
        
            if (nameCount > 0 ) {
                status = 'E';
                message = 'Duplicate Value for column [' + column + ']. This value already exist';
                return {status: status , message:message};
            }
          } else if (constraints[i] === "UNIQUE_EXCLUDE") {
              let sql = "";
              let params = "";
              let nameCount = 0;

              sql = "SELECT 1 FROM " + model["name"] + " WHERE " + column + " = $1 AND id != $2";
              params = [record[column],record["id"]];
              nameCount = await checkAttribute(sql,params,pool);                    
              if (nameCount > 0 ) {
                  status = 'E';
                  message = 'Duplicate Value for column [' + column + ']. This value already exist';
                  return {status: status , message:message};
              }
          }  else if (constraints[i] === "EXISTS") {
              let sql = "";
              let params = "";
              let nameCount = 0;

              sql = "SELECT 1 FROM " + model["name"] + " WHERE " + column + " = $1";
              params = [record[column]];
              nameCount = await checkAttribute(sql,params,pool);                    
              if (nameCount === 0 ) {
                  status = 'E';
                  message = 'No Data Found for the column [' + column + ']';
                  return {status: status , message:message};
              }         
          } else if (constraints[i].indexOf("$REF.") >=0 ) {
              const reference = await validateReferenceConstraints(constraints[i],column,record,pool);
              if (reference.status === "E") {
                status = reference.status;
                message = reference.message;
                return {status: status , message:message};
              }
          } else if (constraints[i].indexOf("LIST") >=0 ) {
             const reference = await  validateListConstraint(constraints[i],column,record);
             if (reference.status === "E") {
              status = reference.status;
              message = reference.message;
              return {status: status , message:message};
            }
          }
        }
      }
    }
  }

  return {status: status , message:message};
}

const getSQLResultsByConnection = async function (record,sql,params) {
   
  const client = await getClient();
  let response = {status: 'S',message: 'OK'};
    try {
     // await client.connect();
      const res = await client.query(sql,params);
      response = res.rows;    
    } catch (err) {
      console.log(err.stack);  
      response = {};
    } 
    finally {
    //  client.release()
    }
  
  return response;
}

const getSQLResultsByConnectionId = async function (connectionId,sql,params) {
   
  let client = null;
  let response = {status: 'S',message: 'OK'};
    try {
      client = await getClientByConnectionID(connectionId);

      await client.connect();
      if (!client) {
        return {status: 'E',message: 'Error connection to the Database'};
      }
      const res = await client.query(sql,params);
      response = {status: "S" , message: "OK", data: res.rows};    
    } catch (err) {
      console.log("Error");
      console.log(err.stack);  
      response = {status: "E", message: "Failed to validate the function. Either the function name does not exist or we are unable to connect to the database"};
      return response;
    } 
    finally {
      if (response.status === "S") {
        client.end();
      }
      return response;
      
    }

}

const getSQLResults = async function (sql,params,pool) {
   
    let client = null;
      
    if (!!pool) {
      client = pool;
    } else {
      client = await getClient();
    }

    let response = {status: 'S',message: 'OK'};
      try {
    //    await client.connect();
        const res = await client.query(sql,params);
        response = res.rows;    
      //  console.log(response);   
      } catch (err) {
        console.log(err.stack);  
        response = {};
      } 
      finally {
      //  client.release()
      }
    
    return response;
 }

 const isEmpty = function(obj) {
  for(var prop in obj) {
      if(obj.hasOwnProperty(prop))
          return false;
  }

  return JSON.stringify(obj) === JSON.stringify({});
}

 const getSQLResultswithStatus = async function (sql,params,pool) {
   
  let client = null;
    
  if (!!pool) {
    client = pool;
  } else {
    client = await getClient();
  }

  let response = {status: 'S',message: 'OK'};
    try {
  //    await client.connect();
      const res = await client.query(sql,params);
      response = {status: 'S',message: 'OK' , result: res.rows};   
      return response; 
    //  console.log(response);   
    } catch (err) {
      console.log(err.stack);  
      response = {status: 'E',message: err.stack , result: {}};    
      return response;
    } 
    finally {
    //  client.release()
    }
  
  return response;
}

var callSQL = async function (sql,params,pool) {

    let client = null;
    
    if (!!pool) {
      client = pool;
    } else {

      client = await getClient();
    }
      
    let response = {status: 'S',message: 'OK'};
      try {
   //     await client.connect();
        const res = await client.query(sql,params);
      } catch (err) {
        console.log(err.stack);  
        response = {status: 'E',message: err.stack};
      } 
      finally {
     //   client.release()
      }
    
    return response;
 }

 var checkAttribute = async function (sql,params,pool) {
    let response = 0;
    let client = null;
      
    if (!!pool) {
      client = pool;
    } else {
      client = await getClient();
    }
  
    try {
     
    //  await client.connect();
      var res = await client.query(sql,params);
     // console.log(res);
      response = res.rowCount;      
    } catch (err) {
        console.log(err);
    } 
    finally {
     // client.release()
    }
    return response;
}

const getModelMetadata = function(modelName) {
  var filename = path.resolve(__dirname, '../admin/install/db/database.json');

  var sql = fs.readFileSync(filename).toString();
  

  var db = JSON.parse(sql);

  return db[modelName];
}

const dataExistsSQL = async function (sql,params) {
  let response = 0;
  const client = await getClient();

  try {
   
    await client.connect();
    var res = await client.query(sql,params);
   // console.log(res);
    response = res.rowCount;      
  } catch (err) {
      console.log(err);
  } 
  finally {
    client.release()
  }
  return response;
}

const checkId = async function (tableName,id) {
      let response = 0;
      const client = await getClient();
    
      try {
       
        await client.connect();
        var res = await client.query("SELECT id FROM " + tableName + " WHERE id =$1",[id]);
        response = res.rowCount;      
      } catch (err) {
        console.log(err);
      } 
      finally {
      //  client.release()
      }
      return response;
 }


 const isNumber = function (i) {
    if (isNaN(i)) {
        return false;
    }
    return true;
}

const getUUID = function() {
    return uuidv1();
}

const formatDate = function  (d) {
    var year = d.getFullYear()
    var months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    var month = months[d.getMonth()];
    var day = d.getDate();
    var hour = d.getHours();
    var minutes = d.getMinutes();
    var seconds = d.getSeconds();
    if (hour < 10) hour = '0' + hour;
    if (minutes < 10) minutes = '0' + minutes;
    if (seconds < 10) seconds = '0' + seconds;
    return (day + '-' + month + '-' + year + ' ' + hour  + ':' + minutes + ':' + seconds )
 }

const isValidFunction = function() {
    return 'S';
}

const getFileNamesFromDir = function (path) {

  return new Promise(function (resolve, reject) {
    fs.readdir(path, function (error, result) {
      if (error) {
        reject(error);
      } else {
        resolve(result);
      }
    });
  });
}

const installApplication = async function(name) {
  console.log(`Installing Application [${name}]... `.blue);

  await loadDDL(path.resolve(__dirname, `../admin/apps/${name}/db/script.sql`));
  await executeDBFunctionsFromDir(path.resolve(__dirname, `../admin/apps/${name}/db/functions`));
  var filename = path.resolve(__dirname, `../admin/apps/${name}/install.json` );

  try {
    var contents = fs.readFileSync(filename).toString();
    let response = await getSQLResults("SELECT install_application($1) as result ",[contents]);
    return response[0]["result"];
  } catch(e) {
     return {status: "E" , message: `Unable to locate the application folder in the apps folder : ${name}`};
  }
}

const loadDBFunction = async function (filename,startLog,endLog,errorLog) {
  const db = JSON.parse(process.env.pgapi);
  const client = new Client({
    host: db.DB_HOST,
    port: db.DB_PORT,
    database: db.DB_NAME,
    user: db.DB_USER,
    password: db.DB_PASSWORD
  });

  await client.connect();
  //var filename = path.resolve(__dirname, filename);

  var sql = fs.readFileSync(filename).toString();
  startLog(filename);

  try {
    res = await client.query(sql);
    endLog(filename); 
  } catch (err) {
    errorLog(filename);
    throw err
  }	  

  await client.end()
}

const loadDBFunctionString = async function (codeString) {
  const db = JSON.parse(process.env.pgapi);
  const client = new Client({
    host: db.DB_HOST,
    port: db.DB_PORT,
    database: db.DB_NAME,
    user: db.DB_USER,
    password: db.DB_PASSWORD
  });

  await client.connect();
  //var filename = path.resolve(__dirname, filename);

  try {
    let messages = [];
    client.on('notice', function(msg) {
      const keys = Object.keys(msg)

      messages.push({message: msg.message, severity: msg.severity, where: msg.where});
    });
    res = await client.query(codeString);
    
    if (res.command === "CREATE") {
      return {status:"S",command: res.command, message: "OK"};
    } else if (res.command === "SELECT") {
      let fields = [];
      for(let i in res.fields) {
        let field = res.fields[i];
        fields.push ({title: field.name, dataIndex: field.name, format: field.format});
      }
      let data = [];
      for(let i in res.rows) {
        let row = res.rows[i];
        
        const keys = Object.keys(row)
        //row.key = i;
        for(k in keys) {

          if (typeof row[keys[k]] === 'object' && row[keys[k]] !== null) {
            row[keys[k]] = JSON.stringify(row[keys[k]]);
          }
        }
        row.key = i;
        data.push (row);
      }
      return {status:"S", message: "OK" ,command: res.command, columns : fields , data: data , notification: messages};
    }
    return {status:"S",command: res.command, message: "OK"};

  } catch (err) {
    console.log(err.message);
    console.log(err.position);
    const line = (codeString.substring(0, err.position).match(/\n/g) || []).length + 1;
    return {status: "E" , message: err.message , line_number:line};
   // throw err
  }	  

  await client.end()
}

const loadDDL = async function (filename,startLog, endLog, errorLog) {
  const db = JSON.parse(process.env.pgapi);
  const client = new Client({
    host: db.DB_HOST,
    port: db.DB_PORT,
    database: db.DB_NAME,
    user: db.DB_USER,
    password: db.DB_PASSWORD
  });

   let _startLog = function(filename) {
     //console.log("Compiling File : " + filename);
   }

   let _endLog = function(filename) {
    // console.log("File compilation completed : " + filename);
   }

   let _errorLog = function(filename) {
     console.log(`Error compiling File: ${filename}`.blue);
   }

  _startLog = startLog ||  _startLog;
  _endLog = endLog ||  _endLog;
  _errorLog = errorLog ||  _errorLog;

  _startLog(filename);
  await client.connect();
  var filename = path.resolve(filename);

  var sql = fs.readFileSync(filename).toString();

  _endLog(filename);

  try {
    res = await client.query(sql)

  } catch (err) {
    _errorLog(filename);
    throw err
  }	  

  await client.end()
}

const executeDBFunctionsFromDir = async function (folderPath) {
  
  const startLog = function(filename) {
    // console.log("Compiling Function : " + filename);
   }
   const endLog = function(filename) {
    // console.log("File compilation completed : " + filename);
   }
   const errorLog = function(filename) {
    console.log("Error compiling File: " + filename);
   }

  try {

    const names = await getFileNamesFromDir(folderPath);
    for(let i in names) {
      await loadDBFunction( path.join(folderPath , names[i]), startLog, endLog, errorLog);
    }
  } catch (e) {
    console.log("error compiling database function");
    console.log(e);
  }

}

const loadRuntimeEnvVariables = function (variables) {
   process.env.pgapi = JSON.stringify(variables);
   process.env.PGAPI_SECRET_KEY = variables.PGAPI_SECRET_KEY;
   process.env.DEMO_INSTALL = variables.DEMO_INSTALL;
}

 module.exports = {
    isNumber: isNumber,
    isEmpty: isEmpty,
    getUUID: getUUID,
    getClient: getClient,
    getClientByRecord: getClientByRecord,
    validateConnection: validateConnection,
    getClientByConnectionID: getClientByConnectionID,
    checkId: checkId,
    formatDate: formatDate,
    callSQL: callSQL,
    isValidFunction: isValidFunction,
    getSQLResults: getSQLResults,
    getSQLResultswithStatus: getSQLResultswithStatus,
    getSQLResultsByConnectionId: getSQLResultsByConnectionId,
    checkAttribute: checkAttribute,
    getModelMetadata: getModelMetadata,
    getRequiredColumns: getRequiredColumns,
    isDate: isDate,
    isURL: isURL,
    validateRequiredColumns: validateRequiredColumns,
    handleDefaults: handleDefaults,
    validateConstraints: validateConstraints,
    validateDatatypes: validateDatatypes,
    validateReferenceConstraints: validateReferenceConstraints,
    validateListConstraint: validateListConstraint,
    validateTableConstraints: validateTableConstraints,
    encrypt: encrypt,
    decrypt: decrypt,
    decryptByKey: decryptByKey,
    validateFunction: validateFunction,
    exportConfig: exportConfig,
    encryptByKey: encryptByKey,
    getPool: getPool,
    encryptObject: encryptObject,
    encryptObjectByKey: encryptObjectByKey,
    decryptObjectByKey: decryptObjectByKey,
    getPoolByName: getPoolByName,
    loadRuntimeEnvVariables: loadRuntimeEnvVariables,
    getFileNamesFromDir: getFileNamesFromDir,
    loadDBFunction: loadDBFunction,
    executeDBFunctionsFromDir: executeDBFunctionsFromDir,
    loadDDL: loadDDL,
    loadDBFunctionString: loadDBFunctionString,
    installApplication: installApplication,
    isValidPassword: isValidPassword,
    encryptPassword: encryptPassword
 }