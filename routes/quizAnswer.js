'use strict';
const express = require('express');
const mongo = require('../db/mongo');

const collectionName = 'quizAnswer';

const router = express.Router()

router.route('/')
.post((req, res) => {
  mongo.insertOne(collectionName, req.body)
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
  };
  mongo.find(collectionName, filter)
  .then(data => {
    res.json(data)
  })
})

router.route('/:id')
.get((req, res) => {
  mongo.findById(collectionName, req.params.id)
  .then(data => {
    res.json(data)
  })
})
.put((req, res) => {
  mongo.updateOne(collectionName, req.params.id, req.body)
  .then(() => {    
    mongo.findById(collectionName, req.params.id)
    .then(data => {
      if(data != null) {
        const newDetail = data.detail.map(q => {
          if ((q.type === 'radio' || q.type === 'text') && q.answer === q.user_answer) {
            return { ...q, score: q.maxScore };
          }
          if (q.type === 'checkbox' && q.user_answer !== null) {
            const answer1 = q.answer.sort();
            const answer2 = q.user_answer.sort();
            if(answer1.every((value, index) => value === answer2[index])) {
              return { ...q, score: q.maxScore };
            }
          }
          return q;
        })
        data.detail = newDetail;
        data.score = newDetail.reduce((acc, curr) => acc + curr.score, 0)
        mongo.updateOne(collectionName, req.params.id, data)
        .then((data2) => {
          res.json(data2)
        })
      } else {
        res.status(404)
      }
    })
})
  .catch(console.dir);
})

module.exports = router