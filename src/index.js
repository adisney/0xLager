var fs = require('fs');
var app = require('./app.js');

var host = process.argv[2];
var port = process.argv[3];
var path = process.argv[4];

app.initWeb3(host, port);
app.loadAbis(path);
console.log(JSON.stringify(app.topicMap));

// Cryptokitties '0x06012c8cf97BEaD5deAe237070F9587f8E7A266d'
if (process.argv[5] != null) {
  var contractAddress = process.argv[5];
  app.subscribeToLogs(contractAddress);
} else {
  app.subscribeToExistingContractEvents();
  app.subscribeAndListen();
}
