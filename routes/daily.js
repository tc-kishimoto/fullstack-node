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

// 登録
async function register(data) {
  try {
      console.log(data);
      await client.connect();
      const database = client.db("fullstack");
      const questions = database.collection("daily");

      const doc = {
          ...data
      }

      const result = await questions.insertOne(doc);

  } finally {
      await client.close();
  }
}

module.exports = router