'use strict';

angular.module('myApp.version.controllers', [])

.controller('mainController', ['$scope', '$http', '$rootScope','$timeout' ,'$interval' , '$location', function($scope, $http, $rootScope, $timeout ,$interval, $location){

  // $scope.labels = ["Download Sales", "In-Store Sales", "Mail-Order Sales"];
  // $scope.chart_data = [300, 500, 100];
  // $scope.chart_legend = [{'alittle':50}, {'alittle':50}, {'alittle':50}];
  $scope.options = {legend: {display: true}};

  $scope.getData = function() {
    $http.get("http://steemprices.com/assets/data.json")
    .then(function(response){
        // response.data.BTC_USD = Math.random()*1000;
        $rootScope.data = response.data;
        // $rootScope.data.arbs = {};
    });
  };

  $scope.getMarket = function() {
    $http.get("http://steemprices.com/assets/market.json")
    .then(function(response){
        // response.data.BTC_USD = Math.random()*1000;
        $rootScope.market = response.data;
    });
  };

  $scope.getArbi = function(num1,num2,num3) {
    var highest = Math.max.apply(null, [num1,num2,num3]);
    var lowest = Math.min.apply(null, [num1,num2,num3]);
    var arbi = Number(highest) - Number(lowest);
    return arbi;
  };

  $scope.getArbs = function() {
    $rootScope.data.arbs = {};
    var data = $rootScope.data;
    $rootScope.data.arbs.steem_btc = $scope.getArbi(data.BTC_STEEM.Poloniex.last, data.BTC_STEEM.Bittrex.last, data.SBD_STEEM.Internal.last/data.BTC_USD);
    $rootScope.data.arbs.sbd_btc = $scope.getArbi(data.BTC_SBD.Poloniex.last, data.BTC_SBD.Bittrex.last, data.BTC_SBD.Bittrex.last);
    $rootScope.data.arbs.steem_usd = $scope.getArbi(data.BTC_STEEM.Poloniex.last*data.BTC_USD, data.BTC_STEEM.Bittrex.last*data.BTC_USD, data.SBD_STEEM.Internal.last);
    $rootScope.data.arbs.sbd_usd = $scope.getArbi(data.BTC_SBD.Poloniex.last*data.BTC_USD, data.BTC_SBD.Bittrex.last*data.BTC_USD, data.BTC_SBD.Bittrex.last*data.BTC_USD);
  }

  $scope.countReward = function() {
    $scope.chart_data = [];
    $scope.labels = [];
    var data = $rootScope.market;
    var labels = $scope.labels;
    var chart_data = $scope.chart_data;
    // for (var i = 0; i < data.liquidityRewards.length; i ++) {
    //   if (labels.indexOf(data.liquidityRewards[i].account) < 0) {
    //     labels.push(data.liquidityRewards[i].account);
    //     chart_data.push(1);
    //   } else {
    //     chart_data[labels.indexOf(data.liquidityRewards[i].account)] = chart_data[labels.indexOf(data.liquidityRewards[i].account)] + 1;
    //   }
    // };
    var hash = {};
    var table = [];
    for (var i = 0; i < data.liquidityRewards.length; i ++) {
      if (!hash[data.liquidityRewards[i].account]) hash[data.liquidityRewards[i].account] = 0;
      hash[data.liquidityRewards[i].account] += 1;
    }
    Object.keys(hash).forEach(function(account) {
      table.push({account: account, count: hash[account]});
    });
    table.sort(function(a,b){return a.count<b.count ? 1 : -1});
    table.forEach(function(entry) {
      chart_data.push(entry.count);
      labels.push(entry.account);
    });
    $scope.tableDistribution = table;
  }

  // function loop() {
  //   $scope.getData(function(){
  //     $scope.getArbs(function(){
  //       setTimeout(loop, 5*1000);
  //     });
  //   });
  // }
  // loop();
  $scope.getData();
  $scope.getMarket();
  $timeout(function () {
      $scope.getArbs();
      $scope.countReward();
  }, 1200);


  $interval(function(){
    //Get orderbook from 3 exchanges
    $scope.getData();
    $scope.getMarket();
    $scope.getArbs();
  }, 10000);

}]);
