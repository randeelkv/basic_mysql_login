const express = require("express");
const path = require("path");
const mysql = require("mysql");
const dotenv = require("dotenv");
const cookieparser = require("cookie-parser");


dotenv.config({path:'./.env'});

const app = express();
const db = mysql.createConnection({
    host:process.env.DB_HOST,
    user: process.env.DB_USER,
    password:process.env.DB_PW,
    database:process.env.DATABASE
});
const publicDirectory = path.join(__dirname,'./public');
app.use(express.static(publicDirectory));
// Pass URL encorded bodies 
app.use(express.urlencoded({
    extended:false
}));
app.use(express.json());
app.use(cookieparser());
app.set('view engine','hbs');

db.connect((err) => {
    if(err){
        console.log(err);
    }
    else{
        console.log('Mysql Connection Successful');
    }
});

//Deifine Routers
app.use('/',require('./routes/pages'));
app.use('/auth',require('./routes/auth'));

app.listen(5000,() => {
    console.log("Server Started");
});