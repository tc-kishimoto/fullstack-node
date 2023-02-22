'use strict';
const express = require('express')
const common = require('../db/common')
const { MongoClient } = require('mongodb')
require('dotenv').config()

const router = express.Router()
const client = new MongoClient(process.env.MONGODB_URI);

const collectionName = 'submission';

router.route('/')
.post((req, res) => {
  common.insertOne(collectionName, req.body)
  .then((data) => {
    res.json(data)
  })
  .catch(console.dir);
})

router.route('/id')
.put((req, res) => {

})

router.route('/:userId')
.get((req, res) => {
  findByUserId(req.params.userId).then((data) => {
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

async function findByUserId(userId) {
  try {
    await client.connect();
    const database = client.db("fullstack");
    const submission = database.collection("submission");

    const query = {
      user_id: Number(userId),
      deleted_at: { $exists: false},
    };
    const options = {
      sort: { created_at: 1},
      projection: { 
        _id: 1, 
        user_id: 1,
        category: 1,
        lesson_type: 1,
        lesson_name: 1,
        url: 1,
        comment: 1,
        date: 1,
        created_at: 1,
      },
    }

    const result = await submission.find(query, options).toArray();
    return result;
  } finally {
      await client.close();
  }
}


module.exports = { router, findByUserId }