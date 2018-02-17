var fs = require('fs');
var Web3 = require('web3');
var web3 = new Web3(new Web3.providers.WebsocketProvider("ws://"+host+":"+port));
var _ = require('lodash');
var app = require('./app.js');

var host = process.argv[2];
var port = process.argv[3];
var path = process.argv[4];

function subscribeAndListen() {
  var subscription = app.subscribeBlockHeaders();
  subscription.on("data", async (header) => {
    var addresses = await app.getCreatedContractAddresses(header);
    addresses.forEach((address) => {
      app.subscribeToLogs(address, topicMap);
    });
  });
}

app.initWeb3(host, port);

var topicMap = app.loadAbis(path);
console.log(JSON.stringify(topicMap));
if (process.argv[5] == null) {
  //contractAddress = '0x06012c8cf97BEaD5deAe237070F9587f8E7A266d'; //Cryptokitties
} else {
  var contractAddress = process.argv[5];
  app.subscribeToLogs(contractAddress, topicMap);
}

subscribeAndListen();
