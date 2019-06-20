var mongoose = require('mongoose');
const bcrypt = require('bcrypt');

var environment = process.env.NODE_ENV; // development
if (!environment) environment = 'development';
const stage = require('../config')[environment];

var uri = process.env.DB_URI;
if (!uri) uri = 'mongodb+srv://minhnthai:nhatminh1997@cluster0-5u7gv.mongodb.net/test?retryWrites=true';

mongoose.connect(uri, { useNewUrlParser: true, useFindAndModify: false });
console.log("DB URI: " + uri);
var userSchema = mongoose.Schema({
    username: String,
    birthday: Date,
    email: String,
    pwd: String,
    avatar: String,
    favoriteCategoty: [String],
    likes: Number,
    joinDate: Date,
    comments: Number,
    shares: Number,
    expDate: Date,
    address: {
        street: String,
        ward: String,
        district: String,
        city: String
    },
    request: Number,
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
}, { discriminatorKey: 'kind' })

var UserModel = mongoose.model("User", userSchema);

var EditorModel = UserModel.discriminator("Editor", new mongoose.Schema({ category: [String] }));
var SubcriberModel = UserModel.discriminator("Subcriber", new mongoose.Schema({remainDay: Number}));

exports.create = function (userData, cb) {
    bcrypt.hash(userData.pwd, stage.saltingRounds, function (err, hash) {
        if (err) {
            console.log("[UserModel] Failed to encrypt password of " + userData.username);
            return cb(err);
        }
        userData.pwd = hash;
        UserModel.create(userData, function (err, data) {
            if (err) {
                console.log("[UserModel] Failed to add " + userData.username + " to database.\nError: " + err);
                return cb(err);
            }
            else {
                return cb(null, data._id);
            }

        });
    });
}
exports.updateRequest = function (id, data, cb) {
    UserModel.findByIdAndUpdate(id, data,{new: true}, function (err, record) {
        if (err) return cb(err);
        if (!data) return cb("Not found");
        cb(null, record);
    
    })
}
exports.getFromUid = function (_uid, cb) {
    UserModel.findById(_uid, function (err, data) {
        if (err) return cb(err);
        cb(null, data);
    });
}

exports.getCommentUsersFromUid = function (usersId, cb) {
    UserModel.find({_id: { $in: usersId}}, function(err, docs){
        if (err) console.log("Có lỗi xảy ra");
         cb(null, docs);
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
exports.updateRole = function(id){
    UserModel.findByIdAndUpdate(id, {role: 1}, function(err, record){
        if (err) console.log(err);
        else console.log("Update user role");
    })
}
exports.update = function (id, data, cb) {
    var hashPwd;
    if (data.pwd) {
        bcrypt.hash(data.pwd, stage.saltingRounds).then(function(result) {
            hashPwd = result;
            data.pwd = hashPwd;
            UserModel.findByIdAndUpdate(id, data,{new: true}, function (err, record_1) {
                if (err) return cb(err);
                if (!record_1) return cb("NotFound");
                if (data.kind) {
                    var model = null;
                    if (data.kind == 'Editor') model = EditorModel;
                    else if (data.kind = 'Subcriber') mode = SubcriberModel;
                    console.log("Kind: " + data.kind);
                    model.findByIdAndUpdate(id, data, {new: true}, (err, record_2) => {
                        if (err) return cb(err);
                        if (!record_2) return cb("NotFound");
                        console.log(record_2);
                        cb(null, record_2);

                    })
                } else cb(null, record);
        
            })
        }).catch(function(err) {
            return cb(err);
        })
    }else {
        UserModel.findByIdAndUpdate(id, data,{new: true}, function (err, record) {
            if (err) return cb(err);
            if (!record) return cb("NotFound");
            if (data.kind) {
                var model = null;
                if (data.kind == 'Editor') model = EditorModel;
                else if (data.kind = 'Subcriber') mode = SubcriberModel;
                console.log("Kind: " + data.kind);
                model.findByIdAndUpdate(id, data, {new: true}, (err, record_2) => {
                    if (err) return cb(err);
                    if (!record_2) return cb("NotFound");
                    cb(null, record_2);

                })
            } else cb(null, record);
    
        })
    }

    
}

exports.get = function(options, cb) {
    UserModel.find(options, (err, records) => {
        if (err) return cb(err);
        return cb(null, records);
    })
}

exports.delete = function(uid, cb) {
    UserModel.findOneAndDelete({_id: uid}, (err, record) => {
        if (err) return cb(err);
        cb(null, record);
    })
}
exports.validatePassword = function(pwd, hashPwd) {
    bcrypt.compare(pwd, hashPwd).then(function(res) {
        return res;
    }).catch(function(err) {
        console.log("[UserModel]bcrypt.compare: " + err);
        return false;
    })
}