const controller = require("../controllers/Admin");
var express = require('express');
var funcRouter = express.Router();
module.exports  = () => {
    

    funcRouter.get('/manager', controller.managerI);
    funcRouter.post('/manager', controller.validateAdmin, controller.manager);
    
    return funcRouter;
}