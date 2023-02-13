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

router.route('/download/:userId/:year/:month')
.get((req, res) => {
  const data = find(req.params);
  const workbook = new ExcelJS.Workbook();
  workbook.xlsx.readFile(path.join(__dirname, '../template/daily.xlsx'))
  .then(() => {
    // 既存のシートをコピーして新しいシートを作成する
    const worksheet = workbook.getWorksheet('原紙');
    const newSheet = workbook.addWorksheet('2月13日');
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

    workbook.xlsx.writeFile('sample.xlsx')
    .then(() => {
      // Excelファイルをレスポンスする
      res.download('sample.xlsx', 'sample.xlsx', (error) => {
        if (error) {
          console.error(error);
        }
        // ファイルを削除する
        fs.unlinkSync('sample.xlsx');
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
      date: { $regex: new RegExp('^' + `${params.year}-${params.month}`)},
    };
    const options = {
      sort: { _id: 1},
      projection: { 
        _id: 1, 
        user_id: 1,
        date: 1,
      },
    }

    const result = await dailies.find(query, options).toArray();
    return result;
  } finally {
      await client.close();
  }
}

module.exports = router