var express = require('express');
var multer = require('multer');
var bodyParser = require('body-parser');
var session = require('express-session');

var app = express();
var upload = multer();
// Basic setting
app.use(express.static('public'))
app.use(session({
   secret: "Shh, its a secret!", resave: false,
   saveUninitialized: false
}));
app.set('view engine', 'ejs');
// for parsing application/json
app.use(bodyParser.json()); 
app.use(bodyParser.urlencoded({ extended: true })); 
// for parsing multipart/form-data
// app.use(upload.array()); 
app.use(require('./controllers'));

app.listen(3000);
console.log("Start server on port 3000");