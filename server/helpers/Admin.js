
var UserDB = require("../models/User");
var data = {
    username: 'admin',
    birthday: new Date(),
    email: 'admin@admin.com',
    pwd: 'admin',
    avatar: '/images/user-ava.jpg',
    favoriteCategoty: [],
    address: {street:'', ward: '', district: '', city: ''},
    activities: [],
    notifications: [],
    role: 5,
    likes: 0,
    comments: 0,
    shares: 0,
};

UserDB.create(data, function (err, id) {
    if (err) {
        console.log("Faied to create admin account")
    } else {
        console.log("Create admin account success. ID: " + id);        
    }
});