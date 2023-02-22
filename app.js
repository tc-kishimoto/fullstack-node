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

app.listen(process.env.LISTEN_PORT)
