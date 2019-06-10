var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/db_test', { useNewUrlParser: true });

var catSchema = mongoose.Schema({
    name: String,
    url: String,
    category_name: String
});

var CategoryModel = mongoose.model("Category", catSchema);

exports.create = function(name, url, category_name, cb) {
    return new Promise(function(resolve, reject){
        CategoryModel.create({name: name, url: url, category_name: category_name}, function (err, record){
            if (err) {
                console.log("[CategoryModel] Failed to add categoty " + name + " to database!");
                reject(err);
                if (cb) cb(err);
            } else {
                resolve(record);
                if (cb) cb(null, record);
            }
        });
    });
    
}

exports.getFromId = function(id, cb) {
    return new Promise(function(resolve, reject) {
        CategoryModel.findById(id, function (err, record) {
            if (err) {
                console.log("[CategoryModel] Failed to get category: " + id);
                reject(err);
                if (cb) cb(err);
            } else {
                resolve(record);
                 if (cb) cb(null, record);
            }
        });
    });
    
}

exports.getAllCategoryName = function(cb){
    var query = CategoryModel.find({});
    query.select('name');
    query.exec(function(err, categories){
        if (err) return cb(err);
        cb(null, categories);
    })
}
