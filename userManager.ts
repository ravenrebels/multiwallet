import * as fs from "fs";
import { IUser } from "./Types";
import RavencoinKey from "@ravenrebels/ravencoin-key";
const naiveCache: any = {};

//Clear cache every 10 minutes

export function getUserById(id: string): IUser {
  if (!naiveCache[id]) {

    const fileName = "./users/" + id + ".json"
    if (fs.existsSync("./users/" + id + ".json") === false) {
      createUser(id);
    }

    //braces and waist belt
    if (fs.existsSync(fileName) === false) {
      throw Error("Hm, could not find or create user " + id);
    }

    const text = fs.readFileSync(fileName, "utf-8");
    const obj:IUser = JSON.parse(text);
 
    if(!obj.profileImageURL){
      obj.profileImageURL = "https://cdn.pixabay.com/photo/2013/07/12/19/25/crowd-sourcing-154759_1280.png";
    }
    if(!obj.displayName){
      obj.displayName = obj.id.substring(0, 2) + "..." + obj.id.charAt(obj.id.length - 1);
    }
    naiveCache[id] = obj;
  }

  return naiveCache[id];
}

export function createUser(id: string): IUser {
  //Validate that user does not already exist

  //Validate format of id
  //https://codingbeautydev.com/blog/javascript-check-if-string-contains-only-letters-and-numbers/
  function onlyLettersAndNumbers(str: string) {
    return /^[A-Za-z0-9]*$/.test(str);
  }

  if (id.length > 50) {
    throw Error("Sorry, id cant be more than 50 characters");
  }

  if (onlyLettersAndNumbers(id) === false) {
    throw Error("Sorry, only a-Z and numbers")
  }

  const newUser = {
    id,
    mnemonic: RavencoinKey.generateMnemonic()
  }
  const json = JSON.stringify(newUser, null, 4);
  fs.writeFileSync("./users/" + id + ".json", json);

  return newUser;
}
