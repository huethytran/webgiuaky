const user = require("./User.js");
const admin = require("./Admin.js");
const apiuser = require("./APIUser.js");
const apiadmin = require("./APIAdmin.js");

module.exports = (router) => {
    router.use('/user', user());
    router.use('/news', post());
    router.use('/api/post', apipost());
    router.use('/admin', admin());
    router.use('/api/user', apiuser());
    router.use('/api/admin', apiadmin());
    return router;
}