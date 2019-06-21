var PostDB = require("../models/Post");
var jwt = require("../helpers/jwt")
var helper = require("../helpers");
var UserDB = require("../models/User");
var CommentDB = require("../models/Comment");
var CatDB = require("../models/Category");

const pagesize = 7;

module.exports = {
    categoryposts: _load_category_posts,
    tagposts: _load_tag_posts
};

function _load_tag_posts(req, res, next) {
    console.log("[Tag]");
    var re = /\/tag\/(.*)/.exec(req.originalUrl);
    if (!re) return next();
    var userId = req.session.user || "";
    //var istag = /\/tag\/(.*)/.test(req.originalUrl);
    console.log(re + ' ' + req.originalUrl);
    var tag = re[1];
    var page = req.query.page;
    var tagUrl = req.originalUrl;
    if (page) tagUrl = tagUrl.split('?')[0];
    if (!page) page = 1;
    console.log(`${tag} ${page} ${tagUrl}`);
    if (!tag) return res.render("Message", {msg: "MissingTag"});
    
    PostDB.get({tag: tag}, (err, records) => {
        if (err) return next();

        var s = buildPagination(records.length, page, tagUrl);
        var posts = SplitData(page, records);
        res.render("PostsList", { newPosts: null,
            hotPosts: null,
            categoryName: tag,
            userId: userId,
            pagination: s,
            posts: posts });
    });
}

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
      
        var begin = (page - 1) * pagesize;
        var end = begin + pagesize;
        PostDB.category(catName, begin, end).then(result => {
            var s = buildPagination(result.total, page, categoryUrl);
            res.render("PostsList", { newPosts: result.newPosts,
                                    hotPosts: result.hotPosts,
                                    categoryName: catName,
                                    userId: userId,
                                    pagination: s,
                                    posts: result.posts });
        }).catch(err => {
            console.log(err);
            res.render("Message", {msg: err});
        })
    })

}

function buildPagination(total, pagenum, url) {
    var maxPage = Math.floor(total / pagesize) + ((total % pagesize) == 0? 0: 1);
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
    result += '</ul>'
    return result;
}

function SplitData(pagenum, records) {
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