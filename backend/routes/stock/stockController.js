const { finnhubClient } = require('../../utils/finnhub');

function getStockQuote(req, res) {
    const symbols = req.params.symbol.toUpperCase();
    finnhubClient.quote(symbols, (error, data) => {
        if (error) {
            return res.status(500).json({ message: 'Error fetching stock data' });
        }
        res.send(data);
    });
}

module.exports = { getStockQuote };
