var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/my_db', { useNewUrlParser: true });

var userSchema = mongoose.Schema({
    uid: String,
    username: String,
    name: String,
    birthday: Date,
    email: String,
    pwd: String, 
})

var UserModel = mongoose.model("User", userSchema);

exports.create = function(userData) {
    return UserModel.create(userData, function (err, data) {
        if (err) console.log("[UserModel] Failed to add " + userData.name + " to database");
    });
}


exports.get = function (_uid, cb) {
    UserModel.findOne({uid: _uid}, function (err, data) {
        if (err) return cb(err);
        cb(null, data);
    });
}