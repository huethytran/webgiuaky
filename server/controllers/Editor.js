var ROLE = require("../config").UserRole;
var jwt = require('../helpers/jwt');
var UserDB = require("../models/User")
var CatDB = require("../models/Category")
module.exports = {
    manager: _get_manager,
    validateEditor: _validateEditor
}

function _get_manager(req, res) {
    console.log('[Editor] Manager');
    BuildEditor(req.session.user.id, (err, params) => {
        if (err) return res.render("Messages", { msg: err });
        res.render("Editor", params);
    })
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
        // record.category.forEach(async idcat => {
        //      await CatDB.getFromIdSync(idcat).then(record => {
        //         if (!record) return cb("CategoryNotFound");
        //         console.log(`[Editor] Push`)
        //         categories.push({ name: record.name, id: idcat });
        //     }).catch(err => cb(err));
        // });
        (async () => {
            var a =await Promise.all(record.category.map(idcat => CatDB.getFromIdSync(idcat)))
            result.categories = a;
            cb(null, result);
        })();
        
    })
}