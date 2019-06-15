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

exports.create = function (name, cb) {
    if (!validateTagName(name)) return cb("InvalidName");

    var data = { name: name, numReference: 0 };
    tagModel.create(data, (err, record) => {
        if (err) return cb(err);
        cb(null, record);
    })
}

exports.get = function (option, cb) {
    tagModel.find(option, (err, record) => {
        if (err) return cb(err);
        return cb(null, record);
    })
}

exports.incReference = function (tagList) {
    tagList.forEach(element => {
        tagModel.findOne({ name: element }, (err, record) => {
            if (err) {
                console.log(`[TagModel] Error when find tag ${element}`);
                console.log(err);
                return;
            }
            if (!record) {
                console.log(`Tag: ${element} not found`);
                return;
            }
            var newRef = record.numReference + 1;
            tagModel.findOneAndUpdate({ name: element }, { numReference: newRef },
                (err, newRecord) => {
                    if (err) {
                        console.log(`[TagModel] Error when update tag ${element}`);
                        console.log(err);
                        return
                    }

                    if (newRecord.numReference != newRef) {
                        console.log(`[TagModel] Can't update tag ${element}`);
                        return
                    }
                })
        })
    });
}

exports.delete = function(name, cb) {
    tagModel.findOneAndDelete({name: name}, (err, record) => {
        if (err) return cb(err);
        cb(null, record);
    })
}

function validateTagName(name) {
    if (name.indexOf(' ') != -1) return false;
    return true;
}