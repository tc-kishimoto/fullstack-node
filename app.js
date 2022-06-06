'use strict'
const express = require('express')
const app = express()
require('dotenv').config()

app.use(express.json())

app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", process.env.ACCESS_CONTROL_ALLOW_ORIGIN);
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});

app.use('/api/questions', require('./routes/questions'))

app.listen(process.env.LISTEN_PORT)
