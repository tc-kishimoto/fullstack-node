'use strict';
const mongo = require('../db/mongo')
const xlsxPopulate = require('xlsx-populate');

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

const themeStyle = {
  horizontalAlignment: "center", 
  verticalAlignment: "center",
  fill: "C4BD97",
  border: borderStyle
}

const headerStyle = {
  horizontalAlignment: "center", 
  verticalAlignment: "center",
  fill: "DDD9C4",
  border: borderStyle
}

const noDataStyle = { 
  horizontalAlignment: "center", 
  verticalAlignment: "center",
  fill: "dcdcdc",
  border: borderStyle,
};

const createDailyWorkbook = async (params) => {

  const workbook = await xlsxPopulate.fromBlankAsync();

  // // 日報データ取得
  const dailies = await getDailies(params)
    
  let sheetCount = 0;
  for (const daily of dailies) {

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
    newSheet.range("B9:E9").style(headerStyle)
    newSheet.cell("F9").value('-')
    newSheet.cell("F9").style(noDataStyle)

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
    newSheet.range("B13:E13").style(headerStyle)
    newSheet.cell('F13').value('-')
    newSheet.cell('F13').style(noDataStyle)

    newSheet.column("A").width(2.5)
    newSheet.column("B").width(35)
    newSheet.column("C").width(35)
    newSheet.column("D").width(35)
    newSheet.column("E").width(35)
    newSheet.column("F").width(35)

    newSheet.range("B4:F4").merged(true)
    newSheet.range("B4:F4").style(themeStyle)
    newSheet.range("B8:F8").merged(true)
    newSheet.range("B8:F8").style(themeStyle)
    newSheet.range("B12:F12").merged(true)
    newSheet.range("B12:F12").style(themeStyle)
    newSheet.range("B16:F16").merged(true)
    newSheet.range("B16:F16").style(themeStyle)


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
    newSheet.range('B10:E10').style({
      horizontalAlignment: "left", 
      verticalAlignment: "top",
      border: borderStyle
    })
    newSheet.cell('F10').value('-')
    newSheet.cell('F10').style(noDataStyle)

    // スピーチ・ディスカッション
    if (daily.speech_or_discussion === 'none') {
      createNonValueCells(newSheet, ['B14', 'C14', 'D14', 'E14', 'F14'])
    } else {
      newSheet.cell('B14').value(daily.speech_theme)
      newSheet.cell('B14').style({
        horizontalAlignment: "center", 
        verticalAlignment: "center",
        border: borderStyle,
        wrapText: true
      })
      newSheet.cell('C14').value(daily.speech_task)
      newSheet.cell('D14').value(daily.speech_notice)
      newSheet.cell('E14').value(daily.speech_solution)
      newSheet.range('B14:F14').style({
        horizontalAlignment: "left", 
        verticalAlignment: "top",
        border: borderStyle,
        wrapText: true
      })
      newSheet.cell('F14').value('-')
      newSheet.cell('F14').style(noDataStyle)
     
    }

    if (daily.daily_type === 'personal_develop') {
      // 個人開発
      newSheet.row(16).height(16)
      newSheet.row(17).height(16)
      newSheet.row(18).height(32)
      newSheet.row(19).height(16)
      newSheet.row(20).height(64)
      newSheet.row(21).height(8)
      newSheet.row(22).height(16)
      newSheet.row(23).height(64)

      newSheet.cell('B16').value('個人開発')
      newSheet.cell('B17').value('開発テーマ（システム名）')
      newSheet.cell('C17').value('本日の進捗率')
      newSheet.cell('D17').value('全体進捗率')
      newSheet.cell('E17').value('本日までの予定進捗率')
      newSheet.cell('F17').value('詳細リンク')
      newSheet.range("B17:F17").style(headerStyle)
      newSheet.cell('B18').value(daily.personal_develop_theme)
      newSheet.cell('C18').value(daily.personal_develop_today_progress)
      newSheet.cell('D18').value(daily.personal_develop_overall_progress)
      newSheet.cell('E18').value(daily.personal_develop_planned_progress)
      newSheet.cell('F18').value(daily.personal_develop_link)
      newSheet.range('B18:F18').style({
        horizontalAlignment: "center", 
        verticalAlignment: "center",
        border: borderStyle,
        wrapText: true
      })
      newSheet.cell('B19').value('作業内容')
      newSheet.cell('C19').value('現在の課題')
      newSheet.cell('D19').value('課題に対する解決策')
      newSheet.cell('E19').value('-')
      newSheet.cell('F19').value('-')
      newSheet.range("B19:D19").style(headerStyle)
      newSheet.range("E19:F19").style(noDataStyle)
      newSheet.cell('B20').value(daily.personal_develop_work_content)
      newSheet.cell('C20').value(daily.personal_develop_task)
      newSheet.cell('D20').value(daily.personal_develop_solusion)
      newSheet.cell('E20').value('-')
      newSheet.cell('F20').value('-')
      newSheet.range("E20:F20").style(noDataStyle)
      newSheet.range('B20:D20').style({
        horizontalAlignment: "left", 
        verticalAlignment: "top",
        border: borderStyle,
        wrapText: true
      })

      // 自由記述
      newSheet.range("B22:F22").merged(true)
      newSheet.range("B22:F22").style(themeStyle)
      newSheet.range("B23:F23").merged(true)
      newSheet.cell('B22').value('自由記述欄')
      newSheet.cell('B23').value(daily.free_description)
      newSheet.range('B23:F23').style({
        horizontalAlignment: "left", 
        verticalAlignment: "top",
        border: borderStyle,
        wrapText: true
      })

    } else if (daily.daily_type === 'team_develop') {
      // チーム開発
      newSheet.row(16).height(16)
      newSheet.row(17).height(16)
      newSheet.row(18).height(32)
      newSheet.row(19).height(16)
      newSheet.row(20).height(64)
      newSheet.row(21).height(8)
      newSheet.row(22).height(16)
      newSheet.row(23).height(64)

      newSheet.cell('B16').value('チーム開発')
      newSheet.cell('B17').value('開発テーマ（システム名）')
      newSheet.cell('C17').value('本日の進捗率')
      newSheet.cell('D17').value('全体進捗率')
      newSheet.cell('E17').value('本日までの予定進捗率')
      newSheet.cell('F17').value('詳細リンク')
      newSheet.range("B17:F17").style(headerStyle)
      newSheet.cell('B18').value(daily.team_develop_theme)
      newSheet.cell('C18').value(daily.team_develop_today_progress)
      newSheet.cell('D18').value(daily.team_develop_overall_progress)
      newSheet.cell('E18').value(daily.team_develop_planned_progress)
      newSheet.cell('F18').value(daily.team_develop_link)
      newSheet.range('B18:F18').style({
        horizontalAlignment: "center", 
        verticalAlignment: "center",
        border: borderStyle,
        wrapText: true
      })
      newSheet.cell('B19').value('作業内容')
      newSheet.cell('C19').value('現在の課題')
      newSheet.cell('D19').value('課題に対する解決策')
      newSheet.cell('E19').value('-')
      newSheet.cell('F19').value('-')
      newSheet.range("B19:D19").style(headerStyle)
      newSheet.range("E19:F19").style(noDataStyle)
      newSheet.cell('B20').value(daily.team_develop_work_content)
      newSheet.cell('C20').value(daily.team_develop_task)
      newSheet.cell('D20').value(daily.team_develop_solusion)
      newSheet.cell('E20').value('-')
      newSheet.cell('F20').value('-')
      newSheet.range("E20:F20").style(noDataStyle)
      newSheet.range('B20:D20').style({
        horizontalAlignment: "left", 
        verticalAlignment: "top",
        border: borderStyle,
        wrapText: true
      })

      // 自由記述
      newSheet.range("B22:F22").merged(true)
      newSheet.range("B22:F22").style(themeStyle)
      newSheet.range("B23:F23").merged(true)
      newSheet.cell('B22').value('自由記述欄')
      newSheet.cell('B23').value(daily.free_description)
      newSheet.range('B23:F23').style({
        horizontalAlignment: "left", 
        verticalAlignment: "top",
        border: borderStyle,
        wrapText: true
      })
    } else {
      // 研修内容
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

      newSheet.range("B20:F20").merged(true)
      newSheet.range("B20:F20").style(themeStyle)

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

      newSheet.cell('B18').value(daily.main_overview)
      newSheet.cell('C18').value(daily.main_achievement)
      newSheet.cell('D18').value(daily.main_review)
      newSheet.cell('E18').value(daily.main_review_cause)
      newSheet.cell('F18').value(daily.main_solution)
      newSheet.range('B18:F18').style({
        horizontalAlignment: "left", 
        verticalAlignment: "top",
        border: borderStyle,
        wrapText: true
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

      // 自由記述
      newSheet.range("B24:F24").merged(true)
      newSheet.range("B24:F24").style(themeStyle)
      newSheet.range("B25:F25").merged(true)
      newSheet.cell('B24').value('自由記述欄')
      newSheet.cell('B25').value(daily.free_description)
      newSheet.range('B25:F25').style({
        horizontalAlignment: "left", 
        verticalAlignment: "top",
        border: borderStyle,
        wrapText: true
      })
    }

    sheetCount++;
  }

  // 実績
  await createActualResultSheet(workbook, params)
  
  return workbook

}

const createNonValueCells = (sheet, areas) => {
  areas.forEach(area => {
    sheet.cell(area).value('-');
    sheet.cell(area).style(noDataStyle)
  })
}

// 実績シート
const createActualResultSheet = async (workbook, params) => {
  const sheet = workbook.addSheet("実績管理表")

  workbook.moveSheet("実績管理表", 0)

  sheet.cell("A1").value('実績管理表')
  sheet.range("A1:C2").merged(true)
  sheet.cell("A1").style({
    fontSize: "22",
    horizontalAlignment: "center", 
    verticalAlignment: "center",
  })

  sheet.cell('A5').value('テスト')
  sheet.range('A5:F5').merged(true)
  sheet.range('A5:F5').style(themeStyle)

  sheet.cell('G5').value('演習/課題')
  sheet.range('G5:J5').merged(true)
  sheet.range('G5:J5').style(themeStyle)

  sheet.cell('A6').value('実施日')
  sheet.cell('B6').value('対象単元')
  sheet.cell('C6').value('取得点数')
  sheet.cell('D6').value('平均点')
  sheet.cell('E6').value('合計点')
  sheet.cell('F6').value('満点')
  sheet.cell('G6').value('単元')
  sheet.cell('H6').value('演習・課題')
  sheet.cell('I6').value('演習名')
  sheet.cell('J6').value('提出日')
  sheet.range('A6:J6').style(headerStyle)

  sheet.column("B").width(24)
  sheet.column("I").width(18)


  // テスト結果取得
  const testResult = await getTestResult(params)
  // 演習提出状況取得
  const submissions = await getSubmissions(params)
  // 書き込み
  const startRow = 7;
  // テストエリア
  let row = startRow;
  testResult.forEach(daily => {
    sheet.row(row).height(40)
    sheet.cell(`A${row}`).value(daily.date)
    sheet.cell(`C${row}`).value(daily.score)
    sheet.cell(`D${row}`).value(daily.average_score)
    sheet.cell(`B${row}`).value (`${daily.test_taraget}(${scoreInfo[daily.test_category].label})`)
    sheet.cell(`E${row}`).value(scoreInfo[daily.test_category].passing_score)
    sheet.cell(`F${row}`).value(scoreInfo[daily.test_category].max_score)
    sheet.range(`A${row}:F${row}`).style({
      horizontalAlignment: "center", 
      verticalAlignment: "center",
      border: borderStyle,
    })
    sheet.range(`C${row}:F${row}`).style({
      fontSize: 14
    })
    row++;
  })
  sheet.range(`F5:F${row-1}`).style({
    border: {
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
        style: 'double',
        color: '000000'
      }
    }
  })
  // 演習エリア
  row = startRow
  submissions.forEach(submission => {
    sheet.row(row).height(40)
    sheet.cell(`G${row}`).value(submission.category)
    sheet.cell(`H${row}`).value(submission.lesson_type)
    sheet.cell(`I${row}`).value(submission.lesson_name)
    sheet.cell(`J${row}`).value(submission.date)
    sheet.range(`H${row}:J${row}`).style({
      horizontalAlignment: "center", 
      verticalAlignment: "center",
      border: borderStyle,
    })
    row++;
  })
  sheet.range(`G5:G${row-1}`).style({
    horizontalAlignment: "center", 
    verticalAlignment: "center",
    border: {
      top: {
        style: 'thin',
        color: '000000'
      },
      left: {
        style: 'double',
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
    sort: { day: -1},
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
