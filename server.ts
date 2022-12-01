import * as express from "express";
import * as Blockchain from "./blockchain/blockchain";
import { getReceiveAddress } from "./blockchain/getReceiveAddress";
import { getHistory } from "./blockchain/getHistory";
import * as fs from "fs";
import * as Key from "./Key";

import { getConfig } from "./getConfig";
import * as userManager from "./userManager";

//Due to express >= 4 changes, we need to pass express-session to the function session-file-store exports in order to extend session.Store:

const session = require("express-session");
const FileStore = require("session-file-store")(session);

import * as Asdf from "./blockchain/Asdf";

import thumbnail from "./thumbnail";

const app = express();
const port = process.env.PORT || 80;

//ACCEPT BODY POST DATA
app.use(express.json());

//We have static stuff in dist, that is our graphical user interface web

app.use("/signin", express.static("signin"));

/* Session cookies */
app.use(
  session({
    secret: "mysecret",
    resave: false,
    saveUninitialized: true,
    store: new FileStore(),
  })
);

const config = getConfig();

//OUR MIDDLEWARE FOR USER MANAGEMENT
app.use((req, res, next) => {
  const path = req.baseUrl + req.path;
  if (path.startsWith("/signin") === true) {
    next();
    return;
  }
  console.log(req.path);
  const userId = req.session["userId"];
  if (!userId) {
    res.redirect("/signin");
    return;
  }
  const currentUser = userManager.getUserById(userId);
  req["currentUser"] = currentUser;
  next();
});
//Important that we declare static dist AFTER our middleware that check sign in status
app.use(express.static("dist"));
app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});

app.get("/thumbnail", thumbnail);

app.get("/receiveaddress", function (request, response) {
  const currentUser = request["currentUser"];
  const addresses = Key.getAddresses(currentUser, config.network);

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

app.get("/api/mempool", async function (request, response) {
  const promise = Blockchain.getMempool();
  promise
    .then((transactions) => {
      response.send(transactions);
    })
    .catch((e) => {
      console.dir(e);
      response.status(500).send({ error: e });
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
app.post("/signin/setupsession", (request, response) => {
  request.session["userId"] = request.body.userId;

  response.send({ status: "success" });
});
app.get("/signin/publicprofiles", (request, response) => {
  function getPublic(userId) {
    const user = userManager.getUserById(userId);
    const obj = {
      displayName: user.displayName,
      id: user.id,
      profileImageURL: user.profileImageURL,
    };
    return obj;
  }

  const users: Array<any> = [
    getPublic("user1"),
    getPublic("user2"),
    getPublic("user3"),
  ];

  response.send(users);
  return;
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

app.post("/send", (request, response) => {
  const user = request["currentUser"];

  const promise = Asdf.sendRavencoin(
    user,
    request.body.to,
    request.body.amount
  );
  promise
    .then((txid) => response.send({ txid }))
    .catch((e) => {
      response.status(500).send({ error: e });
    });
});

app.post("/signout", (request, response) => {
  console.log("Sign out");
  request.session.destroy(function (err) {
    console.log("SIGNED OUT SESSION DESTROYED");
  });
  response.redirect("/");
});
