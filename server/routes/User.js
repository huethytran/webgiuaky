const controller = require("../controllers/User");
const APIUser = require("../API/User");
var multer = require('multer');
var express = require('express');
var funcRouter = express.Router();
var upload = multer({ dest: 'uploads/' })
module.exports  = () => {
    
    funcRouter.get('/logout',           controller.needLogin,   controller.logout);
    funcRouter.get('/information',      controller.needLogin,   controller.information);
    funcRouter.get('/register',         controller.noNeedLogin, controller.register);
    funcRouter.get('/login',            controller.noNeedLogin, controller.login);
    funcRouter.get('/forgotpassword',   controller.noNeedLogin, controller.forgotpassword);
    funcRouter.get('/resetpassword',    controller.noNeedLogin, controller.resetpassword);
    
    return funcRouter;
}