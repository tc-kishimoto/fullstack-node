'use strict';
const express = require('express')
const { MongoClient, ObjectId } = require('mongodb')
const ExcelJS = require('exceljs');
const fs = require('fs');
const path = require('path');
require('dotenv').config()

const router = express.Router()
const client = new MongoClient(process.env.MONGODB_URI);

router.route('/:userId/:year/:month')
.get((req, res) => {
  find(req.params).then(data => {
      res.json(data)
  });
})

// Excelダウンロード
router.route('/download/:userId/:year/:month')
.get(async (req, res) => {
  const dailies = await find(req.params);
  const workbook = new ExcelJS.Workbook();
  workbook.xlsx.readFile(path.join(__dirname, '../template/daily.xlsx'))
  .then(() => {
    // 既存のシートをコピーして新しいシートを作成する
    const worksheet = workbook.getWorksheet('原紙');

    for (const daily of dailies) {
      // 年月日に分割する
      const [year, month, day] = daily.date.split('-');
      // シート名重複対応
      let sheetName = `${month}月${day}日`;
      let count = 0;
      while(true) {
        if (workbook.worksheets.some(worksheet => worksheet.name === sheetName)) {
          count++;
          sheetName = `${sheetName}(${count})`;
        } else {
          break;
        }
      }
      const newSheet = workbook.addWorksheet(sheetName);
      worksheet.eachRow({ includeEmpty: true }, (row, rowNumber) => {
        // 既存のシートのデータを新しいシートにコピーする
        const newRow = newSheet.getRow(rowNumber);
        let isMerged = false;
        row.eachCell({ includeEmpty: true }, (cell, colNumber) => {
          if(isMerged) {
            return false
          }
          const newCell = newRow.getCell(colNumber);
          newCell.value = cell.value;
          newCell.style = cell.style;
  
          // 各項目の見出し
          if (cell.isMerged) {
            newSheet.mergeCells(
              rowNumber,
              colNumber,
              rowNumber,
              6
            );
            
            isMerged = true;
          }
        });
  
        // set row height
        newRow.height = worksheet.getRow(rowNumber).height;
  
      });
      // set column widths
      worksheet.columns.forEach((column, index) => {
        newSheet.getColumn(index + 1).width = column.width;
      });

      // 各データをセット
      // 基本情報
      newSheet.getCell('B6').value = daily.date;
      // ビジネスマナー
      newSheet.getCell('B10').value = daily.manner1;
      newSheet.getCell('C10').value = daily.manner2;
      newSheet.getCell('D10').value = daily.manner3;
      newSheet.getCell('E10').value = daily.manner4;

      // スピーチ・ディスカッション
      newSheet.getCell('B14').value = daily.speech_theme;
      newSheet.getCell('C14').value = daily.speech_task;
      newSheet.getCell('D14').value = daily.speech_notice;
      newSheet.getCell('E14').value = daily.speech_solution;

      // 研修内容
      newSheet.getCell('B18').value = daily.main_overview;
      newSheet.getCell('C18').value = daily.main_achievement;
      newSheet.getCell('D18').value = daily.main_review;
      newSheet.getCell('E18').value = daily.main_review_cause;
      newSheet.getCell('F18').value = daily.main_solution;

      // 自由記述
      newSheet.getCell('B25').value = daily.free_description;

    }

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
})

async function find(params) {
  try {
    await client.connect();
    const database = client.db("fullstack");
    const dailies = database.collection("daily");

    const query = {
      user_id: Number(params.userId),
      year: Number(params.year),
      month: Number(params.month),
      deleted_at: { $exists: false},
    };
    const options = {
      sort: { date: 1},
      projection: { 
        _id: 1, 
        user_id: 1,
        date: 1,
        manner1: 1,
        manner2: 1,
        manner3: 1,
        manner4: 1,
        speech_theme: 1,
        speech_task: 1,
        speech_notice: 1,
        speech_solution: 1,
        main_overview: 1,
        main_achievement: 1,
        main_review: 1,
        main_review_cause: 1,
        main_solution: 1,
        free_description: 1,
      },
    }

    const result = await dailies.find(query, options).toArray();
    return result;
  } finally {
      await client.close();
  }
}

module.exports = router