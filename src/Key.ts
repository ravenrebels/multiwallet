import RavencoinKey from "@ravenrebels/ravencoin-key";
import { IAddressMetaData, IUser } from "./Types";

import { getConfig } from "./getConfig";
import { hasHistory } from "./blockchain/getHistory";
export async function getAddresses(user: IUser, network: string) {
  if (!user.id) {
    throw Error(user + " does not have id");
  }

  const objects = await getAddressObjects(user.mnemonic, network);
  const result = objects.map((obj) => obj.address);

  return result;
}
async function _getAddressObjects(mnemonic: string, network: string) {
  const isNetworkValid = network === "rvn" || network === "rvn-test";
  if (!isNetworkValid) {
    throw new Error("Network *" + network + "* not valid");
  }

  const addresses: Array<IAddressMetaData> = [];

  let isLast20ExternalAddressesUnused = false;
  const ACCOUNT = 0;

  let addressPosition = 0;
  while (isLast20ExternalAddressesUnused === false) {
    const tempAddresses = [] as string[];

    for (let i = 0; i < 20; i++) {
      const o = RavencoinKey.getAddressPair(
        network,
        mnemonic,
        ACCOUNT,
        addressPosition
      );
      addresses.push(o.external);
      addresses.push(o.internal);
      addressPosition++;

      tempAddresses.push(o.external.address + "");
    }
    //If no history, break
    isLast20ExternalAddressesUnused =
      false === (await hasHistory(tempAddresses));
  }
  return addresses;

  /*
  //Never generate more than 1000 addresses.
  //Stop when found 20 unused external addresses
  let lastUsedAddressPosition = 0;
  for (let position = 0; position < 1000; position++) {
    const ACCOUNT = 0;

    const obj = RavencoinKey.getAddressPair(
      network,
      mnemonic,
      ACCOUNT,
      position
    );
    addresses.push(obj.external);
    addresses.push(obj.internal);

    if (await hasHistory([obj.external.address])) {
      lastUsedAddressPosition = position;
    }

    //Break when we have 20 unused addresses
    if (position > lastUsedAddressPosition + 20) {
      break;
    }
  }
  console.log("lastUsedAddressPosition", lastUsedAddressPosition);
  return addresses;*/
}

//A simple naive cache that is cleared every 60 minutes
const ONE_HOUR = 1000 * 60 * 60;
let cache = new Map<string, IAddressMetaData[]>();
setInterval(() => cache.clear(), ONE_HOUR);

export async function getAddressObjects(
  mnemonic: string,
  network: string
): Promise<IAddressMetaData[]> {
  //Should we cache or not?
  if (getConfig().cacheKeys !== true) {
    return await _getAddressObjects(mnemonic, network);
  }
  //Because of TypeScript we have to write the if like this
  //Otherwise TypeScript
  const ao = cache.get(mnemonic);
  if (ao) {
  } else {
    const addressObjects = await _getAddressObjects(mnemonic, network);
    cache.set(mnemonic, addressObjects);
    return addressObjects;
  }
  return ao;
}
