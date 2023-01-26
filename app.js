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
// connection.query(
//     'SELECT * FROM airbnb.exchangeTickers', function (err, results, fields) {
//         console.log(results); // results contains rows returned by server
//         //console.log(fields); // fields contains extra meta data about results, if available
//     });


//load all symbols with listingStatus=trading into array "previouseTickers"
const previouseTicker = [];
connection.query(
    'SELECT * FROM airbnb.exchangeTickers', function (err, results, fields) {
        for (let i = 0; i < results.length; i++) {
            if (results[i].listingStatus === "trading") {
                previouseTicker.push(results[i].symbol);
            }
        }
        console.log(previouseTicker);
    });


//disconnect
connection.end();