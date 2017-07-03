var https = require('https');
var fs = require('fs');
var _ = require('lodash');
var book;

getJSON("https://poloniex.com/public?command=returnOrderBook&currencyPair=all&depth=1000000");

function getJSON(url){
    var collection = [];
    https.get(url, (res) => {
        res.setEncoding('utf8');
        res.on('data', (data) => {
            collection.push(data);
            console.log(data + '\n');
        });
        res.on('end', () => {
            book = JSON.parse(collection.join(''));
            buildCSV();
        });
    });
}

function getTotals(key){
    const asks = book[key]['asks'];
    const bids = book[key]['bids'];

    var total_asks = asks.reduce((accu, curr) => {
        return accu + curr[1];
    }, 0);

    var total_bids = bids.reduce((accu, curr) => {
        return accu + (curr[0] * curr[1]);
    }, 0);

    return [key, Math.floor(total_asks), Math.floor(total_bids)];
}

function buildCSV(){
    var totals = []; 
    _.each(book, (value, key) => {
        totals.push(getTotals(key));
    });

    totals.unshift(["Coin", "Asks", "Bids"]);

    fs.writeFileSync('output.csv', totals.join('\n'), 'utf8');
}

// JSON RESPONSE FORMAT:
// {
//     BTC_COIN: {
//         asks: [[PRICE, COIN], [PRICE, COIN], ...],
//         bids: [[PRICE, COIN], [PRICE, COIN]]
//     },
//     ...
// }

// CALCULATIONS FOR TOTALS:
// ASKS: COIN + COIN + ...
// BIDS: (PRICE * COIN) + (PRICE * COIN) + ...