var express = require('express');
var router = express.Router()

router.use("/user", require('./User'));


module.exports = router;