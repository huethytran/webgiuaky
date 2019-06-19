const controller = require("../controllers/SearchPosts");
const APIPost = require("../API/Post");
var multer = require('multer');
var express = require('express');
var funcRouter = express.Router();
var upload = multer({ dest: 'uploads/' })
module.exports  = () => {
    funcRouter.get('/:SearchText', controller.searchposts);
    return funcRouter;
}