import * as fs from "fs";

const naiveCache = {};

//Clear cache every 10 minutes

export function getUserById(id) {
  if (!naiveCache[id]) {
    const text = fs.readFileSync("./" + id + ".json", "utf-8");
    const obj = JSON.parse(text);
    naiveCache[id] = obj;
  }

  return naiveCache[id];
}
