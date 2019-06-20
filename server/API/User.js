var jwt = require('../helpers/jwt');
var config = require("../config");
var helper = require("../helpers");
var UserDB = require("../models/User");
var {PriorityQueue} = require("../helpers/PriorityQueue");
var fs = require('fs');
const path = require('path');

module.exports = {
    register: _post_register,
    login: _post_login,
    resetpassword: _post_resetpw,
    updateinfo: _post_updateinfo,
    avatar: _post_avatar,
    getinfo: _get_information,
    forgotpassword: _post_forgotpassword,
    validateToken: _validateToken,
    sendrequest: _post_sendrequest
}

function _post_sendrequest(req, res){
    UserDB.updateRequest(req.body.user._id, req.body.user, function(err, request){
        if (err) {
            console.log("Gửi yêu cầu thất bại");

        }
        else {
            console.log("Gửi yêu cầu thành công");
        }
    })
}
function _post_register(req, res) {
    var data = {
        username: req.body.inputUsername,
        birthday: new Date(),
        email: req.body.inputEmail,
        pwd: req.body.inputPassword,
        expDate: new Date(),
        avatar: '/images/user-ava.jpg',
        favoriteCategoty: [],
        address: {street:'', ward: '', district: '', city: ''},
        activities: [],
        notifications: [],
        role: config.UserRole.NORMAL,
        likes: 0,
        comments: 0,
        shares: 0,
        request: 0
    };

    var result = {};
    var status = 200;
    UserRegisterValidation(data, req.body.inputConfirmPassword, function (msg) {
        if (msg == null) {
            UserDB.create(data, function (err, id) {
                if (err) {
                    console.log("[UserController] Failed to add user to database: " + err);
                    status = 500;
                    result.status = status;
                    result.error = "Có lỗi trong quá trình tạo cơ sở dữ liệu, vui lòng thử lại!"
                    res.status(status).send(result);
                } else {
                    console.log("[UserController] Success create user with ID: " + id);
                    status = 200;
                    result.status = status;
                    result.id = id;
                    res.status(status).send(result);
                }
            });
        } else {
            status = 406;
            result.status = status;
            result.error = msg
            res.status(status).send(result);
        }
    })
}


function _post_login(req, res) {
    var data = {
        email: req.body.inputEmail,
        pwd: req.body.inputPassword,
    };
                

    var result = {};
    var status = 200;
    UserDB.getFromLogin(data.email, data.pwd, function (err, data) {
        if (err) {
            status = 500;
            result.status = status;
            result.error = err;
            console.log("[UserController] Failed to get data from database: " + err);
            res.status(status).send(result)
        }else {
            if (data) { // Login success
                var option = {issuer: 'web2019', subject: 'dummy@dummy.com',audience: req.body.audience };
                var playload = {user: data._id, role: data.role};
                var token = jwt.sign(playload, option);
                if (data.role == 3)
                    checkAccount(data);
                req.session.user = {id: data._id, role: data.role};
                status = 200;
                result.status = status;
                result.token = token;
                res.status(status).send(result)
                console.log("User: " + data.id + " start new session");

            } else {
                status = 401;
                result.status = status;
                result.error = `Sai email hoặc mật khẩu, vui lòng nhập lại!`;
                res.status(status).send(result)
            }
        }
    })
}
function checkAccount(user){
    var now = new Date();
    if (now.getTime() > user.expDate.getTime())
        UserDB.updateRole(user._id);
}
function _post_updateinfo(req, res) {
    var status = 200;
    UpdateUserInformation(req.user, req.body, (err, record) => {
        if (typeof err === 'string' && err != 'Null data return') {
            status = 406;
            res.status(status).send(err);
            return;
        } else if (err) {
            status = 500;
            res.status(status).send('Internal Server Error');
            return;
        }
        res.status(200).send("Cập nhật thông tin thành công");
    })
}

