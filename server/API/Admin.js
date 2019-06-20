
var helper = require("../helpers");
var CatDB = require("../models/Category");
var PostDB = require("../models/Post");
var PostState = require("../config").PostState;
var UserRole = require("../config").UserRole;
var TagDB = require("../models/Tag");
var UserDB = require("../models/User");
var ROLE = require("../config").UserRole;
var ReBuildHeader = require('../helpers/common').ReBuildHeader;
module.exports = {
    post_category : _post_category,
    get_category : _get_category,

    post_tag : _post_tag,
    get_tag : _get_tag,
    delete_tag: _delete_tag,

    get_post: _get_post,
    post_post: _post_post,
    delete_post: _delete_post,

    get_user: _get_user,
    post_user: _post_user,
    delete_user: _delete_user,
    validateAdmin: _validateAdmin
}

function _post_category(req, res) {
    console.log(req.body)
    if (req.query.action == 'create') {
        createCategory(req.body.catName, req.body.catGroup, function (msg) {
            ReBuildHeader();
            response(res, msg);
        });
    } else if (req.query.action == 'update') {
        updateCategory(req.body.oldname, req.body.newname, req.body.catGroup, function (msg) {
            ReBuildHeader();
            response(res, msg);
        })
    } else if (req.query.action == 'delete') {
        deleteCategory(req.body.catName, req.body.catGroup, function(msg) {
            ReBuildHeader();
            response(res, msg);
        })
    } else {
        console.log("[Admin] Unknow action on category");
        console.log(req.query.action);
        res.status(406)
                .contentType("text/plain")
                .end("Unknow action");
    }
}
/**
 * @query perpage
 * @query page
 * @query search
 * Example: /api/admin/category => Get all
 * Example: /api/admin/category?perpage=5&page=1
 * @param {*} req 
 * @param {*} res 
 */
function _get_category(req, res) {
    
    var perPage = req.query.perpage || 5;
    var page = req.query.page;
    var search = req.query.search;
    console.log(`GET[Category] [perpage: ${perPage}][page: ${page}][search: ${search}]`)
    CatDB.get({}, (err, records) => {
        if (err) {
            return res.status(500).send(err);
        }
        var data = ParseData(search, perPage, page, records);

        var resData = {total: records.length, data: data};
        //console.log(records);
        res.status(200).send(resData);
    })
}

/**
 * @query perpage
 * @query page
 * @query search
 * Example: /api/admin/tag => Get all
 * Example: /api/admin/tag?perpage=5&page=1
 * @param {*} req 
 * @param {*} res 
 */

function _get_tag(req, res) {
    var perPage = req.query.perpage || 5;
    var page = req.query.page;
    var search = req.query.search;
    TagDB.get({}, (err, records) => {
        if (err) {
            return res.status(500).send(err);
        }

        if (records) {
            //console.log(records);
            var data = ParseData(search, perPage, page, records);
            var resData = {total: records.length, data: data};
            return res.status(200).send(resData);
        } else {
            return res.status(200).send({total: 0, data: []});
        }
    })
}

function _post_tag(req, res) {
    var name = req.query.name || req.body.name;
    if (!name) return res.status(406).send("Thiếu tên thẻ");
    if (name.length == 0) res.status(406).send("Tên thẻ không được trống");
    TagDB.get({name: name}, function (err, record) {
        if (err) return res.status(500).send(err);
        if (record) return res.status(406).send("Thẻ đã tồn tại.");
        
        TagDB.create(name, function(err, record){
            if (err) return res.status(500).send(err);
            res.status(200).send("Tạo nhãn thành công!");
        })
    })
    
}

function _delete_tag(req, res) {
    var name = req.query.name || req.body.name;
    if (!name && name.length) return res.status(406).send("Thiếu tên thẻ");

    TagDB.delete(name, function(err, record){
        if (err) return res.status(500).send(err);
        res.status(200).send("Xóa nhãn thành công!");
        console.log(`[AdminAPI] ${name} ||| ${record}`);
    })
}


/**
 * @query perpage
 * @query page
 * @query search
 * Example: /api/admin/post => Get all
 * Example: /api/admin/post?perpage=5&page=1
 * @param {*} req 
 * @param {*} res 
 */

function _get_post(req, res) {
    
    var perPage = req.query.perpage || 5;
    var page = req.query.page;
    var search = req.query.search;
    var type = req.query.type;
    var filter = req.query.filter || {};
    var id = req.query.id;
    console.log(`[AdminAPI] Get post`)
    console.log( req.query)

    if (id) {
        console.log(`[AdminAPI] Get post id ${id}`)
        PostDB.getFromId(id, (err, record) => {
            if (err) return res.status(500).send(err);
            if (!record) return res.status(404).send("NotFound");
            res.status(200).send(record);
        })
    }else 
    {
        console.log(filter);
        PostDB.get(filter, (err, records) => {
            if (err) {
                return res.status(500).send(err);
            }

            if (records) {
                var data = ParseData(search, perPage, page, records);
                var simpleData = [];
                if (type == 'simple') {
                    data.forEach((element, index) => {
                        SimplePost(element, (result) => {
                            simpleData.push(result);
                            if (index == data.length - 1) {
                                res.status(200).send({ total: records.length, data: simpleData });
                            }
                        })
                    })
                } else {
                    var resData = { total: records.length, data: data };
                    return res.status(200).send(resData);
                }
            } else {
                return res.status(200).send({ total: 0, data: [] });
            }
        })
    }
}

