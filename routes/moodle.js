'use strict';
const express = require('express')
const moodledb = require('../db/moodle')
const convertJSON = require('../middleware/convert_bigint')

const router = express.Router()

const select_users_sql = `SELECT 
id
, username as user_name
, firstname as first_name
, lastname as last_name
, DATE_FORMAT(FROM_UNIXTIME(timecreated), '%Y-%m-%d %H:%i:%s') as created_at
, DATE_FORMAT(FROM_UNIXTIME(lastaccess), '%Y-%m-%d %H:%i:%s') as last_access
FROM mdl_user`

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