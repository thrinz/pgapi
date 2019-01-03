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

const { Client } = require('pg')
const utils = require('../Utils');
const path     = require('path')
const fs = require('fs');
const connectionController = require('../controllers/Connection');
const colors = require('colors');

process.env.VERSION  = process.env.VERSION || "1.0.0";

const addAdminUser = async function () {
    const passwordHash = utils.encryptPassword("admin");
    const uuid = utils.getUUID();
    let sql = "SELECT add_admin_user($1, $2, $3) as result";
    let params = [uuid,'',passwordHash];
    let response = await utils.callSQL(sql,params);
    return response;
  }

  const startLog = function(filename) {
    // console.log("Compiling File : " + filename);
   }

   const endLog = function(filename) {
    //console.log("File compilation completed : " + filename);
   }

   const errorLog = function(filename) {
    console.log(`Error compiling File: ${filename}`.blue);
   }

  const loadDB = async function (demo) {

    console.log("pgAPI - Compiling admin table script...".blue)

    await utils.loadDDL (path.resolve(__dirname, './db/DB.sql'),startLog, endLog, errorLog);
    
    console.log("pgAPI - Compiling admin database functions...".blue)
    
    await utils.executeDBFunctionsFromDir(path.resolve(__dirname, './db/functions'));

    let response = await utils.getSQLResults("SELECT * FROM current_version",[]);

    if (response.length === 0) {
      let response = await utils.callSQL("INSERT INTO current_version(created,version) VALUES(NOW(),$1)",[process.env.VERSION]);
      await addAdminUser ();
      console.log("pgAPI - Adding default connection...".blue)
      await connectionController.addDefaultConnection();

      if (process.env.DEMO_INSTALL === "Y") {
        const demoAppName = "tasks";
        let response = await utils.installApplication(demoAppName);
        if (response.status === "S") {
          console.log(`pgAPI - Successfully installed application [${demoAppName}]`.green)
        } else {
          console.log(`pgAPI - Application installation failed.. [${demoAppName}] - ${response.message}`.yellow)
        } 
      }
    }   
 }

 module.exports = {
    loadDB: loadDB

 }