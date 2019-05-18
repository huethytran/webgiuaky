var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/db_test', { useNewUrlParser: true });

const UserActivityType = {
    LIKE: 1,
    COMMENT: 2,
    SHARE: 3
};

var activitySchema = mongoose.Schema({
    actionAuthorId: String,
    postId: String,
    action: Number,
});

var UserActivityModel = mongoose.model("UserActivity", activitySchema);


exports.create = function (data, cb) {
    UserActivityModel.create(data, function (err, record) {
        if (err) {
            console.log("[UserActivityModel] Failed to add user activity to database: " + err);
            return cb(err);
        } else {
            return cb(null, record.id);
        }
    });
}

exports.findByAuthor = function (id, cb) {
    UserActivityModel.find({actionAuthorId: id}, function (err, records) {
        if (err) return cb(err);
        cb(null, records);
    });
}

exports.findByPost = function (id, cb) {
    UserActivityModel.find({postId: id}, function (err, records) {
        if (err) return cb(err);
        cb(null, records);
    });
}

exports.findByAction = function (action, cb) {
    if (action <1 || action > 3) return cb("Invalid action to find");

    UserActivityModel.find({action: action}, function (err, records) {
        if (err) return cb(err);
        cb(null, records);
    });
}

exports.findByAny = function (authorId, postId, action, cb) {
    if (action <1 || action > 3) return cb("Invalid action to find");
    var option = {};
    if (authorId) option.actionAuthorId = authorId;
    if (postId) option.postId = postId;
    if (action) option.action = action;
    UserActivityModel.find(option, function (err, records) {
        if (err) return cb(err);
        cb(null, records);
    });
}