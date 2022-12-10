//Weird imports for express but needed for Typescript to understand types
import { Request, Response, Application, Express } from "express";
// TODO Figure out how NOT to use require here.
const express = require("express");

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
const nocache = require("nocache");
import * as Asdf from "./blockchain/Asdf";

import thumbnail from "./thumbnail";
import { IUser } from "./Types";

const app: Express = express();
const port = process.env.PORT || 80;

//ACCEPT BODY POST DATA
app.use(express.json());

app.use(nocache());
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
  if (path.startsWith("/signout") === true) {
    next();
    return;
  }
  //@ts-ignore
  const userId = req.session["userId"];
  if (!userId) {
    res.redirect("/signin");
    return;
  }
  const currentUser = userManager.getUserById(userId);
  //@ts-ignore
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
  const currentUser = getCurrentUser(request);
  const addresses = Key.getAddresses(currentUser, config.network);

  const promise = getReceiveAddress(addresses);
  promise.then((address) => {
    response.send({ address });
  });
});
//Even number are external addresses
app.get("/api/balance", function (request, response) {
  const currentUser = getCurrentUser(request);
  const addresses = Key.getAddresses(currentUser, config.network);

  Blockchain.getBalance(addresses)
    .then((data) => response.send(data))
    .catch((e) => {
      console.dir(e);
      response.status(500).send({ error: "Technical error" });
    });
});
app.get("/api/history", function (request, response) {
  const currentUser = getCurrentUser(request);
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

app.get("/api/pendingtransactions", (request, response) => {
  const mempoolPromise = Blockchain.getMempool();
  mempoolPromise.then((data) => {
    if (data.length === 0) {
      response.status(204).send({});
      return;
    }

    const result = data.filter((item: any) => {
      const text = JSON.stringify(item);

      const currentUser = getCurrentUser(request);
      const addresses = Key.getAddresses(currentUser, config.network);
      for (const addy of addresses) {
        if (text.indexOf(addy) > -1) {
          return true;
        }
      }
    });
    response.send(result);
  });
});
app.get("/api/getaddressutxos", function (request, response) {
  const currentUser = getCurrentUser(request);
  const addresses = Key.getAddresses(currentUser, config.network);

  const promise = Blockchain.getAllUnspentTransactionOutputs(addresses);
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

app.get("/api/addresses", (request, response) => {
  const currentUser = getCurrentUser(request);
  const addresses = Key.getAddresses(currentUser, config.network);

  response.send(addresses);
});
app.post("/signin/setupsession", (request, response) => {
  //@ts-ignore
  request.session["userId"] = request.body.userId;
  response.send({ status: "success" });
});
app.get("/signin/publicprofiles", (request, response) => {
  function getPublic(userId: string) {
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
    getPublic("user4"),
    getPublic("user5"),
    getPublic("user6"),
  ];

  response.send(users);
  return;
});
app.get("/publicprofile", function (request, response) {
  const currentUser = getCurrentUser(request);
  const user1 = fs.readFileSync("./" + currentUser.id + ".json", "utf8");
  const obj = JSON.parse(user1);
  const result = {
    displayName: obj.displayName,
    profileImageURL: obj.profileImageURL,
  };
  response.send(result);
});

app.post("/send", (request, response) => {
  const user = getCurrentUser(request);
  const promise = Asdf.send(
    user,
    request.body.to,
    parseFloat(request.body.amount),
    request.body.assetName
  );

  promise
    .then((txid) => response.send({ txid }))
    .catch((e) => {
      if (e.error && e.error.message) {
        response.status(500).send({ error: e.error.message });
        return;
      } else response.status(500).send({ error: e + "" });
    });
});

app.post("/signout", (request, response) => {
  console.log("Sign out");
  if (request.session) {
    request.session.destroy(function (err) {
      console.log("SIGNED OUT SESSION DESTROYED");
    });
  }
  response.send({ status: "success" });
});

function getCurrentUser(request: Request): IUser {
  //@ts-ignore
  return request["currentUser"];
}
