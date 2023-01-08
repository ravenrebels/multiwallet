//Weird imports for express but needed for Typescript to understand types
import { Request, Express } from "express";
// TODO Figure out how NOT to use require here.
const express = require("express");

import * as Blockchain from "./blockchain/blockchain";
import { getReceiveAddress } from "./blockchain/getReceiveAddress";
import { getHistory } from "./blockchain/getHistory";

import * as Key from "./Key";

import { getConfig } from "./getConfig";
import * as userManager from "./userManager";
import * as UserTransaction from "./UserTransaction";
//Due to express >= 4 changes, we need to pass express-session to the function session-file-store exports in order to extend session.Store:

const session = require("express-session");
const FileStore = require("session-file-store")(session);
const nocache = require("nocache");
import * as Transactor from "./blockchain/Transactor";

import thumbnail from "./thumbnail";
import { ITransaction, IUser } from "./Types";


//Healthcheck
console.info("Initiating health check, running ", getConfig().network, getConfig().raven_url);
Blockchain.isHealthy().then(data => {
  if (!data) {
    process.exit(0);
  }
}).catch(e => {
  console.log(e);
  process.exit(1);
})


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

//Publicly avaiable routes declared BEFORE authentication/security middleware
app.get("/api/mempool", async function (_, response) {
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
app.get("/settings", (request, response) => {
  const obj = {
    assets: config.assets,
    mode: config.mode,
    headline: config.gui.headline,
    subTagline: config.gui.subTagline,
    tagline: config.gui.tagline,
  };
  response.send(obj);
});

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
    console.log("No user id will redirect");
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


app.get("/publicprofile", function (request, response) {
  const currentUser = getCurrentUser(request);

  const obj = userManager.getUserById(currentUser.id);
  const result = {
    displayName: obj.displayName,
    profileImageURL: obj.profileImageURL,
  };
  response.send(result);
});

app.get("/receiveaddress", async function (request, response) {
  const currentUser = getCurrentUser(request);
  const addresses = await Key.getAddresses(currentUser, config.network);

  const promise = getReceiveAddress(addresses);
  promise.then((address: string) => {
    response.send({ address });
  });
});
//Even number are external addresses
app.get("/api/balance", async function (request, response) {
  const currentUser = getCurrentUser(request);
  const addresses = await Key.getAddresses(currentUser, config.network);

  Blockchain.getBalance(addresses)
    .then((data) => response.send(data))
    .catch((e) => {
      console.dir(e);
      response.status(500).send({ error: "Technical error" });
    });
});
app.get("/api/history", async function (request, response) {
  const currentUser = getCurrentUser(request);
  const addresses = await Key.getAddresses(currentUser, config.network);
  const promise = getHistory(addresses);
  promise
    .then((d) => {
      response.send(d);
    })
    .catch((e) => {
      response.status(500).send({ "error": e + "" });
    });
});

app.get("/showasset", (request, response) => {
  const assetName = request.query.assetName;
  if (!assetName) {
    response.status(400).send("Error, no assetName query parameter");
    return;
  }
  if (assetName !== null) {
    const dataPromise = Blockchain.getAssetData(assetName + "");
    dataPromise.then((data) => {
      if (data.ipfs_hash) {
        response.redirect("https://dweb.link/ipfs/" + data.ipfs_hash);
        return;
      } else {
        response.send(
          "<h1>" + assetName + "</h1><p>Does not have any IPFS data"
        );
      }
    });
  }
});

app.get("/api/pendingtransactions", async (request, response) => {
  const data = await Blockchain.getMempool();

  if (data.length === 0) {
    response.status(204).send({});
    return;
  }

  const byUser: Array<ITransaction> = [];

  const currentUser = getCurrentUser(request);
  const addresses = await Key.getAddresses(currentUser, config.network);

  const toUserAssets: any = [];
  data.map((item: ITransaction) => {
    //Only handle transactions  that he user has NOT SENT herself
    if (UserTransaction.isByUser(addresses, item)) {
      byUser.push(item);
      return;
    }
    const result = UserTransaction.getSumOfAssetOutputs(addresses, item);
    if (Object.values(result).length > 0) {
      toUserAssets.push(result);
    }
  });

  response.send({
    toUserAssets,
    byUser,
  });

});

app.get("/api/myUTXOs", async function (request, response) {
  const currentUser = getCurrentUser(request);
  const addresses = await Key.getAddresses(currentUser, config.network);
  const asdf = await Blockchain.getRavenUnspentTransactionOutputs(addresses);
  response.send(asdf);
});
app.get("/api/getaddressutxos", async function (request, response) {
  const currentUser = getCurrentUser(request);
  const addresses = await Key.getAddresses(currentUser, config.network);

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
  //Validate, get user
  try {
    userManager.getUserById(request.body.userId);
  } catch (e) {
    response.status(400).send({ error: "" + e });
    return;
  }
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


app.post("/send", (request, response) => {
  //Validation, prevent RVN from being sent if not in RAVENCOIN_AND_ASSETS mode
  if (request.body.assetName === "RVN") {
    if (config.mode !== "RAVENCOIN_AND_ASSETS") {
      response.status(400).send({
        error:
          "You cant send RVN when in " +
          config.mode +
          " mode, can only send Assets",
      });
      return;
    }
  }

  const user = getCurrentUser(request);
  const promise = Transactor.send(
    user,
    request.body.to,
    parseFloat(request.body.amount),
    request.body.assetName
  );

  promise
    .then((txid) => response.send({ txid }))
    .catch((e) => {
      if (e.error && e.error.message) {
        console.dir(e);
        response.status(500).send({ error: e.error.message });
        return;
      } else response.status(500).send({ error: e + "" });
    });
});

app.post("/signout", (request, response) => {
  console.log("Sign out, terminating session for", getCurrentUser(request));
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
