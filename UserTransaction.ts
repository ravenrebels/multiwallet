

export interface UserTransaction {
    ingoing: boolean;
    outgoing: boolean;
    assetName: string;
    amount: number
}
export interface ITransaction {
    txid: string
    hash: string
    version: number
    size: number
    vsize: number
    locktime: number
    vin: Vin[]
    vout: Vout[]
    hex?: any;
}

interface Vin {
    txid: string
    vout: number
    scriptSig: ScriptSig
    sequence: number
    value: number
    valueSat: number
    address: string
}

interface ScriptSig {
    asm: string
    hex: string
}

interface Vout {
    value: number
    n: number
    scriptPubKey: ScriptPubKey
    valueSat: number
}

interface ScriptPubKey {
    asm: string
    hex: string
    reqSigs: number
    type: string
    addresses: string[]
}
function getCommonObjects(array1: Array<string>, array2: Array<string>) {

    const commonObjects = array1.filter(obj1 => array2.includes(obj1));
    return commonObjects;
}

export function isByUser(addresses: Array<string>, rawTransaction: ITransaction) {

    const a = rawTransaction.vin.filter(vin => {

        return addresses.includes(vin.address);
    })

    return a.length > 0;

}
export function isToUser(addresses: Array<string>, rawTransaction: ITransaction) {
    const a = rawTransaction.vout.filter(vout => {
        return getCommonObjects(vout.scriptPubKey.addresses, addresses);
    })
    return a.length > 0;
} 