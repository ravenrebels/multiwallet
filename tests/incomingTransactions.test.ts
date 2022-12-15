import { getSumOfAssetOutputs, getSumOfOutputs, ITransaction } from "../UserTransaction";

const { isByUser, isToUser } = require("../UserTransaction");

//Import test data
import data1 from "./incomingTransactions.json";
import data2 from "./incomingTransactionsAssets.json"

const transactions: Array<ITransaction> = data1;
const transactionsAssets: Array<ITransaction> = data2;

const addresses = ["mmXMDSS2T7gAUGgmgVaVRktNzU9An5WJRS"];

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
    const sum = getSumOfOutputs(addresses, transactions[0]);
    const result = sum / 1e8;
    expect(result).toBe(10);
});

//Test receiving assets
test('Verify receiving assets', () => {
    const addresses = ["n2Hdcdb5pLNrrdm5ABZSvwkqagGicLohom"];
    const assetName = "REBELLIOUS/50_PERCENT_Y2030";

    const result = getSumOfAssetOutputs(addresses, transactionsAssets[0]);

    expect(result[assetName]).toBe(1);
});


