var mongoose = require('mongoose');
var environment = process.env.NODE_ENV; // development
if (!environment) environment = 'development';
const stage = require('../config')[environment];

var uri = process.env.DB_URI;
if (!uri) uri = 'mongodb+srv://minhnthai:nhatminh1997@cluster0-5u7gv.mongodb.net/test?retryWrites=true';

mongoose.connect(uri, { useNewUrlParser: true, useFindAndModify: false });

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
    premium: Number,
    status: Number     
});
postSchema.index({
    title: 'text',
    summary: 'text',
    content: 'text'
  }, {
    weights: {
      title: 5,
      summary: 3,
      content: 1
    },
  });
var PostModel = mongoose.model("Post", postSchema);

// Create
exports.create = function(postData, cb) {
    PostModel.create(postData, function (err, data) {
        if (err) {
            return cb(err);
        }
        cb(null, data);
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
exports.fullTextSearch = function(temp, cb){
    PostModel.find({ $text: { $search: temp }}, function(err, data){
        if (err) return cb(err);
        cb(null, data);
    })
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
exports.getNewCategoryPosts = function (category, cb) {
    var query = PostModel.find({category: category});
    query.sort({post_date: -1});
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
exports.getHotNewsCategoryInWeek = function(category, cb){
    var thisWeek = new Date(Date.now() - (7 * 24 * 60 * 60 * 1000));
    var query = PostModel.find({category: category});
    query.where('post_date').gt(thisWeek);
    query.sort({view: -1});
    // query.limit(3);
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
exports.get5SameCategory = function (cate, postid, cb) {
    
    var query = PostModel.find({category: cate});
    query.where('_id').ne(postid);
    query.sort({post_date: -1});
    query.limit(5);
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
exports.count = (options, cb) => {
    PostModel.count(options, (err, num) => {
        if (err) {
            console.log("[PostModel] Failed to count database")
            return cb(err);
        }
        return cb(null, num);
    })
}
exports.getPagePosts = function (perPage, page, category, cb){
    
    PostModel
    .find({category: category})
    .sort({post_date: -1})
    .skip((perPage * page) - perPage)
    .limit(perPage)
    query(function (err, posts) {
        PostModel.count().exec(function(err, count) {
        if (err) return cb(err);
        cb(null, posts, page,Math.ceil(count / perPage) );
      })
    })
}

exports.get = function (options, cb) {
    PostModel.find(options, function (err, data) {
        if (err) return cb(err);
        cb(null, data);
    });
}

exports.delete = function(id, cb) {
    PostModel.findOneAndDelete({_id: id}, (err, record) => {
        if (err) return cb(err);
        cb(null, record);
    })
}

exports.update = function(id, options, cb) {
    PostModel.findOneAndUpdate({_id: id}, options, (err, record) => {
        if (err) return cb(err);
        cb(null, record);
    })
}

exports.home = async function() {
    var newPosts = [];
    var mostViewPosts = [];
    var hotNewsInWeek = [];

    var query = PostModel.find({});
    query.sort({ post_date: -1 });
    query.limit(10);
    newPosts = await query.exec();

    query = PostModel.find({});
    query.sort({view: -1});
    query.limit(10);
    mostViewPosts = await query.exec();

    var thisWeek = new Date(Date.now() - (7 * 24 * 60 * 60 * 1000));
    query = PostModel.find({});
    query.where('post_date').gt(thisWeek);
    query.sort({view: -1});
    query.limit(4);
    hotNewsInWeek = await query.exec();

    var top10Cate = [];
    var top10CatePosts = [];
    var query = PostModel.find({});
    query.sort({post_date: -1});
    var posts = await query.exec();
    for (var i = 0; i < posts.length; i++) {
        if (top10Cate.length >= posts.length || top10Cate.length >= 10)
            break;
        else {
            if (isInTop10Cate(posts[i].category, top10Cate) == false) {
                top10Cate.push(posts[i].category);
                top10CatePosts[top10CatePosts.length] = posts[i];
            }
        }

    }

    return {newPosts, mostViewPosts, top10CatePosts, hotNewsInWeek};
}

exports.category = async function(category, begin, end) {
    var newPosts = [];
    var hotPosts = [];
    var posts = [];
    var query = PostModel.find({category: category});
    query.sort({post_date: -1});
    query.limit(4);
    newPosts = await query.exec();

    var thisWeek = new Date(Date.now() - (7 * 24 * 60 * 60 * 1000));
    query = PostModel.find({category: category});
    query.where('post_date').gt(thisWeek);
    query.sort({view: -1});
    query.limit(3);
    hotPosts = await query.exec();
    
    query = PostModel.find({category: category});
    query.skip(begin);
    query.limit(end - begin);
    posts = await query.exec();
    console.log('posts size: ' + posts.length);
    query = PostModel.countDocuments({category: category});
    var total = await query.exec();
    console.log(`${begin} ${end} ${total}`);
    return {newPosts, hotPosts, posts, total};
}