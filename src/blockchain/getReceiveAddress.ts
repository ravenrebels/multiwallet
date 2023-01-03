import { hasHistory } from "./getHistory";

export async function getReceiveAddress(addresses: Array<string>) {
  //even addresses are external, odd address are internal/changes
  //Get the first external address we can find that lack history
  for (let counter = 0; counter < addresses.length; counter++) {
    if (counter % 2 !== 0) {
      continue;
    }
    const address = addresses[counter];

    //If an address has tenth of thousands of transactions, getHistory will throw an exception

    const asdf = await hasHistory([address]);

    if (asdf === false) {
      return address;
    }

  }
}
