
var express = require('express');
var multer = require('multer');
var UserDB = require("../models/User");
var CatDB = require("../models/Category");
var PostDB = require("../models/Post");
var helper = require("../helpers");
var upload = multer({ dest: 'uploads/' })
var {PriorityQueue} = require("../helpers/PriorityQueue");
var router = express.Router();
var fs = require('fs');
const path = require('path');
/**
 * router for common user
 */
router.get('/', function (req, res) {
    if (!req.session.ejsParams) req.session.ejsParams = {user:null, msg: null};
    res.render("404", req.session.ejsParams);
})

router.get("/register", function(req, res){
    if (!req.session.ejsParams) req.session.ejsParams = {user:null, msg: null};
    if (req.session.user) {
        res.redirect("/");
        return;
    }
    // console.log(req.originalUrl);
    res.render("UserRegister", req.session.ejsParams)
    req.session.ejsParams.msg = null;
    
 });

router.get("/login", function (req, res) {
    if (!req.session.ejsParams) req.session.ejsParams = {user:null, msg: null};
    if (req.session.user) {
        res.redirect("/");
        return;
    }
    res.render("UserLogin", req.session.ejsParams);
    req.session.ejsParams.msg = null;
    
});

router.get("/logout", function (req, res) {
    if (!req.session.ejsParams) req.session.ejsParams = {user:null, msg: null};
    if (!req.session.user) {
        res.redirect("/");
        return;
    }
    console.log("User: " + req.session.user._id + " stop session");
    req.session.ejsParams.msg = null;
    req.session.ejsParams.user = null;
    req.session.user = null;
    res.redirect("/user/login");
    
})

router.get("/forgotpassword", function (req, res) {
    if (!req.session.ejsParams) req.session.ejsParams = {user:null, msg: null};
    if (req.session.user) {
        res.redirect("/");
        return; 
    }
    req.session.ejsParams.step = 1;
    res.render("ForgotPassword", req.session.ejsParams);
    req.session.ejsParams.msg = null;
})

router.get("/information", function (req, res) {
    if (!req.session.ejsParams) req.session.ejsParams = {user:null, msg: null};
    if (!req.session.user) {
        console.log("Not login yet, redirect to login page");
        res.redirect("/user/login");
        return;
    }

    BuildUserInfomation(req.session.user, function (err, userInfo) {
        if (err) {
            console.log("[User Route] Failed to build user information: " + err);
            res.redirect("/");
        } else {
            req.session.ejsParams.user = userInfo;
            req.session.ejsParams.msg = null;
            if (!req.session.ejsParams.activeTab) req.session.ejsParams.activeTab = "profile";
            res.render("UserInformation", req.session.ejsParams);
        }
    })
})

router.get("/inputpassword", function (req, res) {
    if (!req.session.ejsParams) req.session.ejsParams = {user:null, msg: null};
    if (!req.session.resetInfo) {
        res.redirect('/');
    }
    if (req.session.resetInfo.key != req.query.id) {
        req.session.resetInfo = null;
        req.session.ejsParams.msg = { type: "alert-warning", msg: "Mã không hợp lệ!" };
        res.render("Message", req.session.ejsParams);
    } else if (helper.common.ComputeDeltaTime(req.session.resetInfo.start).getMinutes() > 5) {
        req.session.resetInfo = null;
        req.session.ejsParams.msg = { type: "alert-warning", msg: "Đã hết thời gian đổi mật khẩu." };
        res.render("Message", req.session.ejsParams);
    } else {
        req.session.ejsParams.step = 2;
        res.render("ForgotPassword", req.session.ejsParams);
    }
})

router.post("/updatepwd", function (req, res) {
    if(!req.session.user) {
        res.redirect("/");
        return;
    }
    if(UserDB.validatePassword(req.body.oldPassword, req.session.user.pwd)== false) {
        req.session.ejsParams.msg = {alert: 'alert-danger', msg: 'Mật khẩu cũ không đúng'};
        req.session.ejsParams.activeTab = "passwordTab";
        res.redirect("/user/information");
        return;
    }
    var data = {pwd: req.body.newPassword};
    UserDB.update(req.session.user._id, data, function (err, record) {
        if (err || !record) {
            req.session.ejsParams.msg = {alert: 'alert-danger', msg: 'Có lỗi xảy ra trong quá trình cập nhật dữ liệu, vui lòng thao tác lại'};
            req.session.ejsParams.activeTab = "passwordTab";
            res.redirect("/user/information");
            return;
        }
        req.session.user = record;
        req.session.ejsParams.msg = {alert: 'alert-success', msg: 'Cập nhật mật khẩu thành công'};
        req.session.ejsParams.activeTab = "passwordTab";
        res.redirect("/user/information");
    });
})

