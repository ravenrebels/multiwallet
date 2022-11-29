import RavencoinKey from "@ravenrebels/ravencoin-key";
import { IAddressMetaData } from "./Types";
import * as fs from "fs";

export function getAddresses(userName: string, network: string) {
  const objects = getAddressObjects(userName, network);
  return objects.map((obj) => obj.address);
}
export function getAddressObjects(userName: string, network: string) {
  const fileName = "./" + userName + ".json";
  if (fs.existsSync(fileName) === false) {
    throw new Error("User not found " + userName);
  }

  const isNetworkValid = network === "rvn" || network === "rvn-test";
  if (!isNetworkValid) {
    throw new Error("Network *" + network + "* not valid");
  }
  const user = JSON.parse(fs.readFileSync(fileName, "utf-8"));

  //TODO sloppy, generate 1000 addresses, should be enough, in real world must be endless
  const addresses: Array<IAddressMetaData> = [];

  for (let position = 0; position < 500; position++) {
    const ACCOUNT = 0;

    const obj = RavencoinKey.getAddressPair(
      network,
      user.mnemonic,
      ACCOUNT,
      position
    );
    addresses.push(obj.external);
    addresses.push(obj.internal);
  }

  return addresses;
}
