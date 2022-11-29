import { IAddressMetaData } from "../Types";

function getPrivateKey(
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
