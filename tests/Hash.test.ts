/*******************************************************************************

    Test that create hash.

    Copyright:
        Copyright (c) 2020 BOS Platform Foundation Korea
        All rights reserved.

    License:
        MIT License. See LICENSE for details.

*******************************************************************************/

import * as boasdk from '../lib';

import * as assert from 'assert';

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

    // https://github.com/bpfkorea/agora/blob/v0.x.x/source/agora/common/Hash.d#L260-L265
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
        let hash = boasdk.makeUTXOKey(tx_hash, BigInt(1));
        assert.strictEqual(hash.toString(),
            '0x7c95c29b184e47fbd32e58e5abd42c6e22e8bd5a7e934ab049d21df545e09c2' +
            'e33bb2b89df2e59ee01eb2519b1508284b577f66a76d42546b65a6813e592bb84');
    });

    // See_Also: https://github.com/bpfkorea/agora/blob/dac8b3ea6500af68a99c0248c3ade8ab821ee9ef/source/agora/consensus/data/Transaction.d#L203-L229
    it ('Test for hash value of transaction data', () =>
    {
        let payment_tx = new boasdk.Transaction(
            boasdk.TxType.Payment,
            [
                new boasdk.TxInput(new boasdk.Hash(Buffer.alloc(boasdk.Hash.Width)), BigInt(0))
            ],
            [
                new boasdk.TxOutput(BigInt(0), new boasdk.PublicKey(Buffer.alloc(boasdk.SodiumHelper.sodium.crypto_sign_PUBLICKEYBYTES)))
            ],
            boasdk.DataPayload.init
        );

        assert.strictEqual(boasdk.hashFull(payment_tx).toString(),
            "0x428d691addd27708b719a5e47cbac932618f0f843681dc0a46c97971ff8c419" +
            "c817c65d90f3b74394db46801843b79537a583903bec5da57de70155276d2aa46");

        let freeze_tx = new boasdk.Transaction(
            boasdk.TxType.Freeze,
            [
                new boasdk.TxInput(new boasdk.Hash(Buffer.alloc(boasdk.Hash.Width)), BigInt(0))
            ],
            [
                new boasdk.TxOutput(BigInt(0), new boasdk.PublicKey(Buffer.alloc(boasdk.SodiumHelper.sodium.crypto_sign_PUBLICKEYBYTES)))
            ],
            boasdk.DataPayload.init
        );

        assert.strictEqual(boasdk.hashFull(freeze_tx).toString(),
            "0x6ce6bdeac41ffa444e6c2250ec09e04652597c3ec92f54f69029cc16ae4fc84" +
            "faa5372b56e24c4c8667d00a8d1c0a7bc550999e4cdcd039548361a15e72fa081");

        let payload_tx = new boasdk.Transaction(
            boasdk.TxType.Payment,
            [
                new boasdk.TxInput(new boasdk.Hash(Buffer.alloc(boasdk.Hash.Width)), BigInt(0))
            ],
            [
                new boasdk.TxOutput(BigInt(0), new boasdk.PublicKey(Buffer.alloc(boasdk.SodiumHelper.sodium.crypto_sign_PUBLICKEYBYTES)))
            ],
            new boasdk.DataPayload(Buffer.from([1,2,3]))
        );

        assert.strictEqual(boasdk.hashFull(payload_tx).toString(),
            "0x3bb3e7a067921ddace392673083330164d5913cb86f61a211be34d2b42df1ec" +
            "46e024178b6219d9b4d853b09c0332b427ad6757c9d3b865ab9e9e94bec48f6a9");
    });

    // See_Also: https://github.com/bpfkorea/agora/blob/73a7cd593afab6726021e05cf16b90d246343d65/source/agora/consensus/data/Block.d#L118-L138
    it ('Test for hash value of BlockHeader', () =>
    {
        let pubkey = new boasdk.PublicKey('GDD5RFGBIUAFCOXQA246BOUPHCK7ZL2NSHDU7DVAPNPTJJKVPJMNLQFW');

        let tx = new boasdk.Transaction(
            boasdk.TxType.Payment,
            [ ],
            [ new boasdk.TxOutput(BigInt(100), pubkey) ],
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
            "0x2ee9f52b2072e7f6f980d337ea1d7646a9eb51dd4a8f964a4188ea7de316165" +
            "f07a3cf1ad209fd8712bb0ef9d0d76c5bde8148bdf7c7704406b7bc7f1e0d7291");
    });

    it ('Test for hash value of BlockHeader with missing validators', () =>
    {
        let pubkey = new boasdk.PublicKey('GDD5RFGBIUAFCOXQA246BOUPHCK7ZL2NSHDU7DVAPNPTJJKVPJMNLQFW');

        let tx = new boasdk.Transaction(
            boasdk.TxType.Payment,
            [ ],
            [ new boasdk.TxOutput(BigInt(100), pubkey) ],
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
            "0x33e422944768cc3ce6a61b63d99289a7e63f1fdb9bc1f0297cf57998e8446dc" +
            "68a28fad0253d356a878c008e58d15aecfdee1762e97a0f3924474f11156e3c3b");
    });
});
