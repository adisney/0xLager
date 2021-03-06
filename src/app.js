var fs = require('fs');
var Web3 = require('web3');
var web3;
var _ = require('lodash');
var topicMap;

function initWeb3(host, port, onopen) {
    var provider = new Web3.providers.WebsocketProvider("ws://" + host + ":" + port);
    provider
    if (onopen) {
        provider.on('connect', onopen);
    }
    this.web3 = new Web3(provider);
    this.web3.currentProvider.connection.addEventListener('close', () => {
        setTimeout(function(that, host, port, onopen) {
            that.initWeb3(host, port, onopen);
        }, 500, this, host, port, () => {
            this.subscribeToExistingContractEvents(topicMap);
            this.subscribeAndListen(topicMap);
        });
    });
}

function subscribeBlockHeaders() {
    var subscription = this.web3.eth.subscribe('newBlockHeaders');
    subscription.on("error", (error) => {
    });
    return subscription;
}

async function subscribeToExistingContractEvents() {
    var latestBlockNumber = await this.web3.eth.getBlockNumber();
    console.log("Searching for contracts created on the blockchain up to height: " + latestBlockNumber);
    for (var i=1; i <= latestBlockNumber; i++) {
        var addresses = await this.getCreatedContractAddresses(i);
        addresses.forEach((address) => {
            this.subscribeToLogs(address);
        });
    }
}

async function getCreatedContractAddresses(blockNumber) {
    var block = await this.web3.eth.getBlock(blockNumber, true);
    var results = block.transactions.map(async (txn) => { 
        if (txn.to === null) {
            var receipt = await this.web3.eth.getTransactionReceipt(txn.hash);
            return receipt.contractAddress;
        }
    });
    return (await Promise.all(results)).filter(Boolean);
}

async function subscribeToLogs(contractAddress) {
    console.log("Subscribing to events for contract at " + contractAddress);
    this.web3.eth.subscribe('logs', {
        address: contractAddress
    }, (error, result) => {
        if (error) {
            return;
        }
        var topic = result.topics[0];
        if (topic in this.topicMap) {
            var eventAbi = this.topicMap[topic].abi;
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

function loadAbis(path) {
    var topicMap = {};
    var contractSpecFiles = fs.readdirSync(path);
    contractSpecFiles.forEach((contractSpecFile, index) => {
        if (contractSpecFile.includes(".json")) {
            console.log("Loading abi from " + path + contractSpecFile);
            var contractSpec = JSON.parse(fs.readFileSync(path+contractSpecFile));
            var events = _.filter(contractSpec.abi, (elem) => {
                return elem.type === "event";
            });
            _.reduce(events, (memo, eventAbi) => {
                var signature = eventAbi.name + '(' + eventAbi.inputs.map(function(input) { return input.type; }).join(',') + ')';
                var hash = this.web3.utils.sha3(signature);
                memo[hash] = {
                    signature: signature,
                    hash: hash,
                    abi: eventAbi
                };
                return memo;
            }, topicMap);
        }
    });
    this.topicMap = topicMap;
}

function subscribeAndListen() {
    var subscription = this.subscribeBlockHeaders();
    subscription.on("data", async (header) => {
        var addresses = await this.getCreatedContractAddresses(header.number);
        addresses.forEach((address) => {
            this.subscribeToLogs(address);
        });
    });
}

exports.initWeb3 = initWeb3;
exports.subscribeToExistingContractEvents = subscribeToExistingContractEvents;
exports.subscribeBlockHeaders = subscribeBlockHeaders;
exports.getCreatedContractAddresses = getCreatedContractAddresses;
exports.subscribeToLogs = subscribeToLogs;
exports.loadAbis = loadAbis;
exports.subscribeAndListen = subscribeAndListen;
