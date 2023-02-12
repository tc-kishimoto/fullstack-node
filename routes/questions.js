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
.get((req, res) => {
    find(req.query).then(data => {
        console.log(data)
        res.json(data)
    });
})
.put((req, res) => {
    update(req.body.id, req.body).then(() => res.status(200));
})
.delete((req, res) => {
    deleteQuestion(req.body.id).then(() => res.status(200));
})

// 登録
async function register(data) {
    try {
        // console.log(data)
        await client.connect();
        const database = client.db("fullstack");
        const questions = database.collection("questions");

        const doc = {
            ...data
        }

        const result = await questions.insertOne(doc);

        // console.log(result)

    } finally {
        await client.close();
    }
}

// 検索
async function find(params) {
    try {
        console.log(params)
        await client.connect();
        const database = client.db("fullstack");
        const questions = database.collection("questions");
        let query;
        let result;
        const options = {
            sort: { _id: 1},
            projection: { 
                _id: 1, 
                category: 1, 
                unit: 1, 
                title: 1, 
                type: 1,
                text: 1,
                commentary: 1,
                answer: 1,
            },
        }
        if('id' in params) {
            query = { _id: ObjectId(params.id)}
            return await questions.findOne(query, options) 
        } else {
            query = { ...params }
            result = questions.find(query, options)
            return await result.toArray()
        }
        
        // console.log(await result.toArray())
    
    } finally {
        await client.close();
    }
}

// 更新
async function update(id, params) {
    try {

        await client.connect();
        const database = client.db("fullstack");
        const questions = database.collection("questions");
    
        const filter = {
            _id: id
        }
    
        const options = { upsert: true };

        const updateDoc = {
            $set: {
                ...params
            },
        };

        const result = await questions.updateOne(filter, updateDoc, options);

    } finally {
        await client.close();
    }
}

// 削除
async function deleteQuestion(id) {
    try {
        await client.connect();
        const database = client.db("fullstack");
        const questions = database.collection("questions");

        const query = { _id: id };

        const result = await questions.deleteOne(query);
        if (result.deletedCount === 1) {
            console.log("Successfully deleted one document.");
        } else {
            console.log("No documents matched the query. Deleted 0 documents.");
        }

    } finally {
        await client.close();
    }
}

module.exports = router