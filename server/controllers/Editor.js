var ROLE = require("../config").UserRole;
var jwt = require('../helpers/jwt');
var UserDB = require("../models/User")
var CatDB = require("../models/Category")
module.exports = {
    manager : _get_manager,
    validateEditor : _validateEditor
}

function _get_manager(req, res) {
    res.render('Editor');
}

function _validateEditor(req, res, next) {

    if (req.session.user.role != ROLE.EDITOR) {
        console.log(`[EditController] User ${userinfo.user} Permission Denied`);
        return res.status(401).send("Permission Denied");
    }
    next();
}

function BuildEditor(userid, cb) {
    UserDB.getFromUid(userid, (err, record) => {
        if (err) return cb(err);
        if (!record.category) return cb("NoCategory");

        var result = {};
        var categories = [];
        record.category.forEach(idcat => {
            CatDB.getFromId(idcat, (err, catData) => {
                if (err) return cb(err);
                if (!catData) return cb("CategoryNotFound");
                categories.push({name: catData.name, id: idcat});
            })
        });
        
    })
}