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
                    "unlock": {"bytes": "/WhjZumwcrwVqdE7O2J/ZdPWPnGYi8LdUl3icEXy1BOLr0+9cqOZYBPg6y0mHYxBX2V66cyuFVmpoYLMmI5bBg=="},
                    "unlock_age": 0
                },
                {
                    "utxo": "0x4dde806d2e09367f9d5bdaaf46deab01a336a64fdb088dbb94edb171560c63cf6a39377bf0c4d35118775681d989dee46531926299463256da303553f09be6ef",
                    "unlock": {"bytes": "4lQ7yxBInkbYQEVEXTJznou1PokxYUSrxLDhCX5dsjZi0KKBc1W5q969f0X5q34hh4ORAsWYL/45zl9Qs8PfDw=="},
                    "unlock_age": 0
                }
            ],
            "outputs": [
                {
                    "value": "20000000",
                    "lock": {"type": 0, "bytes": "2uGT6ekor8/HWR2ijoG2SXrc6XfFwBe1yBWSNNDlo7Q="}
                },
                {
                    "value": "1980000000",
                    "lock": {"type": 0, "bytes": "x9iUwUUAUTrwBrnguo84lfyvTZHHT46ge180pVV6WNU="}
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
                    "unlock": {"bytes": "nMWM+Wgb0DLY+7fW1HDQks1LVFB3tZ53eZHCK2J78ssY0mxH8qexO8yPNYwcsL6CjFdxTyDozG0fD4ZvJfHoDg=="},
                    "unlock_age": 0
                },
                {
                    "utxo": "0x4dde806d2e09367f9d5bdaaf46deab01a336a64fdb088dbb94edb171560c63cf6a39377bf0c4d35118775681d989dee46531926299463256da303553f09be6ef",
                    "unlock": {"bytes": "i4Hl12LJ4Nq1V5Ez9WT1JW57YWF4x0QQQ+tOruljqZKwt6qa/a5SaE/c3Cg01K5f3knVD8qQLgusfYnAB7gADQ=="},
                    "unlock_age": 0
                }
            ],
            "outputs": [
                {
                    "value": "500000",
                    "lock": {"type": 0, "bytes": "nMY5oTUvd/IlFgxC/4kaavpbRqEaaalJIIbXeAZ29Co="}
                }, {
                    "value": "1999500000",
                    "lock": {"type": 0, "bytes": "x9iUwUUAUTrwBrnguo84lfyvTZHHT46ge180pVV6WNU="}
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
