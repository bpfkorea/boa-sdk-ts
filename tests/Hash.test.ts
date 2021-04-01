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

    it('Test of hash("abc")', () => {
        // Hash
        let h = boasdk.hash(Buffer.from("abc"));

        // Check
        assert.strictEqual(h.toString(),
            '0x239900d4ed8623b95a92f1dba88ad31895cc3345ded552c22d79ab2a39c5877' +
            'dd1a2ffdb6fbb124bb7c45a68142f214ce9f6129fb697276a0d4d1c983fa580ba');
    });

    // https://github.com/bosagora/agora/blob/v0.x.x/source/agora/common/Hash.d#L260-L265
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

    it('Test of utxo key, using makeUTXOKey', () => {
        let tx_hash = new boasdk.Hash('0x5d7f6a7a30f7ff591c8649f61eb8a35d034824ed5cd252c2c6f10cdbd223671' +
            '3dc369ef2a44b62ba113814a9d819a276ff61582874c9aee9c98efa2aa1f10d73');
        //let hash = boasdk.makeUTXOKey(tx_hash, JSBI.BigInt(1));
        let hash = boasdk.makeUTXOKey(tx_hash, JSBI.BigInt(1));
        assert.strictEqual(hash.toString(),
            '0x7c95c29b184e47fbd32e58e5abd42c6e22e8bd5a7e934ab049d21df545e09c2' +
            'e33bb2b89df2e59ee01eb2519b1508284b577f66a76d42546b65a6813e592bb84');
    });

    // See_Also: https://github.com/bosagora/agora/blob/dac8b3ea6500af68a99c0248c3ade8ab821ee9ef/source/agora/consensus/data/Transaction.d#L203-L229
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
            "0x6dbcc8c36bd1f95986d8b06a6bad320b0719e14bb1afe2cf824618c3311a23b" +
            "5ac9c35f474dc67182cf17bb609f46e4049f793b996321f6fad88a2925badf198");

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
            "0xf028cecf9498bc615e3ac4ff18efa98c6428b8af1f26a2cfa73518d039a4f2e" +
            "f4f600f28cd25403ad588f0d42e3987863bbd26cdd28b136fee4b80b7f0cc061a");

        assert.strictEqual(freeze_tx.getNumberOfBytes(), nBytes);
    });

    // See_Also: https://github.com/bosagora/agora/blob/73a7cd593afab6726021e05cf16b90d246343d65/source/agora/consensus/data/Block.d#L118-L138
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
            new boasdk.BitField([ ]),
            new boasdk.Signature(Buffer.alloc(boasdk.Signature.Width)),
            [ ],
            new boasdk.Hash(Buffer.alloc(boasdk.Hash.Width)),
            [ ],
            0
        );
        assert.strictEqual(boasdk.hashFull(header).toString(),
            "0xae5eb320aec482edb3fa2ab8eb3c7577f9fe10beaba95eb46e72b39b4053b79" +
            "74da42afeb1d34439c7a57b5b3dc6df4d46f72870138636decd5e60b367612138");
    });

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
            "0x252c0ef24da4ba4d4302b8b14eadfb8a4ba87862ff75acd8a7c801e3c55dbb8" +
            "6307f5208ceb2b8095630cfb5d9e28dbc709824df85bed906a05a1005a076c672");
    });
});
