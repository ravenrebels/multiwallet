import { getConfig } from "../getConfig";
import { getRPC, methods } from "@ravenrebels/ravencoin-rpc";

import * as Key from "../Key";
import { getPrivateKey } from "../Utils";
import { IUTXO } from "../Types";

const ONE_HUNDRED_MILLION = 1e8;

const config = getConfig();
export const rpc = getRPC(
  config.raven_username,
  config.raven_password,
  config.raven_url
);
export function getAssetData(assetName: string) {
  return rpc(methods.getassetdata, [assetName]);
}
export function sendRawTransaction(signedTransaction: any) {
  const p = rpc(methods.sendrawtransaction, [signedTransaction.hex]);
  p.catch((e) => {
    console.dir(e);
  });
  return p;
}
export function signRawTransaction(
  rawTransactionHex: any,
  privateKeys: Array<string>
) {
  console.log("raw transaction", rawTransactionHex);

  const s = rpc(methods.signrawtransaction, [
    rawTransactionHex,
    null,
    privateKeys,
  ]);
  return s;
}

export function decodeRawTransaction(raw: string) {
  return rpc(methods.decoderawtransaction, [raw]);
}

export function getRawTransaction(id: string): any {
  return rpc(methods.getrawtransaction, [id, true]);
}
export function createRawTransaction(inputs: any, outputs: any) {
  return rpc(methods.createrawtransaction, [inputs, outputs]);
}

export function getBalance(addresses: Array<string>): Promise<any> {
  const includeAssets = true;
  const promise = rpc(methods.getaddressbalance, [
    { addresses: addresses },
    includeAssets,
  ]);
  return promise;
}

export function getUnspentTransactionOutputs(addresses: Array<string>) {
  /*
  Seems like getaddressutxos either return RVN UTXOs or asset UTXOs
  Never both.
  So we make two requests and we join the answer
  */
  const raven = rpc(methods.getaddressutxos, [{ addresses }]);
  const assets = rpc(methods.getaddressutxos, [{ addresses, assetName: "*" }]);

  return Promise.all([raven, assets]).then((values: Array<any>) => {
    const all = values[0].concat(values[1]);
    return all;
  });
}
/*
async function sendFromUser1ToUser2() {
  //Lets send 1 000 RVN from user1 to user2

  //Get all unspent transaction outputs from user 1
  //Get an address for user 2

  const addresses = {
    user1: Key.getAddressObjects("user1", config.network),
    user2: Key.getAddressObjects("user2", config.network),
  };
  const amount = 117;

  const sendToAddress = addresses.user2[0].address;
  console.log("user2.length", addresses.user2.length);
  const a = addresses.user1.map(function (a) {
    return a.address;
  });
  const u = rpc(methods.getaddressutxos, [{ addresses: a }]);

  u.catch((e) => {
    console.dir(e);
  });
  const unspent = await u;

  //Iterate over unspent and find enough unspent to send AMOUNT to user 2
  console.log("UNSPENT", unspent);
  const enoughUnspent: any = [];
  const privateKeys: Array<string | undefined> = [];

  let unspentAmount = 0;
  unspent.map((unspentObject) => {
    const a = unspentObject.satoshis / ONE_HUNDRED_MILLION;
    console.log("Processing unspent", unspentObject);
    console.log(a);
    if (unspentAmount < amount) {
      unspentAmount = unspentAmount + a;
      privateKeys.push(getPrivateKey(addresses.user1, unspentObject.address));
      enoughUnspent.push(unspentObject);
    }
  });

  if (unspentAmount < amount) {
    console.error("Could not find enough RVN to send");
    process.exit(1);
  }

  //OK now we know which unspent transaction outputs we must use.
  console.log("TO be able to send", amount, " we will input", unspentAmount);
  console.log("ENOUGH UNSPENT", enoughUnspent);
  const fee = 0.02;
  const changeAmount = unspentAmount - (amount + fee);
  const changeAddress = addresses.user1[1].address;
  const outputs = {
    [sendToAddress]: amount,
    [changeAddress]: changeAmount,
  };

  const inputs = enoughUnspent.map(function (bla) {
    //OK we have to convert from "unspent" format to "vout"

    const obj = {
      txid: bla.txid,
      vout: bla.outputIndex,
      address: bla.address,
    };
    return obj;
  });
  console.log("Enough unspent", inputs);
  console.log("outputs", outputs);
  const t = rpc(methods.createrawtransaction, [inputs, outputs]);
  t.catch((e) => {
    console.dir(e);
  });
  const rawTransaction = await t;
  console.log("RAW TRANSACTION", rawTransaction);

  console.log("Let's sign the raw transaction");
  const s = rpc(methods.signrawtransaction, [
    rawTransaction,
    null,
    privateKeys,
  ]);

  s.catch((e) => {
    console.dir(e);
  });
  const signedTransaction = await s;

  console.log("Lets publish the transaction");
}*/
export async function getMempool() {
  const ids = await rpc(methods.getrawmempool, []);

  const result: any = [];
  for (const id of ids) {
    const transaction = await getRawTransaction(id);
    result.push(transaction);
  }
  return result;
}
export function convertUTXOsToVOUT(UTXOs: Array<IUTXO>) {
  const inputs = UTXOs.map(function (bla) {
    //OK we have to convert from "unspent" format to "vout"

    const obj = {
      txid: bla.txid,
      vout: bla.outputIndex,
      address: bla.address,
    };
    return obj;
  });
  return inputs;
}
