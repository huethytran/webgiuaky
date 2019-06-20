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
                
                if (err) console.log("Có lỗi xảy ra");
                else{
                    var userId = "";
                     if (req.session.user) 
                    userId = req.session.user.id;
                    var perPage = 3;
                    var page = req.params.page || 1;
                    PostDB.getPagePosts(perPage, page, req.params.CatName,function(err, posts, p, ps) {
                            if (err) console.log("Có lỗi xảy ra");
                            res.render("PostsList", {newPosts: newPosts, hotPosts: hotPosts, categoryName: req.params.CatName, userId: userId, posts: posts,current: p, pages: ps});
                        })
                } 
            })
        }
    })
}