'use strict'
const express = require('express')
const req = require('express/lib/request')
const { MongoClient } = require('mongodb')
require('dotenv').config()

const router = express.Router()
const client = new MongoClient(process.env.MONGODB_URI);

router.route('/').post((req, res) => {
    run(req).catch(console.dir);
})

async function run(req) {
    try {
        // console.log(req.body)
        await client.connect();

        const database = client.db("fullstack");
        const question = database.collection("questions");

        const doc = {
            title: req.body.title,
        }

        const result = await question.insertOne(doc);

        console.log(result)

    } finally {
        await client.close();
    }
}

module.exports = router