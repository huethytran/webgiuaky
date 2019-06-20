const passport = require("passport");
const passportfb = require("passport-facebook").Strategy;
const UserDB = require('../models/User');
var config = require("../config");
var jwt = require('../helpers/jwt')
module.exports = function(app) {
    app.use(passport.initialize());
    app.use(passport.session());
    passport.use(new passportfb(
        {
            clientID: '2720524381310320',
            clientSecret: 'a5b53b31d03d0eeaa9bfa093f0151a08',
            callbackURL: 'http://localhost:3000/user/fb/cb',
            profileFields: ['email','displayName']
        },
                    function(accessToken, refreshToken, profile, done) {
                        UserDB.getFromEmail( profile._json.email, function(err, user) {
                            console.log(user._id);
                          if (err) return done(err);
                          if (user){
                              if(user.role == 3)
                            {
                                var now = new Date();
                                if (now.getTime() > user.expDate.getTime())
                                    UserDB.updateRole(user._id);
                            }
                            return done(null, user);
                          } 
                          else {
                            // if there is no user found with that facebook id, create them
                            var fbuser = {
                                username: profile._json.name,
                                email: profile._json.email,
                                avatar: "/images/user-ava.jpg",
                                role: config.UserRole.NORMAL,
                                birthday: new Date(),
                                address: { street: '', ward: '', district: '', city: '' },
                                expDate: new Date(),
                                activities: [],
                                notifications: [],
                                likes: 0,
                                comments: 0,
                                shares: 0,
                                request: 0
                            }
                      
                            // save our user to the database
                            fbUser.save(function(err) {
                              if (err) throw err;
                              return done(null, fbUser);
                            });
                          }
                        });
                      }
           
    ))
    passport.serializeUser((user, cb) => {
        cb(null,user.id);
    })
    
    passport.deserializeUser((id, cb) => {
       UserDB.getFromUid(id, function(err, data){
           cb(null, data);
       })
    })
}