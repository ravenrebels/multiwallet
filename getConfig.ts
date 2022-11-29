import * as fs from "fs";

export function getConfig() {
  const filePath = "./config.json";

  if (fs.existsSync(filePath) === true) {
    const text = fs.readFileSync(filePath, "utf-8");
    const obj = JSON.parse(text);
    return obj;
  } else {
    const template = `{
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
