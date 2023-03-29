'use strict';
const express = require('express');
const mongo = require('../db/mongo');

const collectionName = 'quizAnswer';

const router = express.Router()

router.route('/')
.post((req, res) => {
  mongo.insertOne(collectionName, req.body)
  .then((data) => {  
    res.json(data)
})
  .catch(console.dir);
})

router.route('/:id')
.put((req, res) => {
  mongo.updateOne(collectionName, req.params.id, req.body)
  .then((data) => {    
    res.json(data)
})
  .catch(console.dir);
})

module.exports = router