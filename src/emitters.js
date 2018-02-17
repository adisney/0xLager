var fs = require('fs');
var Web3 = require('web3');
var web3 = new Web3(new Web3.providers.WebsocketProvider("ws://127.0.0.1:8545"));
var _ = web3.utils._;
