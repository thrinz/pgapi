var express = require('express'),
    router = express.Router();


var connection = require('../controllers/Connection');
var _function = require('../controllers/Function');
var routes = require('../controllers/Route');
var dashboard = require('../controllers/Dashboard');
let user = require('../controllers/User');
const dbUtils = require('../controllers/dbUtils');
const utils = require('../Utils');

router.use(async function(req, res, next) {
    
     // Website you wish to allow to connect
     res.setHeader('Access-Control-Allow-Origin', '*');
     // Request methods you wish to allow
     res.setHeader('Access-Control-Allow-Methods', 'GET, HEAD, POST, OPTIONS, PUT, PATCH, DELETE');
 
     // Request headers you wish to allow
     res.setHeader('Access-Control-Allow-Headers', 'Access-Control-Allow-Headers, Origin,Accept, X-Requested-With, Content-Type, Access-Control-Request-Method, Access-Control-Request-Headers, Authorization');

     res.setHeader("Access-Control-Allow-Credentials", "true");
 
    let authRequired = true;
    
    if (req.originalUrl === '/admin/api/login') {
      authRequired = false;
    }
    
    if (authRequired) {
      if (!req.headers.authorization) {
        return res.status(403).json({ error: 'No credentials sent!' });
      }

      if (!!req.headers.authorization) {
        let token =  req.headers.authorization;
        token = token.replace("Bearer",'').trim();
        let response = await user.validateSession(token);

        if (!!response.decoded && !!response.decoded.claims) {
          req.claims = response.decoded.claims;
        } 
        
        if (response.status === "E") {
          return res.status(403).json({ error: response.code });
        }
        
      }
    }
    
    next();
  });

router.get('/connections', connection.fetch );
router.put('/connection/:id', connection.update);
router.post('/connection', connection.createAPI);
router.delete('/connection/:id', connection.delete);
router.get('/connection/test', connection.testDBConnection);
router.get('/connections/status', connection.testDBConnections);

router.get('/functions', _function.fetch );
router.put('/function/:id', _function.update);
router.post('/function', _function.createAPI);
router.delete('/function/:id', _function.delete);
router.get('/functions/status', _function.testDBFunctions );

router.get('/routes', routes.fetch );
router.put('/route/:id', routes.update);
router.post('/route', routes.createAPI);
router.post('/routes/reload', routes.refreshRoutes);
router.delete('/route/:id', routes.delete);  

router.get('/export', dashboard.exportConfig );
router.post('/import', dashboard.importConfig );
router.post('/delete', dashboard.deleteConfig );

router.post('/login', user.loginAPI );
router.post('/generatetoken', user.sessionAPI );
router.get('/user', user.fetchAPI );
router.put('/user', user.updateUserAPI );
router.post('/password/reset', user.resetPasswordAPI );

router.get('/db/function/code', dbUtils.getDBFunction);
router.post('/db/function/execute', dbUtils.executeFunction);
router.post('/db/sql/save', dbUtils.saveSQL);
router.get('/db/sql/get', dbUtils.getSQL);

module.exports = router; 