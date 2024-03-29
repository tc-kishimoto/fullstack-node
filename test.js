'use strict'
const express = require('express')
const app = express()
const cors = require('cors')
require('dotenv').config()

app.use(express.json())
app.use(cors())

app.use(require('./middleware/cors'));

app.use('/api/questions', require('./routes/questions'))
app.use('/api/elasticsearch', require('./routes/elasticsearch'))
app.use('/api/daily', require('./routes/daily'))
app.use('/api/dailies', require('./routes/dailies'))
app.use('/api/submission', require('./routes/submission'))

// test用DB起動
const { MongoMemoryServer } = require('mongodb-memory-server');
const mongod = new MongoMemoryServer({ 
  instance: {
    port: Number(process.env.TEST_DB_PORT),
    ip: process.env.TEST_DB_HOST,
    dbName: process.env.DATABASE_NAME,
  }
})
  mongod.start().then(() => {
    const uri = mongod.getUri();
    process.env.MONGODB_TEST_URI = uri
    console.log(uri)
  })

app.listen(process.env.LISTEN_PORT)

