'use strict'
const express = require('express')
const { MongoClient } = require('mongodb')
require('dotenv').config()

const router = express.Router()
const client = new MongoClient(process.env.MONGODB_URI);

router.route('/')
.post((req, res) => {
    register(req.body).then(() => res.status(200).send('OK'))
    .catch(console.dir);
})
.get((req, res) => {
    find(req.params).then(data => res.json(data))
})

async function register(data) {
    try {
        // console.log(req.body)
        await client.connect();
        const database = client.db("fullstack");
        const question = database.collection("questions");

        const doc = {
            ...data
        }

        const result = await question.insertOne(doc);

        // console.log(result)

    } finally {
        await client.close();
    }
}

async function find(params) {
    await client.connect();
    const database = client.db("fullstack");
    const questions = database.collection("questions");
    const query = {
        ...params
    }
    const options = {
        sort: { _id: 1},
        projection: {_id: 1, category: 1, unit: 1, title: 1, type: 1},
    }
    
    const result = questions.find(query, options)

    // console.log(await result.toArray())

    return await result.toArray();
}

module.exports = router