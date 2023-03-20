'use strict';
const mongo = require('../db/mongo')
const xlsxPopulate = require('xlsx-populate');
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

const borderStyle = {
  top: {
    style: 'thin',
    color: '000000'
  },
  left: {
    style: 'thin',
    color: '000000'
  },
  bottom: {
    style: 'thin',
    color: '000000'
  },
  right: {
    style: 'thin',
    color: '000000'
  }
}

const createDailyWorkbook = async (params) => {

  const workbook = await xlsxPopulate.fromBlankAsync();

  // // 日報データ取得
  const dailies = await getDailies(params)
    
  for (const daily of dailies) {
    let sheetCount = 0;

    // 年月日に分割する
    const [year, month, day] = daily.date.split('-');
    // シート名重複対応
    let sheetName = `${month}月${day}日`;
    let count = 0;
    while(true) {
      if (workbook.sheets().some(sheet => sheet.name() === sheetName)) {
        count++;
        sheetName = `${month}月${day}日(${count})`;
      } else {
        break;
      }
    }

    let newSheet = null;
    if (sheetCount === 0) {
      newSheet = workbook.sheet(0);
      newSheet.name(sheetName);
    } else {
      newSheet = workbook.addSheet(sheetName);
    }

    newSheet.cell("B2").value('研修日報')
    newSheet.cell("B2").style('fontSize', '18')

    const headerStyle = {
      horizontalAlignment: "center", 
      fill: "DDD9C4",
      border: borderStyle
    }

    newSheet.cell("B4").value('基本情報')
    newSheet.cell("B5").value('日付')
    newSheet.cell("C5").value('講座名')
    newSheet.cell("D5").value('企業名')
    newSheet.cell("E5").value('氏名')
    newSheet.cell("F5").value('教室名')
    newSheet.range("B5:F5").style(headerStyle)

    newSheet.cell("B8").value('ビジネスマナー')
    newSheet.cell("B9").value('挨拶・コミュニケーション')
    newSheet.cell("C9").value('身だしなみ')
    newSheet.cell("D9").value('時間管理')
    newSheet.cell("E9").value('報告・連絡・相談・確認')
    newSheet.range("B9:F9").style(headerStyle)

    if (daily.speech_or_discussion === 'speech') {
      newSheet.cell('B12').value('スピーチ')
    } else if (daily.speech_or_discussion === 'discussion') {
      newSheet.cell('B12').value('ディスカッション')
    } else {
      newSheet.cell('B12').value('スピーチ/ディスカッション')
    }
    newSheet.cell('B13').value('テーマ')
    newSheet.cell('C13').value('自分に当てはまる改善点')
    newSheet.cell('D13').value('発表をして/聞いていて気づいた点')
    newSheet.cell('E13').value('改善点に対する具体的解決策')
    newSheet.range("B13:F13").style(headerStyle)

    newSheet.cell('B16').value('研修内容')
    newSheet.cell('B17').value('概要')
    newSheet.cell('C17').value('実績（自信を持って理解できたこと）')
    newSheet.cell('D17').value('復習の必要な項目')
    newSheet.cell('E17').value('理解できなかった原因')
    newSheet.cell('F17').value('原因に対する解決策')
    newSheet.range("B17:F17").style(headerStyle)

    newSheet.cell('B20').value('テスト結果')
    newSheet.cell('B21').value('テスト対象単元')
    newSheet.cell('C21').value('取得点数')
    newSheet.cell('D21').value('平均点')
    newSheet.cell('E21').value('合格点')
    newSheet.cell('F21').value('満点')
    newSheet.range("B21:F21").style(headerStyle)

    newSheet.cell('B24').value('自由記述欄')

    newSheet.column("A").width(2.5)
    newSheet.column("B").width(35)
    newSheet.column("C").width(35)
    newSheet.column("D").width(35)
    newSheet.column("E").width(35)
    newSheet.column("F").width(35)

    const themeStyle = {
      horizontalAlignment: "center", 
      fill: "C4BD97",
      border: borderStyle
    }
    newSheet.range("B4:F4").merged(true)
    newSheet.range("B4:F4").style(themeStyle)
    newSheet.range("B8:F8").merged(true)
    newSheet.range("B8:F8").style(themeStyle)
    newSheet.range("B12:F12").merged(true)
    newSheet.range("B12:F12").style(themeStyle)
    newSheet.range("B16:F16").merged(true)
    newSheet.range("B16:F16").style(themeStyle)
    newSheet.range("B20:F20").merged(true)
    newSheet.range("B20:F20").style(themeStyle)
    newSheet.range("B24:F24").merged(true)
    newSheet.range("B24:F24").style(themeStyle)
    newSheet.range("B25:F25").merged(true)

    newSheet.row(1).height(8)
    newSheet.row(2).height(24)
    newSheet.row(3).height(8)
    newSheet.row(4).height(16)
    newSheet.row(5).height(16)
    newSheet.row(6).height(32)
    newSheet.row(7).height(8)
    newSheet.row(8).height(16)
    newSheet.row(9).height(16)
    newSheet.row(10).height(64)
    newSheet.row(11).height(8)
    newSheet.row(12).height(16)
    newSheet.row(13).height(16)
    newSheet.row(14).height(64)
    newSheet.row(15).height(8)
    newSheet.row(16).height(16)
    newSheet.row(17).height(16)
    newSheet.row(18).height(64)
    newSheet.row(19).height(8)
    newSheet.row(20).height(16)
    newSheet.row(21).height(16)
    newSheet.row(22).height(48)
    newSheet.row(23).height(8)
    newSheet.row(24).height(16)
    newSheet.row(25).height(64)

    // // set column widths
    // worksheet.columns.forEach((column, index) => {
    //   newSheet.getColumn(index + 1).width = column.width;
    // });


    // 各データをセット
    // 基本情報
    newSheet.cell('B6').value(daily.date)
    newSheet.cell('C6').value(daily.course_name)
    newSheet.cell('D6').value(daily.company_name)
    newSheet.cell('E6').value(daily.name)
    newSheet.cell('F6').value(daily.class_name)
    newSheet.range('B6:F6').style({
      horizontalAlignment: "center", 
      verticalAlignment: "center",
      border: borderStyle
    })

    // ビジネスマナー
    newSheet.cell('B10').value(daily.manner1)
    newSheet.cell('C10').value(daily.manner2)
    newSheet.cell('D10').value(daily.manner3)
    newSheet.cell('E10').value(daily.manner4)
    newSheet.range('B10:F10').style({
      horizontalAlignment: "left", 
      verticalAlignment: "top",
      border: borderStyle
    })

    // スピーチ・ディスカッション
    if (daily.speech_or_discussion === 'none') {
      createNonValueCells(newSheet, ['B14', 'C14', 'D14', 'E14'])
    } else {
      newSheet.cell('B14').value(daily.speech_theme)
      newSheet.cell('B14').style({
        horizontalAlignment: "center", 
        verticalAlignment: "center",
        border: borderStyle
      })
      newSheet.cell('C14').value(daily.speech_task)
      newSheet.cell('D14').value(daily.speech_notice)
      newSheet.cell('E14').value(daily.speech_solution)
      newSheet.range('B14:F14').style({
        horizontalAlignment: "left", 
        verticalAlignment: "top",
        border: borderStyle
      })
     
    }

    if (daily.daily_type === 'personal_develop') {
      newSheet.cell('B18').value(daily.personal_develop_theme)
      newSheet.cell('C18').value(daily.personal_develop_today_progress)
      newSheet.cell('D18').value(daily.personal_develop_overall_progress)
      newSheet.cell('E18').value(daily.personal_develop_planned_progress)
      newSheet.cell('F18').value(daily.personal_develop_link)
      newSheet.range('B18:F18').style({
        horizontalAlignment: "center", 
        verticalAlignment: "center",
        border: borderStyle
      })
      newSheet.cell('B20').value(daily.personal_develop_work_content)
      newSheet.cell('C20').value(daily.personal_develop_task)
      newSheet.cell('D20').value(daily.personal_develop_solusion)
      newSheet.range('B20:F20').style({
        horizontalAlignment: "left", 
        verticalAlignment: "top",
        border: borderStyle
      })
    } else if (daily.daily_type === 'team_develop') {
      newSheet.cell('B18').value(daily.team_develop_theme)
      newSheet.cell('C18').value(daily.team_develop_today_progress)
      newSheet.cell('D18').value(daily.team_develop_overall_progress)
      newSheet.cell('E18').value(daily.team_develop_planned_progress)
      newSheet.cell('F18').value(daily.team_develop_link)
      newSheet.range('B18:F18').style({
        horizontalAlignment: "center", 
        verticalAlignment: "center",
        border: borderStyle
      })
      newSheet.cell('B20').value(daily.team_develop_work_content)
      newSheet.cell('C20').value(daily.team_develop_task)
      newSheet.cell('D20').value(daily.team_develop_solusion)
      newSheet.range('B20:F20').style({
        horizontalAlignment: "left", 
        verticalAlignment: "top",
        border: borderStyle
      })
    } else {
      // 研修内容
      newSheet.cell('B18').value(daily.main_overview)
      newSheet.cell('C18').value(daily.main_achievement)
      newSheet.cell('D18').value(daily.main_review)
      newSheet.cell('E18').value(daily.main_review_cause)
      newSheet.cell('F18').value(daily.main_solution)
      newSheet.range('B18:F18').style({
        horizontalAlignment: "left", 
        verticalAlignment: "top",
        border: borderStyle
      })

      // テスト結果
      if(daily.test_category == 'none') {
        createNonValueCells(newSheet, ['B22', 'C22', 'D22', 'E22', 'F22'])
      } else {
        newSheet.cell('B22').value(`${daily.test_taraget}(${scoreInfo[daily.test_category].label})`)
        newSheet.cell('C22').value(daily.score)
        newSheet.cell('D22').value(daily.average_score)
        newSheet.cell('E22').value(scoreInfo[daily.test_category].passing_score)
        newSheet.cell('F22').value(scoreInfo[daily.test_category].max_score)
        newSheet.range('B22:F22').style({
          fontSize: "14",
          horizontalAlignment: "center", 
          verticalAlignment: "center",
          border: borderStyle
        })
      }
    }
    // 自由記述
    newSheet.cell('B25').value(daily.free_description)
    newSheet.range('B25:F25').style({
      horizontalAlignment: "left", 
      verticalAlignment: "top",
      border: borderStyle
    })

    sheetCount++;
  }

  // 実績
  // await createActualResultSheet(workbook, params)
  
  return workbook

}

