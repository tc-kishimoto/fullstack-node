'use strict';
const express = require('express')
const { MongoClient, ObjectId } = require('mongodb')
require('dotenv').config()

const router = express.Router()
const client = new MongoClient(process.env.MONGODB_URI);

router.route('/:userId/:year/:month')
.get((req, res) => {
  find(req.params).then(data => {
      res.json(data)
  });
})

async function find(params) {
  try {
    await client.connect();
    const database = client.db("fullstack");
    const dailies = database.collection("daily");

    const query = {
      user_id: Number(params.userId),
      date: { $regex: new RegExp('^' + `${params.year}-${params.month}`)},
    };
    const options = {
      sort: { _id: 1},
      projection: { 
        _id: 1, 
        user_id: 1,
        date: 1,
      },
    }

    const result = await dailies.find(query, options).toArray();
    return result;
  } finally {
      await client.close();
  }
}

module.exports = router