router.post("/updateinfo", function (req, res) {
    if (!req.session.user) {
        res.redirect("/user/login");
        return;
    }

    var data = {};
    data.address = {};
    var body = req.body;
    var user = req.session.user;
    if (body.username != user.username) data.username = body.username;
    if (body.email != user.email) data.email = body.email;
    if (body.birthday != user.birthday) data.birthday = new Date(body.birthday);
    if (body.address_street != user.address.street) data.address.street = body.address_street;
    if (body.address_ward != user.address.ward) data.address.ward = body.address_ward;
    if (body.address_district != user.address.district) data.address.district = body.address_district;
    if (body.address_city != user.address.city) data.address.city = body.address_city;
    UserUpdateValidation(data, function (msg) {

        if (msg == null) {
            UserDB.update(user._id, data, function (err, record) {
                if (err || !record) {
                    req.session.ejsParams.msg = {type: 'alert-danger', msg: 'Có lỗi không xác định khi cập nhập dữ liệu, vui lòng thử  lại.'};
                    res.redirect('/user/information');
                } else {
                    req.session.user = record;
                    console.log(req.session.user.birthday);
                    req.session.ejsParams.msg = { type: "alert-success", msg: "Cập nhật thành công!" };
                    res.redirect('/user/information');
                    
                }
            });
        } else {
            console.log(msg);
        }
    })


})

router.post("/forgotpasswordsubmit", function (req, res) {

    if (req.query.step == 1) {
        UserDB.getFromEmail(req.body.inputEmail, function (err, record) {
            if (err) {
                req.session.ejsParams.msg = { type: "alert-danger", msg: "Có lỗi không xác định xảy ra. Vui lòng thao tác lại!" };
                res.redirect("/user/forgotpassword?step=1");
                return;
            }
            if (!record) {
                req.session.ejsParams.msg = { type: "alert-warning", msg: "Địa chỉ email không hợp lệ." };
                res.redirect("/user/forgotpassword?step=1");
                return;
            }
            helper.user.SendPasswordResetMail(req.get("host"), req.body.inputEmail, function (error, key) {
                if (error) {
                    req.session.ejsParams.msg = { type: "alert-danger", msg: "Có lỗi không xác định xảy ra. Vui lòng thao tác lại!" };
                    res.redirect("/user/forgotpassword?step=1");
                    return;
                } else {
                    req.session.resetInfo = {};
                    req.session.resetInfo.key = key;
                    req.session.resetInfo.start = new Date();
                    req.session.resetInfo.email = req.body.inputEmail;
                    req.session.ejsParams.msg = { type: "alert-success", msg: "Email đã được gửi, vui lòng kiểm tra hộp thư để cập nhật thông tin." };
                    res.redirect("/user/forgotpassword?step=1");

                }
            })
        })
    } else if (req.query.step == 3) {
        if (!req.session.resetInfo) {
            res.redirect("/");
            return;
        }
        UserDB.getFromEmail(req.session.resetInfo.email, function (err, record) {
            if (err || !record) {
                req.session.resetInfo = null;
                req.session.ejsParams.msg = { type: "alert-warning", msg: "Có lỗi không xác định xảy ra. Vui lòng thao tác lại!" };
                res.render("Message", { msg: req.session.ejsParams.msg });
                return;
            }
            var data = {pwd: req.body.inputPassword};
            UserDB.update(record._id, data, function (err, record) {
                if (err || !record) {
                    req.session.resetInfo = null;
                    req.session.ejsParams.msg = { type: "alert-warning", msg: "Có lỗi không xác định xảy ra. Vui lòng thao tác lại!" };
                    res.render("Message", req.session.ejsParams);
                    return;
                }
                var msg = {alert: 'alert-success', msg: 'Cập nhật mật khẩu thành công!'};
                res.render("ForgotPassword", {msg: msg, user: null, step: 2});
                console.log("Success change password for user: " + record._id);
            })
        })
    }
})

router.post("/registersubmit", function (req, res) {

    var data = {
        username: req.body.inputUsername,
        birthday: new Date(),
        email: req.body.inputEmail,
        pwd: req.body.inputPassword,
        avatar: '/images/user-ava.jpg',
        favoriteCategoty: [],
        address: {street:'', ward: '', district: '', city: ''},
        activities: [],
        notifications: [],
        role: 1,
        likes: 0,
        comments: 0,
        shares: 0,
    };
    UserRegisterValidation(data, function (msg) {
        if (msg == null) {
            UserDB.create(data, function (err, id) {
                if (err) {

                } else {
                    console.log("ID: " + id);
                    req.session.ejsParams.msg = { type: "alert-success", msg: "Vui lòng sử dụng email và mật khẩu vừa đăng ký để đăng nhập." };
                    res.redirect("/user/login")
                    
                }
            });
        } else {
            req.session.ejsParams.msg = { type: "alert-danger", msg: msg };
            res.redirect("/user/register");
        }
    })
});

