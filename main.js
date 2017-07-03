var https = require('https');
var fs = require('fs');
var _ = require('lodash');

getJSON("https://poloniex.com/public?command=returnOrderBook&currencyPair=all&depth=1000000");

function getJSON(url){
    var collection = [];
    https.get(url, (res) => {
        res.setEncoding('utf8');
        res.on('data', (data) => {
            collection.push(data);
        });
        res.on('end', () => {
            const book = JSON.parse(collection.join(''));
            buildCSV(book);
        });
    });
}

function getTotals(key, value){
    const {asks, bids} = value;

    var total_asks = asks.reduce((accu, curr) => {
        return accu + curr[1];
    }, 0);

    var total_bids = bids.reduce((accu, curr) => {
        return accu + (curr[0] * curr[1]);
    }, 0);

    return [key, Math.floor(total_asks), Math.floor(total_bids)];
}

function buildCSV(book){
    var totals = []; 
    _.each(book, (value, key) => {
        totals.push(getTotals(key, value));
    });

    totals.unshift(["Coin", "Asks", "Bids"]);

    fs.writeFileSync('output.csv', totals.join('\n'), 'utf8');
}