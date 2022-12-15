


import { isUTXOInMempool } from "../blockchain/Asdf";
import { IMempoolObject } from "../IMempool";
import { IUTXO } from "../Types";
const mempool: Array<IMempoolObject> = [
    {
        "txid": "8afe4b2ea2e9c097fa4f90034e7886066244a2e7b1bbe74dea4ae0ec8bd4d2ea",
        "hash": "8afe4b2ea2e9c097fa4f90034e7886066244a2e7b1bbe74dea4ae0ec8bd4d2ea",
        "version": 2,
        "size": 373,
        "vsize": 373,
        "locktime": 0,
        "vin": [
            {
                "txid": "ad92f2ad5e3030f9a0319f1e727c9f7fbb06f52bbbc5ee26cfc9a22b03c09cad",
                "vout": 2,
                "scriptSig": {
                    "asm": "3045022100c75a5cdd51f767d696861bb8c860a1bfde3a1f3393a0d840d9de9d18f78b953c02203e063590e232a76241896cda5e22c2199e73650e2dfb7126159e8c8837bb39f5[ALL] 035036291c49b3555ba45fae45dec80bcb160438cd99c97d7761522d8d807541e3",
                    "hex": "483045022100c75a5cdd51f767d696861bb8c860a1bfde3a1f3393a0d840d9de9d18f78b953c02203e063590e232a76241896cda5e22c2199e73650e2dfb7126159e8c8837bb39f50121035036291c49b3555ba45fae45dec80bcb160438cd99c97d7761522d8d807541e3"
                },
                "sequence": 4294967295,
                "value": 9.79,
                "valueSat": 979000000,
                "address": "mq33NLStX1EWv5vvDDj18jhH9U2JBVxGBL"
            },
            {
                "txid": "39fb47ffd320e437a5168cc6fc186987ce02c189a5102960c00afbfe658a4ba6",
                "vout": 2,
                "scriptSig": {
                    "asm": "3044022069b96044dda9771932b54288c7118e56b3f18bede5ac8189fd5254a20f45a03d0220107889873630d099004d543b01bb9b58327b70481955834a488c2c710e4cb312[ALL] 035036291c49b3555ba45fae45dec80bcb160438cd99c97d7761522d8d807541e3",
                    "hex": "473044022069b96044dda9771932b54288c7118e56b3f18bede5ac8189fd5254a20f45a03d0220107889873630d099004d543b01bb9b58327b70481955834a488c2c710e4cb3120121035036291c49b3555ba45fae45dec80bcb160438cd99c97d7761522d8d807541e3"
                },
                "sequence": 4294967295,
                "value": 0.9,
                "valueSat": 90000000,
                "address": "mq33NLStX1EWv5vvDDj18jhH9U2JBVxGBL"
            }
        ],
        "vout": [
            {
                "value": 10,
                "n": 0,
                "scriptPubKey": {
                    "asm": "OP_DUP OP_HASH160 969f416543d289c12acf6227e681fd19c0aedd98 OP_EQUALVERIFY OP_CHECKSIG",
                    "hex": "76a914969f416543d289c12acf6227e681fd19c0aedd9888ac",
                    "reqSigs": 1,
                    "type": "pubkeyhash",
                    "addresses": [
                        "muFNS6FWVeeyzN1UJzbJztTCnNCQ5YPLqp"
                    ]
                },
                "valueSat": 1000000000
            },
            {
                "value": 0.58,
                "n": 1,
                "scriptPubKey": {
                    "asm": "OP_DUP OP_HASH160 6869d8a8def9df2e82db91e21f5e535df59fb0e1 OP_EQUALVERIFY OP_CHECKSIG",
                    "hex": "76a9146869d8a8def9df2e82db91e21f5e535df59fb0e188ac",
                    "reqSigs": 1,
                    "type": "pubkeyhash",
                    "addresses": [
                        "mq33NLStX1EWv5vvDDj18jhH9U2JBVxGBL"
                    ]
                },
                "valueSat": 58000000
            }
        ],
        "hex": "0200000002ad9cc0032ba2c9cf26eec5bb2bf506bb7f9f7c721e9f31a0f930305eadf292ad020000006b483045022100c75a5cdd51f767d696861bb8c860a1bfde3a1f3393a0d840d9de9d18f78b953c02203e063590e232a76241896cda5e22c2199e73650e2dfb7126159e8c8837bb39f50121035036291c49b3555ba45fae45dec80bcb160438cd99c97d7761522d8d807541e3ffffffffa64b8a65fefb0ac0602910a589c102ce876918fcc68c16a537e420d3ff47fb39020000006a473044022069b96044dda9771932b54288c7118e56b3f18bede5ac8189fd5254a20f45a03d0220107889873630d099004d543b01bb9b58327b70481955834a488c2c710e4cb3120121035036291c49b3555ba45fae45dec80bcb160438cd99c97d7761522d8d807541e3ffffffff0200ca9a3b000000001976a914969f416543d289c12acf6227e681fd19c0aedd9888ac80027503000000001976a9146869d8a8def9df2e82db91e21f5e535df59fb0e188ac00000000"
    }
];
const UTXOs: Array<IUTXO> = [
    {
        "address": "mq33NLStX1EWv5vvDDj18jhH9U2JBVxGBL",
        "assetName": "RVN",
        "txid": "ad92f2ad5e3030f9a0319f1e727c9f7fbb06f52bbbc5ee26cfc9a22b03c09cad",
        "outputIndex": 2,
        "script": "76a9146869d8a8def9df2e82db91e21f5e535df59fb0e188ac",
        "satoshis": 979000000,
        "height": 850673
    },
    {
        "address": "mq33NLStX1EWv5vvDDj18jhH9U2JBVxGBL",
        "assetName": "RVN",
        "txid": "39fb47ffd320e437a5168cc6fc186987ce02c189a5102960c00afbfe658a4ba6",
        "outputIndex": 2,
        "script": "76a9146869d8a8def9df2e82db91e21f5e535df59fb0e188ac",
        "satoshis": 90000000,
        "height": 850676
    },
    {
        "address": "mq33NLStX1EWv5vvDDj18jhH9U2JBVxGBL",
        "assetName": "RVN",
        "txid": "cc79f630ee42a69696253009901ac27f36a4dcc81794ef5c74d4e1027e72194f",
        "outputIndex": 2,
        "script": "76a9146869d8a8def9df2e82db91e21f5e535df59fb0e188ac",
        "satoshis": 990000000,
        "height": 850844
    },
    {
        "address": "moJ9psNRahDKTDu33tYuBFupeV9Q4R8Vnn",
        "assetName": "RVN",
        "txid": "a70352996f806af4fe878063a422bdafc0d929314ba8bdceaee3e48ae95af1af",
        "outputIndex": 0,
        "script": "76a9145555397ffa7665faa6093ebc87d5c1f1d1104a5088ac",
        "satoshis": 2000000000,
        "height": 852602
    },
    {
        "address": "mq33NLStX1EWv5vvDDj18jhH9U2JBVxGBL",
        "assetName": "RVN",
        "txid": "39f13fa12ac44273bbd8180e9416220b257d5ad9a964cc92bc299d40261aa163",
        "outputIndex": 1,
        "script": "76a9146869d8a8def9df2e82db91e21f5e535df59fb0e188ac",
        "satoshis": 90000000,
        "height": 852606
    },
    {
        "address": "mq33NLStX1EWv5vvDDj18jhH9U2JBVxGBL",
        "assetName": "RVN",
        "txid": "f018eb2160cd0ac47a79d3499a03ee475462c3e6d17ef68f3ad0dc2e0f5d8375",
        "outputIndex": 1,
        "script": "76a9146869d8a8def9df2e82db91e21f5e535df59fb0e188ac",
        "satoshis": 780000000,
        "height": 852611
    },
    {
        "address": "mq33NLStX1EWv5vvDDj18jhH9U2JBVxGBL",
        "assetName": "RVN",
        "txid": "67ab24f2f7f4a7b2e88c3bf212283352b251200636faa1af8468d9c9632c9c6e",
        "outputIndex": 1,
        "script": "76a9146869d8a8def9df2e82db91e21f5e535df59fb0e188ac",
        "satoshis": 78920000000,
        "height": 852612
    }
]


function getUTXO(txid: string, index: number) {
    const UTXO = UTXOs.find(u => {
        return u.txid === txid && u.outputIndex === index;
    });
    return UTXO;
}
//UTXO in mempool
test("Verify that 39fb47ffd320e437a5168cc6fc186987ce02c189a5102960c00afbfe658a4ba6_2 is in mempool", () => {
    const exists = !!getUTXO("39fb47ffd320e437a5168cc6fc186987ce02c189a5102960c00afbfe658a4ba6", 2);
    expect(exists).toBe(true);
});

test("Verify that UTXO 67ab24f2f7f4a7b2e88c3bf212283352b251200636faa1af8468d9c9632c9c6e 2 is NOT in mempool", () => {
    const exists = !!getUTXO("67ab24f2f7f4a7b2e88c3bf212283352b251200636faa1af8468d9c9632c9c6e", 2);
    expect(exists).toBe(false);

})

