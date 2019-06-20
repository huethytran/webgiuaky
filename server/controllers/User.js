var jwt = require("../helpers/jwt");
var ROLE = require("../config").UserRole;
module.exports = {
    register: _get_register,
    login: _get_login,
    logout: _get_logout,
    forgotpassword: _get_forgotpw,
    information: _get_information,
    resetpassword: _get_resetpassword,
    manager: _get_manager,
    needLogin: _validateLogin,
    noNeedLogin: _validateNotLogin,
    accountrenewal: _get_accountrenewal
};


function _get_register(req, res) {
    res.render("UserRegister", req.session.ejsParams)
}

function _get_manager(req, res) {
    if (req.session.user.role == ROLE.EDITOR) res.redirect('/editor/manager');
    else if (req.session.user.role == ROLE.ADMIN) res.redirect('/admin/manager');
    else res.status(200).send('/');
}
function _get_accountrenewal(req, res){
    UserDB.getFromUid(req.session.user.id, function(err, user){
        if (err) console.log("Có lỗi xảy ra");
        else res.render("AccountRenewal", {user: user});
    })
    
}

function _get_login(req, res) {
    var msg = null;
    if (req.query.msg) {
        msg = {msg: req.query.msg.content, type: 'alert-' + req.query.msg.type};
    }

    res.render("UserLogin", {msg: msg});
}


function _get_logout(req, res) {
    console.log("User: " + req.session.user.id + " stop session");
    delete req.session.user;
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
    if (req.session.ejsParams)
        res.render("UserInformation", req.session.ejsParams);
     if (req.user)
     res.render("UserInformation", req.user);
}
function _post_forgotpassword(req, res) {

    res.render("UserInformation");
}

/*
 * if user not login, redirect to index page
*/
function _validateLogin(req, res, next) {
    if (!req.session.user) 
        return res.redirect('/user/login');
    next();
}

function _validateNotLogin(req, res, next) {
    if (req.session.user) {
        return res.redirect('/');
    }
    next();
}