function _post_post(req, res) {
    var idpos = req.body.id;
    var state = req.body.state;
    console.log(`${idpos} ${state}`)
    PostDB.update(idpos, {status: stateToNum(state)}, (err, record) => {
        if (err) return res.status(500).send(err);
        if (!record) return res.status(404).send("NotFound");
        res.status(200).send(record);
    })
}

function _delete_post(req, res) {
    var id = req.query.id || req.body.id;
    if (!id) return res.status(406).send("Id không hợp lệ");
    
    // Currently send ok, not delete in database
    return res.status(200).send("Ok");

    PostDB.delete(id, (err, record) => {
        if (err) return res.status(500).send(err);
        if (!record) return res.status(400).send('NotFound');

        res.status(200).send(record);
    })
}

function _get_user(req, res) {
    var perPage = req.query.perpage || 5;
    var page = req.query.page;
    var search = req.query.search;
    var type = req.query.type;
    var filter = req.query.filter || {};
    console.log("Query: " + req.query);
    console.log("Body: " + req.body);
    UserDB.get(filter, (err, records) => {
        if (err) return res.status(500).send(err);

        if (records) {
            var data = ParseData(search, perPage, page, records);
            if (type == 'simple') {
                var simpleData = [];
                data.forEach(element => {
                    simpleData.push(SimpleUser(element));
                })
                data = simpleData;
            }

            var resData = { total: records.length, data: data };
            return res.status(200).send(resData);
        } else {
            return res.status(200).send({total: 0, data: []});
        }
    })
}

function _post_user(req, res) {
    var userid = req.body.id;
    var remainDay = req.body.remainDay;
    var role = req.body.role;
    var category = req.body.category;
    console.log(`Post User: ${userid} ${remainDay} ${role} ${category}`);
    var hasData = remainDay || role || category;
    if (!hasData) return res.status(400).send('NoData');
    if (remainDay && validateRemainDay(remainDay)) {
        UserDB.getFromUid(userid, (err, record) => {
            if (err) return res.status(500).send(err);
            if (!record) return res.status(404).send(`${userid} NotFound`);
            if (record.role != UserRole.SUBSCRIBER) return res.status(406).send(`${userid} InvaildRole`);
            var oldValue = record.remainDay || 0;
            UserDB.update(userid, {remainDay: oldValue + parseInt(remainDay), kind: 'Subcriber'}, (err, record) => {
                if (err) return res.status(500).send(err);
                console.log(`Add remain day: ${remainDay}, record: ${record}`);
                return res.status(200).send(record);
            })
        })
    }

    if (role) {
        UserDB.getFromUid(userid, (err, record) => {
            if (err) return res.status(500).send(err);
            if (!record) return res.status(404).send(`${userid} NotFound`);
            var data = {role: role};
            if (role == UserRole.SUBSCRIBER) {
                data.remainDay = 7;
                data.kind= 'Subcriber';
            }
            UserDB.update(userid, data, (err, record) => {
                if (err) return res.status(500).send(err);
                console.log(`Set new role: ${role}, record: ${record}`);
                return res.status(200).send(record);
            })
        });
    }

    if (category) {
        UserDB.getFromUid(userid, (err, record) => {
            if (err) return res.status(500).send(err);
            if (!record) return res.status(404).send(`${userid} NotFound`);
            if (record.role != UserRole.EDITOR) return res.status(406).send(`${userid} InvalidRole`);
            UserDB.update(userid, {category: category, kind: 'Editor'}, (err, record) => {
                if (err) return res.status(500).send(err);
                console.log(`[AdminAPI] Set caetgory for editor: ${userid}`);
                return res.status(200).send(record);
            })
        })
    }
}

function _delete_user(req, res) {
    var userid = req.body.id;
    UserDB.delete(userid, (err, record) => {
        if (err) return res.status(500).send(err);
        if (!record) return res.status(406).send(`${userid} NotFound`);
        res.status(200).send(record);
        console.log(`[AdminAPI] User ${userid} deleted`);
    })
}

function createCategory(name, group, cb) {
    var url = ToURL(name, group);
    CatDB.get({url: url}, (err, records) => {
        if (err) {
            console.log('[Admin] Failed to find category. ');
            console.log(err);
            return cb("Tìm kiếm chuyên mục thất bại!");  
        }

        if (records.length != 0) {
            console.log(records);
            cb("Chuyên mục đã được đăng ký!");
        }else {
            CatDB.create(name, group, url, (err, record) => {
                if (err) {
                    cb("Thêm dữ liệu vào Cơ sở Dữ liệu thất bại!");
                    console.log("[Admin] Failed to add new category: " + name);
                    console.log(err);
                    return;
                } else {
                    console.log("[Admin] Success to add new category: " + name);
                    console.log(url);
                cb(null);
                }
            })
        }
    })
}

