var jwt = require('../helpers/jwt');
var config = require("../config")
var helper = require("../helpers");
var PostDB = require("../models/Post");
var UserDB = require("../models/User");
var CommentDB = require("../models/Comment");
var {PriorityQueue} = require("../helpers/PriorityQueue");
var fs = require('fs');
const path = require('path');

module.exports = {
    uploadnewpost: _post_newpost,
    updateviews: _post_updateviews,
    uploadpostimage: _post_postimage,
    uploadcomment: _post_uploadcomment
}

function _post_newpost(req, res){
    var post = {
        title: req.body.post.title,
        image_title: "...",
        category: req.body.post.category,
        content: req.body.post.content,
        post_date: new Date(),
        author: req.session.ejsParams.user,
        tag: req.body.post.tag,
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
function _post_uploadcomment(req, res){
    UserDB.getFromUid(req.user, function(err, userInfo){
        if (err) console.log("Lấy user thất bại");
        else {
            var _comment = {};
            _comment.userId = userInfo._id;
            _comment.postId = req.body.postComment.postId;
            _comment.commentTime = req.body.postComment.commentTime;
            _comment.content = req.body.postComment.content;
            CommentDB.create(_comment, function (err, id){
                if (err) {
                    console.log("[PostController] Failed to add comment to database: " + err);
                    status = 500;
                    result.status = status;
                    result.error = "Có lỗi trong quá trình tạo cơ sở dữ liệu, vui lòng thử lại!";
                    res.status(status).send(result);
                } else {
                    console.log("[PostController] Success create comment with ID: " + id);
                    status = 200;
                    result.status = status;
                    result.id = id;
                    res.status(status).send(result);
                }
            })
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

function _post_postimage(req, res) {
    if (req.file) {
        var filename = req.file.filename;
        console.log('Uploading file...' + filename);
        SaveFiles(req.file, function (filePath) {
            if (filePath) {
                filePath = filePath.replace("public", '');
                console.log(filePath);
                res.status(200).send(filePath);
            } else {
                res.status(403)
                    .send('Có lỗi trong quá trình lưu ảnh bìa bài viết vào hệ thống');
            }
        });
    }
}

function SaveFiles(file, cb) {
    var localPath;
    while (true) {
        localPath = path.join("./public/images", helper.common.RandomString(10));
        console.log("Path: " + localPath);
        if (!fs.existsSync(localPath)) {
            break;
        }
    }
    fs.rename(file.path, localPath, err => {
        if (err) {
            cb(null);
        } else {
            cb(localPath);
            
        }
    });
    
}