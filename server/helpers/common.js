exports.DateToString = function (date) {
    if (!date) {
        return "Chưa cập nhật!";
    }
    var objDate = new Date(date)
    var mm = objDate.getMonth() + 1;
    var dd = objDate.getDate();
    return [(dd > 9 ? '' : '0') + dd, (mm > 9 ? '' : '0') + mm, objDate.getFullYear()].join('/');
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
