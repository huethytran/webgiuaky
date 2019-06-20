var jwt = require("../helpers/jwt")
var helper = require("../helpers");
var PostDB = require("../models/Post");
var CategoryDB = require("../models/Category");
var ROLE = require("../config").UserRole;

module.exports = {
    newpost: _new_post,
    validateWriter: _validateWriter
};

function _new_post(req, res) {
    CategoryDB.getAllCategoryName(function(err, categories){
        if (err) console.log("Có lỗi xảy ra");
        else res.render("NewPost", {categories: categories});
    })
}

function _validateWriter(req, res, next) {
    if (req.session.user.role != ROLE.WRITER) {
        return res.redirect('/');
    }

    next();
}