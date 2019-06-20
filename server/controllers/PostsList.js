var PostDB = require("../models/Post");
var jwt = require("../helpers/jwt")
var helper = require("../helpers");
var UserDB = require("../models/User");
var CommentDB = require("../models/Comment");
var CatDB = require("../models/Category");
module.exports = {
    categoryposts: _load_category_posts
};

function _load_category_posts(req, res, next) {
    var categoryUrl = req.originalUrl;
    var userId = "";
    if (req.session.user)
        userId = req.session.user.id;
    // console.log(`[PostList] URL: %O`, categoryUrl)
    CatDB.get({url: categoryUrl}, (err, record) => {
        if (err) return res.render("Message", {msg: err});
        if (!record) return res.render("Message", {msg: "NotFound"});
        var catName = record.name;
        PostDB.getNewCategoryPosts(catName, function(err, newPosts){
            if (err)  return res.render("Message", {msg: err});
            if (!newPosts) return res.render("Message", {msg: "NoDataNewPost"});
            PostDB.getHotNewsCategoryInWeek(catName, function (err, hotPosts) {

                if (err) return res.render("Message", { msg: err });
                if (!hotPosts) return res.render("Message", {msg: "NoDataHotPost"});
                res.render("PostsList", { newPosts: newPosts, hotPosts: hotPosts, categoryName: catName, userId: userId });
            })
        })
    })
    // PostDB.getNewCategoryPosts(req.params.CatName, function(err, newPosts){
    //     if (err) console.log("Có lỗi xảy ra");
    //     else {
    //         PostDB.getHotNewsCategoryInWeek(req.params.CatName, function(err, hotPosts){
    //             var userId = "";
    //              if (req.session.user) 
    //              userId = req.session.user.id;
    //             if (err) console.log("Có lỗi xảy ra");
    //             else res.render("PostsList", {newPosts: newPosts, hotPosts: hotPosts, categoryName: req.params.CatName, userId: userId});
    //         })
    //     }
    // })
}