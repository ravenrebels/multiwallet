import RavencoinKey from "@ravenrebels/ravencoin-key";
import { IAddressMetaData, IUser } from "./Types";
import * as fs from "fs";
import { getConfig } from "./getConfig";
export function getAddresses(user: IUser, network: string) {
  if (!user.id) {
    throw Error(user + " does not have id");
  }

  const objects = getAddressObjects(user.mnemonic, network);
  const result = objects.map((obj) => obj.address);


  return result;
}
function _getAddressObjects(mnemonic: string, network: string) {
  const isNetworkValid = network === "rvn" || network === "rvn-test";
  if (!isNetworkValid) {
    throw new Error("Network *" + network + "* not valid");
  }

  //TODO sloppy, generate 1000 addresses, should be enough, in real world must be endless
  const addresses: Array<IAddressMetaData> = [];

  //TODO start by getting 1000 addresses, in the long run, dynamically check how many is needed
  for (let position = 0; position < 500; position++) {
    const ACCOUNT = 0;

    const obj = RavencoinKey.getAddressPair(
      network,
      mnemonic,
      ACCOUNT,
      position
    );
    addresses.push(obj.external);
    addresses.push(obj.internal);
  }

  return addresses;
}

//A simple naive cache that is cleared every 60 minutes
const ONE_HOUR = 1000 * 60 * 60;
let cache = new Map<string, IAddressMetaData[]>();
setInterval(() => cache.clear(), ONE_HOUR);

export function getAddressObjects(
  mnemonic: string,
  network: string
): Array<IAddressMetaData> {
  //Should we cache or not?
  if (getConfig().cacheKeys !== true) {
    return _getAddressObjects(mnemonic, network);
  }
  //Because of TypeScript we have to write the if like this
  //Otherwise TypeScript
  const ao = cache.get(mnemonic);
  if (ao) {
  } else {
    const addressObjects = _getAddressObjects(mnemonic, network);
    cache.set(mnemonic, addressObjects);
    return addressObjects;
  }
  return ao;
}
