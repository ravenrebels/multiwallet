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

  //TODO change addresses should be checked with the blockchain,
  //find first unused change address
  const ravencoinChangeAddress = addresses[1];
  const assetChangeAddress = addresses[3];

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
  //Found answer here https://stackoverflow.com/questions/11832914/how-to-round-to-at-most-2-decimal-places-if-necessary
  //In JavaScript the number 77866.98 minus 111 minus 0.2 equals 77755.95999999999
  //We want it to be 77755.96
  return Math.trunc(num * 100) / 100;
}

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
