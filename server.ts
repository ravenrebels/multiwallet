import * as express from "express";
import * as Blockchain from "./blockchain/blockchain";
import { getReceiveAddress } from "./blockchain/getReceiveAddress";
import { getHistory } from "./blockchain/getHistory";

import * as Key from "./Key";

import { getConfig } from "./Utils";

const app = express();
const port = process.env.PORT || 80;
app.use(express.static("dist"));

const config = getConfig();

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
app.get("/receiveaddress", async function (_, response) {
  const addresses = Key.getAddresses("user1", config.network);

  const address = await getReceiveAddress(addresses);
  response.send({ address });
});
//Even number are external addresses
app.get("/api/balance", function (request, response) {
  const addresses = Key.getAddresses("user1", config.network);
  Blockchain.getBalance(addresses)
    .then((data) => response.send(data))
    .catch((e) => {
      response.status(500).send({ error: "Technical error" });
    });
});
app.get("/api/history", function (request, response) {
  const addresses = Key.getAddresses("user1", config.network);
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
  const addresses = Key.getAddresses("user1", config.network);

  const promise = Blockchain.getUnspentTransactionOutputs(addresses);
  promise
    .then((data) => {
      response.send(data);
    })
    .catch((e) => {
      response.status(500).send({
        error: "Technical error",
        description: e,
      });
    });
});
