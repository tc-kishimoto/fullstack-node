'use strict'

const convertJOSN = (req, res, next) => {
  const originalJsonMethod = res.json;

  res.json = function(data) {
    // BigInt型の値を文字列に変換する
    function replaceBigInts(key, value) {
      if (typeof value === 'bigint') {
        return value.toString();
      }
      return value;
    }

    // オリジナルのres.json()メソッドを実行する
    const modifiedData = JSON.parse(JSON.stringify(data, replaceBigInts));
    originalJsonMethod.call(this, modifiedData);
  };

  next();
}

module.exports = convertJOSN;