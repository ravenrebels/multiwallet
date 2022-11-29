import { getHistory } from "./getHistory";

export async function getReceiveAddress(addresses: Array<string>) {
  //even addresses are external, odd address are internal/changes
  //Get the first external address we can find that lack history
  for (let counter = 0; counter < addresses.length; counter++) {
    if (counter % 2 !== 0) {
      continue;
    }
    const address = addresses[counter];
    const asdf = await getHistory([address]);

    if (asdf.inputs.length === 0) {
      return address;
    }
  }
}
