'use strict';
const mysql = require('mysql');
const connection = mysql.createConnection({
  host: 'localhost',
  user: 'sibset-test',
  password: 'Sibset123456',
  database: 'sibset-test'
});

module.exports = connection;

