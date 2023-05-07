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

router.route('/company/:companyId')
.get((req, res) => {
  const filter = {
    company_id: req.params.companyId,
    deleted_at: { $exists: false},
  };
  const options = {
    sort: { date: -1},
  }
  mongo.find(collectionName, filter, options)
  .then(data => {
      res.json(data)
  });
})

router.route('/course/:couseId')
.get((req, res) => {
  const filter = {
    course_id: req.params.couseId,
    deleted_at: { $exists: false},
  };
  const options = {
    sort: { date: -1},
  }
  mongo.find(collectionName, filter, options)
  .then(data => {
      res.json(data)
  });
})

router.route('/user/:userId')
.get((req, res) => {
  const filter = {
    user_id: req.params.userId,
    deleted_at: { $exists: false},
  };
  const options = {
    sort: { date: -1},
  }
  mongo.find(collectionName, filter, options)
  .then(data => {
      res.json(data)
  });
})


module.exports = router