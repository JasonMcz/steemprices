var request = require('request');
var async = require('async');
var fs = require('fs');

var {Client} = require("steem-rpc");
var Api = Client.get({}, true);

var data = {};
data['BTC_STEEM'] = {};
data['ETH_STEEM'] = {};
data['BTC_SBD'] = {};
data['SBD_STEEM'] = {};

function writeFile(filename, data, callback) {
  fs.writeFile(filename, data, function(err) {
    if(err) {
      callback(err, false);
    } else {
      callback(undefined, true);
    }
	});
}

function getData(callback) {
  async.parallel(
    [
      function(callback){
        request('https://poloniex.com/public?command=returnTicker', function (error, response, body) {
          if (!error && response.statusCode == 200) {
            var body = JSON.parse(body);
            data['BTC_STEEM']['Poloniex'] = {
              bid: Number(body['BTC_STEEM']['highestBid']),
              ask: Number(body['BTC_STEEM']['lowestAsk']),
              volume: Number(body['BTC_STEEM']['baseVolume']),
              last: Number(body['BTC_STEEM']['last']),
              change: Number(body['BTC_STEEM']['last'])-Number(body['BTC_STEEM']['last'])/(Number(body['BTC_STEEM']['percentChange'])+1)
            };
            data['ETH_STEEM']['Poloniex'] = {
              bid: Number(body['ETH_STEEM']['highestBid']),
              ask: Number(body['ETH_STEEM']['lowestAsk']),
              volume: Number(body['ETH_STEEM']['baseVolume']),
              last: Number(body['ETH_STEEM']['last']),
              change: Number(body['ETH_STEEM']['last'])-Number(body['ETH_STEEM']['last'])/(Number(body['ETH_STEEM']['percentChange'])+1)
            };
            data['BTC_SBD']['Poloniex'] = {
              bid: Number(body['BTC_SBD']['highestBid']),
              ask: Number(body['BTC_SBD']['lowestAsk']),
              volume: Number(body['BTC_SBD']['baseVolume']),
              last: Number(body['BTC_SBD']['last']),
              change: Number(body['BTC_SBD']['last'])-Number(body['BTC_SBD']['last'])/(Number(body['BTC_SBD']['percentChange'])+1)
            };
            callback(null, null);
          }
        });
      },
      function(callback){
        request('https://bittrex.com/api/v1.1/public/getmarketsummaries', function (error, response, body) {
          if (!error && response.statusCode == 200) {
            var body = JSON.parse(body);
            var steem = body['result'].filter(function(x){return x.MarketName=='BTC-STEEM'})[0];
            var sbd = body['result'].filter(function(x){return x.MarketName=='BTC-SBD'})[0];
            data['BTC_STEEM']['Bittrex'] = {
              bid: Number(steem['Bid']),
              ask: Number(steem['Ask']),
              volume: Number(steem['BaseVolume']),
              last: Number(steem['Last']),
              change: Number(steem['Last'])-Number(steem['PrevDay'])
            };
            data['BTC_SBD']['Bittrex'] = {
              bid: Number(sbd['Bid']),
              ask: Number(sbd['Ask']),
              volume: Number(sbd['BaseVolume']),
              last: Number(sbd['Last']),
              change: Number(sbd['Last'])-Number(sbd['PrevDay'])
            };
            callback(null, null);
          }
        });
      },
      // function(callback){
      //   request('http://steemex.com', function (error, response, body) {
      //     if (!error && response.statusCode == 200) {
      //       var re = /window\.__INITIAL_STATE__ = (\{.*?\});/g;
      //       var json = re.exec(body);
      //       var body = JSON.parse(json[1]);
      //       data['SBD_STEEM']['Internal'] = {
      //         bid: Number(body['ticker']['highest_bid']),
      //         ask: Number(body['ticker']['lowest_ask']),
      //         volume: Number(body['ticker']['steem_volume'].replace(" STEEM","")),
      //         last: Number(body['ticker']['latest']),
      //         change: Number(body['ticker']['latest'])-Number(body['ticker']['latest'])/(Number(body['ticker']['percent_change'])/100.0+1)
      //       };
      //       callback(null, null);
      //     }
      //   });
      // },
      function(callback) {
        Api.initPromise.then(response => {
          Api.database_api().exec("get_order_book", ["1"]).then(response => {
            var bid = Number(response.bids[0].real_price);
            var ask = Number(response.asks[0].real_price);
            data['SBD_STEEM']['Internal'] = {
              bid: bid,
              ask: ask,
              volume: 0,
              last: (bid+ask)/2.0,
              change: 0
            };
            callback(null,null);
          });
        });
      },
      function(callback){
        request('https://api.coindesk.com/v1/bpi/currentprice/USD.json', function (error, response, body) {
          if (!error && response.statusCode == 200) {
            var body = JSON.parse(body);
            data['BTC_USD'] = Number(body.bpi.USD.rate);
            callback(null, null);
          }
        });
      },
      // function(callback){
      //   request.post({url:'https://bitshares.openledger.info/ws', form: JSON.stringify({'jsonrpc': '2.0', 'id': 0, 'method': 'get_limit_orders', 'params': [['USD','BTS',1]]})}, function(error,response,body){
      //     if (!error && response.statusCode == 200) {
      //       console.log(body);
      //       callback(null, null);
      //     }
      //   });
      // }
    ],
    function(err, results) {
      writeFile('app/assets/data.json', JSON.stringify(data), function(err, result){
        if (err) {
          console.log('Could not write data because of error: '+err);
        } else {
          console.log('Data written to data.json');
        }
        process.exit();
        callback();
      });
    }
  );
}

getData(function(){});
