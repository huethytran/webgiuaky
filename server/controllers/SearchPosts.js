var PostDB = require("../models/Post");
var jwt = require("../helpers/jwt")
var helper = require("../helpers");
module.exports = {
    searchposts: _load_search_posts
};

function _load_search_posts(req, res){
    PostDB.fullTextSearch(req.params.SearchText, function(err, posts){
        if (err) console.log("Có lỗi xảy ra");
       else {
            PostDB.getHotNewsInWeek(function(err, hotnews){
                if (err) console.log("Có lỗi xảy ra");
                else {
                    var userId = "";
                    if (req.session.user) 
                    userId = req.session.user.id;
                    res.render("SearchPosts", {posts: posts, userId: userId, hotnews: hotnews, searchtext: req.params.SearchText});
                }
            })
               
        }
    })
}