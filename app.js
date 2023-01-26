//load variables from dotenv
require('dotenv').config()
//import mysql connector for mariaDB
const mysql = require('mysql2');


//create connection to database
const connection = mysql.createConnection({
    host: process.env.host,
    user: process.env.user,
    password : process.env.password,
    database : process.env.database
});

//connect
connection.connect();

//simple query
connection.query(
    'SELECT * FROM airbnb.exchangeTickers', function (err, results, fields) {
        console.log(results); // results contains rows returned by server
        console.log(fields); // fields contains extra meta data about results, if available
    });


//create ticker table


//disconnect
connection.end();