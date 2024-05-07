const mysql = require('mysql2')

// Create the connection to database
const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    database: 'share-a-meal'
})

// A simple SELECT query
connection.query('SELECT `name` FROM `meal`', function (err, results, fields) {
    console.log(results) // results contains rows returned by server
    console.log(fields) // fields contains extra meta data about results, if available
})
connection.query(
    'SELECT `firstName` FROM `user`',
    function (err, results, fields) {
        console.log(results) // results contains rows returned by server
        console.log(fields) // fields contains extra meta data about results, if available
    }
)

// Using placeholders
connection.query(
    'SELECT * FROM `meal` WHERE `name` = ?',
    ['Zuurkool met spekjes'],
    function (err, results) {
        console.log(results)
    }
)
