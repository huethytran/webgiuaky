var UserDB = require("../models/User");
var jwt = require("../helpers/jwt")
var helper = require("../helpers");
module.exports = {
    register: _get_register,
    login: _get_login,
    logout: _get_logout,
    forgotpassword: _get_forgotpw,
    information: _get_information,
    resetpassword: _get_resetpassword,
    needLogin: _validateLogin,
    noNeedLogin: _validateNotLogin
};


function _get_register(req, res) {
    res.render("UserRegister", req.session.ejsParams)
}


function _get_login(req, res) {
    var msg = null;
    if (req.query.msg) {
        msg = {msg: req.query.msg.content, type: 'alert-' + req.query.msg.type};
    }
    console.log(msg);
    res.render("UserLogin", {msg: msg});
}


function _get_logout(req, res) {
    console.log("User: " + req.session.ejsParams.user + " stop session");
    req.session.ejsParams.msg = null;
    req.session.ejsParams.user = null;
    res.redirect("/user/login");
}


function _get_forgotpw(req, res) {
    res.render("ForgotPassword", {step: 1});
}


function _get_resetpassword(req, res) {
    if (!req.query.token) {
        console.log("[UserController] Request reset password without token. Query: " + req.query);
        res.redirect('/');
        return;
    }
    var option = {issuer: 'web2019', subject: 'dummy@dummy.com',audience: 'web2019' };
    var data = jwt.verify(req.query.token, option);
    if(!data) {
        var msg = { type: "alert-warning", msg: "Mã không hợp lệ!" };
        res.render("Message", {msg: msg});
        return;
    }

    res.render("ForgotPassword", {step: 2, uid: data.uid});
}


function _post_resetpassword(req, res) {

}
function _get_information(req, res) {
    
    res.render("UserInformation", req.session.ejsParams);
}
function _post_forgotpassword(req, res) {

}

/*
 * if user not login, redirect to index page
*/
function _validateLogin(req, res, next) {
    if (!req.user) {
        return res.redirect('/user/login');
    }
    var token = req.body.token || req.query.token || req.headers['x-access-token'];
    if (token) {
        //jwt.verify
    }
    next();
}

function _validateNotLogin(req, res, next) {
    if (req.session.ejsParams.user) {
        return res.redirect('/');
    }
    next();
}

