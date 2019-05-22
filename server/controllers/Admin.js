var express = require('express');
var router = express.Router();
var CatDB = require("../models/Category");
var helper = require("../helpers");



router.post("/category", function(req, res) {
    if (!req.session.user || req.session.user.role != 5) {
        return;
    }
    console.log(req.body);
    if (req.query.action == 'create') {
        console.log(req.body.catName);
        console.log(req.body.catGroup);
        createCategory(req.body.catName, req.body.catGroup, function (msg) {
            response(res, msg);
        });
    } else if (req.query.action == 'update') {
        console.log(req.body.oldname)
        console.log(req.body.newname)
        console.log(req.body.group)
        updateCategory(req.body.oldname, req.body.newname, req.body.group, function (msg) {
            response(res, msg);
        })
    } else if (req.query.action == 'delete') {
        console.log(req.body.catName);
        console.log(req.body.catGroup);
        deleteCategory(req.body.catName, req.body.catGroup, function(msg) {
            response(res, msg);
        })
    } else {
        console.log("[Admin] Unknow action on category");
        console.log(req.params.action);
        res.status(406)
                .contentType("text/plain")
                .end("Unknow action");
    }
})


router.use("/manager", function(req, res) {
    if (!req.session.ejsParams) req.session.ejsParams = {user:null, msg: null};
    if (!req.session.user || req.session.user.role != 5) {
        res.redirect('/');
    }
    BuildCategory(req.session.ejsParams, (err) => {
        if (err) return res.render("404", req.session.ejsParams);
        return res.render("Admin", req.session.ejsParams);
    });
    console.log("Go");
})

function BuildCategory(ejsParams, cb) {
    const countPerPage = 5;
    ejsParams.categoriesTotal = 0;
    ejsParams.categories = [];
    ejsParams.paginationCat = null;

    CatDB.getAll(function(err, records) {
        if (err) return cb(err);
        if (records.length ==0) return cb(null);

        ejsParams.categoriesTotal = records.length;
        records.forEach((element, index) => {
            if (ejsParams.categories.length>= countPerPage) return;
            var cat = { index: index, name: element.name, group: element.group, publish: 0, approve: 0, notapprove: 0, reject: 0 };
            ejsParams.categories.push(cat);
            console.log(element);
        })

        
        
        if (records.length > countPerPage) {
            var numPage = 1;
            ejsParams.paginationCat = [];
            numPage = records.length / countPerPage + 1;
            numPage = numPage>5?5:numPage;
            for (var i = 1; i<= numPage; i++) {
                var page = {index: i, active:''};
                ejsParams.paginationCat.push(page);
            }
            ejsParams.paginationCat[0].active = 'active';
        }
       
        console.log("Done");
        cb(null);
    })
}

module.exports = router;

function createCategory(name, group, cb) {
    var url = helper.common.GetGroupURL(group) + helper.common.GetURLFromCatName(name);
    CatDB.getFromUrl(url).then(function(record){
        if (record) {
            console.log(record);
            cb("Chuyên mục đã được đăng ký!");
        }else {
            CatDB.create(name, group, url).then(function(record) {
                console.log("[Admin] Success to add new category: " + name);
                cb(null);
            }).catch(function(err) {
                cb("Thêm dữ liệu vào Cơ sở Dữ liệu thất bại!");
                console.log("[Admin] Failed to add new category: " + name);
                console.log(err);
            });
        }
    }).catch(function(err) {
        console.log('[Admin] Failed to find category. ');
        console.log(err);
        cb("Tìm kiếm chuyên mục thất bại!");            
    });
}

function updateCategory(oldName, newName, group, cb) {
    var oldUrl = helper.common.GetGroupURL(group) + helper.common.GetURLFromCatName(oldName);
    var newUrl = helper.common.GetGroupURL(group) + helper.common.GetURLFromCatName(newName);
    CatDB.getFromUrl(oldUrl, function (err, record) {
        if (err) {
            cb('Có lỗi xảy ra trong quá trình truy cập cơ sở dữ liệu');
            console.log("[Admin] Failed to get data from oldurl: " + oldUrl);
            console.log(err);
            return;
        }
        if (record) {
            CatDB.update(record._id, {name: newName, url: newUrl}, function (err, record) {
                if (err) {
                    cb('Có lỗi xảy ra trong quá trình cập nhật');
                    console.log("[Admin] Failed to update category: " + oldName);
                    console.log(err);
                    return;
                }
                cb(null);
            })
        } else {
            cb('Không thể  tìm thấy chuyên mục ' + oldName + "trong cơ sở dữ liệu");
            console.log("[Admin] Failed to find category from url: " + oldUrl);
        }
    })
}

function deleteCategory(name, group, cb) {
    CatDB.delete({name: name, group: group}, function(err, res) {
        if (err) {
            console.log("[Admin] Failed to delete category: " + name);
            console.log(err);
            return cb('Có lỗi xảy ra trong quá trình truy vấn cơ sở dữ liệu');
        }
        if (res) {
            return cb(null);
        }

        return cb("Không thể tìm thấy chuyên mục " + name + " thuộc nhóm " + group + " trong cơ sở dữ liệu");

    })
}

function response(res, msg) {
    if (msg) {
        res.status(406)
            .contentType("text/plain")
            .end(msg);
    }else {
        res.status(200)
            .contentType("text/plain")
            .end("Success");
    }
}