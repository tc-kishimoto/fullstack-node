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

router.route('/course/:couseId')
.get((req, res) => {
  const filter = {
    course_id: req.params.couseId,
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

router.route('/user/finish/:userId/:category/:title')
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
      for(let i = 1; i <= data.quizCount; i++) {
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
.delete((req, res) => {
  mongo.deleteOne(collectionName, req.params.id)
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
          if (quiz.type === 'combination' && quiz.user_answer !== null) {
            const totalQuestions = quiz.answer.length;
            let correctAnswers = 0;
          
            for (let i = 0; i < totalQuestions; i++) {
              if (quiz.user_answer.length < i) {
                break;
              }
              const correctAnswerIndex = quiz.answer.findIndex(
                (choice) =>
                  choice.question_id === quiz.user_answer[i].question_id && choice.choice_id === quiz.user_answer[i].choice_id
              );
              if (correctAnswerIndex !== -1) {
                correctAnswers++;
              }
            }
            score = correctAnswers / totalQuestions;
            score = score < 1 ? score : 1;
            score = Math.round(score * quiz.maxScore * 100) / 100;
          }
          if (quiz.type === 'fill' && quiz.user_answer !== null) {
            const totalQuestions = quiz.answer.length;
            let correctAnswers = 0;
          
            for (let i = 0; i < totalQuestions; i++) {
              const key = Object.keys(quiz.answer[i])[0]
              const target = quiz.user_answer.find(e => e !== null && Object.keys(e)[0] === key)
              if(target !== undefined && target[key] === quiz.answer[i][key]) {
                correctAnswers++;
              }
            }
            score = correctAnswers / totalQuestions;
            score = score < 1 ? score : 1;
            score = Math.round(score * quiz.maxScore * 100) / 100;
          }
          sumScore += score;
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