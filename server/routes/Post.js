const controller = require("../controllers/Post");
const controller1 = require("../controllers/User");
const APIPost = require("../API/Post");
var multer = require('multer');
var express = require('express');
var funcRouter = express.Router();
var upload = multer({ dest: 'uploads/' })
module.exports  = () => {
    funcRouter.get('/:catName/:id', controller.postdetail);
    return funcRouter;
}