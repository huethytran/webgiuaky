require('dotenv').config();
var express = require('express');
var multer = require('multer');
var bodyParser = require('body-parser');
var session = require('express-session');
const logger = require('morgan');
//==============================================================================
var mongoose = require ("mongoose"); // The reason for this demo.

    // Here we find an appropriate database to connect to, defaulting to
    // localhost if we don't find one.
    var uristring = "mongodb://localhost/db_test";

    // The http server will listen to an appropriate port, or default to
    // Makes connection asynchronously.  Mongoose will queue up database
    // operations and release them when the connection is complete.
    mongoose.connect(uristring, { useNewUrlParser: true }, function (err, res) {
      if (err) {
      console.log ('ERROR connecting to: ' + uristring + '. ' + err);
      } else {
      console.log ('Succeeded connected to: ' + uristring);
      }
    });
//============================================================================================================
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