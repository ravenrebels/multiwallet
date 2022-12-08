# multiwallet

A hot custodial Ravencoin wallet.

# Getting started

Clone the git repo `git clone https://github.com/ravenrebels/multiwallet.git`

### Install dependencies

```
cd ./multiwallet
```

```
`npm install
```

### Build

(builds client gui)

```
npm run build
```

### Configuration

Create a file called ./config.json with your username/password/url etc
Use this template and replace the values
- rvn for Ravencoin mainnet
- rvn-test for Ravencoin testnet 

```
{
  "raven_username": "jfk38fn202jc53",
  "raven_password": "jfk38fn202jc53",
  "raven_url": "http://localhost:18766",
  "network": "rvn-test"
}

```

### Start the server

```
npm run serve
```

Server is now running on http://localhost:80
