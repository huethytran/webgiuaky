const controller = require("../API/Post");
const userAPI = require("../API/User");
var multer = require('multer');
var express = require('express');
var postAPI = express.Router();
var upload = multer({ dest: 'uploads/' })

module.exports = () => {
    postAPI.post('/uploadnewpost',  userAPI.validateToken,  controller.validateWriter, controller.uploadnewpost);
    postAPI.post('/updateviews',   controller.updateviews);
    postAPI.post('/uploadpostimage',userAPI.validateToken,  controller.validateWriter, upload.single('image'), controller.uploadpostimage);
    postAPI.post('/uploadcomment',  userAPI.validateToken,  controller.uploadcomment);
    return postAPI;
}