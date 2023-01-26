

--@block
SHOW databases;

--@block
CREATE TABLE exchangeTickers (
    symbol VARCHAR(16) NOT NULL PRIMARY KEY,
    baseAsset VARCHAR(16) NOT NULL,
    quoteAsset VARCHAR(4) NOT NULL,
    listingStatus VARCHAR(9) NOT NULL,
    modifiedDate DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
)

--@block
INSERT INTO exchangeTickers (symbol,baseAsset,quoteAsset,listingStatus)
values ('BTCUSDT','BTC','USDT','trading')

--@block
DROP TABLE airbnb.exchangeTickers