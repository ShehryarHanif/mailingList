require("dotenv").config();

const express = require("express");
const mysql = require("mysql");
const path = require("path");

const connectionRequirements = {
    host : process.env.DB_HOST,
    user : process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database : process.env.DB_DATABASE
}

console.log(connectionRequirements);

const connection = mysql.createConnection(connectionRequirements);

const app = express();

app.use(express.static(path.resolve(__dirname + "/public")));
app.use(express.urlencoded({extended : false}));

app.set("view engine", "ejs");

app.get("/", function(req, res){
    const queryString = "SELECT COUNT(*) as count FROM users";

    connection.query(queryString, function(error, results){
        if (error){
            res.send("There was a problem.");
        } else {
            const count = results[0]["count"];

            res.render("home", {data: count});
        }
    });
});
 
app.get("/count", function(req, res){
    const queryOne = "SELECT COUNT(*) as count FROM users";

    const queryTwo = "SELECT email FROM users ORDER BY created_at DESC LIMIT 10";

    connection.query(queryOne, function (error, results){
        if(error){
            res.send("There was a problem.");
        } else {
            const count = results[0]["count"];

            connection.query(queryTwo, function(err, extraResults){
                if(err){
                    res.send("There was a problem.")
                } else{
                    const requiredResults = extraResults.map(singleResult => singleResult["email"]);

                    console.log(requiredResults);

                    res.render("count", {data: count, resultsList: requiredResults});
                }
            })
        }
    });
});
 
app.post("/register", function(req, res){
    const newEmail = req.body["email"];

    // Note that you technically don't need to purposedly set the time of creation since the default value in the MySQL schema is the current time

    const currentTime = new Date();

    const newUser = {
        "email" : newEmail,
        "created_at" : currentTime
    };

    const queryString = "INSERT INTO users SET ?";

    connection.query(queryString, newUser, function (error){
        if (error){
            res.redirect("/");
        } else {
            res.redirect("/count");
        }
    });
});

app.get("/*", function(req, res){
    res.redirect("/");
});

app.listen(process.env.PORT || 3000, function () {
    console.log("The application has started!");
});