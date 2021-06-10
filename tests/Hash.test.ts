/*******************************************************************************

    Test that create hash.

    Copyright:
        Copyright (c) 2020-2021 BOSAGORA Foundation
        All rights reserved.

    License:
        MIT License. See LICENSE for details.

*******************************************************************************/

import * as boasdk from '../lib';
import { BOASodium } from "boa-sodium-ts";

import * as assert from 'assert';
import JSBI from "jsbi";

describe('Hash', () =>
{
    before('Wait for the package libsodium to finish loading', () =>
    {
        boasdk.SodiumHelper.assign(new BOASodium());
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
            [
                boasdk.TxInput.fromTxHash(new boasdk.Hash(Buffer.alloc(boasdk.Hash.Width)), JSBI.BigInt(0))
            ],
            [
                new boasdk.TxOutput(boasdk.OutputType.Payment, "0", boasdk.Lock.Null)
            ],
            Buffer.alloc(0)
        );
        assert.strictEqual(boasdk.hashFull(payment_tx).toString(),
            "0xbf16b1bb63c50170ce0e2624e13bda540c268c74a677d2d8a0571eb79cd8a3b" +
            "28c408793d43e3bbee0ffd39913903c77fbd1b0cbe36b6a0b503514bbbe84b492");

        assert.ok(payment_tx.isPayment());
        assert.ok(!payment_tx.isFreeze());
        assert.ok(!payment_tx.isCoinbase());

        let nBytes =
            boasdk.Hash.Width +             //  TxInput.utxo
            0 +                             //  TxInput.unlock.bytes
            boasdk.Utils.SIZE_OF_INT +      //  TxInput.unlock_age
            boasdk.Utils.SIZE_OF_INT +      //  TxOutput.type
            boasdk.Utils.SIZE_OF_LONG +     //  TxOutput.value
            boasdk.Utils.SIZE_OF_BYTE  +    //  TxOutput.lock.type
            0 +                             //  TxOutput.lock.bytes
            0 +                             //  Transaction.payload
            boasdk.Utils.SIZE_OF_LONG;      //  Transaction.lock_height
        assert.strictEqual(payment_tx.getNumberOfBytes(), nBytes);

        let freeze_tx = new boasdk.Transaction(
            [
                boasdk.TxInput.fromTxHash(new boasdk.Hash(Buffer.alloc(boasdk.Hash.Width)), JSBI.BigInt(0))
            ],
            [
                new boasdk.TxOutput(boasdk.OutputType.Freeze, "0", boasdk.Lock.Null)
            ],
            Buffer.alloc(0)
        );

        assert.strictEqual(boasdk.hashFull(freeze_tx).toString(),
            "0x415e67be1be0ae5d93c39198682e7202047e884542fbb1f88360895ad981950" +
            "67f59f21a1bf8a57f364aaaed7ba8ce9196927a81262db5df0912ac0bf068307e");

        assert.ok(!freeze_tx.isPayment());
        assert.ok(freeze_tx.isFreeze());
        assert.ok(!freeze_tx.isCoinbase());

        assert.strictEqual(freeze_tx.getNumberOfBytes(), nBytes);


        let payload_tx = new boasdk.Transaction(
            [
                boasdk.TxInput.fromTxHash(new boasdk.Hash(Buffer.alloc(boasdk.Hash.Width)), JSBI.BigInt(0))
            ],
            [
                new boasdk.TxOutput(boasdk.OutputType.Payment, "0", boasdk.Lock.Null)
            ],
            Buffer.from([1,2,3])
        );
        assert.strictEqual(boasdk.hashFull(payload_tx).toString(),
            "0x44590847e54f0e67c3365540115204df7730ddde5fdef306c5fd66af6a7d6f3" +
            "11f65de5058ce3f297f8e665a6c2b6d75a39207075a45b364a5dfba74fecf7547");
    });

    it ('Test for hash value of transaction with multi inputs', () =>
    {
        let tx1 = new boasdk.Transaction(
            [
                new boasdk.TxInput(new boasdk.Hash("0x2cf1caaeff65a7e2b2f7edff1023881564f2f0cad30161cf42279826e6919d77347df68de6d8eb0da58ebdc6e4f28da7569113002044467fc5cbf599a7ea9037")),
                new boasdk.TxInput(new boasdk.Hash("0x47a38b066ca55ef3e855b0c741ebd301b3fa38a86f9ed3507ab08794f24eddbd279eeb5bddde331cdaaf44401fcedb0f2f23d117607864c43bdb0cf587df13d7"))
            ],
            [
                new boasdk.TxOutput(boasdk.OutputType.Payment, "0", boasdk.Lock.Null)
            ],
            Buffer.alloc(0)
        );
        assert.strictEqual(boasdk.hashFull(tx1).toString(),
            "0x8ae9a3478433a8602e6f75aabbc2c7bcb3d17afb0ef7e5b5645cbadb68021d1" +
            "947d2a57020d45b79c8834e92eb04976b972ef542a589790fa593e33dc341f07b");


        let tx2 = new boasdk.Transaction(
            [
                new boasdk.TxInput(new boasdk.Hash("0x2cf1caaeff65a7e2b2f7edff1023881564f2f0cad30161cf42279826e6919d77347df68de6d8eb0da58ebdc6e4f28da7569113002044467fc5cbf599a7ea9037")),
                new boasdk.TxInput(new boasdk.Hash("0x47a38b066ca55ef3e855b0c741ebd301b3fa38a86f9ed3507ab08794f24eddbd279eeb5bddde331cdaaf44401fcedb0f2f23d117607864c43bdb0cf587df13d7"))
            ],
            [
                new boasdk.TxOutput(boasdk.OutputType.Payment, "0", boasdk.Lock.Null)
            ],
            Buffer.alloc(0)
        );
        assert.strictEqual(boasdk.hashFull(tx2).toString(),
            "0x8ae9a3478433a8602e6f75aabbc2c7bcb3d17afb0ef7e5b5645cbadb68021d1" +
            "947d2a57020d45b79c8834e92eb04976b972ef542a589790fa593e33dc341f07b");
    });

    it ('Test for hash value of transaction with multi outputs', () =>
    {
        let tx1 = new boasdk.Transaction(
            [
                boasdk.TxInput.fromTxHash(new boasdk.Hash(Buffer.alloc(boasdk.Hash.Width)), JSBI.BigInt(0))
            ],
            [
                new boasdk.TxOutput(boasdk.OutputType.Payment, "0", boasdk.Lock.fromPublicKey(new boasdk.PublicKey("boa1xrp66va5qe84kyfhywhxz9luy7glpxu99n30cuv3mu0vkhcswuzajgak3pw"))),
                new boasdk.TxOutput(boasdk.OutputType.Payment, "0", boasdk.Lock.fromPublicKey(new boasdk.PublicKey("boa1xrq66nug6wnen9sp5cm7xhfw03yea8e9x63ggay3v5dhe6d9jerqz50eld0")))
            ],
            Buffer.alloc(0)
        );
        assert.strictEqual(boasdk.hashFull(tx1).toString(),
            "0x559613a7a8d5e15275312256ba3205333e038a23f07c4c2bd0ef193c16cac11" +
            "4bd72f02183731c51132e9ee9471a1ae9495a84f86837d8917792fee9db713877");


        let tx2 = new boasdk.Transaction(
            [
                boasdk.TxInput.fromTxHash(new boasdk.Hash(Buffer.alloc(boasdk.Hash.Width)), JSBI.BigInt(0))
            ],
            [
                new boasdk.TxOutput(boasdk.OutputType.Payment, "0", boasdk.Lock.fromPublicKey(new boasdk.PublicKey("boa1xrq66nug6wnen9sp5cm7xhfw03yea8e9x63ggay3v5dhe6d9jerqz50eld0"))),
                new boasdk.TxOutput(boasdk.OutputType.Payment, "0", boasdk.Lock.fromPublicKey(new boasdk.PublicKey("boa1xrp66va5qe84kyfhywhxz9luy7glpxu99n30cuv3mu0vkhcswuzajgak3pw")))
            ],
            Buffer.alloc(0)
        );
        assert.strictEqual(boasdk.hashFull(tx2).toString(),
            "0x559613a7a8d5e15275312256ba3205333e038a23f07c4c2bd0ef193c16cac11" +
            "4bd72f02183731c51132e9ee9471a1ae9495a84f86837d8917792fee9db713877");
    });

    it ('Test for hash value of transaction with multi outputs same address', () =>
    {
        let tx1 = new boasdk.Transaction(
            [
                boasdk.TxInput.fromTxHash(new boasdk.Hash(Buffer.alloc(boasdk.Hash.Width)), JSBI.BigInt(0))
            ],
            [
                new boasdk.TxOutput(boasdk.OutputType.Payment, "200", boasdk.Lock.fromPublicKey(new boasdk.PublicKey("boa1xrp66va5qe84kyfhywhxz9luy7glpxu99n30cuv3mu0vkhcswuzajgak3pw"))),
                new boasdk.TxOutput(boasdk.OutputType.Payment, "100", boasdk.Lock.fromPublicKey(new boasdk.PublicKey("boa1xrp66va5qe84kyfhywhxz9luy7glpxu99n30cuv3mu0vkhcswuzajgak3pw")))
            ],
            Buffer.alloc(0)
        );
        assert.strictEqual(boasdk.hashFull(tx1).toString(),
            "0xf7930aeb05490a1a3cf42bb87f1ef22685dde78bb3554c4f46da2c69f47d584" +
            "cac620a3f4d482d605c7917918c18bf30b4b3a542efcaa16a22b5582022c6b2b7");

        let tx2 = new boasdk.Transaction(
            [
                boasdk.TxInput.fromTxHash(new boasdk.Hash(Buffer.alloc(boasdk.Hash.Width)), JSBI.BigInt(0))
            ],
            [
                new boasdk.TxOutput(boasdk.OutputType.Payment, "100", boasdk.Lock.fromPublicKey(new boasdk.PublicKey("boa1xrp66va5qe84kyfhywhxz9luy7glpxu99n30cuv3mu0vkhcswuzajgak3pw"))),
                new boasdk.TxOutput(boasdk.OutputType.Payment, "200", boasdk.Lock.fromPublicKey(new boasdk.PublicKey("boa1xrp66va5qe84kyfhywhxz9luy7glpxu99n30cuv3mu0vkhcswuzajgak3pw")))
            ],
            Buffer.alloc(0)
        );
        assert.strictEqual(boasdk.hashFull(tx2).toString(),
            "0xf7930aeb05490a1a3cf42bb87f1ef22685dde78bb3554c4f46da2c69f47d584" +
            "cac620a3f4d482d605c7917918c18bf30b4b3a542efcaa16a22b5582022c6b2b7");
    });

    // The test codes below compare with the values calculated in Agora.
    it ('Test for hash value of BlockHeader', () =>
    {
        let pubkey = new boasdk.PublicKey('boa1xrr66q4rthn4qvhhsl4y5hptqm366pgarqpk26wfzh6d38wg076tsqqesgg');

        let tx = new boasdk.Transaction(
            [ ],
            [ new boasdk.TxOutput(boasdk.OutputType.Payment, "100", pubkey) ],
            Buffer.alloc(0)
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
            "0x3bda4067eef71774dd27557fb838ae5dfcd2198530e60b9c95ebf41f18bc414" +
            "4040a5bd70cb83e63aefdf45222ec6f6006dfdf6387faf0df07d0da009d543e64");
    });

    // The test codes below compare with the values calculated in Agora.
    it ('Test for hash value of BlockHeader with missing validators', () =>
    {
        let pubkey = new boasdk.PublicKey('boa1xrr66q4rthn4qvhhsl4y5hptqm366pgarqpk26wfzh6d38wg076tsqqesgg');

        let tx = new boasdk.Transaction(
            [ ],
            [ new boasdk.TxOutput(boasdk.OutputType.Payment, "100", pubkey) ],
            Buffer.alloc(0)
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
            "0xeee57d6bc2833e87910e795a55adc544d883add68576d5144cc74f528eff6a8" +
            "0fe6759c1071a39f30fb0bf201e5312f6d1f3de29a4c69fa480ab4e6092957399");
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
