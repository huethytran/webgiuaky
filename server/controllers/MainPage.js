var PostDB = require("../models/Post");
var jwt = require("../helpers/jwt")
var helper = require("../helpers");
module.exports = {
    home: _load_home
};

function _load_home(req, res) {
    var userId = "";
    if (req.session.user) 
        userId = req.session.user.id;
    PostDB.getNewPosts(function(err, newPosts){
        if (err) console.log("Có lỗi xảy ra");
        else {
            PostDB.getMostViewPosts(function(err, mostViewPosts){
                if (err) console.log("Có lỗi xảy ra");
                else {
                    PostDB.getTop10Categories(function(err, top10Cate){
                        if (err) console.log("Có lỗi xảy ra");
                        else {
                            PostDB.getHotNewsInWeek(function(err, hotNewsInWeek){
                                if (err) console.log("Có lỗi xảy ra");
                                else res.render("Home", {newPosts: newPosts, mostViewPosts: mostViewPosts, top10Cate: top10Cate, hotNewsInWeek: hotNewsInWeek, userId: userId});
                            })
                        }
                    })
                }
            })
        }
    })
}