'use strict';
const express = require('express')
const mongo = require('../db/mongo')
const { validateSubmission, validateSubmissionAddComment } = require('../middleware/validation')
require('dotenv').config()

const router = express.Router()

const collectionName = 'submission';

router.route('/')
.post(validateSubmission, (req, res) => {
  const now = new Date()
  mongo.insertOne(collectionName, {
    ...req.body,
    comments: [],
    date: `${now.getFullYear()}-${now.getMonth() + 1}-${now.getDate()}`,
  })
  .then((data) => {
    mongo.findById(collectionName, data.insertedId)
    .then(newData => {
      res.json(newData)
    }).catch(error => {
      console.log(error)
      res.status(200).send('OK')
    })
  })
  .catch(console.dir);
})

router.route('/:id')
.get((req, res) => {
  mongo.findById(collectionName, req.params.id)
  .then((data) => {
    if(data === null) {
      res.status(404).send('404 Not Found')
    } else {
      res.json(data)
    }
  })
  .catch(console.dir);
})
.put(validateSubmission, (req, res) => {
  mongo.updateOne(collectionName, req.params.id, req.body)
  .then((data) => {
    mongo.findById(collectionName, req.params.id)
    .then(newData => {
      res.json(newData)
    }).catch(error => {
      console.log(error)
      res.status(200).send('OK')
    })
  })
  .catch(console.dir);
})
.delete((req, res) => {
  mongo.physicalDeleteOne(collectionName, req.params.id)
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
  mongo.find(collectionName, filter)
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
  mongo.find(collectionName, filter)
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
  mongo.find(collectionName, filter)
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
  mongo.findOne(collectionName, filter)
  .then((data) => {
    res.json(data)
  })
  .catch(console.dir);
})

router.route('/add-comment/:userId/:id')
.post(validateSubmissionAddComment, (req, res) => {
  mongo.findById(collectionName, req.params.id)
  .then(data => {
    const now = new Date()
    mongo.pushComment(collectionName, req.params.id, {
      comment: req.body.comment, 
      added_at: `${now.getFullYear()}-${now.getMonth() + 1}-${now.getDate()} ${now.getHours()}:${now.getMinutes()}:${now.getSeconds()}`
    })
    .then(() => {
      res.json(data)
    })
    .catch(error => {
      console.log(error)
    });
  })
})

module.exports = router