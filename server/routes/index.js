const user = require("./User.js");
const apiuser = require("./APIUser.js");

module.exports = (router) => {
    router.use('/user', user());
    router.use('/api/user', apiuser());
    return router;
}