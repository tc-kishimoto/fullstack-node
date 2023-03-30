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

router.route('/user/:userId/:category/:title')
.get((req, res) => {
  const filter = {
    user_id: req.params.userId,
    category: req.params.category,
    title: req.params.title,
    deleted_at: { $exists: false},
  };
  mongo.find(collectionName, filter)
  .then(data => {
    res.json(data)
  })
})

router.route('/score/:id/:index/:score')
.put((req, res) => {
  const data = { [`quiz-${req.params.index}.score`] : Number(req.params.score) }
  mongo.updateOne(collectionName, req.params.id, data)
  .then(() => {
    // 全体のスコアを更新する
    mongo.findById(collectionName, req.params.id)
    .then(data => {
      // res.json(data)
      let sumScore = 0;
      for(let i = 1; i <= data.quiz_count; i++) {
        sumScore += data[`quiz-${i}`].score;
      }
      const scoreData = { score: sumScore }
      mongo.updateOne(collectionName, req.params.id, scoreData)
      .then(() => {
        res.status(200)
      }).catch(() => {
        res.status(404)
      })
    })
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
  // idがundefinedになっている時がある
  mongo.updateOne(collectionName, req.params.id, req.body)
  .then(() => {    
    mongo.findById(collectionName, req.params.id)
    .then(data => {
      // スコアの更新
      if(data != null) {
        let sumScore = 0;
        for(let i = 1; i <= data.quizCount; i++) {
          let score = 0
          const quiz = data[`quiz-${i}`]
          if ((quiz.type === 'radio' || quiz.type === 'text') && quiz.answer === quiz.user_answer) {
            score = quiz.maxScore;
          }
          if (quiz.type === 'checkbox' && quiz.user_answer !== null) {
            const answer1 = quiz.answer.sort();
            const answer2 = quiz.user_answer.sort();
            if(answer1.every((value, index) => value === answer2[index])) {
              score = quiz.maxScore;
            }
          }
          sumScore += score;
          console.log(score)
          console.log(data._id)
          const scoreData = { [`quiz-${i}.score`] : score }
          mongo.updateOne(collectionName, data._id, scoreData)
        }
        mongo.updateOne(collectionName, data._id, { score: sumScore})
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