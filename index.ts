import { IAddressMetaData } from "./Types";
import { getBalance } from "./blockchain";
import { getAddressObjects } from "./getAddressObjects";

/*
getaddressbalance
getaddressmempool
getaddressutxos
getaddresstxids
*/

async function test() {
  const addresses = getAddressObjects("user2", "rvn-test");
  const _addresses = addresses.map(function (a) {
    return a.address;
  });
  console.log("ADDRESS 0", _addresses[4]);
  const balance = await getBalance(_addresses);

  console.log("balance", balance);
  const asdf = balance[0].balance / 1e8;
  console.log("balance", asdf.toLocaleString());
}
/*
async function listTransactions(userName) {
  const user = require("./" + userName + ".json");

  const addresses = getAddresses("user1", "rvn-test");

  const _addresses = addresses.map((a) => {
    return a.address;
  });

  const obj = {
    addresses: _addresses,
  };
  const asdf = rpc(methods.getaddresstxids, [obj]);
  asdf.catch((e) => {
    console.dir(e);
  });
  const y = await asdf;
  console.log(y);
}*/
//listTransactions("user2");
test();
