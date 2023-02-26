'use strict';
const express = require('express')
const common = require('../db/common')
require('dotenv').config()

const router = express.Router()

const collectionName = 'submission';

router.route('/')
.post((req, res) => {
  const now = new Date()
  common.insertOne(collectionName, {
    ...req.body,
    date: `${now.getFullYear()}-${now.getMonth() + 1}-${now.getDate()}`,
  })
  .then((data) => {
    res.json(data)
  })
  .catch(console.dir);
})

router.route('/:id')
.get((req, res) => {
  common.findById(collectionName, req.params.id)
  .then((data) => {
    res.json(data)
  })
  .catch(console.dir);
})
.put((req, res) => {
  common.updateOne(collectionName, req.params.id, req.body)
  .then((data) => {
    res.json(data)
  })
  .catch(console.dir);
})

router.route('/user/:userId')
.get((req, res) => {
  const filter = {
    user_id: Number(req.params.userId),
    deleted_at: { $exists: false},
  }
  common.find(collectionName, filter)
  .then((data) => {
    res.json(data)
  })
  .catch(console.dir);
})

router.route('/:userId/:category/:lessonType/:lessonName')
.get((req, res) => {
  const filter = 
    {
      user_id: Number(req.params.userId),
      category: req.params.category,
      lesson_type: req.params.lessonType,
      lesson_name: req.params.lessonName,
    };
  common.findOne(collectionName, filter)
  .then((data) => {
    res.json(data)
  })
  .catch(console.dir);
})

module.exports = router