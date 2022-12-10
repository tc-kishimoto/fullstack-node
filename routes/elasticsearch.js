'use strict'
const express = require('express')

const { Client } = require('@elastic/elasticsearch')
const client = new Client({
  node: 'http://localhost:9200',
  // auth: {
  //   username: 'elastic',
  //   password: 'changeme'
  // }
})
const router = express.Router()
router.route('/')
.get((req, res) => {
  find(req.query).then(data => {
    const result = data.body.hits.hits.map(e => {
      const keywordIndex = e._source.text.indexOf(req.query.keyword)
      return { 
        title: e._source.title.replace('.md', ''),
        category: e._source.category,
        text: e._source.text.substring(keywordIndex, keywordIndex + 100)
      };
    })
    const response = {
      count: data.body.hits.total.value,
      data: result
    }
    res.json(response)
  });
})

// 検索
async function find(params) {
  console.log(params)
  const result = await client.search({
    index: 'fullstack',
    from: Number(params.size) * (Number(params.page) - 1),
    size: Number(params.size),
    body: {
      query: {
        match: {
          text: params.keyword
        }
      },
    }
  })
  return result;
}

module.exports = router