# Lager project

Logging command-line developer tool to find and stream contract creation events on a private test net, for debugging and analysis purposes. Uses truffle and ganache for test net.

"examples/pet-adoption" contains an example adapted from http://truffleframework.com/tutorials/pet-shop

Installation:
```
> npm install adisney/0xLager  //use the -g flag if you want it available for all projects, otherwise install inside your dev project folder.
```
Usage: `0xLager <host> <port> <path to abi files>`
```
> 0xLager "127.0.0.1" "8545" "/usr/local/bin/0xLager/examples/pet-adoption/build/contracts/"
```
-----

Example. Sub out pet-adoption project for your project.

Set up testnet:

```
> pwd
0xLager/examples/pet-adoption
> ganache-cli  //or to open up the same ganache session add your 12 word mnemonic: ganache-cli -m "rug caught van employ flush harbor lunar wool before coach eagle axe"
```
migrate the test
```
> pwd
0xLager/examples/pet-adoption
> truffle migrate
```
run the lager with localhost port, node, and full path to the abi files.

```
> pwd
0xLager
> 0xLager "127.0.0.1" "8545" "./examples/pet-adoption/build/contracts/"
```
or
```
> npm run demo
```
see the contracts being gathered, something like:
```
Searching for contracts created on the blockchain up to height: 4
Subscribing to events for contract at 0xBd9b894548a0cc0A5513b847A229472bb3995E02
Subscribing to events for contract at 0xd30b218a119C4B1adcba0C6Fc5c62f83dD11c802
...
```
back in the project, either run the truffle test to trigger contract creations:
```
> pwd
0xLager/examples/pet-adoption
> truffle test
```
or with metamask configured (set to your private test net):
```
> npm run dev
```
click on a Adopt button, accept the metamask transaction.
See the events.

Note that you can kill ganache (your test net) and bring it back up, and leave lager running.  The connection will fail but will start filtering for contract creation events again when ganache is restarted.


Common problems:
- make sure lite-server is installed for npm in your directory.
