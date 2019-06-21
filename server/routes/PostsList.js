const controller = require("../controllers/PostsList");
const APIPost = require("../API/Post");
var multer = require('multer');
var express = require('express');
var funcRouter = express.Router();
var upload = multer({ dest: 'uploads/' })
module.exports  = () => {
    funcRouter.get('/', controller.tagposts, controller.categoryposts);

    return funcRouter;
}