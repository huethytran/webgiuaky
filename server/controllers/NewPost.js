var jwt = require("../helpers/jwt")
var helper = require("../helpers");
var PostDB = require("../models/Post");
var CategoryDB = require("../models/Category");
module.exports = {
    newpost: _new_post
};

function _new_post(req, res) {
    CategoryDB.getAllCategoryName(function(err, categories){
        if (err) console.log("Có lỗi xảy ra");
        else res.render("NewPost", {categories: categories});
    })
}