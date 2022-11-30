import RavencoinKey from "@ravenrebels/ravencoin-key";
import { IAddressMetaData, IUser } from "./Types";
import * as fs from "fs";

export function getAddresses(user: IUser, network: string) {
  if (!user.id) {
    throw Error(user + " does not have id");
  }

  const objects = getAddressObjects(user.mnemonic, network);
  const result = objects.map((obj) => obj.address);
  if (fs.existsSync("./temp") === false) {
    fs.mkdirSync("./temp");
  }
  fs.writeFileSync(
    "./temp/addresses_" + user.id + ".json",
    JSON.stringify(result, null, 4)
  );

  return result;
}
export function getAddressObjects(mnemonic: string, network: string) {
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
