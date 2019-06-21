var jwt = require('../helpers/jwt');
var config = require("../config")
var helper = require("../helpers");
var PostDB = require("../models/Post");
var UserDB = require("../models/User");
var TagDB = require("../models/Tag");
var CategoryDB = require("../models/Category");
var CommentDB = require("../models/Comment");
var ROLE = require('../config').UserRole;
var fs = require('fs');
const path = require('path');

module.exports = {
    uploadnewpost: _post_newpost,
    updateviews: _post_updateviews,
    uploadpostimage: _post_postimage,
    uploadcomment: _post_uploadcomment,
    validateWriter: _validateWriter
}
function _post_newpost(req, res) {
    var isUpdate = req.query.update;
    var idpost = req.query.id;
    var update = false;
    if (isUpdate && idpost) {
        console.log('[PostAPI] Update post: ' + idpost);
        update = true;
    }
    if (!req.body.post.image_url) return res.status(406).send("Thiếu ảnh đại diện cho bài viết");

    var post = {
        title: req.body.post.title,
        image_title: "/images/defaultpost.jpg",
        category: req.body.post.category,
        content: req.body.post.content,
        post_date: new Date(),
        author: req.user.id,
        tag: req.body.post.tag,
        image_url: req.body.post.image_url,
        summary: req.body.post.summary,
        view: 0,
        premium: req.body.post.premium,
        status: 2
    };
    if (req.body.post.status) post.status = req.body.post.status;

    if (!update) {
        for (var i = 0; i < post.tag.length; i++)
            createTag(post.tag[i]);
        CategoryDB.updateNumberOfPosts(post.category, function (err, record) {
                if (err) {
                    console.log("Cập nhật số lượng bài viết thất bại");
                    res.status(500).send('ServerError');
                    return;
                }
        });
        PostDB.create(post, function (err, record) {
            var result = {};
            if (err) {
                console.log("[PostController] Failed to add post to database: " + err);
                status = 500;
                result.status = status;
                result.error = "Có lỗi trong quá trình tạo cơ sở dữ liệu, vui lòng thử lại!"
                res.status(status).send(result);
            } else {
                console.log("[PostController] Success create post with ID: " + record._id);
                status = 200;
    
                result.status = status;
                result.data = record;
                res.status(status).send(result);
            }
        });
    } else {
        PostDB.update(idpost, post, function (err, record) {
            var result = {};
            if (err) {
                console.log("[PostController] Failed to update post to database: " + err);
                status = 500;
                result.status = status;
                result.error = "Có lỗi trong quá trình cập nhật bài viêt!"
                res.status(status).send(result);
            } else {
                console.log("[PostController] Success update post with ID: " + record._id);
                status = 200;
                result.status = status;
                result.data = record;
                res.status(status).send(result);
            }
        });
    }
}

function createTag(temp) {
    TagDB.findTag(temp, function (err, record) {
        if (!record) {
            TagDB.create(temp, function (err, record) {
                if (err) console.log("Tạo tag thất bại");
            })
        }
        else {
            TagDB.updateTag(temp, function (err, record) {
                if (err) console.log("Update tag thất bại");
            })
        }
    })
}
function _post_uploadcomment(req, res) {
    var userId;
    if (req.session.user)
        userId = req.session.user.id;
    if (req.user)
        userId = req.user.id;
    console.log("hello", userId);
    UserDB.getFromUid(userId, function (err, userInfo) {
        if (err) console.log("Lấy user thất bại");
        else {
            var _comment = {};
            _comment.userId = userInfo._id;
            _comment.postId = req.body.postComment.postId;
            _comment.commentTime = req.body.postComment.commentTime;
            _comment.content = req.body.postComment.content;
            CommentDB.create(_comment, function (err, id) {
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
function _post_updateviews(req, res) {
    PostDB.update(req.body.post._id, req.body.post, function (err, view) {
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

function _validateWriter(req, res, next) {
    if (req.user.role != ROLE.WRITER) {
        console.log(`[UserAPI] User ${req.user.id} Permission Denied`);
        return res.status(401).send("Permission Denied");
    }
    next();
}