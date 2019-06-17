var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/db_test', { useNewUrlParser: true });

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