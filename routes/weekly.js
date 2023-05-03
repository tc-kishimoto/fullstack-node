'use strict'
const express = require('express');
const mongo = require('../db/mongo');
require('dotenv').config()

const collectionName = 'weekly';

const router = express.Router()

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
  .catch(console.dir);
})
.delete((req, res) => {
  mongo.deleteOne(collectionName, req.params.id)
    .then(() => res.status(200).send('OK'))
  .catch(console.dir);
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

module.exports = router