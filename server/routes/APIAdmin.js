const API = require("../API/Admin");
var validateAdmin = require("../controllers/Admin").validateAdmin;
var multer = require('multer');
var express = require('express');
var adminAPI = express.Router();
var upload = multer({ dest: 'uploads/' })

module.exports = () => {
    adminAPI.get('/category', validateAdmin, API.get_category);
    adminAPI.get('/tag', validateAdmin, API.get_tag);
    adminAPI.get('/post', validateAdmin, API.get_post);
    adminAPI.get('/user', validateAdmin, API.get_user);

    adminAPI.post('/tag', validateAdmin, API.post_tag);
    adminAPI.post('/category', validateAdmin, API.post_category);
    adminAPI.post('/post', validateAdmin, API.post_post);
    adminAPI.post('/user', validateAdmin, API.post_user);

    adminAPI.delete('/tag', validateAdmin, API.delete_tag);
    adminAPI.delete('/post', validateAdmin, API.delete_post);
    adminAPI.delete('/user', validateAdmin, API.delete_user);
    return adminAPI;
}