exports.DateToString = function (date) {
    if (!date) {
        console.log("Date: " + date);
        return "Chưa cập nhật!";
    }
    var objDate = new Date(date)
    var mm = objDate.getMonth() + 1;
    var dd = objDate.getDate();
    return [objDate.getFullYear(), (mm > 9 ? '' : '0') + mm, (dd > 9 ? '' : '0') + dd].join('-');
}

exports.RandomString = function (length) {
    var result = '';
    var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var charactersLength = characters.length;
    for (var i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
}

exports.ComputeDeltaTime = function (past) {
    var past = new Date(past);
    var now = new Date();
    var delta = now.getTime() - past.getTime();
    return new Date(delta);
}

exports.ToNoneVietnamese = function(str) {
    str = str.replace(/à|á|ạ|ả|ã|â|ầ|ấ|ậ|ẩ|ẫ|ă|ằ|ắ|ặ|ẳ|ẵ/g, "a");
    str = str.replace(/è|é|ẹ|ẻ|ẽ|ê|ề|ế|ệ|ể|ễ/g, "e");
    str = str.replace(/ì|í|ị|ỉ|ĩ/g, "i");
    str = str.replace(/ò|ó|ọ|ỏ|õ|ô|ồ|ố|ộ|ổ|ỗ|ơ|ờ|ớ|ợ|ở|ỡ/g, "o");
    str = str.replace(/ù|ú|ụ|ủ|ũ|ư|ừ|ứ|ự|ử|ữ/g, "u");
    str = str.replace(/ỳ|ý|ỵ|ỷ|ỹ/g, "y");
    str = str.replace(/đ/g, "d");
    str = str.replace(/À|Á|Ạ|Ả|Ã|Â|Ầ|Ấ|Ậ|Ẩ|Ẫ|Ă|Ằ|Ắ|Ặ|Ẳ|Ẵ/g, "A");
    str = str.replace(/È|É|Ẹ|Ẻ|Ẽ|Ê|Ề|Ế|Ệ|Ể|Ễ/g, "E");
    str = str.replace(/Ì|Í|Ị|Ỉ|Ĩ/g, "I");
    str = str.replace(/Ò|Ó|Ọ|Ỏ|Õ|Ô|Ồ|Ố|Ộ|Ổ|Ỗ|Ơ|Ờ|Ớ|Ợ|Ở|Ỡ/g, "O");
    str = str.replace(/Ù|Ú|Ụ|Ủ|Ũ|Ư|Ừ|Ứ|Ự|Ử|Ữ/g, "U");
    str = str.replace(/Ỳ|Ý|Ỵ|Ỷ|Ỹ/g, "Y");
    str = str.replace(/Đ/g, "D");
    return str;
}
exports.ToURL = function (str) {
    return str.replace(/\s/g, '-');
}

var CatDB = require('../models/Category')
var ejs = require('ejs');
var fs = require('fs');
exports.ReBuildHeader = function()
{
    var forNonUser = `<ul class="nav nav-tabs ml-auto">
    <li><a class="nav-link" href="/user/register">Đăng ký</a></li>
<li><a class="nav-link" href="/user/login">Đăng nhập</a></li>
</ul>`;
    var forUser = `<div class="dropdown user">
    <button class="btn ml-auto btn-dark active dropdown-toggle " type="text"><a href=""
        id="drowDownUser"><i class="fas fa-2x fa-user-circle" style="color:#ffc107"></i></a></button>
    <div class="dropdown-menu bg-dark user-dropdown dropdown-menu-right">
        <a class="dropdown-item text-white" href="/user/information">Trang cá nhân</a>
        <a class="dropdown-item text-white" href="/user/manager">Trang quản lý</a><hr style="margin: 2px; background-color:#f0e9d3">
        <a class="dropdown-item text-white" href="/user/logout">Đăng xuất</a>
    </div>
</div>`;
    CatDB.get({}, (err, records) => {
        if (err) return console.log("Can't build header: " + err);
        var result = {};
        records.forEach( el => {
            if (!result[el.group]) result[el.group] = [];
            console.log(el.group);
            result[el.group].push(el);
        })
        ejs.renderFile('./views/fragment/header_template.ejs', {category: result, specify: forNonUser}, {}, (err, str) =>
        {
            if (err) return console.log("EJS can't render: " + err);
            fs.writeFileSync('./views/fragment/header.ejs', str, )
        })
        ejs.renderFile('./views/fragment/header_template.ejs', {category: result, specify: forUser}, {}, (err, str) =>
        {
            if (err) return console.log("EJS can't render: " + err);
            fs.writeFileSync('./views/fragment/header_user.ejs', str, )
        })
    })
}