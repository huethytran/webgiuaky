const controller = require("../controllers/Admin");
const usercontroller = require("../controllers/User");
var express = require('express');
var funcRouter = express.Router();
module.exports  = () => {
    

    funcRouter.get('/manager', usercontroller.needLogin, controller.validateAdmin, controller.manager);
    
    return funcRouter;
}