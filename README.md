
# IC-appathon


## Start Geth in Private Mode

```
geth --genesis /Users/niksmac/ethereum/genesis.json --datadir /Users/niksmac/ethereum/datadir --networkid 1253 --nodiscover --maxpeers 0 --mine --rpc --rpcaddr "127.0.0.1" --minerthreads 1 --unlock "0x7a9b52d65281d6acc3a5410576031262e854a01e"
```

#### 2
```
geth --genesis /Users/niksmac/ethereum/genesis.json --datadir /Users/niksmac/ethereum/datadir --rpc --rpcaddr "127.0.0.1" --rpcport "8545" --dev --mine --unlock "0x7a9b52d65281d6acc3a5410576031262e854a01e"
```

#### 3
```
geth --genesis /Users/niksmac/ethereum/genesis.json --datadir /Users/niksmac/ethereum/datadir --rpc --rpcaddr "127.0.0.1" --rpcport "8545" --dev --mine --unlock "0x7a9b52d65281d6acc3a5410576031262e854a01e" --minerthreads 1 --ipcpath /Users/niksmac/Library/Ethereum/geth.ipc
```

`geth attach ipc://Users/niksmac/ethereum/datadir/geth.ipc`


## Start Redis Server
`redis-server`


## Accounts

```
personal.newAccount("123");
0x7a9b52d65281d6acc3a5410576031262e854a01e
"0x1b20a140b87663e53d63bcc3e49dd4a6949b5d3e"
"0xc07e1ad306c4aa7a4982983d2903a11e6b23bdcd"
"0x59f9bdccec46a8ad0805e9948bb5036340f1eea5"
```

