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

const program = require('commander');
const { prompt } = require('inquirer');
const dotenv   = require('dotenv');
const path     = require('path');
const utils = require('./Utils');
const findUp = require('find-up');

// Load env variables from .env file
dotenv.config({
  path: findUp.sync('config.env')
})


// Load Runtime variables
utils.loadRuntimeEnvVariables({
  DB_HOST : process.env.PG_HOST || process.env.DB_HOST,
  DB_USER: process.env.PG_USER || process.env.DB_USER,
  DB_PASSWORD: process.env.PG_PASSWORD || process.env.DB_PASSWORD,
  DB_NAME: process.env.PG_DATABASE || process.env.DB_NAME,
  DB_PORT: process.env.PG_PORT || process.env.DB_PORT,
  PGAPI_SECRET_KEY: process.env.TOKEN_SECRET_KEY || process.env.PGAPI_SECRET_KEY,
  DEMO_INSTALL: process.env.DEMO_INSTALL || 'Y'
});

const userController = require('../admin/controllers/User');

const resetpasswd = [
    {
      type : 'input',
      name : 'username',
      message : 'Enter Username ...'
    },
    {
      type : 'input',
      name : 'password',
      message : 'Enter password ...'
    },
    {
      type : 'input',
      name : 'confirmPassword',
      message : 'Enter password again ...'
    }
];

const addUserQ = [
  {
    type : 'input',
    name : 'username',
    message : 'Enter Username ...'
  },
  {
    type : 'input',
    name : 'firstname',
    message : 'Enter Firstname ...'
  },
  {
    type : 'input',
    name : 'lastname',
    message : 'Enter Lastname ...'
  },
  {
    type : 'input',
    name : 'password',
    message : 'Enter Password ...'
  },
  {
    type : 'input',
    name : 'confirmPassword',
    message : 'Enter Password again ...'
  }
];

const deleteUserQ = [
  {
    type : 'input',
    name : 'username',
    message : 'Enter Username ...'
  }
];

const enableDisableQ = [
  {
    type : 'input',
    name : 'username',
    message : 'Enter Username ...'
  },
  {
    type : 'input',
    name : 'enabled_flag',
    message : 'Enable or Disable (Y or N) ...'
  }
];

const validateSessionQ = [
  {
    type : 'input',
    name : 'token',
    message : 'Enter Token ...'
  }
];

// const generateTokenQ = [
//   {
//     type : 'input',
//     name : 'refresh_token',
//     message : 'Enter Refresh Token ...'
//   }
// ];


const updateUserQ = [
  {
    type : 'input',
    name : 'username',
    message : 'Enter Username ...'
  },
  {
    type : 'input',
    name : 'firstname',
    message : 'Enter Firstname ...'
  },
  {
    type : 'input',
    name : 'lastname',
    message : 'Enter Lastname ...'
  }
];

const loginQ = [
  {
    type : 'input',
    name : 'username',
    message : 'Enter Username ...'
  },
  {
    type : 'input',
    name : 'password',
    message : 'Enter Password ...'
  }
];

program
  .version('1.0.0')
  .description('API as a Service');

  program
  .command('resetPassword')
  .alias('passwd')
  .description('Reset User Password')
  .action(() => {
    prompt(resetpasswd).then(answers =>
        userController.resetPasswordCommand(answers.username,answers.password,answers.confirmPassword));
  });

  program
  .command('addUser')
  .alias('adduser')
  .description('Add New User')
  .action(() => {
    prompt(addUserQ).then(answers =>
        userController.addUserCommand({username: answers.username,first_name: answers.firstname, last_name: answers.lastname, password: answers.password, confirmPassword: answers.confirmPassword}));
  });

  program
  .command('updateUser')
  .alias('updateuser')
  .description('Update User')
  .action(() => {
    prompt(updateUserQ).then(answers =>
        userController.updateUserCommand({username: answers.username,first_name: answers.firstname, last_name: answers.lastname}));
  });

  program
  .command('deleteUser')
  .alias('deleteuser')
  .description('Delete User')
  .action(() => {
    prompt(deleteUserQ).then(answers =>
        userController.deleteUserCommand({username: answers.username}));
  });

  program
  .command('loginUser')
  .alias('login')
  .description('Login User')
  .action(() => {
    prompt(loginQ).then(answers =>
        userController.loginCommand(answers.username, answers.password));
  });  

  program
  .command('sessionValidate')
  .alias('session')
  .description('Validate Session')
  .action(() => {
    prompt(validateSessionQ).then(answers =>
        userController.validateSessionCommand(answers.token));
  }); 

  program
  .command('enableDisableUser')
  .alias('userstatus')
  .description('Enable or Disable User')
  .action(() => {
    prompt(enableDisableQ).then(answers =>
        userController.enableDisableUserCommand({username: answers.username, enabled_flag: answers.enabled_flag}));
  }); 

  // program
  // .command('generateToken')
  // .alias('generatetoken')
  // .description('Generate Token')
  // .action(() => {
  //   prompt(generateTokenQ).then(answers =>
  //       userController.generateTokenCommand({refresh_token: answers.refresh_token }));
  // }); 

  

  program.parse(process.argv);