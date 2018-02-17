process.argv.forEach((val, index) => {
    console.log(`${index}: ${val}`);
});

var host = process.argv[2];
var port = process.argv[3];
var path = process.argv[4];
var contractAddress
if (process.argv[5] == null) {
    contractAddress = "0xd30b218a119c4b1adcba0c6fc5c62f83dd11c802"; //subscribetoblocks here
} else {
    contractAddress = process.arg[5];
}


var fs = require('fs');
var Web3 = require('web3');
var web3 = new Web3(new Web3.providers.WebsocketProvider("ws://"+host+":"+port));
var _ = web3.utils._;

var contractSpecFiles = fs.readdirSync(path);
contractSpecFiles.forEach((contractSpecFile, index) => {

    console.log(`contract spec ${contractSpecFile}`);
    if (contractSpecFile.includes(".json")) {
        var contractSpec = JSON.parse(fs.readFileSync(path+contractSpecFile));
        var topicMap = {};
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
        console.log(JSON.stringify(topicMap));

        web3.eth.subscribe('logs', {
            address: contractAddress
        }, (error, result) => {
            if (error) {
                console.log("There was an error: " + error);
                return;
            }
            var topic = result.topics[0];
            if (topic in topicMap) {
                var eventAbi = topicMap[topic].abi;
                var decoded = web3.eth.abi.decodeLog(eventAbi.inputs, result.data, result.topics);
                var args = {};
                _.reduce(eventAbi.inputs, (memo, input) => {
                    args[input.name] = decoded[input.name];
                    return memo;
                }, args);
                console.log(eventAbi.name + " " + JSON.stringify(args, null, 2));
            }
        });
    }
});

