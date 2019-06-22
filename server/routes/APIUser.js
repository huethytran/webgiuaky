const controller = require("../API/User");
var multer = require('multer');
var express = require('express');
var userAPI = express.Router();
var upload = multer({ dest: 'uploads/' })

module.exports = () => {
    userAPI.post('/forgotpassword', controller.forgotpassword);
    userAPI.post('/register',       controller.register);
    userAPI.post('/login',          controller.login);
    userAPI.post('/sendrequest',    controller.validateToken, controller.sendrequest);
    userAPI.get('/information',     controller.validateToken, controller.getinfo);
    userAPI.post('/resetpassword',  controller.resetpassword);
    userAPI.post('/information',    controller.validateToken, controller.updateinfo);
    userAPI.post('/avatar',         controller.validateToken, upload.single('image'), controller.avatar);
    return userAPI;
}