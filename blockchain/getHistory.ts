import { methods } from "@ravenrebels/ravencoin-rpc";

import { rpc } from "./blockchain";

function indexOfAddress(obj, addresses) {
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
    const rawTransaction = await rpc(method, args);
    rawTransaction.hash = null;
    rawTransaction.blockhash = null;
    //Delete stuff from vin
    rawTransaction.vin.map((v) => {
      delete v.scriptSig.asm;
      delete v.scriptSig.hex;
      delete v.txid;
      v.index = indexOfAddress(v, addresses);
    });
    rawTransaction.vout.map((v) => {
      delete v.scriptPubKey.hex;
      delete v.scriptPubKey.asm;
      delete v.spentTxId;
      v.index = indexOfAddress(v, addresses);
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
