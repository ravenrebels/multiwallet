export interface IAddressMetaData {
  address: string;
  WIF: string;
  path: string;
  privateKey: string;
}

export interface IConfig {
  raven_username: string;
  raven_password: string;
  raven_url: string;
  network: string;
}

export interface IUTXO {
  address: string;
  assetName: string;
  txid: string;
  outputIndex: number;
  script: string;
  satoshis: number;
  height: number;
}

export interface IInput {
  txid: string;
  vout: number;
  address: string;
}
