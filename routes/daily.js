'use strict'
const express = require('express');
const mongo = require('../db/mongo');
const { validateDaily } = require('../middleware/validation');
require('dotenv').config()

const collectionName = 'daily';

const router = express.Router()

const formatDate = (date) => {
  return `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`
}

router.route('/')
.post((req, res) => {
  const body = req.body
  mongo.insertOne(collectionName, body)
  .then((data) => {    
    res.json(data)
})
  .catch(console.dir);
})

router.route('/:id')
.get((req, res) => {
  mongo.findById(collectionName, req.params.id)
  .then(data => {
    if(data === null) {
      res.status(404).send('404 Not Found')
    } else {
      res.json(data)
    }
  })
})
.put(validateDaily, (req, res) => {
  mongo.updateOne(collectionName, req.params.id, req.body)
  .then(() => {
    mongo.findById(collectionName, req.params.id)
    .then(data => {
      res.json(data)
    }).catch((error) => {
      console.log(error)
      // レスポンス返す
      res.status(200).send('OK')
    })
})
  .catch(console.dir);
})
.delete((req, res) => {
  mongo.deleteOne(collectionName, req.params.id)
    .then(() => res.status(200).send('OK'))
  .catch(console.dir);
})

router.route('/draft/:id')
.put((req, res) => {
  mongo.updateOne(collectionName, req.params.id, req.body)
  .then(() => {
    mongo.findById(collectionName, req.params.id)
    .then(data => {
      res.json(data)
    }).catch((error) => {
      console.log(error)
      // レスポンス返す
      res.status(200).send('OK')
    })
  })
})

router.route('/user/:userId/:id')
.get((req, res) => {
  mongo.findById(collectionName, req.params.id)
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
  const daily = await mongo.findById(collectionName, id)

  delete daily._id;
  const today = new Date();
  daily.date = formatDate(today);
  daily.year = today.getFullYear();
  daily.month = today.getMonth() + 1;
  daily.day = today.getDate();

  const result = await mongo.insertOne(collectionName, daily);
  return result;

}

module.exports = router