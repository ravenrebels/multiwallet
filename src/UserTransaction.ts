import { ITransaction } from "./Types";

export interface UserTransaction {
  ingoing: boolean;
  outgoing: boolean;
  assetName: string;
  amount: number;
}
function getCommonObjects(array1: Array<string>, array2: Array<string>) {
  const commonObjects = array1.filter((obj1) => array2.includes(obj1));
  return commonObjects;
}

export function isByUser(
  addresses: Array<string>,
  rawTransaction: ITransaction
) {
  const a = rawTransaction.vin.filter((vin) => {
    if (!vin.address) {
      return false;
    }
    return addresses.includes(vin.address);
  });

  return a.length > 0;
}
export function isToUser(
  addresses: Array<string>,
  rawTransaction: ITransaction
) {
  const a = rawTransaction.vout.filter((vout) => {
    const common = getCommonObjects(vout.scriptPubKey.addresses, addresses);

    return common.length > 0;
  });
  return a.length > 0;
}

export function getSumOfRavencoinOutputs(
  addresses: Array<string>,
  transaction: ITransaction
) {
  let sum = 0;
  transaction.vout.map((vout) => {

    if (!vout.scriptPubKey || !vout.scriptPubKey.addresses) {
      return;
    }

    const addy = vout.scriptPubKey.addresses[0];
    if (addresses.includes(addy) == true) {
      sum = sum + vout.valueSat;
    }
  });
  return sum;
}

export function getSumOfAssetOutputs(
  addresses: Array<string>,
  transaction: ITransaction
) {
  type TResult = {
    [key: string]: number;
  };
  const result: TResult = {};
  transaction.vout.map((vout) => {
    const spk = vout.scriptPubKey;
    if (!spk.asset) {
      return;
    }

    const addy = spk.addresses[0];
    if (addresses.includes(addy) === false) {
      return;
    }

    const assetName = spk.asset.name;
    const amount = spk.asset.amount;

    if (!result[assetName]) {
      result[assetName] = 0;
    }

    result[assetName] = result[assetName] + amount;
  });

  const RVN = getSumOfRavencoinOutputs(addresses, transaction);
  if (RVN > 0) {
    result["RVN"] = RVN / 1e8;
  }
  return result;
}

export function getSumOfInputs(transaction: ITransaction) {
  let sum = 0;
  transaction.vin.map((vin) => {
    sum = sum + vin.valueSat;
  });
  return sum;
}
