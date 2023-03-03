'use strict'
const express = require('express')
const common = require('../db/common');

const collectionName = 'daily';

const router = express.Router()

router.route('/company/:companyId')
.get((req, res) => {
  const filter = {
    company_id: req.params.companyId,
    test_category: { $ne: 'none' },
    deleted_at: { $exists: false},
  };
  const options = {
    sort: { date: -1},
  }
  common.find(collectionName, filter, options)
  .then(data => {
      res.json(data)
  });
})

router.route('/course/:courseId')
.get((req, res) => {
  const filter = {
    course_id: req.params.courseId,
    test_category: { $ne: 'none' },
    deleted_at: { $exists: false},
  };
  const options = {
    sort: { date: -1},
  }
  common.find(collectionName, filter, options)
  .then(data => {
      res.json(data)
  });
})

router.route('/user/:userId')
.get((req, res) => {
  const filter = {
    user_id: req.params.userId,
    test_category: { $ne: 'none' },
    deleted_at: { $exists: false},
  };
  const options = {
    sort: { date: -1},
  }
  common.find(collectionName, filter, options)
  .then(data => {
      res.json(data)
  });
})

module.exports = router