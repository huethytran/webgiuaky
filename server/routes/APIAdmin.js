const API = require("../API/Admin");
var validateToken = require("../API/User").validateToken;
var multer = require('multer');
var express = require('express');
var adminAPI = express.Router();
var upload = multer({ dest: 'uploads/' })

module.exports = () => {
    adminAPI.get('/category',   validateToken, API.validateAdmin, API.get_category);
    adminAPI.get('/tag',        validateToken, API.validateAdmin, API.get_tag);
    adminAPI.get('/post',       validateToken, API.validateAdmin, API.get_post);
    adminAPI.get('/user',       validateToken, API.validateAdmin, API.get_user);

    adminAPI.post('/tag',       validateToken, API.validateAdmin, API.post_tag);
    adminAPI.post('/category',  validateToken, API.validateAdmin, API.post_category);
    adminAPI.post('/post',      validateToken, API.validateAdmin, API.post_post);
    adminAPI.post('/user',      validateToken, API.validateAdmin, API.post_user);

    adminAPI.delete('/tag',     validateToken, API.validateAdmin, API.delete_tag);
    adminAPI.delete('/post',    validateToken, API.validateAdmin, API.delete_post);
    adminAPI.delete('/user',    validateToken, API.validateAdmin, API.delete_user);
    return adminAPI;
}