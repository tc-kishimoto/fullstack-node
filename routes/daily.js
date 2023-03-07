'use strict'
const express = require('express')
const common = require('../db/common');
const { v4: uuidv4 } = require('uuid');
require('dotenv').config()

const collectionName = 'daily';

const router = express.Router()

const formatDate = (date) => {
  return `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`
}

router.route('/')
.post((req, res) => {
  const body = req.body
  body._id = uuidv4();
  common.insertOne(collectionName, body)
  .then((data) => {
    res.json(data)
})
  .catch(console.dir);
})

router.route('/:id')
.get((req, res) => {
  common.findByUUId(collectionName, req.params.id)
  .then(data => {
    if(data === null) {
      res.status(404).send('404 Not Found')
    } else {
      res.json(data)
    }
  })
})
.put((req, res) => {
  common.updateOne(collectionName, req.params.id, req.body)
  .then(() => res.status(200).send('OK'))
  .catch(console.dir);
})
.delete((req, res) => {
  common.deleteOne(collectionName, req.params.id)
    .then(() => res.status(200).send('OK'))
  .catch(console.dir);
})

router.route('/user/:userId/:id')
.get((req, res) => {
  common.findByUUId(collectionName, req.params.id)
  .then(data => {
    if(data === null || req.params.userId !== data.user_id) {
      res.status(404).send('404 Not Found')
    } else {
      res.json(data)
    }
  })
})

router.route('/copy/:id')
.post((req, res) => {
  copy(req.params.id).then(data => {
    res.json(data)
  })
})

// コピー
async function copy(id) {
  const daily = await common.findByUUId(collectionName, id)

  delete daily._id;
  const today = new Date();
  daily.date = formatDate(today);
  daily.year = today.getFullYear();
  daily.month = today.getMonth() + 1;
  daily.day = today.getDate();
  daily._id = uuidv4();

  const result = await common.insertOne(collectionName, daily);
  return result;

}

module.exports = router