router.post("/updateavatar", upload.single('image'), function (req, res) {
    if (!req.session.user) {
        console.log("Not login yet, redirect to login page");
        res.redirect("/user/login");
        return;
    }
    if (req.file) {
        var filename = req.file.filename;
        console.log('Uploading file...' + filename);
        SaveFiles(req.file, function (filePath) {
            if (filePath) {
                filePath = filePath.replace("public", '');
                var data = { avatar: filePath };
                UserDB.update(req.session.user._id, data, function (err, record) {
                    if (err) {

                        res.status(403)
                            .contentType("text/plain")
                            .end("Failed to save image to database!");
                    } else {

                        req.session.user = record;
                        res
                            .status(200)
                            .contentType("text/plain")
                            .end("Avatar updated!");
                    }

                });

            } else {
                res.status(403)
                    .contentType("text/plain")
                    .end("Failed to save image!");
            }
        });
    }
})

router.post("/loginsubmit", function (req, res) {
    var data = {
        email: req.body.inputEmail,
        pwd: req.body.inputPassword
    };
    UserDB.getFromLogin(data.email, data.pwd, function (err, data) {
        if (err) {
            req.session.ejsParams.msg = { type: "alert-danger", msg: "Có lỗi không xác định xảy ra, vui lòng đăng nhập lại!" };
            res.redirect("/user/login")
        }else {
            if (data) { // Login success
                req.session.ejsParams.msg = null;
                req.session.user = data;
                res.redirect("/user/information");
                console.log("User: " + data.id + " start new session");
            } else {
                req.session.ejsParams.msg = { type: "alert-danger", msg: "Sai email hoặc mật khẩu, vui lòng nhập lại!" };
                
                res.redirect("/user/login")
            }
        }
    })
})
 module.exports = router;



function UserRegisterValidation(data, cb) {
    UserDB.getFromEmail(data.email, function (err, data){
        console.log(data);
        if (err)  return cb("Lỗi không xác định, vui lòng đăng ký lại!");
        if (data) return cb("Email này đã được đăng ký, vui lòng sử dụng email khác!");
        cb(null);
    });

    // TODO: Check e-mail 
}

function UserUpdateValidation(data, cb) {
    // Check new email is already register
    UserDB.getFromEmail(data.email, function (err, data){
        if (err)  return cb("Lỗi không xác định");
        if (data) return cb("Email này đã được đăng ký, vui lòng sử dụng email khác!");
        cb(null);
    });
}

function BuildUserInfomation(userdata, cb) {
    var userInfo = {};
    userInfo.favCat = [];
    userInfo.activities = [];
    userInfo.notifications = [];
    userInfo.username = userdata.username;
    userInfo.role = helper.user.GetUserRole(userdata.role);
    userInfo.email = userdata.email;
    userInfo.birthday = helper.common.DateToString(userdata.birthday);
    console.log()
    userInfo.avatar = userdata.avatar;
    userdata.favoriteCategoty.forEach(function (catId) {
        CatDB.getFromId(catId).then(function (record){
            userInfo.favCat.push({name: record.name, url: record.url});
        }).catch(function(err) {
            console.log("[BuildUserInfomation] Failed to get category " + catId + " from database. Err: " + err);
            cb(err);
        })
    });

    userInfo.likes = userdata.likes;
    userInfo.comments = userdata.comments;
    userInfo.shares = userdata.shares;
    userdata.activities.forEach(function (activity) {
        PostDB.getFromId(activity.postId).then(function (record) {
            userInfo.activities.push({ action: helper.user.ActionToString(activity.action), 
                link: record.url, 
                post: record.title });
        }).catch(function (err) {
            console.log("[BuildUserInfomation] Failed to get post information [id: " + activity.postId + "]");
            cb(err);
        })
    });

    var queue = new PriorityQueue();
    userdata.notifications.forEach(function(notify) {
        queue.enqueue(notify.message, notify.priority);
    })
    
    queue.get().forEach(function(item) {
        var notify = {msg: item.element, alert: null}
        if (item.prio == 3) notify.alert = 'alert-danger';
        else if (item.prio == 2) notify.alert = 'alert-info';

        userInfo.notifications.push(item);
    })

    userInfo.address = userdata.address;
    if (!userInfo.address) userInfo.address = {street:'', ward: '', district: '', city: ''};
    cb(null, userInfo);
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