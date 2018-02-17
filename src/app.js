var fs = require('fs');
var Web3 = require('web3');
var web3;
var _ = require('lodash');
var async = require('async');

function initWeb3(host, port) {
  this.web3 = new Web3(new Web3.providers.WebsocketProvider("ws://" + host + ":" + port));
}

function subscribeBlockHeaders() {
  return this.web3.eth.subscribe('newBlockHeaders');
}

async function getCreatedContractAddresses(blockHeader) {
  var block = await this.web3.eth.getBlock(blockHeader.number, true);
  var results = block.transactions.map(async (txn) => { 
    if (txn.to === null) {
      var receipt = await this.web3.eth.getTransactionReceipt(txn.hash);
      return receipt.contractAddress;
    }
  });
  return await Promise.all(results);
}

async function subscribeToLogs(contractAddress, topicMap) {
  this.web3.eth.subscribe('logs', {
    address: contractAddress
  }, (error, result) => {
    if (error) {
      console.log("There was an error: " + error);
      return;
    }
    var topic = result.topics[0];
    if (topic in topicMap) {
      var eventAbi = topicMap[topic].abi;
      var decoded = this.web3.eth.abi.decodeLog(eventAbi.inputs, result.data, result.topics);
      var args = {};
      this.web3.utils._.reduce(eventAbi.inputs, (memo, input) => {
        args[input.name] = decoded[input.name];
        return memo;
      }, args);
      console.log(eventAbi.name + " " + JSON.stringify(args, null, 2));
    }
  });
}

exports.initWeb3 = initWeb3;
exports.subscribeBlockHeaders = subscribeBlockHeaders;
exports.getCreatedContractAddresses = getCreatedContractAddresses;
exports.subscribeToLogs = subscribeToLogs;
