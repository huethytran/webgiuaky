var mongoose = require('mongoose');
const bcrypt = require('bcrypt');
mongoose.connect('mongodb://localhost/db_test', { useNewUrlParser: true, useFindAndModify: false });
const UserRole = {
    NORMAL: 1,
    WRITER: 2,
    SUBSCRIBER: 3,
    EDITOR: 4,
    ADMIN: 5,
};
const NotifyPriority = {
    NORMAL: 1,      // user vs user
    IMPORTANT: 2,   // from admin
    CRITICAL: 3     // from system
}
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
    const saltRounds = 10;
    bcrypt.hash(userData.pwd, saltRounds, function (err, hash) {
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
const saltRounds = 10;
exports.update = function (id, data, cb) {
    var hashPwd;
    if (data.pwd) {
        bcrypt.hash(data.pwd, saltRounds).then(function(result) {
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