function _post_forgotpassword(req, res) {
    UserDB.getFromEmail(req.body.inputEmail, function (err, record) {
        if (err) {
            res.status(500).send('Có lỗi không xác định xảy ra. Vui lòng thao tác lại!')
            return;
        }
        if (!record) {
            res.status(402).send('Địa chỉ email không hợp lệ.')
            return;
        }
        helper.user.SendPasswordResetMail(req.get("host"), req.body.inputEmail, record._id, function (error, key) {
            if (error) {
                res.status(500).send('Có lỗi không xác định xảy ra. Vui lòng thao tác lại!')
                return;
            } else {
                console.log(key);
                res.status(200).send('Email đã được gửi, vui lòng kiểm tra hộp thư để cập nhật thông tin.')
                return;
            }
        })
    })
}
function _get_information(req, res) {
    console.log(req.id);
    BuildUserInfomation(req.user.id, function (err, userInfo) {
        if (err) {
            console.log("[User API] Failed to build user information: " + err);
            status = 500;
            result.status = status;
            result.error = err;
            res.status(status).send(result);
        } else {
            status = 200;
            res.status(status).send(userInfo);
        }
    })
}

function _post_resetpw(req, res) {
    if (req.query.from && req.query.from ==='email') {
        var uid = req.query.email;
        if (PassWordValidate(req.body.inputPassword, req.body.inputConfirmPassword) ==0) {
            data = {pwd: req.body.inputPassword};
            UserDB.update(uid, data, (err, record) => {
                if (err || !record) {
                    console.log(`[UserAPI] Failed to update user password`);
                    console.log(err);
                    res.status(500).send('Có lỗi trong quá trình cập nhật mật khẩu, vui lòng thử lại');
                    return;
                }
                res.status(200).send('Cập nhật mật khẩu thành công.');

            })
        } else res.status(406).send('Mật khẩu không phù hợp');
        return;
    }
    UserDB.getFromUid(req.user, (err, record) => {
        if (err) {
            console.log(`[UserAPI] Failed to get user ${req.user} information`);
            console.log(err);
        } else {
            if(UserDB.validatePassword(req.body.oldPassword, record.pwd) == false) {
                res.status(406).send('Mật khẩu cũ không đúng')
                return;
            }
            var data = {pwd: req.body.newPassword};
            UserDB.update(req.user, data, function (err, record) {
                if (err || !record) {
                    res.status(500).send('Có lỗi xảy ra trong quá trình cập nhật dữ liệu, vui lòng thao tác lại')
                    return;
                }
                res.status(500).send('Cập nhật mật khẩu thành công')
            });
        }
    })
    
}

function _post_avatar(req, res) {
    if (req.file) {
        var filename = req.file.filename;
        console.log('Uploading file...' + filename);
        SaveFiles(req.file, function (filePath) {
            if (filePath) {
                filePath = filePath.replace("public", '');
                var data = { avatar: filePath };
                UserDB.update(req.user, data, function (err, record) {
                    if (err) {

                        res.status(403)
                            .send("Có lỗi trong quá trình cập nhật cơ sở dữ liệu, vui lòng thử lại!");
                    } else {
                        res
                            .status(200)
                            .send("Cập nhật ảnh đại diện thành công!");
                    }

                });

            } else {
                res.status(403)
                    .send('Có lỗi trong quá trình lưu ảnh đại diện vào hệ thống');
            }
        });
    }
}

function UserRegisterValidation(data, rePwd, cb) {
    var r = PassWordValidate(data.pwd, rePwd);
    if (r == 1) return cb('Mật khẩu không thõa mãn yêu cầu.');
    else if (r ==2) return cb('Mật khẩu không khớp');

    UserDB.getFromEmail(data.email, function (err, data){
        console.log(data);
        if (err)  return cb("Lỗi không xác định, vui lòng đăng ký lại!");
        if (data) return cb("Email này đã được đăng ký, vui lòng sử dụng email khác!");
        cb(null);
    });

    // TODO: Check e-mail 
}

