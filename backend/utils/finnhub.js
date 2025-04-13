const finnhub = require('finnhub');

const api_key = finnhub.ApiClient.instance.authentications['api_key'];
api_key.apiKey = process.env.FINAPI; // Use your actual API key here
const finnhubClient = new finnhub.DefaultApi();

module.exports = { finnhubClient };
