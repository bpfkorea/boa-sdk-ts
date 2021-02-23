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
import JSBI from 'jsbi';

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
            amount: JSBI.BigInt(1000000000)
        }
        utxo_data2 = {
            utxo: new boasdk.Hash('0x4dde806d2e09367f9d5bdaaf46deab01a336a64fdb088dbb94edb171560c63cf6a39377bf0c4d35118775681d989dee46531926299463256da303553f09be6ef'),
            amount: JSBI.BigInt(1000000000)
        }
        owner = boasdk.KeyPair.fromSeed(new boasdk.Seed("SBBUWIMSX5VL4KVFKY44GF6Q6R5LS2Z5B7CTAZBNCNPLS4UKFVDXC7TQ"))
    });

    it ('When trying to send the wrong amount', () =>
    {
        let destination = new boasdk.PublicKey("GDNODE7J5EUK7T6HLEO2FDUBWZEXVXHJO7C4AF5VZAKZENGQ4WR3IX2U");
        let builder = new boasdk.TxBuilder(owner);
        let amount = JSBI.BigInt(0);
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
                .addOutput(destination, JSBI.BigInt(20000000))
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
                        "bytes": "6T6TFGKbFrd5RIJkLNRSU+dWv90lAi82SDNWLb55xT/9r8HMmhn/pyk3kmxgM6NS3xOo3+G+ZeaI41MStFTWAQ=="
                    },
                    "unlock_age": 0
                },
                {
                    "utxo": "0x4dde806d2e09367f9d5bdaaf46deab01a336a64fdb088dbb94edb171560c63cf6a39377bf0c4d35118775681d989dee46531926299463256da303553f09be6ef",
                    "unlock": {
                        "bytes": "6T6TFGKbFrd5RIJkLNRSU+dWv90lAi82SDNWLb55xT/9r8HMmhn/pyk3kmxgM6NS3xOo3+G+ZeaI41MStFTWAQ=="
                    },
                    "unlock_age": 0
                }
            ],
            "outputs": [
                {
                    "value": "1980000000",
                    "lock": {
                        "type": 0,
                        "bytes": "x9iUwUUAUTrwBrnguo84lfyvTZHHT46ge180pVV6WNU="
                    }
                },
                {
                    "value": "20000000",
                    "lock": {
                        "type": 0,
                        "bytes": "2uGT6ekor8/HWR2ijoG2SXrc6XfFwBe1yBWSNNDlo7Q="
                    }
                }
            ],
            "payload": "",
            "lock_height": "0"
        };

        assert.deepStrictEqual(JSON.stringify(tx), JSON.stringify(obj));
    });

    it ('Test to create a transaction with data payload', () =>
    {
        let builder = new boasdk.TxBuilder(owner);
        let tx: boasdk.Transaction;
        let payload = new boasdk.DataPayload("0x617461642065746f76");
        let payload_fee = JSBI.BigInt(500000);
        let tx_fee = JSBI.BigInt(0);

        try {
            tx = builder
                .addInput(utxo_data1.utxo, utxo_data1.amount)
                .addInput(utxo_data2.utxo, utxo_data2.amount)
                .assignPayload(payload)
                .sign(boasdk.TxType.Payment, tx_fee, payload_fee);
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
                        "bytes": "Y1fK4ZgV0ujaiJesexIv1QdamFUe6oZFDzWnoF/gVGP8ovuLs6Sxsg/40bLXOJvk1zuReko0IYgYAdk8DK+pCA=="
                    },
                    "unlock_age": 0
                },
                {
                    "utxo": "0x4dde806d2e09367f9d5bdaaf46deab01a336a64fdb088dbb94edb171560c63cf6a39377bf0c4d35118775681d989dee46531926299463256da303553f09be6ef",
                    "unlock": {
                        "bytes": "Y1fK4ZgV0ujaiJesexIv1QdamFUe6oZFDzWnoF/gVGP8ovuLs6Sxsg/40bLXOJvk1zuReko0IYgYAdk8DK+pCA=="
                    },
                    "unlock_age": 0
                }
            ],
            "outputs": [
                {
                    "value": "1999500000",
                    "lock": {
                        "type": 0,
                        "bytes": "x9iUwUUAUTrwBrnguo84lfyvTZHHT46ge180pVV6WNU="
                    }
                }
            ],
            "payload": "0x617461642065746f76",
            "lock_height": "0"
        };

        assert.deepStrictEqual(JSON.stringify(tx), JSON.stringify(obj));
    });

    it ('Test to create a transaction with data payload - no output', () =>
    {
        let builder = new boasdk.TxBuilder(owner);
        let tx: boasdk.Transaction;
        let payload = new boasdk.DataPayload("0x617461642065746f76");
        let payload_fee = JSBI.BigInt(1000000000);
        let tx_fee = JSBI.BigInt(0);

        assert.throws(() => {
            tx = builder
                .addInput(utxo_data1.utxo, utxo_data1.amount)
                .assignPayload(payload)
                .sign(boasdk.TxType.Payment, tx_fee, payload_fee);
        }, new Error("No output for transaction."));
    });

    it ('Test to create a transaction with data payload - exist output', () =>
    {
        let builder = new boasdk.TxBuilder(owner);
        let tx: boasdk.Transaction;
        let payload = new boasdk.DataPayload("0x617461642065746f76");
        let payload_fee = JSBI.BigInt(1000000000);
        let tx_fee = JSBI.BigInt(0);

        assert.doesNotThrow(() => {
            tx = builder
                .addInput(utxo_data1.utxo, utxo_data1.amount)
                .addInput(utxo_data2.utxo, utxo_data2.amount)
                .assignPayload(payload)
                .sign(boasdk.TxType.Payment, tx_fee, payload_fee);
        }, new Error("No output for transaction."));
    });
});
