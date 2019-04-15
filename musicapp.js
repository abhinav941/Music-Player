var assert = require('assert');
var fs = require('fs');
var grid = require('gridfs');
var express = require("express");
var app = express();
var bodyParser = require("body-parser");
var urlencodedParser = bodyParser.urlencoded({ extended: true })
var mongodb = require("mongodb");

var mongoClient = mongodb.MongoClient;
var url = "mongodb://localhost:27017/abhishek";
app.set("view engine", "ejs");
app.use("/assets", express.static("assets"))

app.get("/login", function(req, res) {
    res.render("login", { error: '', errpass: '' });
});

app.get("/register", function(req, res) {
    res.render("register", { error: '', errpass: '' });
});

app.post("/login", urlencodedParser, function(req, res) {
    mongoClient.connect(url, { useNewUrlParser: true }, function(err, db) {
        var db = db.db("abhishek");
        var collection = db.collection("register");
        var username = req.body.username;
        var password = req.body.password;

        var cursor = collection.find({ "username": username.toString() }).limit(1).toArray(function(err, doc) {

            if (doc.length != 0) {
                if (doc[0].password == password) {
                    res.render("musicplayer", { error: doc[0], errpass: '' });
                } else {
                    res.render("login", { error: '', errpass: 'Incorrect Password.' });
                }
            } else {
                res.render("login", { error: '', errpass: 'You have not register. Register First. ' });
            }
        });
    });
    console.log("connected");
});




app.post("/register", urlencodedParser, function(req, res) {
    mongoClient.connect(url, { useNewUrlParser: true }, function(error, db) {


        var db = db.db("abhishek");
        var collection = db.collection("register");
        var userid = req.body.userid;
        var username = req.body.username;
        var password = req.body.password;
        var confirm = req.body.confirm;
        var dob = req.body.dob;
        req.body.type = "R";


        var cursor = collection.find({ "username": username.toString() }).limit(1).toArray(function(err, doc) {

            if (doc.length != 0) {
                res.render("register", { error: doc[0], errpass: '' });
            } else if (!(3 < password.length && password.length < 16)) {
                res.render("register", { error: '', errpass: 'password length should be in the range 4-15' });
            } else if (password != confirm) {
                res.render("register", { error: '', errpass: 'check your password' });
            } else {

                collection.insertOne(req.body);
                console.log(" :: Details Saved :: ");
                res.render("thanks");
                setTimeout(function() {
                    global.location = "/login";
                }, 2000);
            }
        });
    });
    console.log("connected");
});


app.listen(3030);
console.log("server is running");