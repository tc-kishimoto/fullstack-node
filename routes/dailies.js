'use strict';
const express = require('express')
const common = require('../db/common')
const fs = require('fs');
const dailyExcel = require('../excel/daily')

const router = express.Router()

router.route('/:userId/:year/:month')
.get((req, res) => {
  const filter = {
    user_id: Number(req.params.userId),
    year: Number(req.params.year),
    month: Number(req.params.month),
    deleted_at: { $exists: false},
  };
  common.find('daily', filter)
  .then(data => {
      res.json(data)
  });
})

router.route('/company/:companyId')
.get((req, res) => {
  const filter = {
    company_id: Number(req.params.companyId),
    deleted_at: { $exists: false},
  };
  const options = {
    sort: { date: -1},
  }
  common.find('daily', filter, options)
  .then(data => {
      res.json(data)
  });
})

router.route('/course/:couseId')
.get((req, res) => {
  const filter = {
    course_id: Number(req.params.couseId),
    deleted_at: { $exists: false},
  };
  const options = {
    sort: { date: -1},
  }
  common.find('daily', filter, options)
  .then(data => {
      res.json(data)
  });
})

// Excelダウンロード
router.route('/download/:userId/:year/:month')
.get(async (req, res) => {
  
    const workbook = await dailyExcel.createDailyWorkbook(req.params)

    workbook.xlsx.writeFile(`daily-${req.params.userId}.xlsx`)
    .then(() => {
      // Excelファイルをレスポンスする
      res.download(`daily-${req.params.userId}.xlsx`, `daily-${req.params.userId}.xlsx`, (error) => {
        if (error) {
          console.error(error);
        }
        // ファイルを削除する
        fs.unlinkSync(`daily-${req.params.userId}.xlsx`);
      });
    })
})


module.exports = router