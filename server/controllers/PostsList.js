var PostDB = require("../models/Post");
var jwt = require("../helpers/jwt")
var helper = require("../helpers");
var UserDB = require("../models/User");
var CommentDB = require("../models/Comment");
module.exports = {
    categoryposts: _load_category_posts
};


function _load_category_posts(req, res) {
    PostDB.getNewCategoryPosts(req.params.CatName, function(err, newPosts){
        if (err) console.log("Có lỗi xảy ra");
        else {
            PostDB.getHotNewsCategoryInWeek(req.params.CatName, function(err, hotPosts){
                var userId = "";
                if (req.session.ejsParams.user) 
                userId = req.session.ejsParams.user;
                if (err) console.log("Có lỗi xảy ra");
                else res.render("PostsList", {newPosts: newPosts, hotPosts: hotPosts, categoryName: req.params.CatName, userId: userId});
            })
        }
    })
}