const API = require("../API/Editor");
var validateToken = require("../API/User").validateToken;
var multer = require('multer');
var express = require('express');
var router = express.Router();
var upload = multer({ dest: 'uploads/' })

module.exports = () => {
    router.post('/action', validateToken, API.validateEditor, API.action);
    return router;
}