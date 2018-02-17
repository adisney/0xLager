var fs = require('fs');
var Web3 = require('web3');
var web3 = new Web3(new Web3.providers.WebsocketProvider("ws://"+host+":"+port));
var _ = require('lodash');
var app = require('./app.js');

var host = process.argv[2];
var port = process.argv[3];
var path = process.argv[4];
var contractAddress
if (process.argv[5] == null) {
  contractAddress = '0x06012c8cf97BEaD5deAe237070F9587f8E7A266d'; //subscribetoblocks here
} else {
  contractAddress = process.arg[5];
}

var contractSpecFiles = fs.readdirSync(path);
var topicMap = {};
contractSpecFiles.forEach((contractSpecFile, index) => {
  if (contractSpecFile.includes(".json")) {
    var contractSpec = JSON.parse(fs.readFileSync(path+contractSpecFile));
    var events = _.filter(contractSpec.abi, (elem) => {
      return elem.type === "event";
    });
    _.reduce(events, (memo, eventAbi) => {
      var signature = eventAbi.name + '(' + eventAbi.inputs.map(function(input) { return input.type; }).join(',') + ')';
      var hash = web3.utils.sha3(signature);
      memo[hash] = {
        signature: signature,
        hash: hash,
        abi: eventAbi
      };
      return memo;
    }, topicMap);
  }
});
console.log(JSON.stringify(topicMap));

app.initWeb3(host, port);
var subscription = app.subscribeBlockHeaders();
subscription.on("data", async (header) => {
  var addresses = await app.getCreatedContractAddresses(header);
  console.log(addresses);
  addresses.forEach((address) => {
    app.subscribeToLogs(address, topicMap);
  });
});
