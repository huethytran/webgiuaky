const controller = require("../API/Post");
var multer = require('multer');
var express = require('express');
var postAPI = express.Router();
var upload = multer({ dest: 'uploads/' })

module.exports = () => {
    postAPI.post('/uploadnewpost', controller.uploadnewpost);
    postAPI.post('/updateviews', controller.updateviews);
    return postAPI;
}