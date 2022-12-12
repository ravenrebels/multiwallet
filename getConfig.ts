import * as fs from "fs";

//Cache config, changes require restart of server
//No need to read from disk for every request

type TConfig = {
  [key: string]: string;
};
let config: TConfig | null = null;
export function getConfig() {
  if (config) {
    return config;
  }
  const filePath = "./config.json";

  if (fs.existsSync(filePath) === true) {
    const text = fs.readFileSync(filePath, "utf-8");
    const obj = JSON.parse(text);

    config = obj;
    return obj;
  } else {
    const template = `{
            "cacheKeys": false,
            "raven_username": "jfk38fn202jc53",
            "raven_password": "jfk38fn202jc53",
            "raven_url": "http://localhost:8766",
            "network": "rvn"
          }
          `;

    const message = `config.json not found. Please create a ${filePath} file and fill in your information.
          This is an example ${template}`;
    throw new Error(message);
  }
}
