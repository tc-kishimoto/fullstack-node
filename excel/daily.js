'use strict';
const common = require('../db/common')
const ExcelJS = require('exceljs');
const path = require('path');

const scoreInfo = {
  little_test: {
    passing_score: 8,
    max_score: 10,
    label: '小テスト'
  },
  confirmation_test: {
    passing_score: 80,
    max_score: 100,
    label: '単元末テスト'
  }
}

const createDailyWorkbook = async (params) => {

  const workbook = new ExcelJS.Workbook();

  // // 日報データ取得
  const dailies = await getDailies(params)

  const templateSheets = {
    normal: '原紙(通常)',
    personal_develop: '原紙(個人開発)',
    team_develop: '原紙(チーム開発)',
  }

  const defaultSheetName = 'Sheet1';

  await workbook.xlsx.readFile(path.join(__dirname, '../template/daily.xlsx'))
    
  for (const daily of dailies) {
    // 原紙の取得
    const templateSheetName = templateSheets[daily.daily_type]
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
    if (workbook.worksheets.some(worksheet => worksheet.name === defaultSheetName)) {
      newSheet = workbook.getWorksheet(defaultSheetName);
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
      createNonValueCells(newSheet, ['B14', 'C14', 'D14', 'E14'])
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
        createNonValueCells(newSheet, ['B22', 'C22', 'D22', 'E22', 'F22'])
      } else {
        newSheet.getCell('B22').value = `${daily.test_taraget}(${scoreInfo[daily.test_category].label})`;
        newSheet.getCell('C22').value = daily.score;
        newSheet.getCell('D22').value = daily.average_score;
        newSheet.getCell('E22').value = scoreInfo[daily.test_category].passing_score;
        newSheet.getCell('F22').value = scoreInfo[daily.test_category].max_score;
      }
    }
    // 自由記述
    newSheet.getCell('B25').value = daily.free_description;
  }

  // 原紙のシートを非表示に
  for (const key in templateSheets) {
    if (templateSheets.hasOwnProperty(key)) {
      workbook.getWorksheet(templateSheets[key]).state = 'hidden';      
    }
  }

  // 実績
  await createActualResultSheet(workbook, params)
  
  return workbook

}

const createNonValueCells = (sheet, areas) => {
  const noDataStyle = { 
    alignment: { horizontal: 'center', vertical: 'middle'},
    border: {
      left: {style: 'thin', color: {argb: 'FF000000'}},
      right: {style: 'thin', color: {argb: 'FF000000'}},
      top: {style: 'thin', color: {argb: 'FF000000'}},
      bottom: {style: 'thin', color: {argb: 'FF000000'}},
    }
  };

  areas.forEach(area => {
    sheet.getCell(area).value = '-';
    sheet.getCell(area).style = noDataStyle;
  })
}

// 実績シート
const createActualResultSheet = async (workbook, params) => {
  const actualResultSheet = workbook.getWorksheet("実績管理表")
  // テスト結果取得
  const testResult = await getTestResult(params)
  // 演習提出状況取得
  const submissions = await getSubmissions(params)
  // 書き込み
  const startRow = 7;
  // テストエリア
  let row = startRow;
  testResult.forEach(daily => {
    actualResultSheet.getCell(`A${row}`).value = daily.date;
    actualResultSheet.getCell(`C${row}`).value = daily.score;
    actualResultSheet.getCell(`D${row}`).value = daily.average_score;
    actualResultSheet.getCell(`B${row}`).value  = `${daily.test_taraget}(${scoreInfo[daily.test_category].label})`;
    actualResultSheet.getCell(`E${row}`).value = scoreInfo[daily.test_category].passing_score;
    actualResultSheet.getCell(`F${row}`).value = scoreInfo[daily.test_category].max_score;
    row++;
  })
  // 演習エリア
  row = startRow;
  submissions.forEach(submission => {
    actualResultSheet.getCell(`G${row}`).value = submission.category;
    actualResultSheet.getCell(`H${row}`).value = submission.lesson_type;
    actualResultSheet.getCell(`I${row}`).value = submission.lesson_name;
    actualResultSheet.getCell(`J${row}`).value = submission.date;
    row++;
  })
}

// 日報データ取得
const getDailies = async (params) => {
  const dailyFilter = {
    user_id: Number(params.userId),
    year: Number(params.year),
    month: Number(params.month),
    deleted_at: { $exists: false},
  };
  const dailyOptions = {
    sort: { date: -1},
  }
  return await common.find('daily', dailyFilter, dailyOptions)
}

// テスト結果取得
const getTestResult = async (params) => {
  const testResultFilter = {
    user_id: Number(params.userId),
    year: Number(params.year),
    month: Number(params.month),
    deleted_at: { $exists: false},
    test_category: { $ne: 'none' },
  };
  const testResultOptions = {
    sort: { date: 1},
  }
  return await common.find('daily', testResultFilter, testResultOptions)
}

// 演習提出状況取得
const getSubmissions = async (params) => {
  const submissionFilter = {
    user_id: Number(params.userId),
    deleted_at: { $exists: false},
  }
  return await common.find('submission', submissionFilter)
}

module.exports = { createDailyWorkbook }
