import { getAddressObjects } from "../Key";
import { IUser, IUTXO, IVOUT } from "../Types";
import * as blockchain from "./blockchain";
import { getConfig } from "../getConfig";

const config = getConfig();

interface IInternalSendIProp {
  amount: number;
  assetName: string;
  fromUser: IUser;
  toAddress: string;
}

async function isValidAddress(address: string) {
  const obj = await blockchain.validateAddress(address);
  return obj.isvalid === true;
}

function sumOfUTXOs(UTXOs: Array<IUTXO>) {
  let unspentRavencoinAmount = 0;
  UTXOs.map(function (item) {
    const newValue = item.satoshis / 1e8;
    unspentRavencoinAmount = unspentRavencoinAmount + newValue;
  });
  return unspentRavencoinAmount;
}
async function _send(options: IInternalSendIProp) {
  const { amount, assetName, fromUser, toAddress } = options;

  const isAssetTransfer = assetName !== "RVN";

  //VALIDATION
  if ((await isValidAddress(toAddress)) === false) {
    throw Error("Invalid address " + toAddress);
  }
  if (amount < 0) {
    throw Error("Cant send less than zero");
  }
  const addressObjects = getAddressObjects(fromUser.mnemonic, config.network);
  const addresses = addressObjects.map((a) => a.address);

  const ravencoinChangeAddress = addresses[1];
  const assetChangeAddress = addresses[3]; //TODO change addresses should be checked with the blockchain, find first unused address

  let UTXOs = await blockchain.getRavenUnspentTransactionOutputs(addresses);

  //TODO, remove UTXOs that are in mempool (being used)
  const enoughRavencoinUTXOs = getEnoughUTXOs(
    UTXOs,
    isAssetTransfer ? 1 : amount
  );

  //Sum up the whole unspent amount
  let unspentRavencoinAmount = sumOfUTXOs(enoughRavencoinUTXOs);

  if (isAssetTransfer === false) {
    if (amount > unspentRavencoinAmount) {
      throw Error("Insufficient funds, cant send " + amount);
    }
  }

  const fee = 0.02; //TODO this should not be hardcoded in the long run
  const rvnAmount = isAssetTransfer ? 0 : amount;
  const ravencoinChangeAmount = unspentRavencoinAmount - rvnAmount - fee;

  const inputs = blockchain.convertUTXOsToVOUT(enoughRavencoinUTXOs);
  const outputs: any = {};
  //Add asset inputs
  if (isAssetTransfer === true) {
    await addAssetInputsAndOutputs(
      addresses,
      assetName,
      amount,
      inputs,
      outputs,
      toAddress,
      assetChangeAddress
    );
  } else if (isAssetTransfer === false) {
    outputs[toAddress] = rvnAmount;
  }
  outputs[ravencoinChangeAddress] = getTwoDecimalTrunc(ravencoinChangeAmount);

  console.log("Total input value", unspentRavencoinAmount);
  console.log("OUTPUTS", outputs);
  //Now we have enough UTXos, lets create a raw transactions
  const raw = await blockchain.createRawTransaction(inputs, outputs);

  //OK lets find the private keys (WIF) for input addresses
  type TPrivateKey = {
    [key: string]: string;
  };

  const privateKeys: TPrivateKey = {};
  inputs.map(function (input: IVOUT) {
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
}

async function addAssetInputsAndOutputs(
  addresses: string[],
  assetName: string,
  amount: number,
  inputs: IVOUT[],
  outputs: any,
  toAddress: string,
  assetChangeAddress: string
) {
  const assetUTXOs = await blockchain.getAssetUnspentTransactionOutputs(
    addresses,
    assetName
  );
  const _UTXOs = getEnoughUTXOs(assetUTXOs, amount);
  const _inputs = blockchain.convertUTXOsToVOUT(_UTXOs);
  _inputs.map((item) => inputs.push(item));

  outputs[toAddress] = {
    transfer: {
      [assetName]: amount,
    },
  };

  const assetSum = sumOfUTXOs(_UTXOs);
  outputs[assetChangeAddress] = {
    transfer: {
      [assetName]: assetSum - amount,
    },
  };
}

function getTwoDecimalTrunc(num: number) {
  return Math.trunc(num * 100) / 100;
}
//Find answer here https://stackoverflow.com/questions/11832914/how-to-round-to-at-most-2-decimal-places-if-necessary
//In JavaScript the number 77866.98 minus 111 minus 0.2 equals 77755.95999999999
//We want it to be 77755.96

export async function send(
  fromUser: IUser,
  toAddress: string,
  amount: number,
  assetName: string
) {
  return _send({ fromUser, toAddress, amount, assetName });
}

function getEnoughUTXOs(utxos: Array<IUTXO>, amount: number) {
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
}
function getTotalAmount(utxos: Array<IUTXO>) {
  let unspentAmount = 0;
  utxos.map(function (item) {
    const newValue = item.satoshis / 1e8;
    unspentAmount = unspentAmount + newValue;
  });
  return unspentAmount;
}
/*
async function transferAsset(
  fromUser: IUser,
  toAddress: string,
  assetName: string,
  amount: number
) {
  const addressObjects = getAddressObjects(fromUser.mnemonic, config.network);
  const addresses = addressObjects.map((a) => a.address);

  //Validate user has enough funds
  const balance = await blockchain.getBalance(addresses);
  console.log("BALANCE", fromUser, balance);
  //We need Ravencoin UTXOs to be able to pay transactions fees
  const UTXOs = await blockchain.getAssetUnspentTransactionOutputs(
    addresses,
    assetName
  );

  if (UTXOs.length === 0) {
    throw new Error("No RVN, can't pay fee");
  }
  //Lets get all our unspent transaction for this *assetName*
  const assetUTXOs = await blockchain.getAssetUnspentTransactionOutputs(
    addresses,
    assetName
  );

  //CALCULATE THE FEE
  const enough = getEnoughUTXOs(UTXOs, 1); //For the fee

  const enoughAssets = getEnoughUTXOs(assetUTXOs, amount);

  const unspentAmount = getTotalAmount(enough);
  const unspentAssetsAmount = getTotalAmount(enoughAssets);
  console.log("ASSET UTXOs", assetUTXOs);
  console.log("Unspent asset amount", unspentAssetsAmount);

  const fee = 0.02;
  const changeAmount = unspentAmount - fee;
  const assetChangeAmount = unspentAssetsAmount - amount;

  console.log("ASSET CHANGE AMOUNT", assetChangeAmount);
  const s1 = blockchain.convertUTXOsToVOUT(enough);
  const s2 = blockchain.convertUTXOsToVOUT(enoughAssets);
  const inputs = s1.concat(s2);

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
  const rawPromise = blockchain.createRawTransaction(inputs, outputs);
  rawPromise.then((data) => console.log(data)).catch((e) => console.log(e));
  const raw = await rawPromise;

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
}*/
