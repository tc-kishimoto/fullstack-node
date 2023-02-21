'use strict';
const { MongoClient } = require('mongodb')
require('dotenv').config()

// const connectToDatabase = async () => {
//   const client = new MongoClient(process.env.MONGODB_URI);
//   return client.db();
// }

const client = new MongoClient(process.env.MONGODB_URI);

const findById = async (collectionName, id) => {
  try {
    await client.connect();
    const database = client.db(process.env.DATABASE_NAME);
    const collection = database.collection(collectionName);

    const query = {
      _id: id,
    };
    
    const result = await collection.findOne(query);
    return result;
  } catch(error) {
    console.log(error);
  } finally {
    await client.close();
  }
}

module.exports = { findById }