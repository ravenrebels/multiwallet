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
  tagline: string;
  headline: string;
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
      "fundingWallet": "12 words mnemonic key",
      "cacheKeys": true, 
      "mode": "ASSETS",
      "network": "rvn-test",
      "raven_username": "secret user name",
      "raven_password": "secret password",
      "raven_url": "http://localhost:8888"
          }
          `;

    const message = `config.json not found. Please create a ${filePath} file and fill in your information.
          This is an example ${template}
          *mode* can be either RAVENCOIN_AND_ASSETS, ASSETS or SOME_ASSETS`;
    throw new Error(message);
  }
}
