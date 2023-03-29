'use strict';
const { MongoClient } = require('mongodb')
require('dotenv').config()
const { v4: uuidv4 } = require('uuid');

const uri = process.env.NODE_ENV === 'test' ? process.env.MONGODB_TEST_URI : process.env.MONGODB_URI;
// const client = new MongoClient(uri);

const findById = async (collectionName, id) => {
  const client = new MongoClient(uri);
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

const findOne = async (collectionName, filter) => {
  const client = new MongoClient(uri);
  try {
    await client.connect();
    const database = client.db(process.env.DATABASE_NAME);
    const collection = database.collection(collectionName);

    const query = {
      ...filter
    };    
    const result = await collection.findOne(query);
    return result;
  } catch(error) {
    console.log(error);
  } finally {
    await client.close();
  }
}

const find = async (collectionName, filter, options) => {
  const client = new MongoClient(uri);
  try {
    await client.connect();
    const database = client.db(process.env.DATABASE_NAME);
    const collection = database.collection(collectionName);

    const query = {
      ...filter
    };    

    if (options === undefined) {
      options = {
        sort: { _id: 1},
      }
    }

    const result = await collection.find(query, options).toArray();
    return result;
  } catch(error) {
    console.log(error);
  } finally {
    await client.close();
  }
}

const insertOne = async (collectionName, data) => {
  const client = new MongoClient(uri);
  try {
    await client.connect();
    const database = client.db(process.env.DATABASE_NAME);
    const collection = database.collection(collectionName);

    const now = new Date();
    const id = uuidv4();

    const doc = {
      _id: id,
      ...data,
      created_at: `${now.getFullYear()}-${now.getMonth() + 1}-${now.getDate()} ${now.getHours()}:${now.getMinutes()}:${now.getSeconds()}`
    }
    
    const result = await collection.insertOne(doc);

    return result;

  } catch(error) {
    console.log(error);
  } finally {
    await client.close();
  }
}

const deleteOne = async (collectionName, id) => {
  const client = new MongoClient(uri);
  try {
    await client.connect();
    const database = client.db(process.env.DATABASE_NAME);
    const collection = database.collection(collectionName);

    const filter = { _id: id };
    const options = { upsert: false };

    const now = new Date();

    const updateDoc = {
      $set: {
        deleted_at: `${now.getFullYear()}-${now.getMonth() + 1}-${now.getDate()} ${now.getHours()}:${now.getMinutes()}:${now.getSeconds()}`
      },
    };

    const result = await collection.updateOne(filter, updateDoc, options);
    return result;
  } catch(error) {
    console.log(error);
  } finally {
    await client.close();
  }
}

const physicalDeleteOne = async (collectionName, id) => {
  const client = new MongoClient(uri);
  try {
    await client.connect();
    const database = client.db(process.env.DATABASE_NAME);
    const collection = database.collection(collectionName);

    const query = { _id: id };

    const result = await collection.deleteOne(query);
    return result;
  } catch(error) {
    console.log(error);
  } finally {
    await client.close();
  }
}

const updateOne = async (collectionName, id, data) => {
  const client = new MongoClient(uri);
  try {
    await client.connect();
    const database = client.db(process.env.DATABASE_NAME);
    const collection = database.collection(collectionName);

    const filter = { _id: id };
    const options = { upsert: false };

    const now = new Date();

    const updateDoc = {
      $set: {
        ...data,
        updated_at: `${now.getFullYear()}-${now.getMonth() + 1}-${now.getDate()} ${now.getHours()}:${now.getMinutes()}:${now.getSeconds()}`
      }
    }

    const result = await collection.updateOne(filter, updateDoc, options);
    return result;
    
  } catch(error) {
    console.log(error);
  } finally {
    await client.close();
  }
}

const pushComment = async (collectionName, id, data) => {
  const client = new MongoClient(uri);
  try {
    await client.connect();
    const database = client.db(process.env.DATABASE_NAME);
    const collection = database.collection(collectionName);

    const filter = { _id: id };

    const updateDoc = {
      $push: {
        comments: data
      }
    }

    const result = await collection.updateOne(filter, updateDoc);
    return result;
    
  } catch(error) {
    console.log(error);
  } finally {
    await client.close();
  }
}

module.exports = { findById, findOne, find, insertOne, deleteOne, physicalDeleteOne, updateOne, pushComment }