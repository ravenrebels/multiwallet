import { IAddressMetaData, IUTXO } from "./Types";




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
