var express = require('express');
var router = express.Router();
var CatDB = require("../models/Category");
var ROLE = require("../config").UserRole;
var jwt = require('../helpers/jwt');

module.exports = {
    validateAdmin : _validateAdmin,
    manager : _get_manager,
}




function _get_manager(req, res) {
    if (req.query.token) return res.render("AdminInterface");

    BuildCategory((err, params) => {
        if (err) return res.render("404", {});
        return res.render("Admin", params);
    });
    console.log("Go");
}

function BuildCategory(cb) {
    var ejsParams = {};
    const countPerPage = 5;
    ejsParams.categoriesTotal = 0;
    ejsParams.categories = [];
    ejsParams.paginationCat = null;

    CatDB.get({}, function(err, records) {
        if (err) return cb(err);
        console.log("Length: " + records.length)
        if (records.length ==0) return cb(null, ejsParams);

        ejsParams.categoriesTotal = records.length;
        records.forEach((element, index) => {
            if (ejsParams.categories.length>= countPerPage) return;
            var cat = { index: index, name: element.name, group: element.group, publish: 0, approve: 0, notapprove: 0, reject: 0 };
            ejsParams.categories.push(cat);
            console.log(element);
        })

        
        
        if (records.length > countPerPage) {
            var numPage = 1;
            ejsParams.paginationCat = [];
            numPage = records.length / countPerPage + 1;
            numPage = numPage>5?5:numPage;
            for (var i = 1; i<= numPage; i++) {
                var page = {index: i, active:''};
                ejsParams.paginationCat.push(page);
            }
            ejsParams.paginationCat[0].active = 'active';
        }
       
        cb(null, ejsParams);
    })
}

function _validateAdmin(req, res, next) {
    var token = req.body.token || req.query.token;
    var audience = req.body.audience || req.query.audience;
    if (!token) {
        console.log('[UserAPI] Missing token');
        return res.redirect('/');
    }

    var option = {issuer: 'web2019', subject: 'dummy@dummy.com',audience: audience };
    var userinfo = jwt.verify(token, option);
    if (!userinfo) {
        console.log('[UserAPI] Invalid token');
        return res.status(401).send("Invalid token");
    }
    if (userinfo.role != ROLE.ADMIN) {
        console.log(`[UserAPI] User ${userinfo.user} Permission Denied`);
        return res.status(401).send("Permission Denied");
    }

    req.user = userinfo.user;
    next();
}