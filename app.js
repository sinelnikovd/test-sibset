'use strict';
const express = require('express');
const datetime = require('node-datetime');
const bodyParser = require("body-parser");
const db = require('./db')
const app = express();

db.connect((err) => {if(err) throw err;});

app.set('view engine', 'pug');
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.get('/', (req,res) => {
  let data = {
    subscriber: [],
    call: [],
    tag: []
  };
  db.query('SELECT * FROM `subscriber`', (err,result) => {
    if (err) throw err;
    for(let i in result){
      data.subscriber.push({id: result[i].id_contract, firstname: result[i].firstname, lastname: result[i].lastname});
    }
    db.query('SELECT * FROM `call`', (err,result) => {
      if (err) throw err;
      for(let i in result){
        data.call.push({id: result[i].id, id_contract: result[i].id_contract, datetime: datetime.create(result[i].datetime).format('d.m.Y H:M:S')});
      }
      db.query('SELECT * FROM `tag`', (err,result) => {
        if (err) throw err;
        for(let i in result){
          data.tag.push({id: result[i].id, title: result[i].title});
        }
        res.render('index', data);
      });
    });
  });
});

app.post('/', (req,res) => {
  let idContract = req.body.id;

  /*
    SELECT 
        *
    FROM
        `call`
    WHERE
        `call`.`id` IN (SELECT 
                `call_tag`.`id_call`
            FROM
                `call_tag`
            GROUP BY `call_tag`.`id_call`
            HAVING COUNT(*) > 2)
  */

  db.query('SELECT `call`.* FROM `call` JOIN (SELECT `call_tag`.`id_call`, count(*) AS `cnt` FROM `call_tag` GROUP BY `call_tag`.`id_call` HAVING `cnt` > 2) AS `call_tag_count` ON `call_tag_count`.`id_call` = `call`.`id` WHERE `call`.`id_contract` = '+idContract, (err,result) => {
    if (err) throw err;
    let calls = [];
    for(let i in result){
      calls.push({id: result[i].id, datetime: datetime.create(result[i].datetime).format('d.m.Y H:M:S')});
    }
    res.render('index', {calls: calls});
  });

});

app.listen(3000, () => console.log('Сервер работает'));
