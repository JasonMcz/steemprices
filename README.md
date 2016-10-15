# SteemPrices.com - Check Steem Prices Everywhere.

This git is the code responsible for SteemPrices.com maintained by [@jasonmcz](https://steemit.com/@jasonmcz) and [@zackcoburn](https://steemit.com/@zackcoburn)<br>
Read more here: [announcement link](https://steemit.com/steemit/@jasonmcz/we-are-big-steem-fans-and-we-built-steemprices-com-no-more-tab-switching-all-prices-on-one-site)

## Price Feed/Data
Currently we have the following pairs on the site from the above exchange APIs:

`BTC-USD`<br>
`USD-STEEM`<br>
`BTC-SBD`<br>
`BTC-STEEM`<br>
`ETH-STEEM`<br>
`USD-SBD`<br>

In addition, we are providing the same pair cross-exchange arbitrage opportunities:<br>
Followed by the following formula<br>

`$scope.getArbi = function(num1,num2,num3) {`<br>
  `var highest = Math.max.apply(null, [num1,num2,num3]);`<br>
  `var lowest = Math.min.apply(null, [num1,num2,num3]);`<br>
  `var arbi = Number(highest) - Number(lowest);`<br>
  `return arbi`<br>
`}`

## Getting Started

To get you started you can simply clone the repository and install the dependencies:

### Prerequisites

You can get git from<br>
[https://github.com/JasonMcz/steemprices].<br>
`git clone https://github.com/JasonMcz/steemprices`

### Install Dependencies 

 `sudo npm install`<br>
 `bower install (might require root)` 
 
### Start Server

`sh run.sh`
