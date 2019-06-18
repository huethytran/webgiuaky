var mongoose = require('mongoose');
require('mongoose');

var uri = process.env.DB_URI;
if (!uri) uri = 'mongodb://localhost/db_test';

mongoose.connect(uri, { useNewUrlParser: true, useFindAndModify: false })

var commentSchema = mongoose.Schema({
    userId : String,
    postId: String,
    commentTime: Date,
    content: String
});

var CommentModel = mongoose.model("Comment", commentSchema);

// Create
exports.create = function(commentData) {
    CommentModel.create(commentData, function (err, data) {
        if (err) {
            console.log("[CommentModel] Failed to add " + commentData.uid + " to database")
        }
    })
}

exports.getComments = function (_postId, cb) {
    var query = CommentModel.find({postId: _postId});
    query.sort({commentTime: -1});
    query.exec(function (err, comments) {
        if (err) return cb(err);
        cb(null, comments);
      })
}