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
        }, new Error(`[${destination.toString()}] Positive amount expected, not ${amount.toString()}`));
    });

    it ('When trying to send an amount greater than the amount of UTXO.', () =>
    {
        let destination = new boasdk.PublicKey("GDNODE7J5EUK7T6HLEO2FDUBWZEXVXHJO7C4AF5VZAKZENGQ4WR3IX2U");
        let builder = new boasdk.TxBuilder(owner);
        let amount = utxo_data1.amount + BigInt(1);
        builder.addInput(utxo_data1.utxo, utxo_data1.amount);
        assert.throws(() => {
            builder.addOutput(destination, amount);
        }, new Error(`[${destination.toString()}] Insufficient amount. ${amount.toString()}:${utxo_data1.amount.toString()}`));
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
            type: 0,
            inputs: [
                {
                    utxo: '0xd9482016835acc6defdfd060216a5890e00cf8f0a79ab0b83d3385fc723cd45bfea66eb3587a684518ff1756951d38bf4f07abda96dcdea1c160a4f83e377c32',
                    signature: '0x0c18f38ec29c793358de53f56d37ffb9b23e1d6db991d3520bbee6392a1d42176380e26d1721e11bbf99f57309e5d62061017084b74d2654c2e1190b6f455525'
                },
                {
                    utxo: '0x4dde806d2e09367f9d5bdaaf46deab01a336a64fdb088dbb94edb171560c63cf6a39377bf0c4d35118775681d989dee46531926299463256da303553f09be6ef',
                    signature: '0x0c18f38ec29c793358de53f56d37ffb9b23e1d6db991d3520bbee6392a1d42176380e26d1721e11bbf99f57309e5d62061017084b74d2654c2e1190b6f455525'
                }
            ],
            outputs: [
                {
                    value: '20000000',
                    address: 'GDNODE7J5EUK7T6HLEO2FDUBWZEXVXHJO7C4AF5VZAKZENGQ4WR3IX2U'
                },
                {
                    value: '1980000000',
                    address: 'GDD5RFGBIUAFCOXQA246BOUPHCK7ZL2NSHDU7DVAPNPTJJKVPJMNLQFW'
                }
            ],
            payload: ''
        };
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
            type: 0,
            inputs: [
                {
                    utxo: '0xd9482016835acc6defdfd060216a5890e00cf8f0a79ab0b83d3385fc723cd45bfea66eb3587a684518ff1756951d38bf4f07abda96dcdea1c160a4f83e377c32',
                    signature: '0x0ec831ebda9cbe7b56af44f95f5db2e79c1cbb69e9952c2e1b7f0ca7d19795c5e47e1dd727bfc8a48b7b49bb2c983f5476e7f035a995e258b4fe8b21237943ad'
                },
                {
                    utxo: '0x4dde806d2e09367f9d5bdaaf46deab01a336a64fdb088dbb94edb171560c63cf6a39377bf0c4d35118775681d989dee46531926299463256da303553f09be6ef',
                    signature: '0x0ec831ebda9cbe7b56af44f95f5db2e79c1cbb69e9952c2e1b7f0ca7d19795c5e47e1dd727bfc8a48b7b49bb2c983f5476e7f035a995e258b4fe8b21237943ad'
                }
            ],
            outputs: [
                {
                    value: '500000',
                    address: 'GCOMMONBGUXXP4RFCYGEF74JDJVPUW2GUENGTKKJECDNO6AGO32CUWGU'
                },
                {
                    value: '1999500000',
                    address: 'GDD5RFGBIUAFCOXQA246BOUPHCK7ZL2NSHDU7DVAPNPTJJKVPJMNLQFW'
                }
            ],
            payload: '0x617461642065746f76'
        };
        assert.deepStrictEqual(JSON.stringify(tx), JSON.stringify(obj));
    });
});
