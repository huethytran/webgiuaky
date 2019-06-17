const user = require("./User.js");
const admin = require("./Admin.js");
const apiuser = require("./APIUser.js");
const apiadmin = require("./APIAdmin.js");
const apipost = require("./APIPost.js");
const post = require("./Post.js");
const newpost = require("./NewPost.js");
const mainpage = require("./MainPage.js");
const postslist = require("./PostsList.js");
module.exports = (router) => {
    router.use('/user', user());
    router.use('/posts', postslist());
    router.use('/postdetail', post());
    router.use('/api/post', apipost());
    router.use('/admin', admin());
    router.use('/api/user', apiuser());
    router.use('/writter',newpost());
    router.use('/news',mainpage());
    router.use('/api/admin', apiadmin());
    return router;
}
