import { getAddressObjects } from "../Key";
import { IUser } from "../Types";
import * as blockchain from "./blockchain";
import { getConfig } from "../getConfig";
import { response } from "express";

const config = getConfig();

export async function sendRavencoin(
  fromUser: IUser,
  toAddress,
  rvnAmount: number
) {
  const addressObjects = getAddressObjects(fromUser.mnemonic, config.network);
  const addresses = addressObjects.map((a) => a.address);

  let UTXOs = await blockchain.getUnspentTransactionOutputs(addresses);

  //Remove all UTXOS that are not RVN
  UTXOs = UTXOs.filter(function (item) {
    //RVN transactions do not have zero value
    if (item.statoshis === 0) {
      return false;
    }

    if (item.assetName !== "RVN") {
      return false;
    }

    return true;
  });

  const enough = getEnoughUTXOs(UTXOs, rvnAmount);

  let unspentAmount = 0;
  enough.map(function (item) {
    const newValue = item.satoshis / 1e8;

    unspentAmount = unspentAmount + item.satoshis / 1e8;
  });

  const fee = 0.02;
  const changeAmount = unspentAmount - rvnAmount - fee;

  //Find answer here https://stackoverflow.com/questions/11832914/how-to-round-to-at-most-2-decimal-places-if-necessary

  //In JavaScript the number 77866.98 minus 111 minus 0.2 equals 77755.95999999999
  //We want it to be 77755.96
  const twoDecimalTrunc = (num) => Math.trunc(num * 100) / 100;
  const inputs = blockchain.convertUTXOsToVOUT(enough);
  const changeAddress = addresses[1];
  const outputs = {
    [toAddress]: rvnAmount,
    [changeAddress]: twoDecimalTrunc(changeAmount),
  };
  console.log("Total input value", unspentAmount);
  console.log("OUTPUTS", outputs);
  //Now we have enough UTXos, lets create a raw transactions
  const rawPromise = blockchain.createRawTransaction(inputs, outputs);
  rawPromise.catch((e) => console.log(e));
  const raw = await rawPromise;

  //OK lets find the private keys (WIF) for input addresses
  const privateKeys = {};
  inputs.map(function (input: any) {
    const addy = input.address;
    const addressObject = addressObjects.find((a) => a.address === addy);
    if (addressObject) {
      privateKeys[addy] = addressObject.WIF;
    }
  });

  //Sign the transaction
  const keys: Array<string> = Object.values(privateKeys);
  const signedTransactionPromise = blockchain.signRawTransaction(raw, keys);
  signedTransactionPromise.catch((e) => {
    console.dir(e);
  });

  const signedTransaction = await signedTransactionPromise;

  const txid = await blockchain.sendRawTransaction(signedTransaction);
  console.log("Response after sending", txid);
  return txid;

  //OK now try to sign the transaction with bitcoinjs-lib
}
function getEnoughUTXOs(utxos, amount) {
  let tempAmount = 0;
  const returnValue: Array<any> = [];

  utxos.map(function (utxo) {
    if (utxo.satoshis !== 0 && tempAmount < amount) {
      const value = utxo.satoshis / 1e8;
      tempAmount = tempAmount + value;
      returnValue.push(utxo);
    }
  });
  return returnValue;
} /*
async function transferAsset(fromUser, toUser, assetName, amount) {
  const toAddress = getAddressForUser(toUser);
  const addressObjects = getAddressObjects(fromUser);
  const addresses = addressObjects.map((a) => a.address);

  const balance = await rpc(methods.getaddressbalance, [{ addresses }, true]);
  console.log("BALANCE", fromUser, balance);
  //We need Ravencoin UTXOs to be able to pay transactions fees
  const UTXOs = await rpc(methods.getaddressutxos, [
    {
      addresses: addresses,
    },
  ]);

  if (UTXOs.length === 0) {
    throw new Error("No RVN, can't pay fee");
  }
  //Lets get all our unspent transaction for this *assetName*
  const assetUTXOs = await rpc(methods.getaddressutxos, [
    {
      addresses,
      assetName,
    },
  ]);

  //CALCULATE THE FEE
  const enough = getEnoughUTXOs(UTXOs, 1); //For the fee

  const enoughAssets = getEnoughUTXOs(assetUTXOs, amount);

  function getTotalAmount(utxos) {
    const unspentAmount = utxos.reduce(function (accumulator, currentValue) {
      let value = 0;
      if (currentValue.satoshis > 0) {
        value = currentValue.satoshis / 1e8;
      }
      return accumulator + value;
    }, 0);
    return unspentAmount;
  }
  const unspentAmount = getTotalAmount(enough);
  const unspentAssetsAmount = getTotalAmount(enoughAssets);
  console.log("ASSET UTXOs", assetUTXOs);
  console.log("Unspent asset amount", unspentAssetsAmount);

  const fee = 0.02;
  const changeAmount = unspentAmount - fee;
  const assetChangeAmount = unspentAssetsAmount - amount;

  console.log("ASSET CHANGE AMOUNT", assetChangeAmount);
  const inputs = convertUTXOsToVOUT(enough).concat(
    convertUTXOsToVOUT(enoughAssets)
  );

  const changeAddress = addresses[1];
  const changeAddress2 = addresses[2];
  const outputs = {
    [changeAddress]: changeAmount,
  };

  //Now add the asset transfer output
  outputs[toAddress] = {
    transfer: {
      [assetName]: amount,
    },
  };

  if (assetChangeAmount > 0) {
    //Add the "change" for assets
    outputs[changeAddress2] = {
      transfer: {
        [assetName]: assetChangeAmount,
      },
    };
  }

  //Now we have enough UTXos, lets create a raw transactions
  const rawPromise = rpc(methods.createrawtransaction, [inputs, outputs]);
  rawPromise.then((data) => console.log(data)).catch((e) => console.log(e));
  const raw = await rawPromise;
  const plain = await rpc(methods.decoderawtransaction, [raw]);
  const result = {
    hex: raw,
    inputs,
    outputs,
    plain,
    enoughRavencoinInputs: enough,
    enoughAsssetsInputs: enoughAssets,
  };

  //OK lets find the private keys (WIF) for input addreses
  const privateKeys = {};
  inputs.map(function (input) {
    const addy = input.address;
    const addressObject = addressObjects.find((a) => a.address === addy);
    privateKeys[addy] = addressObject.WIF;
  });
  result.privateKeys = privateKeys;

  //Ask Ravencoin node to sign it, send private keys

  const s = rpc(methods.signrawtransaction, [
    result.hex,
    null,
    Object.values(privateKeys),
  ]);
  s.catch((e) => {
    console.log(e);
  });
  const signedTransaction = await s;

  result.signedTransaction = signedTransaction;
  const asdf = rpc(methods.decoderawtransaction, [signedTransaction.hex]);
  asdf.catch((e) => {
    console.log(e);
  });
  const plainSignedTransaction = await asdf;

  require("fs").writeFileSync(
    "./write.txt",
    JSON.stringify(plainSignedTransaction, null, 4)
  );
  const text = JSON.stringify(result, null, 4);
  require("fs").writeFileSync("./result.json", text);
}
*/