function PassWordValidate(pwd, pwd2) {
    var regex = new RegExp('^(?=.*[a-z])|(?=.*\d).{6,}$', 'g');
    console.log(`Test: ${regex.test(pwd)}`);
    if (!regex.test(pwd)) return 1;
    if (pwd === pwd2) return 0;
    return 2;
}
function BuildUserInfomation(userUid, cb) {
    if (!userUid) return cb("InvaildUserUid");
    UserDB.getFromUid(userUid, (err, userdata) => {
        if (err) {
            console.log(`[BuildUserInfomation] Failed to get user ${userUid} information from database`);
            return cb(err);
        } else if (!userdata) {
            console.log(`[BuildUserInfomation] ${userUid} null database`);
            return cb("Null database");
        }
        
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
            CatDB.getFromId(catId).then(function (record) {
                userInfo.favCat.push({ name: record.name, url: record.url });
            }).catch(function (err) {
                console.log("[BuildUserInfomation] Failed to get category " + catId + " from database. Err: " + err);
                cb(err);
            })
        });

        userInfo.likes = userdata.likes;
        userInfo.comments = userdata.comments;
        userInfo.shares = userdata.shares;
        userdata.activities.forEach(function (activity) {
            PostDB.getFromId(activity.postId).then(function (record) {
                userInfo.activities.push({
                    action: helper.user.ActionToString(activity.action),
                    link: record.url,
                    post: record.title
                });
            }).catch(function (err) {
                console.log("[BuildUserInfomation] Failed to get post information [id: " + activity.postId + "]");
                cb(err);
            })
        });

        var queue = new PriorityQueue();
        userdata.notifications.forEach(function (notify) {
            queue.enqueue(notify.message, notify.priority);
        })

        queue.get().forEach(function (item) {
            var notify = { msg: item.element, alert: null }
            if (item.prio == 3) notify.alert = 'alert-danger';
            else if (item.prio == 2) notify.alert = 'alert-info';

            userInfo.notifications.push(item);
        })

        userInfo.address = userdata.address;
        if (!userInfo.address) userInfo.address = { street: '', ward: '', district: '', city: '' };
        cb(null, userInfo);
    })
}

function UpdateUserInformation(userUid, body, cb) {
    var data = {};
    data.address = {};
    UserDB.getFromUid(userUid, (err, user) => {
        if (err) {
            console.log(`[UpdateUserInformation] Failed to get user ${userUid} information to database`);
            console.log(err);
            return cb(err);
        }

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
                    if (err) {
                        console.log(`[UpdateUserInformation] Failed to update user ${userUid} information to database`);
                        console.log(err);
                        cb(err);
                    } else if (!record) {
                        console.log(`[UpdateUserInformation] Failed to update user ${userUid} information to database, Database return null.`);
                        cb("Null data return");
                    } else {
                        console.log(`[UpdateUserInformation] Updated user ${userUid} information to database.`);
                        cb(null, record)
                    }
                });
            } else {
                cb(msg);
            }
        })
    })
}

function UserUpdateValidation(data, cb) {
    // Check new email is already register
    UserDB.getFromEmail(data.email, function (err, data){
        if (err)  return cb("Lỗi không xác định");
        if (data) return cb("Email này đã được đăng ký, vui lòng sử dụng email khác!");
        cb(null);
    });
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


function _validateToken(req, res, next) {
    var token = req.body.token || req.query.token;
    var audience = req.body.audience || req.query.audience;

    if (!token) {
        console.log('[UserAPI] Missing token');
        console.log(req.originalUrl);
        return res.redirect('/');
    }

    var option = {issuer: 'web2019', subject: 'dummy@dummy.com',audience: audience };
    var userinfo = jwt.verify(token, option);
    if (userinfo == 'TokenExpiredError') {
        console.log('[UserAPI] Token Expired');
        return res.status(401).send("TokenExpiredError");
    } else if (userinfo == false) {
        console.log('[UserAPI] Invalid token');
        return res.status(401).send("Invaild token");
    }
    req.user = {id: userinfo.user, role: userinfo.role};
    next();
}