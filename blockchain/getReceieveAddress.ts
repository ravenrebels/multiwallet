import { getHistory } from "./blockchain";

export async function getReceieveAddress(addresses: Array<string>) {
  //even addresses are external, odd address are internal/changes
  for (let counter = 0; counter < addresses.length; counter++) {
    if (counter % 2 !== 0) {
      continue;
    }
    const address = addresses[counter];
    const asdf = await getHistory([address]);
    if (asdf.length > 0) {
      return address;
    }
  }
}
