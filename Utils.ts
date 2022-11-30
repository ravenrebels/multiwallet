import { IAddressMetaData } from "./Types";
import * as fs from "fs";
import { IConfig } from "./Types";

import * as Key from "./Key";

const ONE_HUNDRED_MILLION = 1e8;

export function getPrivateKey(
  addresses: Array<IAddressMetaData>,
  address: string
): string | undefined {
  let result: string | null = null;
  for (const a of addresses) {
    if (a.address === address) {
      return a.WIF;
    }
  }
}
export function convertUTXOsToVOUT(UTXOs) {
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
