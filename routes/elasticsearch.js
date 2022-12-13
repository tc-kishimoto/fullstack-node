'use strict'
const express = require('express')

const { Client } = require('@elastic/elasticsearch')
const client = new Client({node: `http://${process.env.ES_HOST}:9200`})
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
  }).catch(error => console.log(error));
})
.delete((req, res) => {
  deleteIndex()
  .then(data => res.json(data))
  .catch(error => console.log(error));
})
.post((req, res) => {
  create(req.body)
  .then(data => res.json(data))
  .catch(error => console.log(error));
})
.put((req, res) => {
  update(req.body)
  .then(data => res.json(data))
  .catch(error => console.log(error));
})

// 検索
async function find(params) {
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

// 削除
async function deleteIndex() {
  // const result = await client.delete({index: 'fullstack'});
  const result = await client.indices.flushSynced({index: 'fullstack'});
  return result;
}

// 作成
async function create(params) {
  const result = await client.create({
    index: 'fullstack',
    id: params.id,
    body: {
      title: params.title,
      category: params.category,
      text: params.text,
    }
  });
  return result;
}

// 更新
async function update(params) {
  const { body } = await client.exists({
    index: 'fullstack',
    id: params.id
  })

  if (body) {
    await client.delete({
      index: 'fullstack',
      id: params.id
    })

  }
  await client.create({
    index: 'fullstack',
    id: params.id,
    body: {
      title: params.title,
      category: params.category,
      text: params.text,
    }
  });
  
}

module.exports = router