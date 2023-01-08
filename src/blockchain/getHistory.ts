import { methods } from "@ravenrebels/ravencoin-rpc";
import { ITransaction } from "../Types";
import { isByUser } from "../UserTransaction";
import { rpc } from "./blockchain";
import { IVout } from "../Types";
export async function getPositionOfLastUsedAddress(addresses: Array<string>) {

  let position = 0;
  let index = 0;
  for (const addy of addresses) {
    const a = [addy];
    const _hasHistory = await hasHistory(a);
    if (await hasHistory(a) === true) {
      position = index;
    }
    index = index + 1;
  }
  return position;

}

function indexOfAddress(obj: any, addresses: Array<string>) {
  const text = JSON.stringify(obj);
  for (const a of addresses) {
    if (text.indexOf(a) > -1) {
      return addresses.indexOf(a);
    }
  }
  return -1;
}
function tagMyAddresses(transaction: any, addresses: Array<string>) {
  transaction.vin.map((v: any) => {
    const index = indexOfAddress(v, addresses);
    v.indexOfMyAddress = index;
  });
}
export async function hasHistory(addresses: Array<string>): Promise<boolean> {

  const includeAssets = true;
  const obj = {
    addresses,
  };
  const asdf = await rpc(methods.getaddresstxids, [obj, includeAssets]);
  return asdf.length > 0;
}
export async function getHistory(addresses: Array<string>): Promise<any> {

  const includeAssets = true;

  const transactions:Array<ITransaction> = await rpc(methods.getaddresstxids, [{
    addresses,
  }, includeAssets]);

  const MAX_LIMIT = 10000;
  if (transactions.length > MAX_LIMIT) {
    throw Error(transactions.length.toLocaleString() + " exceeds the max limit of transactions " + MAX_LIMIT.toLocaleString());
  }

  interface History {
    inputs: Array<any>;
    outputs: Array<any>;
  }
  const history: History = {
    inputs: [],
    outputs: [],
  };




  const result: any = [];

  //Get all the transactions, remove unessential attributes such as hex
  for (const transactionId of transactions) {
    const method = "getrawtransaction";
    const args = [transactionId, true];

    const rawTransaction: ITransaction = await rpc(method, args);
    delete rawTransaction.hash;



    //Delete stuff from vin
    rawTransaction.vin.map((v) => {
      if (!v.scriptSig) {
        //IF coinbase input, just ignore
        return;
      }
      //@ts-ignore
      delete v.scriptSig.asm;
      //@ts-ignore
      delete v.scriptSig.hex;
      //@ts-ignore
      delete v.txid;
      v.c_index = indexOfAddress(v, addresses);
    });
    rawTransaction.vout.map((v) => {
      //@ts-ignore
      delete v.scriptPubKey.hex;
      //@ts-ignore
      delete v.scriptPubKey.asm;
      //@ts-ignore
      delete v.spentTxId;
      v.c_index = indexOfAddress(v, addresses);
    });




    delete rawTransaction.hex;
    const json = JSON.stringify(rawTransaction.vin);

    //If the VIN json includes any of my address I did send this stuff.
    //Otherwise I received stuff
    let didSend = isByUser(addresses, rawTransaction);


    if (didSend) {

      history.outputs.push(rawTransaction);
    } else {

      //Remove vout and that are not ours
      rawTransaction.vout = rawTransaction.vout.filter(item => {

        if (item.c_index === undefined) {
          return false;
        }
        if (item.c_index === 0) {
          return true;
        }
        return item.c_index % 2 === 0;
      });

      history.inputs.push(rawTransaction);
    }
    result.push(rawTransaction);
  }

  return history;
}

function removeMyVOUTS(addresses: Array<string>, rawTransaction: ITransaction) {

  function filter(item: IVout, index:number, arr:any): boolean {
    if (item.c_index === undefined) {
      return false;
    }
    if (item.c_index === 0) {
      return true;
    }
    return item.c_index % 2 === 0;
  }

  rawTransaction.vout = rawTransaction.vout.filter(filter);

  return rawTransaction;

}