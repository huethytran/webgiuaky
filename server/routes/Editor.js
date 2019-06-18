const controller = require("../controllers/Editor");
const usercontroller = require("../controllers/User")
var express = require('express');
var funcRouter = express.Router();
module.exports  = () => {
    

    funcRouter.get('/manager', usercontroller.needLogin, controller.validateEditor, controller.manager);
    
    return funcRouter;
}