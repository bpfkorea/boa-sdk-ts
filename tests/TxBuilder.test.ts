/*******************************************************************************

    Test for TxBuilder

    Copyright:
        Copyright (c) 2020-2021 BOSAGORA Foundation
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
        owner = boasdk.KeyPair.fromSeed(new boasdk.SecretKey("SD4IEXJ6GWZ226ALTDDM72SYMHBTTJ6CHDPUNNTVZK4XSDHAM4BAQIC4"))
    });

    it ('When trying to send the wrong amount', () =>
    {
        let destination = new boasdk.PublicKey("boa1xrdwryl0ajdd86c45w4zrjf8spmrt7u4l7s5jy64ac3dc78x2ucd7wkakac");
        let builder = new boasdk.TxBuilder(owner);
        let amount = JSBI.BigInt(0);
        builder.addInput(utxo_data1.utxo, utxo_data1.amount);
        assert.throws(() => {
            builder.addOutput(destination, amount);
        }, new Error(`Positive amount expected, not ${amount.toString()}`));
    });

    it ('When trying to send an amount greater than the amount of UTXO.', () =>
    {
        let destination = new boasdk.PublicKey("boa1xrdwryl0ajdd86c45w4zrjf8spmrt7u4l7s5jy64ac3dc78x2ucd7wkakac");
        let builder = new boasdk.TxBuilder(owner);
        let amount = utxo_data1.amount + BigInt(1);
        builder.addInput(utxo_data1.utxo, utxo_data1.amount);
        assert.throws(() => {
            builder.addOutput(destination, amount);
        }, new Error(`Insufficient amount. ${amount.toString()}:${utxo_data1.amount.toString()}`));
    });

    it ('Test to create a transaction without data payload', () =>
    {
        let destination = new boasdk.PublicKey("boa1xrdwryl0ajdd86c45w4zrjf8spmrt7u4l7s5jy64ac3dc78x2ucd7wkakac");
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

        let expected = {
            "type": 0,
            "inputs": [
                {
                    "utxo": "0xd9482016835acc6defdfd060216a5890e00cf8f0a79ab0b83d3385fc723cd45bfea66eb3587a684518ff1756951d38bf4f07abda96dcdea1c160a4f83e377c32",
                    "unlock": {
                        "bytes": "baLr3KhfUzr0WEYxYuQpthF8x+xIYihkWf+RnfXjldAGvnArN0hDVLcNZsHFCBaP2zKmRJm3sQUmKko7ZGlgDw=="
                    },
                    "unlock_age": 0
                },
                {
                    "utxo": "0x4dde806d2e09367f9d5bdaaf46deab01a336a64fdb088dbb94edb171560c63cf6a39377bf0c4d35118775681d989dee46531926299463256da303553f09be6ef",
                    "unlock": {
                        "bytes": "2zY7qq/EKWQpAePoOjT4eFd3soO71EAE9P/E6PaLfzN5e4ZcxR9zZvsqH76pFgENlwTozYVARS6HRzY/l+FnBA=="
                    },
                    "unlock_age": 0
                }
            ],
            "outputs": [
                {
                    "value": "1980000000",
                    "lock": {
                        "type": 0,
                        "bytes": "wa1PiNOnmZYBpjfjXS58SZ6fJTaihHSRZRt86aWWRgE="
                    }
                },
                {
                    "value": "20000000",
                    "lock": {
                        "type": 0,
                        "bytes": "2uGT7+ya0+sVo6ohySeAdjX7lf+hSRNV7iLceOZXMN8="
                    }
                }
            ],
            "payload": "",
            "lock_height": "0"
        };

        // Because randomly generated values are used when signing,
        // different signatures are created even when signed using the same secret key.
        // Therefore, omit the signature comparison.
        tx.inputs.forEach((value, idx) => {
            expected.inputs[idx].unlock = value.unlock.toJSON();
        });

        assert.deepStrictEqual(JSON.stringify(tx), JSON.stringify(expected));
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

        let expected = {
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
                        "bytes": "wa1PiNOnmZYBpjfjXS58SZ6fJTaihHSRZRt86aWWRgE="
                    }
                }
            ],
            "payload": "0x617461642065746f76",
            "lock_height": "0"
        };

        // Because randomly generated values are used when signing,
        // different signatures are created even when signed using the same secret key.
        // Therefore, omit the signature comparison.
        tx.inputs.forEach((value, idx) => {
            expected.inputs[idx].unlock = value.unlock.toJSON();
        });

        assert.deepStrictEqual(JSON.stringify(tx), JSON.stringify(expected));
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
