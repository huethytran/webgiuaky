var mongoose = require("mongoose"); // The reason for this demo.
var assert = require('assert');
var uristring = 'mongodb+srv://minhnthai:nhatminh1997@cluster0-5u7gv.mongodb.net/test?retryWrites=true'

mongoose.connect(uristring, { useNewUrlParser: true, useFindAndModify: false });

// var Schema = mongoose.Schema;
// var shapeSchema = new Schema({
//   name: String
// },
//    { discriminatorKey: 'kind' }
// );

// var Shape = mongoose.model('Shape', shapeSchema);

// var Circle = Shape.discriminator('Circle',
//   new Schema({ radius: Number }));
// var Square = Shape.discriminator('Square',
//   new Schema({ side: Number }));

// var shapes = [
//   { name: 'Test' },
//   // { kind: 'Circle', radius: 5 },
//   // { kind: 'Square', side: 10 }
// ];

// Shape.create(shapes, function (error, shapes) {
//   assert.ifError(error);
//   assert.ok(shapes[0] instanceof Shape);
//   // assert.ok(shapes[1] instanceof Circle);
//   // assert.equal(shapes[1].radius, 5);
//   // assert.ok(shapes[2] instanceof Square);
//   // assert.equal(shapes[2].side, 10);


//   Shape.findOneAndUpdate({ name: 'Test' }, { name: 'asd', kind: 'Square' },{new: true}, (err, shape) => {
//     if (err) console.log(err);
//     else {
//       console.log(shape);
//       Square.findOneAndUpdate({ name: 'asd' }, {side: 10 },{new: true}, (err, shape) => {
//       if (err) return console.log(err);

//       Shape.findById({ name: 'asd' }, (err, record) => {
//         if (err) return console.log(err);
//         console.log(record);
//       })
//     })

//   }
//   })

// });

// var PostDB = require("./models/Post");

// PostDB.home().then(res => {
//   console.log(res.newPosts.length);
//   console.log(res.mostViewPosts.length);
//   console.log(res.top10Cate.length);
//   console.log(res.hotNewsInWeek.length);
// })

var UserDB = require('./models/User');

UserDB.get({ role: 3 }, (err, records) => {
  if (err) return console.log(err);

  records.forEach(el => {
    var a = new Date();
    a.setHours(a.getHours() + 7*24);
    UserDB.update(el._id, { expDate: a, kind: 'Subcriber' }, (err, record) => {
      if (err) return res.status(500).send(err);
      console.log(`Success update: ${el._id}: expDate: ${record.expDate}| remainDay: ${record.remainDay}`);
    })
  })
})