'use strict';
const express = require('express');
const mongo = require('../db/mongo');

const collectionName = 'quizAnswer';

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


module.exports = router