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
app.use('/api/weekly', require('./routes/weekly'))
app.use('/api/dailies', require('./routes/dailies'))
app.use('/api/weeklies', require('./routes/weeklies'))
app.use('/api/submission', require('./routes/submission'))
app.use('/api/test-result', require('./routes/testResult'))
app.use('/api/quiz-answer', require('./routes/quizAnswer'))
app.use('/api/moodle', require('./routes/moodle'))

app.listen(process.env.LISTEN_PORT)
