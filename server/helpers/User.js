var nodemailer = require("nodemailer");
var smtpTransport = nodemailer.createTransport({
    service: "Gmail",
    auth: {
        user: "t.n.minh1997@gmail.com",
        pass: '<your mail password'
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

exports.SendPasswordResetMail = function (host, email, cb) {
    var rand = Math.floor((Math.random() * 100) + 54);
    link = "http://" + host + "/user/inputpassword?id=" + rand;
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
            console.log("Message sent: " + response.message);
            cb(null, rand);
        }
    });
}