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
    image_url: String,
    post_url: String,
    summary: String,
    view: Number,
    status: Number      // 0: chưa được duyệt,  -1: bị từ chối,  1: đã được duyệt & chờ xuất bản
                         //      2: đã xuất bản
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

exports.getFromTitle = function (_title, cb) {
    PostModel.findOne({title: _title}, function (err, data) {
        if (err) return cb(err);
        cb(null, data);
    });
}


exports.get10CategoryPosts = function (cb) {
    var query = PostModel.find({});
    query.sort({post_date: -1});
    query.limit(10);
    query.exec(function (err, posts) {
        
        if (err) return cb(err);
        cb(null, posts);
      })
    
}
