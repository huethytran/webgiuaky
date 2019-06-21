var PostDB = require("../models/Post");
var jwt = require("../helpers/jwt")
var helper = require("../helpers");
module.exports = {
    home: _load_home
};

function _load_home(req, res) {
    var userId = "";
    var fbtoken="";
    if (req.session.user) 
        userId = req.session.user.id;
    if (req.user)
     fbtoken =  req.session.user.token;
 
    PostDB.home().then(result => {
        res.render("Home", {newPosts: result.newPosts, 
                            mostViewPosts: result.mostViewPosts,
                            top10Cate: result.top10CatePosts,
                            hotNewsInWeek: result.hotNewsInWeek,
                            userId: userId, fbtoken: fbtoken});
    }).catch(err => {
        console.log(err);
        res.render("Message", {msg: err});
    })
}