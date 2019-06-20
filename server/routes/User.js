const controller = require("../controllers/User");
const APIUser = require("../API/User");
const passport = require('passport');
var multer = require('multer');
var express = require('express');
var funcRouter = express.Router();
var jwt = require('../helpers/jwt');
var upload = multer({ dest: 'uploads/' });
module.exports  = () => {
    funcRouter.get('/logout',           controller.needLogin,   controller.logout);
    funcRouter.get('/information',      controller.needLogin,   controller.information);
    funcRouter.get('/manager',          controller.needLogin,   controller.manager);
    funcRouter.get('/register',         controller.noNeedLogin, controller.register);
    funcRouter.get('/login',            controller.noNeedLogin, controller.login);
    funcRouter.get('/forgotpassword',   controller.noNeedLogin, controller.forgotpassword);
    funcRouter.get('/resetpassword',    controller.noNeedLogin, controller.resetpassword);
    funcRouter.get('/accountrenewal', controller.needLogin, controller.accountrenewal);
    funcRouter.get('/fb', passport.authenticate('facebook', {scope: ['email']}));
    funcRouter.get('/fb/cb', passport.authenticate('facebook', {
      failureRedirect: '/user/login'}),
        function(req, res) {
          var option = {issuer: 'web2019', subject: 'dummy@dummy.com',audience: "facebook"+req.user.id };
          var playload = {user: req.user.id, role: req.user.role};
          var token = jwt.sign(playload, option);
          req.session.user = {id: req.user.id, role: req.user.role, token: token};
          // Successful authentication, redirect home.
          res.redirect('/news/home');
        });
    
    return funcRouter;
}
