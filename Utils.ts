import { IAddressMetaData } from "./Types";
import * as fs from "fs";
import { IConfig } from "./Types";

import * as Key from "./Key";

const ONE_HUNDRED_MILLION = 1e8;

const config = getConfig();

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

export function getConfig(): IConfig {
  //Validate that the config file exists

  const fileName = "./config.json";
  if (fs.existsSync(fileName) === false) {
    throw new Error(fileName + " not found. Please create it");
    process.exit(1);
  }

  const config = JSON.parse(fs.readFileSync(fileName, "utf-8"));
  return config;
}
