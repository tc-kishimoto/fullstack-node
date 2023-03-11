'use strict';
const express = require('express')
const moodledb = require('../db/moodle')
const convertJSON = require('../middleware/convert_bigint')

const router = express.Router()

const select_users_sql = `SELECT * FROM mdl_user`

router.route('/users')
.get(convertJSON, (req, res) => {
  moodledb.query(select_users_sql)
  .then((data) => {
    res.json(data)
  })
  .catch(error => {
    console.log(error)
  })
})

module.exports = router