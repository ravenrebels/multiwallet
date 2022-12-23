import * as Blockchain from "../blockchain/blockchain";

const data = [

    {
        "address": "mpsSZkaFdKuCx3fpG1BWmsYnZ4mccDbWJZ",
        "assetName": "RVN",
        "txid": "3f1dcdb697d6de06ade6041f8dc368463bbcd2630c3947d0254e450f5fe9b100",
        "outputIndex": 0,
        "script": "76a91466990ce9f8eebf974817c59985ef122184ea333f88ac",
        "satoshis": 1500000000000,
        "height": 863190
    },
    {
        "address": "mqVjE9kAEhDSvS3QEuCavEtiw3RAu7ZMfR",
        "assetName": "RVN",
        "txid": "e918379ca48df6b970a0a7b3fd8b2cb64cb3d8619a47cead860e54de2390e6c8",
        "outputIndex": 0,
        "script": "76a9146d75ef11413712f80c0761e90c68dd5e97bc406988ac",
        "satoshis": 200000000,
        "height": 863392
    },
    {
        "address": "n15kvhj5Fk1tvQDtGrTAxAu1NRCq4fJqsB",
        "assetName": "RVN",
        "txid": "64c8437e7f509e7ce64bc230239d8c0abbf253ccdb954294591a613f080fffd5",
        "outputIndex": 1,
        "script": "76a914d69ea0832274e12bd1e280700da7fc4ee1c7f9ff88ac",
        "satoshis": 617000000,
        "height": 863188
    }
]
Blockchain._sortUTXOs(data);


test('Sort UTXOS', () => {

    expect(data[0].satoshis).toBe(200000000);
});
