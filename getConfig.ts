import * as fs from "fs";

//Cache config, changes require restart of server
//No need to read from disk for every request

interface IConfig {
  fundingWallet?: string;
  cacheKeys: boolean;
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
    return obj;
  } else {
    const template = `{
      "gui": {
        "headline": "Playground",
        "tagline": "Send RVN and Assets/Tokens",
        "subTagline": "Ravencoin testnet"
      },
    
      "assets": ["QKN"],
      "baseCurrency": "RVN",
      "cacheKeys": false,
    
      "mode": "RAVENCOIN_AND_ASSETS",
      "network": "rvn-test",
    
      "pay_fees_with_this_mnemonic": "not used yet satisfy arctic left moon text",
      "raven_username": "SECRET",
      "raven_password": "SECRET",
      "raven_url": "http://localhost:18766"
    }
          `;

    const message = `config.json not found. Please create a ${filePath} file and fill in your information.
          This is an example ${template}
          *mode* can be either RAVENCOIN_AND_ASSETS, ASSETS or SOME_ASSETS`;
    throw new Error(message);
  }
}
