var PostDB = require('../models/Post');
const PostStatus = require('../config').PostState;
const UserRole = require('../config').UserRole;
module.exports = {
    action: _post_actionpost,
    validateEditor: _validateEditor
}
/**
 * @query id: post id
 * @query date: publish date, null if it is today
 * @param {*} req 
 * @param {*} res 
 */
function _post_actionpost(req, res) {
    var idpost = req.query.id;
    var publishDate = req.query.date;
    var action = req.query.action;
    if (!idpost) return res.status(406).send("MissingIdPost");
    if (!action) return res.status(406).send("MissingAction");

    if (!publishDate) publishDate = Date.now();
    PostDB.getFromId(idpost, (err, record) => {
        if (err) return res.status(500).send(err);
        if (!record) return res.status(404).send("NotFound");
        if (record.status != PostStatus.WAITING) return res.status(406).send(`InvalidPostState ${record.status}`);

        var updateData = {};
        if (action=='accept') {
            updateData.status = PostStatus.APPROVE;
            updateData.post_date = publishDate;
        }
        else updateData.status = PostStatus.REJECT;

        PostDB.update(idpost, updateData, (err, record) => {
            if (err) return res.status(500).send(err);
            res.status(200).send(record);
        })
    })
}

function _validateEditor(req, res, next) {
    if (req.user.role != UserRole.EDITOR) {
        return res.status(403).send("PermissionDenied");
    }

    next();
}