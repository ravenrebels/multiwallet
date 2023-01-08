import { ITransaction } from "../src/Types";
import { getSumOfAssetOutputs, getSumOfRavencoinOutputs, isByUser, isToUser } from "../src/UserTransaction";



//Import test data
import * as fs from "fs";
const data1 = JSON.parse(fs.readFileSync("./tests/incomingTransactions.json", "utf-8"));
const data2 = JSON.parse(fs.readFileSync("./tests/incomingTransactionsAssets.json", "utf-8"));


const transactions: Array<ITransaction> = data1;
const transactionsAssets: Array<ITransaction> = data2;

const addresses = ["mrQCe78rtNV1EtCDP49RAEwovbK4rgt93a"];

test('Receiving transaction', () => {
    const by = isByUser(addresses, transactions[0]);
    const to = isToUser(addresses, transactions[0]);
    const result = by === false && to === true;
    expect(result).toBe(true);
});

test('Sending transaction', () => {
    const result = isByUser(addresses, transactions[0]);
    expect(result).toBe(false);
});

test('Get receiving sum', () => {
    const sum = getSumOfRavencoinOutputs(addresses, transactions[0]);
    const result = sum / 1e8;
    expect(result).toBe(2);
});

//Test receiving assets
test('Verify receiving assets', () => {
    const addresses = ["mrQCe78rtNV1EtCDP49RAEwovbK4rgt93a"];
    const assetName = "BARRY";

    const result = getSumOfAssetOutputs(addresses, transactionsAssets[0]);

    expect(result[assetName]).toBe(2);
});


