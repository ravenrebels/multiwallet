# multiwallet

A hot custodial Ravencoin wallet.

# Getting started

Clone the git repo `git clone https://github.com/ravenrebels/multiwallet.git`

### Install dependencies

```
cd ./multiwallet
```

```
npm install
```

### Build

(builds client gui)

```
npm run build
```

### Configuration

Create a file called ./config.json with your username/password/url etc
Use this template and replace the values

- **rvn** for Ravencoin mainnet
- **rvn-test** for Ravencoin testnet

```
{
  "raven_username": "jfk38fn202jc53",
  "raven_password": "jfk38fn202jc53",
  "raven_url": "http://localhost:18766",
  "network": "rvn-test"
}

```

### Local Ravencoin full node / Raven core node

You are required to run a full Ravencoin node.
Your Ravencoin node is required to be configured with extra good indexing stuff.
Here is an example configuration

```

server=1
testnet=1

onlynet=ipv4
regtest=0
 listen=1
#Maintains the full transaction index on your node. Needed if you call getrawtransaction. Default is 0.
txindex=1

#Maintains the full Address index on your node. Needed if you call getaddress* calls. Default is 0.
addressindex=1

#Maintains the full Asset index on your node. Needed if you call getassetdata. Default is 0.
assetindex=1

#Maintains the full Timestamp index on your node. Default is 0.
timestampindex=1

#Maintains the full Spent index on your node. Default is 0.
spentindex=1

#Username and password - You can make this whatever you want.
rpcuser=secret
rpcpassword=secret

#What IP address is allowed to make calls to the RPC server. If youre running the wallet on the same machine youre
#developing on, this is fine. If not, you need to put the IP address of the machine CALLING the node here.
rpcallowip=127.0.0.1

dbcache=4096

upnp=1
```

### Start the server

```

npm run serve

```

Server is now running on http://localhost:80

You can change port by setting env variable PORT.
So running
`PORT=8080 npm run serve`
will start the server on port 8080
