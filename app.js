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
        this.jsonData = await (await fetch(this.api)).json();
        // console.log(this.jsonData);
        return this.jsonData;
    }
    
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

    //check exchange info for latest ticker and save to var
    async saveExchangeInfo() {
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
        console.log(previousTickers);
        //compare latestTickers,previousTickers. Mark de-listed tickers from Database and remove de-listed symbol from previousTickers
        const latestTickers = [];
        for (var i = 0; i < this.jsonData.symbols.length; i++) {
            if (this.jsonData.symbols[i].contractType === "PERPETUAL") {
                latestTickers.push(this.jsonData.symbols[i].symbol);
            }
        }
        console.log(latestTickers);
        return latestTickers;
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
            console.log('load from database.... '+previousTickers);
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
            console.log('deListedTicker load from database.... '+deListedTicker);
        });
}

const apiExchangeInfo = new apiCollection("https://fapi.binance.com/fapi/v1/exchangeInfo");
const apiKline = new apiCollection("https://api.binance.com/api/v3/klines?symbol=BTCUSDT&interval=1m&limit=1000");
const apiInterestRate = new apiCollection("https://fapi.binan");


setInterval(() => {
    apiExchangeInfo.getJson().then(
        () => {
        apiExchangeInfo.saveExchangeInfo();
    }
    )
},5000);