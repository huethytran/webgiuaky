require('dotenv').config();
var express = require('express');
var multer = require('multer');
var bodyParser = require('body-parser');
var session = require('express-session');
const logger = require('morgan');

var app = express();
var upload = multer();

const environment = process.env.NODE_ENV; // development
const stage = require('./config')[environment];

if (environment !== 'production') {
   // app.use(logger('dev'));
}

app.set('view engine', 'ejs');


app.use(express.static('public'))
app.use(session({
   secret: "Shh, its a secret!", resave: false,
   saveUninitialized: false
}));
app.use(bodyParser.json()); 
app.use(bodyParser.urlencoded({ extended: true })); 

// init ejs params
app.use(function (req, res, next) {
   if (!req.session.ejsParams) {
      req.session.ejsParams = {user:null, msg: null};
   }
   next();
})
var router = express.Router();
var route = require("./routes");
app.use(route(router));
app.listen(stage.port);
console.log("Start server on port " + stage.port);