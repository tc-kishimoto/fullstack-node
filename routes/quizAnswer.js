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
  const options = {
    sort: { created_at: -1},
  }
  if(req.query.categoryName) {
    filter['category'] = { $regex: req.query.categoryName, $options: 'i' };
  }
  if(req.query.testName) {
    filter['title'] = { $regex: req.query.testName, $options: 'i' };
  }
  if(req.query.attemptCount) {
    filter['attempts'] = { $eq: parseInt(req.query.attemptCount, 10) };
  }
  mongo.find(collectionName, filter, options)
  .then(data => {
    res.json(data)
  })
})

router.route('/course/:couseId')
.get((req, res) => {
  // console.log(req.query)
  const filter = {
    course_id: req.params.couseId,
    deleted_at: { $exists: false},
  };
  const options = {
    sort: { created_at: -1},
  }
  if(req.query.categoryName) {
    filter['category'] = { $regex: req.query.categoryName, $options: 'i' };
  }
  if(req.query.testName) {
    filter['title'] = { $regex: req.query.testName, $options: 'i' };
  }
  if(req.query.attemptCount) {
    filter['attempts'] = { $eq: parseInt(req.query.attemptCount, 10) };
  }

  mongo.find(collectionName, filter, options)
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
// .put((req, res) => {
//   const data = { [`quiz-${req.params.index}.score`] : Number(req.params.score) }
//   mongo.updateOne(collectionName, req.params.id, data)
//   .then(() => {
//     // 全体のスコアを更新する
//     mongo.findById(collectionName, req.params.id)
//     .then(data => {
//       // res.json(data)
//       let sumScore = 0;
//       for(let i = 1; i <= data.quizCount; i++) {
//         sumScore += data[`quiz-${i}`].score;
//       }
//       const scoreData = { score: sumScore }
//       mongo.updateOne(collectionName, req.params.id, scoreData)
//       .then(() => {
//         res.status(200)
//       }).catch(() => {
//         res.status(404)
//       })
//     })
//   })
// })
.put(async (req, res) => {
  const data = { [`quiz-${req.params.index}.score`] : Number(req.params.score) }
  await mongo.updateOne(collectionName, req.params.id, data)
  // 全体のスコアを更新する
  const quizResult = await mongo.findById(collectionName, req.params.id)
  let sumScore = 0;
  for(let i = 1; i <= quizResult.quizCount; i++) {
    sumScore += quizResult[`quiz-${i}`].score;
  }
  const scoreData = { score: sumScore }
  await mongo.updateOne(collectionName, req.params.id, scoreData)
  res.json(scoreData)
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
// .put((req, res) => {
//   // idがundefinedになっている時がある
//   mongo.updateOne(collectionName, req.params.id, req.body)
//   .then(() => {    
//     mongo.findById(collectionName, req.params.id)
//     .then(data => {
//       // スコアの更新
//       if(data != null) {
//         let sumScore = 0;
//         for(let i = 1; i <= data.quizCount; i++) {
//           let score = 0
//           const quiz = data[`quiz-${i}`]
//           if ((quiz.type === 'radio' || quiz.type === 'text') && quiz.answer === quiz.user_answer) {
//             score = quiz.maxScore;
//           }
//           if (quiz.type === 'checkbox' && quiz.user_answer !== null) {
//             const answer1 = quiz.answer.sort();
//             const answer2 = quiz.user_answer.sort();
//             if(answer1.every((value, index) => value === answer2[index])) {
//               score = quiz.maxScore;
//             }
//           }
//           if (quiz.type === 'combination' && quiz.user_answer !== null) {
//             const totalQuestions = quiz.answer.length;
//             let correctAnswers = 0;
          
//             for (let i = 0; i < totalQuestions; i++) {
//               if (quiz.user_answer.length < i) {
//                 break;
//               }
//               if(quiz.user_answer[i] === undefined || quiz.user_answer[i] === null) {
//                 continue;
//               }
//               const correctAnswerIndex = quiz.answer.findIndex(
//                 (choice) =>
//                   choice.question_id === quiz.user_answer[i].question_id && choice.choice_id === quiz.user_answer[i].choice_id
//               );
//               if (correctAnswerIndex !== -1) {
//                 correctAnswers++;
//               }
//             }
//             score = correctAnswers / totalQuestions;
//             score = score < 1 ? score : 1;
//             score = Math.round(score * quiz.maxScore * 100) / 100;
//           }
//           if (quiz.type === 'fill' && quiz.user_answer !== null) {
//             const totalQuestions = quiz.answer.length;
//             let correctAnswers = 0;
          
//             for (let i = 0; i < totalQuestions; i++) {
//               const key = Object.keys(quiz.answer[i])[0]
//               const target = quiz.user_answer.find(e => e !== null && Object.keys(e)[0] === key)
//               if(target !== undefined && target[key] === quiz.answer[i][key]) {
//                 correctAnswers++;
//               }
//             }
//             score = correctAnswers / totalQuestions;
//             score = score < 1 ? score : 1;
//             score = Math.round(score * quiz.maxScore * 100) / 100;
//           }
//           sumScore += score;
//           const scoreData = { [`quiz-${i}.score`] : score }
//           mongo.updateOne(collectionName, data._id, scoreData)
//         }
//         mongo.updateOne(collectionName, data._id, { score: sumScore})
//         .then(() => {
//           mongo.findById(collectionName, data._id)
//           .then(data3 => {
//             res.json(data3)
//           })
//         })
//       } else {
//         res.status(404)
//       }
//     })
// })
.put(async (req, res) => {
  // idがundefinedになっている時がある
  await mongo.updateOne(collectionName, req.params.id, req.body)
  const data = await mongo.findById(collectionName, req.params.id)
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
          if(quiz.user_answer[i] === undefined || quiz.user_answer[i] === null) {
            continue;
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
      await mongo.updateOne(collectionName, data._id, scoreData)
    }
    await mongo.updateOne(collectionName, data._id, { score: sumScore})
    const result = await mongo.findById(collectionName, data._id)
    res.json(result)
  } else {
    res.status(404)
  }
})

module.exports = router