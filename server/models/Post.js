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
    summary: String,
    view: Number,
    status: Number     
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
    var id = "ObjectId(" + _uid + ")";
    console.log(id);
    PostModel.findOne({_id: _uid}, function (err, data) {
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

exports.getNewPosts = function (cb) {
    var query = PostModel.find({});
    query.sort({post_date: -1});
    query.limit(10);
    query.exec(function (err, posts) {
        if (err) return cb(err);
        cb(null, posts);
      })
    
}
exports.getHotNewsInWeek = function(cb){
    var thisWeek = new Date(Date.now() - (7 * 24 * 60 * 60 * 1000));
    var query = PostModel.find({});
    query.where('post_date').gt(thisWeek);
    query.sort({view: -1});
    query.limit(4);
    query.exec(function (err, posts) {
        
        if (err) return cb(err);
        cb(null, posts);
      })
}
exports.getTop10Categories = function(cb){
    var top10Cate = [];
    var top10CatePosts = [];
    var query = PostModel.find({});
    query.sort({post_date: -1});
    query.exec(function (err, posts) {
        if (err) return cb(err);
        else {
            for (var i=0; i< posts.length; i++)
            {
                if (top10Cate.length >= posts.length || top10Cate.length >= 10)
                    cb(null, top10CatePosts);
                else
                {
                     if (isInTop10Cate(posts[i].category, top10Cate) == false)
                    {
                         top10Cate.push(posts[i].category);
                         top10CatePosts[top10CatePosts.length] = posts[i];
                    }
                }
                
            }
            
            cb(null, top10CatePosts);
        }
    });
    
}
function isInTop10Cate(cate, cateArr)
{
    for (var i=0; i<cateArr.length; i++)
    {
        if (cate == cateArr[i])
            return true;
    }
    return false;
}
exports.getMostViewPosts = function (cb) {
    
    var query = PostModel.find({});
    query.sort({view: -1});
    query.limit(10);
    query.exec(function (err, posts) {
        
        if (err) return cb(err);
        cb(null, posts);
      })
    
}

exports.update = function (id, data, cb) {
    PostModel.findByIdAndUpdate(id, data,{new: true}, function (err, record) {
        if (err) return cb(err);
        if (!data) return cb("Not found");
        cb(null, record);
    
    })
}