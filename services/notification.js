const request = require('request');

const postNotification = async () => {
  const options = {
    method: 'POST',
    url: `${process.env.API_URL}/notification`,
    headers: {
      'User-Agent': 'nodejs-request',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ name: 'John Doe', email: 'johndoe@example.com' })
  };
  
  request(options, (error, response, body) => {
    if (error) throw new Error(error);
    console.log(body);
  });
}
