const user = require("./User.js");
const apiuser = require("./APIUser.js");
const post = require("./Post.js");
const newpost = require("./NewPost.js");
const apipost = require("./APIPost.js");
var admin = require('../controllers/Admin')
module.exports = (router) => {
    router.use('/user', user());
    router.use('/news', post());
    router.use('/api/post', apipost());
    router.use('/api/user', apiuser());
    router.use('/admin',admin);
    router.use('/new',newpost());
    return router;
}