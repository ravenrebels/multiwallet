import { getAddressObjects } from "../Key";
import { IUser, IUTXO, IVOUT } from "../Types";
import * as blockchain from "./blockchain";
import { getConfig } from "../getConfig";
import {   ITransaction } from "../UserTransaction";




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
/*

    "Chicken and egg" situation.
    We need to calculate how much we shall pay in fees based on the size of the transaction.
    When adding inputs/outputs for the fee, we increase the fee.

    Lets start by first assuming that we will pay 1 RVN in fee (that is sky high).
    Than we check the size of the transaction and then we just adjust the change output so the fee normalizes
*/
async function getFee(inputs: Array<IVOUT>, outputs: Array<IVOUT>): Promise<number> {
  const ONE_KILOBYTE = 1024;
  //Create a raw transaction to get an aproximation for transaction size.
  const raw = await blockchain.createRawTransaction(inputs, outputs);

  //Get the lengt of the string bytes not the string
  //This is NOT the exact size since we will add an output for the change address to the transaction
  //Perhaps we should calculate size plus 10%?
  const size = Buffer.from(raw).length / ONE_KILOBYTE;

  let fee = 0.02;
  //TODO should ask the "blockchain" **estimatesmartfee**

  return fee * size;

}

async function _send(options: IInternalSendIProp) {
  const { amount, assetName, fromUser, toAddress } = options;

  const MAX_FEE = 1;


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

  //Remove UTXOs that are currently in mempool
  const mempool = await blockchain.getMempool();

  UTXOs = UTXOs.filter(UTXO => isUTXOInMempool(mempool, UTXO) === false);

  const enoughRavencoinUTXOs = getEnoughUTXOs(
    UTXOs,
    isAssetTransfer ? 1 : amount + MAX_FEE
  );

  //Sum up the whole unspent amount
  let unspentRavencoinAmount = sumOfUTXOs(enoughRavencoinUTXOs);

  console.log(
    "Total amount of UTXOs Ravencon being used in this transaction",
    unspentRavencoinAmount.toLocaleString(), amount.toLocaleString()
  );
  if (isAssetTransfer === false) {
    if (amount > unspentRavencoinAmount) {
      throw Error("Insufficient funds, cant send " + amount.toLocaleString() + " only have " + unspentRavencoinAmount.toLocaleString());
    }
  }



  const rvnAmount = isAssetTransfer ? 0 : amount;


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


  const fee = await getFee(inputs, outputs);

  const ravencoinChangeAmount = unspentRavencoinAmount - rvnAmount - fee;

  //Obviously we only add change address if there is any change
  if (getTwoDecimalTrunc(ravencoinChangeAmount) > 0) {
    outputs[ravencoinChangeAddress] = getTwoDecimalTrunc(ravencoinChangeAmount);
  }
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
  signedTransactionPromise.catch((e: any) => {
    console.dir(e);
  });

  const signedTransaction = await signedTransactionPromise;


  const txid = await blockchain.sendRawTransaction(signedTransaction);
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
  let assetUTXOs = await blockchain.getAssetUnspentTransactionOutputs(
    addresses,
    assetName
  );

  console.log("Asset UTXOs", assetUTXOs);
  const mempool = await blockchain.getMempool();
  assetUTXOs = assetUTXOs.filter(UTXO => isUTXOInMempool(mempool, UTXO) === false);


  const _UTXOs = getEnoughUTXOs(assetUTXOs, amount);
  const tempInputs = blockchain.convertUTXOsToVOUT(_UTXOs);
  tempInputs.map((item) => inputs.push(item));

  outputs[toAddress] = {
    transfer: {
      [assetName]: amount,
    },
  };

  const assetSum = sumOfUTXOs(_UTXOs);

  //Only add change address if needed
  if (assetSum - amount > 0) {
    outputs[assetChangeAddress] = {
      transfer: {
        [assetName]: assetSum - amount,
      },
    };
  }
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

function getEnoughUTXOs(utxos: Array<IUTXO>, amount: number): Array<IUTXO> {
  let tempAmount = 0;
  const returnValue: Array<IUTXO> = [];

  utxos.map(function (utxo) {

    if (utxo.satoshis !== 0 && tempAmount < amount) { 
      const value = utxo.satoshis / 1e8;
      tempAmount = tempAmount + value;
      returnValue.push(utxo);
    }
  });
  return returnValue;
}

export function isUTXOInMempool(mempool: Array<ITransaction>, UTXO: IUTXO): boolean {
  function format(transactionId: string, index: number) {
    return transactionId + "_" + index;
  }

  const listOfUTXOsInMempool: Array<string> = [];
  mempool.map((transaction) => {
    transaction.vin.map((vin) => {
      const id = format(vin.txid, vin.vout);
      listOfUTXOsInMempool.push(id);
    });
  });


  const index = listOfUTXOsInMempool.indexOf(format(UTXO.txid, UTXO.outputIndex));
  return index > -1;
}
