var PostDB = require("../models/Post");
var jwt = require("../helpers/jwt")
var helper = require("../helpers");
var UserDB = require("../models/User");
var CommentDB = require("../models/Comment");
var CatDB = require("../models/Category");

module.exports = {
    categoryposts: _load_category_posts
};

function _load_category_posts(req, res, next) {
    var categoryUrl = req.originalUrl;
    if (req.query.page) categoryUrl = categoryUrl.split('?')[0];
    var userId = "";
    if (req.session.user)
        userId = req.session.user.id;
    
    console.log('categoryUrl: ' + categoryUrl);
    var page = req.query.page;
    if (!page) page = 1;
    CatDB.get({url: categoryUrl}, (err, record) => {
        if (err) return res.render("Message", {msg: err});
        if (!record || record.length == 0) {
            console.log('URL: ' + categoryUrl + " not found");
            return next();
        }
        if (record.length>1) {
            console.log("Invaild category, duplicate");
            return res.render("Message", {msg: "ServerError"});
        }
        record = record[0];
        if (record.url != categoryUrl) {
            console.log('URL: ' + categoryUrl );
            console.log('DB: ' + record.url );
            return next();
        }

        var catName = record.name;
        PostDB.getNewCategoryPosts(catName, function(err, newPosts){
            if (err)  return res.render("Message", {msg: err});
            if (!newPosts) return res.render("Message", {msg: "NoDataNewPost"});
            PostDB.getHotNewsCategoryInWeek(catName, function (err, hotPosts) {

                if (err) return res.render("Message", { msg: err });
                if (!hotPosts) return res.render("Message", {msg: "NoDataHotPost"});
                var s = buildPagination(hotPosts, page, categoryUrl);
                console.log(hotPosts.length);
                hotPosts = SplitData(3, page, hotPosts);
                console.log(hotPosts.length);
                res.render("PostsList", { newPosts: newPosts, hotPosts: hotPosts, categoryName: catName, userId: userId, pagination: s });
            })
        })
    })
    // PostDB.getNewCategoryPosts(req.params.CatName, function(err, newPosts){
    //     if (err) console.log("Có lỗi xảy ra");
    //     else {
    //         PostDB.getHotNewsCategoryInWeek(req.params.CatName, function(err, hotPosts){
    //             var userId = "";
    //              if (req.session.user) 
    //              userId = req.session.user.id;
    //             if (err) console.log("Có lỗi xảy ra");
    //             else res.render("PostsList", {newPosts: newPosts, hotPosts: hotPosts, categoryName: req.params.CatName, userId: userId});
    //         })
    //     }
    // })
}

function buildPagination(records, pagenum, url) {
    const pagesize = 3;
    var maxPage = Math.floor(records.length / pagesize) + ((records.length % pagesize) == 0? 0: 1);
    var result = '<ul class="pagination">';
    if (pagenum<= maxPage && pagenum > 0) {
        if (pagenum == 1) {
            result +=`<li class="page-item disabled"><a class="page-link" href="#"><i class="fa fa-angle-double-left"></i></a></li>`;
        } else {
            result +=`<li class="page-item"><a class="page-link" href="${url + '?page=' + (pagenum-1)}"><i class="fa fa-angle-double-left"></i></a></li>`;
        }
        var begin = pagenum - 1;
        var end = pagenum + 1;
        if (begin < 1) begin = 1;
        if (end > maxPage) {
            end = maxPage;
            if (end - begin <2) {
                begin -= 1;
                if (begin < 1) begin = 1;
            }
        }
        for(var i = begin; i <= end; i++) {
            if (i == pagenum) result += `<li class="page-item active"><a class="page-link" href="#">${i}</a></li>`
            else result += `<li class="page-item"><a class="page-link" href="${url + '?page=' + i}">${i}</a></li>`;
        }
        if (pagenum == maxPage) {
            result +=`<li class="page-item disabled"><a class="page-link" href="#"><i class="fa fa-angle-double-right"></i></a></li>`;
        } else {
            result +=`<li class="page-item"><a class="page-link" href="${url + '?page=' + (pagenum+1)}"><i class="fa fa-angle-double-right"></i></a></li>`;
        }
    }

    return result;
}


function SplitData(pagesize, pagenum, records) {
    pagesize = Number.parseInt(pagesize, 10);
    pagenum = Number.parseInt(pagenum, 10);
    var data = [];
    var srcData = []
    if (!records) return [];
    srcData = records;

    if (pagenum) {
        var maxPage = Math.floor(records.length / pagesize) + ((records.length % pagesize) == 0? 0: 1);
        
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