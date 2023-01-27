//load variables from dotenv
require('dotenv').config()
//import mysql connector for mariaDB
const mysql = require('mysql2');


//create and init connection pool
const pool  = mysql.createPool({
    host: process.env.host,
    user: process.env.user,
    password : process.env.password,
    database : process.env.database,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

class apiCollection {
    constructor(api) {
        this.api = api;
        this.jsonData = null;
    }
    
    async getJson() {
        let success = false;
        let retryCounts = 0;
        let maxRetries = 4;
        let timeLag = 5000
        while(!success && retryCounts < maxRetries) {
            try {
                this.jsonData = await (await fetch(this.api)).json();
                success = true;
            } catch(e) {
                console.log('----An Error occured while fetching json data from remote host. Retry after 5 seconds. Retry Counts: ' + retryCounts + " Outer Round Counts: " + aa + " ---- " + (new Date().toLocaleString()) + " ---- ")
                await new Promise(resolve => setTimeout(resolve, timeLag)); //add timelag
                retryCounts++; //try 5 times no success then give up -> 無條件 return this.jsonData
            }
        }
        return this.jsonData;
    }
    
    //check exchange info for latest ticker and save to var
    async saveExchangeInfo() {
        //check if parsed json data is passed.
        if (this.jsonData === null) {
            console.log("You need to get json data first by calling getJson()");
            return;
        }
        //conpare every symbol with previousTickers and insert new tickers into DATABASE and previousTickers
        for (var i = 0 ; i < this.jsonData.symbols.length; i++) {
            if (this.jsonData.symbols[i].contractType === "PERPETUAL" && this.jsonData.symbols[i].status === "TRADING" && !previousTickers.includes(this.jsonData.symbols[i].symbol)) {
                previousTickers.push(this.jsonData.symbols[i].symbol);
                var symbol = this.jsonData.symbols[i].symbol;
                var baseAsset = this.jsonData.symbols[i].baseAsset;
                var quoteAsset = this.jsonData.symbols[i].quoteAsset;
                var status = this.jsonData.symbols[i].status;
                var sql = "INSERT INTO exchangeTickers (symbol,baseAsset,quoteAsset,listingStatus) VALUES (?,?,?,?)";
                var values = [symbol, baseAsset, quoteAsset, status];
                pool.query(sql, values, function (err, result) {
                    if (err) throw err;
                    console.log("1 record inserted");
                });
            }
        }
        //check all tickers with status='SETTLING'. Ignored if already exist in deListedTicker
        //Mark status='SETTLING' for newly found de-listed ticker from Database and remove de-listed symbol from previousTickers and pop from previousTickers
        for (var i = 0 ; i < this.jsonData.symbols.length; i++) {
            if (this.jsonData.symbols[i].contractType === "PERPETUAL" && this.jsonData.symbols[i].status === "SETTLING" && !deListedTicker.includes(this.jsonData.symbols[i].symbol)) {
                deListedTicker.push(this.jsonData.symbols[i].symbol);
                previousTickers.splice(previousTickers.indexOf(this.jsonData.symbols[i].symbol),1);
                var symbol = this.jsonData.symbols[i].symbol;
                var status = this.jsonData.symbols[i].status;
                //Sql Prepared Statement
                var sql = `UPDATE exchangetickers SET listingStatus= '${status}' WHERE symbol = '${symbol}'`;
                pool.query(sql, function (err, result) {
                    if (err) throw err;
                    // console.log("1 record inserted");
                });
                console.log('found 1 de-listed ticker. Database records updated. (ticker: ' + symbol + ')');
            }
        }
    }

    //Save parsed kline data to array finalData
    async saveKlinedata() {
        if (this.jsonData === null) {
            console.log("You need to get json data first by calling getJson()");
            return;
        }
        // console.log(typeof(this.jsonData));
        let finalData = this.jsonData.map(d => {
            return {time:d[0]/1000,open:parseFloat(d[1]),high:parseFloat(d[2]),low:parseFloat(d[3]),close:parseFloat(d[4])}
          });
        // console.log(finalData);
    }
}

//check previousTickers
const previousTickers = [];
if (previousTickers == 0) {
    pool.query(
        'SELECT symbol,listingStatus FROM cryptodata.exchangeTickers', function (err, results, fields) {
            for (let i = 0; i < results.length; i++) {
                if (results[i].listingStatus === "TRADING") {
                    previousTickers.push(results[i].symbol);
                }
            }
            console.log('Init process... loading previousTickers from database.... ');
            console.log(previousTickers);
            console.log('---------------------------------------------------------------');
        });
}

//check deListedTicker
const deListedTicker = [];
if (deListedTicker == 0) {
    pool.query(
        'SELECT symbol,listingStatus FROM cryptodata.exchangeTickers', function (err, results, fields) {
            for (let i = 0; i < results.length; i++) {
                if (results[i].listingStatus === "SETTLING") {
                    deListedTicker.push(results[i].symbol);
                }
            }
            console.log('Init process... loading deListedTicker from database.... ');
            console.log(deListedTicker);
            console.log('---------------------------------------------------------------');
        });
}
//main function of saveExchangeInfo. use 'setInterval(fetchData,yourTimeLag);' to start looping process.
var aa = 0
async function fetchData() {
    console.log('----Total check counts: ' + aa + " ---- " + (new Date().toLocaleString()) + " ---- ");
    apiExchangeInfo.getJson().then(
        () => {
            apiExchangeInfo.saveExchangeInfo();
            aa++;
        }
    )
}


//API參數區
const apiExchangeInfo = new apiCollection("https://fapi.binance.com/fapi/v1/exchangeInfo");
const apiKline = new apiCollection("https://api.binance.com/api/v3/klines?symbol=BTCUSDT&interval=1m&limit=1000");
const apiInterestRate = new apiCollection("https://fapi.binan");


setInterval(fetchData,60000);