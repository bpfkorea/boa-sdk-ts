/*******************************************************************************

    Test for TxBuilder

    Copyright:
        Copyright (c) 2020 BOS Platform Foundation Korea
        All rights reserved.

    License:
        MIT License. See LICENSE for details.

*******************************************************************************/

import * as boasdk from '../lib';

import * as assert from 'assert';

describe ('TxBuilder', () =>
{
    let utxo_data1: any;
    let utxo_data2: any;
    let owner: boasdk.KeyPair;

    before('Wait for the package libsodium to finish loading', () =>
    {
        return boasdk.SodiumHelper.init();
    });

    before('Prepare variables', () =>
    {
        utxo_data1 = {
            utxo: new boasdk.Hash('0xd9482016835acc6defdfd060216a5890e00cf8f0a79ab0b83d3385fc723cd45bfea66eb3587a684518ff1756951d38bf4f07abda96dcdea1c160a4f83e377c32'),
            amount: BigInt(1000000000)
        }
        utxo_data2 = {
            utxo: new boasdk.Hash('0x4dde806d2e09367f9d5bdaaf46deab01a336a64fdb088dbb94edb171560c63cf6a39377bf0c4d35118775681d989dee46531926299463256da303553f09be6ef'),
            amount: BigInt(1000000000)
        }
        owner = boasdk.KeyPair.fromSeed(new boasdk.Seed("SBBUWIMSX5VL4KVFKY44GF6Q6R5LS2Z5B7CTAZBNCNPLS4UKFVDXC7TQ"))
    });

    it ('When trying to send the wrong amount', () =>
    {
        let destination = new boasdk.PublicKey("GDNODE7J5EUK7T6HLEO2FDUBWZEXVXHJO7C4AF5VZAKZENGQ4WR3IX2U");
        let builder = new boasdk.TxBuilder(owner);
        let amount = BigInt(0);
        builder.addInput(utxo_data1.utxo, utxo_data1.amount);
        assert.throws(() => {
            builder.addOutput(destination, amount);
        }, new Error(`Positive amount expected, not ${amount.toString()}`));
    });

    it ('When trying to send an amount greater than the amount of UTXO.', () =>
    {
        let destination = new boasdk.PublicKey("GDNODE7J5EUK7T6HLEO2FDUBWZEXVXHJO7C4AF5VZAKZENGQ4WR3IX2U");
        let builder = new boasdk.TxBuilder(owner);
        let amount = utxo_data1.amount + BigInt(1);
        builder.addInput(utxo_data1.utxo, utxo_data1.amount);
        assert.throws(() => {
            builder.addOutput(destination, amount);
        }, new Error(`Insufficient amount. ${amount.toString()}:${utxo_data1.amount.toString()}`));
    });

    it ('Test to create a transaction without data payload', () =>
    {
        let destination = new boasdk.PublicKey("GDNODE7J5EUK7T6HLEO2FDUBWZEXVXHJO7C4AF5VZAKZENGQ4WR3IX2U");
        let builder = new boasdk.TxBuilder(owner);
        let tx: boasdk.Transaction;
        try {
            tx = builder
                .addInput(utxo_data1.utxo, utxo_data1.amount)
                .addInput(utxo_data2.utxo, utxo_data2.amount)
                .addOutput(destination, BigInt(20000000))
                .sign(boasdk.TxType.Payment);
        }
        catch (error)
        {
            assert.fail(error)
        }

        let obj = {
            "type": 0,
            "inputs": [
                {
                    "utxo": "0xd9482016835acc6defdfd060216a5890e00cf8f0a79ab0b83d3385fc723cd45bfea66eb3587a684518ff1756951d38bf4f07abda96dcdea1c160a4f83e377c32",
                    "unlock": {
                        "bytes": [28,226,209,158,115,238,194,146,208,22,137,68,24,110,196,17,19,99,0,6,47,54,44,123,164,83,231,168,95,255,181,93,156,180,68,101,152,232,108,46,4,91,116,58,5,187,25,185,202,133,177,161,174,24,104,243,12,144,123,236,225,149,202,4]
                    },
                    "unlock_age": 0
                },
                {
                    "utxo": "0x4dde806d2e09367f9d5bdaaf46deab01a336a64fdb088dbb94edb171560c63cf6a39377bf0c4d35118775681d989dee46531926299463256da303553f09be6ef",
                    "unlock": {
                        "bytes": [16,188,236,169,48,87,189,138,98,229,38,220,168,77,118,118,82,52,107,231,247,107,42,98,129,35,188,81,214,153,185,249,254,161,61,37,104,57,207,153,51,206,134,67,189,47,244,208,190,64,216,91,211,0,85,124,57,151,82,52,72,254,149,11]
                    },
                    "unlock_age": 0
                }
            ],
            "outputs": [
                {
                    "value": "20000000",
                    "lock": {
                        "type": 0,
                        "bytes": [218,225,147,233,233,40,175,207,199,89,29,162,142,129,182,73,122,220,233,119,197,192,23,181,200,21,146,52,208,229,163,180]
                    }
                },
                {
                    "value": "1980000000",
                    "lock": {
                        "type": 0,
                        "bytes": [199,216,148,193,69,0,81,58,240,6,185,224,186,143,56,149,252,175,77,145,199,79,142,160,123,95,52,165,85,122,88,213]
                    }
                }
            ],
            "payload": "",
            "lock_height": "0"
        };

        obj.inputs[0].unlock = tx.inputs[0].unlock.toJSON();
        obj.inputs[1].unlock = tx.inputs[1].unlock.toJSON();

        let scalar: boasdk.Scalar = boasdk.KeyPair.secretKeyToCurveScalar(owner.secret)
        let pair: boasdk.Pair = new boasdk.Pair(scalar, scalar.toPoint());
        assert.ok(boasdk.Schnorr.verify(pair.V, new boasdk.Signature(tx.inputs[0].unlock.bytes), tx));
        assert.ok(boasdk.Schnorr.verify(pair.V, new boasdk.Signature(tx.inputs[1].unlock.bytes), tx));

        assert.deepStrictEqual(JSON.stringify(tx), JSON.stringify(obj));
    });

    it ('Test to create a transaction with data payload', () =>
    {
        let builder = new boasdk.TxBuilder(owner);
        let tx: boasdk.Transaction;
        let payload = new boasdk.DataPayload("0x617461642065746f76");
        let commons_budget_address = new boasdk.PublicKey("GCOMMONBGUXXP4RFCYGEF74JDJVPUW2GUENGTKKJECDNO6AGO32CUWGU");
        let fee = BigInt(500000);

        try {
            tx = builder
                .addInput(utxo_data1.utxo, utxo_data1.amount)
                .addInput(utxo_data2.utxo, utxo_data2.amount)
                .addOutput(commons_budget_address, fee)
                .assignPayload(payload)
                .sign(boasdk.TxType.Payment);
        }
        catch (error)
        {
            assert.fail(error)
        }

        let obj = {
            "type": 0,
            "inputs": [
                {
                    "utxo": "0xd9482016835acc6defdfd060216a5890e00cf8f0a79ab0b83d3385fc723cd45bfea66eb3587a684518ff1756951d38bf4f07abda96dcdea1c160a4f83e377c32",
                    "unlock": {
                        "bytes": [129,99,113,164,31,190,159,33,93,141,80,191,196,72,235,214,177,91,177,253,146,84,246,161,64,114,37,88,137,122,94,133,186,140,54,231,86,139,216,200,186,69,24,18,227,31,71,18,93,59,134,206,142,43,57,28,111,105,68,253,153,197,180,14]
                    },
                    "unlock_age": 0
                },
                {
                    "utxo": "0x4dde806d2e09367f9d5bdaaf46deab01a336a64fdb088dbb94edb171560c63cf6a39377bf0c4d35118775681d989dee46531926299463256da303553f09be6ef",
                    "unlock": {
                        "bytes": [55,252,206,174,218,108,2,175,108,165,82,151,231,39,22,249,29,42,193,197,125,188,129,234,177,5,200,36,40,231,118,221,247,103,31,154,254,157,10,205,249,223,255,139,217,183,21,106,99,198,159,196,26,158,54,232,198,215,208,115,94,1,127,3]
                    },
                    "unlock_age": 0
                }
            ],
            "outputs": [
                {
                    "value": "500000",
                    "lock": {
                        "type": 0,
                        "bytes": [156,198,57,161,53,47,119,242,37,22,12,66,255,137,26,106,250,91,70,161,26,105,169,73,32,134,215,120,6,118,244,42]
                    }
                },
                {
                    "value": "1999500000",
                    "lock": {
                        "type": 0,
                        "bytes": [199,216,148,193,69,0,81,58,240,6,185,224,186,143,56,149,252,175,77,145,199,79,142,160,123,95,52,165,85,122,88,213]
                    }
                }
            ],
            "payload": "0x617461642065746f76",
            "lock_height": "0"
        };

        obj.inputs[0].unlock = tx.inputs[0].unlock.toJSON();
        obj.inputs[1].unlock = tx.inputs[1].unlock.toJSON();

        let scalar: boasdk.Scalar = boasdk.KeyPair.secretKeyToCurveScalar(owner.secret)
        let pair: boasdk.Pair = new boasdk.Pair(scalar, scalar.toPoint());
        assert.ok(boasdk.Schnorr.verify(pair.V, new boasdk.Signature(tx.inputs[0].unlock.bytes), tx));
        assert.ok(boasdk.Schnorr.verify(pair.V, new boasdk.Signature(tx.inputs[1].unlock.bytes), tx));

        assert.deepStrictEqual(JSON.stringify(tx), JSON.stringify(obj));
    });
});
