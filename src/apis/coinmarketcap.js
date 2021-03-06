'use strict';
/** @todo refactor this to use request instead of https */
var https = require('https');

class CoinMarketCap {
    constructor() {
        this.host = 'api.coinmarketcap.com'
    }

    getPrice(crypto,fiat = 'usd') {
        var options = {
            host: this.host,
            path: `/v1/ticker/${crypto}/?convert=${fiat}`
        };
        
        return new Promise(function(resolve, reject) {
            var req = https.request(options, function(res) {
                if (res.statusCode < 200 || res.statusCode >= 300) {
                    return reject(new Error('statusCode=' + res.statusCode));
                }
                var responseString = '';
                res.on('data', function(data) {
                    responseString += data;
                });
                res.on('end', function() {
                    var responseJSON = JSON.parse(responseString);
                    resolve(responseJSON);
                });
            });
            req.on('error', function(err) {
                reject(err);
            });
            req.end();
        });
    }
}

module.exports = new CoinMarketCap();