var PostDB = require("../models/Post");
var jwt = require("../helpers/jwt")
var helper = require("../helpers");
module.exports = {
    home: _load_home,
    postdetail: _load_post_detail
};

function _load_home(req, res) {
   // var newPosts ={};
    //var mostViewPosts = {};
   // var hotNewsInWeek = {};
    //var top10Cate = {};
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
                                else res.render("Home", {newPosts: newPosts, mostViewPosts: mostViewPosts, top10Cate: top10Cate, hotNewsInWeek: hotNewsInWeek});
                            })
                        }
                    })
                }
            })
        }
    })
}

function _load_post_detail(req, res) {
    PostDB.getFromId(req.params.id, function(err, postdetail){
        if (err) console.log("Có lỗi xảy ra");
        else res.render("PostContent", {postdetail: postdetail});
    })
}

