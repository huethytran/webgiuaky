var PostDB = require("../models/Post");
var jwt = require("../helpers/jwt")
var helper = require("../helpers");
var UserDB = require("../models/User");
var CommentDB = require("../models/Comment");
module.exports = {
    postdetail: _load_post_detail
};
   
function _load_post_detail(req, res) {
    PostDB.getFromId(req.params.id, function(err, postdetail){
        if (err) console.log("Có lỗi xảy ra");
        else {
           if (postdetail.premium == 1)
           {
               if (!req.session.user)
                    res.redirect("/user/login");
                else {
                    UserDB.getFromUid(req.session.user.id, function(err, _user){
                        if (err) console.log("Có lỗi xảy ra");
                        else{
                            if (_user.role == 1) res.redirect("/user/accountrenewal");
                        } 
                    })
                }
           }
            CommentDB.getComments(postdetail._id, function(err, comments){
                if (err) console.log("Có lỗi xảy ra");
                else {
                    var usersId = [];
                    for (var i = 0; i < comments.length; i++)
                        usersId.push(comments[i].userId);
                    PostDB.get5SameCategory(postdetail.category, postdetail._id, function(err, posts){
                        
                        if (err) console.log("Có lỗi xảy ra");
                        else{
                            console.log(`[PostDetail] ${posts.length}`);
                            UserDB.getFromUid(postdetail.author, function(err, author){
                                var userId = "";
                                if (req.session.user) 
                                 userId = req.session.user.id;
                            UserDB.getCommentUsersFromUid(usersId, function(err, commentUsers){
                                if (err) return console.log("Có lỗi xảy ra");
                                res.render("PostContent", {postdetail: postdetail, comments: comments, posts: posts, userId: userId, commentUsers: commentUsers, author: author.username});
                            })
                    })
                } 
            })
        } 
    })
}
})
}

