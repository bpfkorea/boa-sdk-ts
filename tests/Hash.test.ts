/*******************************************************************************

    Test that create hash.

    Copyright:
        Copyright (c) 2020-2021 BOSAGORA Foundation
        All rights reserved.

    License:
        MIT License. See LICENSE for details.

*******************************************************************************/

import * as boasdk from '../lib';

import * as assert from 'assert';
import JSBI from "jsbi";

describe('Hash', () =>
{
    before('Wait for the package libsodium to finish loading', () =>
    {
        return boasdk.SodiumHelper.init();
    });

    // Buffer has the same content. However, when printed with hex strings,
    // the order of output is different.
    // This was treated to be the same as D language.
    it('Test of reading and writing hex string', () => {
        // Read from hex string
        let h = new boasdk.Hash('0x5d7f6a7a30f7ff591c8649f61eb8a35d034824ed5cd252c2c6f10cdbd223671' +
            '3dc369ef2a44b62ba113814a9d819a276ff61582874c9aee9c98efa2aa1f10d73');

        // Check
        assert.strictEqual(h.toString(),
            '0x5d7f6a7a30f7ff591c8649f61eb8a35d034824ed5cd252c2c6f10cdbd2236713d' +
            'c369ef2a44b62ba113814a9d819a276ff61582874c9aee9c98efa2aa1f10d73');
    });

    // The test codes below compare with the values calculated in Agora.
    it('Test of hash("abc")', () => {
        // Hash
        let h = boasdk.hash(Buffer.from("abc"));

        // Check
        assert.strictEqual(h.toString(),
            '0x239900d4ed8623b95a92f1dba88ad31895cc3345ded552c22d79ab2a39c5877' +
            'dd1a2ffdb6fbb124bb7c45a68142f214ce9f6129fb697276a0d4d1c983fa580ba');
    });

    // The test codes below compare with the values calculated in Agora.
    it('Test of multi hash', () => {
        // Source 1 : "foo"
        let foo = boasdk.hash(Buffer.from("foo"));

        // Source 2 : "bar"
        let bar = boasdk.hash(Buffer.from("bar"));

        // Hash Multi
        let h = boasdk.hashMulti(foo.data, bar.data);

        // Check
        assert.strictEqual(h.toString(),
            '0xe0343d063b14c52630563ec81b0f91a84ddb05f2cf05a2e4330ddc79bd3a06e57' +
            'c2e756f276c112342ff1d6f1e74d05bdb9bf880abd74a2e512654e12d171a74');
    });

    // The test codes below compare with the values calculated in Agora.
    it('Test of utxo key, using makeUTXOKey', () => {
        let tx_hash = new boasdk.Hash('0x5d7f6a7a30f7ff591c8649f61eb8a35d034824ed5cd252c2c6f10cdbd223671' +
            '3dc369ef2a44b62ba113814a9d819a276ff61582874c9aee9c98efa2aa1f10d73');
        //let hash = boasdk.makeUTXOKey(tx_hash, JSBI.BigInt(1));
        let hash = boasdk.makeUTXOKey(tx_hash, JSBI.BigInt(1));
        assert.strictEqual(hash.toString(),
            '0x7c95c29b184e47fbd32e58e5abd42c6e22e8bd5a7e934ab049d21df545e09c2' +
            'e33bb2b89df2e59ee01eb2519b1508284b577f66a76d42546b65a6813e592bb84');
    });

    // The test codes below compare with the values calculated in Agora.
    it ('Test for hash value of transaction data', () =>
    {
        let payment_tx = new boasdk.Transaction(
            boasdk.TxType.Payment,
            [
                boasdk.TxInput.fromTxHash(new boasdk.Hash(Buffer.alloc(boasdk.Hash.Width)), JSBI.BigInt(0))
            ],
            [
                new boasdk.TxOutput("0", boasdk.Lock.Null)
            ],
            boasdk.DataPayload.init
        );
        assert.strictEqual(boasdk.hashFull(payment_tx).toString(),
            "0xef5d99551a2d15e723f77a468fcd1d1a9635d0ff2eb6924445e8b005108e0c7" +
            "007c60135014a46c4513bfaaa3c6e0ff826c28c86f63c8976f5c5527599d46bac");

        let nBytes =
            boasdk.Utils.SIZE_OF_BYTE +     //  Transaction.type
            boasdk.Hash.Width +             //  TxInput.utxo
            0 +                             //  TxInput.unlock.bytes
            boasdk.Utils.SIZE_OF_INT +      //  TxInput.unlock_age
            boasdk.Utils.SIZE_OF_LONG +     //  TxOutput.value
            boasdk.Utils.SIZE_OF_BYTE  +    //  TxOutput.lock.type
            0 +                             //  TxOutput.lock.bytes
            0 +                             //  Transaction.payload
            boasdk.Utils.SIZE_OF_LONG;      //  Transaction.lock_height
        assert.strictEqual(payment_tx.getNumberOfBytes(), nBytes);

        let freeze_tx = new boasdk.Transaction(
            boasdk.TxType.Freeze,
            [
                boasdk.TxInput.fromTxHash(new boasdk.Hash(Buffer.alloc(boasdk.Hash.Width)), JSBI.BigInt(0))
            ],
            [
                new boasdk.TxOutput("0", boasdk.Lock.Null)
            ],
            boasdk.DataPayload.init
        );

        assert.strictEqual(boasdk.hashFull(freeze_tx).toString(),
            "0x9f7f610a6b2689b2c88ec3c62bbd7cf393737700f660793d6642b2852773de0" +
            "abc2c0d4bb3a7d4a807dfd869f88e91e28471f6a4d2c990442b9c250585c25051");

        assert.strictEqual(freeze_tx.getNumberOfBytes(), nBytes);


        let payload_tx = new boasdk.Transaction(
            boasdk.TxType.Payment,
            [
                boasdk.TxInput.fromTxHash(new boasdk.Hash(Buffer.alloc(boasdk.Hash.Width)), JSBI.BigInt(0))
            ],
            [
                new boasdk.TxOutput("0", boasdk.Lock.Null)
            ],
            new boasdk.DataPayload(Buffer.from([1,2,3]))
        );
        assert.strictEqual(boasdk.hashFull(payload_tx).toString(),
            "0xfa416b96ef0b6d81ae246e3de6a992c9afabd1f53c336dceec47fd462e69948" +
            "da328a86330c228de06ef9c101d3294722675af08e576670e91533117f75b6976");
    });

    // The test codes below compare with the values calculated in Agora.
    it ('Test for hash value of BlockHeader', () =>
    {
        let pubkey = new boasdk.PublicKey('boa1xrr66q4rthn4qvhhsl4y5hptqm366pgarqpk26wfzh6d38wg076tsqqesgg');

        let tx = new boasdk.Transaction(
            boasdk.TxType.Payment,
            [ ],
            [ new boasdk.TxOutput("100", pubkey) ],
            boasdk.DataPayload.init
        );

        let header: boasdk.BlockHeader = new boasdk.BlockHeader(
            new boasdk.Hash(Buffer.alloc(boasdk.Hash.Width)),
            new boasdk.Height("0"),
            boasdk.hashFull(tx),
            new boasdk.BitField([0]),
            new boasdk.Signature(Buffer.alloc(boasdk.Signature.Width)),
            [ ],
            new boasdk.Hash(Buffer.alloc(boasdk.Hash.Width)),
            [ ],
            0
        );
        assert.strictEqual(boasdk.hashFull(header).toString(),
            "0x41a6bb62adc1e7448bc134090f23e511292224189134fffc597943d5f63d4da" +
            "6d0a605ccc1179697f884b3f4df0558eb67612ca75cf9332f4b5b04caebe761c9");
    });

    // The test codes below compare with the values calculated in Agora.
    it ('Test for hash value of BlockHeader with missing validators', () =>
    {
        let pubkey = new boasdk.PublicKey('boa1xrr66q4rthn4qvhhsl4y5hptqm366pgarqpk26wfzh6d38wg076tsqqesgg');

        let tx = new boasdk.Transaction(
            boasdk.TxType.Payment,
            [ ],
            [ new boasdk.TxOutput("100", pubkey) ],
            boasdk.DataPayload.init
        );

        let header: boasdk.BlockHeader = new boasdk.BlockHeader(
            new boasdk.Hash(Buffer.alloc(boasdk.Hash.Width)),
            new boasdk.Height("0"),
            boasdk.hashFull(tx),
            new boasdk.BitField([ ]),
            new boasdk.Signature(Buffer.alloc(boasdk.Signature.Width)),
            [ ],
            new boasdk.Hash(Buffer.alloc(boasdk.Hash.Width)),
            [ 1, 2, 3, 256, 257, 258, 70000, 80000, 90000 ],
            0
        );
        assert.strictEqual(boasdk.hashFull(header).toString(),
            "0xe46f7b96a5dfce78c4590b25242cc42a1d30868a7a74460a8e3eeabbe12055f" +
            "d62a475e76e6a623a34e5618769f816c7c9233bbbf1e23aeb5f46584e21f0efa2");
    });

    // The test codes below compare with the values calculated in Agora.
    it ("Test for hash value of Scalar", () =>
    {
        let scalar = new boasdk.Scalar(
            "0x0e00a8df701806cb4deac9bb09cc85b097ee713e055b9d2bf1daf668b3f63778");
        assert.deepStrictEqual(boasdk.hashFull(scalar).toString(),
            "0x4f895cc641b2bfe4541f53b83445add00a7a81ad340312c51cbf15c53ddebcc" +
            "7ea7dcd11a97e085d28552026952e7c7c8d4276d5901d33605a3ea21027a673d4");
    });

    // The test codes below compare with the values calculated in Agora.
    it ("Test for hash value of Point", () =>
    {
        let point = new boasdk.Point(
            "0xdb445140a72012a177535f43e6bbb8523ff21de465a7c35b42be1a447e5e2908")
        assert.deepStrictEqual(boasdk.hashFull(point).toString(),
            "0xa0ad987cffcf2e3f96af64dd197d95d4e8e41be4448f6abebd8953b3c37b313" +
            "2a1a1917c2046f6d3550cac70299110b28f23454d6124892ab2b8a6508f2bfe47");
    });

    // The test codes below compare with the values calculated in Agora.
    it ("Test for hash value of PublicKey", () =>
    {
        let publicKey = new boasdk.PublicKey('boa1xrr66q4rthn4qvhhsl4y5hptqm366pgarqpk26wfzh6d38wg076tsqqesgg');
        assert.deepStrictEqual(boasdk.hashFull(publicKey).toString(),
            "0x774d28bb3dc06a1418a4165109f4e8e4e05b4b283c798dd10aa70050a9b0954" +
            "08b3d1c6c1017b69912e94a4a58c5cb522e78b9741e1380bb5d2d705116f886ef");
    });
});
