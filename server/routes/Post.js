const controller = require("../controllers/Post");
const controller1 = require("../controllers/User");
const APIPost = require("../API/Post");
var multer = require('multer');
var express = require('express');
var funcRouter = express.Router();
var upload = multer({ dest: 'uploads/' })
module.exports  = () => {
    funcRouter.get('/home',controller1.noNeedLogin, controller.home);
    funcRouter.get('/postdetail/:catName/:id', controller.postdetail);
    return funcRouter;
}