/*const passport = require("passport");
const passportfb = require("passport-facebook").Strategy;
const userDB = require('../models/user');
module.exports = function(app) {
    passport.use(new passportfb(
        {
            clientID: '2720524381310320',
            clientSecret: 'a5b53b31d03d0eeaa9bfa093f0151a08',
            callbackURL: 'http://localhost:3000/user/auth/fb',
            profileFields: ['email','birthday','displayName']
        },
        (accessToken, refreshToken, profile, done) => {
            console.log(profile);
    
           /* userDB.find(profile._json.id).then(user => {
                if(user.length > 0){
                    return done(null,user);
                }
                else{
                    var entity = {
                        CliId: profile._json.id,
                        CliName: profile._json.name,
                        CliEmail: profile._json.email
                    }
                    userDB.add(entity).then(id => {
                        return done(null,id);
                    })
                }
            }).catch(err => {
                return done(err);
            })
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
}*/