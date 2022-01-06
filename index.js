const express = require('express');
const app = express();
const mongoose = require('mongoose')

// const mongoDB = 'mongodb://asdsadasdasds:sadasd12312edasz@79.142.69.107:10000/Askit';
// const mongoDB = 'mongodb://localhost/Askit' mongodb+srv://Askit:rjGs2fAqPVwXQdH@cluster0.8ddr4.mongodb.net/myFirstDatabase?retryWrites=true&w=majority
// const mongoDB='mongodb+srv://Askit:rjGs2fAqPVwXQdH@cluster0.8ddr4.mongodb.net/myFirstDatabase?retryWrites=true&w=majority'
const mongoDB="mongodb://localhost/Askit"
mongoose.connect(mongoDB, { useNewUrlParser: true, useUnifiedTopology: true });
//Get the default connection
var db = mongoose.connection;
//Bind connection to error event (to get notification of connection errors)
db.on('open', () => {
    console.log('database connected')
})
db.on('error', console.error.bind(console, 'MongoDB connection error:'))
const passport = require('passport');
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use("/user", require('./routes/User'))
app.use("/post", require('./routes/post'))
app.use("/answer", require('./routes/comment'))
app.use("/category", require('./routes/category'))

// Passport middleware
app.use(passport.initialize());

// Passport Config
require('./config/passport')(passport);

//creating cron job for refreshing daily trandings 
const cron = require('node-cron');
//category schema
const cat = require('./schema/category')
cron.schedule('0 59 23 * * *', () => {
    cat.updateMany({}, { today_count: 0 }, { new: true })
        .exec((err, doc) => {
            if (err) console.log({ msg: "error while updating categories" });
            else console.log({ msg: "categories today's count is refreshed" });
        })
});
// const countVowels = str => Array.from(str)
//   .filter(letter => {
//     if(letter.includes('media')){
//       return "media"
//     }
//   });
// let string ="should media show graphic voilence? why or why not?"
// let word="media"
// if(string.includes(word)){
//   console.log("media");
// }

//fire base push notification
// const notification = require('./schema/notification')
const bodyparser = require('body-parser')
const { admin } = require('./firebase')
app.use(bodyparser.json())
const notification_options = {
    priority: "high",
    timeToLive: 60 * 60 * 24
};
app.post('/firebase/notification', (req, res) => {
    const registrationToken = req.body.registrationToken
    // const message = req.body.message
    const options = notification_options
    const message_notification = {
        notification: {
            title: req.body.title,
            body: req.body.message
        }
    };

    admin.messaging().sendToDevice(registrationToken, message_notification, options)
        .then(response => {
            let data = {
                brandid: req.body.brandid,
                buyerid: req.body.buyerid,
                notification: message_notification.notification
            }
            notification.create(data, (err, doc) => {
                if (err) console.log(err);
                else console.log(doc);
            })

            console.log(response);
            res.status(200).send("Notification sent successfully")

        })
        .catch(error => {
            console.log(error);
        });

})

const fs = require('fs')
const mime=require('mime')
const path=require('path');

app.get('/api/getFile:path', (req, res) => {
    try {
        var file =  __dirname + './uploads/' +req.params.path;
console.log(file);
        var filename = path.basename(file);
        var mimetype = mime.getType(file);

        res.setHeader('Content-disposition', 'attachment; filename=' + filename);
        res.setHeader('Content-type', mimetype);
        var filestream = fs.createReadStream(file);
        filestream.pipe(res);
    } catch (error) {
        return res.json(error)
    }
})


//deactivating poll
const post=require('./schema/posts');

const date= new Date()
// console.log(date);
cron.schedule('0 59 23 * * *', () => {
    post.updateMany({$and:[{poll:true},{'poll_detail.end_date':{$lt:date}}] },{'poll_detail.poll_status':false})
    .exec((err,doc)=>{
        if(err) console.log("error in updating poll status using cronjob index file",err);
        else console.log("poll status are updated",doc);
    })
});




// pratice
const Categroy = require('./nlp/model');
let category=Categroy.classify(`Should the media show graphic violence? Why or why not?`)
console.log(category);
app.get('/',(req,res)=> res.json("welcome mote"))
const PORT = process.env.PORT || 3000
app.listen(PORT, () => { console.log(`Server started at port ${PORT}`) })