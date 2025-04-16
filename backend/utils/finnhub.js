import finnhub from 'finnhub';

const api_key = finnhub.ApiClient.instance.authentications['api_key'];
api_key.apiKey = process.env.FINAPI; 
const finnhubClient = new finnhub.DefaultApi();

export { finnhubClient };
