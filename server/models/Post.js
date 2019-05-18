var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/db_test', { useNewUrlParser: true });

var postSchema = mongoose.Schema({
    title: String,
    image_title: String,
    category: String,
    tag: [String],
    content: String,
    post_date: Date,
    author: String,
    url: String
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

exports.getFromId = function (_uid, cb) {
    PostModel.findById(_uid, function (err, data) {
        if (err) return cb(err);
        cb(null, data);
    });
}