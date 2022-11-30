import * as express from "express";
import * as Blockchain from "./blockchain/blockchain";
import { getReceiveAddress } from "./blockchain/getReceiveAddress";
import { getHistory } from "./blockchain/getHistory";
import * as fs from "fs";
import * as Key from "./Key";

import { getConfig } from "./Utils";
import * as userManager from "./userManager";
const app = express();
const port = process.env.PORT || 80;
app.use(express.static("dist"));

const config = getConfig();

//OUR MIDDLEWARE FOR USER MANAGEMENT
app.use((req, res, next) => {
  const currentUser = userManager.getUserById("user1");
  req["currentUser"] = currentUser;
  next();
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
app.get("/receiveaddress", function (request, response) {
  const currentUser = request["currentUser"];
  const addresses = Key.getAddresses(currentUser.mnemonic, config.network);

  const promise = getReceiveAddress(addresses);
  promise.then((address) => {
    response.send({ address });
  });
});
//Even number are external addresses
app.get("/api/balance", function (request, response) {
  const currentUser = request["currentUser"];
  const addresses = Key.getAddresses(currentUser, config.network);

  Blockchain.getBalance(addresses)
    .then((data) => response.send(data))
    .catch((e) => {
      console.dir(e);
      response.status(500).send({ error: "Technical error" });
    });
});
app.get("/api/history", function (request, response) {
  const currentUser = request["currentUser"];
  const addresses = Key.getAddresses(currentUser, config.network);
  const promise = getHistory(addresses);
  promise
    .then((d) => {
      response.send(d);
    })
    .catch((e) => {
      response.status(500).send(e);
    });
});
app.get("/api/getaddressutxos", function (request, response) {
  const currentUser = request["currentUser"];
  const addresses = Key.getAddresses(currentUser, config.network);

  const promise = Blockchain.getUnspentTransactionOutputs(addresses);
  promise
    .then((data) => {
      response.send(data);
    })
    .catch((e) => {
      console.log("" + e);
      response.status(500).send({
        error: "Technical error",
        description: e,
      });
    });
});

app.get("/publicprofile", function (request, response) {
  const currentUser = request["currentUser"];
  const user1 = fs.readFileSync("./" + currentUser.id + ".json", "utf8");
  const obj = JSON.parse(user1);
  const result = {
    displayName: obj.displayName,
    profileImageURL: obj.profileImageURL,
  };
  response.send(result);
});
