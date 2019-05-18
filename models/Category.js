var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/db_test', { useNewUrlParser: true });

var catSchema = mongoose.Schema({
    name: String,
    url: String
});

var CategoryModel = mongoose.model("Category", catSchema);

exports.create = function(name, url, cb) {
    return new Promise(function(resolve, reject){
        CategoryModel.create({name: name, url: url}, function (err, record){
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

