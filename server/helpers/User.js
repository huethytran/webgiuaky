var nodemailer = require("nodemailer");
var jwt = require('../helpers/jwt');

var smtpTransport = nodemailer.createTransport({
    service: "Gmail",
    auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASSWORD
    }
});

exports.GetUserRole = function (role) {
    if (role == 1) return "Người dùng";
    if (role == 2) return "Phóng viên";
    if (role == 3) return "Độc giả";
    if (role == 4) return "Biên tập viên";
    if (role == 5) return "Quản trị viên";
}

exports.ActionToString = function (action) {
    if (action == 1) return "thích";
    if (action == 2) return "bình luận";
    if (action == 3) return "chia sẻ";
}

exports.SendPasswordResetMail = function (host, email, uid, cb) {
    var option = {issuer: 'web2019', subject: 'dummy@dummy.com',audience: 'web2019' };
    var playload = {uid: uid};
    var token = jwt.sign(playload, option, '5m');
    link = "http://" + host + "/user/resetpassword?token=" + token;
    mailOptions = {
        to: email,
        subject: "Reset password",
        html: "Hello,<br> Please Click on the link to reset account password.<br><a href=" + link + ">Click here to verify</a>"
    }
    console.log(mailOptions);
    console.log(smtpTransport.auth);
    smtpTransport.sendMail(mailOptions, function (error, response) {
        if (error) {
            console.log(error);
            cb(error);
        } else {
            console.log("Message sent: " + response.toString());
            cb(null, token);
        }
    });
}