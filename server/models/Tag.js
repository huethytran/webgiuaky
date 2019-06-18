var mongoose = require('mongoose');
const bcrypt = require('bcrypt');

var environment = process.env.NODE_ENV; // development
if (!environment) environment = 'development';
const stage = require('../config')[environment];

var uri = process.env.DB_URI;
if (!uri) uri = 'mongodb+srv://minhnthai:nhatminh1997@cluster0-5u7gv.mongodb.net/test?retryWrites=true';

mongoose.connect(uri, { useNewUrlParser: true, useFindAndModify: false });

var tagSchema = mongoose.Schema({
    name: String,
    numReference: Number,
});

var tagModel = mongoose.model("Tag", tagSchema);

exports.create = function (name) {
    var data = { name: name, numReference: 1 };
    tagModel.create(data, function (err, _data) {
        if (err) console.log("Lỗi khi tạo tag");

    })
}

exports.get = function (option, cb) {
    tagModel.find(option, (err, record) => {
        if (err) return cb(err);
        return cb(null, record);
    })
}
exports.findTag = function(name, cb){
    tagModel.findOne({name: name }, function (err, data) {
        if (err) {
            console.log(`[TagModel] Error when find tag ${name}`);
            console.log(err);
            return cb(err);
        }
        cb(null, data);
})
}
exports.updateTag = function(tag) {
    tagModel.findOneAndUpdate({name: tag}, { $inc : { numReference : 1 }} , function(err, record) {
        
        if (err) console.log(err);
        
    })
}

exports.delete = function(name, cb) {
    tagModel.findOneAndDelete({name: name}, (err, record) => {
        if (err) return cb(err);
        cb(null, record);
    })
}
