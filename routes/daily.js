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
  common.findById(collectionName, req.params.id)
  .then(data => {
    res.json(data)
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

router.route('/copy/:id')
.post((req, res) => {
  copy(req.params.id).then(data => {
    res.json(data)
  })
})

// コピー
async function copy(id) {
  const daily = await common.findById(collectionName, id)

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