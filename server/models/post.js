var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/my_db');

var postSchema = mongoose.Schema({
    uid: Number, 
    title: String,
    image_title: String,
    category: String,
    tag: [String],
    content: String,
    post_date: Date,
    author: String
});

var PostModel = mongoose.model("Post", postSchema);

// Create
exports.create = function(postData) {
    PostModel.create(postData, function (err, data) {
        if (err) {
            console.log("[PostModel] Failed to add " + postData.uid + " to database")
        }
    })
}

exports.get = function (_uid, cb) {
    PostModel.findOne({uid: _uid}, function (err, data) {
        if (err) return cb(err);
        cb(null, data);
    });
}