const createNonValueCells = (sheet, areas) => {
  // const noDataStyle = { 
  //   alignment: { horizontal: 'center', vertical: 'middle'},
  //   border: {
  //     left: {style: 'thin', color: {argb: 'FF000000'}},
  //     right: {style: 'thin', color: {argb: 'FF000000'}},
  //     top: {style: 'thin', color: {argb: 'FF000000'}},
  //     bottom: {style: 'thin', color: {argb: 'FF000000'}},
  //   }
  // };
  const noDataStyle = { 
   
  };

  areas.forEach(area => {
    sheet.cell(area).value('-');
    sheet.cell(area).style(noDataStyle)
  })
}

// 実績シート
const createActualResultSheet = async (workbook, params) => {
  const actualResultSheet = workbook.sheet("実績管理表")
  // テスト結果取得
  const testResult = await getTestResult(params)
  // 演習提出状況取得
  const submissions = await getSubmissions(params)
  // 書き込み
  const startRow = 7;
  // テストエリア
  let row = startRow;
  testResult.forEach(daily => {
    actualResultSheet.cell(`A${row}`).value(daily.date)
    actualResultSheet.cell(`C${row}`).value(daily.score)
    actualResultSheet.cell(`D${row}`).value(daily.average_score)
    actualResultSheet.cell(`B${row}`).value (`${daily.test_taraget}(${scoreInfo[daily.test_category].label})`)
    actualResultSheet.cell(`E${row}`).value(scoreInfo[daily.test_category].passing_score)
    actualResultSheet.cell(`F${row}`).value(scoreInfo[daily.test_category].max_score)
    row++;
  })
  // 演習エリア
  row = startRow
  submissions.forEach(submission => {
    actualResultSheet.cell(`G${row}`).value(submission.category)
    actualResultSheet.cell(`H${row}`).value(submission.lesson_type)
    actualResultSheet.cell(`I${row}`).value(submission.lesson_name)
    actualResultSheet.cell(`J${row}`).value(submission.date)
    row++;
  })
}

// 日報データ取得
const getDailies = async (params) => {
  const dailyFilter = {
    user_id: params.userId,
    year: Number(params.year),
    month: Number(params.month),
    deleted_at: { $exists: false},
    draft: false,
  };
  const dailyOptions = {
    sort: { date: -1},
  }
  return await mongo.find('daily', dailyFilter, dailyOptions)
}

// テスト結果取得
const getTestResult = async (params) => {
  const testResultFilter = {
    user_id: params.userId,
    year: Number(params.year),
    month: Number(params.month),
    deleted_at: { $exists: false},
    test_category: { $ne: 'none' },
  };
  const testResultOptions = {
    sort: { date: 1},
  }
  return await mongo.find('daily', testResultFilter, testResultOptions)
}

// 演習提出状況取得
const getSubmissions = async (params) => {
  const submissionFilter = {
    user_id: params.userId,
    status: 'submission',
    deleted_at: { $exists: false },
  }
  return await mongo.find('submission', submissionFilter)
}

module.exports = { createDailyWorkbook }
