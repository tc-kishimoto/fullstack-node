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

const select_quiz_user = `
SELECT 
mqa.id
, mu.id user_id
, username user_name
, concat(lastname, firstname) full_name
, mc.shortname course_name
, mcs.name section_name
, mq.name test_name
, mqa.sumgrades score
, quiz_avg.avg_score
, mq.grade max_score
, DATE_FORMAT(FROM_UNIXTIME(mqa.timefinish), '%Y-%m-%d %H:%i:%s') finish_date
, mqa.attempt
FROM mdl_user mu 
JOIN mdl_quiz_attempts mqa
ON mu.id = mqa.userid
JOIN mdl_quiz mq 
ON mqa.quiz = mq.id
JOIN mdl_course mc 
ON mq.course = mc.id 
JOIN mdl_course_modules mcm 
ON mq.course = mcm.course 
AND mq.id = mcm.instance
JOIN mdl_course_sections mcs 
ON mcm.course = mcs.course 
AND mcm.section = mcs.id
JOIN (select quiz, AVG(sumgrades) avg_score from mdl_quiz_attempts where attempt = 1 group by quiz) quiz_avg
ON mqa.quiz = quiz_avg.quiz
WHERE mu.id = ?
AND mcm.module = 18
`

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

router.route('/test-result/user/:userId')
.get(convertJSON, (req, res) => {
  moodledb.query(select_quiz_user,[req.params.userId])
  .then((data) => {
    res.json(data)
  })
  .catch(error => {
    console.log(error)
  })
})

module.exports = router