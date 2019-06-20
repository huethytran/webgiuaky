
const controller = require("../controllers/NewPost");
const needLogin = require("../controllers/User").needLogin;
var multer = require('multer');
var express = require('express');
var funcRouter = express.Router();
module.exports = () => {
    
    funcRouter.get('/newpost', needLogin, controller.validateWriter, controller.newpost);
    
    return funcRouter;
}