function updateCategory(oldName, newName, group, cb) {
    console.log("---------------------------------------------");
    console.log(newName);
    console.log(oldName);
    console.log(group);
    var oldUrl = ToURL(oldName, group);
    var newUrl = ToURL(newName, group);
    CatDB.get({url: oldUrl}, function (err, record) {
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

function ToURL(name, group) {
    var url = '/' + helper.common.ToNoneVietnamese(group) + '/' + helper.common.ToNoneVietnamese(name);
    url = helper.common.ToURL(url);
    url = url.toLowerCase();
    return url;
}


function ParseData(search, pagesize, pagenum, records) {
    pagesize = Number.parseInt(pagesize, 10);
    pagenum = Number.parseInt(pagenum, 10);
    var data = [];
    var srcData = []
    if (!records) return [];
    if (search) {
        records.forEach(element => {
            if (element.name.toLowerCase().indexOf(search.toLowerCase()) != -1) {
                srcData.push(element);
            }
        });
    } else srcData = records;

    if (pagenum) {
        var maxPage = Math.floor(records.length / pagesize) + ((records.length / pagesize) == 0? 0: 1);
        
        if (pagenum<= maxPage && pagenum > 0) {
            var begin = (pagenum - 1) * pagesize;
            data = srcData.slice(begin, begin + pagesize);
            var test = begin + pagesize;
            //console.log(`${typeof(test)} ${typeof(begin)} ${typeof(pagesize)}`)
            //console.log(`[ParseData] ${data.length} [begin: ${begin}][end: ${begin + pagesize}][pagesize: ${pagesize}]`);
        }
    } else data = srcData;
    
    return data;
}

function SimplePost(data, cb) {
    var res = {};
    res.title = data.title;
    res.category = data.category;
    //res.author
    res.state = stateToStr(data.status);
    res.publishDate = ToShortDate(data.post_date);
    res.view = data.view;
    res.url = data.post_url;
    res.id = data._id;
    UserDB.getFromUid(res.author, (err, record) => {
        var authorName;
        if (err || !record) authorName = "Không xác định";
        else authorName = record.name;

        res.author = authorName;
        cb(res);
    })
    
}

function SimpleUser(data) {
    var res = {};
    res.name = data.username;
    res.role = roleToStr(data.role);
    res.joinDate = ToShortDate(data.joinDate);
    res.id = data._id;
    if (data.role == UserRole.SUBSCRIBER) {
        res.remainDay = data.remainDay;
    } else if (data.role == UserRole.EDITOR) {
        res.category = data.category || [];
    }
    return res;
}

function roleToStr(role) {
    if (role == UserRole.NORMAL) return 'Thông thường';
    if (role == UserRole.WRITER) return 'Phóng viên';
    if (role == UserRole.SUBSCRIBER) return 'Độc giả';
    if (role == UserRole.EDITOR) return 'Biên tập viên';
    if (role == UserRole.ADMIN) return 'Quản trị viên';
}
function stateToStr(state) {
    if (state == PostState.DRAFT) return 'Tạm lưu';
    if (state == PostState.WAITING) return 'Chờ duyệt';
    if (state == PostState.APPROVE) return 'Đã duyệt';
    if (state == PostState.PUBLISH) return 'Đã xuất bản';
    if (state == PostState.REJECT) return 'Từ chối';
    return 'Không xác định';
}

function stateToNum(state) {
    if (state == 'Tạm lưu') return PostState.DRAFT;
    if (state == 'Chờ duyệt') return PostState.WAITING;
    if (state == 'Đã duyệt') return PostState.APPROVE;
    if (state == 'Đã xuất bản') return PostState.PUBLISH;
    if (state == 'Từ chối') return PostState.REJECT;
    return -1;
}

function roleToNum(role) {
    if (role == 'Thông thường') return UserRole.NORMAL;
    if (role == 'Phóng viên') return UserRole.WRITER;
    if (role == 'Độc giả') return UserRole.SUBSCRIBER;
    if (role == 'Biên tập viên') return UserRole.EDITOR;
    if (role == 'Quản trị viên') return UserRole.ADMIN;
}
function ToShortDate(date) {
    var jsDate = new Date(date);
    return jsDate.getDay() + "/" + jsDate.getMonth() + "/" + jsDate.getFullYear();
}

function validateRemainDay(remainDay) {
    if (remainDay != '3' || remainDay != '7' || remainDay != '10' || remainDay != '14') return false;
    return true;
}


function _validateAdmin(req, res, next) {

    if (req.user.role != ROLE.ADMIN && req.user.role != ROLE.EDITOR) {
        console.log(`[UserAPI] User ${req.user.id} Permission Denied`);
        return res.status(401).send("Permission Denied");
    }
    next();
}