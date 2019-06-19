const controller = require("../controllers/User");
const APIUser = require("../API/User");
//const passport = require('passport');
var multer = require('multer');
var express = require('express');
var funcRouter = express.Router();
var upload = multer({ dest: 'uploads/' })
module.exports  = () => {
    funcRouter.get('/logout',           controller.needLogin,   controller.logout);
    funcRouter.get('/information',      controller.needLogin,   controller.information);
    funcRouter.get('/manager',          controller.needLogin,   controller.manager);
    funcRouter.get('/register',         controller.noNeedLogin, controller.register);
    funcRouter.get('/login',            controller.noNeedLogin, controller.login);
    funcRouter.get('/forgotpassword',   controller.noNeedLogin, controller.forgotpassword);
    funcRouter.get('/resetpassword',    controller.noNeedLogin, controller.resetpassword);
    //funcRouter.get('/auth/fb', passport.authenticate('facebook', {scope: ['email']}));
    //funcRouter.get('/auth/fb/cb', passport.authenticate('facebook', {
      //  failureRedirect: 'back',
       // successRedirect: '/'
      //}));
    
    return funcRouter;
}
