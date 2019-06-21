
var CatDB = require('./models/Category')
var ejs = require('ejs');
var fs = require('fs');
var ReBuildHeader = function()
{
    var forNonUser = `<li><a class="nav-link" href="/user/register">Đăng ký</a></li>
    <li><a class="nav-link" href="/user/login">Đăng nhập</a></li>`;
    var forUser = `<a class="dropdown-item text-white" href="/user/information">Trang cá nhân</a>
    <a class="dropdown-item text-white" href="/user/manager">Trang quản lý</a><hr style="margin: 2px; background-color:#f0e9d3">
    <a class="dropdown-item text-white" href="/user/logout">Đăng xuất</a>`;
    CatDB.get({}, (err, records) => {
        if (err) return console.log("Can't build header: " + err);
        var result = {};
        console.log(records);
        records.forEach( el => {
            if (!result[el.group]) result[el.group] = [];
            console.log(el.group);
            result[el.group].push(el);
        })
        ejs.renderFile('./views/fragment/header_template.ejs', {category: result, specify: forNonUser}, {}, (err, str) =>
        {
            if (err) return console.log("EJS can't render: " + err);
            fs.writeFileSync('test1.ejs', str, )
        })
        ejs.renderFile('./views/fragment/header_template.ejs', {category: result, specify: forUser}, {}, (err, str) =>
        {
            if (err) return console.log("EJS can't render: " + err);
            fs.writeFileSync('test1.ejs', str, )
        })
    })
}


var FixURL = function()
{
    CatDB.get({}, (err, records) => {
        if (err) return console.log("Can't get: " + err);
        records.forEach( el => {
           if (el.url[0] != '/'){
               var fixUrl = '/' + el.url;
               console.log(`Old url: ${el.url}| new url: ${fixUrl}`);
               CatDB.update(el._id, {url: fixUrl}, (err, newRecord) => {
                   if (err) console.log(err);
                   else console.log(`Done: ${el.name}`);
               })
           }
        })
    })
}

var UserDB = require('./models/User');
var FixJoinDate = function()
{
    UserDB.get({}, (err, records) => {
        if (err) return console.log(err);
        records.forEach(el => {
            if (!el.joinDate) {
                UserDB.update(el._id, {joinDate: Date.now()}, (err, newData) => {
                    if (err) return console.log(err);
                    console.log(`Success update ${el._id}: Join date: ${newData.joinDate}`);
                })
            }
        })
    })
}

FixJoinDate();