var ROLE = require("../config").UserRole;
var jwt = require('../helpers/jwt');

module.exports = {
    managerI : _get_managerI,
    manager : _get_manager,
    validateEditor : _validateEditor
}

function _get_managerI(req, res) {
    res.render("EditerInterface");
}

function _get_manager(req, res) {
    res.render('Editor');
}

function _validateEditor(req, res, next) {
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

    if (userinfo.role != ROLE.EDITOR) {
        console.log(`[UserAPI] User ${userinfo.user} Permission Denied`);
        return res.status(401).send("Permission Denied");
    }

    req.user = userinfo.user;
    next();
}