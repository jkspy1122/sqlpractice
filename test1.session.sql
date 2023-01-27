

--@block
SHOW databases;

--@block
CREATE database cryptodata

--@block
CREATE TABLE exchangeTickers (
    symbol VARCHAR(16) NOT NULL PRIMARY KEY,
    baseAsset VARCHAR(16) NOT NULL,
    quoteAsset VARCHAR(4) NOT NULL,
    listingStatus VARCHAR(9) NOT NULL,
    modifiedDate DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
)

--@block
INSERT INTO exchangeTickers (symbol,baseAsset,quoteAsset,listingStatus);
values ('BTCUSDT','BTC','USDT','TRADING');

-- VALUES ('ETHUSDT','ETH','USDT','trading'),('APTUSDT','APT','USDT','trading') --

--@block
SELECT listingStatus,symbol FROM exchangeTickers;
UPDATE exchangeTickers;
SET listingStatus = 'SETTLING';
WHERE symbol = 'SRMUSDT';

--@block
UPDATE exchangetickers SET listingStatus='TRADING' WHERE symbol = 'SRMUSDT'

--@block
DROP TABLE exchangeTickers

--@block
DROP database cryptodata