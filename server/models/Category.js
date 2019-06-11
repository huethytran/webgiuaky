var mongoose = require('mongoose');

var uri = process.env.DB_URI;
if (!uri) uri = 'mongodb://localhost/db_test';

mongoose.connect(uri, { useNewUrlParser: true, useFindAndModify: false });
console.log("Category DB: " + uri);
var catSchema = mongoose.Schema({
    index: Number,
    name: String,
    url: String,
    group: String
});

var CategoryModel = mongoose.model("Category", catSchema);

exports.create = function (name, group, url, cb) {
    CategoryModel.create({ name: name, url: url, group: group }, function (err, record) {
        if (err) {
            console.log("[CategoryModel] Failed to add categoty " + name + " to database!");
            if (cb) cb(err);
        } else {
            if (cb) cb(null, record);
        }
    });
}

exports.getFromId = function (id, cb) {
    return new Promise(function (resolve, reject) {
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

exports.get = function (options, cb) {
    CategoryModel.find(options, (err, records) => {
        if (err) {
            console.log("[CategoryModel] Failed to get category: " + options.toString());
            return cb(err);
        }
        cb(null, records);
    })
}

exports.delete = function(option, cb) {
    CategoryModel.findOneAndDelete(option, (err, record) => {
        if (err) {
            console.log("[CategoryModel] Failed to delete category: " + option);
            return cb(err);
        }
        if (!record) {
            console.log("[CategoryModel] Failed to find category: " + option);
            return cb("Null category");
        }
        cb(null, record);
    })
}

exports.getAllCategoryName = function(cb){
    var query = CategoryModel.find({});
    query.select('name');
    query.exec(function(err, categories){
        if (err) return cb(err);
        cb(null, categories);
    })
}

exports.get = function (options, cb) {
    CategoryModel.find(options, (err, records) => {
        if (err) {
            console.log("[CategoryModel] Failed to get category: " + options.toString());
            return cb(err);
        }
        cb(null, records);
    })
}

exports.delete = function(option, cb) {
    CategoryModel.findOneAndDelete(option, (err, record) => {
        if (err) {
            console.log("[CategoryModel] Failed to delete category: " + option);
            return cb(err);
        }
        if (!record) {
            console.log("[CategoryModel] Failed to find category: " + option);
            return cb("Null category");
        }
        cb(null, record);
    })
}

exports.update = function(id, option, cb) {
    CategoryModel.findOneAndUpdate({id: id}, option, (err, record) => {
        if (err) {
            console.log("[CategoryModel] Failed to delete category: " + option);
            return cb(err);
        }
        if (!record) {
            console.log("[CategoryModel] Failed to find category: " + option);
            return cb("Null category");
        }
        cb(null, record);
    })
}