var async = require('async');
var fs = require('fs');

const options = {
    url: "wss://steemit.com/wstmp3",
    // url: "wss://this.piston.rocks/",
    debug: false
};
var {Client} = require("steem-rpc");
var Api = Client.get({}, true);

var accounts = ["adeal","aload","aton","thebeatles","inbamn11","liqui","thursday","anonbtc2","monday","taker","thewho","xeldal","jasonmcz","zztop","pal","wednesday","theguesswho","justtryme90","tinfoilfedora","yefet","nirvana","primus","alittle","logicwins","kevinwong","steems","artific","hr1","zerohero","vdoh","frankjones","blockchainbilly","dana-edwards","aenor","cryptoctopus","blakemiles84","vladislav","nicolinux","oaldamster","gaba","yovel","shoraibit","complexring","steemtest","on0tole","trung81","ihashfury","dab","gregory-f","alyssas"];
var liqs = {};
var bids = [];
var asks = [];
var bidGroups = {};
var askGroups = {};
var bidGroupsSeen = {};
var askGroupsSeen = {};
var orders = {};
var liquidityRewards = [];

function writeFile(filename, data, callback) {
  fs.writeFile(filename, data, function(err) {
    if(err) {
      callback(err, false);
    } else {
      callback(undefined, true);
    }
	});
}

Api.initPromise.then(response => {
  console.log("Api ready:", response);

  Api.database_api().exec("get_order_book", [25]).then(response => {
    response.bids.forEach(function(order){
      var price = order.sbd/order.steem;
      var size = order.steem/1000;
      if (!bidGroups[price]) {
        bidGroups[price] = size;
      } else {
        bidGroups[price] += size;
      }
    });
    response.bids.forEach(function(order){
      var price = order.sbd/order.steem;
      var size = bidGroups[price];
      if (!bidGroupsSeen[price]) {
        bids.push({price: price, size: size});
        bidGroupsSeen[price] = true;
      }
    });
    response.asks.forEach(function(order){
      var price = order.sbd/order.steem;
      var size = order.steem/1000;
      if (!askGroups[price]) {
        askGroups[price] = size;
      } else {
        askGroups[price] += size;
      }
    });
    response.asks.forEach(function(order){
      var price = order.sbd/order.steem;
      var size = askGroups[price];
      if (!askGroupsSeen[price]) {
        asks.push({price: price, size: size});
        askGroupsSeen[price] = true;
      }
    });
    Api.database_api().exec("get_liquidity_queue", ["",50]).then(response => {
      // console.log(response);
      response.forEach(function(account){
        liqs[account.account] = Number(account.weight);
      });
      accounts.forEach(function(account) {
        liqs[account] = 0;
      });
      accounts = Object.keys(liqs);
      async.reduce(accounts, {},
        function(memo, account, callback) {
          orders[account] = {};
          Api.database_api().exec("get_account_history", [account,-1,999]).then(response => {
            response.forEach(function(event){
              // console.log(event[1].op[0], event[1].op[1], event[1])
              if (event[1].op[0]=='liquidity_reward') {
                var timestamp = new Date(event[1].timestamp);
                var payout = Number(event[1].op[1].payout.replace(' STEEM',''));
                liquidityRewards.push({account: account, timestamp: timestamp, payout: payout});
              } else if (event[1].op[0]=='limit_order_create') {
                if (new Date()<new Date(event[1].op[1].expiration)) {
                  if (event[1].op[1].amount_to_sell.match('STEEM')) {
                    var steem = Number(event[1].op[1].amount_to_sell.replace(' STEEM',''));
                    var sbd = Number(event[1].op[1].min_to_receive.replace(' SBD',''));
                    var price = sbd/steem;
                    orders[account][event[1].op[1].orderid] = {size: steem, price: price, action: 'sell', account: account};
                  } else if (event[1].op[1].amount_to_sell.match('SBD')) {
                    var steem = Number(event[1].op[1].min_to_receive.replace(' STEEM',''));
                    var sbd = Number(event[1].op[1].amount_to_sell.replace(' SBD',''));
                    var price = sbd/steem;
                    orders[account][event[1].op[1].orderid] = {size: steem, price: price, action: 'buy', account: account};
                  }
                }
              } else if (event[1].op[0]=='fill_order') {
                if (event[1].op[1].open_orderid in orders[account]) {
                  if (event[1].op[1].current_pays.match('STEEM')) {
                    orders[account][event[1].op[1].open_orderid].size -= Number(event[1].op[1].current_pays.replace(' STEEM',''));
                  } else if (event[1].op[1].open_pays.match('STEEM')) {
                    orders[account][event[1].op[1].open_orderid].size -= Number(event[1].op[1].open_pays.replace(' STEEM',''));
                  }
                  if (orders[account][event[1].op[1].open_orderid].size<=0) {
                    delete orders[account][event[1].op[1].open_orderid];
                  }
                }
              } else if (event[1].op[0]=='limit_order_cancel') {
                delete orders[account][event[1].op[1].orderid];
              }
            });
            memo[account] = response;
            callback(null, memo)
          });
        },
        function(err, result) {
          liquidityRewards.sort(function(a,b){return a.timestamp>b.timestamp ? -1 : 1});
          asks.sort(function(a,b){return a.price<b.price ? -1 : 1});
          bids.sort(function(a,b){return a.price>b.price ? -1 : 1});
          var priceUsers = {};
          Object.keys(orders).forEach(function(account){
            Object.keys(orders[account]).forEach(function(orderid){
              var order = orders[account][orderid];
              if (!priceUsers[order.price]) priceUsers[order.price] = [];
              priceUsers[order.price].push(order);
            });
          });
          var data = {bids: bids, asks: asks, priceUsers: priceUsers, liquidityRewards: liquidityRewards};
          writeFile('app/assets/market.json', JSON.stringify(data), function(err, result){
            if (err) {
              console.log('Could not write data because of error: '+err);
            } else {
              console.log('Data written to market.json');
            }
            process.exit()
          });
        }
      );
    });
  });
});
