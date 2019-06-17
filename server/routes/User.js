const controller = require("../controllers/User");
const APIUser = require("../API/User");
var multer = require('multer');
var express = require('express');
var funcRouter = express.Router();
var upload = multer({ dest: 'uploads/' })
module.exports  = () => {
    
    
    funcRouter.get('/register', controller.noNeedLogin, controller.register);
    funcRouter.get('/login', controller.noNeedLogin, controller.login);
    funcRouter.get('/logout',controller.logout, controller.needLogin);
    funcRouter.get('/forgotpassword', controller.noNeedLogin, controller.forgotpassword);
    funcRouter.get('/information', controller.information);
    funcRouter.get('/resetpassword', controller.noNeedLogin, controller.resetpassword);
    
    return funcRouter;
}