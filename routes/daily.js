'use strict'
const express = require('express')
const { MongoClient, ObjectId } = require('mongodb')
require('dotenv').config()

const router = express.Router()
const client = new MongoClient(process.env.MONGODB_URI);

router.route('/')
.post((req, res) => {
  register(req.body).then(() => res.status(200).send('OK'))
  .catch(console.dir);
})

router.route('/:id')
.get((req, res) => {
  find(req.params.id).then(data => {
    res.json(data)
  })
})
.put((req, res) => {
  update(req.params.id, req.body).then(() => res.status(200).send('OK'))
  .catch(console.dir);
})

// 検索
async function find(id) {
  try {
    await client.connect();
    const database = client.db("fullstack");
    const daily = database.collection("daily");

    const query = {
      _id: ObjectId(id),
    };

    const options = {
      projection: {
        _id: 1, 
        user_id: 1,
        date: 1,
        manner1: 1,
        manner2: 1,
        manner3: 1,
        manner4: 1,
        speech_theme: 1,
        speech_task: 1,
        speech_notice: 1,
        speech_solution: 1,
        main_overview: 1,
        main_achievement: 1,
        main_review: 1,
        main_review_cause: 1,
        main_solution: 1,
        free_description: 1,
      }
    }

    return await daily.findOne(query, options);

  } finally {
    await client.close();
  }
}

// 登録
async function register(data) {
  try {
      await client.connect();
      const database = client.db("fullstack");
      const daily = database.collection("daily");

      const doc = {
          ...data
      }

      const result = await daily.insertOne(doc);

  } finally {
      await client.close();
  }
}

// 更新
async function update(id, data) {
  try {
    await client.connect();
    const database = client.db("fullstack");
    const daily = database.collection("daily");

    const filter = { _id: ObjectId(id) };
    const options = { upsert: true };

    const updateDoc = {
      $set: {
        manner1: data.manner1,
        manner2: data.manner2,
        manner3: data.manner3,
        manner4: data.manner4,
        speech_theme: data.speech_theme,
        speech_task: data.speech_task,
        speech_notice: data.speech_notice,
        speech_solution: data.speech_solution,
        main_overview: data.main_overview,
        main_achievement: data.main_achievement,
        main_review: data.main_review,
        main_review_cause: data.main_review_cause,
        main_solution: data.main_solution,
        free_description: data.free_description,
      },
    };

    const result = await daily.updateOne(filter, updateDoc, options);

  } finally {
      await client.close();
  }
}

module.exports = router