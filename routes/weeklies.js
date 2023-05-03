'use strict';
const express = require('express')
const mongo = require('../db/mongo')
require('dotenv').config()

const collectionName = 'weekly';

const router = express.Router()

router.route('/:userId/:year/:month')
.get((req, res) => {
  const filter = {
    user_id: req.params.userId,
    year: Number(req.params.year),
    month: Number(req.params.month),
    deleted_at: { $exists: false},
  };
  mongo.find(collectionName, filter)
  .then(data => {
      res.json(data)
  });
})

module.exports = router