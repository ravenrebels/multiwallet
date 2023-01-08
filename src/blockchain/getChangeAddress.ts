import { getHistory } from "./getHistory";

/*
  Find the first change address without history
*/

export async function getChangeAddress(addresses: Array<string>) {
  //even addresses are external, odd address are internal/changes
  for (let counter = 0; counter < addresses.length; counter++) {
    if (counter % 2 === 0) {
      continue;
    }
    const address = addresses[counter];
    const asdf = await getHistory([address]);
    if (asdf.inputs.length === 0 && asdf.outputs.length) {
      return address;
    }
  }
}
