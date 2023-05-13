import * as fs from "fs";

//Cache config, changes require restart of server
//No need to read from disk for every request

interface IConfig {
  assets?: Array<string>;
  baseCurrency: string; //TODO is this really needed? do we not get that info from the network attribute?
  cacheKeys: boolean;
  fundingWallet?: string;
  mode: "RAVENCOIN_AND_ASSETS" | "ASSETS" | "SOME_ASSETS";
  network: string;
  raven_username: string;
  raven_password: string;
  raven_url: string;
  gui: {
    subTagline?: string;
    tagline: string;
    headline: string;
  };
}
let config: IConfig | null = null;
export function getConfig(): IConfig {
  //If config is already cached, return it
  if (config) {
    return config;
  }
  const filePath = "./config.json";

  if (fs.existsSync(filePath) === true) {
    const text = fs.readFileSync(filePath, "utf-8");
    const obj = JSON.parse(text);

    //Validate
    if (!obj.mode) {
      throw Error("config.json must contain attribute *mode*");
    }
    config = obj;
    validateConfig(obj);
    return obj;
  } else {
    const template = {
      gui: {
        headline: "Playground",
        tagline: "Send RVN and Assets/Tokens",
        subTagline: "Ravencoin testnet",
      },

      assets: [],
      baseCurrency: "RVN",
      cacheKeys: false,

      mode: "RAVENCOIN_AND_ASSETS",
      network: "rvn-test",

      raven_username: "anon",
      raven_password: "anon",
      raven_url: "https://rvn-rpc-testnet.ting.finance/rpc",
    };
    console.log("Created  ./config.json file with default settings");

    //Had to read the object back from file or typescript complained about IConfig.mode not being a string
    fs.writeFileSync("./config.json", JSON.stringify(template, null, 4));
    config = JSON.parse(fs.readFileSync("./config.json", "utf-8"));
    if (config) {
      return config;
    }
    else{
      throw new Error("Please check the ./config.json file");
    }
  }
}

function validateConfig(config: IConfig) {
  if (config.mode === "SOME_ASSETS") {
    if (!config.assets || config.assets.length === 0) {
      throw Error("config.json, please configure *assets*");
    }
  }
}
