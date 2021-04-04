// const mysql = require('mysql');

const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'nodejs'
});

connection.connect((err) => {
  if (!!err) {
    console.log(err);
  } else {
    console.log("Mysql Connected!");
  }
});
module.exports = connection;