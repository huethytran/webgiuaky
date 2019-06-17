const controller = require("../API/Post");
const controller1 = require("../API/User");
var multer = require('multer');
var express = require('express');
var postAPI = express.Router();
var upload = multer({ dest: 'uploads/' })

module.exports = () => {
    postAPI.post('/uploadnewpost', controller.uploadnewpost);
    postAPI.post('/updateviews', controller.updateviews);
    postAPI.post('/uploadpostimage', upload.single('image'), controller.uploadpostimage);
    postAPI.post('/uploadcomment', controller1.validate, controller.uploadcomment);
    return postAPI;
}