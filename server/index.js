var express = require('express');
var multer = require('multer');
var bodyParser = require('body-parser');
var UserDB = require("./models/user");
var app = express();
var upload = multer();
// Basic setting
app.use(express.static('public'))
app.set('view engine', 'ejs');
// for parsing application/json
app.use(bodyParser.json()); 
app.use(bodyParser.urlencoded({ extended: true })); 
// for parsing multipart/form-data
app.use(upload.array()); 

app.get('/register', function(req, res){
   res.render("UserRegister")
});

app.post("/AAA", function (req, res) {
   console.log(req.body);
   
   var data = {
      username: req.body.inputUsername,
      uid: "AAAA",
      name: "",
      birthday: null,
      email: req.body.inputEmail,
      pwd: req.body.inputPassword
   };
   console.log(UserDB.create(data));
   res.send("recieved your request!");
});

app.listen(3000);
console.log("Start server on port 3000");