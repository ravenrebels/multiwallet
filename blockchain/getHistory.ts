import { methods } from "@ravenrebels/ravencoin-rpc";
import { ITransaction } from "../UserTransaction";

import { rpc } from "./blockchain";

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
export async function getHistory(addresses: Array<string>): Promise<any> {
  const obj = {
    addresses,
  };

  interface History {
    inputs: Array<any>;
    outputs: Array<any>;
  }
  const elvis: History = {
    inputs: [],
    outputs: [],
  };
  const includeAssets = true;
  //Get all the transactions, remove un essential attributes such as hex
  const asdf = await rpc(methods.getaddresstxids, [obj, includeAssets]);

  const result: any = [];
  for (const transactionId of asdf) {
    const method = "getrawtransaction";
    const args = [transactionId, true];
    const rawTransaction: ITransaction = await rpc(method, args);
    delete rawTransaction.hash;

    //Delete stuff from vin
    rawTransaction.vin.map((v) => {
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
    const json = JSON.stringify(rawTransaction.vin);

    //If the VIN json includes any of my address I did send this stuff.
    //Otherwise I received stuff
    let didSend = false;
    addresses.map((address) => {
      if (json.indexOf(address) > -1) {
        didSend = true;
      }
    });
    delete rawTransaction.hex;

    if (didSend) {
      elvis.outputs.push(rawTransaction);
    } else {
      elvis.inputs.push(rawTransaction);
    }
    result.push(rawTransaction);
  }

  return elvis;
}
