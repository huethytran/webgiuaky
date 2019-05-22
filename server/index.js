var express = require('express');
var multer = require('multer');
var bodyParser = require('body-parser');
var session = require('express-session');
//==============================================================================
var mongoose = require ("mongoose"); // The reason for this demo.

    // Here we find an appropriate database to connect to, defaulting to
    // localhost if we don't find one.
    var uristring = 'mongodb+srv://minhnthai:nhatminh1997@cluster0-5u7gv.mongodb.net/test?retryWrites=true'

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
app.set('port', (process.env.PORT || 5000))
app.listen(app.get('port'));
console.log("Start server on port " + app.get('port'));