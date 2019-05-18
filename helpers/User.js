
exports.GetUserRole = function (role) {
    if (role == 1) return "Độc giả";
    if (role == 2) return "Phóng viên";
}

exports.ActionToString = function (action) {
    if (action == 1) return "thích";
    if (action == 2) return "bình luận";
    if (action == 3) return "chia sẻ";
}