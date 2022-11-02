require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const User = require('./model/user');
const bcrypt = require('bcrypt');
const Message = require('./model/message')

const app = express();

app.use(bodyParser.urlencoded({extended: true}))

// make some files accessable(public)
app.use(express.static("public"));

// set view engine to ejs
app.set('view engine', 'ejs');

//connect to mongoose
// mongoose.connect("mongodb://localhost:27017/messageDB")
mongoose.connect(process.env.MONGODB);

app.get("/", function(req, res){
    res.render("index");
});

app.post("/", async (req, res) =>{
    const name = req.body.name;
    const email = req.body.email;
    const subject = req.body.subject;
    const msg = req.body.message;

    try{
        const response = await Message.create({
            name,
            email,
            subject,
            msg
        });
    } catch(err){
        throw err
    }
    res.render("message", {nameEJS: name, emailEJS: email, subjectEJS: subject, msgEJS: msg});
});

//home
app.get("/home", function(req, res){
    res.render("index")
});

//about
app.get("/about", function(req, res){
    res.render("about")
});

//skills
app.get("/skills", function(req, res){
    res.render("skills")
});

//contact
app.get("/contact", function(req, res){
    res.render("contact")
});

//admin login
let credsError;
app.get("/uid_killo-admin", function(req, res){
    //credds = null
    res.render("admin_panel", {
        credsError: credsError
    });
});

app.post("/admin_panel", function(req, res){
    const username = req.body.user;
    const password = req.body.pass;

    User.findOne({username: username}, async(err, credsFound) => {
        if(err){
            console.log(err)
        }
        else{
            if(credsFound){
                if(await bcrypt.compare(password, credsFound.password)){
                    // res.render("admin")

                    // find messages and render them in the admin
                    let messageArray = [];
                    Message.find({}, function(err, message){
                        //reverse the array and set to a new variable
                        //reverse used to put the last message on the top by reversing the array index.
                        messageArray = message.reverse();
                        res.render("admin",{
                            messageEJS: messageArray
                        });
                    });
                    app.post("/deleteMessage", function(req, res){
                        // console.log(req.body.deleteButton)
                        const deleteMessageID = (req.body.deleteButton).trim();
                        // console.log(deleteMessageID);
                        Message.findByIdAndRemove(deleteMessageID, function(err){
                            if(err){
                                console.log(err)

                            }else{
                                res.redirect("uid_killo")
                            }
                        });
                    });
                }else{
                    credsError = "Wrong Username or Password!"
                    // res.send("<h1>worng username or password<h1/>")
                    res.render("admin_panel", {
                        credsError: credsError
                    });
                }
            }else{
                credsError = "Wrong Username or Password!"
                // res.send("<h1>worng username or password<h1/>")
                res.render("admin_panel", {
                    credsError: credsError
                });
            }
        }
    });
});



//404
app.get('*', function(req, res){
    res.status(404).render("404");
});

//listener
app.listen(8000, function(){
    console.log("Server listening on port 8000");
});
//done