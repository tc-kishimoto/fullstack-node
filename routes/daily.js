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

// 検索
async function find() {
  try {
    await client.connect();
    const database = client.db("fullstack");
    const daily = database.collection("daily");

    const query = {
      _id: id,
    };

    const options = {
      projection: {
        _id: 1,
        date: 1,
      }
    }

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

module.exports = router