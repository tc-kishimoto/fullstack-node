'use strict'
const express = require('express')
const app = express()
const cors = require('cors')
require('dotenv').config()

app.use(express.json())
app.use(cors())

// app.use(function(req, res, next) {
//     res.header("Access-Control-Allow-Origin", "*");
//     res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
//     next();
// });

app.use('/api/questions', require('./routes/questions'))

app.listen(process.env.LISTEN_PORT)
