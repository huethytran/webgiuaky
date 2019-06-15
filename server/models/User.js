var mongoose = require('mongoose');
const bcrypt = require('bcrypt');

var environment = process.env.NODE_ENV; // development
if (!environment) environment = "development"
const stage = require('../config')[environment];
var uri = 'mongodb://localhost/db_test';
if (process.env.DB_URI) uri = process.env.DB_URI;
mongoose.connect(uri, { useNewUrlParser: true, useFindAndModify: false });
console.log("URI: " + uri);
var userSchema = mongoose.Schema({
    username: String,
    birthday: Date,
    email: String,
    pwd: String,
    avatar: String,
    favoriteCategoty: [String],
    likes: Number,
    comments: Number,
    shares: Number,
    address: {
        street: String,
        ward: String,
        district: String,
        city: String
    },
    role: Number,
    activities: [
        {
            postId: String,
            action: Number
        }
    ],
    notifications: [
        {
            priority: Number,
            message: String
        }
    ]
})

var UserModel = mongoose.model("User", userSchema);

exports.create = function (userData, cb) {
    var id;
    bcrypt.hash(userData.pwd, stage.saltingRounds, function (err, hash) {
        if (err) {
            console.log("[UserModel] Failed to encrypt password of " + userData.username);
            return cb(err);
        }
        // console.log("[UserModel] " + userData.pwd + "-->" + hash);
        userData.pwd = hash;
        UserModel.create(userData, function (err, data) {
            if (err) {
                console.log("[UserModel] Failed to add " + userData.username + " to database.\nError: " + err);
                return cb(err);
            }
            else {
                return cb(null, data.id);
            }

        });
    });
}


exports.getFromUid = function (_uid, cb) {
    UserModel.findById(_uid, function (err, data) {
        if (err) return cb(err);
        cb(null, data);
    });
}

exports.getFromLogin = function (_email, _pwd, cb) {
    UserModel.findOne({ email: _email}, function (err, data) {
        if (err) return cb(err);
        if (data) {
            bcrypt.compare(_pwd, data.pwd, function (err, res) {
                if (err) return cb(err);
                if (res == false) return cb(null, null);
                cb(null, data);
            });
        } else return cb(null, null);
    })
}


exports.getFromEmail = function (_email, cb) {
    UserModel.findOne({ email: _email}, function (err, data) {
        if (err) return cb(err);
        cb(null, data);
    })
}
exports.update = function (id, data, cb) {
    var hashPwd;
    if (data.pwd) {
        bcrypt.hash(data.pwd, stage.saltingRounds).then(function(result) {
            hashPwd = result;
            data.pwd = hashPwd;
            UserModel.findByIdAndUpdate(id, data,{new: true}, function (err, record) {
                if (err) return cb(err);
                if (!data) return cb("Not found");
                console.log("[UserModel]Hash pwd: " + data.pwd + "-->" + hashPwd);
                cb(null, record);
        
            })
        }).catch(function(err) {
            return cb(err);
        })
    }else {
        UserModel.findByIdAndUpdate(id, data,{new: true}, function (err, record) {
            if (err) return cb(err);
            if (!data) return cb("Not found");
            cb(null, record);
    
        })
    }

    
}

exports.validatePassword = function(pwd, hashPwd) {
    bcrypt.compare(pwd, hashPwd).then(function(res) {
        return res;
    }).catch(function(err) {
        console.log("[UserModel]bcrypt.compare: " + err);
        return false;
    })
}