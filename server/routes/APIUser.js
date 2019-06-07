const controller = require("../API/User");
var multer = require('multer');
var express = require('express');
var userAPI = express.Router();
var upload = multer({ dest: 'uploads/' })

module.exports = () => {
    userAPI.get('/information', controller.validate, controller.getinfo);

    userAPI.post('/register', controller.register);
    userAPI.post('/login', controller.login);
    userAPI.post('/resetpassword',controller.validate, controller.resetpassword);
    userAPI.post('/information', controller.validate, controller.updateinfo);
    userAPI.post('/forgotpassword', controller.forgotpassword);
    userAPI.post('/avatar', controller.validate, upload.single('image'), controller.avatar);
    return userAPI;
}