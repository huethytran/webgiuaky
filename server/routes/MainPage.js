const controller = require("../controllers/MainPage");
const APIPost = require("../API/Post");
var multer = require('multer');
var express = require('express');
var funcRouter = express.Router();
var upload = multer({ dest: 'uploads/' })
module.exports  = () => {
    funcRouter.get('/home', controller.home);
    return funcRouter;
}