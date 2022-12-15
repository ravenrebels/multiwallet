

export interface ScriptSig {
    asm: string;
    hex: string;
}

export interface Vin {
    txid: string;
    vout: number;
    scriptSig: ScriptSig;
    sequence: number;
    value: number;
    valueSat: number;
    address: string;
}

export interface ScriptPubKey {
    asm: string;
    hex: string;
    reqSigs: number;
    type: string;
    addresses: string[];
}

export interface Vout {
    value: number;
    n: number;
    scriptPubKey: ScriptPubKey;
    valueSat: number;
}

export interface IMempoolObject {
    txid: string;
    hash: string;
    version: number;
    size: number;
    vsize: number;
    locktime: number;
    vin: Vin[];
    vout: Vout[];
    hex: string;
}



