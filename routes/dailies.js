'use strict';
const express = require('express')
const { MongoClient } = require('mongodb')
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

  const noDataStyle = { 
    alignment: { horizontal: 'center', vertical: 'middle'},
    border: {
      left: {style: 'thin', color: {argb: 'FF000000'}},
      right: {style: 'thin', color: {argb: 'FF000000'}},
      top: {style: 'thin', color: {argb: 'FF000000'}},
      bottom: {style: 'thin', color: {argb: 'FF000000'}},
    }
  };

  workbook.xlsx.readFile(path.join(__dirname, '../template/daily.xlsx'))
  .then(() => {
    for (const daily of dailies) {
      // 原紙の取得
      let templateSheetName = '原紙(通常)';
      if (daily.daily_type === 'personal_develop') {
        templateSheetName = '原紙(個人開発)';
      } else if(daily.daily_type === 'team_develop') {
        templateSheetName = '原紙(チーム開発)';
      }
      const worksheet = workbook.getWorksheet(templateSheetName);

      // 年月日に分割する
      const [year, month, day] = daily.date.split('-');
      // シート名重複対応
      let sheetName = `${month}月${day}日`;
      let count = 0;
      while(true) {
        if (workbook.worksheets.some(worksheet => worksheet.name === sheetName)) {
          count++;
          sheetName = `${month}月${day}日(${count})`;
        } else {
          break;
        }
      }

      let newSheet = null;
      if (workbook.worksheets.some(worksheet => worksheet.name === 'Sheet1')) {
        newSheet = workbook.getWorksheet('Sheet1');
        newSheet.name = sheetName;
      } else {
        newSheet = workbook.addWorksheet(sheetName);
      }

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
      newSheet.getCell('C6').value = daily.course_name;
      newSheet.getCell('D6').value = daily.company_name;
      newSheet.getCell('E6').value = daily.name;
      newSheet.getCell('F6').value = daily.class_name;

      // ビジネスマナー
      newSheet.getCell('B10').value = daily.manner1;
      newSheet.getCell('C10').value = daily.manner2;
      newSheet.getCell('D10').value = daily.manner3;
      newSheet.getCell('E10').value = daily.manner4;

      // スピーチ・ディスカッション
      if (daily.speech_or_discussion === 'none') {
        // newSheet.getCell('B14').alignment = { horizontal: 'center', vertical: 'middle'};
        newSheet.getCell('B14').style = noDataStyle;
        newSheet.getCell('B14').value = '-';
        newSheet.getCell('C14').style = noDataStyle;
        newSheet.getCell('C14').value = '-';
        newSheet.getCell('D14').style = noDataStyle;
        newSheet.getCell('D14').value = '-';
        newSheet.getCell('E14').style = noDataStyle;
        newSheet.getCell('E14').value = '-';
      } else {
        newSheet.getCell('B14').value = daily.speech_theme;
        newSheet.getCell('C14').value = daily.speech_task;
        newSheet.getCell('D14').value = daily.speech_notice;
        newSheet.getCell('E14').value = daily.speech_solution;
        if (daily.speech_or_discussion === 'speech') {
          newSheet.getCell('B12').value = 'スピーチ';
        } else if (daily.speech_or_discussion === 'discussion') {
          newSheet.getCell('B12').value = 'ディスカッション';
        } 
      }

      if (daily.daily_type === 'personal_develop') {
        newSheet.getCell('B18').value = daily.personal_develop_theme;
        newSheet.getCell('C18').value = daily.personal_develop_today_progress;
        newSheet.getCell('D18').value = daily.personal_develop_overall_progress;
        newSheet.getCell('E18').value = daily.personal_develop_planned_progress;
        newSheet.getCell('F18').value = daily.personal_develop_link;
        newSheet.getCell('B20').value = daily.personal_develop_work_content;
        newSheet.getCell('C20').value = daily.personal_develop_task;
        newSheet.getCell('D20').value = daily.personal_develop_solusion;
      } else if (daily.daily_type === 'team_develop') {
        newSheet.getCell('B18').value = daily.team_develop_theme;
        newSheet.getCell('C18').value = daily.team_develop_today_progress;
        newSheet.getCell('D18').value = daily.team_develop_overall_progress;
        newSheet.getCell('E18').value = daily.team_develop_planned_progress;
        newSheet.getCell('F18').value = daily.team_develop_link;
        newSheet.getCell('B20').value = daily.team_develop_work_content;
        newSheet.getCell('C20').value = daily.team_develop_task;
        newSheet.getCell('D20').value = daily.team_develop_solusion;
      } else {
        // 研修内容
        newSheet.getCell('B18').value = daily.main_overview;
        newSheet.getCell('C18').value = daily.main_achievement;
        newSheet.getCell('D18').value = daily.main_review;
        newSheet.getCell('E18').value = daily.main_review_cause;
        newSheet.getCell('F18').value = daily.main_solution;
  
        // テスト結果
        if(daily.test_category == 'none') {
          newSheet.getCell('B22').value = '-';
          newSheet.getCell('B22').style = noDataStyle;
          newSheet.getCell('C22').value = '-';
          newSheet.getCell('C22').style = noDataStyle;
          newSheet.getCell('D22').value = '-';
          newSheet.getCell('D22').style = noDataStyle;
          newSheet.getCell('E22').value = '-';
          newSheet.getCell('E22').style = noDataStyle;
          newSheet.getCell('F22').value = '-';
          newSheet.getCell('F22').style = noDataStyle;
        } else {
          if(daily.test_category === 'little_test') {
            newSheet.getCell('B22').value = daily.test_taraget + '(小テスト)';
            newSheet.getCell('E22').value = 8;
            newSheet.getCell('F22').value = 10;
          } else {
            newSheet.getCell('B22').value = daily.test_taraget + '(単元末テスト)';
            newSheet.getCell('E22').value = 80;
            newSheet.getCell('F22').value = 100;
          }
          newSheet.getCell('C22').value = daily.score;
          newSheet.getCell('D22').value = daily.average_score;
          // newSheet.getCell('E22').value = daily.passing_score;
          // newSheet.getCell('F22').value = daily.max_score;
        }
      }

      // 自由記述
      newSheet.getCell('B25').value = daily.free_description;

    }
    
    workbook.getWorksheet("原紙(通常)").state = 'hidden';
    workbook.getWorksheet("原紙(個人開発)").state = 'hidden';
    workbook.getWorksheet("原紙(チーム開発)").state = 'hidden';
    
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
      sort: { date: -1},
      projection: { 
        _id: 1, 
        user_id: 1,
        course_name: 1,
        daily_type: 1,
        date: 1,
        name: 1,
        company_name: 1,
        class_name: 1,
        manner1: 1,
        manner2: 1,
        manner3: 1,
        manner4: 1,
        speech_or_discussion: 1,
        speech_theme: 1,
        speech_task: 1,
        speech_notice: 1,
        speech_solution: 1,
        main_overview: 1,
        main_achievement: 1,
        main_review: 1,
        main_review_cause: 1,
        main_solution: 1,
        test_category: 1,
        test_taraget: 1,
        score: 1,
        passing_score: 1,
        average_score: 1,
        max_score: 1,
        personal_develop_theme: 1,
        personal_develop_today_progress: 1,
        personal_develop_overall_progress: 1,
        personal_develop_planned_progress: 1,
        personal_develop_link: 1,
        personal_develop_work_content: 1,
        personal_develop_task: 1,
        personal_develop_solusion: 1,
        team_develop_theme: 1,
        team_develop_today_progress: 1,
        team_develop_overall_progress: 1,
        team_develop_planned_progress: 1,
        team_develop_link: 1,
        team_develop_work_content: 1,
        team_develop_task: 1,
        team_develop_solusion: 1,
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