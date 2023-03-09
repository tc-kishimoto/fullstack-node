'use strict';
const express = require('express')
const common = require('../db/common')
const axios = require('axios')
require('dotenv').config()

const router = express.Router()

const collectionName = 'submission';

router.route('/')
.post((req, res) => {
  const now = new Date()
  common.insertOne(collectionName, {
    ...req.body,
    date: `${now.getFullYear()}-${now.getMonth() + 1}-${now.getDate()}`,
  })
  .then((data) => {
    common.findById(collectionName, data.insertedId)
    .then(newData => {
      axios.post(`${process.env.API_URL}/notification/`, {
        source_user_id: newData.user_id,
        target: {
          name: 'lesson',
          id: newData._id,
          label: `${newData.lesson_type}：${newData.category}(${newData.lesson_name})`,
          action: '提出',
        }
      }).then(res => {  
        // console.log('日報通知:成功')
      }).catch(error => {
        // console.log('日報通知:error')
      })
    })

    res.json(data)
  })
  .catch(console.dir);
})

router.route('/:id')
.get((req, res) => {
  common.findById(collectionName, req.params.id)
  .then((data) => {
    if(data === null) {
      res.status(404).send('404 Not Found')
    } else {
      res.json(data)
    }
  })
  .catch(console.dir);
})
.put((req, res) => {
  common.updateOne(collectionName, req.params.id, req.body)
  .then((data) => {
    common.findById(collectionName, req.params.id)
    .then(newData => {
      axios.post(`${process.env.API_URL}/notification/`, {
        source_user_id: newData.user_id,
        target: {
          name: 'lesson',
          id: newData._id,
          label: `${newData.lesson_type}：${newData.category}(${newData.lesson_name})`,
          action: '再提出',
        }
      }).then(res => {  
        // console.log('日報通知:成功')
      }).catch(error => {
        // console.log('日報通知:error')
      })
    })

    res.json(data)
  })
  .catch(console.dir);
})
.delete((req, res) => {
  common.physicalDeleteOne(collectionName, req.params.id)
  .then((data) => {
    res.json(data)
  })
  .catch(console.dir);
})

router.route('/user/:userId')
.get((req, res) => {
  const filter = {
    user_id: req.params.userId,
    deleted_at: { $exists: false},
  }
  common.find(collectionName, filter)
  .then((data) => {
    res.json(data)
  })
  .catch(console.dir);
})

router.route('/company/:companyId')
.get((req, res) => {
  const filter = {
    company_id: req.params.companyId,
    deleted_at: { $exists: false},
  }
  common.find(collectionName, filter)
  .then((data) => {
    res.json(data)
  })
  .catch(console.dir);
})

router.route('/course/:courseId')
.get((req, res) => {
  const filter = {
    course_id: req.params.courseId,
    deleted_at: { $exists: false},
  }
  common.find(collectionName, filter)
  .then((data) => {
    res.json(data)
  })
  .catch(console.dir);
})

router.route('/:userId/:category/:lessonType/:lessonName')
.get((req, res) => {
  const filter = 
    {
      user_id: req.params.userId,
      category: req.params.category,
      lesson_type: req.params.lessonType,
      lesson_name: req.params.lessonName,
    };
  common.findOne(collectionName, filter)
  .then((data) => {
    res.json(data)
  })
  .catch(console.dir);
})

module.exports = router