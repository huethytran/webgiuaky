var jwt = require('../helpers/jwt');
var config = require("../config")
var helper = require("../helpers");
var PostDB = require("../models/Post");
var {PriorityQueue} = require("../helpers/PriorityQueue");
var fs = require('fs');
const path = require('path');

module.exports = {
    uploadnewpost: _post_newpost,
    updateviews: _post_updateviews
}

function _post_newpost(req, res){
    var post = {
        title: req.body.post.title,
        image_title: "...",
        category: req.body.post.category,
        content: req.body.post.content,
        post_date: new Date(),
        author: "null",
        image_url: req.body.post.image_url,
        summary: req.body.post.summary,
        view: 0,
        status: 2
    }
   PostDB.create(post, function (err, id){
        if (err) {
            console.log("[PostController] Failed to add post to database: " + err);
            status = 500;
            result.status = status;
            result.error = "Có lỗi trong quá trình tạo cơ sở dữ liệu, vui lòng thử lại!"
            res.status(status).send(result);
        } else {
            console.log("[PostController] Success create post with ID: " + id);
            status = 200;
            result.status = status;
            result.id = id;
            res.status(status).send(result);
        }
    })
}
function _post_updateviews(req, res){
    PostDB.update(req.body.post._id, req.body.post, function(err, view){
        if (err) {
            console.log("Tăng view thất bại");

        }
        else {
            console.log("Tăng view thành công");
        }
    })
}