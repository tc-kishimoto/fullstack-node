'use strict';
const express = require('express')
const { MongoClient } = require('mongodb')
require('dotenv').config()

const router = express.Router()
const client = new MongoClient(process.env.MONGODB_URI);

router.route('/')
.post((req, res) => {
  register(req.body).then((data) => {
    res.json(data)
    // res.status(200).send('OK')
})
  .catch(console.dir);
})

router.route('/:userId')
.get((req, res) => {
  findByUserId(req.params.userId).then((data) => {
    res.json(data)
  })
})


// 登録
async function register(data) {
  try {
      await client.connect();
      const database = client.db("fullstack");
      const submission = database.collection("submission");

      const now = new Date();

      const doc = {
        ...data,
        date: `${now.getFullYear()}-${now.getMonth() + 1}-${now.getDate()}`,
        created_at: `${now.getFullYear()}-${now.getMonth() + 1}-${now.getDate()} ${now.getHours()}:${now.getMinutes()}:${now.getSeconds()}`
      }

      const result = await submission.insertOne(doc);

      return result;
  } catch(error) {
    console.log(error);
  } finally {
      await client.close();
  }
}

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