import { getConfig } from "../getConfig";
import { getRPC, methods } from "@ravenrebels/ravencoin-rpc";


import { IUTXO, IValidateAddressResponse, IVout, IVout_when_creating_transactions } from "../Types";
import { ITransaction } from "../Types";

const ONE_HUNDRED_MILLION = 1e8;

const config = getConfig();
export const rpc = getRPC(
  config.raven_username,
  config.raven_password,
  config.raven_url
);
export function isHealthy(){
  return rpc(methods.getblockcount, []);
}
export function getAssetData(assetName: string) {
  return rpc(methods.getassetdata, [assetName]);
}
export function sendRawTransaction(signedTransaction: any) {
  const p = rpc(methods.sendrawtransaction, [signedTransaction.hex]);
  p.catch((e) => {
    console.log("send raw transaction");
    console.dir(e);
  });
  return p;
}
export function signRawTransaction(
  rawTransactionHex: any,
  privateKeys: Array<string>
) {


  const s = rpc(methods.signrawtransaction, [
    rawTransactionHex,
    null,
    privateKeys,
  ]);
  return s;
}

export function decodeRawTransaction(raw: string) {
  return rpc(methods.decoderawtransaction, [raw]);
}

export function getRawTransaction(id: string): any {
  return rpc(methods.getrawtransaction, [id, true]);
}
export function createRawTransaction(inputs: any, outputs: any): Promise<string> {
  return rpc(methods.createrawtransaction, [inputs, outputs]);
}

export async function validateAddress(
  address: string
): Promise<IValidateAddressResponse> {
  return rpc(methods.validateaddress, [address]);
}
export function getBalance(addresses: Array<string>): Promise<any> {
  const includeAssets = true;
  const promise = rpc(methods.getaddressbalance, [
    { addresses: addresses },
    includeAssets,
  ]);
  return promise;
}

export function _sortUTXOs(list: Array<IUTXO>) {

  //Remember, sort mutates the underlaying array
  //Sort by satoshis, lowest first to prevent dust.
  return list.sort(function (a, b) {

    if (a.satoshis > b.satoshis) {
      return 1;
    }
    if (a.satoshis < b.satoshis) {
      return -1;
    }
    return 0;
  });


}
export async function getRavenUnspentTransactionOutputs(
  addresses: Array<string>
): Promise<Array<IUTXO>> {


  const list: Array<IUTXO> = await rpc(methods.getaddressutxos, [{ addresses }]);
  _sortUTXOs(list);
  return list;


}
export function getAssetUnspentTransactionOutputs(
  addresses: Array<string>,
  assetName: string
): Promise<Array<IUTXO>> {
  const assets = rpc(methods.getaddressutxos, [{ addresses, assetName }]);
  return assets;
}

export function getAllUnspentTransactionOutputs(addresses: Array<string>) {
  /*
  Seems like getaddressutxos either return RVN UTXOs or asset UTXOs
  Never both.
  So we make two requests and we join the answer
  */
  const raven = rpc(methods.getaddressutxos, [{ addresses }]);
  const assets = rpc(methods.getaddressutxos, [{ addresses, assetName: "*" }]);

  return Promise.all([raven, assets]).then((values: Array<any>) => {
    const all = values[0].concat(values[1]);
    return all;
  });
}
export async function getMempool(): Promise<Array<ITransaction>> {
  const ids = await rpc(methods.getrawmempool, []);

  const result: any = [];
  for (const id of ids) {
    const transaction = await getRawTransaction(id);
    result.push(transaction);
  }
  return result;
}
export function convertUTXOsToVOUT(UTXOs: Array<IUTXO>): Array<IVout_when_creating_transactions> {
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
