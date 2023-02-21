'use strict'
const express = require('express')
const { MongoClient } = require('mongodb')
const common = require('../db/common');
const { v4: uuidv4 } = require('uuid');
require('dotenv').config()

const router = express.Router()
const client = new MongoClient(process.env.MONGODB_URI);

const formatDate = (date) => {
  return `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`
}

router.route('/')
.post((req, res) => {
  register(req.body).then((data) => {
    res.json(data)
    // res.status(200).send('OK')
})
  .catch(console.dir);
})

router.route('/:id')
.get((req, res) => {
  // find(req.params.id)
  common.findById('daily', req.params.id)
  .then(data => {
    res.json(data)
  })
})
.put((req, res) => {
  update(req.params.id, req.body).then(() => res.status(200).send('OK'))
  .catch(console.dir);
})
.delete((req, res) => {
  deleteDaily(req.params.id).then(() => res.status(200).send('OK'))
  .catch(console.dir);
})

router.route('/copy/:id')
.post((req, res) => {
  copy(req.params.id).then(data => {
    res.json(data)
  })
})


// 登録
async function register(data) {
  try {
      await client.connect();
      const database = client.db("fullstack");
      const daily = database.collection("daily");

      const now = new Date();
      const uuid = uuidv4();

      const doc = {
        ...data,
        _id: uuidv4(),
        created_at: `${now.getFullYear()}-${now.getMonth() + 1}-${now.getDate()} ${now.getHours()}:${now.getMinutes()}:${now.getSeconds()}`
      }

      const result = await daily.insertOne(doc);

      return result;
  } catch(error) {
    console.log(error);
  } finally {
      await client.close();
  }
}

// 更新
async function update(id, data) {
  try {
    await client.connect();
    const database = client.db("fullstack");
    const daily = database.collection("daily");

    const filter = { _id: id };
    const options = { upsert: true };

    const updateDoc = {
      $set: {
        date: data.date,
        year: data.year,
        month: data.month,
        day: data.day,
        daily_type: data.daily_type,
        course_name: data.course_name,
        manner1: data.manner1,
        manner2: data.manner2,
        manner3: data.manner3,
        manner4: data.manner4,
        speech_or_discussion: data.speech_or_discussion,
        speech_theme: data.speech_theme,
        speech_task: data.speech_task,
        speech_notice: data.speech_notice,
        speech_solution: data.speech_solution,
        main_overview: data.main_overview,
        main_achievement: data.main_achievement,
        main_review: data.main_review,
        main_review_cause: data.main_review_cause,
        main_solution: data.main_solution,
        test_category: data.test_category,
        test_taraget: data.test_taraget,
        score: data.score,
        passing_score: data.passing_score,
        average_score: data.average_score,
        max_score: data.max_score,
        personal_develop_theme: data.personal_develop_theme,
        personal_develop_today_progress: data.personal_develop_today_progress,
        personal_develop_overall_progress: data.personal_develop_overall_progress,
        personal_develop_planned_progress: data.personal_develop_planned_progress,
        personal_develop_link: data.personal_develop_link,
        personal_develop_work_content: data.personal_develop_work_content,
        personal_develop_task: data.personal_develop_task,
        personal_develop_solusion: data.personal_develop_solusion,
        team_develop_theme: data.team_develop_theme,
        team_develop_today_progress: data.team_develop_today_progress,
        team_develop_overall_progress: data.team_develop_overall_progress,
        team_develop_planned_progress: data.team_develop_planned_progress,
        team_develop_link: data.team_develop_link,
        team_develop_work_content: data.team_develop_work_content,
        team_develop_task: data.team_develop_task,
        team_develop_solusion: data.team_develop_solusion,
        free_description: data.free_description,
        draft: data.draft,
      },
    };

    const result = await daily.updateOne(filter, updateDoc, options);
  } catch(error) {
    console.log(error);
  } finally {
      await client.close();
  }
}

// 削除
async function deleteDaily(id) {
  try {
    await client.connect();
    const database = client.db("fullstack");
    const daily = database.collection("daily");

    const filter = { _id: id };
    const options = { upsert: false };

    const updateDoc = {
      $set: {
        deleted_at: new Date()
      },
    };

    const result = await daily.updateOne(filter, updateDoc, options);
  } catch(error) {
      console.log(error);
  } finally {
      await client.close();
  }
}

// コピー
async function copy(id) {
  const daily = await find(id);

  delete daily._id;
  const today = new Date();
  daily.date = formatDate(today);
  daily.year = today.getFullYear();
  daily.month = today.getMonth() + 1;
  daily.day = today.getDate();

  return register(daily);

}

module.exports = router