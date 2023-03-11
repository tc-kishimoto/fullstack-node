'use strict';
const mariadb = require('mariadb');
require('dotenv').config()

const pool = mariadb.createPool({
    host: process.env.MOODLE_DB_HOST,
    user: process.env.MOODLE_DB_USER,
    password: process.env.MOODLE_DB_PASSWORD,
    database: process.env.MOODLE_DB_DATABASE,
    port: process.env.MOODLE_DB_PORT,
    allowPublicKeyRetrieval: true
});

module.exports = {
  query: async (query, params) => {
      let conn;
      try {
          conn = await pool.getConnection();
          const result = await conn.query(query, params);
          conn.release();
          return result;
      } catch (err) {
          if (conn) conn.release();
          console.log(err);
          // throw err;
      }
  }
};