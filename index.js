
/*  This file is part of pgAPI.
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

const path     = require('path');
const utils    = require('./admin/Utils');
const colors   = require('colors');
const install  = require('./admin/install');
const routeHandler = require('./admin/controllers/Route');

const routes = () => {
}

const adminRouter = () => {
    const adminRouter = require('./admin/router');
    return adminRouter;
}

const apiRouter = (router) => {
    global.pool = {};
    global.router = router;

    const s = routeHandler.getRoutes();  
}

const initialize = async (input) => {
    try {
        if (!!input && !!input.DB_HOST
            && !!input.DB_USER
            && !!input.DB_PASSWORD
            && !!input.DB_NAME
            && !!input.DB_PORT
            && !!input.PGAPI_SECRET_KEY
            ) {
            utils.loadRuntimeEnvVariables({
                DB_HOST : input.DB_HOST,
                DB_USER: input.DB_USER,
                DB_PASSWORD: input.DB_PASSWORD,
                DB_NAME: input.DB_NAME,
                DB_PORT: input.DB_PORT,
                PGAPI_SECRET_KEY: input.PGAPI_SECRET_KEY,
                DEMO_INSTALL: input.DEMO_INSTALL,
            });
            
            let response = await utils.validateConnection({
                host : input.DB_HOST,
                port : input.DB_PORT,
                database : input.DB_NAME,
                username : input.DB_USER,
                password : input.DB_PASSWORD
            });

            if (response.status === "E") {
                throw("pgAPI - failed to initialize - invalid database connection information");
            }
            
            await install.loadDB(true);

        } else {
            throw("pgAPI - failed to initialize - invalid input parameters");
        }
    } catch(e) {
        throw(e)
    }

}

const clientSourcePath = () => {
  return path.join(path.resolve(__dirname, './dist'));
}

module.exports = {
 routes,
 adminRouter,
 initialize,
 clientSourcePath,
 apiRouter
}
