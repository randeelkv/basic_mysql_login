const express = require("express");
const mysql = require("mysql");

const app = express();
const db = mysql.createConnection({
    host:'localhost',
    user: 'root',
    password:'',
    database:'user_db_node_sql'
});

db.connect((err) => {
    if(err){
        console.log(err);
    }
    else{
        console.log('Mysql Connection Successful');
    }
});

app.get("/",(req,res) => {
    res.send("<h1>Hello Randeel</h1>");
});

app.listen(5000,() => {
    console.log("Server Started");
})